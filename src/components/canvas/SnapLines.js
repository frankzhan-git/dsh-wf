// 拖动对齐虚线（贯穿视口，渲染在元素上方）：纯展示，无业务状态
import React from 'react'

const el = React.createElement

export function SnapLines({ lines, pan, vw, vh }) {
  if (!lines || !lines.length) return null
  return lines.map((ln, i) => (ln.axis === 'v'
    ? el('line', { key: 'snap' + i, x1: ln.pos, y1: pan.y - 4000, x2: ln.pos, y2: pan.y + vh + 4000, className: 'wf-snap' })
    : el('line', { key: 'snap' + i, x1: pan.x - 4000, y1: ln.pos, x2: pan.x + vw + 4000, y2: ln.pos, className: 'wf-snap' })))
}
