// 画布舞台（纯展示 + 事件转发，无业务状态）：SVG 相机 + 图层编排
// 图层：元素（NodeRenderer，注册表 render 分派）/ 吸附虚线（SnapLines）/ 框选矩形 / 多选外框（SelectionOverlay）
// 所有状态与事件处理由 SketchModal 持有，本组件只负责渲染与回调转发
import React from 'react'
import { CANVAS_W, CANVAS_H } from '../../core/model.js'
import { NodeRenderer } from './NodeRenderer.js'
import { SelectionOverlay } from './SelectionOverlay.js'
import { SnapLines } from './SnapLines.js'

const el = React.createElement

export function CanvasStage(props) {
  const {
    elements, selectedId, editing, mode, zoom, pan, spaceDown, drag,
    svgRef, viewRef, canvasCursor, snapLines, selectedIds, groupBounds,
    onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onCloseMenu,
    onSelect, onStartEdit, onCtxMenu, onEditChange, onEditDone,
  } = props

  // 无限画布（相机方案）：SVG 固定为视口大小，viewBox 随平移/缩放动态变化，
  // 元素坐标任意（可为负/超界），viewBox 外的内容自动裁剪
  const vw = CANVAS_W / zoom
  const vh = CANVAS_H / zoom
  // 渲染层级（用户规范）：页面永远在最底部（先渲染 = SVG 底层），其内部控件在其上
  // 稳定排序保持数组原有顺序（页面之间/控件之间 z 序不变）
  const orderedElements = elements.slice().sort((a, b) => ((a.type === 'page' ? 0 : 1) - (b.type === 'page' ? 0 : 1)))
  return el('div', { className: 'wf-canvas-view', ref: viewRef },
    el('svg', {
      ref: svgRef,
      className: 'wf-canvas' + (mode === 'draw' ? ' wf-canvas-draw' : ''),
      viewBox: pan.x + ' ' + pan.y + ' ' + vw + ' ' + vh,
      preserveAspectRatio: 'xMidYMid meet',
      style: { cursor: canvasCursor },
      onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
      onContextMenu: (ev) => { ev.preventDefault(); onCloseMenu() },
    },
      el('rect', { x: pan.x - 2000, y: pan.y - 2000, width: vw + 4000, height: vh + 4000, className: 'wf-canvas-bg' }),
      orderedElements.map((e) => el(NodeRenderer, {
        key: e.id, e, elements,
        selected: e.id === selectedId,
        editing, onSelect, onStartEdit, onCtxMenu, onEditChange, onEditDone,
      })),
      el(SnapLines, { lines: snapLines, pan, vw, vh }),
      // 框选矩形（marquee）
      drag && drag.mode === 'marquee' && drag.mq && drag.mq.w > 0 && drag.mq.h > 0
        ? el('rect', { x: drag.mq.x, y: drag.mq.y, width: drag.mq.w, height: drag.mq.h, className: 'wf-marquee' })
        : null,
      el(SelectionOverlay, { selectedIds, elements, groupBounds }),
    ),
  )
}
