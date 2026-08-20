// 验证脚本：JSONL 序列化（纯净七字段 + 空值省略 + 类型 props 全覆盖）
// 用法：node scripts/verify-serializer.mjs
import { serializeTree, serializeProps } from '../src/core/jsonl/serializer.js'
import { PROPS_BY_KEY } from '../src/core/jsonl/props.js'
import { TYPE_REGISTRY, TYPE_BY_TYPE } from '../src/core/types.js'
import { createElement } from '../src/core/model.js'
import { buildResult } from '../src/core/pipeline.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 纯净七字段 ----------
section('纯净七字段')
{
  const node = {
    type: 'container', name: '界面', description: '说明',
    props: { text: 'x' }, direction: 'horizontal', wrap: true,
    children: [{ type: 'button', props: { text: '登录' } }],
  }
  const o = serializeTree(node)
  const keys = Object.keys(o)
  ok(keys.every((k) => ['type', 'name', 'description', 'props', 'direction', 'wrap', 'children'].includes(k)), '顶层仅七字段')
  ok(!JSON.stringify(o).match(/"(x|y|w|h)":/), '不含坐标/尺寸键（原则4）')
  ok(o.children[0].type === 'button', 'children 递归纯净')
}

// direction 省略规则
{
  const v = serializeTree({ type: 'container', direction: 'vertical', children: [] })
  ok(!('direction' in v), 'vertical 默认省略')
  const h = serializeTree({ type: 'container', direction: 'horizontal', children: [] })
  ok(h.direction === 'horizontal', 'horizontal 显式输出')
  const nonC = serializeTree({ type: 'button', direction: 'horizontal', children: [] })
  ok(!('direction' in nonC), '非容器不携带 direction')
}

// ---------- 空值省略 ----------
section('空值省略')
{
  const empty = createElement({ kind: 'rect' }, 0, 0, 100, 30)
  empty.type = 'button'
  const p = serializeProps(empty, 'button')
  ok(Object.keys(p).length === 0, '全空元素 → 空 props（无任何默认值）')
}

// ---------- 各类型 props 全覆盖（17 类型） ----------
section('各类型 props 输出')
{
  const cases = [
    { type: 'text', el: { text: '你好' }, expect: { text: '你好' } },
    { type: 'button', el: { text: '登录', action: '提交' }, expect: { text: '登录', action: '提交' } },
    { type: 'input', el: { text: '请输入', value: '12', inputType: 'password' }, expect: { placeholder: '请输入', value: '12', inputType: 'password' } },
    { type: 'textarea', el: { text: '请输入详情', value: '内容' }, expect: { placeholder: '请输入详情', value: '内容' } },
    { type: 'image', el: { src: 'a.png', alt: '主图' }, expect: { src: 'a.png', alt: '主图' } },
    { type: 'video', el: { src: 'a.mp4', poster: 'p.jpg', autoplay: true }, expect: { src: 'a.mp4', poster: 'p.jpg', autoplay: true } },
    { type: 'audio', el: { src: 'a.mp3', controls: true }, expect: { src: 'a.mp3', controls: true } },
    { type: 'icon', el: { text: 'star', iconSize: '24' }, expect: { iconName: 'star', size: 24 } },
    { type: 'link', el: { text: '详情', href: 'https://x' }, expect: { text: '详情', href: 'https://x' } },
    { type: 'select', el: { optionsText: 'A, B', value: 'A' }, expect: { options: ['A', 'B'], value: 'A' } },
    { type: 'checkbox', el: { label: '记住我', checked: true }, expect: { label: '记住我', checked: true } },
    { type: 'radio', el: { label: '男', checked: true, optionsText: '男,女', value: '男' }, expect: { label: '男', checked: true, options: ['男', '女'], value: '男' } },
    { type: 'switch', el: { checked: true }, expect: { checked: true } },
    { type: 'progress', el: { value: '60', max: '100' }, expect: { value: 60, max: 100 } },
    { type: 'divider', el: { text: 'x' }, expect: {} },
    { type: 'badge', el: { text: '新品' }, expect: { text: '新品' } },
    { type: 'container', el: { direction: 'horizontal', wrap: true }, expect: {} }, // 容器 props 无字段（direction/wrap 是节点级）
  ]
  for (const c of cases) {
    const p = serializeProps(c.el, c.type)
    ok(JSON.stringify(p) === JSON.stringify(c.expect), `${c.type} props 输出符合预期`)
  }
}

// ---------- 集成：pipeline 走注册表序列化（与旧 42 断言同口径） ----------
section('pipeline 集成')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '登录页'
  els.push(page)
  const u = createElement({ kind: 'rect' }, 60, 60, 300, 36)
  u.text = '请输入用户名'
  els.push(u)
  const pw = createElement({ kind: 'rect' }, 60, 120, 300, 36)
  pw.text = '请输入密码'
  pw.inputType = 'password'
  els.push(pw)
  const btn = createElement({ kind: 'rect' }, 100, 200, 200, 40)
  btn.text = '登录'
  btn.radius = 20
  btn.action = '提交登录'
  els.push(btn)
  const pv = createElement({ kind: 'rect' }, 60, 270, 300, 16)
  pv.type = 'progress'
  pv.value = '60'
  pv.max = '100'
  els.push(pv)

  const r = buildResult(els, '界面')
  console.log(r.jsonl)
  ok(r.jsonl.includes('"placeholder":"请输入用户名"'), 'input placeholder（text → placeholder）')
  ok(r.jsonl.includes('"inputType":"password"'), 'inputType 输出')
  ok(r.jsonl.includes('"action":"提交登录"'), 'button action 输出')
  ok(r.jsonl.includes('"value":60') && r.jsonl.includes('"max":100'), 'progress 数字 value/max')
  ok(!r.jsonl.includes('"name":"界面"'), 'page 根不使用 rootName 注入（页面有自己的 name）')
  ok(r.issues.filter((i) => i.level === 'error').length === 0, '无 error')
  for (const line of r.jsonl.split('\n')) JSON.parse(line)
}

// ---------- 注册表与 schema.json 一致性 ----------
section('schema.json 一致性')
{
  let schema = null
  try {
    schema = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(new URL('../schema.json', import.meta.url), 'utf8')))
  } catch (e) {
    ok(false, 'schema.json 可读')
  }
  if (schema) {
    const enumTypes = schema?.properties?.type?.enum || []
    const missing = TYPE_REGISTRY.filter((t) => !enumTypes.includes(t.type)).map((t) => t.type)
    const extra = enumTypes.filter((t) => !TYPE_BY_TYPE[t])
    ok(missing.length === 0, `注册表类型全部在 schema.json enum 内（缺失：${missing.join(',') || '无'}）`)
    ok(extra.length === 0, `schema.json 无注册表外类型（多余：${extra.join(',') || '无'}）`)
    // props 一致性：注册表产出的 JSONL key ⊆ schema props（iconName 序列化为 props.name）
    const schemaProps = Object.keys(schema?.$defs?.props?.properties || {})
    const outputKeyOf = (key) => (key === 'iconName' ? 'name' : key)
    const badProps = Object.keys(PROPS_BY_KEY).filter((k) => !schemaProps.includes(outputKeyOf(k)))
    ok(badProps.length === 0, `注册表字段全部在 schema.json props 内（缺失：${badProps.join(',') || '无'}）`)
  }
}
