// 草图元素模型（纯数据，零 React）

// 画布尺寸（逻辑坐标，SVG viewBox）
export const CANVAS_W = 800
export const CANVAS_H = 520

// 语义类型全集（page 为画布根容器扩展类型：一个页面 = 一个设计稿 = JSONL 的一行根；其余与标准一致）
export const ALL_TYPES = [
  'page', 'container', 'text', 'button', 'input', 'textarea', 'image', 'video', 'audio',
  'icon', 'link', 'select', 'checkbox', 'radio', 'switch', 'progress', 'divider', 'badge',
]

let seq = 0
export function nextId() { return 'e' + (++seq) }

// 载入既有画布后推进 id 序列：保证 nextId 与已载入元素的 id 永不冲突。
// 背景：浏览器刷新后模块 seq 归零，而画布元素 id 仍从 e1 起——若不复位推进，
// 复制粘贴时 buildPaste 生成的副本 id 会与画布现有元素重复，导致副本无法独立
// 选中/拖动/删除（操作按 id 命中原元素）、自动保存按 id 覆盖原元素（数据丢失）。
// 调用点：所有元素载入路径（initLast / restoreLast / loadCanvas / 导入）。
export function reserveSeqs(elements) {
  for (const e of elements || []) {
    const m = /^e(\d+)$/.exec(String((e && e.id) || ''))
    if (m) seq = Math.max(seq, Number(m[1]))
  }
}

// 创建草图元素。x/y/w/h 为画布逻辑坐标；arrow 额外记录终点 x2/y2
// name：用户可设置的元素名称（显示在画布上，并作为 JSONL 的 name；留空则不输出，避免与 text 重复）
// action/inputType/optionsText：按钮动作 / 输入类型 / 下拉选项文本（逗号分隔），直接映射到 props
// value/max/alt/checked/href/controls/poster/autoplay/label/iconSize：标准 props 的补充支持值
// 注意：当前 UI（双模式）只创建 kind='rect'；text/note/arrow 分支为兼容旧版本保存的历史画布数据而保留，
// 渲染与序列化路径（SketchModal renderEl / build.js）同样保留，请勿删除。
export function createElement(tool, x, y, w, h) {
  const base = {
    id: nextId(), name: '', x, y, w, h, radius: 4,
    text: '', note: '', src: '', type: null,
    action: '', inputType: '', optionsText: '',
    value: '', max: '', alt: '', href: '',
    label: '', iconSize: '',
    checked: false, controls: false, autoplay: false, poster: '',
  }
  switch (tool.kind) {
    case 'text':
      return Object.assign(base, { kind: 'text', type: 'text', text: '文本' })
    case 'note':
      return Object.assign(base, { kind: 'note', text: '备注：写要求', dashed: true, fill: 'note' })
    case 'arrow':
      return Object.assign(base, { kind: 'arrow', x2: x + w, y2: y + h })
    case 'rect':
      return Object.assign(base, { kind: 'rect', type: tool.type || null })
    default: // select 不创建元素
      return null
  }
}

export function cloneElements(elements) {
  // 元素是纯数据（无函数/引用），JSON 深拷贝即可
  return elements.map((e) => JSON.parse(JSON.stringify(e)))
}

// 命中检测（从上往下，返回最上层命中的元素）
// 防呆：文本元素的文字可能溢出其 w/h（输入较长文本时），命中区放宽为至少 80px 宽、24px 高
export function hitTest(elements, px, py) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const e = elements[i]
    if (e.kind === 'arrow') {
      // 箭头按起点端点命中
      if (Math.abs(px - e.x) <= 8 && Math.abs(py - e.y) <= 8) return e
      continue
    }
    if (e.kind === 'text') {
      if (px >= e.x && px <= e.x + Math.max(e.w, 80) && py >= e.y && py <= e.y + Math.max(e.h, 24)) return e
      continue
    }
    if (px >= e.x && px <= e.x + e.w && py >= e.y && py <= e.y + e.h) return e
  }
  return null
}
