// 画布管理（P1 应用层）：自动保存 / 新建 / 载入 / 删除 / 重命名 / 导出 / 导入
// 存储全部走 CanvasStore 接口（P7）：localStorage 适配器现役，未来 IndexedDB/宿主 SQLite 零改动
//
// 持久化架构（v2，审计重构）：
//  - 一切写入走「串行队列」（saveQueueRef）：同一时刻只有一个持久化事务，杜绝并发交错
//    （此前 flushSave/persistNewDoc/restoreLast 并发读写 currentIdRef/存储，产生幽灵画布与丢元素）
//  - 保存一律「全量快照」（persistSnapshot）：入队时深拷贝 elements，执行时整体写盘 +
//    显式 remove 清理已删元素——不依赖增量基线，初始元素（默认页面）永不丢失
//  - 画布 id 只在「新建」时显式生成并立即绑定；auto-save 遇 currentId=null 直接跳过
//    ——不存在「无 id 自动创建」，从机制上杜绝幽灵画布
import React from 'react'
import { cloneElements, createElement, reserveSeqs } from '../core/model.js'
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
// P5 容错：读取永不抛——数据意外损坏（如循环引用）时兜底空白画布，绝不让浮层渲染崩溃
export function initLast() {
  try {
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
  } catch (e) {
    return null
  }
}

export function useCanvasManager(deps) {
  const {
    open, result, elements, setElements, rootName, setRootName,
    currentId, setCurrent, currentIdRef, applySelection, commitHistory,
    setPast, setFuture, setCopyBuf, setEditing, setMenu, setTypeMenu,
    setZoom, setPan, setSnapLines, showToast, lastSavedInit,
  } = deps

  const storeRef = React.useRef(null)
  const [docs, setDocs] = React.useState([]) // 文档列表（meta，按创建日期倒序）
  const [floatTab, setFloatTab] = React.useState(null) // 画布内悬浮面板：null | 'jsonl' | 'preview'
  const saveTimer = React.useRef(null)
  // 磁盘上「当前画布」的最近保存快照（哨兵：判断是否有未落盘变化；初始 = 打开时的画布内容）
  const lastSavedRef = React.useRef(lastSavedInit ? cloneElements(lastSavedInit) : null)

  // ---------- 串行持久化队列：一切写入按序执行，杜绝并发交错 ----------
  const saveQueueRef = React.useRef(Promise.resolve())
  const enqueueSave = React.useCallback((task) => {
    const run = saveQueueRef.current.then(task)
    saveQueueRef.current = run.catch(() => {}) // 失败不阻塞后续任务
    return run
  }, [])

  // 异步文档列表（初始 + 变更后刷新）；按创建日期倒序（旧数据无 createdAt 时回退 updatedAt）
  const docsReqRef = React.useRef(0)
  const refreshDocs = React.useCallback(async () => {
    const reqId = ++docsReqRef.current
    try {
      const r = await storeRef.current.listMeta(LIST_PAGE)
      if (reqId !== docsReqRef.current) return // 过期请求丢弃
      const items = r.items.slice().sort((a, b) =>
        String(b.createdAt || b.updatedAt || '').localeCompare(String(a.createdAt || a.updatedAt || '')))
      setDocs(items)
    } catch (e) { /* P5 容错：列表刷新失败保持现状 */ }
  }, [])

  // 异步恢复「最近打开的画布」（宿主存储无 sync 变体，initLast 同步路径不可用）：
  // 取 updatedAt 最新（最近编辑/打开）的文档载入；仅在用户尚未开始编辑/保存时执行，防止覆盖新输入
  const restoreLast = React.useCallback(async () => {
    try {
      const s = storeRef.current
      const r = await s.listMeta(LIST_PAGE)
      const latest = r.items.slice()
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]
      if (!latest) return
      const body = await s.loadBody(latest.id)
      if (!body || !body.elements || !body.elements.length) return
      if (currentIdRef.current !== null || lastSavedRef.current !== null) return
      const els = cloneElements(body.elements)
      reserveSeqs(els) // 载入即推进 id 序列：后续新建/粘贴的 id 不与载入元素冲突
      setElements(els)
      lastSavedRef.current = cloneElements(els)
      setRootName(latest.name || '画布')
      setCurrent(latest.id)
      applySelection([])
    } catch (e) { /* P5 容错：恢复失败保持现状（空白画布） */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applySelection, setCurrent, setElements, setRootName])

  // ---------- 全量快照保存（串行队列内执行） ----------
  // id 必须已存在（新建画布由 newCanvas 显式创建并绑定）；els 为入队时的深拷贝快照。
  // 全量写盘 + 显式 remove 清理已删元素：不依赖存储基线，初始元素永不丢失
  const persistSnapshot = React.useCallback(async (id, els, name) => {
    try {
      const s = storeRef.current
      const now = new Date().toISOString()
      const meta = await s.getMeta(id)
      await s.saveMeta({
        id, name, schemaVersion: 1,
        createdAt: meta ? meta.createdAt : now,
        updatedAt: now,
        elementCount: els.length,
        hasMedia: false,
      })
      const set = {}
      for (const e of els) set[e.id] = e
      const prev = await s.loadBody(id)
      const remove = (prev && prev.elements)
        ? prev.elements.filter((p) => !set[p.id]).map((p) => p.id)
        : []
      const ok = await s.saveBody(id, { set, remove })
      if (!ok) showToast(t('toast.capacity'), 'error')
      await refreshDocs() // 列表刷新收敛到事务尾部
    } catch (e) {
      // P5 容错：存储后端异常（如宿主路由不可用）不崩 UI，提示用户
      showToast(t('toast.saveFailed'), 'error')
    }
  }, [refreshDocs, showToast])

  // 自动保存调度：已创建画布 + 有内容 + 有变化 → 快照入队（不自动创建 id）
  const flushSave = React.useCallback(() => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    const id = currentIdRef.current
    if (!id || !result.jsonl) return Promise.resolve() // 未创建画布 / 空画布（含仅空页面）不保存
    if (lastSavedRef.current && JSON.stringify(lastSavedRef.current) === JSON.stringify(elements)) {
      return Promise.resolve() // 无未落盘变化
    }
    const snap = cloneElements(elements) // 入队时捕获快照（等待期间继续编辑由下一次保存覆盖）
    return enqueueSave(async () => {
      await persistSnapshot(id, snap, rootName)
      lastSavedRef.current = cloneElements(snap) // 保存成功后更新哨兵
    })
  }, [result, elements, rootName, currentIdRef, enqueueSave, persistSnapshot])

  // 防抖调度：elements/result 变化 → 800ms 后落盘
  React.useEffect(() => {
    if (!open || !result.jsonl) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flushSave, AUTO_SAVE_MS)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  })

  // 初始化列表 + 异步恢复最近画布（宿主存储）+ 关闭时保存未落盘修改并清理交互状态
  React.useEffect(() => {
    storeRef.current = defaultStore()
    refreshDocs()
    // 同步路径（localStorage）未恢复出画布 → 走异步恢复（domain 存储无 sync 变体）
    if (currentIdRef.current === null && lastSavedRef.current === null) restoreLast()
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
  // 新建（严格顺序）：① 旧画布落盘 → ② 创建新文件并落盘（列表随之刷新显示）
  // → ③ 绑定选中新文件 → ④ 画布区域展示新文件。异步期间防连点
  const creatingRef = React.useRef(false)
  const newCanvas = async () => {
    if (creatingRef.current) return // 防连点：新建进行中忽略重复点击
    creatingRef.current = true
    try {
      // ① 旧画布落盘（若存在；未创建但有内容 → 先落盘为一个新画布，避免内容丢失）
      const oldId = currentIdRef.current || (result.jsonl ? genCanvasId() : null)
      if (oldId) {
        await enqueueSave(() => persistSnapshot(oldId, cloneElements(elements), rootName))
      }
      // ② 创建新文件并立即落盘（哪怕只有默认页面也保存）；persistSnapshot 尾部刷新列表
      const id = genCanvasId()
      const fp = freshPage()
      await enqueueSave(() => persistSnapshot(id, fp, '画布'))
      // ③④ 文件已存在且列表已显示 → 绑定选中 + 展示画布
      setCurrent(id)
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
    } finally {
      creatingRef.current = false
    }
  }
  const loadCanvas = async (h) => {
    await flushSave() // 保存当前画布（入队等待；无变化/未创建则立即返回）
    const body = await storeRef.current.loadBody(h.id)
    const els = body ? body.elements : []
    const loaded = cloneElements(els)
    reserveSeqs(loaded) // 载入即推进 id 序列：后续新建/粘贴的 id 不与载入元素冲突
    setElements(loaded)
    lastSavedRef.current = cloneElements(loaded)
    setRootName(typeof h.name === 'string' ? h.name : '画布')
    setCurrent(h.id)
    applySelection([])
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  const delCanvas = async (id) => {
    await enqueueSave(() => storeRef.current.remove(id))
    setDocs((d) => d.filter((x) => x.id !== id))
    if (currentIdRef.current === id) setCurrent(null)
  }
  const renameCanvas = async (id, name) => {
    await enqueueSave(async () => {
      const meta = await storeRef.current.getMeta(id)
      if (!meta) return
      await storeRef.current.saveMeta(Object.assign({}, meta, { name, updatedAt: new Date().toISOString() }))
      await refreshDocs()
    })
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
    const r = await enqueueSave(() => importCanvasFile(storeRef.current, parsed))
    if (!r.ok) { showToast(r.reason); return }
    showToast(t('toast.imported', { name: parsed.name || '未命名' }), 'info')
    await refreshDocs()
  }

  return {
    docs, setDocs, floatTab, setFloatTab, flushSave, refreshDocs,
    newCanvas, loadCanvas, delCanvas, renameCanvas, clearAll,
    exportCanvas, importCanvas,
  }
}
