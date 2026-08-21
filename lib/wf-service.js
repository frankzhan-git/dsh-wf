// dsh-wf 宿主半业务核心：CanvasStore 契约 → storage-domain 领域操作（官方存储）
// 注入式工厂：createWfService({ storageDomain, mediaRoot, unitPath, mediaFs }) → service
//  - storageDomain：ctx.storageDomain（或测试注入的内存版；必须提供 open(spec)）
//  - mediaRoot：媒体根目录绝对路径（~/.dsh/storages/wf-media；二进制外置，不走 kv）
//  - unitPath：单位文件路径（损坏隔离用；默认 DSH_HOME/storages/wf_canvas.json）
//  - mediaFs：{ writeFile, readFile, rm, rename }（默认 node:fs/promises；测试注入内存版）
// 语义保证：官方写链串行化 + table.update() 原子 RMW + 原子文件替换；
// 损坏单位文件（malformed-medium/version-mismatch）→ 尽力改名 .corrupt 隔离后重开空库（P5）。
// 方法签名与 lib/wire.js 的 WF_INVOCATIONS 参数一一对应（gateway 严格路径按 wire 传参）。
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { writeFile, readFile, rm, rename, mkdir } from 'node:fs/promises'
import { wfCanvasDomainSpec } from './domain.js'
import { sanitizeElements } from '../src/core/storage/integrity.js'

export const fail = (e) => ({ ok: false, error: e && e.message ? e.message : String(e) })
export const ok = (extra) => Object.assign({ ok: true }, extra || {})

const defaultMediaFs = { writeFile, readFile, rm, rename, mkdir }

export function defaultUnitPath() {
  const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(dshHome, 'storages', wfCanvasDomainSpec.name + '.json')
}

export async function createWfService({ storageDomain, mediaRoot, unitPath, mediaFs }) {
  const mfs = mediaFs || defaultMediaFs
  const unitFile = unitPath || defaultUnitPath()
  let domain = null
  let metaTable = null
  let bodyTable = null

  // 打开领域；单位文件损坏/版本不符 → 隔离（.corrupt）后重开空库；隔离失败则抛（服务不可用 → client 降级）
  async function openWithQuarantine() {
    try {
      domain = await storageDomain.open(wfCanvasDomainSpec)
    } catch (e) {
      const quarantined = await quarantineUnit()
      if (!quarantined) throw e
      domain = await storageDomain.open(wfCanvasDomainSpec)
    }
    metaTable = domain.table('meta')
    bodyTable = domain.table('body')
  }
  async function quarantineUnit() {
    try { await mfs.rename(unitFile, unitFile + '.corrupt'); return true } catch (e) { return false }
  }

  await openWithQuarantine()

  const requireReady = () => {
    if (!domain) throw new Error('wf-storage: 存储领域未就绪')
  }

  const sortByUpdated = (list) => list.slice().sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))

  return {
    // ---------- CanvasStore 契约（@Remote 方法；wire 见 lib/wire.js） ----------
    ping: async () => { requireReady(); return ok({ storage: 'domain' }) },

    listMeta: async (q) => {
      requireReady()
      const query = q || {}
      let all = []
      for (const entry of metaTable.entries()) all.push(entry[1])
      const kw = query.keyword ? String(query.keyword).trim() : ''
      if (kw) all = all.filter((m) => m && typeof m.name === 'string' && m.name.includes(kw))
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
      const meta = metaTable.get(id)
      return ok({ meta: meta || null })
    },

    loadBody: async (id) => {
      requireReady()
      if (!id) return fail(new Error('缺少 id'))
      const rec = bodyTable.get(id)
      if (!rec) return ok({ body: null })
      const { elements, dropped } = sanitizeElements(rec.elements)
      return ok({ body: { elements, schemaVersion: rec.schemaVersion || 1, dropped } })
    },

    saveMeta: async (meta) => {
      requireReady()
      if (!meta || !meta.id) return fail(new Error('meta 缺少 id'))
      await metaTable.put(meta.id, meta)
      return ok()
    },

    saveBody: async (id, patch) => {
      requireReady()
      const p = patch || {}
      if (!id) return fail(new Error('缺少 id'))
      const prev = bodyTable.get(id)
      if (!prev) {
        // 首次保存：以 patch 为全量（业务层保存即全量快照语义）
        await bodyTable.put(id, { schemaVersion: 1, elements: patchToElements(p) })
        return ok()
      }
      // 原子 RMW：读-改-写在同一写链槽内执行，并发保存不丢更新
      await bodyTable.update(id, (current) => {
        const map = new Map(Array.isArray(current.elements) ? current.elements.map((e) => [e.id, e]) : [])
        for (const rm of p.remove || []) map.delete(rm)
        for (const k of Object.keys(p.set || {})) map.set(k, p.set[k])
        return { schemaVersion: (current && current.schemaVersion) || 1, elements: Array.from(map.values()) }
      })
      return ok()
    },

    putMedia: async (arg) => {
      requireReady()
      const a = arg || {}
      if (!a.id || !a.key || typeof a.base64 !== 'string') return fail(new Error('putMedia 参数缺失'))
      const target = join(mediaRoot, a.id, a.key)
      await mfs.mkdir(dirname(target), { recursive: true })
      await mfs.writeFile(target, Buffer.from(a.base64, 'base64'))
      return ok()
    },

    getMedia: async (arg) => {
      requireReady()
      const a = arg || {}
      if (!a.id || !a.key) return fail(new Error('getMedia 参数缺失'))
      try {
        const buf = await mfs.readFile(join(mediaRoot, a.id, a.key))
        return ok({ media: { base64: buf.toString('base64'), size: buf.length } })
      } catch (e) {
        return ok({ media: null })
      }
    },

    remove: async (id) => {
      requireReady()
      if (!id) return fail(new Error('缺少 id'))
      await bodyTable.delete(id)          // 先删正文（孤儿无害）
      await metaTable.delete(id)          // 后删 meta（门面：meta 缺失即画布不存在）
      try { await mfs.rm(join(mediaRoot, id), { recursive: true, force: true }) } catch (e) { /* 尽力 */ }
      return ok()
    },

    clear: async () => {
      requireReady()
      for (const entry of metaTable.entries()) await metaTable.delete(entry[0])
      for (const entry of bodyTable.entries()) await bodyTable.delete(entry[0])
      try { await mfs.rm(mediaRoot, { recursive: true, force: true }) } catch (e) { /* 尽力 */ }
      return ok()
    },

    // ---------- 生命周期 ----------
    close: async () => {
      if (domain) { const d = domain; domain = null; await d.close() }
    },
  }
}

function patchToElements(patch) {
  const set = patch.set || {}
  return Object.keys(set).map((k) => set[k])
}
