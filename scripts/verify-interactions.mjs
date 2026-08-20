// 验证脚本：交互状态机（P3）——决策/计算/结算事件序列
// 用法：node scripts/verify-interactions.mjs
import { createElement, cloneElements } from '../src/core/model.js'
import {
  decidePointerDown, updateDrag, settleDrag, groupBounds, zoomAt,
  computeMove, computeGroupResize, computeCreate, computeResize, computeMarquee,
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

  // 多选外框角手柄 → groupResize：外框角必须落在空白（L 形布局：tl 角由两个元素的不同边构成）
  // A(100,200) 顶左边缘，B(200,100) 顶右边缘 → 外框 tl=(100,100) 处无元素
  const els2 = [mk(100, 200, 100, 60), mk(200, 100, 100, 60)]
  const ids2 = els2.map((e) => e.id)
  const gb = groupBounds(els2, ids2)
  const d8 = decidePointerDown({ elements: els2, mode: 'select', zoom: 1, selectedIds: ids2, spaceDown: false, pan: { x: 0, y: 0 } }, gb.x, gb.y, gb.x, gb.y)
  ok(d8.kind === 'groupResize' && d8.drag.corner === 'tl', '多选外框角手柄（空白角）→ groupResize')
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

  // resize：最小 8
  const el = mk(100, 100, 100, 50)
  const rDrag = { mode: 'resize', id: el.id, sx: 200, sy: 150, ow: 100, oh: 50, page: null }
  const r = computeResize({ elements: [el] }, rDrag, 150, 140)
  ok(r.w === 50 && r.h === 40, 'resize 计算新尺寸')
  const r2 = computeResize({ elements: [el] }, rDrag, 100, 100)
  ok(r2.w === 8 && r2.h === 8, 'resize 最小 8')

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
