// 端到端验证：新建画布业务管线（v3 严格顺序）
// 模拟 useCanvasManager v3：① 旧画布落盘 → ② 新文件落盘（列表刷新）→ ③ 绑定选中 → ④ 展示
//  症状1：点击新建 → 列表立即出现新画布（无需切换）
//  症状2：在新画布绘制容器 → auto-save 保存到新画布（无幽灵画布）
//  症状3：切回新画布 → 默认页面与容器都在，JSONL 根为页面
// 用法：node scripts/verify-newcanvas.mjs
import { createElement, cloneElements } from '../src/core/model.js'
import { localStorageAdapter } from '../src/core/storage/adapters/localStorage.js'
import { defaultStore } from '../src/core/storage/index.js'
import { genCanvasId } from '../src/core/storage/schema.js'
import { buildResult } from '../src/core/pipeline.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }

// ---------- mock localStorage ----------
const mem = new Map()
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  get length() { return mem.size },
  key: (i) => [...mem.keys()][i] || null,
}

const store = defaultStore()
const LIST_PAGE = { page: 0, pageSize: 100 }

// ---------- 串行队列（与 useCanvasManager v2 同构） ----------
let queue = Promise.resolve()
const enqueueSave = (task) => { const run = queue.then(task); queue = run.catch(() => {}); return run }
const tick = () => new Promise((r) => setTimeout(r, 0))

// ---------- persistSnapshot（与 v2 同构：全量 + 显式 remove） ----------
const persistSnapshot = async (id, els, name) => {
  const now = new Date().toISOString()
  const meta = await store.getMeta(id)
  await store.saveMeta({
    id, name, schemaVersion: 1,
    createdAt: meta ? meta.createdAt : now, updatedAt: now,
    elementCount: els.length, hasMedia: false,
  })
  const set = {}
  for (const e of els) set[e.id] = e
  const prev = await store.loadBody(id)
  const remove = (prev && prev.elements) ? prev.elements.filter((p) => !set[p.id]).map((p) => p.id) : []
  const okk = await store.saveBody(id, { set, remove })
  if (!okk) throw new Error('容量不足')
  return id
}

const freshPage = () => [createElement({ kind: 'rect', type: 'page' }, 20, 20, 760, 480)]

// ---------- 准备旧画布 A ----------
const A = genCanvasId()
const btn = createElement({ kind: 'rect', type: 'button' }, 100, 100, 120, 36)
btn.text = '登录'
await persistSnapshot(A, [btn], '旧画布')

// 模拟 useCanvasManager 状态
let currentIdRef = { current: A }
let elements = [btn]
let rootName = '旧画布'
let lastSavedRef = { current: cloneElements([btn]) }

// ---------- 症状1：点击新建 → 列表立即出现新画布 ----------
// newCanvas（v3 严格顺序：先落盘，后绑定+展示）
const oldId = currentIdRef.current
if (oldId) await enqueueSave(() => persistSnapshot(oldId, cloneElements(elements), rootName)) // ① 旧画布落盘
const B = genCanvasId()
const fp = freshPage()
await enqueueSave(() => persistSnapshot(B, fp, '画布')) // ② 新文件落盘（尾部刷新列表）
currentIdRef.current = B // ③ 绑定选中
elements = fp // ④ 展示新画布
lastSavedRef = { current: cloneElements(fp) }
rootName = '画布'
await tick()
const list1 = (await store.listMeta(LIST_PAGE)).items
ok(list1.some((m) => m.id === B), '症状1：点击新建后列表立即出现新画布（无需切换）')
ok(list1.some((m) => m.id === A), '旧画布仍在列表')
ok(currentIdRef.current === B, '新建完成后默认选中新画布')

// ---------- 症状2+3：新画布绘制容器 → auto-save → 切换/切回 ----------
// 用户绘制容器 C（在页面内），模拟 auto-save flushSave（v2：currentId 已绑定 B → 保存到 B）
const C = createElement({ kind: 'rect' }, 60, 60, 300, 200)
C.type = 'container'
elements = [fp[0], C]
const result = buildResult(elements, rootName)
enqueueSave(async () => {
  await persistSnapshot(currentIdRef.current, cloneElements(elements), rootName)
  lastSavedRef = { current: cloneElements(elements) }
})
await tick()

const list2 = (await store.listMeta(LIST_PAGE)).items
ok(list2.some((m) => m.id === B), '症状2：绘制后 auto-save 保存到新画布 B（无幽灵画布）')
ok(list2.filter((m) => m.id !== A && m.id !== B).length === 0, '无幽灵画布（仅 A 与 B 两个文档）')

// 切换画布（loadCanvas 语义）：保存当前 → 读目标
const flushSaveNow = () => enqueueSave(async () => {
  await persistSnapshot(currentIdRef.current, cloneElements(elements), rootName)
  lastSavedRef = { current: cloneElements(elements) }
})
await flushSaveNow()
const bodyB = await store.loadBody(B)
const pageInB = bodyB.elements.some((e) => e.type === 'page')
const cInB = bodyB.elements.some((e) => e.id === C.id)
ok(pageInB && cInB, '症状3：切回新画布，默认页面与容器都在（body 完整）')
const tree = buildResult(bodyB.elements, '画布')
const rootIsPage = tree.tree && tree.tree.type === 'page'
ok(rootIsPage, '症状3：JSONL 根为页面（容器为子节点）')
console.log('B 的 JSONL:', tree.jsonl)
