// 验证脚本：宿主存储半（正式发布形态）——wf-storage 工厂 + hostFile 适配器 + 能力探测升级
// 用法：node scripts/verify-host-storage.mjs
// 宿主半用注入式依赖（{ fs, shell, root }）：这里用内存 fs mock + 假 shell 全流程测试
import { createWfStorageHandlers } from '../lib/wf-storage.js'
import { hostFileAdapter } from '../src/core/storage/adapters/hostFile.js'
import { probeAdapters, defaultStore } from '../src/core/storage/index.js'
import { createElement } from '../src/core/model.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// ---------- 内存文件系统 mock（形状同 DSH fs 服务） ----------
const files = new Map() // '/root/dsh-wf/...' → 文本内容
const media = new Map() // 二进制（Buffer）
const mk = (p) => { files.set(p, '') }

// 内存 fs 适配器（形状：resolve/stat/readText/writeText/listDir + displayPath）
function createMemFs(root) {
  const norm = (p) => String(p).replace(/\\/g, '/')
  const abs = (p, opts) => {
    const cwd = (opts && opts.cwd) || root
    const full = norm(cwd) + '/' + norm(p).replace(/^\.\//, '')
    return { displayPath: full, targetKey: full }
  }
  const parents = (p) => {
    const segs = p.split('/').filter(Boolean)
    const out = []
    for (let i = 1; i < segs.length; i++) out.push('/' + segs.slice(0, i).join('/'))
    return out
  }
  // 判断 p 是否为目录（存在子条目；空目录 = 有 mk 空条目且非文件内容）
  const isDir = (p) => {
    for (const k of files.keys()) if (k.startsWith(p + '/')) return true
    for (const k of media.keys()) if (k.startsWith(p + '/')) return true
    return false
  }
  return {
    root,
    resolve: async (p, opts) => abs(p, opts),
    stat: async (t) => {
      const p = t.displayPath
      if (media.has(p)) return { type: 'file', size: media.get(p).length, target: t }
      if (files.has(p) && files.get(p) !== '') return { type: 'file', size: files.get(p).length, target: t }
      if (files.has(p) && isDir(p)) return { type: 'directory', size: null, target: t }
      if (isDir(p)) return { type: 'directory', size: null, target: t }
      if (files.has(p)) return { type: 'file', size: files.get(p).length, target: t }
      return null
    },
    readText: async (t) => { const v = files.get(t.displayPath); return v === undefined ? null : v },
    writeText: async (t, text) => {
      files.set(t.displayPath, text)
      for (const pa of parents(t.displayPath)) if (!files.has(pa) && !media.has(pa)) mk(pa)
    },
    listDir: async (t) => {
      const p = t.displayPath
      const kids = new Map()
      for (const k of files.keys()) {
        if (k.startsWith(p + '/')) {
          const rest = k.slice(p.length + 1)
          const name = rest.split('/')[0]
          if (!kids.has(name)) {
            const full = p + '/' + name
            kids.set(name, { name, type: isDir(full) ? 'directory' : 'file', size: isDir(full) ? null : files.get(k).length })
          }
        }
      }
      for (const k of media.keys()) {
        if (k.startsWith(p + '/')) {
          const rest = k.slice(p.length + 1)
          const name = rest.split('/')[0]
          if (!kids.has(name)) kids.set(name, { name, type: 'file', size: media.get(k).length })
        }
      }
      return Array.from(kids.values())
    },
  }
}
const memFs = createMemFs('/root')
// 内存 mediaFs（注入：媒体二进制 + 损坏改名隔离）
const memMediaFs = {
  writeFile: async (path, buf) => { media.set(path, buf) },
  readFile: async (path) => { const v = media.get(path); if (v === undefined) throw new Error('ENOENT'); return v },
  rename: async (oldPath, newPath) => {
    if (files.has(oldPath)) { const v = files.get(oldPath); files.delete(oldPath); files.set(newPath, v); return }
    throw new Error('ENOENT')
  },
}
// 假 shell：删除 = 清掉内存中的目录内容
const fakeShell = {
  resolve: (spec) => spec,
  run: async (spec) => {
    const cmd = spec.command
    const m = cmd.match(/['"]([^'"]+)['"]/)
    const target = m ? m[1] : null
    if (target) {
      for (const k of Array.from(files.keys())) if (k.startsWith(target + '/') || k === target) files.delete(k)
      for (const k of Array.from(media.keys())) if (k.startsWith(target + '/') || k === target) media.delete(k)
    }
    return { exitCode: 0, stdout: { text: '' }, stderr: { text: '' } }
  },
}

const handlers = createWfStorageHandlers({ fs: memFs, shell: fakeShell, root: '/root', mediaFs: memMediaFs })
// 包一层：模拟路由分发（{ method, args } → result）
const route = async (method, args) => {
  const fn = handlers[method]
  if (!fn) return { ok: false, error: '未知方法：' + method }
  try { return await fn(args || {}) } catch (e) { return { ok: false, error: e.message || String(e) } }
}

const mkEl = (x, y, w, h, type) => Object.assign(createElement({ kind: 'rect', type: type || null }, x, y, w, h), {})
const now = () => new Date().toISOString()

// ---------- 宿主半全流程 ----------
section('wf-storage 宿主半：画布库全流程')
{
  const id = 'host-1'
  const elA = mkEl(20, 20, 200, 60, 'button')
  elA.text = '登录'

  const r0 = await route('ping')
  ok(r0.ok === true && r0.root === '/root', 'ping：路由就绪 + root 返回')

  await route('saveMeta', { meta: { id, name: '宿主画布', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 1, hasMedia: false } })
  const m1 = await route('getMeta', { id })
  ok(m1.ok && m1.meta && m1.meta.name === '宿主画布', 'saveMeta → getMeta 往返')

  await route('saveBody', { id, patch: { set: { [elA.id]: elA }, remove: [] } })
  const b1 = await route('loadBody', { id })
  ok(b1.ok && b1.body.elements.length === 1 && b1.body.elements[0].text === '登录', 'saveBody → loadBody 往返')

  // 增量 patch：改元素 + 删元素
  const elA2 = Object.assign({}, elA, { text: '改名' })
  const elB = mkEl(40, 80, 100, 30)
  await route('saveBody', { id, patch: { set: { [elA2.id]: elA2, [elB.id]: elB }, remove: [] } })
  await route('saveBody', { id, patch: { set: {}, remove: [elB.id] } })
  const b2 = await route('loadBody', { id })
  ok(b2.ok && b2.body.elements.length === 1 && b2.body.elements[0].text === '改名', '增量 patch：set 覆盖 + remove 删除')

  // listMeta 分页 + keyword
  await route('saveMeta', { meta: { id: 'host-2', name: '第二张', schemaVersion: 1, createdAt: now(), updatedAt: new Date(Date.now() + 1000).toISOString(), elementCount: 0, hasMedia: false } })
  const l1 = await route('listMeta', { page: 0, pageSize: 10 })
  ok(l1.ok && l1.total === 2 && l1.items[0].id === 'host-2', 'listMeta：倒序 + 分页')
  const l2 = await route('listMeta', { keyword: '宿主' })
  ok(l2.ok && l2.total === 1, 'listMeta：keyword 过滤')

  // 媒体往返（base64）
  await route('putMedia', { id, key: 'pic.png', base64: Buffer.from('hello-media').toString('base64') })
  const g = await route('getMedia', { id, key: 'pic.png' })
  ok(g.ok && g.media && Buffer.from(g.media.base64, 'base64').toString() === 'hello-media', '媒体 base64 往返')

  // 删除级联
  await route('remove', { id })
  const after = await route('listMeta', {})
  ok(after.ok && after.total === 1 && !after.items.some((m) => m.id === id), 'remove：index 移除 + 目录删除')

  // clear
  await route('clear')
  const cleared = await route('listMeta', {})
  ok(cleared.ok && cleared.total === 0, 'clear：清空全部')
}

// ---------- 损坏隔离 / 索引重建 ----------
section('损坏隔离与索引重建')
{
  const id = 'corrupt-1'
  await route('saveMeta', { meta: { id, name: '损坏测试', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false } })
  // body.json 写坏
  files.set('/root/dsh-wf/canvases/' + id + '/body.json', '{broken')
  const b = await route('loadBody', { id })
  ok(b.ok && b.body === null, 'body.json 损坏 → 隔离返回 null（不抛）')
  ok(files.has('/root/dsh-wf/canvases/' + id + '/body.json.corrupt'), '损坏文件改名 .corrupt 隔离')

  // index.json 损坏 → 扫描单画布 meta.json 重建
  files.set('/root/dsh-wf/index.json', 'garbage')
  const l = await route('listMeta', {})
  ok(l.ok && l.items.some((m) => m.id === id && m.name === '损坏测试'), 'index.json 损坏 → 扫描 canvases/*/meta.json 重建')
}

// ---------- hostFile 适配器（rpc 转发）+ 能力探测升级 ----------
section('hostFile 适配器与探测升级')
{
  // mock rpc：直接转发到 route（模拟 fetch 封装）
  const mockRpc = { call: async (method, args) => route(method, args) }
  const a = hostFileAdapter(mockRpc)
  ok(a.ready === true, '有 rpc.call → ready=true')
  const id = 'adapter-1'
  await a.saveMeta({ id, name: '适配器', schemaVersion: 1, createdAt: now(), updatedAt: now(), elementCount: 0, hasMedia: false })
  const meta = await a.getMeta(id)
  ok(meta && meta.name === '适配器', '适配器 getMeta 经 rpc 转发')
  ok(await a.saveBody(id, { set: {}, remove: [] }) === true, '适配器 saveBody 返回 true')
  ok((await a.listMeta({})).total >= 1, '适配器 listMeta 转发')

  // 无 rpc → ready=false + 方法返回安全值（P5：不崩不静默抛错）
  const bare = hostFileAdapter(null)
  ok(bare.ready === false, '无 rpc → ready=false')
  const bareList = await bare.listMeta({})
  ok(Array.isArray(bareList.items) && bareList.total === 0, '未初始化调用 → 安全空值（不抛）')

  // probeAdapters：宿主 rpc 存在 → hostFile 优先；不存在 → 仅 localStorage
  const list1 = probeAdapters(undefined)
  ok(list1.length === 1 && list1[0].name === 'localStorage', '无宿主 rpc → 仅 localStorage（现役兜底）')
  const list2 = probeAdapters(mockRpc)
  ok(list2.length === 2 && list2[0].name === 'hostFile', '宿主 rpc 就绪 → hostFile 自动升级（业务零改动）')
}

section('文件布局（可读可 git 卖点）')
{
  const keys = Array.from(files.keys()).filter((k) => k.startsWith('/root/dsh-wf/'))
  ok(keys.some((k) => /index\.json$/.test(k)), 'index.json 存在（meta 聚合）')
  ok(keys.some((k) => /canvases\/adapter-1\/meta\.json$/.test(k)), '单画布 meta.json 存在（冗余恢复源）')
  ok(keys.some((k) => /canvases\/adapter-1\/body\.json$/.test(k)), '单画布 body.json 存在')
  console.log('  布局示例：')
  for (const k of keys.slice(0, 6)) console.log('    ' + k)
}
