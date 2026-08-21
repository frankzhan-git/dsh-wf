// dsh-wf host 业务核心：画布库文件存储（CanvasStore 契约的服务端实现）
// 依赖注入式工厂：createWfStorageHandlers({ fs, shell, root }) → RPC handlers 映射
// 依赖形状（DSH 服务）：
//   fs：resolve(path, { cwd }) → { displayPath } / stat(target) → { type:'file'|'directory' } | null
//       readText(target) / writeText(target, text) / listDir(target) → [{ name, type, size }]
//   shell：resolve(spec) + run(spec)（删除用 Remove-Item / rm -rf；dsh-fs 无删除方法）
//   root：画布库根目录（默认 ~/Documents/界面草图，可经 ~/.dsh/wf/config.json 覆盖）
//   mediaFs（可选）：媒体二进制读写 + 损坏改名隔离（dsh-fs 无 writeBytes/rename），
//       默认 node:fs/promises 实现；测试可注入内存版
//
// 库布局（与蓝本 4.3 hostFile 一致）：
//   <root>/index.json                      meta 聚合（{ items: CanvasFileMeta[] }）
//   <root>/canvases/{cid}/meta.json        单画布 meta（冗余，损坏时互为恢复源）
//   <root>/canvases/{cid}/body.json        elements 正文（{ schemaVersion, elements }）
//   <root>/canvases/{cid}/media/{key}      媒体（二进制文件）
// 容错（P5）：index.json 损坏 → 扫描 canvases/*/meta.json 重建；body.json 损坏 → 改名 .corrupt 隔离
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import { isValidMeta, sanitizeElements } from '../src/core/storage/integrity.js'

export const fail = (e) => ({ ok: false, error: e && e.message ? e.message : String(e) })
export const ok = (extra) => Object.assign({ ok: true }, extra || {})

// 默认媒体/改名实现（node:fs/promises）
const defaultMediaFs = {
  writeFile: (path, buf) => writeFile(path, buf),
  readFile: (path) => readFile(path),
  rename: (oldPath, newPath) => rename(oldPath, newPath),
}

export function createWfStorageHandlers({ fs, shell, root, mediaFs }) {
  const mfs = mediaFs || defaultMediaFs
  // saveMeta 互斥锁（index 读-改-写串行化；见 saveMeta handler 注释）
  let metaLock = Promise.resolve()
  const sh = (command, workdir) => {
    const spec = shell.resolve({
      command,
      workdir,
      timeoutMs: 20000,
      stdoutMaxBytes: 4096,
      sandboxPolicy: { mode: 'danger-full-access', workspaceRoot: root },
    })
    return shell.run(spec)
  }
  const resolve = async (rel) => fs.resolve(rel, { cwd: root })
  const stat = async (t) => {
    try { return await fs.stat(t) } catch (e) { return null }
  }
  const readText = async (t) => {
    try { return await fs.readText(t) } catch (e) { return null }
  }

  const INDEX_REL = 'dsh-wf/index.json'
  const CANVAS_REL = (id) => 'dsh-wf/canvases/' + id
  const metaRel = (id) => CANVAS_REL(id) + '/meta.json'
  const bodyRel = (id) => CANVAS_REL(id) + '/body.json'
  const mediaRel = (id, key) => CANVAS_REL(id) + '/media/' + key

  async function ensureBase() {
    const base = await resolve('dsh-wf')
    await mkdir(base.displayPath, { recursive: true })
    const canv = await resolve('dsh-wf/canvases')
    await mkdir(canv.displayPath, { recursive: true })
    return canv
  }

  async function readJson(rel, fallback) {
    const t = await resolve(rel)
    const info = await stat(t)
    if (!info || info.type !== 'file') return fallback
    const text = await readText(t)
    if (!text) return fallback
    try { return JSON.parse(text) } catch (e) { return fallback }
  }
  async function writeJson(rel, data) {
    const t = await resolve(rel)
    await mkdir(dirname(t.displayPath), { recursive: true })
    await fs.writeText(t, JSON.stringify(data, null, 2))
  }

  // ---------- index：meta 聚合（损坏时扫描 canvases/*/meta.json 重建） ----------
  async function readIndex() {
    const raw = await readJson(INDEX_REL, null)
    let items = null
    if (raw && Array.isArray(raw.items)) items = raw.items.filter(isValidMeta)
    if (items === null) {
      // index 损坏/缺失 → 扫描单画布 meta.json 重建
      items = []
      try {
        const canv = await resolve('dsh-wf/canvases')
        const info = await stat(canv)
        if (info && info.type === 'directory') {
          const kids = await fs.listDir(canv)
          for (const k of kids) {
            if (k.type !== 'directory') continue
            const m = await readJson(metaRel(k.name), null)
            if (m && isValidMeta(m)) items.push(m)
          }
        }
      } catch (e) { /* 保持空 */ }
    }
    return sortMeta(items)
  }
  const sortMeta = (list) => list.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

  // ---------- RPC handlers（CanvasStore 契约 1:1 + ping） ----------
  return {
    // 能力探测：宿主路由就绪确认
    ping: async () => ok({ root }),
    // meta 列表：分页 + keyword，按 updatedAt 倒序
    'listMeta': async (args) => {
      const q = args || {}
      let items = await readIndex()
      const kw = q.keyword ? String(q.keyword).trim() : ''
      if (kw) items = items.filter((m) => m.name.includes(kw))
      const total = items.length
      if (typeof q.page === 'number') {
        const size = q.pageSize || 20
        items = items.slice(q.page * size, q.page * size + size)
      }
      return ok({ items, total })
    },
    'getMeta': async (args) => {
      const id = args && args.id
      if (!id) return fail(new Error('缺少 id'))
      const m = (await readIndex()).find((x) => x.id === id)
      return m ? ok({ meta: m }) : ok({ meta: null })
    },
    'loadBody': async (args) => {
      const id = args && args.id
      if (!id) return fail(new Error('缺少 id'))
      const t = await resolve(bodyRel(id))
      const info = await stat(t)
      if (!info || info.type !== 'file') return ok({ body: null })
      const text = await readText(t)
      if (!text) return ok({ body: null })
      let parsed = null
      try { parsed = JSON.parse(text) } catch (e) {
        // 损坏隔离：改名 .corrupt，返回 null
        try { await mfs.rename(t.displayPath, t.displayPath + '.corrupt') } catch (e2) { /* 忽略 */ }
        return ok({ body: null })
      }
      const { elements, dropped } = sanitizeElements(parsed.elements)
      return ok({ body: { elements, schemaVersion: (parsed && parsed.schemaVersion) || 1, dropped } })
    },
    'saveMeta': async (args) => {
      const meta = args && args.meta
      if (!meta || !meta.id) return fail(new Error('meta 缺少 id'))
      // 互斥锁：saveMeta 是「异步读 index → 改写 → 写回」，并发调用会相互覆盖
      // （如「新建画布」时旧画布保存与新画布落盘同时进行），串行化保证 index 不丢条目
      const prev = metaLock
      let release
      metaLock = new Promise((resolve) => { release = resolve })
      await prev
      try {
        const items = (await readIndex()).filter((m) => m.id !== meta.id)
        items.unshift(meta)
        await writeJson(INDEX_REL, { items: items.slice(0, 100) })
        await writeJson(metaRel(meta.id), meta) // 单画布冗余（index 损坏时恢复源）
      } finally {
        release()
      }
      return ok()
    },
    // 增量 patch：宿主侧合并后全量写 body.json（文件系统全量写足够快）
    'saveBody': async (args) => {
      const id = args && args.id
      const patch = (args && args.patch) || {}
      if (!id) return fail(new Error('缺少 id'))
      const prev = await readJson(bodyRel(id), { schemaVersion: 1, elements: [] })
      const map = new Map(Array.isArray(prev.elements) ? prev.elements.map((e) => [e.id, e]) : [])
      for (const rm of patch.remove || []) map.delete(rm)
      for (const k of Object.keys(patch.set || {})) map.set(k, patch.set[k])
      await writeJson(bodyRel(id), { schemaVersion: 1, elements: Array.from(map.values()) })
      return ok()
    },
    // 媒体：二进制经 base64 传输，经 mediaFs 写文件（dsh-fs 无 writeBytes）
    'putMedia': async (args) => {
      const id = args && args.id
      const key = args && args.key
      const base64 = args && args.base64
      if (!id || !key || typeof base64 !== 'string') return fail(new Error('putMedia 参数缺失'))
      const t = await resolve(mediaRel(id, key))
      await mkdir(dirname(t.displayPath), { recursive: true })
      await mfs.writeFile(t.displayPath, Buffer.from(base64, 'base64'))
      return ok()
    },
    'getMedia': async (args) => {
      const id = args && args.id
      const key = args && args.key
      if (!id || !key) return fail(new Error('getMedia 参数缺失'))
      const t = await resolve(mediaRel(id, key))
      const info = await stat(t)
      if (!info || info.type !== 'file') return ok({ media: null })
      try {
        const buf = await mfs.readFile(t.displayPath)
        return ok({ media: { base64: buf.toString('base64'), size: buf.length } })
      } catch (e) {
        return ok({ media: null })
      }
    },
    'remove': async (args) => {
      const id = args && args.id
      if (!id) return fail(new Error('缺少 id'))
      const items = (await readIndex()).filter((m) => m.id !== id)
      await writeJson(INDEX_REL, { items })
      // 目录删除：dsh-fs 无删除方法 → shell（Windows Remove-Item / 其他 rm -rf）
      const t = await resolve(CANVAS_REL(id))
      const info = await stat(t)
      if (info && info.type === 'directory') {
        const cmd = process.platform === 'win32'
          ? 'Remove-Item -LiteralPath ' + quote(t.displayPath) + ' -Recurse -Force'
          : 'rm -rf -- ' + quote(t.displayPath)
        const res = await sh(cmd, root)
        if (res.exitCode !== 0) throw new Error(String(res.stderr && res.stderr.text || '').trim() || '删除失败')
      }
      return ok()
    },
    'clear': async () => {
      const canv = await ensureBase()
      const kids = await fs.listDir(canv)
      for (const k of kids) {
        const t = await resolve('dsh-wf/canvases/' + k.name)
        const cmd = process.platform === 'win32'
          ? 'Remove-Item -LiteralPath ' + quote(t.displayPath) + ' -Recurse -Force'
          : 'rm -rf -- ' + quote(t.displayPath)
        const res = await sh(cmd, root)
        if (res.exitCode !== 0) throw new Error(String(res.stderr && res.stderr.text || '').trim() || '清空失败')
      }
      await writeJson(INDEX_REL, { items: [] })
      return ok()
    },
  }
}

// shell 单引号转义（与 dsh-fm 同款：PowerShell 用 ''，bash 用 '\''）
function quote(p) {
  return process.platform === 'win32'
    ? "'" + String(p).replace(/'/g, "''") + "'"
    : "'" + String(p).replace(/'/g, "'\\''") + "'"
}
