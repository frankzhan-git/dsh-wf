// 验证脚本：模拟草图 → 解析管线 → 对照 JSON 设计原则断言
// 用法：node scripts/verify-core.mjs
import { createElement } from '../src/core/model.js'
import { buildResult } from '../src/core/pipeline.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 场景 1：登录页（含 action/inputType/用户 name/自动 name 省略） ----------
section('场景 1：登录页')
{
  const els = []
  const title = createElement({ kind: 'text' }, 300, 40, 120, 20)
  title.text = '用户登录'
  els.push(title)
  const box = createElement({ kind: 'rect' }, 100, 80, 600, 340)
  box.text = '登录卡片'
  els.push(box)
  const u = createElement({ kind: 'rect' }, 140, 110, 520, 36)
  u.text = '请输入用户名'
  els.push(u)
  const pw = createElement({ kind: 'rect' }, 140, 170, 520, 36)
  pw.text = '请输入密码'
  pw.name = '密码输入框'
  pw.inputType = 'password'
  els.push(pw)
  const note = createElement({ kind: 'note' }, 150, 180, 200, 24)
  note.text = '密码需脱敏显示'
  els.push(note)
  const btn = createElement({ kind: 'rect' }, 260, 280, 280, 40)
  btn.text = '登录'
  btn.radius = 20
  btn.action = '提交登录并跳转首页'
  els.push(btn)

  const r = buildResult(els, '登录页')
  console.log(r.jsonl)
  ok(r.jsonl.includes('"name":"登录页"'), '根容器 name=用户输入的画布名称')
  ok(!r.jsonl.includes('"name":"用户登录"'), '原则6：自动生成的 name 省略（不与 text 重复）')
  ok(!r.jsonl.includes('"name":"登录卡片"'), '原则6：容器自动 name 省略')
  ok(r.jsonl.includes('"name":"密码输入框"'), '用户显式设置的 name 输出')
  ok(r.jsonl.includes('"inputType":"password"'), '输入类型 inputType 输出')
  ok(r.jsonl.includes('"action":"提交登录并跳转首页"'), '按钮动作 action 输出')
  ok(r.jsonl.includes('"description":"密码需脱敏显示"'), '备注挂接到 description')
  ok(!r.jsonl.includes('"rows"'), '原则4：textarea 默认行数 rows 省略')
  ok(r.jsonl.indexOf('"x"') === -1 && r.jsonl.indexOf('"y"') === -1 && r.jsonl.indexOf('"w"') === -1 && r.jsonl.indexOf('"h"') === -1, '原则4：不含画布坐标/尺寸字段')
  ok(!r.jsonl.includes('"direction"'), 'vertical 为默认值省略')
  ok(r.issues.filter((i) => i.level === 'error').length === 0, '无 error')
  JSON.parse(r.jsonl)
}

// ---------- 场景 2：商品卡片（horizontal 显式输出 + 自动 name 省略） ----------
section('场景 2：商品卡片')
{
  const els = []
  const card = createElement({ kind: 'rect' }, 100, 60, 600, 220)
  card.text = '商品卡片'
  els.push(card)
  const img = createElement({ kind: 'rect', type: 'image' }, 130, 90, 180, 160)
  img.src = 'https://example.com/product.jpg'
  els.push(img)
  const info = createElement({ kind: 'rect' }, 340, 90, 320, 160)
  els.push(info)
  const nm = createElement({ kind: 'text' }, 360, 100, 200, 20)
  nm.text = '无线蓝牙耳机'
  els.push(nm)
  const pr = createElement({ kind: 'text' }, 360, 140, 160, 20)
  pr.text = '￥299.00'
  els.push(pr)
  const buy = createElement({ kind: 'rect' }, 360, 190, 120, 36)
  buy.text = '立即购买'
  buy.radius = 18
  els.push(buy)

  const r = buildResult(els, '商品详情页')
  console.log(r.jsonl)
  ok(r.jsonl.includes('"direction":"horizontal"'), '水平排列显式输出 direction')
  ok(r.jsonl.includes('"type":"image"') && r.jsonl.includes('"src":"https://example.com/product.jpg"'), 'image + src')
  ok(!r.jsonl.includes('"name":"图片"'), '原则6：自动 name 省略')
  ok(r.tree.children[0].direction === 'horizontal', '商品卡片内部树 direction=horizontal')
  ok(r.issues.filter((i) => i.level === 'error').length === 0, '无 error')
  JSON.parse(r.jsonl)
}

// ---------- 场景 3：画布级意图进 JSON（未挂接备注 + 箭头跳转 → 根 description） ----------
section('场景 3：画布级意图')
{
  const els = []
  const a = createElement({ kind: 'rect' }, 100, 60, 200, 60)
  a.text = '登录'
  a.radius = 20
  els.push(a)
  const b = createElement({ kind: 'rect' }, 400, 60, 200, 60)
  b.text = '首页'
  b.radius = 20
  els.push(b)
  const arrow = createElement({ kind: 'arrow' }, 300, 90, 100, 0)
  arrow.x2 = 400
  arrow.y2 = 90
  els.push(arrow)
  const note = createElement({ kind: 'note' }, 100, 160, 300, 24)
  note.text = '登录后自动进入首页'
  els.push(note)

  const r = buildResult(els, '登录流程')
  console.log(r.jsonl)
  console.log('canvasNote:', r.canvasNote)
  ok(r.jsonl.includes('"description"'), '原则1：画布级意图进入 JSON')
  ok(r.jsonl.includes('登录 → 首页 跳转'), '箭头跳转关系写入根 description')
  ok(r.jsonl.includes('登录后自动进入首页'), '未挂接备注写入根 description')
  ok(r.canvasNote.includes('跳转'), 'canvasNote 汇总仍在')
  JSON.parse(r.jsonl)
}

// ---------- 场景 4：select/radio 选项输出 ----------
section('场景 4：select options')
{
  const els = []
  const sel = createElement({ kind: 'rect' }, 100, 60, 300, 36)
  sel.text = '请选择状态'
  sel.type = 'select'
  sel.optionsText = '待付款, 已付款, 已关闭'
  els.push(sel)
  const r = buildResult(els, '订单筛选')
  console.log(r.jsonl)
  ok(r.jsonl.includes('"options":["待付款","已付款","已关闭"]'), '逗号分隔选项 → options 数组')
  JSON.parse(r.jsonl)
}

// ---------- 场景 5：空画布 / 空矩形 ----------
section('场景 5：空画布与空矩形')
{
  const r0 = buildResult([], '画布')
  ok(r0.empty === true && r0.jsonl === '', '空画布 empty=true 且 JSONL 为空')
  ok(r0.issues.some((i) => i.level === 'error' && i.message.includes('画布为空')), '报「画布为空」error')

  const els = [createElement({ kind: 'rect' }, 100, 60, 300, 200)]
  const r1 = buildResult(els, '画布')
  console.log(r1.jsonl)
  ok(r1.jsonl === '{"type":"container","name":"画布","children":[{"type":"container"}]}', '空矩形兜底为容器且无自动 name（最精简）')
  ok(r1.issues.some((i) => i.level === 'warning'), '产生低置信度 warning')

  // 仅空页面（无内容）→ 仍视为空画布
  const pageOnly = [createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)]
  const r2 = buildResult(pageOnly, '画布')
  ok(r2.empty === true && r2.jsonl === '', '空页面不输出（画布仍为空）')
}

// ---------- 场景 6：多页面（每页一行 JSONL）+ 显式类型不被子元素覆盖 ----------
section('场景 6：多页面')
{
  const els = []
  // 页面 1：登录页（含标题 + 按钮）
  const p1 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 340, 460)
  p1.name = '登录页'
  els.push(p1)
  const t1 = createElement({ kind: 'text' }, 60, 60, 120, 20)
  t1.text = '欢迎登录'
  els.push(t1)
  const b1 = createElement({ kind: 'rect' }, 80, 140, 200, 40)
  b1.text = '登录'
  b1.radius = 20
  b1.action = '提交登录'
  els.push(b1)
  // 页面 2：首页（含一个按钮，按钮显式类型且包含子元素 → 不被强制为 container）
  const p2 = createElement({ kind: 'rect', type: 'page' }, 400, 20, 380, 460)
  p2.name = '首页'
  els.push(p2)
  const b2 = createElement({ kind: 'rect' }, 440, 60, 200, 40)
  b2.text = '进入详情'
  b2.type = 'button'
  b2.radius = 20
  els.push(b2)
  const child = createElement({ kind: 'rect' }, 460, 70, 60, 20)
  child.text = '内嵌'
  els.push(child)
  // 空页面（无内容，应被过滤）：放置在不与其它页面重叠的位置（无限画布允许）
  const p3 = createElement({ kind: 'rect', type: 'page' }, 850, 20, 200, 200)
  p3.name = '空页面'
  els.push(p3)

  const r = buildResult(els, '画布')
  console.log(r.jsonl)
  const lines = r.jsonl.split('\n')
  ok(lines.length === 2, '两个有内容的页面 = 两行 JSONL（空页面被过滤）')
  ok(lines[0].includes('"type":"page"') && lines[0].includes('"name":"登录页"'), '第一行 = 登录页根')
  ok(lines[1].includes('"type":"page"') && lines[1].includes('"name":"首页"'), '第二行 = 首页根')
  ok(r.tree.length === 2, 'tree 为多根数组（语义预览并排）')
  ok(r.tree[0].type === 'page' && r.tree[1].type === 'page', '根节点类型为 page')
  ok(r.tree[1].children[0].type === 'button', '显式 type=button 不被子元素覆盖（bug 修复验证）')
  for (const line of lines) JSON.parse(line)
}

// ---------- 场景 7：direction 显式设置优先（auto 时按子元素分布推断） ----------
section('场景 7：direction 显式优先')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '设置页'
  page.direction = 'horizontal' // 显式水平（子元素实际垂直分布，验证不被推断覆盖）
  els.push(page)
  const a = createElement({ kind: 'rect' }, 60, 60, 300, 40)
  a.text = 'A'
  a.type = 'button'
  els.push(a)
  const b = createElement({ kind: 'rect' }, 60, 130, 300, 40)
  b.text = 'B'
  b.type = 'button'
  els.push(b)

  const r = buildResult(els, '画布')
  console.log(r.jsonl)
  ok(r.tree.direction === 'horizontal', '显式 direction=horizontal 不被子元素分布（垂直）覆盖')
  ok(r.jsonl.includes('"direction":"horizontal"'), 'JSONL 输出显式 horizontal')

  // auto：不设置 direction → 按子元素分布推断为 vertical（省略输出）
  const els2 = []
  const page2 = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page2.name = '设置页'
  els2.push(page2)
  els2.push(Object.assign({}, a))
  els2.push(Object.assign({}, b))
  const r2 = buildResult(els2, '画布')
  ok(r2.tree.direction === 'vertical', 'auto：按子元素分布推断为 vertical')
  ok(!r2.jsonl.includes('"direction"'), 'vertical 默认省略（纯净）')
}

// ---------- 场景 8：标准 props 补齐支持值 ----------
section('场景 8：props 补齐')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  els.push(page)
  const pv = createElement({ kind: 'rect' }, 60, 60, 300, 20)
  pv.type = 'progress'
  pv.value = '60'
  pv.max = '100'
  els.push(pv)
  const inp = createElement({ kind: 'rect' }, 60, 100, 300, 36)
  inp.type = 'input'
  inp.text = '请输入数量'
  inp.value = '12'
  els.push(inp)
  const sw = createElement({ kind: 'rect' }, 60, 150, 80, 24)
  sw.type = 'switch'
  sw.checked = true
  els.push(sw)
  const cb = createElement({ kind: 'rect' }, 60, 190, 200, 24)
  cb.type = 'checkbox'
  cb.label = '记住我'
  cb.checked = true
  els.push(cb)
  const img = createElement({ kind: 'rect' }, 60, 230, 120, 80)
  img.type = 'image'
  img.src = 'https://example.com/a.png'
  img.alt = '商品主图'
  els.push(img)
  const lnk = createElement({ kind: 'rect' }, 60, 330, 160, 24)
  lnk.type = 'link'
  lnk.text = '查看详情'
  lnk.href = 'https://example.com/detail'
  els.push(lnk)

  const r = buildResult(els, '画布')
  console.log(r.jsonl)
  const j = r.jsonl
  ok(j.includes('"value":60') && j.includes('"max":100'), 'progress 输出 value/max（数字）')
  ok(j.includes('"value":"12"'), 'input 输出默认值 value')
  ok(j.includes('"checked":true'), 'switch 输出 checked')
  ok(j.includes('"label":"记住我"') && j.includes('"checked":true'), 'checkbox 输出 label/checked')
  ok(j.includes('"alt":"商品主图"'), 'image 输出 alt')
  ok(j.includes('"href":"https://example.com/detail"'), 'link 输出 href')
  for (const line of r.jsonl.split('\n')) JSON.parse(line)
}

// ---------- 场景 9：page 恒为根类型（任意层级提升，不进入 children） ----------
section('场景 9：page 恒为根')
{
  const els = []
  // 页面被嵌套在一个容器内（异常操作产生的结构）
  const outer = createElement({ kind: 'rect' }, 20, 20, 760, 480)
  outer.type = 'container'
  els.push(outer)
  const page = createElement({ kind: 'rect', type: 'page' }, 40, 40, 300, 200)
  page.name = '被嵌套的页面'
  els.push(page)
  const btn = createElement({ kind: 'rect' }, 60, 60, 120, 36)
  btn.text = '按钮'
  btn.type = 'button'
  els.push(btn)

  const r = buildResult(els, '画布')
  console.log(r.jsonl)
  const lines = r.jsonl.split('\n')
  ok(lines.length === 2, '嵌套的 page 被提升为独立根（两行：page + 外层容器）')
  ok(lines[0].includes('"type":"page"') && lines[0].includes('"name":"被嵌套的页面"'), '第一行 = page 根')
  ok(r.tree[0].type === 'page', 'tree 根类型为 page')
  ok(!lines[1].includes('"type":"page"'), '外层容器 children 中不再包含 page')
  for (const line of lines) JSON.parse(line)
}

// ---------- 场景 10：三条嵌套规则（页面恒为根 / 容器可嵌套任意内容 / 非容器不可嵌套） ----------
section('场景 10：嵌套规则')
{
  // 构造：页面 > 按钮（内画了一个文本，应穿透提升到按钮的父级=页面）
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '登录页'
  els.push(page)
  const btn = createElement({ kind: 'rect' }, 60, 60, 300, 80)
  btn.text = '提交'
  btn.type = 'button'
  els.push(btn)
  const txt = createElement({ kind: 'text' }, 80, 70, 100, 20)
  txt.text = '按钮内的文本'
  els.push(txt)
  // 页面外画一个 page，并在其中画一个容器嵌套一个按钮（容器可嵌套任意内容）
  const page2 = createElement({ kind: 'rect', type: 'page' }, 850, 20, 400, 400)
  page2.name = '第二页'
  els.push(page2)
  const box = createElement({ kind: 'rect' }, 870, 40, 300, 160)
  box.type = 'container'
  els.push(box)
  const btn2 = createElement({ kind: 'rect' }, 890, 60, 120, 36)
  btn2.text = '内层按钮'
  btn2.type = 'button'
  els.push(btn2)
  const inp2 = createElement({ kind: 'rect' }, 890, 120, 200, 36 )
  inp2.text = '请输入'
  inp2.type = 'input'
  els.push(inp2)

  const r = buildResult(els, '画布')
  console.log(r.jsonl)
  const lines = r.jsonl.split('\n')
  ok(lines.length === 2, '两个页面 = 两行根')
  // 规则 3：按钮内文本穿透提升到按钮的父级（页面），按钮不再带 children
  ok(r.tree[0].children.some((c) => c.type === 'text'), '按钮内的文本提升为页面直接子（与按钮同层）')
  ok(r.tree[0].children.some((c) => c.type === 'button' && !(c.children && c.children.length)), '按钮不再嵌套子元素')
  // 规则 2：容器可嵌套任意内容（button + input 在 container 内）
  const boxNode = r.tree[1].children[0]
  ok(boxNode.type === 'container' && boxNode.children.length === 2, '容器嵌套 button + input')
  // 规则 1：无嵌套 page，且输出无「非容器带 children」错误
  ok(r.issues.filter((i) => i.message.includes('非容器类型不应包含子节点')).length === 0, '无「非容器嵌套」校验错误')
  for (const line of lines) JSON.parse(line)
}

