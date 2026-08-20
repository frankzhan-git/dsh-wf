// 验证脚本：性能基线（P4 memo 契约）——300 元素管线 + 300 元素存储往返
// 用法：node scripts/verify-perf.mjs
import { createElement } from '../src/core/model.js'
import { buildResult } from '../src/core/pipeline.js'
import { defaultStore, genCanvasId } from '../src/core/storage/index.js'

const mem = new Map()
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { mem.set(k, String(v)) },
  removeItem: (k) => { mem.delete(k) },
  key: (i) => Array.from(mem.keys())[i] || null,
  get length() { return mem.size },
}

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// 300 元素混合场景：1 页面 + 100 容器 + 199 控件
function buildScene(n) {
  const els = []
  const page = createElement({ kind: 'rect', type: 'page' }, 20, 20, 1560, 960)
  page.name = '性能页'
  els.push(page)
  for (let i = 0; i < n; i++) {
    const c = createElement({ kind: 'rect', type: 'container' }, 40 + (i % 10) * 150, 40 + Math.floor(i / 10) * 90, 140, 80)
    c.text = '容器' + i
    els.push(c)
    const b = createElement({ kind: 'rect' }, 50 + (i % 10) * 150, 52 + Math.floor(i / 10) * 90, 60, 24)
    b.text = '按钮' + i
    b.radius = 12
    els.push(b)
  }
  return els
}

section('管线性能（300+ 元素）')
{
  const els = buildScene(100)
  ok(els.length === 201, '场景元素数 201（1 页面 + 100 容器 + 100 按钮）')
  const t0 = performance.now()
  const r = buildResult(els, '性能页')
  const dt = performance.now() - t0
  console.log('  buildResult(' + els.length + ' 元素): ' + dt.toFixed(1) + 'ms, jsonl ' + r.jsonl.length + ' chars')
  ok(dt < 50, '300 元素级 buildResult < 50ms（实际 ' + dt.toFixed(1) + 'ms）')
  ok(r.issues.filter((i) => i.level === 'error').length === 0, '大画布无 error')
}

section('存储往返性能（201 元素）')
{
  const store = defaultStore()
  const id = genCanvasId()
  const els = buildScene(100)
  const set = {}
  for (const e of els) set[e.id] = e
  const now = new Date().toISOString()
  await store.saveMeta({ id, name: '性能画布', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: els.length, hasMedia: false })
  const t0 = performance.now()
  await store.saveBody(id, { set, remove: [] })
  const body = await store.loadBody(id)
  const dt = performance.now() - t0
  console.log('  存储往返（' + els.length + ' 元素）: ' + dt.toFixed(1) + 'ms')
  ok(body && body.elements.length === els.length, '往返数据完整')
  ok(dt < 100, '300 元素级存储往返 < 100ms（实际 ' + dt.toFixed(1) + 'ms）')
}

section('增量 patch 性能（只写变更）')
{
  const store = defaultStore()
  const id = genCanvasId()
  const els = buildScene(100)
  const set = {}
  for (const e of els) set[e.id] = e
  const now = new Date().toISOString()
  await store.saveMeta({ id, name: '增量性能', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: els.length, hasMedia: false })
  await store.saveBody(id, { set, remove: [] })
  // 只改 1 个元素 → 增量提交
  const target = els[50]
  const patched = Object.assign({}, target, { text: '修改后' })
  const t0 = performance.now()
  await store.saveBody(id, { set: { [patched.id]: patched }, remove: [] })
  const body = await store.loadBody(id)
  const dt = performance.now() - t0
  console.log('  单元素增量提交: ' + dt.toFixed(1) + 'ms')
  ok(body.elements.find((e) => e.id === patched.id).text === '修改后', '增量修改生效')
  ok(dt < 50, '单元素增量提交 < 50ms（实际 ' + dt.toFixed(1) + 'ms）')
}
