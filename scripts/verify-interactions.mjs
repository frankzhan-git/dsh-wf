// 验证脚本：交互状态机（P3）——决策/计算/结算事件序列
// 用法：node scripts/verify-interactions.mjs
import { createElement, cloneElements } from '../src/core/model.js'
import {
  decidePointerDown, updateDrag, settleDrag, groupBounds, zoomAt,
  computeMove, computeGroupResize, computeGroupEdgeResize, computeCreate, computeResize, computeMarquee,
  collectCopySet, buildPaste, PASTE_OFFSET,
} from '../src/core/interactions.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

const mk = (x, y, w, h, type) => {
  const e = createElement({ kind: 'rect', type: type || null }, x, y, w, h)
  return e
}

// ---------- pointer.down 决策 ----------
section('pointer.down 决策')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '登录页'
  els.push(page)
  const btn = mk(60, 60, 200, 40, 'button')
  btn.text = '登录'
  els.push(btn)
  const cont = mk(60, 120, 300, 200, 'container')
  els.push(cont)

  // 选择模式命中按钮 → move（单选）
  const d1 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 100, 70, 100, 70)
  ok(d1.kind === 'move' && d1.drag.mode === 'move' && d1.drag.id === btn.id, '选择模式命中 → move 拖拽')
  ok(d1.sel && d1.sel[0] === btn.id, '命中元素单选')

  // 选择模式空白（页面外）→ marquee；注意：选择模式点击页面本身 = 选中页面（原行为）
  const d2 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 900, 600, 900, 600)
  ok(d2.kind === 'marquee', '空白（页面外）→ marquee')
  // 选择模式点击页面 → 选中页面（页面可拖动）
  const d2b = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 400, 400, 400, 400)
  ok(d2b.kind === 'move' && d2b.drag.id === page.id, '选择模式点击页面 → 选中页面可移动')

  // Ctrl+点击 → toggle
  const d3 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [btn.id], spaceDown: false, pan: { x: 0, y: 0 }, ctrl: true }, 100, 70, 100, 70)
  ok(d3.kind === 'toggle' && d3.ids.length === 0, 'Ctrl+点击已选元素 → 取消选中')

  // draw 模式命中显式非容器 → 仅选中
  const d4 = decidePointerDown({ elements: els, mode: 'draw', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 100, 70, 100, 70)
  ok(d4.kind === 'select' && d4.ids[0] === btn.id, 'draw 命中非容器 → 仅选中')

  // draw 模式命中容器 → 创建（容器内 → container 类型）
  const d5 = decidePointerDown({ elements: els, mode: 'draw', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 100, 140, 100, 140)
  ok(d5.kind === 'create' && d5.element.type === 'container', 'draw 命中容器 → 创建 container')

  // draw 模式空白（页面外）→ 创建 page
  const d6 = decidePointerDown({ elements: els, mode: 'draw', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 900, 500, 900, 500)
  ok(d6.kind === 'create' && d6.element.type === 'page', 'draw 页面外空白 → 创建 page')

  // 空格按住 → pan（用屏幕坐标）
  const d7 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: true, pan: { x: 10, y: 20 } }, 100, 100, 300, 200)
  ok(d7.kind === 'pan' && d7.drag.px === 10 && d7.drag.sy === 200, '空格 → pan（记录视口与屏幕起点）')

  // 多选外框边带命中（四角已移除：角按 r > b > l > t 归边）→ groupEdgeResize
  // A(100,200,100,60) B(200,100,100,60) → 外框 tl=(100,100)
  const els2 = [mk(100, 200, 100, 60), mk(200, 100, 100, 60)]
  const ids2 = els2.map((e) => e.id)
  const gb = groupBounds(els2, ids2)
  const d8 = decidePointerDown({ elements: els2, mode: 'select', zoom: 1, selectedIds: ids2, spaceDown: false, pan: { x: 0, y: 0 } }, gb.x, gb.y, gb.x, gb.y)
  ok(d8.kind === 'groupEdgeResize' && d8.drag.side === 'l', '外框角（空白角）→ groupEdgeResize（角归边，无四角等比）')
  const d8b = decidePointerDown({ elements: els2, mode: 'select', zoom: 1, selectedIds: ids2, spaceDown: false, pan: { x: 0, y: 0 } }, gb.x + gb.w, gb.y + gb.h, gb.x + gb.w, gb.y + gb.h)
  ok(d8b.kind === 'groupEdgeResize' && d8b.drag.side === 'r', '外框右下角 → groupEdgeResize（r 优先于 b）')
}

// ---------- 吸附 / 钳制 / 跟随 ----------
section('computeMove：吸附/钳制/跟随')
{
  // 对齐吸附：el 拖到与目标左边缘差 3px（容差 6/zoom 内）→ 吸附到目标 x
  const els = []
  const el = mk(100, 100, 80, 40)
  els.push(el)
  const target = mk(300, 300, 60, 30)
  els.push(target)
  const drag = { mode: 'move', id: el.id, sx: 120, sy: 120, ox: 100, oy: 100, prev: [], page: null }
  const r = computeMove({ elements: els, zoom: 1, selectedIds: [el.id] }, drag, 120 + 197, 120 + 90)
  ok(r.patches.length === 1, '单元素移动 1 个 patch')
  ok(r.patches[0].x === 300, '水平吸附到目标左边缘（300）')
  ok(r.snaps.some((s) => s.axis === 'v'), '产生垂直吸附线')

  // 页面钳制：page 内元素拖出页面 → 贴边
  const els3 = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  els3.push(page)
  const inner = mk(100, 100, 80, 40)
  els3.push(inner)
  const drag3 = { mode: 'move', id: inner.id, sx: 120, sy: 120, ox: 100, oy: 100, prev: [], page: { x: 20, y: 20, w: 760, h: 480 } }
  const r3 = computeMove({ elements: els3, zoom: 1, selectedIds: [inner.id] }, drag3, 120 + 800, 120 + 0)
  ok(r3.patches[0].x === 20 + 760 - 80, '页面钳制：不超出页面右边界（贴边）')

  // 页面间距钳制：两个 page 靠近 → 就近钳制到 16px 间距
  const els4 = []
  const p1 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 300, 400)
  els4.push(p1)
  const p2 = createElement({ kind: 'rect', type: 'page' }, 400, 20, 300, 400)
  els4.push(p2)
  const drag4 = { mode: 'move', id: p2.id, sx: 450, sy: 100, ox: 400, oy: 20, prev: [], page: null }
  const r4 = computeMove({ elements: els4, zoom: 1, selectedIds: [p2.id] }, drag4, 450 - 130, 100)
  ok(r4.patches[0].x === 20 + 300 + 16, '页面间距钳制：保持 16px 空隙（就近）')

  // 跟随模型（2025 用户规范修订）：容器拖动不再携带后代——只移动容器本身
  const els5 = []
  const box = mk(100, 100, 300, 200, 'container')
  els5.push(box)
  const kid = mk(130, 130, 100, 30)
  els5.push(kid)
  const drag5 = { mode: 'move', id: box.id, sx: 200, sy: 200, ox: 100, oy: 100, prev: [], page: null }
  const r5 = computeMove({ elements: els5, zoom: 1, selectedIds: [box.id] }, drag5, 250, 250)
  const boxPatch = r5.patches.find((p) => p.id === box.id)
  const kidPatch = r5.patches.find((p) => p.id === kid.id)
  ok(boxPatch.x === 150 && boxPatch.y === 150, '容器移动到新位置')
  ok(kidPatch === undefined, '容器拖动：内部控件不跟随（只移动容器本身）')

  // 页面拖动：页面内所有控件跟随（中心判定，含部分超出边界的控件）
  const els6 = []
  const page6 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  els6.push(page6)
  const inner6 = mk(100, 100, 80, 40)
  els6.push(inner6)
  // 部分超出页面右边界（中心仍在页面内）→ 必须跟随（bug 修复：不完全包含也跟随）
  const over = mk(700, 300, 120, 40)
  els6.push(over)
  const drag6 = { mode: 'move', id: page6.id, sx: 200, sy: 200, ox: 20, oy: 20, prev: [], page: null }
  const r6 = computeMove({ elements: els6, zoom: 1, selectedIds: [page6.id] }, drag6, 300, 220)
  const pagePatch = r6.patches.find((p) => p.id === page6.id)
  const innerPatch = r6.patches.find((p) => p.id === inner6.id)
  const overPatch = r6.patches.find((p) => p.id === over.id)
  ok(pagePatch.x === 120 && pagePatch.y === 40, '页面移动到新位置')
  ok(innerPatch && innerPatch.x === 200 && innerPatch.y === 120, '页面内控件跟随（保持相对位置）')
  ok(overPatch && overPatch.x === 800, '部分超出边界的控件也跟随（中心判定，不飞出去）')

  // 多帧拖动（回归：增量跟随，禁止累积位移）：
  // 第 1 帧：page 移到 (120,40)，控件跟随（+100）
  // 第 2 帧：page 移到 (220,80)（再 +100），控件应只 +100（共 +200），
  //         若按累计 deltaX 直接加，控件会再 +200（共 +300）→ 比页面快、飞出去
  const els6b = els6.map((e) => {
    const p = r6.patches.find((x) => x.id === e.id)
    return p ? Object.assign({}, e, p) : e
  })
  const drag6b = Object.assign({}, drag6, { lastDx: 100, lastDy: 20 })
  const r6b = computeMove({ elements: els6b, zoom: 1, selectedIds: [page6.id] }, drag6b, 400, 280)
  const inner6b = r6b.patches.find((p) => p.id === inner6.id)
  const over6b = r6b.patches.find((p) => p.id === over.id)
  ok(inner6b && inner6b.x === 300 && inner6b.y === 180, '多帧拖动：控件按本帧增量移动（+100,+60，不重复累加）')
  ok(over6b && over6b.x === 900, '多帧拖动：超出控件同步（900 = 700 + 100 + 100）')
}

// ---------- 创建 / 框选 / 组缩放 / 缩放 ----------
section('compute 与 settle')
{
  // 创建：矩形归一 + 页面钳制
  const els = [mk(0, 0, 0, 0, 'container')]
  const drag = { mode: 'create', tmpId: els[0].id, sx: 100, sy: 100, page: { x: 20, y: 20, w: 760, h: 480 } }
  const c = computeCreate({ elements: els }, drag, 50, 60)
  ok(c.x === 50 && c.y === 60 && c.w === 50 && c.h === 40, '创建矩形归一（左上拖拽）')
  const c2 = computeCreate({ elements: els }, drag, 900, 900)
  ok(c2.x === 100 && c2.y === 100 && c2.w === 20 + 760 - 100 && c2.h === 20 + 480 - 100, '创建页面钳制：不超出页面右/下边界')

  // resize：按类型最小尺寸（注册表驱动，不再统一 8px）
  const el = mk(100, 100, 100, 50)
  const rDrag = { mode: 'resize', id: el.id, sx: 200, sy: 150, ow: 100, oh: 50, page: null }
  const r = computeResize({ elements: [el] }, rDrag, 150, 140)
  ok(r.w === 50 && r.h === 40, 'resize 计算新尺寸')
  const r2 = computeResize({ elements: [el] }, rDrag, 100, 100)
  ok(r2.w === 24 && r2.h === 16, 'resize 最小尺寸按类型（未显式类型 → 容器 24×16）')

  // 各类型最小尺寸
  const minOf = (type, x, y, w, h) => {
    const e = mk(x, y, w, h, type)
    return computeResize({ elements: [e] }, { mode: 'resize', id: e.id, sx: x + w, sy: y + h, ow: w, oh: h, page: null }, x, y)
  }
  const btn = minOf('button', 100, 100, 100, 50)
  ok(btn.w === 40 && btn.h === 20, '按钮最小 40×20')
  const ic = minOf('icon', 100, 100, 20, 20)
  ok(ic.w === 16 && ic.h === 16, '图标最小 16×16')
  const pg = minOf('page', 100, 100, 100, 50)
  ok(pg.w === 32 && pg.h === 24, '页面最小 32×24')
  const sw = minOf('switch', 100, 100, 100, 30)
  ok(sw.w === 40 && sw.h === 20, '开关最小 40×20')
  const div = minOf('divider', 100, 100, 100, 10)
  ok(div.w === 16 && div.h === 8, '分割线最小 16×8')

  // 组缩放：小元素按类型最小尺寸钳制（不再缩到 4px 不可选）
  const els5 = [mk(100, 100, 10, 10, 'icon'), mk(200, 100, 100, 60, 'button')]
  const ids5 = els5.map((e) => e.id)
  const gb5 = groupBounds(els5, ids5)
  const g5 = computeGroupResize({ elements: els5, selectedIds: ids5 }, { mode: 'groupResize', corner: 'tl', sx: gb5.x, sy: gb5.y, gb: gb5 }, gb5.x + 200, gb5.y + 120)
  const iconPatch = g5.find((p) => p.id === els5[0].id)
  const btnPatch = g5.find((p) => p.id === els5[1].id)
  ok(iconPatch.w === 16 && iconPatch.h === 16, '组缩放按类型最小尺寸钳制（icon 16×16）')
  ok(btnPatch.w === 40 && btnPatch.h === 20, '组缩放按类型最小尺寸钳制（button 40×20）')

  // marquee
  const m = computeMarquee({ sx: 100, sy: 100 }, 300, 250)
  ok(m.x === 100 && m.y === 100 && m.w === 200 && m.h === 150, 'marquee 矩形归一')

  // settle：create 过小删除 / text 默认尺寸 / strip dragTmp
  const els2 = [mk(0, 0, 4, 4, 'container')]
  els2[0].dragTmp = true
  const s1 = settleDrag({ elements: els2 }, { mode: 'create', tmpId: els2[0].id })
  ok(s1.remove && s1.remove[0] === els2[0].id, '创建过小（<8）→ 删除')

  const t = createElement({ kind: 'text' }, 0, 0, 2, 2)
  t.dragTmp = true
  const s2 = settleDrag({ elements: [t] }, { mode: 'create', tmpId: t.id })
  ok(s2.patch && s2.patch.w === 120 && s2.patch.h === 24, '文本过小 → 默认尺寸 120x24')
  ok(!('dragTmp' in s2.patch), '结算剥离 dragTmp')

  // settle：marquee 完全包含
  const els3 = [mk(100, 100, 50, 50), mk(200, 200, 100, 100)]
  const s3 = settleDrag({ elements: els3 }, { mode: 'marquee', sx: 90, sy: 90, mq: { x: 90, y: 90, w: 80, h: 80 } })
  ok(s3.selection.length === 1 && s3.selection[0] === els3[0].id, '框选完全包含结算（部分重叠不选）')
  const s3b = settleDrag({ elements: els3 }, { mode: 'marquee', sx: 90, sy: 90, mq: { x: 90, y: 90, w: 30, h: 30 } })
  ok(Array.isArray(s3b.selection) && s3b.selection.length === 0, '选框未完全包含任何元素 → 空选择')

  // groupResize 等比：br 角从 (350,160) 拖到 (400,340) → nw=300 → scale = 300/250 = 1.2
  const els4 = [mk(100, 100, 100, 60), mk(250, 100, 100, 60)]
  const ids4 = els4.map((e) => e.id)
  const gb = groupBounds(els4, ids4)
  const gDrag = { mode: 'groupResize', corner: 'br', sx: gb.x + gb.w, sy: gb.y + gb.h, gb }
  const g = computeGroupResize({ elements: els4, selectedIds: ids4 }, gDrag, gb.x + 300, gb.y + 240)
  ok(g.length === 2, '组缩放 2 个元素')
  ok(Math.abs(g[0].w - 120) < 0.01 && Math.abs(g[0].x - 100) < 0.01, '组缩放等比 scale=1.2（锚定外框原点）')
  ok(Math.abs(g[1].x - 280) < 0.01, '组缩放各元素按比例位移（250 → 280）')

  // zoomAt 中心锚点
  const z = zoomAt(1.1, 1, { x: 0, y: 0 })
  ok(Math.abs(z.zoom - 1.1) < 0.001, 'zoom 1 → 1.1')
  const cx0 = 0 + 800 / 1 / 2
  const cx1 = z.pan.x + 800 / z.zoom / 2
  ok(Math.abs(cx0 - cx1) < 0.01, '缩放保持视口中心不变')
  const z2 = zoomAt(0.1, 1, { x: 0, y: 0 })
  ok(z2.zoom === 0.25, 'zoom 下限 0.25')
}

// ---------- resize 对齐吸附（下边/右边，阈值 6/zoom 与移动一致） ----------
section('resize 对齐吸附')
{
  // el(100,100,100,50)；target(300,100,60,30)：左边缘 300 / 右边缘 360 / 下边缘 130
  const els = []
  const re = mk(100, 100, 100, 50)
  els.push(re)
  const rt = mk(300, 100, 60, 30)
  els.push(rt)
  const rDrag = { mode: 'resize', id: re.id, sx: 200, sy: 150, ow: 100, oh: 50, page: null }

  // 右边拖到与目标左边缘差 3px（容差内）→ 吸附到 300
  const r1 = computeResize({ elements: els, zoom: 1 }, rDrag, 200 + 97, 150)
  ok(r1.w === 200, 'resize 右边吸附到目标左边缘（300）')
  ok(r1.snaps.some((s) => s.axis === 'v' && s.pos === 300), 'resize 产生垂直吸附线')

  // 右边拖到与目标右边缘差 3px → 吸附到 360
  const r2 = computeResize({ elements: els, zoom: 1 }, rDrag, 200 + 157, 150)
  ok(r2.w === 260, 'resize 右边吸附到目标右边缘（360）')

  // 右边距目标 7px（超出容差）→ 不吸附
  const r3 = computeResize({ elements: els, zoom: 1 }, rDrag, 200 + 93, 150)
  ok(r3.w === 193 && r3.snaps.length === 0, 'resize 超出容差不吸附')

  // 下边拖到与目标下边缘差 3px → 吸附到 130
  const r4 = computeResize({ elements: els, zoom: 1 }, rDrag, 200, 150 + (27 - 50))
  ok(r4.h === 30, 'resize 下边吸附到目标下边缘（130）')
  ok(r4.snaps.some((s) => s.axis === 'h' && s.pos === 130), 'resize 产生水平吸附线')

  // 下边吸附到目标上边缘：元素 y=50，下边拖到 97（距目标上边 3px）→ 吸附到 100
  const els3 = []
  const re3 = mk(100, 50, 100, 50)
  els3.push(re3)
  const rt3 = mk(300, 100, 60, 30)
  els3.push(rt3)
  const rDrag3 = { mode: 'resize', id: re3.id, sx: 200, sy: 100, ow: 100, oh: 50, page: null }
  const r5 = computeResize({ elements: els3, zoom: 1 }, rDrag3, 200, 100 + (47 - 50))
  ok(r5.h === 50 && r5.snaps.some((s) => s.axis === 'h' && s.pos === 100), 'resize 下边吸附到目标上边缘（100）')

  // updateDrag：resize 路径拆分 patch 与 snaps
  const u1 = updateDrag({ elements: els, zoom: 1, selectedIds: [re.id] }, rDrag, 200 + 97, 150, 200 + 97, 150)
  ok(u1.patch && u1.patch.w === 200 && u1.snaps.length === 1, 'updateDrag：resize 返回 { patch, snaps }')

  // 页面钳制仍生效：页面右边界内拖拽超出 → 贴边
  const els2 = []
  const p2 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 300, 200)
  els2.push(p2)
  const re2 = mk(100, 100, 100, 50)
  els2.push(re2)
  const rDrag2 = { mode: 'resize', id: re2.id, sx: 200, sy: 150, ow: 100, oh: 50, page: { x: 20, y: 20, w: 300, h: 200 } }
  const r6 = computeResize({ elements: els2, zoom: 1 }, rDrag2, 600, 500)
  ok(r6.w === 20 + 300 - 100 && r6.h === 20 + 200 - 100, 'resize 页面边界钳制（贴边）')
}

// ---------- 完整事件序列（决策→移动→结算） ----------
section('事件序列：框选全流程')
{
  // 无页面场景（页面是元素，选择模式点击页面 = 选中页面；框选需从画布空白开始）
  const els = []
  const a = mk(60, 60, 100, 40)
  els.push(a)
  const b = mk(200, 60, 100, 40)
  els.push(b)
  const d = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 30, 30, 30, 30)
  ok(d.kind === 'marquee', '序列：空白按下 → marquee')
  const m1 = updateDrag({ elements: els, zoom: 1, selectedIds: [] }, d.drag, 350, 300, 350, 300)
  ok(m1.nextDrag.mq.w === 320 && m1.nextDrag.mq.h === 270, '序列：移动更新选框')
  const s = settleDrag({ elements: els }, m1.nextDrag)
  ok(s.selection.length === 2 && s.selection.includes(a.id) && s.selection.includes(b.id), '序列：结算选中两个完全包含元素')
}

// ---------- 四边 resize（上下左右横向/纵向） ----------
section('四边 resize：computeResize 按 side 计算')
{
  // el(100,100,100,50)，无页面
  const el = mk(100, 100, 100, 50)
  const els = [el]
  const base = { id: el.id, sx: 200, sy: 150, ow: 100, oh: 50, page: null }

  // r：右边缘移动，锚定左
  const r1 = computeResize({ elements: els }, Object.assign({}, base, { side: 'r' }), 250, 150)
  ok(r1.w === 150 && r1.x === 100, 'r：宽 +50（左边缘锚定不动）')
  // l：左边缘移动（起点 sx=100 左边缘），右边缘锚定
  const r2 = computeResize({ elements: els }, Object.assign({}, base, { side: 'l', sx: 100 }), 120, 125)
  ok(r2.w === 80 && r2.x === 120, 'l：左边缘右移 20 → x=120, w=80（右边缘 200 不动）')
  const r3 = computeResize({ elements: els }, Object.assign({}, base, { side: 'l', sx: 100 }), 60, 125)
  ok(r3.w === 140 && r3.x === 60, 'l：左边缘左移 40 → x=60, w=140')
  // b：下边缘移动，锚定上
  const r4 = computeResize({ elements: els }, Object.assign({}, base, { side: 'b' }), 150, 170)
  ok(r4.h === 70 && r4.y === 100, 'b：高 +20（上边缘锚定不动）')
  // t：上边缘移动（起点 sy=100 上边缘），下边缘锚定
  const r5 = computeResize({ elements: els }, Object.assign({}, base, { side: 't', sy: 100 }), 150, 110)
  ok(r5.h === 40 && r5.y === 110, 't：上边缘下移 10 → y=110, h=40（下边缘 150 不动）')
  const r6 = computeResize({ elements: els }, Object.assign({}, base, { side: 't', sy: 100 }), 150, 70)
  ok(r6.h === 80 && r6.y === 70, 't：上边缘上移 30 → y=70, h=80')

  // 最小尺寸钳制（l 向内侧拖：右边缘不动，左边缘回退到 min）
  const r7 = computeResize({ elements: els }, Object.assign({}, base, { side: 'l', sx: 100 }), 300, 125)
  ok(r7.w === 24 && r7.x === 176, 'l：最小尺寸钳制（未显式类型 → 容器 24 宽，右边缘 200 不动）')

  // 页面钳制：l 拖出页面左边界 → 贴边
  const els2 = []
  const p2 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 300, 200)
  els2.push(p2)
  const re2 = mk(100, 100, 100, 50)
  els2.push(re2)
  const r8 = computeResize({ elements: els2 }, Object.assign({}, base, { id: re2.id, side: 'l', sx: 100, page: { x: 20, y: 20, w: 300, h: 200 } }), 0, 125)
  ok(r8.x === 20 && r8.w === 180, 'l：页面钳制（左边缘贴页面左边界，右边缘不动）')

  // 吸附：l 左边缘吸附目标右边缘（target(160,100,20,50) 右边缘 180；最小钳制后左边缘可到 176，5px 容差内）
  const els3 = []
  const re3 = mk(100, 100, 100, 50)
  els3.push(re3)
  const rt3 = mk(160, 100, 20, 50)
  els3.push(rt3)
  const r9 = computeResize({ elements: els3, zoom: 1 }, Object.assign({}, base, { id: re3.id, side: 'l', sx: 100 }), 175, 125)
  ok(r9.x === 180 && r9.w === 24 && r9.snaps.some((s) => s.axis === 'v' && s.pos === 180), 'l：左边缘吸附到目标右边缘（180，钳制后）')
}

// ---------- 边手柄命中决策 ----------
section('四边 resize：pointer.down 边手柄命中')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  els.push(page)
  const btn = mk(100, 100, 200, 60, 'button')
  btn.text = '登录'
  els.push(btn)

  const d1 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 100, 130, 100, 130)
  ok(d1.kind === 'resize' && d1.drag.side === 'l', '左边缘带命中 → resize side=l')
  const d2 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 300, 130, 300, 130)
  ok(d2.kind === 'resize' && d2.drag.side === 'r', '右边缘带命中 → resize side=r')
  const d3 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 200, 100, 200, 100)
  ok(d3.kind === 'resize' && d3.drag.side === 't', '上边缘带命中 → resize side=t')
  const d4 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 200, 160, 200, 160)
  ok(d4.kind === 'resize' && d4.drag.side === 'b', '下边缘带命中 → resize side=b')
  const d5 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 293, 153, 293, 153)
  ok(d5.kind === 'resize' && d5.drag.side === 'br', '右下角手柄命中 → resize side=br（原行为）')
  const d6 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 200, 130, 200, 130)
  ok(d6.kind === 'move', '控件内部命中 → move')

  // 元素边带优先于 hitTest（修复「光标已显示可拖但点击变选中」）：
  // 点击元素边缘外侧（光标 ew/ns 区域）→ 触发 resize，而非落入空白误触发框选
  const elsO = [mk(100, 100, 100, 60)]
  const dO1 = decidePointerDown({ elements: elsO, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 95, 130, 95, 130)
  ok(dO1.kind === 'resize' && dO1.drag.side === 'l', '左边缘外侧 5px 点击 → resize（不落入空白框选）')
  const dO2 = decidePointerDown({ elements: elsO, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 205, 165, 205, 165)
  ok(dO2.kind === 'resize' && dO2.drag.side === 'br', '右下角外侧点击 → resize br（对侧双向）')
  const dO3 = decidePointerDown({ elements: elsO, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 150, 94, 150, 94)
  ok(dO3.kind === 'resize' && dO3.drag.side === 't', '上边缘外侧 6px 点击 → resize t')
  // 超出边带（边缘 8px 外）→ 仍为空白行为
  const dO4 = decidePointerDown({ elements: elsO, mode: 'select', zoom: 1, selectedIds: [], spaceDown: false, pan: { x: 0, y: 0 } }, 85, 130, 85, 130)
  ok(dO4.kind === 'marquee', '边缘外侧超过边带（15px）→ 空白框选')
}

// ---------- 多选外框四边 resize（幅度与移动量一致，线性非等比） ----------
section('多选外框四边 resize：computeGroupEdgeResize')
{
  // A(100,100,100,60) B(250,100,100,60) → gb=(100,100,250,60)
  const els = [mk(100, 100, 100, 60), mk(250, 100, 100, 60)]
  const ids = els.map((e) => e.id)
  const gb = groupBounds(els, ids)

  // r：右边移动 dx=+50 → 每个控件 w += 50（左边缘不动）
  const r1 = computeGroupEdgeResize({ elements: els, selectedIds: ids }, { mode: 'groupEdgeResize', side: 'r', sx: gb.x + gb.w, sy: gb.y, gb }, gb.x + gb.w + 50, gb.y)
  const a1 = r1.patches.find((p) => p.id === els[0].id)
  const b1 = r1.patches.find((p) => p.id === els[1].id)
  ok(a1.w === 150 && a1.x === undefined && b1.w === 150, 'r：每个控件宽 +50（幅度与虚线框移动量一致）')

  // l：左边移动 dx=+20 → 每个控件 x += 20 且 w -= 20（右边缘不动）
  const r2 = computeGroupEdgeResize({ elements: els, selectedIds: ids }, { mode: 'groupEdgeResize', side: 'l', sx: gb.x, sy: gb.y, gb }, gb.x + 20, gb.y)
  const a2 = r2.patches.find((p) => p.id === els[0].id)
  const b2 = r2.patches.find((p) => p.id === els[1].id)
  ok(a2.x === 120 && a2.w === 80, 'l：A 左边缘右移 20（x=120, w=80，右边缘 200 不动）')
  ok(b2.x === 270 && b2.w === 80, 'l：B 左边缘右移 20（x=270, w=80，右边缘 350 不动）')

  // b：下边移动 dy=+30 → 每个控件 h += 30
  const r3 = computeGroupEdgeResize({ elements: els, selectedIds: ids }, { mode: 'groupEdgeResize', side: 'b', sx: gb.x, sy: gb.y + gb.h, gb }, gb.x, gb.y + gb.h + 30)
  ok(r3.patches.every((p) => p.h === 90), 'b：每个控件高 +30')

  // t：上边移动 dy=+10 → 每个控件 y += 10 且 h -= 10（下边缘不动）
  const r4 = computeGroupEdgeResize({ elements: els, selectedIds: ids }, { mode: 'groupEdgeResize', side: 't', sx: gb.x, sy: gb.y, gb }, gb.x, gb.y + 10)
  ok(r4.patches.every((p) => p.y === 110 && p.h === 50), 't：每个控件上边缘下移 10（y=110, h=50，下边缘 160 不动）')

  // 最小尺寸钳制：l 大幅度右移 → 宽到类型最小（未显式类型 → 容器 24），右边缘保持
  const r5 = computeGroupEdgeResize({ elements: els, selectedIds: ids }, { mode: 'groupEdgeResize', side: 'l', sx: gb.x, sy: gb.y, gb }, gb.x + 300, gb.y)
  const a5 = r5.patches.find((p) => p.id === els[0].id)
  ok(a5.w === 24 && a5.x === 176, 'l：最小尺寸钳制（A 宽 24，右边缘 200 不动）')

  // 批量吸附：外框右边缘与「非选中元素」左边缘对齐（容差 6/zoom，与 move/resize 一致）
  // A(100,100,100,60) B(250,100,100,60) 选中；C(420,100,60,30) 未选中
  const elsS = [mk(100, 100, 100, 60), mk(250, 100, 100, 60), mk(420, 100, 60, 30)]
  const idsS = elsS.slice(0, 2).map((e) => e.id)
  const gbS = groupBounds(elsS, idsS) // (100,100,250,60)，右边缘 350
  const rS = computeGroupEdgeResize({ elements: elsS, selectedIds: idsS, zoom: 1 }, { mode: 'groupEdgeResize', side: 'r', sx: gbS.x + gbS.w, sy: gbS.y, gb: gbS }, gbS.x + gbS.w + 67, gbS.y)
  const aS = rS.patches.find((p) => p.id === elsS[0].id)
  const bS = rS.patches.find((p) => p.id === elsS[1].id)
  ok(aS.w === 170 && bS.w === 170, '吸附：外框右边缘吸附到 C 左边缘 420（各控件宽 +70，吸附修正 +3）')
  ok(rS.snaps.some((s) => s.axis === 'v' && s.pos === 420), '吸附：产生垂直吸附线')
  // 超出容差（外框右边缘距 C 左边缘 7px > 6px）→ 不吸附
  const rS2 = computeGroupEdgeResize({ elements: elsS, selectedIds: idsS, zoom: 1 }, { mode: 'groupEdgeResize', side: 'r', sx: gbS.x + gbS.w, sy: gbS.y, gb: gbS }, gbS.x + gbS.w + 63, gbS.y)
  ok(rS2.patches[0].w === 163 && rS2.snaps.length === 0, '吸附：超出容差不吸附（宽 +63）')

  // 多帧回归（修复「放大」）：拖动中 elements 每帧更新，增量必须按本帧位移计算，
  // 否则累计位移重复累加（旧 bug：第 2 帧 w = 110 + 20 = 130，应为 120）
  const elsF = [mk(100, 100, 100, 60), mk(250, 100, 100, 60)]
  const idsF = elsF.map((e) => e.id)
  const gbF = groupBounds(elsF, idsF)
  const dragF = { mode: 'groupEdgeResize', side: 'r', sx: gbF.x + gbF.w, sy: gbF.y, gb: gbF }
  const f1 = computeGroupEdgeResize({ elements: elsF, selectedIds: idsF }, dragF, gbF.x + gbF.w + 10, gbF.y)          // 第 1 帧：+10
  const elsF2 = elsF.map((e) => { const p = f1.patches.find((x) => x.id === e.id); return p ? Object.assign({}, e, p) : e })
  const f2 = computeGroupEdgeResize({ elements: elsF2, selectedIds: idsF }, Object.assign({}, dragF, { lastDx: 10 }), gbF.x + gbF.w + 20, gbF.y)  // 第 2 帧：累计 +20
  const aF1 = f1.patches.find((p) => p.id === elsF[0].id)
  const aF2 = f2.patches.find((p) => p.id === elsF[0].id)
  ok(aF1.w === 110, '多帧：第 1 帧宽 +10（110）')
  ok(aF2.w === 120, '多帧：第 2 帧只加本帧增量（110+10=120，不重复累加成 130）')
}

// ---------- 多选外框边手柄命中决策 ----------
section('多选外框四边 resize：pointer.down 边手柄命中')
{
  // L 形布局：A(100,200,100,60) B(200,100,100,60) → gb=(100,100,200,160)
  const els = [mk(100, 200, 100, 60), mk(200, 100, 100, 60)]
  const ids = els.map((e) => e.id)
  const gb = groupBounds(els, ids)

  const d1 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: ids, spaceDown: false, pan: { x: 0, y: 0 } }, gb.x - 5, 180, gb.x - 5, 180)
  ok(d1.kind === 'groupEdgeResize' && d1.drag.side === 'l', '外框左边带命中 → groupEdgeResize side=l')
  const d2 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: ids, spaceDown: false, pan: { x: 0, y: 0 } }, 150, gb.y - 5, 150, gb.y - 5)
  ok(d2.kind === 'groupEdgeResize' && d2.drag.side === 't', '外框上边带命中 → groupEdgeResize side=t')
  const d3 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: ids, spaceDown: false, pan: { x: 0, y: 0 } }, gb.x, gb.y, gb.x, gb.y)
  ok(d3.kind === 'groupEdgeResize' && d3.drag.side === 'l', '外框角（空白角）→ groupEdgeResize（角归边，无四角等比）')
  const d4 = decidePointerDown({ elements: els, mode: 'select', zoom: 1, selectedIds: ids, spaceDown: false, pan: { x: 0, y: 0 } }, 320, 180, 320, 180)
  ok(d4.kind === 'marquee', '外框之外空白 → marquee')
  // 回归：多选外框边带优先于元素命中——点贴框元素的边缘（元素上边缘 = 外框上边）→ 批量调整而非单元素
  const elsB = [mk(100, 100, 100, 60), mk(250, 100, 100, 60)]
  const idsB = elsB.map((e) => e.id)
  const gbB = groupBounds(elsB, idsB)
  const dB = decidePointerDown({ elements: elsB, mode: 'select', zoom: 1, selectedIds: idsB, spaceDown: false, pan: { x: 0, y: 0 } }, 300, 100, 300, 100)
  ok(dB.kind === 'groupEdgeResize' && dB.drag.side === 't', '边带优先：点贴框元素的上边缘 → 批量（不被单元素命中抢走）')
  // 多选态点框内元素内部（非边带）→ 仍走元素（移动/单选）
  const dC = decidePointerDown({ elements: elsB, mode: 'select', zoom: 1, selectedIds: idsB, spaceDown: false, pan: { x: 0, y: 0 } }, 150, 130, 150, 130)
  ok(dC.kind === 'move' && dC.drag.id === elsB[0].id, '框内元素内部 → 元素操作（保持多选整体移动）')
}

// ---------- 复制 / 粘贴 ----------
section('复制 / 粘贴')
{
  // 场景：页面 + 页面内容器（含子按钮）+ 页面外独立按钮 + 备注
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '登录页'
  els.push(page)
  const cont = mk(60, 60, 300, 200, 'container')
  cont.name = '表单'
  els.push(cont)
  const kidBtn = mk(80, 80, 120, 36, 'button')
  kidBtn.text = '登录'
  kidBtn.action = '提交登录'
  kidBtn.radius = 6
  kidBtn.note = '主按钮'
  els.push(kidBtn)
  const outBtn = mk(500, 500, 100, 32, 'button')
  outBtn.text = '页外'
  els.push(outBtn)
  const note = createElement({ kind: 'note' }, 820, 60, 140, 60) // 页面（右界 780）之外
  note.text = '备注：要求'
  els.push(note)

  // 1) 复制页面 → 页面 + 内部容器 + 子按钮（页外按钮/备注不进入）
  const set1 = collectCopySet(els, [page.id])
  ok(set1.length === 3, '复制页面：连带内部容器与子按钮（3 个）')
  ok(set1.every((e) => e.id !== outBtn.id && e.id !== note.id), '复制页面：不含页外元素')
  ok(set1[0].id === page.id, '复制集合保持画布 z 序（页面在前）')

  // 2) 复制容器 → 容器 + 子按钮（样式/设置逐项保留）
  const set2 = collectCopySet(els, [cont.id])
  ok(set2.length === 2, '复制容器：连带内部子元素（2 个）')
  const kid = set2.find((e) => e.text === '登录')
  ok(kid && kid.action === '提交登录' && kid.radius === 6 && kid.note === '主按钮', '副本样式/设置与源完全一致')

  // 3) 多选（父+子同时选中）→ 去重不重复
  const set3 = collectCopySet(els, [page.id, cont.id, kidBtn.id])
  ok(set3.length === 3, '父+子同时选中：去重后仍 3 个')

  // 4) 多选互不包含 → 各取所需
  const set4 = collectCopySet(els, [kidBtn.id, outBtn.id])
  ok(set4.length === 2, '多选互不包含：复制 2 个')

  // 5) 深拷贝隔离：复制后修改源，缓冲不受影响
  const set5 = collectCopySet(els, [cont.id])
  kidBtn.text = '改过'
  const kid5 = set5.find((e) => e.text === '登录')
  ok(!!kid5, '复制缓冲为深拷贝（源修改不影响缓冲）')

  // 6) 粘贴：新 id + 整体偏移 + 相对位置保持
  const copies = buildPaste(set1, PASTE_OFFSET, PASTE_OFFSET)
  ok(copies.length === 3 && new Set(copies.map((c) => c.id)).size === 3, '粘贴：全部重新分配 id（无重复）')
  ok(copies.every((c) => !els.some((e) => e.id === c.id)), '粘贴：id 不与源冲突')
  const cPage = copies.find((c) => c.type === 'page')
  const cCont = copies.find((c) => c.type === 'container')
  const cKid = copies.find((c) => c.text === '登录')
  ok(cPage.x === page.x + PASTE_OFFSET && cPage.y === page.y + PASTE_OFFSET, '粘贴：页面小幅横纵位移')
  ok(cCont.x === cont.x + PASTE_OFFSET && cCont.y === cont.y + PASTE_OFFSET, '粘贴：容器同位移')
  ok(cKid.x === kidBtn.x + PASTE_OFFSET && cKid.y === kidBtn.y + PASTE_OFFSET, '粘贴：子元素同位移')
  ok(cKid.x - cCont.x === kidBtn.x - cont.x && cKid.y - cCont.y === kidBtn.y - cont.y, '粘贴：子元素与容器相对位置与源一致')
  ok(cKid.action === '提交登录' && cKid.radius === 6 && cKid.note === '主按钮', '粘贴：样式/设置与源完全一致')
  ok(copies[0].id === cPage.id, '粘贴：保持 z 序')

  // 7) 空选择复制 → 空集合
  ok(collectCopySet(els, []).length === 0, '空选择复制 → 空集合')
}
