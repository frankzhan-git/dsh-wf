// 解析管线（S1 迁移自 build.js）：草图元素（带坐标） → 节点树 → 纯净 JSONL
// ① 按 y 分组行、行内按 x 排序 → ② 包含关系嵌套 → ③ 语义化（type/props/direction）
// → ④ 备注/箭头 → description（元素级 / 根容器画布级）→ ⑤ 剥离坐标输出标准七字段
//
// JSON 设计原则（一等公民）：
//  - name：仅输出用户显式设置的名称（用户标识，不自动生成 → 避免与 text 重复、节省 token）
//  - description：元素备注/要求说明（模型理解个性化要求）+ 根容器承载画布级要求（跳转/未挂接备注）
//  - props：仅承载结构性语义（text/placeholder/inputType/options/action/src...），不输出尺寸/坐标/样式
//
// props 序列化走注册表（jsonl/props.js + types.js 的 propsSchema，支持 per-type 覆盖，如 progress.value 为数字）

import { CANVAS_W, CANVAS_H } from './model.js'
import { contains, numOr, cut } from './geometry.js'
import { inferType, inferDirection, isLowConfidence } from './infer.js'
import { canBeParent } from './types.js'
import { serializeProps, serializeTree } from './jsonl/serializer.js'
import { validateTree } from './jsonl/validator.js'

const ROW_TOL = 12           // y 差在该值内视为同一行
const NAME_MAX = 12          // 用户 name 截断长度

const mergeDesc = (a, b) => {
  if (!b) return a
  if (!a) return b
  return String(a).trim() + '；' + String(b).trim()
}

// 行分组 + 行内排序：返回按「行（y）→ 列（x）」排序的参与布局的元素
function sortLayout(elements) {
  const items = elements.filter((e) => e.kind === 'rect' || e.kind === 'text')
  const sorted = items.slice().sort((a, b) => a.y - b.y || a.x - b.x)
  const rows = []
  for (const e of sorted) {
    const row = rows.find((r) => Math.abs(r.y - e.y) <= ROW_TOL)
    if (row) { row.items.push(e); row.items.sort((a, b) => a.x - b.x) }
    else rows.push({ y: e.y, items: [e] })
  }
  rows.sort((a, b) => a.y - b.y)
  return rows.flatMap((r) => r.items)
}

// 包含关系 → 父链（每个元素取「最小面积包含者」为直接父；父必须是容器）
function buildNesting(ordered) {
  const parentOf = new Map()
  for (const b of ordered) {
    let best = null
    let bestArea = Infinity
    for (const a of ordered) {
      if (!canBeParent(a)) continue // 非容器不可为父（规则 3）
      if (!contains(a, b)) continue
      const area = a.w * a.h
      if (area < bestArea) { best = a; bestArea = area }
    }
    if (best) parentOf.set(b.id, best.id)
  }
  const kidsOf = new Map(ordered.map((e) => [e.id, []]))
  const roots = []
  for (const e of ordered) {
    const p = parentOf.get(e.id)
    if (p !== undefined) kidsOf.get(p).push(e)
    else roots.push(e)
  }
  return { kidsOf, roots }
}

function nodeFromElement(el, kidEls, noteText) {
  // 显式类型优先（用户意图）；未显式指定时：含子元素 → container，否则自动推断
  const type = el.type ? el.type : (kidEls.length ? 'container' : (inferType(el) || 'container'))
  const node = { type }
  // name 仅输出用户显式设置（画布标签同源）；自动名称会与 text 重复且无用户意图，一律省略
  if (el.name && String(el.name).trim()) node.name = cut(String(el.name).trim(), NAME_MAX)
  const desc = noteText || el.note
  if (desc) node.description = String(desc).trim()
  const props = serializeProps(el, type)
  if (Object.keys(props).length) node.props = props
  if (type === 'container' || type === 'page') {
    // direction 显式设置优先（用户意图）；未设置时按子元素分布自动推断（auto）
    // 仅多个子元素时才有方向意义
    if (kidEls.length > 1) {
      if (el.direction === 'horizontal' || el.direction === 'vertical') {
        node.direction = el.direction
      } else {
        node.direction = inferDirection(kidEls)
      }
      if (el.wrap) node.wrap = true
    } else if (el.wrap) {
      node.wrap = true
    }
  }
  return node
}

// 完整管线入口：elements → { tree, jsonl, issues, canvasNote, empty }
// rootName：画布名称（用户输入，输出为合成根容器 name——符合原则⑥：用户设置才输出）
// canvasNote：画布级要求（未挂接备注 + 箭头跳转），合并进第一个根容器 description
export function buildResult(elements, rootName) {
  const issues = []
  const notes = elements.filter((e) => e.kind === 'note')
  const arrows = elements.filter((e) => e.kind === 'arrow')
  const ordered = sortLayout(elements)
  const { kidsOf, roots } = buildNesting(ordered)

  // 低置信度提示（空矩形兜底为容器）
  for (const e of elements) {
    if (isLowConfidence(e)) {
      issues.push({ level: 'warning', message: `「${String(e.text || e.id)}」为空矩形，已按容器处理，可选中后修改类型` })
    }
  }

  // 备注挂接（不修改输入元素）：note 中心落在某元素内 → 该元素 description；否则进画布说明
  const noteMap = new Map()
  const canvasNotes = []
  for (const n of notes) {
    const cx = n.x + n.w / 2
    const cy = n.y + n.h / 2
    const target = ordered.slice().reverse().find((e) => cx >= e.x && cx <= e.x + e.w && cy >= e.y && cy <= e.y + e.h)
    const text = String(n.text || '').replace(/^备注[:：]?\s*/, '').trim()
    if (target) {
      if (text) noteMap.set(target.id, noteMap.get(target.id) ? noteMap.get(target.id) + '；' + text : text)
    } else if (text) {
      canvasNotes.push(text)
    }
  }

  // 箭头：起点/终点落在元素内 → 「A → B」跳转说明（画布级意图）
  for (const a of arrows) {
    const from = ordered.slice().reverse().find((e) => e.x <= a.x && a.x <= e.x + e.w && e.y <= a.y && a.y <= e.y + e.h)
    const to = ordered.slice().reverse().find((e) => e.x <= a.x2 && a.x2 <= e.x + e.w && e.y <= a.y2 && a.y2 <= e.y + e.h)
    if (from && to && from.id !== to.id) {
      canvasNotes.push(`${cut(String(from.text || from.id), 8)} → ${cut(String(to.text || to.id), 8)} 跳转`)
    }
  }
  const canvasNote = canvasNotes.length ? canvasNotes.join('；') : ''

  // 组装树（递归）；direction 推断在原始元素层完成（kidEls 带坐标）
  // page 恒为根类型：任意层级的 page 都不进入父容器 children（提升为根输出）
  const buildNode = (el) => {
    const kidEls = (kidsOf.get(el.id) || []).filter((k) => k.type !== 'page')
    const node = nodeFromElement(el, kidEls, noteMap.get(el.id))
    node.children = kidEls.map(buildNode)
    return node
  }

  // 多页面模式：所有「页面」元素（任意层级）= 每个设计稿 = JSONL 的一行根；空页面（无内容）不输出
  const pageEls = ordered.filter((el) => el.type === 'page')
  let tree = null
  let jsonl = ''
  if (pageEls.length) {
    const pageTrees = pageEls.map(buildNode).filter((t) => t.children && t.children.length)
    if (pageTrees.length) tree = pageTrees.length === 1 ? pageTrees[0] : pageTrees
    // 散落顶层元素（不在任何页面内）：包合成根，附加一行（旧版单画布行为兼容）
    const stray = roots.filter((el) => el.type !== 'page')
    if (stray.length) {
      const kids = stray.map(buildNode)
      const strayRoot = { type: 'container', name: cut(rootName || '画布', NAME_MAX), children: kids }
      if (kids.length > 1) strayRoot.direction = inferDirection(stray)
      pageTrees.push(strayRoot)
    }
    if (pageTrees.length) jsonl = pageTrees.map((t) => JSON.stringify(serializeTree(t))).join('\n')
    tree = pageTrees.length === 1 ? pageTrees[0] : (pageTrees.length ? pageTrees : null)
  } else if (roots.length === 1 && roots[0].type === 'container') {
    tree = buildNode(roots[0])
  } else if (roots.length) {
    const kids = roots.map(buildNode)
    const treeRoot = {
      type: 'container',
      name: cut(rootName || '画布', NAME_MAX),
      children: kids,
    }
    if (kids.length > 1) treeRoot.direction = inferDirection(roots)
    tree = treeRoot
  }

  // 画布级要求合并进第一个根容器 description（布局意图进 JSON，而非仅提示词包）
  const firstRoot = Array.isArray(tree) ? tree[0] : tree
  if (firstRoot && canvasNote) {
    firstRoot.description = mergeDesc(firstRoot.description, canvasNote)
  }

  // 校验（含空画布；多页模式校验第一个根）
  const v = (firstRoot == null) ? [{ level: 'error', message: '画布为空：请先绘制界面草图' }] : validateTree(firstRoot)
  issues.push(...v)

  jsonl = jsonl || (tree ? JSON.stringify(serializeTree(tree)) : '')
  return { tree, jsonl, issues, canvasNote, empty: !jsonl }
}

// progress 的 value/max 为数字（per-type 覆盖已注册在 types.js 的 propsSchema）
export { CANVAS_W, CANVAS_H }
export { serializeTree as nodeToJson }
