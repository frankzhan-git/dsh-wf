// 多选整体外框 + 四边手柄（横向/纵向批量调整）：纯展示，无业务状态
// 命中判定在状态机几何层（hitGroupEdge，先于元素命中）；四边条仅视觉指示
import React from 'react'

const el = React.createElement

export function SelectionOverlay({ selectedIds, elements, groupBounds }) {
  if (selectedIds.length <= 1 || !groupBounds) return null
  const edges = [
    { k: 't', x: groupBounds.x, y: groupBounds.y - 4, w: groupBounds.w, h: 8, cls: 'wf-edge wf-edge-ns' },
    { k: 'b', x: groupBounds.x, y: groupBounds.y + groupBounds.h - 4, w: groupBounds.w, h: 8, cls: 'wf-edge wf-edge-ns' },
    { k: 'l', x: groupBounds.x - 4, y: groupBounds.y, w: 8, h: groupBounds.h, cls: 'wf-edge wf-edge-ew' },
    { k: 'r', x: groupBounds.x + groupBounds.w - 4, y: groupBounds.y, w: 8, h: groupBounds.h, cls: 'wf-edge wf-edge-ew' },
  ]
  return el('g', { className: 'wf-group' },
    el('rect', { x: groupBounds.x - 3, y: groupBounds.y - 3, width: groupBounds.w + 6, height: groupBounds.h + 6, className: 'wf-group-box' }),
    edges.map((p) => el('rect', { key: p.k, x: p.x, y: p.y, width: p.w, height: p.h, className: p.cls })),
  )
}
