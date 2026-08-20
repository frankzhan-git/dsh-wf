// localStorage 适配器（现役默认，P7）：文档库语义（meta/body 分离 + 增量 patch + 媒体外置 + 分页）
// 写粒度：全量退化实现（量小无感）；容量探测（~4MB 保守上限），超限返回 false 由调用方提示
// 键空间：dsh-wf:index（meta 数组）/ dsh-wf:body:{id} / dsh-wf:media:{id}:{key} / dsh-wf:last
// 额外能力：sync 同步变体（浏览器内同步初始化用，避免打开闪屏）；migrateLegacy 旧键迁移
import { migrateFile } from '../migrate.js'
import { sanitizeElements, isValidMeta } from '../integrity.js'

const INDEX_KEY = 'dsh-wf:index'
const LAST_KEY = 'dsh-wf:last'
const LEGACY_KEY = 'dsh-wf.history.v1' // 旧 history.js 键（v0 条目）
export const CAPACITY_LIMIT = 4 * 1024 * 1024 // 保守上限（localStorage 通常 ~5MB）

const bodyKey = (id) => 'dsh-wf:body:' + id
const mediaPrefix = (id) => 'dsh-wf:media:' + id + ':'
const mediaKey = (id, key) => 'dsh-wf:media:' + id + ':' + key

function readIndex() {
  const raw = localStorage.getItem(INDEX_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(isValidMeta) : []
  } catch (e) {
    return []
  }
}
function writeIndex(list) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(list)) } catch (e) { /* 容量已由调用方探测 */ }
}
// 按 updatedAt 倒序
function sortMeta(list) { return list.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')) }

// 容量探测：待写入值估算超限 → 返回 false
function fits(value) {
  return !value || String(value).length < CAPACITY_LIMIT
}

export function localStorageAdapter() {
  // ---------- 异步接口（CanvasStore 契约） ----------
  const listMeta = async (q) => {
    let items = sortMeta(readIndex())
    const kw = q && q.keyword ? String(q.keyword).trim() : ''
    if (kw) items = items.filter((m) => m.name.includes(kw))
    const total = items.length
    if (q && typeof q.page === 'number') {
      const size = (q && q.pageSize) || 20
      items = items.slice(q.page * size, q.page * size + size)
    }
    return { items, total }
  }
  const getMeta = async (id) => readIndex().find((m) => m.id === id) || null
  const loadBody = async (id) => {
    const raw = localStorage.getItem(bodyKey(id))
    if (!raw) return null
    let parsed = null
    try { parsed = JSON.parse(raw) } catch (e) { return null } // 损坏 → null（隔离策略：覆盖前保留原值）
    const { elements, dropped } = sanitizeElements(parsed.elements)
    return { elements, schemaVersion: (parsed && parsed.schemaVersion) || 1, dropped }
  }
  const saveMeta = async (meta) => {
    const list = readIndex().filter((m) => m.id !== meta.id)
    list.unshift(meta)
    writeIndex(list.slice(0, 100)) // 列表上限 100（防止无限膨胀）
  }
  // 增量 patch：全量退化实现（读 body → 合并 → 写回）；容量不足返回 false
  const saveBody = async (id, patch) => {
    const prev = await loadBody(id)
    const map = new Map((prev ? prev.elements : []).map((e) => [e.id, e]))
    for (const rm of patch.remove || []) map.delete(rm)
    for (const k of Object.keys(patch.set || {})) map.set(k, patch.set[k])
    const body = { schemaVersion: 1, elements: Array.from(map.values()) }
    const json = JSON.stringify(body)
    if (!fits(json)) return false
    try { localStorage.setItem(bodyKey(id), json) } catch (e) { return false }
    return true
  }
  const putMedia = async (id, key, blob) => {
    const dataUrl = await new Promise((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = () => resolve(null)
      r.readAsDataURL(blob)
    })
    if (dataUrl == null || !fits(dataUrl)) return false
    try { localStorage.setItem(mediaKey(id, key), dataUrl) } catch (e) { return false }
    return true
  }
  const getMedia = async (id, key) => {
    const raw = localStorage.getItem(mediaKey(id, key))
    if (!raw) return null
    try { return await (await fetch(raw)).blob() } catch (e) { return null }
  }
  const remove = async (id) => {
    const list = readIndex().filter((m) => m.id !== id)
    writeIndex(list)
    localStorage.removeItem(bodyKey(id))
    const prefix = mediaPrefix(id)
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  }
  const clear = async () => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith('dsh-wf:'))) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  }

  // ---------- 同步变体（仅 localStorage 能力：打开画布同步初始化，避免闪屏） ----------
  const sync = {
    listMeta: () => sortMeta(readIndex()),
    getMeta: (id) => readIndex().find((m) => m.id === id) || null,
    loadBody: (id) => {
      const raw = localStorage.getItem(bodyKey(id))
      if (!raw) return null
      try {
        const parsed = JSON.parse(raw)
        return { elements: sanitizeElements(parsed.elements).elements, schemaVersion: (parsed && parsed.schemaVersion) || 1 }
      } catch (e) {
        return null
      }
    },
  }

  // ---------- 旧键迁移（v0 history.js → v1 CanvasFile；一次性，成功后删除旧键） ----------
  const migrateLegacy = async () => {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return 0
    let arr = []
    try { arr = JSON.parse(raw) } catch (e) { localStorage.removeItem(LEGACY_KEY); return 0 }
    if (!Array.isArray(arr)) { localStorage.removeItem(LEGACY_KEY); return 0 }
    let n = 0
    for (const h of arr) {
      const cf = migrateFile(h)
      if (!cf) continue
      await saveMeta({
        id: cf.id, name: cf.name, schemaVersion: cf.schemaVersion,
        createdAt: cf.createdAt, updatedAt: cf.updatedAt,
        elementCount: (cf.elements || []).length, hasMedia: false,
      })
      const json = JSON.stringify({ schemaVersion: cf.schemaVersion, elements: cf.elements || [] })
      try { localStorage.setItem(bodyKey(cf.id), json) } catch (e) { continue }
      n++
    }
    localStorage.removeItem(LEGACY_KEY)
    return n
  }

  return {
    listMeta, getMeta, loadBody, saveMeta, saveBody, putMedia, getMedia, remove, clear,
    sync, migrateLegacy,
    name: 'localStorage',
  }
}
