// 画板开关订阅 Hook（SketchButton 与 SketchModal 共用）
// 与 core/store.js 分离：core 保持零 React，React 相关放在 hooks/ 层
import React from 'react'
import { store, subscribe } from '../core/store.js'

export function useOpen() {
  const [open, set] = React.useState(store.open)
  React.useEffect(() => subscribe(set), [])
  return open
}
