// 语义推断：元素 → type、包含关系 → 嵌套、元素分布 → direction
// 推断只是加速器：结果全部可在属性编辑中手动修正

const BTN_MAX_CHARS = 6          // 圆角 + 短文本 → button 的字数阈值
const INPUT_RE = /^(请输入|搜索|输入|填写|用户名|密码|邮箱|手机号|账号|占位)/ // 占位文本 → input
const IMAGE_RE = /^(图片|img|image|示意图|照片)/                            // 图片占位标记
const CONTAIN_RATIO = 0.92        // 面积占比大于该值视为「几乎重叠」，不构成嵌套

export function contains(a, b) {
  if (a === b) return false
  const areaRatio = (b.w * b.h) / (a.w * a.h)
  if (areaRatio > CONTAIN_RATIO) return false
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w + 1 && b.y + b.h <= a.y + a.h + 1
}

// 元素语义类型推断（type 已显式指定或 kind 固定时直接返回）
export function inferType(el) {
  if (el.type) return el.type
  if (el.kind === 'text') return 'text'
  const t = String(el.text || '').trim()
  if (!t) return null // 空矩形：无法推断，由调用方兜底（container + 低置信度提示）
  if (el.radius >= 6 && t.length <= BTN_MAX_CHARS) return 'button'
  if (INPUT_RE.test(t)) return el.h > 48 ? 'textarea' : 'input'
  if (IMAGE_RE.test(t)) return 'image'
  if (el.w <= 24 && el.h <= 24) return 'icon'
  if (el.h > 48) return 'textarea'
  return 'container'
}

// 有效类型（显式优先；否则按包含关系/推断规则实时判定）：画布渲染与最小尺寸共用
export function effTypeOf(elements, e) {
  if (e.type) return e.type
  const hasKids = elements.some((o) => o.id !== e.id && contains(e, o))
  if (hasKids) return 'container'
  return inferType(e) || 'container'
}

// 子元素排列方向：中心点 x 分布范围 >= y 分布范围 → horizontal，否则 vertical
export function inferDirection(kids) {
  if (!kids.length) return 'vertical'
  const xs = kids.map((k) => k.x + k.w / 2)
  const ys = kids.map((k) => k.y + k.h / 2)
  const rangeX = Math.max(...xs) - Math.min(...xs)
  const rangeY = Math.max(...ys) - Math.min(...ys)
  return rangeX >= rangeY ? 'horizontal' : 'vertical'
}

// 低置信度标记：空矩形兜底为容器（类型为 null 且无子元素时）
export function isLowConfidence(el) {
  return el.kind === 'rect' && !el.type && !String(el.text || '').trim()
}
