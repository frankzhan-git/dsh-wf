// 存储装配（P7）：业务只认 CanvasStore 接口，不认存储实现
// probeAdapters 能力探测按优先级选优：hostSQLite > hostFile > indexedDB > localStorage
// 现役：localStorageAdapter（同步变体供初始化）；预留适配器 ready=false 时安全降级，业务零改动
import { localStorageAdapter } from './adapters/localStorage.js'
import { indexedDBAdapter } from './adapters/indexedDB.js'
import { hostSQLiteAdapter } from './adapters/hostSQLite.js'
import { hostFileAdapter } from './adapters/hostFile.js'
import { migrateFile } from './migrate.js'
import { CURRENT_SCHEMA_VERSION, genCanvasId } from './schema.js'

export { CURRENT_SCHEMA_VERSION, genCanvasId } from './schema.js'
export { migrateFile } from './migrate.js'
export { sanitizeElements } from './integrity.js'

// 能力探测：返回按优先级排序的可用适配器列表（仅 ready 者）
// hostRpc：宿主侧存储服务（createHostRpc 的 fetch 封装；由 src/client.js 适配层探测注入）
export function probeAdapters(hostRpc) {
  const available = []
  for (const c of [hostSQLiteAdapter(hostRpc), hostFileAdapter(hostRpc), indexedDBAdapter()]) {
    if (c.ready) available.push(c)
  }
  available.push(localStorageAdapter()) // localStorage 永远兜底
  return available
}

let cached = null
// 默认存储（单例；选中 localStorage 时自动执行旧键迁移）
export function defaultStore(hostRpc) {
  if (cached) return cached
  cached = probeAdapters(hostRpc)[0]
  if (cached.name === 'localStorage') cached.migrateLegacy().catch(() => {})
  return cached
}

// ---------- 文档级编排（基于 CanvasStore 接口的纯组合） ----------

// 导出：meta + body → CanvasFile 完整文件（备份/分享载体）
export async function exportCanvasFile(store, id) {
  const meta = await store.getMeta(id)
  const body = await store.loadBody(id)
  if (!meta || !body) return null
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: meta.id,
    name: meta.name,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    elements: body.elements,
    meta: { source: 'export' },
  }
}

// 导入：CanvasFile JSON（备份恢复）→ migrate → 校验 → 重新分配 id 新建（绝不覆盖现有）
// 返回 { ok: true, id } | { ok: false, reason }
export async function importCanvasFile(store, file) {
  if (!file || typeof file !== 'object') return { ok: false, reason: '不是有效的画布文件' }
  const cf = migrateFile(file)
  if (!cf || !Array.isArray(cf.elements)) return { ok: false, reason: '文件内容无法识别（需为 dsh-wf 画布 JSON）' }
  const id = genCanvasId()
  const now = new Date().toISOString()
  await store.saveMeta({
    id, name: cf.name || '未命名画布', schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: now, updatedAt: now, elementCount: cf.elements.length, hasMedia: false,
  })
  const set = {}
  for (const e of cf.elements) set[e.id] = e
  const okBody = await store.saveBody(id, { set, remove: [] })
  if (!okBody) return { ok: false, reason: '画布数据超出存储容量，导入失败' }
  return { ok: true, id }
}
