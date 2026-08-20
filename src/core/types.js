// 控件类型注册表（P2 注册表驱动）：类型定义 + 派生规则
// 新增类型 = 在此注册一条（渲染/预览形态代码除外），不改业务逻辑
// 派生规则（不手写）：canBeParent / typeOptionsFor / 校验容器判定全部由此表推导

import { contains, numOr } from './geometry.js'

// 完整注册清单（18 项）：page 恒为根且锁定；container 可嵌套任意内容；其余非容器不可嵌套
// 注：propsSchema 仅列 props 字段（direction/wrap 是容器节点级字段，由 pipeline 直接处理，不在此列）
export const TYPE_REGISTRY = [
  { type: 'page',      label: '页面',     isContainer: true,  isRoot: true, lockType: true, propsSchema: [],                        render: 'page',      preview: 'page' },
  { type: 'container', label: '容器',     isContainer: true,  propsSchema: [],                                                    render: 'container', preview: 'container' },
  { type: 'text',      label: '文本',     propsSchema: ['text'],                                                                    render: 'text',      preview: 'text' },
  { type: 'button',    label: '按钮',     propsSchema: ['text', 'action'],                                                          render: 'button',    preview: 'button' },
  { type: 'input',     label: '输入框',   propsSchema: ['placeholder', 'value', 'inputType'],                                       render: 'input',     preview: 'input' },
  { type: 'textarea',  label: '文本域',   propsSchema: ['placeholder', 'value'],                                                    render: 'input',     preview: 'input' },
  { type: 'image',     label: '图片',     propsSchema: ['src', 'alt'],                                                              render: 'image',     preview: 'image' },
  { type: 'video',     label: '视频',     propsSchema: ['src', 'poster', 'autoplay'],                                               render: 'video',     preview: 'video' },
  { type: 'audio',     label: '音频',     propsSchema: ['src', 'controls'],                                                         render: 'audio',     preview: 'audio' },
  { type: 'icon',      label: '图标',     propsSchema: ['iconName', 'size'],                                                        render: 'icon',      preview: 'icon' },
  { type: 'link',      label: '链接',     propsSchema: ['text', 'href'],                                                            render: 'link',      preview: 'link' },
  { type: 'select',    label: '下拉选择', propsSchema: ['options', 'value'],                                                        render: 'select',    preview: 'select' },
  { type: 'checkbox',  label: '复选框',   propsSchema: ['label', 'checked'],                                                        render: 'checkbox',  preview: 'checkbox' },
  { type: 'radio',     label: '单选框',   propsSchema: ['label', 'checked', 'options', 'value'],                                    render: 'radio',     preview: 'radio' },
  { type: 'switch',    label: '开关',     propsSchema: ['checked'],                                                                 render: 'switch',    preview: 'switch' },
  { type: 'progress',  label: '进度条',   propsSchema: [{ key: 'value', serialize: (el) => numOr(el.value) }, 'max'],               render: 'progress',  preview: 'progress' },
  { type: 'divider',   label: '分割线',   propsSchema: [],                                                                           render: 'divider',   preview: 'divider' },
  { type: 'badge',     label: '徽标',     propsSchema: ['text'],                                                                     render: 'badge',     preview: 'badge' },
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
