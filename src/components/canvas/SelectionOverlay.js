// 多选整体外框 + 四角手柄（等比缩放手柄）：纯展示，无业务状态
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
  return el('g', { className: 'wf-group' },
    el('rect', { x: groupBounds.x - 3, y: groupBounds.y - 3, width: groupBounds.w + 6, height: groupBounds.h + 6, className: 'wf-group-box' }),
    corners.map((p, i) => el('rect', { key: i, x: p[0] - 4, y: p[1] - 4, width: 8, height: 8, rx: 2, className: 'wf-group-handle' })),
  )
}
