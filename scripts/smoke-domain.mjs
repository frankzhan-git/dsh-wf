// 冒烟测试（手动）：宿主半 wf-service 与真实官方存储三件套协同（临时目录 json 后端）
// 用法：node scripts/smoke-domain.mjs
// 验证：wf 副本的 dsh-storage-domain 与 DSH 运行时同版本 API 兼容 + 真实 JSON 后端原子写全流程
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import * as storageJson from '@deepseek-ai/dsh-storage-json'
import * as storageDomain from '@deepseek-ai/dsh-storage-domain'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createWfService } from '../lib/wf-service.js'

const root = await mkdtemp(join(tmpdir(), 'wf-domain-smoke-'))
const mediaRoot = join(root, 'wf-media')

const ctx = new Context()
await ctx.plugin(Storage)
await ctx.plugin({ name: storageJson.name, inject: storageJson.inject, apply: storageJson.apply }, { root: join(root, 'storages') })
await ctx.plugin({ name: storageDomain.name, inject: storageDomain.inject, apply: storageDomain.apply }, { backend: 'json' })

const service = await createWfService({
  storageDomain: ctx.storageDomain,
  mediaRoot,
  unitPath: join(root, 'storages', 'wf_canvas.json'),
})

const now = new Date().toISOString()
await service.saveMeta({ id: 'smoke-1', name: '冒烟画布', schemaVersion: 1, createdAt: now, updatedAt: now, elementCount: 1, hasMedia: false })
const el = { id: 'el-1', kind: 'rect', type: 'button', name: '', x: 10, y: 10, w: 100, h: 40, radius: 4, text: '登录', note: '', action: '', inputType: '', optionsText: '', value: '', max: '', alt: '', href: '', label: '', iconSize: '', checked: false, controls: false, autoplay: false, poster: '', direction: undefined, wrap: undefined, dragTmp: undefined }
await service.saveBody('smoke-1', { set: { 'el-1': el }, remove: [] })
await service.putMedia({ id: 'smoke-1', key: 'pic.png', base64: Buffer.from('smoke-media').toString('base64') })

const meta = await service.getMeta('smoke-1')
const body = await service.loadBody('smoke-1')
const media = await service.getMedia({ id: 'smoke-1', key: 'pic.png' })
const list = await service.listMeta({})

console.log('getMeta:', meta.ok && meta.meta.name)
console.log('loadBody:', body.ok && body.body.elements.length === 1 && body.body.elements[0].text)
console.log('getMedia:', media.ok && Buffer.from(media.media.base64, 'base64').toString())
console.log('listMeta:', list.ok && list.total)

// 单位文件落盘验证（原子写产物）
const unitText = await readFile(join(root, 'storages', 'wf_canvas.json'), 'utf8')
const unit = JSON.parse(unitText)
console.log('unit:', unit.unit.name, 'v' + unit.unit.version, '| tables:', Object.keys(unit.tables).join(','), '| meta rows:', Object.keys(unit.tables.meta).length, '| body rows:', Object.keys(unit.tables.body).length)

await service.remove('smoke-1')
const after = await service.listMeta({})
console.log('after remove:', after.ok && after.total === 0)

await service.close()
await rm(root, { recursive: true, force: true })
console.log('SMOKE OK')
