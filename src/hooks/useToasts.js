// Toast 提示（浮动、自动消失）：所有提示统一走 showToast，不占用弹窗布局
import React from 'react'

export function useToasts(open) {
  const [toast, setToast] = React.useState(null) // { text, type: 'error'|'info', key }
  const toastTimer = React.useRef(null)
  const showToast = React.useCallback((text, type) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ text, type: type || 'error', key: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])
  // 关闭弹窗时清理 Toast，重开不留残留
  React.useEffect(() => {
    if (open) return
    setToast(null)
    if (toastTimer.current) { clearTimeout(toastTimer.current); toastTimer.current = null }
  }, [open])
  return { toast, showToast }
}
