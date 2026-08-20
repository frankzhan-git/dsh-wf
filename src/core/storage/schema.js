// 存储 schema（P7）：CanvasFile 版本常量 + 画布工厂
// CanvasFile = 导出/导入/迁移的完整文件形态；存储内部按 meta/body 分离（见 adapters）

export const CURRENT_SCHEMA_VERSION = 1

// 画布 id 生成（与旧 flushSave 同款：时间戳 + 随机后缀）
export function genCanvasId() {
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 6)
}

// 新画布文件（id 由调用方分配；elements 由调用方填充）
export function newCanvasFile(name, id) {
  const now = new Date().toISOString()
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: id || genCanvasId(),
    name: typeof name === 'string' && name.trim() ? name : '未命名画布',
    createdAt: now,
    updatedAt: now,
    elements: [],
    meta: { source: 'canvas' },
  }
}
