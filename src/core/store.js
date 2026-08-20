// 跨组件共享的轻量会话状态（纯 JS，零 React 依赖）
// 只承载画板开关；草图数据在 SketchModal 内部管理（随用随关，不记忆）
// React 订阅 Hook 见 src/hooks/useOpen.js

export const store = { open: false }

const listeners = new Set()
export const subscribe = (fn) => { listeners.add(fn); return () => { listeners.delete(fn) } }
export const setOpen = (open) => {
  store.open = open
  listeners.forEach((fn) => fn(open))
}
