// 画布管理（P1 应用层）：自动保存（dirty 增量管线）/ 新建 / 载入 / 删除 / 重命名 / 导出 / 导入
// 存储全部走 CanvasStore 接口（P7）：localStorage 适配器现役，未来 IndexedDB/宿主 SQLite 零改动
// dirty 增量：与 lastSavedRef 快照 diff → 800ms 防抖 → saveBody({ set, remove })（只写变更元素）
import React from 'react'
import { cloneElements, createElement } from '../core/model.js'
import { defaultStore, exportCanvasFile, importCanvasFile } from '../core/storage/index.js'
import { genCanvasId } from '../core/storage/schema.js'
import { t } from '../i18n/index.js'

const AUTO_SAVE_MS = 800
const LIST_PAGE = { page: 0, pageSize: 100 }

// 预置页面工厂：新画布/清空后恢复一个空页面根容器
// （页面 = 一个设计稿 = JSONL 一行根；打开时优先显示上次画布，空时才预置）
export function freshPage() {
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)
  return [page]
}

// 打开时显示上一次画布（最近保存的文档），不自动新建；新建由用户手动执行
// 走适配器同步变体（localStorage 能力）：打开画布同步初始化，避免闪屏
export function initLast() {
  const store = defaultStore()
  if (!store.sync) return null
  const docs = store.sync.listMeta()
  if (docs.length) {
    const body = store.sync.loadBody(docs[0].id)
    if (body && body.elements.length) {
      return { els: cloneElements(body.elements), root: docs[0].name, id: docs[0].id }
    }
  }
  return null
}

export function useCanvasManager(deps) {
  const {
    open, result, elements, setElements, rootName, setRootName,
    currentId, setCurrent, currentIdRef, applySelection, commitHistory,
    setPast, setFuture, setCopyBuf, setEditing, setMenu, setTypeMenu,
    setZoom, setPan, setSnapLines, showToast, lastSavedInit,
  } = deps

  const storeRef = React.useRef(null)
  const [docs, setDocs] = React.useState([]) // 文档列表（meta，按 updatedAt 倒序）
  const [floatTab, setFloatTab] = React.useState(null) // 画布内悬浮面板：null | 'jsonl' | 'preview'
  const saveTimer = React.useRef(null)
  // dirty 增量基准：上次保存的 elements 快照（deep）；初始 = 打开时的画布内容
  const lastSavedRef = React.useRef(lastSavedInit ? cloneElements(lastSavedInit) : null)

  // 异步文档列表（初始 + 变更后刷新）
  const refreshDocs = React.useCallback(async () => {
    const r = await storeRef.current.listMeta(LIST_PAGE)
    setDocs(r.items)
  }, [])

  // ---------- 自动保存（diff 增量 → saveMeta + saveBody） ----------
  const flushSave = React.useCallback(async () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    if (!result.jsonl) return // 空画布（含仅空页面）不保存
    try {
      const s = storeRef.current
      const id = currentIdRef.current || genCanvasId()
      // diff：与上次保存快照比较（新增/修改 → set；消失 → remove）
      const prev = lastSavedRef.current
      const set = {}
      const remove = []
      if (prev) {
        const pm = new Map(prev.map((e) => [e.id, e]))
        for (const e of elements) {
          const p = pm.get(e.id)
          if (!p || JSON.stringify(p) !== JSON.stringify(e)) set[e.id] = e
        }
        const cur = new Set(elements.map((e) => e.id))
        for (const p of prev) if (!cur.has(p.id)) remove.push(p.id)
      } else {
        for (const e of elements) set[e.id] = e
      }
      const meta = await s.getMeta(id)
      const now = new Date().toISOString()
      await s.saveMeta({
        id, name: rootName, schemaVersion: 1,
        createdAt: meta ? meta.createdAt : now,
        updatedAt: now,
        elementCount: elements.length,
        hasMedia: false,
      })
      if (Object.keys(set).length || remove.length) {
        const ok = await s.saveBody(id, { set, remove })
        if (!ok) showToast(t('toast.capacity'), 'error')
      }
      lastSavedRef.current = cloneElements(elements)
      if (!currentIdRef.current) setCurrent(id)
      refreshDocs()
    } catch (e) {
      // P5 容错：存储后端异常（如宿主路由不可用）不崩 UI，提示用户
      showToast(t('toast.saveFailed'), 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, elements, rootName, currentIdRef, setCurrent, refreshDocs, showToast])

  // 防抖调度：elements/result 变化 → 800ms 后落盘
  React.useEffect(() => {
    if (!open || !result.jsonl) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flushSave, AUTO_SAVE_MS)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  })

  // 初始化列表 + 关闭时保存未落盘修改并清理交互状态
  React.useEffect(() => {
    storeRef.current = defaultStore()
    refreshDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(() => {
    if (open) return
    flushSave()
    setEditing(null)
    setMenu(null)
    setTypeMenu(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ---------- 画布管理 ----------
  const newCanvas = () => {
    flushSave() // 新建前自动保存当前画布
    setCurrent(null)
    const fp = freshPage()
    setElements(fp)
    lastSavedRef.current = cloneElements(fp)
    setRootName('画布')
    applySelection([])
    setZoom(1)
    setPan({ x: 0, y: 0 })
    // 新画布独立上下文：清空撤销/重做历史（避免 Ctrl+Z 回退到旧画布、预置页面被旧内容替换）
    setPast([])
    setFuture([])
    setCopyBuf(null)
    setSnapLines([])
    setMenu(null)
    setTypeMenu(false)
    setEditing(null)
    setFloatTab(null)
  }
  const loadCanvas = async (h) => {
    await flushSave() // 载入前保存当前画布
    const body = await storeRef.current.loadBody(h.id)
    const els = body ? body.elements : []
    setElements(cloneElements(els))
    lastSavedRef.current = cloneElements(els)
    setRootName(typeof h.name === 'string' ? h.name : '画布')
    setCurrent(h.id)
    applySelection([])
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  const delCanvas = async (id) => {
    await storeRef.current.remove(id)
    setDocs((d) => d.filter((x) => x.id !== id))
    if (currentIdRef.current === id) setCurrent(null)
  }
  const renameCanvas = async (id, name) => {
    const meta = await storeRef.current.getMeta(id)
    if (!meta) return
    await storeRef.current.saveMeta(Object.assign({}, meta, { name, updatedAt: new Date().toISOString() }))
    setDocs((d) => d.map((x) => (x.id === id ? Object.assign({}, x, { name }) : x)))
    if (currentIdRef.current === id) setRootName(name)
  }
  const clearAll = () => {
    if (!elements.length) return
    commitHistory(cloneElements(elements))
    setElements(freshPage())
    applySelection([])
  }

  // ---------- 导出 / 导入（CanvasFile JSON） ----------
  const exportCanvas = async (id) => {
    const cf = await exportCanvasFile(storeRef.current, id)
    if (!cf) { showToast(t('toast.exportMissing')); return }
    const blob = new Blob([JSON.stringify(cf, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (cf.name || '画布') + '.dshwf.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importCanvas = async (file) => {
    let text = ''
    try { text = await file.text() } catch (e) { showToast(t('toast.readFail')); return }
    let parsed = null
    try { parsed = JSON.parse(text) } catch (e) { showToast(t('toast.notJson')); return }
    const r = await importCanvasFile(storeRef.current, parsed)
    if (!r.ok) { showToast(r.reason); return }
    showToast(t('toast.imported', { name: parsed.name || '未命名' }), 'info')
    refreshDocs()
  }

  return {
    docs, setDocs, floatTab, setFloatTab, flushSave, refreshDocs,
    newCanvas, loadCanvas, delCanvas, renameCanvas, clearAll,
    exportCanvas, importCanvas,
  }
}
