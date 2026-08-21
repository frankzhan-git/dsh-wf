// 控件类型注册表（P2 注册表驱动）：类型定义 + 派生规则
// 新增类型 = 在此注册一条（渲染/预览形态代码除外），不改业务逻辑
// 派生规则（不手写）：canBeParent / typeOptionsFor / 校验容器判定全部由此表推导

import { contains } from './geometry.js'
import { effTypeOf } from './infer.js'

// 完整注册清单（18 项）：page 恒为根且锁定；container 可嵌套任意内容；其余非容器不可嵌套
// 注：propsSchema 仅列 props 字段（direction/wrap 是容器节点级字段，由 pipeline 直接处理，不在此列）
// minW/minH：画布最小尺寸（resize/组缩放统一钳制，避免缩到无法操作/渲染畸形）
// fields：属性面板显式字段清单（引用 InspectorPanel.FIELD_DEFS 键）；显示文本类字段由 propsSchema 驱动显隐
// 字段哲学：只陈述结构内容；媒体/图标/链接的资源与展示细节（src/href/尺寸/播放行为）一律走 description
export const TYPE_REGISTRY = [
  { type: 'page',      label: '页面',     isContainer: true,  isRoot: true, lockType: true, propsSchema: [],                        render: 'page',      preview: 'page',      minW: 32, minH: 24, fields: [] },
  { type: 'container', label: '容器',     isContainer: true,  propsSchema: [],                                                    render: 'container', preview: 'container', minW: 24, minH: 16, fields: [] },
  { type: 'text',      label: '文本',     propsSchema: ['text'],                                                                    render: 'text',      preview: 'text',      minW: 24, minH: 14, fields: [] },
  { type: 'button',    label: '按钮',     propsSchema: ['text', 'action'],                                                          render: 'button',    preview: 'button',    minW: 40, minH: 20, fields: ['action'] },
  { type: 'input',     label: '输入框',   propsSchema: ['placeholder', 'inputType'],                                                render: 'input',     preview: 'input',     minW: 40, minH: 18, fields: ['inputType'] },
  { type: 'textarea',  label: '文本域',   propsSchema: ['placeholder'],                                                             render: 'input',     preview: 'input',     minW: 40, minH: 18, fields: [] },
  { type: 'image',     label: '图片',     propsSchema: [],                                                                           render: 'image',     preview: 'image',     minW: 24, minH: 24, fields: [] },
  { type: 'video',     label: '视频',     propsSchema: [],                                                                           render: 'video',     preview: 'video',     minW: 40, minH: 28, fields: [] },
  { type: 'audio',     label: '音频',     propsSchema: [],                                                                           render: 'audio',     preview: 'audio',     minW: 40, minH: 20, fields: [] },
  { type: 'icon',      label: '图标',     propsSchema: [],                                                                           render: 'icon',      preview: 'icon',      minW: 16, minH: 16, fields: [] },
  { type: 'link',      label: '链接',     propsSchema: ['text'],                                                                     render: 'link',      preview: 'link',      minW: 24, minH: 14, fields: [] },
  { type: 'select',    label: '下拉选择', propsSchema: ['options'],                                                                  render: 'select',    preview: 'select',    minW: 40, minH: 18, fields: ['options'] },
  { type: 'checkbox',  label: '复选框',   propsSchema: [{ key: 'text', label: '标签文字' }, 'checked'],                                 render: 'checkbox',  preview: 'checkbox',  minW: 24, minH: 20, fields: ['checked'] },
  { type: 'radio',     label: '单选框',   propsSchema: [{ key: 'text', label: '标签文字' }, 'checked'],                                 render: 'radio',     preview: 'radio',     minW: 24, minH: 20, fields: ['checked'] },
  { type: 'switch',    label: '开关',     propsSchema: ['checked'],                                                                 render: 'switch',    preview: 'switch',    minW: 40, minH: 20, fields: ['checked'] },
  { type: 'progress',  label: '进度条',   propsSchema: [],                                                                           render: 'progress',  preview: 'progress',  minW: 40, minH: 12, fields: [] },
  { type: 'divider',   label: '分割线',   propsSchema: [],                                                                           render: 'divider',   preview: 'divider',   minW: 16, minH: 8,  fields: [] },
  { type: 'badge',     label: '徽标',     propsSchema: ['text'],                                                                     render: 'badge',     preview: 'badge',     minW: 24, minH: 16, fields: [] },
]

export const TYPE_BY_TYPE = Object.fromEntries(TYPE_REGISTRY.map((t) => [t.type, t]))

export const ALL_TYPES = TYPE_REGISTRY.map((t) => t.type)

// 类型中文标签（属性面板 / 右键菜单共用；由注册表派生，不再手写）
export const TYPE_LABEL = Object.fromEntries(TYPE_REGISTRY.map((t) => [t.type, t.label]))

// 是否为容器（container / page）
export const isContainerType = (t) => {
  const d = TYPE_BY_TYPE[t]
  return !!(d && d.isContainer)
}

// 父资格（构建嵌套时）：显式 container / page / 未显式类型的矩形（将按子元素推断为容器）可为父；
// 显式非容器不可为父——被其「包含」的子元素穿透提升到其父级
export function canBeParent(el) {
  return el.type === 'container' || el.type === 'page' || !el.type
}

// 元素可选的类型列表（属性面板 / 右键菜单）：按嵌套/子元素状态过滤
// 规则：page 锁定不可改；被包含不可设 page；有子不可设非容器
export function typeOptionsFor(el, elements) {
  if (!el) return []
  if (el.type === 'page') return [] // 页面类型锁定
  const nested = elements.some((o) => o.id !== el.id && contains(o, el))
  const hasKids = elements.some((o) => o.id !== el.id && contains(el, o))
  let types = ALL_TYPES.slice()
  if (nested) types = types.filter((t) => t !== 'page')
  if (hasKids) types = types.filter((t) => t === 'container' || t === 'page')
  return types
}

// 元素最小尺寸（resize/组缩放统一钳制）：按有效类型注册表取值，kind 特判单独设定
export function minSizeOf(elements, el) {
  if (el.kind === 'arrow') return { w: 8, h: 8 }
  if (el.kind === 'note') return { w: 40, h: 24 }
  if (el.kind === 'text') return { w: 24, h: 14 }
  const et = effTypeOf(elements, el)
  const d = TYPE_BY_TYPE[et]
  return { w: (d && d.minW) || 24, h: (d && d.minH) || 16 }
}
