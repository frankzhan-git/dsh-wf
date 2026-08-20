// dsh-wf client half —— 正式插件入口（esbuild 构建为 ModuleLoader bundle）
// 装配层：样式注入 + 两个槽位注册 + 宿主存储探测（P6：DSH 知识仅在此层）
// 入口位置：会话输入框工具行左端（conversation.input.left）+ 输入框浮层（conversation.input.overlay）。
// 存储后端：client.js apply 时同步探测 /api/wf-storage（宿主半 lib/index.js 注册）；
// 可用 → defaultStore(hostRpc) 缓存 hostFile 适配器（正式发布形态）；不可用 → 降级 localStorage（现役默认）。
import React from 'react'
import { WF_CSS } from './css/index.js'
import { SketchButton } from './components/SketchButton.js'
import { SketchModal } from './components/SketchModal.js'
import { probeHostRpc } from './core/storage/rpc.js'
import { defaultStore } from './core/storage/index.js'

const el = React.createElement

export default {
  name: 'dsh-wf',
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    const styleEl = document.createElement('style')
    styleEl.textContent = WF_CSS
    document.head.appendChild(styleEl)
    ctx.effect(() => () => { if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl) })

    // 宿主存储探测（同步，仅初始化一次）：路由就绪 → 存储自动升级为 hostFile
    const hostRpc = probeHostRpc()
    if (hostRpc) defaultStore(hostRpc)

    // 输入框工具行左端的小按钮（order 5：位于 resident chrome 之后、其它插件条目之前）
    slots.inject('conversation.input.left', () => slots.register(
      { name: 'conversation.input.left', id: 'wf-button', order: 5, label: '草图' },
      () => el(SketchButton, null),
    ))

    // 画板浮层：锚定输入框区域的浮动层，关闭时渲染 null
    slots.inject('conversation.input.overlay', () => slots.register(
      { name: 'conversation.input.overlay', id: 'wf-panel', order: 5 },
      (props) => el(SketchModal, props),
    ))
  },
}
