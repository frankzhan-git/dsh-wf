// 右栏（右侧面板）编排层：
// 控件设置 + 高度拖拽触发区（画布历史 title 栏上边）+ 画布历史（高度可拖动、列表滚动）
// 拖拽状态在此维护，展示委托给 InspectorPanel / DocumentPanel（纯展示）
import React from 'react'
import { InspectorPanel } from './inspector/InspectorPanel.js'
import { DocumentPanel } from './history/DocumentPanel.js'

const el = React.createElement

const HIST_MIN = 80          // 画布历史最小高度
const HIST_DEFAULT = 180     // 默认高度
const HIST_KEY = 'wf.histH'  // 高度持久化（localStorage）

export function RightPanel(props) {
  const {
    sel, selCount, selHasKids, selIsNested, selTypeOptions, selTypeLabel, onPatch, onRemove,
    docs, currentId, onLoad, onDelete, onRename, onExport, onImport,
  } = props
  // 画布历史高度：首次打开从 localStorage 恢复，随后拖动实时更新并持久化
  const [histH, setHistH] = React.useState(() => {
    try {
      const v = Number(localStorage.getItem(HIST_KEY))
      return Number.isFinite(v) && v >= HIST_MIN ? v : HIST_DEFAULT
    } catch (e) { return HIST_DEFAULT }
  })
  const [dragging, setDragging] = React.useState(false)
  const rightRef = React.useRef(null)
  const dragRef = React.useRef(null) // { startY, startH, maxH }

  React.useEffect(() => {
    try { localStorage.setItem(HIST_KEY, String(histH)) } catch (e) { /* 存储不可用则忽略 */ }
  }, [histH])

  // 拖拽开始：指针捕获到触发区上，记录起点高度与上限（保证属性面板至少留 ~170px）
  const startResize = (ev) => {
    ev.preventDefault()
    const right = rightRef.current
    if (!right || !ev.currentTarget.setPointerCapture) return
    ev.currentTarget.setPointerCapture(ev.pointerId)
    dragRef.current = {
      startY: ev.clientY,
      startH: histH,
      maxH: Math.max(HIST_MIN, right.clientHeight - 170),
    }
    setDragging(true)
  }
  const moveResize = (ev) => {
    const d = dragRef.current
    if (!d) return
    setHistH(Math.max(HIST_MIN, Math.min(d.maxH, d.startH + (d.startY - ev.clientY))))
  }
  const endResize = () => { dragRef.current = null; setDragging(false) }

  return el('div', { ref: rightRef, className: 'wf-right' + (dragging ? ' wf-resizing' : '') },
    el(InspectorPanel, {
      sel, selCount, selHasKids, selIsNested, selTypeOptions, selTypeLabel, onPatch, onRemove,
    }),
    // 高度拖拽触发区：画布历史 title 栏上边（无视觉横线，仅 hover 显示 ns-resize 光标）
    el('div', {
      className: 'wf-resizer',
      title: '拖动调整画布历史高度',
      onPointerDown: startResize,
      onPointerMove: moveResize,
      onPointerUp: endResize,
      onPointerCancel: endResize,
    }),
    el(DocumentPanel, {
      docs, currentId, onLoad, onDelete, onRename, onExport, onImport,
      height: histH,
    }),
  )
}
