// 冒烟测试（手动）：宿主半 wf-service 真文件系统全流程（临时目录）
// 用法：node scripts/smoke-storage.mjs
// 验证：目录布局（wf-canvases/{id}.json 每画布一文件）、原子写产物、损坏隔离、官方域文件迁移
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createWfService } from '../lib/wf-service.js'

const root = await mkdtemp(join(tmpdir(), 'wf-storage-smoke-'))
const storagesRoot = join(root, 'storages')

// 1. 构造旧官方域单位文件（模拟 v2.0.0 数据）→ createWfService 应自动拆分迁移
const oldId = 'old-canvas-1'
await (await import('node:fs/promises')).mkdir(storagesRoot, { recursive: true })
await (await import('node:fs/promises')).writeFile(join(storagesRoot, 'wf_canvas.json'), JSON.stringify({
  unit: { name: 'wf_canvas', version: 1 },
  global: { lastCanvasId: null },
  tables: {
    meta: { [oldId]: { id: oldId, name: '旧画布', schemaVersion: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), elementCount: 1, hasMedia: false } },
    body: { [oldId]: { schemaVersion: 1, elements: [{ id: 'el-old', kind: 'rect', type: 'button', name: '', x: 10, y: 10, w: 100, h: 40, radius: 4, text: '旧按钮', note: '', action: '', inputType: '', optionsText: '', value: '', max: '', alt: '', href: '', label: '', iconSize: '', checked: false, controls: false, autoplay: false, poster: '' }] } },
  },
}))

const service = await createWfService({ storagesRoot, mediaRoot: join(storagesRoot, 'wf-media') })

// 2. 新画布全流程
const now = new Date().toISOString()
const id = 'smoke-1'
await service.saveMeta({ id, name: '冒烟画布', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: 1, hasMedia: false })
const el = { id: 'el-1', kind: 'rect', type: 'button', name: '', x: 10, y: 10, w: 100, h: 40, radius: 4, text: '登录', note: '', action: '', inputType: '', optionsText: '', value: '', max: '', alt: '', href: '', label: '', iconSize: '', checked: false, controls: false, autoplay: false, poster: '' }
await service.saveBody(id, { set: { 'el-1': el }, remove: [] })
await service.putMedia({ id, key: 'pic.png', base64: Buffer.from('smoke-media').toString('base64') })

const meta = await service.getMeta(id)
const body = await service.loadBody(id)
const media = await service.getMedia({ id, key: 'pic.png' })
const list = await service.listMeta({})
const oldMeta = await service.getMeta(oldId)

console.log('getMeta:', meta.ok && meta.meta.name)
console.log('loadBody:', body.ok && body.body.elements.length === 1 && body.body.elements[0].text)
console.log('getMedia:', media.ok && Buffer.from(media.media.base64, 'base64').toString())
console.log('listMeta:', list.ok && list.total === 2)
console.log('迁移旧域文件:', oldMeta.ok && oldMeta.meta.name)

// 3. 目录布局验证（每画布一个 JSON + 归类目录）
const canvasesDir = join(storagesRoot, 'wf-canvases')
const files = await readdir(canvasesDir)
console.log('wf-canvases 文件:', files.sort().join(', '))
const canvasFile = JSON.parse(await readFile(join(canvasesDir, id + '.json'), 'utf8'))
console.log('canvas file:', canvasFile.id, canvasFile.name, 'elements=' + canvasFile.elements.length)
const migrated = await stat(join(storagesRoot, 'wf_canvas.json.migrated')).then(() => true, () => false)
console.log('旧单位文件已改名 .migrated:', migrated)

// 4. 原子写产物（无 .tmp 残留）
const leftovers = files.filter((f) => f.includes('.tmp'))
console.log('原子写无临时残留:', leftovers.length === 0)

// 5. 损坏隔离
await (await import('node:fs/promises')).writeFile(join(canvasesDir, id + '.json'), '{broken')
const broken = await service.loadBody(id)
const corrupt = await stat(join(canvasesDir, id + '.json.corrupt')).then(() => true, () => false)
console.log('损坏隔离:', broken.ok && broken.body === null && corrupt)

await service.remove(id)
await service.close()
await rm(root, { recursive: true, force: true })
console.log('SMOKE OK')
