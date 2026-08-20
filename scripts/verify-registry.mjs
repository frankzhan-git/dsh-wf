// 验证脚本：注册表完整性（P2）
// 用法：node scripts/verify-registry.mjs
import { TYPE_REGISTRY, TYPE_BY_TYPE, ALL_TYPES, TYPE_LABEL, isContainerType, canBeParent, typeOptionsFor } from '../src/core/types.js'
import { PROPS_REGISTRY, PROPS_BY_KEY } from '../src/core/jsonl/props.js'
import { serializeProps } from '../src/core/jsonl/serializer.js'
import { validateTree, validateJsonl } from '../src/core/jsonl/validator.js'
import { createElement } from '../src/core/model.js'
import { TYPE_LABEL as OLD_TYPE_LABEL } from '../src/components/common/typeLabels.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 注册表结构 ----------
section('注册表结构')
ok(TYPE_REGISTRY.length === 18, '18 个控件类型')
ok(new Set(ALL_TYPES).size === 18, '类型无重复')
ok(TYPE_REGISTRY.every((t) => t.label && typeof t.label === 'string'), '每个类型有中文标签')
ok(TYPE_REGISTRY.every((t) => Array.isArray(t.propsSchema)), '每个类型有 propsSchema')
ok(TYPE_REGISTRY.every((t) => t.render && t.preview), '每个类型有 render/preview 分派键')
ok(Object.keys(TYPE_BY_TYPE).length === 18, 'TYPE_BY_TYPE 索引完整')

// 注册表与现有手写 TYPE_LABEL 一致（标签派生化，无手写表）
ok(JSON.stringify(TYPE_LABEL) === JSON.stringify(OLD_TYPE_LABEL), 'TYPE_LABEL 与旧手写表逐项一致')

// ---------- 字段注册表完整性 ----------
section('字段注册表')
ok(PROPS_REGISTRY.length === 17, '17 个 JSONL 字段')
ok(new Set(PROPS_REGISTRY.map((p) => p.key)).size === 17, '字段 key 无重复')
ok(PROPS_REGISTRY.every((p) => typeof p.serialize === 'function'), '每个字段有序列化函数')
ok(PROPS_REGISTRY.filter((p) => p.type === 'enum').every((p) => Array.isArray(p.values) && p.values.length), 'enum 字段有合法值域')

// 每个类型的 propsSchema（含覆盖对象）key 都注册过
{
  const bad = []
  for (const t of TYPE_REGISTRY) {
    for (const item of t.propsSchema) {
      const key = typeof item === 'string' ? item : item.key
      if (!PROPS_BY_KEY[key]) bad.push(`${t.type}.${key}`)
    }
  }
  ok(bad.length === 0, `propsSchema 全部在字段注册表内（${bad.length ? bad.join(',') : '无缺失'}）`)
}

// ---------- 容器派生 ----------
section('容器派生')
ok(isContainerType('page') && isContainerType('container'), 'page/container 是容器')
ok(!isContainerType('button') && !isContainerType('text'), 'button/text 不是容器')
{
  const page = createElement({ kind: 'rect', type: 'page' }, 0, 0, 100, 100)
  const cont = createElement({ kind: 'rect', type: 'container' }, 0, 0, 100, 100)
  const btn = createElement({ kind: 'rect', type: 'button' }, 0, 0, 100, 100)
  const auto = createElement({ kind: 'rect' }, 0, 0, 100, 100)
  ok(canBeParent(page) && canBeParent(cont), '显式容器可为父')
  ok(!canBeParent(btn), '显式非容器不可为父（children 穿透）')
  ok(canBeParent(auto), '未显式类型可为父（按子元素推断容器）')
}

// ---------- typeOptionsFor 规则 ----------
section('typeOptionsFor')
{
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  page.name = '登录页'
  els.push(page)
  // btn 在 page 内、无子元素 → 仅命中「被包含」规则
  const btn = createElement({ kind: 'rect' }, 60, 60, 300, 40)
  btn.text = '登录'
  btn.type = 'button'
  els.push(btn)
  // cont 在 page 内、包含 child → 命中「被包含 + 有子」规则
  const cont = createElement({ kind: 'rect' }, 60, 140, 300, 200)
  cont.type = 'container'
  els.push(cont)
  const child = createElement({ kind: 'rect' }, 80, 150, 40, 20)
  child.type = 'text'
  els.push(child)

  // cont2 在 page 外、包含 child2 → 仅命中「有子」规则（不被包含）
  const cont2 = createElement({ kind: 'rect' }, 900, 20, 300, 200)
  cont2.type = 'container'
  els.push(cont2)
  const child2 = createElement({ kind: 'rect' }, 920, 40, 40, 20)
  child2.type = 'text'
  els.push(child2)

  ok(typeOptionsFor(page, els).length === 0, '页面类型锁定：无可选类型')
  const btnOpts = typeOptionsFor(btn, els)
  ok(btnOpts.includes('button') && !btnOpts.includes('page'), '被包含元素：可选列表排除 page')
  const contOpts = typeOptionsFor(cont, els)
  ok(contOpts.length === 1 && contOpts.includes('container'), '被包含且有子：仅 container 可选（page 已排除）')
  const cont2Opts = typeOptionsFor(cont2, els)
  ok(cont2Opts.length === 2 && cont2Opts.includes('container') && cont2Opts.includes('page'), '有子元素（不被包含）：仅容器类可选')
  ok(typeOptionsFor(null, els).length === 0, '无元素返回空列表')
}

// ---------- 序列化规则（注册表驱动，含 per-type 覆盖） ----------
section('序列化规则')
{
  const pv = createElement({ kind: 'rect' }, 0, 0, 100, 10)
  pv.type = 'progress'
  pv.value = '60'
  pv.max = '100'
  const pvProps = serializeProps(pv, 'progress')
  ok(pvProps.value === 60 && pvProps.max === 100, 'progress 覆盖规则：value/max 输出数字')

  const inp = createElement({ kind: 'rect' }, 0, 0, 100, 30)
  inp.type = 'input'
  inp.text = '请输入'
  inp.value = '12'
  const inpProps = serializeProps(inp, 'input')
  ok(inpProps.value === '12', 'input 默认规则：value 输出字符串')

  const icon = createElement({ kind: 'rect' }, 0, 0, 20, 20)
  icon.type = 'icon'
  const iconProps = serializeProps(icon, 'icon')
  ok(!('iconName' in iconProps) && !('name' in iconProps), 'icon 未设置图标名：省略（无默认 star，原则④⑥）')
  icon.text = 'star'
  const iconProps2 = serializeProps(icon, 'icon')
  ok(iconProps2.iconName === 'star' && !('name' in iconProps2), 'icon 设置后输出 iconName（→ props.name），不污染顶层 name')
}

// ---------- 校验器（注册表驱动） ----------
section('校验器')
{
  const bad = { type: 'button', children: [{ type: 'text' }] }
  ok(validateTree(bad).some((i) => i.message.includes('非容器类型不应包含子节点')), '非容器带 children → error（注册表推导）')
  ok(validateTree({ type: 'nope' }).some((i) => i.message.includes('不在标准内')), '未知类型 → error')
  ok(validateTree({ type: 'container', direction: 'diag' }).some((i) => i.message.includes('direction 仅允许')), '非法 direction → error')
  ok(validateTree({ type: 'container', wrap: 'yes' }).some((i) => i.message.includes('wrap 必须是布尔值')), '非布尔 wrap → error')
  ok(validateTree({ type: 'container', children: [{ type: 'button' }] }).length === 0, '合法树无 issue')
  ok(validateTree(null).some((i) => i.message.includes('画布为空')), '空树 → 画布为空')
  const jl = validateJsonl('{"type":"container"}\nnot-json')
  ok(jl.some((i) => i.message.includes('第 2 行')), 'JSONL 逐行容错：非法行收集为 issue 不抛')
  ok(validateJsonl('{"type":"container"}').length === 0, '合法 JSONL 无 issue')
}
