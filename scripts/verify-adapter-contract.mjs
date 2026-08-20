// 验证脚本：适配器接口契约（P7）——全部适配器必须满足 CanvasStore 契约形状
// 用法：node scripts/verify-adapter-contract.mjs
import { localStorageAdapter } from '../src/core/storage/adapters/localStorage.js'
import { indexedDBAdapter } from '../src/core/storage/adapters/indexedDB.js'
import { hostSQLiteAdapter } from '../src/core/storage/adapters/hostSQLite.js'
import { hostFileAdapter } from '../src/core/storage/adapters/hostFile.js'
import { probeAdapters, defaultStore } from '../src/core/storage/index.js'

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

// CanvasStore 契约方法集（蓝本 4.2）
const CONTRACT = ['listMeta', 'getMeta', 'loadBody', 'saveMeta', 'saveBody', 'putMedia', 'getMedia', 'remove', 'clear']
// 允许的适配器能力扩展字段（非契约方法，但属适配器特有能力/标记）
const EXTRA_ALLOWED = ['name', 'ready', 'rpc', 'sync', 'migrateLegacy']

section('适配器接口契约')
{
  const adapters = [
    ['localStorage', localStorageAdapter()],
    ['indexedDB', indexedDBAdapter()],
    ['hostSQLite', hostSQLiteAdapter()],
    ['hostFile', hostFileAdapter()],
  ]
  for (const [name, a] of adapters) {
    ok(a.name === name, name + ': name 正确')
    for (const m of CONTRACT) {
      ok(typeof a[m] === 'function', name + ': 方法 ' + m + ' 存在且为函数')
    }
    const extra = Object.keys(a).filter((k) => !CONTRACT.includes(k) && !EXTRA_ALLOWED.includes(k))
    ok(extra.length === 0, name + ': 无契约外字段（' + (extra.join(',') || '无') + '）')
  }
  // 预留标记：未实现适配器 ready=false（安全降级前提）
  ok(indexedDBAdapter().ready === false, 'indexedDB: ready=false（预留未启用）')
  ok(hostSQLiteAdapter().ready === false, 'hostSQLite: ready=false（宿主 RPC 未上线）')
  ok(hostFileAdapter(null).ready === false, 'hostFile: 无 rpc → ready=false（未探测到宿主路由）')
  // hostFile 已实现（S6 宿主半）：rpc 就绪 → ready=true
  ok(hostFileAdapter({ call: async () => ({ ok: true }) }).ready === true, 'hostFile: rpc 就绪 → ready=true（正式发布形态）')
}

section('能力探测与安全降级')
{
  // 无宿主 RPC → 仅 localStorage 可用
  const list1 = probeAdapters(undefined)
  ok(list1.length === 1 && list1[0].name === 'localStorage', '无宿主 RPC → 仅 localStorage（安全兜底）')
  // 伪造宿主 RPC（{ call } 形状）→ hostFile 就绪并优先于 localStorage
  const fakeRpc = {
    call: async () => ({ ok: true }),
  }
  const list2 = probeAdapters(fakeRpc)
  ok(list2.length === 2 && list2[0].name === 'hostFile', '宿主 RPC 就绪 → hostFile 优先（hostSQLite 仍预留）')
  // defaultStore 无参调用（现役路径）返回 localStorage
  const s = defaultStore()
  ok(s.name === 'localStorage' && typeof s.saveMeta === 'function', 'defaultStore() 现役返回 localStorage 适配器')
}

section('契约行为冒烟（localStorage 基准）')
{
  const a = localStorageAdapter()
  const id = 'contract-smoke-1'
  const now = new Date().toISOString()
  // 方法签名：调用返回 Promise（async 契约）
  const p1 = a.saveMeta({ id, name: '契约', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: 0, hasMedia: false })
  const p2 = a.listMeta({ page: 0, pageSize: 10 })
  ok(p1 instanceof Promise && p2 instanceof Promise, '契约方法返回 Promise（async 语义）')
  await p1
  await p2
  const meta = await a.getMeta(id)
  ok(meta && meta.id === id, '契约冒烟：saveMeta → getMeta 往返')
  await a.remove(id)
  ok((await a.getMeta(id)) === null, '契约冒烟：remove 生效')
}
