// dsh-wf 样式聚合：按区域拆分后拼接（顺序即优先级基线）
// base（弹窗壳/布局/按钮/菜单）→ canvas（画布/悬浮层）→ inspector（属性）→ history（历史）→ preview（输出/语义预览）
import { BASE_CSS } from './base.js'
import { CANVAS_CSS } from './canvas.js'
import { INSPECTOR_CSS } from './inspector.js'
import { HISTORY_CSS } from './history.js'
import { PREVIEW_CSS } from './preview.js'

export const WF_CSS = BASE_CSS + CANVAS_CSS + INSPECTOR_CSS + HISTORY_CSS + PREVIEW_CSS
