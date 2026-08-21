// dsh-wf 旧数据一次性迁移：v4 文件库（~/Documents/界面草图/dsh-wf/）→ wf_canvas domain
// 尽力而为（P5）：无旧库/索引损坏 → 跳过；单画布失败 → 跳过继续；全部成功 → 目录改名 .migrated
// 只入不覆盖：domain 已有同名画布 → 跳过
import { readFile, readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { sanitizeElements } from '../src/core/storage/integrity.js'

export async function migrateLegacy(service, legacyRoot) {
  let items = []
  try {
    const raw = JSON.parse(await readFile(join(legacyRoot, 'index.json'), 'utf8'))
    if (raw && Array.isArray(raw.items)) items = raw.items.filter((m) => m && typeof m.id === 'string')
  } catch (e) {
    return { migrated: 0, skipped: 0, reason: 'no-legacy-index' }   // 无旧库或索引损坏 → 不迁移
  }
  if (items.length === 0) return { migrated: 0, skipped: 0, reason: 'empty-legacy-index' }

  const canvasesDir = join(legacyRoot, 'canvases')
  let migrated = 0
  let skipped = 0
  for (const meta of items) {
    try {
      const existing = await service.getMeta(meta.id)
      if (existing && existing.meta) { skipped++; continue }       // 只入不覆盖
      const body = await readCanvasBody(canvasesDir, meta.id)
      const elements = body ? body.elements : []
      await service.saveMeta({
        id: meta.id, name: meta.name || '未命名画布', schemaVersion: 1,
        createdAt: meta.createdAt || new Date().toISOString(),
        updatedAt: meta.updatedAt || new Date().toISOString(),
        elementCount: elements.length, hasMedia: false,
      })
      const set = {}
      for (const e of elements) set[e.id] = e
      await service.saveBody(meta.id, { set, remove: [] })
      migrated++
    } catch (e) {
      skipped++
    }
  }
  if (migrated > 0) {
    try { await rename(legacyRoot, legacyRoot + '.migrated') } catch (e) { /* 改名失败保留原目录，下次重试 */ }
  }
  return { migrated, skipped }
}

async function readCanvasBody(canvasesDir, id) {
  try {
    const parsed = JSON.parse(await readFile(join(canvasesDir, id, 'body.json'), 'utf8'))
    if (!parsed || !Array.isArray(parsed.elements)) return null
    const { elements } = sanitizeElements(parsed.elements)
    return { elements }
  } catch (e) {
    return null
  }
}
