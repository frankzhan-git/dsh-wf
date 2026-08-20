// 纯几何 / 文本工具（零依赖，纯函数）
// 与 infer.js 中的 contains 保持同一实现（CONTAIN_RATIO 0.92）；infer.js 暂保留原导出供组件使用

const CONTAIN_RATIO = 0.92 // 面积占比大于该值视为「几乎重叠」，不构成嵌套

export function contains(a, b) {
  if (a === b) return false
  const areaRatio = (b.w * b.h) / (a.w * a.h)
  if (areaRatio > CONTAIN_RATIO) return false
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w + 1 && b.y + b.h <= a.y + a.h + 1
}

// 选项文本（逗号/顿号/换行分隔）→ 数组
export function parseOptions(text) {
  if (!text) return []
  return String(text).split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean)
}

// 非空且可转数字 → Number，否则 undefined（JSONL 数字字段省略规则）
export function numOr(v) {
  if (v === '' || v == null || isNaN(Number(v))) return undefined
  return Number(v)
}

// 截断
export function cut(s, n) {
  const t = String(s || '').trim()
  return t.length > n ? t.slice(0, n) : t
}

// 非空字符串（trim 后）→ 原值，否则 undefined
export function strOrUndef(v) {
  const t = String(v == null ? '' : v).trim()
  return t || undefined
}
