// 存储完整性（P5 容错）：结构清洗 + 损坏隔离
// 读取路径永不抛：parse 失败由适配器隔离（改名 .corrupt），结构非法由 sanitize 清洗

// 逐元素校验：id/x/y/w/h 为基本字段，非法元素丢弃并计数
export function sanitizeElements(elements) {
  if (!Array.isArray(elements)) return { elements: [], dropped: 0 }
  const out = []
  let dropped = 0
  for (const e of elements) {
    if (e && typeof e === 'object' &&
        typeof e.id === 'string' && e.id &&
        typeof e.x === 'number' && typeof e.y === 'number' &&
        typeof e.w === 'number' && typeof e.h === 'number') {
      out.push(e)
    } else {
      dropped++
    }
  }
  return { elements: out, dropped }
}

// meta 合法性（列表条目）：id/name 字符串 + updatedAt 字符串
export function isValidMeta(m) {
  return !!(m && typeof m === 'object' &&
    typeof m.id === 'string' && m.id &&
    typeof m.name === 'string' &&
    typeof m.updatedAt === 'string')
}
