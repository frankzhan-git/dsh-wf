// 浮动提示 Toast（纯展示）：自动消失由 useToasts 调度，本组件只渲染
import React from 'react'

const el = React.createElement

export function Toast({ toast }) {
  if (!toast) return null
  return el('div', { key: toast.key, className: 'wf-toast wf-toast-' + (toast.type || 'error') }, toast.text)
}
