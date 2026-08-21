// 画布区域：view 裁剪 + stage 平移缩放、元素类型化样式、悬浮层（模式徽标/预览/缩放/输出面板）、内联编辑
export const CANVAS_CSS = `
/* 中栏：画布（view 裁剪 + stage 平移缩放，SVG 固定逻辑尺寸不变形） */
.wf-canvas-wrap {
  flex: 1 1 0%; min-width: 0; position: relative;
  padding: 14px 16px; box-sizing: border-box; display: flex;
}
.wf-canvas-view {
  flex: 1 1 0%; min-height: 0; min-width: 0;
  overflow: hidden;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
  position: relative;
  touch-action: none;
}
/* 无限画布（相机方案）：SVG 填满视口，viewBox 随平移/缩放动态变化 */
.wf-canvas {
  display: block; width: 100%; height: 100%;
  background: var(--wf-bg-sunken);
  user-select: none; -webkit-user-select: none;
}
.wf-canvas-bg { fill: color-mix(in srgb, var(--wf-accent) 2%, transparent); pointer-events: none; }
/* 控件模式（draw）：鼠标在画布上恒为十字形（覆盖元素上的 move/default 光标） */
.wf-canvas-draw .wf-rect,
.wf-canvas-draw .wf-note,
.wf-canvas-draw .wf-text-el,
.wf-canvas-draw .wf-arrow,
.wf-canvas-draw .wf-edge { cursor: crosshair !important; }
/* 空格按住（空间平移）：无论模式、无论鼠标在画布还是控件上，一律手型光标；
   拖拽中（pan）显示抓握态。!important 覆盖 draw 模式 crosshair 与控件 move */
.wf-canvas-space .wf-rect,
.wf-canvas-space .wf-note,
.wf-canvas-space .wf-text-el,
.wf-canvas-space .wf-arrow,
.wf-canvas-space .wf-handle,
.wf-canvas-space .wf-edge { cursor: grab !important; }
.wf-canvas-pan .wf-rect,
.wf-canvas-pan .wf-note,
.wf-canvas-pan .wf-text-el,
.wf-canvas-pan .wf-arrow,
.wf-canvas-pan .wf-handle,
.wf-canvas-pan .wf-edge { cursor: grabbing !important; }
.wf-rect {
  fill: color-mix(in srgb, var(--wf-accent) 5%, transparent);
  stroke: var(--wf-border-strong); stroke-width: 1.2;
  cursor: move;
}
/* 类型化样式：画布上一眼区分控件类型（每种类型渲染为真实 UI 组件形态）
   填充体系（单一规范）：静态区 = bg-sunken；强调区 = accent 混色；无背景类 = transparent + 弱描边 */
.wf-rect-auto { stroke-dasharray: 5 4; }                                   /* 待推断：虚线 */
.wf-rect-container { fill: color-mix(in srgb, var(--wf-accent) 3%, transparent); }
.wf-rect-page {
  fill: var(--wf-bg-raised);                  /* 页面 = 设计稿卡片：实底 + 描边，区别于容器 */
  stroke: var(--wf-border-strong);
}
.wf-rect-button {
  fill: color-mix(in srgb, var(--wf-accent) 14%, transparent);
  stroke: color-mix(in srgb, var(--wf-accent) 50%, transparent);
}
/* 输入框：弱框 + accent 下划线；文本域：全边框强描边（形态区分） */
.wf-rect-input { fill: var(--wf-bg-sunken); stroke: var(--wf-border); }
.wf-rect-textarea { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); }
.wf-rect-underline { stroke: color-mix(in srgb, var(--wf-accent) 55%, transparent); stroke-width: 1.6; }
.wf-rect-image { fill: var(--wf-bg-sunken); }                              /* 图片 = 槽位 */
.wf-rect-image-glyph { fill: none; stroke: var(--wf-border-strong); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-video { fill: var(--wf-bg-sunken); }
.wf-rect-play { fill: var(--wf-accent); }
.wf-rect-audio { fill: var(--wf-bg-sunken); }
.wf-rect-audio-glyph { fill: var(--wf-text-2); }
.wf-rect-audio-wave { fill: none; stroke: var(--wf-text-2); stroke-width: 1.6; stroke-linecap: round; }
.wf-rect-icon { fill: color-mix(in srgb, var(--wf-accent) 10%, transparent); }
.wf-rect-icon-glyph { fill: none; stroke: var(--wf-accent); stroke-width: 1.6; stroke-linejoin: round; }
.wf-rect-link-text { fill: var(--wf-accent); font-size: 13px; }
.wf-rect-link-line { stroke: var(--wf-accent); stroke-width: 1; opacity: .8; }
.wf-rect-link-glyph { fill: none; stroke: var(--wf-accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-select-chev { fill: none; stroke: var(--wf-text-2); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-box { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-box-check { fill: none; stroke: var(--wf-accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-circle { fill: transparent; stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-circle-dot { fill: var(--wf-accent); }
.wf-rect-switch { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-switch-on { fill: color-mix(in srgb, var(--wf-accent) 65%, transparent); stroke: color-mix(in srgb, var(--wf-accent) 50%, transparent); }
.wf-rect-switch-knob { fill: #fff; }
.wf-rect-progress-bg { fill: var(--wf-bg-sunken); stroke: var(--wf-border); stroke-width: 1; }
.wf-rect-progress-fill { fill: color-mix(in srgb, var(--wf-accent) 65%, transparent); }
.wf-rect-divider { stroke: var(--wf-border-strong); stroke-width: 1.4; }
.wf-rect-divider-cap { stroke: var(--wf-border-strong); stroke-width: 1.4; stroke-linecap: round; }
.wf-rect-badge {
  fill: color-mix(in srgb, var(--wf-accent) 18%, transparent);
  stroke: transparent;
}
/* 通用占位虚框（ghost）：无背景控件（文本/复选/单选/开关/空链接）的弱视觉外框，圈定组件大小 */
.wf-rect-ghost { fill: transparent; stroke: var(--wf-border); stroke-dasharray: 5 4; }
.wf-rect-text-center { text-anchor: middle; }
.wf-rect-text-ph { fill: var(--wf-text-2); }
.wf-rect.wf-selected { stroke: var(--wf-accent); stroke-width: 1.8; stroke-dasharray: none; }
.wf-text-el { fill: var(--wf-text); font-size: 15px; cursor: default; }
.wf-note {
  fill: color-mix(in srgb, var(--wf-warn) 10%, transparent);
  stroke: var(--wf-warn); stroke-width: 1.2; stroke-dasharray: 5 3;
  cursor: move;
}
.wf-note.wf-selected { stroke-width: 1.8; }
.wf-note-text { fill: var(--wf-warn); font-size: 12px; }
.wf-arrow { stroke: var(--wf-text-2); stroke-width: 1.6; }
.wf-arrow.wf-selected { stroke: var(--wf-accent); stroke-width: 2; }
.wf-rect-text { fill: var(--wf-text-2); font-size: 12px; pointer-events: none; }
.wf-handle { fill: var(--wf-accent); stroke: var(--wf-bg-sunken); stroke-width: 1.2; cursor: nwse-resize; }
/* 四边 resize 手柄（上下左右横向/纵向）：命中判定在状态机几何层；
   pointer-events 必须保留（默认）——否则 CSS cursor 不生效（事件穿透时光标由下层决定） */
.wf-edge { fill: color-mix(in srgb, var(--wf-accent) 16%, transparent); }
.wf-edge-ew { cursor: ew-resize; }
.wf-edge-ns { cursor: ns-resize; }
/* 拖动对齐虚线（吸附指示） */
.wf-snap {
  stroke: var(--wf-accent);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: .9;
  pointer-events: none;
}
/* 框选矩形（marquee） */
.wf-marquee {
  fill: color-mix(in srgb, var(--wf-accent) 10%, transparent);
  stroke: var(--wf-accent);
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  pointer-events: none;
}
/* 多选整体外框 + 角手柄（等比缩放） */
.wf-group-box {
  fill: none;
  stroke: var(--wf-accent);
  stroke-width: 1.2;
  stroke-dasharray: 6 4;
  pointer-events: none;
}
.wf-group-handle {
  fill: var(--wf-accent);
  stroke: var(--wf-bg-sunken);
  stroke-width: 1.2;
  cursor: nwse-resize;
}
/* 名字标签：元素左上角外侧，小圆角背景 + 文字（同语义预览标签风格） */
.wf-el-name rect {
  fill: var(--wf-bg-raised);
  stroke: var(--wf-border);
  stroke-width: .8;
}
.wf-el-name text {
  fill: var(--wf-accent);
  font-size: 10px; font-weight: 600;
  letter-spacing: .02em;
  paint-order: stroke;
  stroke: var(--wf-bg-raised); stroke-width: 2px;
  stroke-linejoin: round;
}
/* 自动类型名标签（用户未命名时）：弱化显示，区别于用户命名的 accent 色 */
.wf-el-name-auto rect { stroke-dasharray: 3 2; }
.wf-el-name-auto text { fill: var(--wf-text-2); font-weight: 500; }

/* 画布内悬浮层（左上角模式徽标 / 右上角 JSONL·预览·设置按钮 / 右下角缩放 / 输出面板） */
.wf-canvas-overlay {
  position: absolute; inset: 14px 16px;
  pointer-events: none;
}
.wf-mode-badge {
  position: absolute; top: 8px; left: 8px;
  padding: 3px 10px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 11px; font-weight: 500;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: var(--wf-shadow);
  user-select: none;
}
.wf-mode-badge:hover { color: var(--wf-text); }
.wf-mode-badge-draw {
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  background: color-mix(in srgb, var(--wf-accent) 12%, transparent);
}
.wf-mode-key {
  margin-left: 5px;
  padding: 0 4px;
  font-family: Consolas, 'Cascadia Code', Menlo, monospace;
  font-size: 9px; line-height: 14px;
  color: var(--wf-text-2);
  border: 1px solid var(--wf-border-strong);
  border-radius: 4px;
  background: transparent;
}
.wf-mode-badge-draw .wf-mode-key { color: var(--wf-accent); border-color: color-mix(in srgb, var(--wf-accent) 40%, transparent); }
.wf-canvas-tools {
  position: absolute; top: 8px; right: 8px;
  display: flex; gap: 4px;
  pointer-events: auto;
}
.wf-ctool {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 12px; cursor: pointer;
  box-shadow: var(--wf-shadow);
  transition: background-color .1s ease, color .1s ease, border-color .1s ease;
}
.wf-ctool:hover { color: var(--wf-text); }
.wf-ctool-on { color: var(--wf-accent); border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent); background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }
/* 右下角：撤销/重做/清空（不可用即隐藏）+ 缩放 */
.wf-canvas-actions {
  position: absolute; right: 8px; bottom: 8px;
  display: flex; align-items: center; gap: 8px;
  pointer-events: none;
}
.wf-action-group { display: flex; align-items: center; gap: 2px; pointer-events: auto; }
.wf-iaction {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; padding: 0;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); cursor: pointer;
  box-shadow: var(--wf-shadow);
  transition: background-color .1s ease, color .1s ease;
}
.wf-iaction:hover { color: var(--wf-text); }
.wf-iaction:focus-visible { outline: 2px solid var(--wf-accent); outline-offset: -2px; }
.wf-iaction-undo svg { transform: scaleX(-1); } /* 撤销 = 刷新图标水平镜像（逆时针） */
/* 清空二次确认态 */
.wf-iaction-danger { color: var(--wf-danger); border-color: color-mix(in srgb, var(--wf-danger) 45%, transparent); }
.wf-iaction-danger:hover { color: var(--wf-danger); background: color-mix(in srgb, var(--wf-danger) 12%, transparent); }
.wf-iaction-wide { width: auto; padding: 0 8px; font-size: 11px; }
.wf-zoom-bar {
  display: flex; align-items: center; gap: 2px;
  pointer-events: auto;
}
.wf-zoom-pct {
  padding: 3px 8px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 11px;
  font-variant-numeric: tabular-nums;
  box-shadow: var(--wf-shadow);
  font-family: inherit;
}
/* 缩放百分比 = 恢复按钮：非 100% 时可点击（点击恢复 100% 视图） */
.wf-zoom-pct-click {
  cursor: pointer;
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  transition: background-color .1s ease;
}
.wf-zoom-pct-click:hover { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }
.wf-zoom-pct:disabled { cursor: default; }
.wf-float-panel {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);   /* 居中锚定：resize 时宽高对称扩展，右下角手柄跟随鼠标 */
  width: 380px; max-width: calc(100% - 16px);
  max-height: calc(100% - 52px);
  display: flex; flex-direction: column;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border-strong);
  border-radius: 10px;
  box-shadow: var(--wf-shadow);
  pointer-events: auto;
  overflow: hidden;
}
.wf-float-head {
  flex: none; display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; font-size: 12px; font-weight: 500;
  color: var(--wf-text);
  border-bottom: 1px solid var(--wf-border);
}
.wf-float-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; padding: 0;
  background: transparent; border: none; border-radius: 5px;
  color: var(--wf-text-2); cursor: pointer;
}
.wf-float-close:hover { background: var(--wf-hover); color: var(--wf-text); }
/* JSONL 浮窗复制按钮（复制完整提示词） */
.wf-float-copy {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px;
  background: transparent; border: 1px solid var(--wf-border); border-radius: 5px;
  color: var(--wf-text-2); font-size: 11px; cursor: pointer;
  transition: background-color .1s ease, color .1s ease, border-color .1s ease;
}
.wf-float-copy:hover { background: var(--wf-hover); color: var(--wf-text); }
.wf-float-copy-ok {
  color: var(--dsw-alias-state-success-primary, #3fb950);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #3fb950) 45%, transparent);
}
.wf-float-panel .wf-jsonl {
  flex: 1 1 0%; min-height: 0; max-height: 320px;
  margin: 8px; overflow: auto;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
}
/* 语义预览区：页面切换下拉 + 预览（多页面时下拉显示） */
.wf-float-preview {
  flex: 1 1 0%; min-height: 0;
  display: flex; flex-direction: column;
  padding: 8px;
}
.wf-float-pages { flex: none; padding: 0 0 8px; }
.wf-float-select {
  width: 100%; box-sizing: border-box;
  padding: 4px 8px;
  background: var(--wf-bg-sunken); color: var(--wf-text);
  border: 1px solid var(--wf-border); border-radius: 6px;
  font-size: 12px;
}
.wf-float-select:focus { outline: 2px solid var(--wf-accent); outline-offset: -1px; }
.wf-float-preview .wf-preview {
  flex: 1 1 0%; min-height: 0; overflow: auto;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
  padding: 12px;
}
/* 浮窗右下角拖拽 resize 手柄（最小尺寸 = 拖拽起点，即当前大小） */
.wf-float-resize {
  position: absolute; right: 0; bottom: 0;
  width: 16px; height: 16px;
  cursor: nwse-resize;
}
.wf-float-resize::after {
  content: ''; position: absolute; right: 4px; bottom: 4px;
  width: 6px; height: 6px;
  border-right: 2px solid var(--wf-text-2);
  border-bottom: 2px solid var(--wf-text-2);
  border-bottom-right-radius: 2px;
}

/* 内联编辑框（双击控件文本/名字） */
.wf-inline-edit {
  width: 100%; height: 100%;
  display: flex; align-items: center;
}
.wf-inline-edit input {
  width: 100%; box-sizing: border-box;
  padding: 2px 6px;
  background: var(--wf-bg-raised); color: var(--wf-text);
  border: 1.5px solid var(--wf-accent); border-radius: 4px;
  font-size: 12px; font-family: inherit;
  outline: none;
}
`
