// JSONL 字段注册表（P2 注册表驱动）：每个 props 字段的序列化规则内聚
// serialize(el) 返回 undefined 表示省略（空值省略原则④；name/iconName 遵守原则⑥：仅用户设置时输出）
// 注：iconName 序列化为 JSONL 的 props.name（图标名），与顶层 name（用户标识）不同义，二者不混用

import { parseOptions, numOr, cut, strOrUndef } from '../geometry.js'

export const PROPS_REGISTRY = [
  { key: 'text',        type: 'string',  label: '文本',     serialize: (el) => strOrUndef(el.text) },
  { key: 'placeholder', type: 'string',  label: '占位提示', serialize: (el) => strOrUndef(el.text) },
  { key: 'value',       type: 'any',     label: '默认值',   serialize: (el) => strOrUndef(el.value) },
  { key: 'inputType',   type: 'enum',    label: '输入类型', values: ['text', 'password', 'number', 'email', 'tel', 'url', 'search'], serialize: (el) => el.inputType || undefined },
  { key: 'options',     type: 'array',   label: '选项',     serialize: (el) => { const o = parseOptions(el.optionsText); return o.length ? o : undefined } },
  { key: 'action',      type: 'string',  label: '动作',     serialize: (el) => strOrUndef(el.action) },
  { key: 'src',         type: 'string',  label: '地址',     serialize: (el) => el.src || undefined },
  { key: 'alt',         type: 'string',  label: '替代文本', serialize: (el) => strOrUndef(el.alt) },
  { key: 'poster',      type: 'string',  label: '封面',     serialize: (el) => strOrUndef(el.poster) },
  { key: 'autoplay',    type: 'boolean', label: '自动播放', serialize: (el) => (el.autoplay ? true : undefined) },
  { key: 'controls',    type: 'boolean', label: '控制条',   serialize: (el) => (el.controls ? true : undefined) },
  { key: 'href',        type: 'string',  label: '链接地址', serialize: (el) => strOrUndef(el.href) },
  { key: 'label',       type: 'string',  label: '标签文字', serialize: (el) => strOrUndef(el.label) },
  { key: 'checked',     type: 'boolean', label: '默认选中', serialize: (el) => (el.checked ? true : undefined) },
  { key: 'max',         type: 'number',  label: '最大值',   serialize: (el) => numOr(el.max) },
  { key: 'size',        type: 'number',  label: '图标尺寸', serialize: (el) => numOr(el.iconSize) },
  { key: 'iconName',    type: 'string',  label: '图标名',   serialize: (el) => cut(el.text) || undefined },
]

export const PROPS_BY_KEY = Object.fromEntries(PROPS_REGISTRY.map((p) => [p.key, p]))
