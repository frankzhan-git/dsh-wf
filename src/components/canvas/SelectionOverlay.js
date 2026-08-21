// 多选整体外框 + 四边手柄（横向/纵向批量调整）+ 四角手柄（等比缩放）：纯展示，无业务状态
import React from 'react'

const el = React.createElement

export function SelectionOverlay({ selectedIds, elements, groupBounds }) {
  if (selectedIds.length <= 1 || !groupBounds) return null
  const corners = [
    [groupBounds.x, groupBounds.y],
    [groupBounds.x + groupBounds.w, groupBounds.y],
    [groupBounds.x, groupBounds.y + groupBounds.h],
    [groupBounds.x + groupBounds.w, groupBounds.y + groupBounds.h],
  ]
  // 四边手柄（视觉指示；命中判定在状态机几何层）
  const edges = [
    { k: 't', x: groupBounds.x, y: groupBounds.y - 3, w: groupBounds.w, h: 6, cls: 'wf-edge wf-edge-ns' },
    { k: 'b', x: groupBounds.x, y: groupBounds.y + groupBounds.h - 3, w: groupBounds.w, h: 6, cls: 'wf-edge wf-edge-ns' },
    { k: 'l', x: groupBounds.x - 3, y: groupBounds.y, w: 6, h: groupBounds.h, cls: 'wf-edge wf-edge-ew' },
    { k: 'r', x: groupBounds.x + groupBounds.w - 3, y: groupBounds.y, w: 6, h: groupBounds.h, cls: 'wf-edge wf-edge-ew' },
  ]
  return el('g', { className: 'wf-group' },
    el('rect', { x: groupBounds.x - 3, y: groupBounds.y - 3, width: groupBounds.w + 6, height: groupBounds.h + 6, className: 'wf-group-box' }),
    edges.map((p) => el('rect', { key: p.k, x: p.x, y: p.y, width: p.w, height: p.h, className: p.cls })),
    corners.map((p, i) => el('rect', { key: i, x: p[0] - 4, y: p[1] - 4, width: 8, height: 8, rx: 2, className: 'wf-group-handle' })),
  )
}
