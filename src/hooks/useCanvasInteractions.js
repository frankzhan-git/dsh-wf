// 画布交互（P1 应用层）：指针 / 键盘 / 滚轮事件 → core/interactions 纯函数 → 副作用执行
// 状态机范式（P3）：决策/计算/结算全在纯函数层，本 hook 只做事件适配与命令执行
import React from 'react'
import { cloneElements, nextId } from '../core/model.js'
import {
  decidePointerDown, updateDrag, settleDrag, zoomAt, toLocal,
  MAX_ELEMENTS,
} from '../core/interactions.js'
import { setOpen } from '../core/store.js'
import { t } from '../i18n/index.js'

export function useCanvasInteractions(deps) {
  const {
    open, elements, setElements, selectedIds, applySelection, commitHistory,
    mode, setMode, editing, setEditing, copyBuf, setCopyBuf, undo, redo,
    removeSel, showToast, svgRef, viewRef,
  } = deps

  const [zoom, setZoom] = React.useState(1)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [drag, setDrag] = React.useState(null)
  const [snapLines, setSnapLines] = React.useState([])
  const [spaceDown, setSpaceDown] = React.useState(false)
  const [fullscreen, setFullscreen] = React.useState(false)

  // ---------- 指针 ----------
  const onMouseDown = (ev) => {
    ev.preventDefault()
    const rect = svgRef.current.getBoundingClientRect()
    const { x, y } = toLocal(ev, rect, zoom, pan)
    const dec = decidePointerDown({
      elements, mode, zoom, selectedIds, spaceDown, pan, ctrl: ev.ctrlKey,
    }, x, y, ev.clientX, ev.clientY)
    if (dec.kind === 'pan') { setDrag(dec.drag); return }
    if (dec.kind === 'select') { applySelection(dec.ids); return }
    if (dec.kind === 'toggle') { applySelection(dec.ids); return }
    if (dec.kind === 'move' || dec.kind === 'resize') {
      if (dec.sel) applySelection(dec.sel)
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }))
      return
    }
    if (dec.kind === 'groupResize') {
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }))
      return
    }
    if (dec.kind === 'marquee') {
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }))
      applySelection([])
      return
    }
    if (dec.kind === 'limit') {
      showToast(t('toast.limit', { max: MAX_ELEMENTS }))
      return
    }
    if (dec.kind === 'create') {
      applySelection([])
      setElements((els) => els.concat([dec.element]))
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }))
      return
    }
  }

  const onMouseMove = (ev) => {
    if (!drag) return
    const rect = svgRef.current.getBoundingClientRect()
    const { x, y } = toLocal(ev, rect, zoom, pan)
    const r = updateDrag({ elements, zoom, selectedIds, rect }, drag, x, y, ev.clientX, ev.clientY)
    if (r.pan) { setPan(r.pan); return }
    if (r.patch) {
      const targetId = drag.mode === 'create' ? drag.tmpId : drag.id
      setElements((els) => els.map((e) => (e.id === targetId ? Object.assign({}, e, r.patch) : e)))
      return
    }
    if (r.patches) {
      const pm = new Map(r.patches.map((p) => [p.id, p]))
      setElements((els) => els.map((e) => (pm.has(e.id) ? Object.assign({}, e, pm.get(e.id)) : e)))
      if (r.snaps) setSnapLines(r.snaps)
      // 记录本帧累计位移（多帧拖动增量跟随：computeMove 用 lastDx/lastDy 计算每帧增量）
      if (r.lastDx !== undefined) setDrag((d) => (d ? Object.assign({}, d, { lastDx: r.lastDx, lastDy: r.lastDy }) : d))
      return
    }
    if (r.nextDrag) { setDrag(r.nextDrag); return }
  }

  // 创建收尾（mouseup/mouseleave 归一）；settleDrag 基于当前最新 elements 计算
  const endDrag = () => {
    if (!drag) return
    const r = settleDrag({ elements }, drag)
    if (r.remove) {
      const rm = new Set(r.remove)
      setElements((els) => els.filter((e) => !rm.has(e.id)))
    } else if (r.patch) {
      const p = r.patch
      setElements((els) => els.map((e) => (e.id === p.id ? p : e)))
    }
    if (r.selection) applySelection(r.selection)
    else if (drag.mode === 'create') applySelection([drag.tmpId])
    if (r.commit && drag.prev) commitHistory(drag.prev)
    setDrag(null)
    setSnapLines([]) // 拖动结束清除对齐虚线
  }

  // ---------- 全局键盘：Esc / Ctrl+Z / Ctrl+Y / Ctrl+C / Ctrl+V / V / 空格 / Delete·Backspace ----------
  React.useEffect(() => {
    if (!open) return
    const isEditable = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
    const onKeyDown = (ev) => {
      if (ev.code === 'Space' && !isEditable(ev.target)) {
        ev.preventDefault()
        setSpaceDown(true)
        return
      }
      if (ev.key === 'Escape') {
        // 全屏模式下 Esc 先退出全屏，再按一次关闭弹窗
        if (fullscreen) setFullscreen(false)
        else setOpen(false)
        return
      }
      // 输入控件聚焦：组合键交给浏览器（输入框内撤销/复制/粘贴）
      if (isEditable(ev.target)) return
      const k = ev.key.toLowerCase()
      if ((ev.ctrlKey || ev.metaKey) && k === 'z') {
        ev.preventDefault()
        if (ev.shiftKey) redo()
        else undo()
        return
      }
      if ((ev.ctrlKey || ev.metaKey) && k === 'y') {
        ev.preventDefault(); redo(); return
      }
      if ((ev.ctrlKey || ev.metaKey) && k === 'c') {
        ev.preventDefault()
        if (selectedId) {
          const e = elements.find((x) => x.id === selectedId)
          if (e) setCopyBuf(cloneElements([e])[0])
        }
        return
      }
      if ((ev.ctrlKey || ev.metaKey) && k === 'v') {
        ev.preventDefault()
        if (copyBuf && elements.length < MAX_ELEMENTS) {
          const c = cloneElements([copyBuf])[0]
          c.id = nextId()
          c.x += 24
          c.y += 24
          commitHistory(cloneElements(elements))
          setElements((els) => els.concat([c]))
          applySelection([c.id])
        }
        return
      }
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return
      // 单键（无修饰键）
      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        ev.preventDefault()
        if (editing) { setEditing(null); return }
        if (selectedIds.length) removeSel()
        return
      }
      if (k === 'v') {
        ev.preventDefault()
        setMode((m) => (m === 'select' ? 'draw' : 'select'))
        applySelection([])
        return
      }
    }
    const onKeyUp = (ev) => { if (ev.code === 'Space') setSpaceDown(false) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  })

  // ---------- 滚轮缩放（原生监听以支持 preventDefault）；中心锚点缩放 ----------
  React.useEffect(() => {
    if (!open) return
    const view = viewRef.current
    if (!view) return
    const onWheel = (ev) => {
      ev.preventDefault()
      const factor = ev.deltaY < 0 ? 1.1 : 1 / 1.1
      const r = zoomAt(factor, zoom, pan)
      setZoom(r.zoom)
      setPan(r.pan)
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => view.removeEventListener('wheel', onWheel)
  })

  // ---------- 关闭清理：不留拖拽/平移残留 ----------
  React.useEffect(() => {
    if (open) return
    setDrag(null)
    setSpaceDown(false)
    setSnapLines([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canvasCursor = spaceDown ? (drag && drag.mode === 'pan' ? 'grabbing' : 'grab') : (mode === 'draw' ? 'crosshair' : 'default')

  return {
    zoom, pan, setZoom, setPan, drag, snapLines, spaceDown, fullscreen, setFullscreen,
    canvasCursor, onMouseDown, onMouseMove, onMouseUp: endDrag, onMouseLeave: endDrag,
  }
}
