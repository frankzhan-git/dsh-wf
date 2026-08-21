// 交互状态机（P3）：拖拽决策 / 位移计算 / 结算 —— 全部纯函数，零 React/DOM/存储
// 副作用（setElements/setDrag/setSnapLines/commitHistory/showToast/applySelection...）
// 统一由 hooks/useCanvasInteractions 按返回的「动作清单」执行
// 行为与原 SketchModal 内联实现逐字节一致（S2 迁移，行为不变）

import { CANVAS_W, CANVAS_H } from './model.js'
import { hitTest, createElement } from './model.js'
import { cloneElements, nextId } from './model.js'
import { contains } from './infer.js'
import { minSizeOf } from './types.js'

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 3
export const MAX_ELEMENTS = 300
export const PAGE_GAP = 16
// 粘贴偏移：新副本相对复制源的小幅横纵位移（避免与原控件重叠）
export const PASTE_OFFSET = 24

// ---------- 几何 ----------

// 多选集整体外框（包围盒）：用于外框渲染与等比缩放
export function groupBounds(els, ids) {
  const set = new Set(ids)
  const list = els.filter((e) => set.has(e.id))
  if (!list.length) return null
  const minX = Math.min(...list.map((e) => e.x))
  const minY = Math.min(...list.map((e) => e.y))
  const maxX = Math.max(...list.map((e) => e.x + e.w))
  const maxY = Math.max(...list.map((e) => e.y + e.h))
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

// 画布坐标换算（无限画布相机：viewBox = pan/zoom，meet 留边补偿）；rect 为 SVG 视口 DOM rect
export function toLocal(ev, rect, zoom, pan) {
  const vw = CANVAS_W / zoom
  const vh = CANVAS_H / zoom
  const scale = Math.min(rect.width / vw, rect.height / vh)
  const ox = (rect.width - vw * scale) / 2
  const oy = (rect.height - vh * scale) / 2
  return {
    x: pan.x + (ev.clientX - rect.left - ox) / scale,
    y: pan.y + (ev.clientY - rect.top - oy) / scale,
  }
}

// 中心锚点缩放（视口中心不变）
export function zoomAt(factor, zoom, pan) {
  const nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoom * factor).toFixed(3)))
  const cx = pan.x + CANVAS_W / zoom / 2
  const cy = pan.y + CANVAS_H / zoom / 2
  return { zoom: nz, pan: { x: cx - CANVAS_W / nz / 2, y: cy - CANVAS_H / nz / 2 } }
}

// ---------- pointer.down 决策 ----------
// ctx = { elements, mode, zoom, selectedIds, spaceDown, pan }
// 返回动作清单：
//  { kind: 'pan', drag } | { kind: 'select', ids } | { kind: 'toggle', ids }
//  | { kind: 'move'|'resize', drag } | { kind: 'marquee', drag } | { kind: 'groupResize', drag }
//  | { kind: 'create', element, drag } | { kind: 'limit' }（数量上限，由调用方 toast）
export function decidePointerDown(ctx, x, y, clientX, clientY) {
  // 空格按住 = 平移画布（屏幕像素直算，不经坐标换算）
  if (ctx.spaceDown) {
    return { kind: 'pan', drag: { mode: 'pan', sx: clientX, sy: clientY, px: ctx.pan.x, py: ctx.pan.y } }
  }
  const { elements, mode, zoom, selectedIds } = ctx
  // 命中已有控件：选中 + 移动 / 右下角改大小
  const hit = hitTest(elements, x, y)
  // 控件模式下「容器类」命中（页面/容器/未显式类型矩形）视为空白：可在其内部继续绘制控件
  const hitContainerLike = !!(hit && mode === 'draw'
    && (hit.type === 'page' || hit.type === 'container' || !hit.type))
  const hitNonContainerInDraw = !!(hit && mode === 'draw' && !hitContainerLike)
  if (hit && !hitContainerLike) {
    const onHandle = hit.kind !== 'arrow' && x > hit.x + hit.w - 14 / zoom && y > hit.y + hit.h - 14 / zoom
    if (mode === 'draw' && !onHandle) {
      if (hitNonContainerInDraw) {
        // 控件模式命中显式非容器：仅选中（不允许在其内绘制）
        return { kind: 'select', ids: [hit.id] }
      }
      // 控件模式命中容器：落入下方创建逻辑（视为空白）
    } else {
      // 选择模式 或 draw 模式手柄：选中 + 移动/改尺寸
      if (mode === 'select' && ctx.ctrl) {
        const has = selectedIds.indexOf(hit.id) !== -1
        const next = has ? selectedIds.filter((i) => i !== hit.id) : selectedIds.concat([hit.id])
        return { kind: 'toggle', ids: next }
      }
      // 选择模式多选：命中元素已在多选集中 → 保持多选批量拖动；否则单选
      const keepMulti = !!(mode === 'select' && selectedIds.length > 1 && selectedIds.indexOf(hit.id) !== -1)
      const selIds = keepMulti ? selectedIds : [hit.id]
      // 记录元素所属页面（快照），用于移动/改尺寸时限制在页面内
      // 排除自身：页面元素中心在自身内部，若包含自身会把页面锁死在自己的边界
      const page = elements.find((e) => e.type === 'page' && e.id !== hit.id
        && hit.x + hit.w / 2 >= e.x && hit.x + hit.w / 2 <= e.x + e.w
        && hit.y + hit.h / 2 >= e.y && hit.y + hit.h / 2 <= e.y + e.h)
      const pageSnap = page ? { x: page.x, y: page.y, w: page.w, h: page.h } : null
      const drag = {
        mode: onHandle ? 'resize' : 'move',
        id: hit.id, sx: x, sy: y,
        ox: hit.x, oy: hit.y,
        ow: hit.w, oh: hit.h,
        prev: null, // 由调用方填充（elements 深拷贝）
        page: pageSnap,
      }
      return { kind: drag.mode, drag, sel: keepMulti ? null : selIds }
    }
  }
  // 未命中（或控件模式命中容器/页面 = 空白）
  if (mode === 'select') {
    // 多选外框角手柄命中 → 等比批量缩放
    if (selectedIds.length > 1) {
      const gb = groupBounds(elements, selectedIds)
      const handle = 10 / zoom
      const corners = [
        { k: 'tl', x: gb.x, y: gb.y },
        { k: 'tr', x: gb.x + gb.w, y: gb.y },
        { k: 'bl', x: gb.x, y: gb.y + gb.h },
        { k: 'br', x: gb.x + gb.w, y: gb.y + gb.h },
      ]
      const hitCorner = corners.find((c) => x >= c.x - handle && x <= c.x + handle && y >= c.y - handle && y <= c.y + handle)
      if (hitCorner) {
        return { kind: 'groupResize', drag: { mode: 'groupResize', corner: hitCorner.k, sx: x, sy: y, gb } }
      }
    }
    // 空白处按下 → 开始框选（marquee），单击空白 = 取消多选
    return { kind: 'marquee', drag: { mode: 'marquee', sx: x, sy: y } }
  }
  // 控件模式创建
  // 防呆：元素数量上限（防止无限绘制/粘贴导致性能劣化）
  if (elements.length >= MAX_ELEMENTS) {
    return { kind: 'limit' }
  }
  // 规范：底层画布（页面外）绘制 → 页面；页面内任意地方绘制 → 容器
  const inPage = elements.some((e) => e.type === 'page' && x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h)
  const page = elements.find((e) => e.type === 'page'
    && x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h)
  const pageSnap = page ? { x: page.x, y: page.y, w: page.w, h: page.h } : null
  const tmp = createElement({ kind: 'rect', type: inPage ? 'container' : 'page' }, x, y, 0, 0)
  tmp.dragTmp = true
  return { kind: 'create', element: tmp, drag: { mode: 'create', tmpId: tmp.id, sx: x, sy: y, page: pageSnap } }
}

// ---------- pointer.move 计算 ----------
// 返回 { patches?, snaps?, nextDrag?, pan? }；pan 用屏幕坐标
export function updateDrag(ctx, drag, x, y, clientX, clientY) {
  if (drag.mode === 'pan') return { pan: computePan(drag, clientX, clientY, ctx.rect, ctx.zoom) }
  if (drag.mode === 'create') return { patch: computeCreate(ctx, drag, x, y) }
  if (drag.mode === 'move') return computeMove(ctx, drag, x, y)
  if (drag.mode === 'marquee') return { nextDrag: Object.assign({}, drag, { mq: computeMarquee(drag, x, y) }) }
  if (drag.mode === 'groupResize') return { patches: computeGroupResize(ctx, drag, x, y) }
  if (drag.mode === 'resize') {
    // resize 附带对齐吸附：patch 与吸附虚线分开返回（与 move 一致）
    const r = computeResize(ctx, drag, x, y)
    if (!r) return {}
    const { snaps, ...patch } = r
    return { patch, snaps }
  }
  return {}
}

// 平移：相机方案 pan 增加 = 视口右移 = 内容左移，方向取反（内容跟随鼠标）；按屏幕↔逻辑比例换算
export function computePan(drag, clientX, clientY, rect, zoom) {
  const scale = Math.min(rect.width / (CANVAS_W / zoom), rect.height / (CANVAS_H / zoom))
  return {
    x: drag.px - (clientX - drag.sx) / scale,
    y: drag.py - (clientY - drag.sy) / scale,
  }
}

// 创建：矩形归一 + 页面边界钳制（页面内绘制容器不允许超出页面）
export function computeCreate(ctx, drag, x, y) {
  const tmp = ctx.elements.find((e) => e.id === drag.tmpId)
  if (!tmp) return null
  if (tmp.kind === 'arrow') return { x2: x, y2: y }
  let nx = Math.min(x, drag.sx)
  let ny = Math.min(y, drag.sy)
  let nw = Math.max(4, Math.abs(x - drag.sx))
  let nh = Math.max(4, Math.abs(y - drag.sy))
  if (drag.page) {
    nw = Math.min(nw, drag.page.x + drag.page.w - nx)
    nh = Math.min(nh, drag.page.y + drag.page.h - ny)
  }
  return { x: nx, y: ny, w: Math.max(4, nw), h: Math.max(4, nh) }
}

// 移动：对齐吸附 + 页面钳制 + 页面间距钳制（page）+ 批量/后代跟随
export function computeMove(ctx, drag, x, y) {
  const { elements, zoom, selectedIds } = ctx
  const dx = x - drag.sx
  const dy = y - drag.sy
  const el = elements.find((e) => e.id === drag.id)
  if (!el) return {}
  let nx = drag.ox + dx
  let ny = drag.oy + dy
  // 对齐吸附：与其它控件（及所属页面边界）比较 6 种对齐（左边/右边/水平居中/上边/下边/垂直居中）
  const tol = 6 / zoom
  const snaps = []
  const targets = elements.filter((t) => t.id !== el.id && t.kind !== 'arrow')
  if (drag.page) targets.push(drag.page)
  let bx = null
  let by = null
  for (const t of targets) {
    const xs = [
      { d: Math.abs(nx - t.x), pos: t.x, line: t.x },
      { d: Math.abs(nx + el.w - (t.x + t.w)), pos: t.x + t.w - el.w, line: t.x + t.w },
      { d: Math.abs(nx + el.w / 2 - (t.x + t.w / 2)), pos: t.x + t.w / 2 - el.w / 2, line: t.x + t.w / 2 },
    ]
    const ys = [
      { d: Math.abs(ny - t.y), pos: t.y, line: t.y },
      { d: Math.abs(ny + el.h - (t.y + t.h)), pos: t.y + t.h - el.h, line: t.y + t.h },
      { d: Math.abs(ny + el.h / 2 - (t.y + t.h / 2)), pos: t.y + t.h / 2 - el.h / 2, line: t.y + t.h / 2 },
    ]
    for (const c of xs) if (c.d < tol && (!bx || c.d < bx.d)) bx = c
    for (const c of ys) if (c.d < tol && (!by || c.d < by.d)) by = c
  }
  if (bx) { nx = bx.pos; snaps.push({ axis: 'v', pos: bx.line }) }
  if (by) { ny = by.pos; snaps.push({ axis: 'h', pos: by.line }) }
  // 页面边界限制：不允许拖出页面，贴边即可（在吸附之后执行，保证贴边优先）
  if (drag.page) {
    nx = Math.max(drag.page.x, Math.min(drag.page.x + drag.page.w - el.w, nx))
    ny = Math.max(drag.page.y, Math.min(drag.page.y + drag.page.h - el.h, ny))
  }
  const deltaX = nx - drag.ox
  const deltaY = ny - drag.oy
  // 跟随模型（用户规范，2025 修订）：
  //  - 拖动任意控件（含容器）：只移动该控件本身——内部控件不跟随（画布是自由布局，控件不被容器约束）
  //  - 拖动页面：页面内所有控件（中心在页面内，含部分超出边界的控件）跟随，保持相对位置不变
  const movingIds = new Set()
  if (selectedIds.length > 1 && selectedIds.indexOf(el.id) !== -1) {
    selectedIds.forEach((id) => movingIds.add(id)) // 多选显式集合保持整体移动
  }
  movingIds.add(el.id)
  if (el.type === 'page') {
    // 中心判定（非完全包含）：修复「页面内控件稍微超出边界 → 拖动页面时飞出去」
    for (const t of elements) {
      if (t.id === el.id || t.kind === 'arrow') continue
      const cx = t.x + t.w / 2
      const cy = t.y + t.h / 2
      if (cx >= el.x && cx <= el.x + el.w && cy >= el.y && cy <= el.y + el.h) movingIds.add(t.id)
    }
  }
  // 页面间距（页面之间保持的最小空隙，防重叠）
  let pageNx = el.type === 'page' ? nx : null
  let pageNy = el.type === 'page' ? ny : null
  if (pageNx !== null) {
    // 页面拖动：不与其它页面重叠且保持间距（逐轴就近钳制）
    for (const p of elements) {
      if (p.id === el.id || p.type !== 'page') continue
      const overlapX = pageNx < p.x + p.w + PAGE_GAP && pageNx + el.w > p.x - PAGE_GAP
      const overlapY = pageNy < p.y + p.h + PAGE_GAP && pageNy + el.h > p.y - PAGE_GAP
      if (!overlapX || !overlapY) continue
      const dLeft = Math.abs((p.x - PAGE_GAP - el.w) - pageNx)
      const dRight = Math.abs((p.x + p.w + PAGE_GAP) - pageNx)
      const dTop = Math.abs((p.y - PAGE_GAP - el.h) - pageNy)
      const dBottom = Math.abs((p.y + p.h + PAGE_GAP) - pageNy)
      const min = Math.min(dLeft, dRight, dTop, dBottom)
      if (min === dLeft) pageNx = p.x - PAGE_GAP - el.w
      else if (min === dRight) pageNx = p.x + p.w + PAGE_GAP
      else if (min === dTop) pageNy = p.y - PAGE_GAP - el.h
      else pageNy = p.y + p.h + PAGE_GAP
    }
    nx = pageNx
    ny = pageNy
  }
  const patches = []
  // 位移增量（多帧拖动修复）：deltaX 是相对拖动起点的累计位移，而 elements 中
  // 跟随元素的位置已是上一帧结算后的值——若直接 e.x + deltaX 会每帧重复累加，
  // 导致跟随元素（页面内部控件/多选元素）比主元素快一倍、飞出去。
  // 正确做法：每帧只加「本帧增量」deltaX - lastDx（drag 记录上一帧累计位移）。
  const incX = deltaX - (drag.lastDx || 0)
  const incY = deltaY - (drag.lastDy || 0)
  for (const e of elements) {
    if (!movingIds.has(e.id)) continue
    if (e.id === el.id) { patches.push({ id: e.id, x: nx, y: ny }); continue }
    // 跟随元素：本帧增量位移 + 各自页面内贴边
    let ex = e.x + incX
    let ey = e.y + incY
    // 所属页面判定用拖动前位置（避免与移动中的页面误判）
    const pg = elements.find((p) => p.type === 'page' && p.id !== e.id
      && e.x + e.w / 2 >= p.x && e.x + e.w / 2 <= p.x + p.w && e.y + e.h / 2 >= p.y && e.y + e.h / 2 <= p.y + p.h)
    if (pg) {
      if (pg.id === el.id) {
        // 主元素就是所属页面（页面拖动跟随）：保持相对位置不变，不做钳制
        // （修复：部分超出页面边界的控件若被钳制回页面内，会破坏相对位置）
        ex = e.x + incX
        ey = e.y + incY
      } else {
        // 多选场景：其它选中元素按各自所属页面钳制（页面若随动则用其新位置作为钳制基准）
        const pgDx = movingIds.has(pg.id) ? deltaX : 0
        const pgDy = movingIds.has(pg.id) ? deltaY : 0
        ex = Math.max(pg.x + pgDx, Math.min(pg.x + pgDx + pg.w - e.w, ex))
        ey = Math.max(pg.y + pgDy, Math.min(pg.y + pgDy + pg.h - e.h, ey))
      }
    }
    patches.push({ id: e.id, x: ex, y: ey })
  }
  return { patches, snaps, lastDx: deltaX, lastDy: deltaY }
}

// 框选：实时更新选框矩形
export function computeMarquee(drag, x, y) {
  return { x: Math.min(x, drag.sx), y: Math.min(y, drag.sy), w: Math.abs(x - drag.sx), h: Math.abs(y - drag.sy) }
}

// 多选外框等比缩放：锚定对角，scale 统一（保持外框宽高比）；各元素按自身类型最小尺寸钳制
export function computeGroupResize(ctx, drag, x, y) {
  const gb = drag.gb
  let nw = gb.w
  let nh = gb.h
  if (drag.corner === 'tl') { nw = gb.w + (gb.x - x); nh = gb.h + (gb.y - y) }
  else if (drag.corner === 'tr') { nw = x - gb.x; nh = gb.h + (gb.y - y) }
  else if (drag.corner === 'bl') { nw = gb.w + (gb.x - x); nh = y - gb.y }
  else { nw = x - gb.x; nh = y - gb.y }
  const scale = Math.max(0.1, Math.min(10, nw / gb.w))
  const idSet = new Set(ctx.selectedIds)
  const patches = []
  for (const e of ctx.elements) {
    if (!idSet.has(e.id)) continue
    const min = minSizeOf(ctx.elements, e)
    patches.push({
      id: e.id,
      x: gb.x + (e.x - gb.x) * scale,
      y: gb.y + (e.y - gb.y) * scale,
      w: Math.max(min.w, e.w * scale),
      h: Math.max(min.h, e.h * scale),
    })
  }
  return patches
}

// 改尺寸（右下角手柄）：按类型最小尺寸 + 下边/右边对齐吸附（阈值与移动一致 6/zoom）+ 页面边界钳制
// 吸附目标：其它控件边缘 + 所属页面边界；仅吸附正在移动的右/下边缘（左/上为锚点不动）
export function computeResize(ctx, drag, x, y) {
  const el = ctx.elements.find((e) => e.id === drag.id)
  if (!el) return null
  const { zoom, elements } = ctx
  const min = minSizeOf(elements, el)
  let w = Math.max(min.w, drag.ow + x - drag.sx)
  let h = Math.max(min.h, drag.oh + y - drag.sy)
  const tol = 6 / zoom
  const snaps = []
  const targets = elements.filter((t) => t.id !== el.id && t.kind !== 'arrow')
  if (drag.page) targets.push(drag.page)
  // 右边（右边缘 = el.x + w）→ 吸附到目标左/右边缘
  const rightX = el.x + w
  let bw = null
  for (const t of targets) {
    for (const [d, pos] of [[Math.abs(rightX - t.x), t.x], [Math.abs(rightX - (t.x + t.w)), t.x + t.w]]) {
      if (d < tol && (!bw || d < bw.d)) bw = { d, pos }
    }
  }
  if (bw) { w = Math.max(min.w, bw.pos - el.x); snaps.push({ axis: 'v', pos: bw.pos }) }
  // 下边（下边缘 = el.y + h）→ 吸附到目标上/下边缘
  const bottomY = el.y + h
  let bh = null
  for (const t of targets) {
    for (const [d, pos] of [[Math.abs(bottomY - t.y), t.y], [Math.abs(bottomY - (t.y + t.h)), t.y + t.h]]) {
      if (d < tol && (!bh || d < bh.d)) bh = { d, pos }
    }
  }
  if (bh) { h = Math.max(min.h, bh.pos - el.y); snaps.push({ axis: 'h', pos: bh.pos }) }
  // 页面边界钳制（吸附之后执行，与移动一致：贴边优先）
  if (drag.page) {
    w = Math.min(w, drag.page.x + drag.page.w - el.x)
    h = Math.min(h, drag.page.y + drag.page.h - el.y)
  }
  return { w, h, snaps }
}

// ---------- pointer.up / leave 结算 ----------
// 返回 { patches?, remove?, selection?, commit }（commit 恒为 true 时调用方记录历史）
export function settleDrag(ctx, drag) {
  if (drag.mode === 'create') {
    const tmp = ctx.elements.find((e) => e.id === drag.tmpId)
    if (!tmp) return { commit: true }
    const strip = (c) => { const o = Object.assign({}, c); delete o.dragTmp; return o }
    if (tmp.kind === 'arrow') {
      const tiny = Math.abs(tmp.x2 - tmp.x) < 4 && Math.abs(tmp.y2 - tmp.y) < 4
      return tiny ? { remove: [drag.tmpId], commit: true } : { patch: strip(tmp), commit: true }
    }
    if (tmp.kind === 'text') {
      const tiny = tmp.w < 8 || tmp.h < 8
      return tiny ? { patch: strip(Object.assign({}, tmp, { w: 120, h: 24 })), commit: true } : { patch: strip(tmp), commit: true }
    }
    const tiny = tmp.w < 8 || tmp.h < 8
    return tiny ? { remove: [drag.tmpId], commit: true } : { patch: strip(tmp), commit: true }
  }
  if (drag.mode === 'marquee') {
    // 框选结算：完全包含在框选区域内的元素进入多选集（规范：必须完全包含）
    const m = drag.mq
    let selection = null
    if (m && m.w > 4 && m.h > 4) {
      const picked = ctx.elements.filter((e) =>
        e.kind !== 'arrow' && e.x >= m.x && e.y >= m.y && e.x + e.w <= m.x + m.w && e.y + e.h <= m.y + m.h)
      selection = picked.map((e) => e.id)
    }
    return { selection, commit: true }
  }
  if (drag.mode === 'groupResize' || drag.mode === 'move' || drag.mode === 'resize') {
    return { commit: true }
  }
  return {}
}

// ---------- 复制 / 粘贴（剪贴板，纯函数） ----------
// 复制集合 = 选中元素 + 其内部所有子元素（容器/页面连带复制，语义嵌套规则与 JSONL 树一致）；
// 去重（选中父元素时其子元素只出现一次），保持画布数组顺序（z 序不变），返回深拷贝副本
export function collectCopySet(elements, ids) {
  const selEls = []
  for (const id of ids) {
    const e = elements.find((x) => x.id === id)
    if (e) selEls.push(e)
  }
  const picked = new Map() // id → 元素（保序去重）
  for (const e of elements) {
    const inSet = selEls.some((p) => p.id === e.id || contains(p, e))
    if (inSet) picked.set(e.id, e)
  }
  return cloneElements([...picked.values()])
}

// 粘贴副本：深拷贝 + 重新分配 id + 整体偏移 (dx, dy)。
// 集合内所有元素使用同一位移 → 子元素与容器/页面的相对位置与复制源完全一致；
// 所有字段（类型/样式/设置/文本/备注）经 JSON 深拷贝逐项保留
export function buildPaste(copySet, dx, dy) {
  return copySet.map((e) => {
    const c = cloneElements([e])[0]
    c.id = nextId()
    c.x += dx
    c.y += dy
    return c
  })
}
