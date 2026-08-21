// 画布交互（P1 应用层）：指针 / 键盘 / 滚轮事件 → core/interactions 纯函数 → 副作用执行
// 状态机范式（P3）：决策/计算/结算全在纯函数层，本 hook 只做事件适配与命令执行
import React from 'react'
import { cloneElements } from '../core/model.js'
import {
  decidePointerDown, updateDrag, settleDrag, zoomAt, toLocal,
  MAX_ELEMENTS, PASTE_OFFSET, collectCopySet, buildPaste,
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
  // 空格按住状态同步 ref：mousedown 需读取「按下瞬间」的实时值。
  // 仅靠 state 有闭包滞后风险（keydown 后若 React 尚未重渲染，onMouseDown 捕获的还是旧值）
  const spaceRef = React.useRef(false)
  // 模式同步 ref：长按 Alt 临时进入绘制模式（keydown 同步置 ref，mousedown 实时读取，无闭包滞后）
  const modeRef = React.useRef(mode)
  modeRef.current = mode // 渲染时同步（徽标点击/其他 setMode 路径与 ref 保持一致）
  const altRef = React.useRef(false) // Alt 是否按住（事件瞬间读取）
  const [fullscreen, setFullscreen] = React.useState(false)

  // ---------- 指针 ----------
  const onMouseDown = (ev) => {
    ev.preventDefault()
    // 编辑框打开时点击画布任意位置：自动保存（onChange 已实时应用）并关闭编辑框。
    // 注：preventDefault 会阻止 input 失焦（blur 不触发），必须在此显式关闭
    if (editing) setEditing(null)
    // 点击画布任意位置：右侧设置表单立即失焦（受控组件 value 已实时同步，blur 不丢数据）
    const active = document.activeElement
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      active.blur()
    }
    const rect = svgRef.current.getBoundingClientRect()
    const { x, y } = toLocal(ev, rect, zoom, pan)
    const dec = decidePointerDown({
      elements, mode: modeRef.current, zoom, selectedIds, spaceDown: spaceRef.current, pan, ctrl: ev.ctrlKey,
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
    if (dec.kind === 'groupEdgeResize') {
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
      // resize 对齐吸附虚线（create 无 snaps，[] 亦会清空旧线）
      if (r.snaps) setSnapLines(r.snaps)
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

  // ---------- 全局键盘：Esc / Ctrl+Z / Ctrl+Y / Ctrl+C / Ctrl+V / 空格 / Alt / Delete·Backspace ----------
  React.useEffect(() => {
    if (!open) return
    const isEditable = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
    const onKeyDown = (ev) => {
      if (ev.code === 'Space' && !isEditable(ev.target)) {
        ev.preventDefault()
        spaceRef.current = true // ref 同步更新：mousedown 实时读取，无闭包滞后
        setSpaceDown(true)
        return
      }
      // 长按 Alt = 临时进入绘制模式（松开无条件恢复选择模式）
      if (ev.key === 'Alt' && !isEditable(ev.target)) {
        ev.preventDefault()
        altRef.current = true
        modeRef.current = 'draw' // 同步 ref：按下瞬间即可绘制，无渲染滞后
        setMode('draw')
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
        // 复制：全部选中元素 + 容器/页面内部所有子元素（深拷贝缓冲，样式/设置逐项保留）
        if (selectedIds.length) setCopyBuf(collectCopySet(elements, selectedIds))
        return
      }
      if ((ev.ctrlKey || ev.metaKey) && k === 'v') {
        ev.preventDefault()
        if (!copyBuf || !copyBuf.length) return
        if (elements.length + copyBuf.length > MAX_ELEMENTS) {
          showToast(t('toast.limit', { max: MAX_ELEMENTS }))
          return
        }
        // 粘贴：新 id + 整体小幅位移（横纵都有偏移，避免与原控件重叠）；
        // 组内同位移 → 子元素与容器/页面的相对位置与复制源完全一致
        const copies = buildPaste(copyBuf, PASTE_OFFSET, PASTE_OFFSET)
        commitHistory(cloneElements(elements))
        setElements((els) => els.concat(copies))
        applySelection(copies.map((c) => c.id))
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
    }
    const onKeyUp = (ev) => {
      if (ev.code === 'Space') { spaceRef.current = false; setSpaceDown(false) }
      // 松开 Alt：若 keydown 已进入临时绘制（altRef），则无条件恢复选择模式；
      // 输入框内按 Alt（keydown 跳过）不在此列，避免误切模式
      if (ev.key === 'Alt') {
        if (altRef.current) {
          modeRef.current = 'select'
          setMode('select')
        }
        altRef.current = false
      }
    }
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
    spaceRef.current = false
    altRef.current = false
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
