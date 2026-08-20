// 核心状态容器（P1 应用层）：elements / 选中 / 撤销重做 / 复制缓冲 / 文档标识
// elements 是唯一事实源（P4）；派生（tree/jsonl/issues）由调用方 useMemo 计算
import React from 'react'
import { cloneElements } from '../core/model.js'

const HISTORY_MAX = 50

export function useSketchState(init) {
  const [elements, setElements] = React.useState(init.elements)
  const [rootName, setRootName] = React.useState(init.rootName)
  const [mode, setMode] = React.useState('select') // 'select' | 'draw'
  const [selectedIds, setSelectedIds] = React.useState([])
  const [selectedId, setSelectedId] = React.useState(null) // 主选中（= 多选集最后一个）
  const [past, setPast] = React.useState([])
  const [future, setFuture] = React.useState([])
  const [copyBuf, setCopyBuf] = React.useState(null)
  const [currentId, setCurrentId] = React.useState(init.currentId) // null = 未保存的新画布
  const currentIdRef = React.useRef(init.currentId)

  // 统一选中入口：多选集与主选中同步
  const applySelection = React.useCallback((ids) => {
    setSelectedIds(ids)
    setSelectedId(ids.length ? ids[ids.length - 1] : null)
  }, [])

  const setCurrent = React.useCallback((id) => { currentIdRef.current = id; setCurrentId(id) }, [])

  const commitHistory = React.useCallback((before) => {
    setPast((p) => (p.length >= HISTORY_MAX ? p.slice(1) : p).concat([before]))
    setFuture([])
  }, [])

  const undo = React.useCallback(() => {
    setPast((p) => {
      if (!p.length) return p
      const prev = p[p.length - 1]
      setFuture((f) => (f.length >= HISTORY_MAX ? f.slice(0, HISTORY_MAX - 1) : f).concat([cloneElements(elements)]))
      setElements(prev)
      applySelection([])
      return p.slice(0, -1)
    })
  }, [elements, applySelection])

  const redo = React.useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f
      const next = f[0]
      setPast((p) => (p.length >= HISTORY_MAX ? p.slice(1) : p).concat([cloneElements(elements)]))
      setElements(next)
      applySelection([])
      return f.slice(1)
    })
  }, [elements, applySelection])

  return {
    elements, setElements,
    rootName, setRootName,
    mode, setMode,
    selectedIds, selectedId, applySelection,
    past, setPast, future, setFuture, undo, redo,
    copyBuf, setCopyBuf,
    currentId, setCurrent, currentIdRef,
    commitHistory,
  }
}
