// 元素渲染器（纯展示，无业务状态）：按有效类型渲染其真实 UI 形态（画布即语义预览）
// render 分派键来自 core/types.js 注册表（P2）：page/container/text/button/input/textarea/image/video/audio/icon/link/select/checkbox/radio/switch/progress/divider/badge + kind 特判 note/arrow/text
// 只接收 element 与回调；业务状态（选中/编辑）由 props 传入
import React from 'react'
import { contains, inferType } from '../../core/infer.js'
import { TYPE_LABEL } from '../common/typeLabels.js'

const el = React.createElement

// 有效类型：显式类型优先；否则按包含关系/推断规则实时判定（画布样式随类型变化）
function effTypeOf(elements, e) {
  if (e.type) return e.type
  const hasKids = elements.some((o) => o.id !== e.id && contains(e, o))
  if (hasKids) return 'container'
  return inferType(e) || 'container'
}

// 类型中文名（名字标签回退显示用；kind 特判 note/arrow/text）
function typeNameOf(elements, e) {
  if (e.kind === 'note') return '备注'
  if (e.kind === 'arrow') return '箭头'
  if (e.kind === 'text') return '文本'
  const et = effTypeOf(elements, e)
  return TYPE_LABEL[et] || et
}

export function NodeRenderer(props) {
  const { e, elements, selected, editing, onSelect, onStartEdit, onCtxMenu, onEditChange, onEditDone } = props

  // ---------- 名字标签：元素左上角外侧，小圆角背景 + 文字；双击可改名 ----------
  // 用户未命名时默认展示类型名（仅画布显示，不写入 JSON 的 name 字段）
  const renderNameTag = () => {
    const user = e.name && String(e.name).trim()
    const label = user || typeNameOf(elements, e)
    const editingName = editing && editing.id === e.id && editing.field === 'name'
    if (!editingName && !label) return null
    const w = Math.max(10 + label.length * 10, 40)
    return el('g', {
      className: 'wf-el-name' + (user ? '' : ' wf-el-name-auto'),
      transform: 'translate(' + e.x + ',' + e.y + ')',
      onDoubleClick: (ev) => { ev.stopPropagation(); onStartEdit(e, 'name') },
    },
      el('rect', { x: 0, y: -15, width: w, height: 13, rx: 3 }),
      el('text', { x: 4, y: -5.5 }, label),
    )
  }

  // ---------- 内联编辑框（foreignObject 内 input） ----------
  const renderInlineEdit = () => {
    if (!editing || editing.id !== e.id) return null
    const isName = editing.field === 'name'
    const x = isName ? e.x : e.x + 2
    const y = isName ? e.y - 15 : e.y + (e.kind === 'text' ? -2 : 2)
    const w = isName ? Math.min(Math.max(80, (editing.value.length || 2) * 12 + 24), 280) : Math.min(Math.max(80, e.w + 8), 320)
    return el('foreignObject', { x, y, width: w, height: 22 },
      el('div', { xmlns: 'http://www.w3.org/1999/xhtml', className: 'wf-inline-edit' },
        el('input', {
          autoFocus: true,
          value: editing.value,
          placeholder: isName ? '输入名称' : '输入文本',
          onMouseDown: (ev) => ev.stopPropagation(),
          onDoubleClick: (ev) => ev.stopPropagation(),
          onChange: (ev) => {
            const next = Object.assign({}, editing, { value: ev.target.value })
            onEditChange(next)
          },
          onBlur: onEditDone,
          onKeyDown: (ev) => {
            ev.stopPropagation()
            if (ev.key === 'Enter') onEditDone()
          },
        }),
      ),
    )
  }

  const cls = (base) => base + (selected ? ' wf-selected' : '')
  const ctxProps = {
    onContextMenu: (ev) => { ev.preventDefault(); ev.stopPropagation(); onCtxMenu(ev, e) },
  }
  const clickSel = { onClick: (ev) => { ev.stopPropagation(); onSelect(e.id) } }

  // ---------- kind 特判：arrow / text / note ----------
  if (e.kind === 'arrow') {
    return el('g', { key: e.id },
      renderNameTag(),
      el('line', {
        x1: e.x, y1: e.y, x2: e.x2, y2: e.y2,
        className: 'wf-arrow' + (selected ? ' wf-selected' : ''),
        ...ctxProps,
      }),
    )
  }
  if (e.kind === 'text') {
    return el('g', { key: e.id },
      renderNameTag(),
      el('text', {
        x: e.x + 4, y: e.y + 18,
        className: cls('wf-text-el'),
        ...clickSel,
        onDoubleClick: (ev) => { ev.stopPropagation(); onStartEdit(e, 'text') },
        ...ctxProps,
      }, e.text),
      renderInlineEdit(),
    )
  }
  if (e.kind === 'note') {
    return el('g', { key: e.id },
      renderNameTag(),
      el('rect', {
        x: e.x, y: e.y, width: e.w, height: e.h, rx: 6,
        className: cls('wf-note'),
        ...clickSel,
        onDoubleClick: (ev) => { ev.stopPropagation(); onStartEdit(e, 'text') },
        ...ctxProps,
      }),
      el('text', { x: e.x + 6, y: e.y + 18, className: 'wf-note-text' }, e.text),
      renderInlineEdit(),
    )
  }

  // ---------- 矩形：按有效类型渲染形态（注册表 render 分派） ----------
  const et = effTypeOf(elements, e)
  const baseCls = 'wf-rect wf-rect-' + et + (selected ? ' wf-selected' : '')
  const clickProps = Object.assign({
    // 页面双击编辑名称（页面内容为空，文本无意义）；其余控件双击编辑文本
    onDoubleClick: (ev) => { ev.stopPropagation(); onStartEdit(e, et === 'page' ? 'name' : 'text') },
  }, clickSel, ctxProps)
  const cx = e.x + e.w / 2
  const cy = e.y + e.h / 2
  const kids = [renderNameTag()]
  const body = (rx) => el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx, className: baseCls, ...clickProps })
  const labelText = (x, y, text, extra) => el('text', { x, y, className: 'wf-rect-text' + (extra ? ' ' + extra : '') }, text)
  const labelC = (text, extra) => el('text', { x: cx, y: cy + 4, className: 'wf-rect-text wf-rect-text-center' + (extra ? ' ' + extra : '') }, text)

  // 形态分派表（与 core/types.js render 键对应；新增类型在此加一个形态函数）
  const SHAPES = {
    page: () => { kids.push(body(10)) },
    button: () => { kids.push(body(8)); if (e.text) kids.push(labelC(e.text)) },
    input: () => {
      kids.push(body(4))
      kids.push(el('line', { x1: e.x + 3, y1: e.y + e.h - 1.5, x2: e.x + e.w - 3, y2: e.y + e.h - 1.5, className: 'wf-rect-underline' }))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, 'wf-rect-text-ph'))
    },
    textarea: () => {
      kids.push(body(4))
      kids.push(el('line', { x1: e.x + 3, y1: e.y + e.h - 1.5, x2: e.x + e.w - 3, y2: e.y + e.h - 1.5, className: 'wf-rect-underline' }))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, 'wf-rect-text-ph'))
    },
    image: () => {
      kids.push(body(6))
      kids.push(el('line', { x1: e.x + 5, y1: e.y + 5, x2: e.x + e.w - 5, y2: e.y + e.h - 5, className: 'wf-rect-cross' }))
      kids.push(el('line', { x1: e.x + e.w - 5, y1: e.y + 5, x2: e.x + 5, y2: e.y + e.h - 5, className: 'wf-rect-cross' }))
      if (e.w > 56 && e.h > 40) kids.push(labelC('图片', 'wf-rect-text-dim'))
    },
    video: () => {
      kids.push(body(6))
      kids.push(el('path', { d: 'M ' + (cx - 7) + ' ' + (cy - 9) + ' L ' + (cx - 7) + ' ' + (cy + 9) + ' L ' + (cx + 9) + ' ' + cy + ' Z', className: 'wf-rect-play' }))
    },
    audio: () => { kids.push(body(6)); kids.push(labelC('♪', 'wf-rect-music')) },
    icon: () => { kids.push(body(6)); kids.push(labelC('✦')) },
    link: () => {
      kids.push(el('text', { x: e.x + 6, y: e.y + 18, className: 'wf-rect-link-text', ...clickProps }, e.text || '链接'))
      kids.push(el('line', { x1: e.x + 6, y1: e.y + 21, x2: e.x + Math.min(e.w - 6, 6 + String(e.text || '链接').length * 12), y2: e.y + 21, className: 'wf-rect-link-line' }))
    },
    select: () => {
      kids.push(body(4))
      kids.push(el('text', { x: e.x + e.w - 16, y: cy + 4, className: 'wf-rect-text wf-rect-text-center wf-rect-arrow' }, '▾'))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, 'wf-rect-text-ph'))
    },
    checkbox: () => {
      kids.push(el('rect', { x: e.x + 4, y: cy - 9, width: 18, height: 18, rx: 4, className: 'wf-rect-box', ...clickProps }))
      kids.push(labelText(e.x + 4 + 22, cy + 4, '✓', 'wf-rect-box-check'))
      if (e.text) kids.push(labelText(e.x + 4 + 30, cy + 4, e.text))
    },
    radio: () => {
      kids.push(el('circle', { cx: e.x + 13, cy, r: 9, className: 'wf-rect-circle', ...clickProps }))
      kids.push(el('circle', { cx: e.x + 13, cy, r: 3.5, className: 'wf-rect-circle-dot' }))
      if (e.text) kids.push(labelText(e.x + 28, cy + 4, e.text))
    },
    switch: () => {
      kids.push(el('rect', { x: e.x + 4, y: cy - 8, width: 34, height: 16, rx: 8, className: 'wf-rect-switch', ...clickProps }))
      kids.push(el('circle', { cx: e.x + 4 + 26, cy, r: 6.5, className: 'wf-rect-switch-knob' }))
      if (e.text) kids.push(labelText(e.x + 44, cy + 4, e.text))
    },
    progress: () => {
      kids.push(el('rect', { x: e.x, y: cy - 5, width: e.w, height: 10, rx: 5, className: 'wf-rect-progress-bg', ...clickProps }))
      kids.push(el('rect', { x: e.x, y: cy - 5, width: Math.max(0, e.w * 0.6), height: 10, rx: 5, className: 'wf-rect-progress-fill' }))
    },
    divider: () => {
      kids.push(el('line', { x1: e.x, y1: cy, x2: e.x + e.w, y2: cy, className: 'wf-rect-divider', ...clickProps }))
    },
    badge: () => { kids.push(body(Math.max(6, e.h / 2))); if (e.text) kids.push(labelC(e.text)) },
    container: () => {
      // container 与待推断矩形：统一矩形，待推断用虚线提示
      kids.push(body(6))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text))
    },
  }
  const shape = SHAPES[et] || SHAPES.container
  shape()

  if (selected) {
    kids.push(el('rect', { x: e.x + e.w - 9, y: e.y + e.h - 9, width: 10, height: 10, rx: 2, className: 'wf-handle' }))
  }
  kids.push(renderInlineEdit())
  return el('g', { key: e.id }, kids)
}
