// 存储迁移（P7）：CanvasFile 版本链升级
// v0 = 旧 history.js 条目 { id, time, name, jsonl, canvasNote, elements }；v1 = CanvasFile
// 升级规则：缺字段补默认值；未知字段保留（前向兼容，导出不丢数据）

import { CURRENT_SCHEMA_VERSION } from './schema.js'

export function migrateFile(raw) {
  if (!raw || typeof raw !== 'object') return null
  // 已是当前版本：直接返回（未知字段保留）
  if (raw.schemaVersion === CURRENT_SCHEMA_VERSION) return raw
  // v0 历史条目（旧键 dsh-wf.history.v1 的条目）
  if (typeof raw.id === 'string' && raw.id && typeof raw.name === 'string' && Array.isArray(raw.elements)) {
    const t = typeof raw.time === 'string' && raw.time ? raw.time : new Date().toISOString()
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: raw.id,
      name: raw.name,
      createdAt: t,
      updatedAt: t,
      elements: raw.elements,
      meta: {
        source: 'migrated',
        canvasNote: typeof raw.canvasNote === 'string' ? raw.canvasNote : '',
        jsonlPreview: typeof raw.jsonl === 'string' ? raw.jsonl : '',
      },
    }
  }
  return null
}
