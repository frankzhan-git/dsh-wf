// JSONL 序列化（注册表驱动）：元素 props → 对象；节点树 → 纯净七字段单行 JSON
// 纯净规则：只输出标准字段，空值省略；direction 仅输出 horizontal（vertical 为默认省略）；
// direction/wrap 仅容器（container/page）携带

import { TYPE_BY_TYPE } from '../types.js'
import { PROPS_BY_KEY } from './props.js'

// 元素 props 序列化：遍历类型注册表的 propsSchema（支持 { key, serialize } 覆盖默认规则，如 progress 的 value 输出数字）
export function serializeProps(el, type) {
  const def = TYPE_BY_TYPE[type]
  if (!def) return {}
  const out = {}
  for (const item of def.propsSchema) {
    const key = typeof item === 'string' ? item : item.key
    const p = PROPS_BY_KEY[key]
    if (!p) continue
    const serialize = typeof item === 'object' && item.serialize ? item.serialize : p.serialize
    const v = serialize(el)
    if (v !== undefined) out[key] = v
  }
  return out
}

// 节点树 → 纯净对象（旧 nodeToJson 等价物）
export function serializeTree(node) {
  const o = { type: node.type }
  if (node.name) o.name = node.name
  if (node.description) o.description = node.description
  if (node.props && Object.keys(node.props).length) o.props = node.props
  if ((node.type === 'container' || node.type === 'page') && node.direction && node.direction !== 'vertical') o.direction = node.direction
  if ((node.type === 'container' || node.type === 'page') && node.wrap) o.wrap = true
  if (node.children && node.children.length) o.children = node.children.map(serializeTree)
  return o
}
