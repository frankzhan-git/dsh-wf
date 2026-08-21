// JSONL 字段注册表（P2 注册表驱动）：每个 props 字段的序列化规则内聚
// serialize(el) 返回 undefined 表示省略（空值省略原则④；name 遵守原则⑥：仅用户设置时输出）
// 字段哲学：只陈述「结构内容」（文字/选项/选中态/行为/输入类型）。
// 运行态与实现细节（资源地址/尺寸/播放行为/默认值/进度值）一律走 description——那是需求不是结构

import { parseOptions, numOr, strOrUndef } from '../geometry.js'

export const PROPS_REGISTRY = [
  { key: 'text',        type: 'string',  label: '文本',     serialize: (el) => strOrUndef(el.text) },
  { key: 'placeholder', type: 'string',  label: '占位提示', serialize: (el) => strOrUndef(el.text) },
  { key: 'inputType',   type: 'enum',    label: '输入类型', values: ['text', 'password', 'number', 'email', 'tel', 'url', 'search'], serialize: (el) => el.inputType || undefined },
  { key: 'options',     type: 'array',   label: '选项',     serialize: (el) => { const o = parseOptions(el.optionsText); return o.length ? o : undefined } },
  { key: 'action',      type: 'string',  label: '动作',     serialize: (el) => strOrUndef(el.action) },
  { key: 'checked',     type: 'boolean', label: '默认选中', serialize: (el) => (el.checked ? true : undefined) },
]

export const PROPS_BY_KEY = Object.fromEntries(PROPS_REGISTRY.map((p) => [p.key, p]))
