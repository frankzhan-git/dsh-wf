// 验证脚本：宿主存储半（v5 官方存储域）——wf-service 工厂 + 内存 domain + 损坏隔离 + 迁移
// 用法：node scripts/verify-host-storage.mjs
// 宿主半用注入式依赖（{ storageDomain, mediaRoot, mediaFs }）：这里用内存 domain + 内存 mediaFs 全流程测试，
// 不依赖 Cordis 运行时（真实装配由 lib/index.js 承担，经官方 storage-domain 后端验证过）
import { createWfService } from '../lib/wf-service.js'
import { migrateLegacy } from '../lib/migrate-legacy.js'
import { domainAdapter } from '../src/core/storage/adapters/domain.js'
import { probeAdapters, defaultStore } from '../src/core/storage/index.js'
import { createElement } from '../src/core/model.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 内存 domain（形状同 storage-domain 的 Domain/Table） ----------
function createMemTable() {
  const map = new Map()
  return {
    get: (k) => map.get(k),
    put: async (k, v) => { map.set(k, v) },
    delete: async (k) => { const had = map.has(k); map.delete(k); return had },
    update: async (k, fn) => {
      if (!map.has(k)) throw new Error('missing-key')
      const next = fn(map.get(k))
      map.set(k, next)
      return next
    },
    entries: () => map.entries(),
    keys: () => map.keys(),
    get size() { return map.size },
    _map: map,
  }
}
function createMemDomain(spec) {
  const tables = {}
  for (const name of Object.keys(spec.tables)) tables[name] = createMemTable()
  return {
    name: spec.name,
    table: (name) => tables[name],
    close: async () => {},
  }
}
// 内存 storageDomain：可注入「首次 open 抛错」（损坏隔离场景）
function createMemStorageDomain({ failFirstOpen = null } = {}) {
  let opens = 0
  return {
    open: async (spec) => {
      opens++
      if (failFirstOpen && opens === 1) {
        const e = new Error(failFirstOpen)
        e.code = failFirstOpen
        throw e
      }
      return createMemDomain(spec)
    },
    get opens() { return opens },
  }
}
// 内存 mediaFs（形状同 node:fs/promises 子集 + rename + mkdir）
function createMemMediaFs() {
  const files = new Map()
  return {
    files,
    mkdir: async () => {},
    writeFile: async (p, buf) => { files.set(String(p).replace(/\\/g, '/'), Buffer.from(buf)) },
    readFile: async (p) => {
      const v = files.get(String(p).replace(/\\/g, '/'))
      if (v === undefined) { const e = new Error('ENOENT'); e.code = 'ENOENT'; throw e }
      return v
    },
    rm: async (p, opts) => {
      const prefix = String(p).replace(/\\/g, '/')
      for (const k of Array.from(files.keys())) if (k === prefix || k.startsWith(prefix + '/')) files.delete(k)
    },
    rename: async (a, b) => {
      const old = String(a).replace(/\\/g, '/')
      const v = files.get(old)
      if (v === undefined) throw new Error('ENOENT')
      files.delete(old)
      files.set(String(b).replace(/\\/g, '/'), v)
    },
  }
}
// 内存 localStorage（defaultStore 探测用）
const lsMem = new Map()
globalThis.localStorage = {
  getItem: (k) => (lsMem.has(k) ? lsMem.get(k) : null),
  setItem: (k, v) => { lsMem.set(k, String(v)) },
  removeItem: (k) => { lsMem.delete(k) },
  key: (i) => Array.from(lsMem.keys())[i] || null,
  get length() { return lsMem.size },
}

const mkEl = (x, y, w, h, type) => Object.assign(createElement({ kind: 'rect', type: type || null }, x, y, w, h), {})
const now = () => new Date().toISOString()

// ---------- 宿主半全流程（内存 domain） ----------
section('wf-service 宿主半（官方存储域）：画布库全流程')
{
  const mediaFs = createMemMediaFs()
  const service = await createWfService({ storageDomain: createMemStorageDomain(), mediaRoot: '/media', unitPath: '/media/wf_canvas.json', mediaFs })

  const id = 'host-1'
  const elA = mkEl(20, 20, 200, 60, 'button')
  elA.text = '登录'

  const r0 = await service.ping()
  ok(r0.ok === true && r0.storage === 'domain', 'ping：存储域就绪')

  await service.saveMeta({ id, name: '宿主画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false })
  const m1 = await service.getMeta(id)
  ok(m1.ok && m1.meta && m1.meta.name === '宿主画布', 'saveMeta → getMeta 往返')

  await service.saveBody(id, { set: { [elA.id]: elA }, remove: [] })
  const b1 = await service.loadBody(id)
  ok(b1.ok && b1.body.elements.length === 1 && b1.body.elements[0].text === '登录', 'saveBody → loadBody 往返')

  // 首次保存（body 缺失 → 以 patch 为全量）+ 增量 patch（set 覆盖 + remove 删除）
  const elA2 = Object.assign({}, elA, { text: '改名' })
  const elB = mkEl(40, 80, 100, 30)
  await service.saveBody(id, { set: { [elA2.id]: elA2, [elB.id]: elB }, remove: [] })
  await service.saveBody(id, { set: {}, remove: [elB.id] })
  const b2 = await service.loadBody(id)
  ok(b2.ok && b2.body.elements.length === 1 && b2.body.elements[0].text === '改名', '增量 patch：set 覆盖 + remove 删除（update RMW）')

  // listMeta 分页 + keyword + 倒序
  await service.saveMeta({ id: 'host-2', name: '第二张', schemaVersion: 1, createdAt: now(), updatedAt: new Date(Date.now() + 1000).toISOString(), elementCount: 0, hasMedia: false })
  const l1 = await service.listMeta({ page: 0, pageSize: 10 })
  ok(l1.ok && l1.total === 2 && l1.items[0].id === 'host-2', 'listMeta：倒序 + 分页')
  const l2 = await service.listMeta({ keyword: '宿主' })
  ok(l2.ok && l2.total === 1, 'listMeta：keyword 过滤')

  // 媒体往返（base64 外置）
  await service.putMedia({ id, key: 'pic.png', base64: Buffer.from('hello-media').toString('base64') })
  const g = await service.getMedia({ id, key: 'pic.png' })
  ok(g.ok && g.media && Buffer.from(g.media.base64, 'base64').toString() === 'hello-media', '媒体 base64 往返（外置文件）')

  // 删除级联（body → meta → 媒体目录）
  await service.remove(id)
  const after = await service.listMeta({})
  ok(after.ok && after.total === 1 && !after.items.some((m) => m.id === id), 'remove：meta/body 删除 + 媒体清理')
  ok(!mediaFs.files.has('/media/' + id + '/pic.png'), 'remove：媒体文件已清理')

  // clear
  await service.clear()
  const cleared = await service.listMeta({})
  ok(cleared.ok && cleared.total === 0, 'clear：清空全部')

  await service.close()
  ok(true, 'close：幂等释放领域')
}

// ---------- 损坏隔离（malformed-medium → .corrupt → 重开空库） ----------
section('损坏隔离（P5）')
{
  const mediaFs = createMemMediaFs()
  mediaFs.files.set('/media/wf_canvas.json', Buffer.from('{broken'))
  const sd = createMemStorageDomain({ failFirstOpen: 'malformed-medium' })
  const service = await createWfService({ storageDomain: sd, mediaRoot: '/media', unitPath: '/media/wf_canvas.json', mediaFs })
  ok(sd.opens === 2, 'open 失败 → 隔离后重开（两次 open）')
  ok(!mediaFs.files.has('/media/wf_canvas.json') && mediaFs.files.has('/media/wf_canvas.json.corrupt'), '损坏单位文件改名 .corrupt 隔离')
  const l = await service.listMeta({})
  ok(l.ok && l.total === 0, '隔离后空库可用（业务不崩）')
  await service.close()
}

// ---------- 旧数据一次性迁移（v4 文件库 → domain） ----------
section('旧数据迁移（~/Documents/界面草图 → domain）')
{
  const { mkdir, writeFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const legacyRoot = join(tmpdir(), 'dsh-wf-legacy-' + Date.now())
  await mkdir(join(legacyRoot, 'canvases', 'legacy-1'), { recursive: true })
  const el = mkEl(10, 10, 100, 40, 'text')
  el.text = '旧数据'
  await writeFile(join(legacyRoot, 'index.json'), JSON.stringify({
    items: [{ id: 'legacy-1', name: '旧画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false }],
  }))
  await writeFile(join(legacyRoot, 'canvases', 'legacy-1', 'body.json'), JSON.stringify({ schemaVersion: 1, elements: [el] }))
  await writeFile(join(legacyRoot, 'canvases', 'legacy-1', 'meta.json'), JSON.stringify({ id: 'legacy-1', name: '旧画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false }))

  const service = await createWfService({ storageDomain: createMemStorageDomain(), mediaRoot: '/media', unitPath: '/media/wf_canvas.json', mediaFs: createMemMediaFs() })
  const r = await migrateLegacy(service, legacyRoot)
  ok(r.migrated === 1, '迁移：1 张旧画布写入 domain')
  const meta = await service.getMeta('legacy-1')
  ok(meta.ok && meta.meta && meta.meta.name === '旧画布', '迁移：meta 一致')
  const body = await service.loadBody('legacy-1')
  ok(body.ok && body.body.elements.length === 1 && body.body.elements[0].text === '旧数据', '迁移：body 一致')
  // 迁移成功 → 目录改名 .migrated
  const { stat, rename: fsRename } = await import('node:fs/promises')
  const renamed = await stat(legacyRoot + '.migrated').then(() => true, () => false)
  ok(renamed, '迁移成功 → 旧目录改名 .migrated')
  // 模拟改名失败/重启：目录恢复原名后再迁移 → 只入不覆盖（已有画布跳过，不再改名）
  await fsRename(legacyRoot + '.migrated', legacyRoot)
  const r2 = await migrateLegacy(service, legacyRoot)
  ok(r2.migrated === 0 && r2.skipped === 1, '迁移：只入不覆盖（已有画布跳过）')
  await service.close()
  const { rm } = await import('node:fs/promises')
  await rm(legacyRoot, { recursive: true, force: true }).catch(() => {})
}

// ---------- domain 适配器（remote 封装）+ 能力探测升级 ----------
section('domain 适配器与探测升级')
{
  // 用内存 domain 构造真 service，再包成「remote 信封」（模拟 api-gateway 载体层）
  const service = await createWfService({ storageDomain: createMemStorageDomain(), mediaRoot: '/media', unitPath: '/media/wf_canvas.json', mediaFs: createMemMediaFs() })
  const fakeRemote = {
    wfStorage: {
      ping: async (args) => ({ ok: true, value: await service.ping() }),
      listMeta: async (args) => ({ ok: true, value: await service.listMeta(args && args.q) }),
      getMeta: async (args) => ({ ok: true, value: await service.getMeta(args && args.id) }),
      loadBody: async (args) => ({ ok: true, value: await service.loadBody(args && args.id) }),
      saveMeta: async (args) => ({ ok: true, value: await service.saveMeta(args && args.meta) }),
      saveBody: async (args) => ({ ok: true, value: await service.saveBody(args && args.id, args && args.patch) }),
      putMedia: async (args) => ({ ok: true, value: await service.putMedia(args && args.arg) }),
      getMedia: async (args) => ({ ok: true, value: await service.getMedia(args && args.arg) }),
      remove: async (args) => ({ ok: true, value: await service.remove(args && args.id) }),
      clear: async () => ({ ok: true, value: await service.clear() }),
    },
  }
  const { createDomainRemote } = await import('../src/core/storage/remote.js')
  const remote = createDomainRemote(fakeRemote)
  const a = domainAdapter(remote)
  ok(a.ready === true, 'remote 就绪 → ready=true')
  const id = 'adapter-1'
  await a.saveMeta({ id, name: '适配器', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false })
  const meta = await a.getMeta(id)
  ok(meta && meta.name === '适配器', '适配器 getMeta 经 remote 信封解析')
  ok(await a.saveBody(id, { set: {}, remove: [] }) === true, '适配器 saveBody 返回 true')
  ok((await a.listMeta({})).total >= 1, '适配器 listMeta 转发')
  await a.remove(id)

  // 无 remote → ready=false + 方法返回安全值（P5）
  const bare = domainAdapter(null)
  ok(bare.ready === false, '无 remote → ready=false')
  const bareList = await bare.listMeta({})
  ok(Array.isArray(bareList.items) && bareList.total === 0, '未初始化调用 → 安全空值（不抛）')

  // probeAdapters：remote 就绪 → domain 优先；否则仅 localStorage
  const list1 = probeAdapters(undefined)
  ok(list1.length === 1 && list1[0].name === 'localStorage', '无 remote → 仅 localStorage（现役兜底）')
  const list2 = probeAdapters(remote)
  ok(list2.length === 2 && list2[0].name === 'domain', 'remote 就绪 → domain 自动升级（业务零改动）')
  await service.close()
}
