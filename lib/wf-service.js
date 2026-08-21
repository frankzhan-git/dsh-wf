// dsh-wf 宿主半业务核心：CanvasStore 契约 → 目录文件存储（每画布一个 JSON，原子写）
// 注入式工厂：createWfService({ storagesRoot, mediaRoot, fsImpl }) → service
//  - storagesRoot：DSH 存储数据根（~/.dsh/storages）；画布目录 = <root>/wf-canvases/{id}.json
//  - mediaRoot：媒体根（<root>/wf-media/{cid}/{key}，二进制外置，官方 kv 不面向二进制）
//  - fsImpl：{ mkdir, writeFile, readFile, rename, rm, readdir, writeAtomic }（默认 node:fs/promises）
// 文件形态：CanvasFile 完整 JSON（schemaVersion/id/name/createdAt/updatedAt/elementCount/hasMedia/elements）
// 原子写：writeAtomic（临时文件 + fsync + rename 替换；崩溃安全）
// 容错（P5）：损坏文件改名 .corrupt 隔离；meta 缓存启动扫描重建（文件为权威）
// 迁移：旧官方域单位文件 wf_canvas.json（unit+tables 格式）启动时拆分到每画布文件，成功后改名 .migrated；
//       v4 旧文件库迁移见 migrate-legacy.js（service 接口兼容，无需改动）
// 方法签名与 lib/wire.js 的 WF_INVOCATIONS 参数一一对应（网关严格路径按 wire 传参）。
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, readFile, rename, rm, readdir, open } from 'node:fs/promises'
import { sanitizeElements } from '../src/core/storage/integrity.js'

export const fail = (e) => ({ ok: false, error: e && e.message ? e.message : String(e) })
export const ok = (extra) => Object.assign({ ok: true }, extra || {})

// 默认文件实现（node:fs/promises）：writeAtomic = 临时文件 + fsync + rename（官方 JSON 后端同款）
const nodeFs = {
  mkdir, writeFile, readFile, rename, rm, readdir,
  writeAtomic: async (file, data) => {
    const tmp = join(dirname(file), '.' + randomUUID() + '.tmp')
    const handle = await open(tmp, 'w')
    try {
      await handle.writeFile(JSON.stringify(data, null, 2), 'utf8')
      await handle.sync()
    } finally {
      await handle.close()
    }
    await rename(tmp, file)
  },
}

export function defaultStoragesRoot() {
  const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(dshHome, 'storages')
}

export async function createWfService({ storagesRoot, mediaRoot, fsImpl }) {
  const fs = fsImpl || nodeFs
  const canvasesDir = join(storagesRoot, 'wf-canvases')
  const canvasPath = (id) => join(canvasesDir, id + '.json')
  const mediaDirOf = (id) => join(mediaRoot, id)

  let cache = new Map()          // id → meta（文件权威；写路径同步维护）
  let closed = false
  let writeChain = Promise.resolve()   // 宿主侧写串行（读-改-写原子性；client 串行队列之外的双保险）

  // 写队列：一切「读-改-写」按序执行
  const enqueue = (task) => {
    const run = writeChain.then(task)
    writeChain = run.catch(() => {})
    return run
  }

  async function init() {
    await migrateDomainFile(fs, storagesRoot, canvasesDir)
    await fs.mkdir(canvasesDir, { recursive: true })
    await scan()
  }

  // 启动扫描：目录中每画布一个文件 → meta 缓存（损坏文件隔离）
  async function scan() {
    let names = []
    try { names = await fs.readdir(canvasesDir) } catch (e) { return }
    for (const name of names) {
      if (!name.endsWith('.json')) continue
      const id = name.slice(0, -5)
      const meta = await readMetaOf(id)
      if (meta) cache.set(id, meta)
    }
  }

  // 读完整画布文件；损坏 → 改名 .corrupt 隔离 → null（P5）；不存在/读失败 → null
  async function readCanvasFile(id) {
    let text
    try { text = await fs.readFile(canvasPath(id), 'utf8') } catch (e) { return null }
    try {
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') throw new Error('shape')
      return parsed
    } catch (e) {
      try { await fs.rename(canvasPath(id), canvasPath(id) + '.corrupt') } catch (e2) { /* 尽力 */ }
      cache.delete(id)
      return null
    }
  }

  async function readMetaOf(id) {
    const raw = await readCanvasFile(id)
    if (!raw) return null
    return readMetaOfCached(raw)
  }

  const requireReady = () => { if (closed) throw new Error('wf-storage: 已关闭') }
  const sortByUpdated = (list) => list.slice().sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))

  await init()

  return {
    // ---------- CanvasStore 契约（@Remote 方法；wire 见 lib/wire.js） ----------
    ping: async () => { requireReady(); return ok({ storage: 'files' }) },

    listMeta: async (q) => {
      requireReady()
      const query = q || {}
      let all = Array.from(cache.values())
      const kw = query.keyword ? String(query.keyword).trim() : ''
      if (kw) all = all.filter((m) => m.name && m.name.includes(kw))
      all = sortByUpdated(all)
      const total = all.length
      let items = all
      if (typeof query.page === 'number') {
        const size = query.pageSize || 20
        items = all.slice(query.page * size, query.page * size + size)
      }
      return ok({ items, total })
    },

    getMeta: async (id) => {
      requireReady()
      if (!id) return fail(new Error('缺少 id'))
      return ok({ meta: cache.get(id) || null })
    },

    loadBody: async (id) => {
      requireReady()
      if (!id) return fail(new Error('缺少 id'))
      const raw = await readCanvasFile(id)
      if (!raw) return ok({ body: null })
      const { elements, dropped } = sanitizeElements(raw.elements)
      return ok({ body: { elements, schemaVersion: raw.schemaVersion || 1, dropped } })
    },

    saveMeta: async (meta) => {
      requireReady()
      if (!meta || !meta.id) return fail(new Error('meta 缺少 id'))
      return enqueue(async () => {
        const cur = await readCanvasFile(meta.id)
        const next = {
          schemaVersion: 1,
          id: meta.id,
          name: meta.name || '未命名画布',
          createdAt: (cur && cur.createdAt) || meta.createdAt || new Date().toISOString(),
          updatedAt: meta.updatedAt || new Date().toISOString(),
          elementCount: (cur && Array.isArray(cur.elements)) ? cur.elements.length : (meta.elementCount || 0),
          hasMedia: !!(cur ? cur.hasMedia : meta.hasMedia),
          elements: (cur && Array.isArray(cur.elements)) ? cur.elements : [],
        }
        await fs.writeAtomic(canvasPath(meta.id), next)
        cache.set(meta.id, readMetaOfCached(next))
      })
    },

    saveBody: async (id, patch) => {
      requireReady()
      const p = patch || {}
      if (!id) return fail(new Error('缺少 id'))
      return enqueue(async () => {
        const cur = await readCanvasFile(id)
        const now = new Date().toISOString()
        const next = {
          schemaVersion: 1,
          id,
          name: (cur && cur.name) || '未命名画布',
          createdAt: (cur && cur.createdAt) || now,
          updatedAt: (cur && cur.updatedAt) || now,
          elementCount: 0,
          hasMedia: !!(cur && cur.hasMedia),
          elements: [],
        }
        // 原子读-改-写：set 覆盖 + remove 删除（缺失时以 patch 为全量——业务层保存即全量快照语义）
        const map = new Map(Array.isArray(cur && cur.elements) ? cur.elements.map((e) => [e.id, e]) : [])
        for (const rm of p.remove || []) map.delete(rm)
        for (const k of Object.keys(p.set || {})) map.set(k, p.set[k])
        next.elements = Array.from(map.values())
        next.elementCount = next.elements.length
        await fs.writeAtomic(canvasPath(id), next)
        cache.set(id, readMetaOfCached(next))
      })
    },

    putMedia: async (arg) => {
      requireReady()
      const a = arg || {}
      if (!a.id || !a.key || typeof a.base64 !== 'string') return fail(new Error('putMedia 参数缺失'))
      const target = join(mediaRoot, a.id, a.key)
      await fs.mkdir(dirname(target), { recursive: true })
      await fs.writeFile(target, Buffer.from(a.base64, 'base64'))
      return ok()
    },

    getMedia: async (arg) => {
      requireReady()
      const a = arg || {}
      if (!a.id || !a.key) return fail(new Error('getMedia 参数缺失'))
      try {
        const buf = await fs.readFile(join(mediaRoot, a.id, a.key))
        return ok({ media: { base64: buf.toString('base64'), size: buf.length } })
      } catch (e) {
        return ok({ media: null })
      }
    },

    remove: async (id) => {
      requireReady()
      if (!id) return fail(new Error('缺少 id'))
      return enqueue(async () => {
        try { await fs.rm(canvasPath(id), { force: true }) } catch (e) { /* 尽力 */ }
        try { await fs.rm(mediaDirOf(id), { recursive: true, force: true }) } catch (e) { /* 尽力 */ }
        cache.delete(id)
      })
    },

    clear: async () => {
      requireReady()
      return enqueue(async () => {
        let names = []
        try { names = await fs.readdir(canvasesDir) } catch (e) { /* 空 */ }
        for (const name of names) {
          try { await fs.rm(join(canvasesDir, name), { force: true }) } catch (e) { /* 尽力 */ }
        }
        try { await fs.rm(mediaRoot, { recursive: true, force: true }) } catch (e) { /* 尽力 */ }
        cache.clear()
      })
    },

    // ---------- 生命周期 ----------
    close: async () => { closed = true },
  }
}

function readMetaOfCached(raw) {
  return {
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : '未命名画布',
    schemaVersion: raw.schemaVersion || 1,
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
    elementCount: Array.isArray(raw.elements) ? raw.elements.length : 0,
    hasMedia: !!raw.hasMedia,
  }
}

// ---------- 迁移：旧官方域单位文件（wf_canvas.json，unit+tables 格式）→ 每画布文件 ----------
// 格式：{ unit: { name, version }, global, tables: { meta: { id: meta }, body: { id: { schemaVersion, elements } } } }
// 成功后旧文件改名 .migrated；只入不覆盖（目标文件已存在则跳过）
export async function migrateDomainFile(fsImpl, storagesRoot, canvasesDir) {
  const fs = fsImpl || nodeFs
  const src = join(storagesRoot, 'wf_canvas.json')
  let raw
  try {
    raw = JSON.parse(await fs.readFile(src, 'utf8'))
  } catch (e) {
    // 不存在 → 正常跳过；存在但损坏 → 隔离防重复尝试
    try { await fs.rename(src, src + '.corrupt') } catch (e2) { /* ENOENT 等，忽略 */ }
    return { migrated: 0, skipped: 0, reason: 'no-domain-file' }
  }
  if (!raw || raw.unit === undefined || !raw.tables || typeof raw.tables.meta !== 'object' || raw.tables.meta === null) {
    return { migrated: 0, skipped: 0, reason: 'not-domain-file' }
  }
  await fs.mkdir(canvasesDir, { recursive: true })
  const metas = raw.tables.meta || {}
  const bodies = raw.tables.body || {}
  let migrated = 0
  let skipped = 0
  for (const [id, meta] of Object.entries(metas)) {
    const target = join(canvasesDir, id + '.json')
    try { await fs.readFile(target, 'utf8'); skipped++; continue } catch (e) { /* 目标不存在 → 写入 */ }
    const body = bodies[id]
    const elements = body && Array.isArray(body.elements) ? body.elements : []
    const file = {
      schemaVersion: 1,
      id,
      name: (meta && typeof meta.name === 'string') ? meta.name : '未命名画布',
      createdAt: (meta && meta.createdAt) || new Date().toISOString(),
      updatedAt: (meta && meta.updatedAt) || new Date().toISOString(),
      elementCount: elements.length,
      hasMedia: !!(meta && meta.hasMedia),
      elements,
    }
    await fs.writeAtomic(target, file)
    migrated++
  }
  if (migrated > 0) {
    try { await fs.rename(src, src + '.migrated') } catch (e) { /* 保留原文件，下次重试 */ }
  }
  return { migrated, skipped }
}
