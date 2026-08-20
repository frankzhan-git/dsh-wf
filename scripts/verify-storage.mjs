// 验证脚本：存储层（P7）——文档库语义 / 增量 patch / 损坏隔离 / 迁移 / 容量 / 导出导入
// 用法：node scripts/verify-storage.mjs
// node 环境无 localStorage → 用内存 mock 注入 window
import { createElement } from '../src/core/model.js'

const mem = new Map()
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { mem.set(k, String(v)) },
  removeItem: (k) => { mem.delete(k) },
  key: (i) => Array.from(mem.keys())[i] || null,
  get length() { return mem.size },
}

const { defaultStore, exportCanvasFile, importCanvasFile, genCanvasId } = await import('../src/core/storage/index.js')
const { migrateFile } = await import('../src/core/storage/migrate.js')
const { sanitizeElements } = await import('../src/core/storage/integrity.js')
const { localStorageAdapter, CAPACITY_LIMIT } = await import('../src/core/storage/adapters/localStorage.js')

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

const mkEl = (x, y, w, h, type) => Object.assign(createElement({ kind: 'rect', type: type || null }, x, y, w, h), {})

// ---------- 文档库语义：meta/body 分离 + 增量 patch 往返 ----------
section('meta/body 分离与增量 patch')
{
  const store = localStorageAdapter()
  const id = genCanvasId()
  const now = new Date().toISOString()
  const elA = mkEl(20, 20, 300, 40)
  const elB = mkEl(20, 80, 300, 40)
  await store.saveMeta({ id, name: '测试画布', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: 2, hasMedia: false })
  const ok1 = await store.saveBody(id, { set: { [elA.id]: elA, [elB.id]: elB }, remove: [] })
  ok(ok1 === true, 'saveBody 全量写入成功')

  const meta = await store.getMeta(id)
  ok(meta && meta.name === '测试画布' && meta.elementCount === 2, 'getMeta 轻量读取（不触 body）')

  const listed = await store.listMeta({ page: 0, pageSize: 10 })
  ok(listed.total === 1 && listed.items[0].id === id, 'listMeta 分页返回')

  const body1 = await store.loadBody(id)
  ok(body1.elements.length === 2, 'loadBody 全量读取')

  // 增量 patch：只改 B + 删除 A
  const elB2 = Object.assign({}, elB, { text: '改名' })
  const ok2 = await store.saveBody(id, { set: { [elB2.id]: elB2 }, remove: [elA.id] })
  ok(ok2 === true, '增量 patch 写入成功')
  const body2 = await store.loadBody(id)
  ok(body2.elements.length === 1 && body2.elements[0].id === elB.id && body2.elements[0].text === '改名', 'patch 合并：set 覆盖 + remove 删除')

  // id 稳定性：重复 save 不产生新条目
  await store.saveMeta({ id, name: '测试画布2', schemaVersion: 1, createdAt: now, updatedAt: new Date().toISOString(), elementCount: 1, hasMedia: false })
  const listed2 = await store.listMeta({})
  ok(listed2.total === 1 && listed2.items[0].name === '测试画布2', 'saveMeta upsert：同 id 不重复')

  // 列表倒序（updatedAt 新者在前）
  const id2 = genCanvasId()
  await store.saveMeta({ id: id2, name: '新画布', schemaVersion: 1, createdAt: now, updatedAt: new Date(Date.now() + 1000).toISOString(), elementCount: 0, hasMedia: false })
  const listed3 = await store.listMeta({})
  ok(listed3.items[0].id === id2, 'listMeta 按 updatedAt 倒序')

  // 分页 + keyword
  const page0 = await store.listMeta({ page: 0, pageSize: 1 })
  const page1 = await store.listMeta({ page: 1, pageSize: 1 })
  ok(page0.items.length === 1 && page1.items.length === 1 && page0.items[0].id !== page1.items[0].id, 'listMeta 分页正确')
  const kw = await store.listMeta({ keyword: '测试画布' })
  ok(kw.total === 1 && kw.items[0].name === '测试画布2', 'listMeta keyword 过滤')

  // 级联删除
  await store.remove(id)
  const after = await store.listMeta({})
  ok(after.total === 1 && !after.items.some((m) => m.id === id), 'remove 级联删除 meta+body')
  ok(await store.loadBody(id) === null, '删除后 loadBody 为 null')
}

// ---------- 损坏隔离 / 结构清洗 ----------
section('损坏隔离与清洗')
{
  const store = localStorageAdapter()
  const id = genCanvasId()
  mem.set('dsh-wf:body:' + id, '{broken json')
  const body = await store.loadBody(id)
  ok(body === null, '损坏 JSON → loadBody null（不抛）')

  const bad = [mkEl(1, 2, 3, 4), { id: 'no-xy' }, null, 'str', { id: 'ok', x: 0, y: 0, w: 10, h: 10 }]
  const r = sanitizeElements(bad)
  ok(r.elements.length === 2 && r.dropped === 3, 'sanitizeElements：非法元素丢弃并计数')
}

// ---------- 迁移：v0 旧键 → v1 CanvasFile ----------
section('旧键迁移')
{
  const store = localStorageAdapter()
  const oldEntry = {
    id: 'legacy-1', time: '2025-01-01T00:00:00.000Z', name: '旧画布',
    jsonl: '{"type":"container"}', canvasNote: '旧备注',
    elements: [mkEl(10, 10, 100, 40)],
  }
  mem.set('dsh-wf.history.v1', JSON.stringify([oldEntry]))
  const n = await store.migrateLegacy()
  ok(n === 1, '旧键迁移 1 条')
  ok(!mem.has('dsh-wf.history.v1'), '迁移后旧键删除')
  const meta = await store.getMeta('legacy-1')
  ok(meta && meta.name === '旧画布', '迁移后 meta 可读')
  const body = await store.loadBody('legacy-1')
  ok(body && body.elements.length === 1, '迁移后 body 可读')
  ok(await store.migrateLegacy() === 0, '重复迁移幂等（无旧键）')

  // migrateFile 纯函数：v0 → v1 / v1 原样 / 非法 null
  const cf = migrateFile(oldEntry)
  ok(cf.schemaVersion === 1 && cf.meta.source === 'migrated' && cf.meta.canvasNote === '旧备注', 'migrateFile：v0 → v1 无损（未知字段保留）')
  ok(migrateFile({ schemaVersion: 1, id: 'x', name: 'y', elements: [] }) === undefined || migrateFile({ schemaVersion: 1, id: 'x', name: 'y', elements: [] }).schemaVersion === 1, 'migrateFile：v1 原样返回')
  ok(migrateFile(null) === null && migrateFile('str') === null, 'migrateFile：非法输入 null')
}

// ---------- 容量探测 ----------
section('容量探测')
{
  const store = localStorageAdapter()
  const id = genCanvasId()
  const big = { id: 'big', x: 0, y: 0, w: 10, h: 10, text: 'x'.repeat(CAPACITY_LIMIT) }
  const okBig = await store.saveBody(id, { set: { big: big }, remove: [] })
  ok(okBig === false, '超容量 body → saveBody false（不写坏数据）')
}

// ---------- 导出 / 导入（CanvasFile 重建） ----------
section('导出导入')
{
  const store = localStorageAdapter()
  const id = genCanvasId()
  const elA = mkEl(20, 20, 200, 60)
  elA.text = '登录'
  elA.type = 'button'
  await store.saveMeta({ id, name: '导出画布', schemaVersion: 1, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z', elementCount: 1, hasMedia: false })
  await store.saveBody(id, { set: { [elA.id]: elA }, remove: [] })

  const cf = await exportCanvasFile(store, id)
  ok(cf && cf.schemaVersion === 1 && cf.name === '导出画布' && cf.elements.length === 1, 'exportCanvasFile：meta+body 组装完整文件')

  // 导入：新 id 新建（绝不覆盖）
  const r = await importCanvasFile(store, cf)
  ok(r.ok === true && r.id !== id, 'importCanvasFile：重新分配 id')
  const imported = await store.getMeta(r.id)
  ok(imported && imported.name === '导出画布' && imported.elementCount === 1, '导入后 meta 可读')
  const importedBody = await store.loadBody(r.id)
  ok(importedBody.elements[0].text === '登录' && importedBody.elements[0].type === 'button', '导入后元素完整')

  const rBad = await importCanvasFile(store, { foo: 'bar' })
  ok(rBad.ok === false, '非法文件 → 导入失败不抛')

  // clear
  await store.clear()
  const after = await store.listMeta({})
  ok(after.total === 0, 'clear 清空全部')
}

// ---------- defaultStore 装配（迁移在装配时执行） ----------
section('defaultStore 装配')
{
  mem.clear()
  mem.set('dsh-wf.history.v1', JSON.stringify([{ id: 'auto-1', time: '2025-02-01T00:00:00.000Z', name: '自动迁移', elements: [mkEl(1, 1, 50, 50)] }]))
  const store = defaultStore()
  const listed = await store.listMeta({})
  ok(listed.total === 1 && listed.items[0].name === '自动迁移', 'defaultStore 装配时自动执行旧键迁移')
  ok(store.sync !== undefined, 'localStorage 适配器提供 sync 同步变体')
  const syncBody = store.sync.loadBody('auto-1')
  ok(syncBody && syncBody.elements.length === 1, 'sync 变体同步读取 body')
}
