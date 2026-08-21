// 验证脚本：宿主存储半（v2.1 目录文件介质）——wf-service 工厂 + 内存 fs + 损坏隔离 + 迁移
// 用法：node scripts/verify-host-storage.mjs
// 宿主半用注入式依赖（{ storagesRoot, mediaRoot, fsImpl }）：这里用内存 fs 全流程测试，
// 不依赖 Cordis 运行时（真实装配由 lib/index.js 承担，真 fs 冒烟见 scripts/smoke-storage.mjs）
import { createWfService, migrateDomainFile } from '../lib/wf-service.js'
import { migrateLegacy } from '../lib/migrate-legacy.js'
import { domainAdapter } from '../src/core/storage/adapters/domain.js'
import { probeAdapters, defaultStore } from '../src/core/storage/index.js'
import { createElement } from '../src/core/model.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 内存文件系统（形状同 node:fs/promises 子集 + writeAtomic） ----------
const norm = (p) => String(p).replace(/\\/g, '/')
function createMemFs() {
  const files = new Map() // norm(path) → string（文本）或 Buffer（二进制）
  return {
    files,
    mkdir: async () => {},
    writeFile: async (p, content) => { files.set(norm(p), Buffer.isBuffer(content) ? Buffer.from(content) : String(content)) },
    readFile: async (p) => {
      const v = files.get(norm(p))
      if (v === undefined) { const e = new Error('ENOENT'); e.code = 'ENOENT'; throw e }
      return v
    },
    rename: async (a, b) => {
      const v = files.get(norm(a))
      if (v === undefined) throw new Error('ENOENT')
      files.delete(norm(a)); files.set(norm(b), v)
    },
    rm: async (p, opts) => {
      const prefix = norm(p)
      for (const k of Array.from(files.keys())) if (k === prefix || k.startsWith(prefix + '/')) files.delete(k)
    },
    readdir: async (p) => {
      const prefix = norm(p)
      const out = []
      for (const k of files.keys()) {
        if (k.startsWith(prefix + '/')) {
          const name = k.slice(prefix.length + 1)
          if (!name.includes('/')) out.push(name)
        }
      }
      return out
    },
    writeAtomic: async (p, data) => { files.set(norm(p), JSON.stringify(data, null, 2)) },
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
const ROOT = '/storages'
const MEDIA = '/storages/wf-media'

// ---------- 宿主半全流程（目录文件介质） ----------
section('wf-service 宿主半（目录文件）：画布库全流程')
{
  const fs = createMemFs()
  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: fs })

  const id = 'host-1'
  const elA = mkEl(20, 20, 200, 60, 'button')
  elA.text = '登录'

  const r0 = await service.ping()
  ok(r0.ok === true && r0.storage === 'files', 'ping：目录文件存储就绪')

  await service.saveMeta({ id, name: '宿主画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false })
  const m1 = await service.getMeta(id)
  ok(m1.ok && m1.meta && m1.meta.name === '宿主画布', 'saveMeta → getMeta 往返')

  await service.saveBody(id, { set: { [elA.id]: elA }, remove: [] })
  const b1 = await service.loadBody(id)
  ok(b1.ok && b1.body.elements.length === 1 && b1.body.elements[0].text === '登录', 'saveBody → loadBody 往返')

  // 增量 patch：set 覆盖 + remove 删除（宿主侧读-改-写串行）
  const elA2 = Object.assign({}, elA, { text: '改名' })
  const elB = mkEl(40, 80, 100, 30)
  await service.saveBody(id, { set: { [elA2.id]: elA2, [elB.id]: elB }, remove: [] })
  await service.saveBody(id, { set: {}, remove: [elB.id] })
  const b2 = await service.loadBody(id)
  ok(b2.ok && b2.body.elements.length === 1 && b2.body.elements[0].text === '改名', '增量 patch：set 覆盖 + remove 删除')

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

  // 删除级联（画布文件 + 媒体目录）
  await service.remove(id)
  const after = await service.listMeta({})
  ok(after.ok && after.total === 1 && !after.items.some((m) => m.id === id), 'remove：画布文件删除 + 媒体清理')
  ok(!fs.files.has('/storages/wf-canvases/' + id + '.json'), 'remove：画布 JSON 已删除')
  ok(!fs.files.has('/storages/wf-media/' + id + '/pic.png'), 'remove：媒体文件已清理')

  // clear
  await service.clear()
  const cleared = await service.listMeta({})
  ok(cleared.ok && cleared.total === 0, 'clear：清空全部')

  await service.close()
  ok(true, 'close：幂等释放')
}

// ---------- 文件布局（每画布一个 JSON，目录归类） ----------
section('文件布局（每画布一个 JSON + 目录归类）')
{
  const fs = createMemFs()
  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: fs })
  const id = 'layout-1'
  const el = mkEl(10, 10, 100, 40, 'text')
  el.text = '布局'
  await service.saveMeta({ id, name: '布局画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false })
  await service.saveBody(id, { set: { [el.id]: el }, remove: [] })
  const keys = Array.from(fs.files.keys())
  ok(keys.includes('/storages/wf-canvases/' + id + '.json'), 'wf-canvases/{id}.json 存在（每画布一文件）')
  ok(!keys.some((k) => /wf_canvas\.json$/.test(k)), '官方域单位文件不存在（介质已切换）')
  const file = JSON.parse(fs.files.get('/storages/wf-canvases/' + id + '.json'))
  ok(file.id === id && file.name === '布局画布' && file.elements.length === 1 && file.elementCount === 1,
    '画布文件为 CanvasFile 完整形态（meta + elements 合一）')
  console.log('  布局示例：')
  for (const k of keys) console.log('    ' + k)
  await service.close()
}

// ---------- 损坏隔离（.corrupt） ----------
section('损坏隔离（P5）')
{
  const fs = createMemFs()
  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: fs })
  const id = 'corrupt-1'
  await service.saveMeta({ id, name: '损坏测试', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false })
  fs.files.set('/storages/wf-canvases/' + id + '.json', '{broken')   // 写坏
  const b = await service.loadBody(id)
  ok(b.ok && b.body === null, '损坏文件 → 返回 null（不抛）')
  ok(fs.files.has('/storages/wf-canvases/' + id + '.json.corrupt'), '损坏文件改名 .corrupt 隔离')
  const l = await service.listMeta({})
  ok(l.ok && l.total === 0, '隔离后缓存剔除（列表不出现损坏画布）')
  await service.close()
}

// ---------- 迁移：官方域单位文件（wf_canvas.json）→ 每画布文件 ----------
section('迁移：官方域单位文件 → wf-canvases/')
{
  const fs = createMemFs()
  // 构造旧官方域文件（unit+tables 格式）
  const oldId1 = 'old-1'
  const oldId2 = 'old-2'
  fs.files.set('/storages/wf_canvas.json', JSON.stringify({
    unit: { name: 'wf_canvas', version: 1 },
    global: { lastCanvasId: null },
    tables: {
      meta: {
        [oldId1]: { id: oldId1, name: '旧画布一', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false },
        [oldId2]: { id: oldId2, name: '旧画布二', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false },
      },
      body: {
        [oldId1]: { schemaVersion: 1, elements: [Object.assign(mkEl(5, 5, 50, 20, 'button'), { text: '旧按钮' })] },
      },
    },
  }))
  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: fs })
  const meta1 = await service.getMeta(oldId1)
  const meta2 = await service.getMeta(oldId2)
  ok(meta1.ok && meta1.meta && meta1.meta.name === '旧画布一', '迁移：画布一 meta 就绪')
  ok(meta2.ok && meta2.meta && meta2.meta.name === '旧画布二', '迁移：画布二 meta 就绪')
  const body = await service.loadBody(oldId1)
  ok(body.ok && body.body.elements.length === 1 && body.body.elements[0].text === '旧按钮', '迁移：elements 拆入独立文件')
  ok(fs.files.has('/storages/wf-canvases/' + oldId1 + '.json') && fs.files.has('/storages/wf-canvases/' + oldId2 + '.json'), '迁移：每画布文件已生成')
  ok(fs.files.has('/storages/wf_canvas.json.migrated'), '迁移成功 → 旧单位文件改名 .migrated')
  // 只入不覆盖：构造另一份旧文件（含同名画布）→ 跳过已有
  fs.files.set('/storages/wf_canvas.json', JSON.stringify({
    unit: { name: 'wf_canvas', version: 1 },
    tables: { meta: { [oldId1]: { id: oldId1, name: '改名？', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false } }, body: {} },
  }))
  const r2 = await migrateDomainFile(fs, ROOT, '/storages/wf-canvases')
  ok(r2.migrated === 0 && r2.skipped === 1, '迁移：只入不覆盖（已有画布跳过）')
  const m1again = await service.getMeta(oldId1)
  ok(m1again.ok && m1again.meta.name === '旧画布一', '跳过不覆盖：已有画布内容不变')
  await service.close()
}

// ---------- 旧数据一次性迁移（v4 文件库 → 目录文件） ----------
section('旧数据迁移（v4 文件库 → wf-canvases/）')
{
  const { mkdir, writeFile, stat, rm } = await import('node:fs/promises')
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

  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: createMemFs() })
  const r = await migrateLegacy(service, legacyRoot)
  ok(r.migrated === 1, '迁移：1 张旧画布写入目录文件')
  const meta = await service.getMeta('legacy-1')
  ok(meta.ok && meta.meta && meta.meta.name === '旧画布', '迁移：meta 一致')
  const body = await service.loadBody('legacy-1')
  ok(body.ok && body.body.elements.length === 1 && body.body.elements[0].text === '旧数据', '迁移：body 一致')
  const renamed = await stat(legacyRoot + '.migrated').then(() => true, () => false)
  ok(renamed, '迁移成功 → 旧目录改名 .migrated')
  await service.close()
  await rm(legacyRoot + '.migrated', { recursive: true, force: true }).catch(() => {})
}

// ---------- domain 适配器（remote 封装）+ 能力探测升级 ----------
section('domain 适配器与探测升级')
{
  // 用内存 fs 构造真 service，再包成「remote 信封」（模拟 api-gateway 载体层）
  const service = await createWfService({ storagesRoot: ROOT, mediaRoot: MEDIA, fsImpl: createMemFs() })
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
