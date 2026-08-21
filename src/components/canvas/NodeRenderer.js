// 元素渲染器（纯展示，无业务状态）：按有效类型渲染其真实 UI 形态（画布即语义预览）
// render 分派键来自 core/types.js 注册表（P2）：page/container/text/button/input/textarea/image/video/audio/icon/link/select/checkbox/radio/switch/progress/divider/badge + kind 特判 note/arrow/text
// 画布样式规范：单一填充体系（token）、占位一律纯几何 path（禁文字/字形）、内部 mock 随盒自适应
// 只接收 element 与回调；业务状态（选中/编辑）由 props 传入
import React from 'react'
import { effTypeOf } from '../../core/infer.js'
import { TYPE_LABEL } from '../common/typeLabels.js'

const el = React.createElement

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
            if (ev.key === 'Escape') onEditDone()
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

  // 内部图形自适应：数值钳制 + 中心锚定等比缩放（mock 随盒尺寸合理变化，绝不溢出）
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const fitScale = (w, h, bw, bh) => Math.min(1, w / bw, h / bh)

  // 形态分派表（与 core/types.js render 键对应；新增类型在此加一个形态函数）
  // 占位规范：一律 SVG path 几何（无文字/字形）；用户内容（text/placeholder）保留
  const SHAPES = {
    page: () => { kids.push(body(10)) },
    button: () => { kids.push(body(8)); if (e.text) kids.push(labelC(e.text)) },
    input: () => {
      // 输入框：弱框 + accent 下划线（经典输入形态）
      kids.push(body(4))
      kids.push(el('line', { x1: e.x + 3, y1: e.y + e.h - 1.5, x2: e.x + e.w - 3, y2: e.y + e.h - 1.5, className: 'wf-rect-underline' }))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, 'wf-rect-text-ph'))
    },
    textarea: () => {
      // 文本域：全边框盒 + 左上角文本（区别于下划线式输入框）
      kids.push(body(4))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 16, e.text, 'wf-rect-text-ph'))
    },
    image: () => {
      // 图片：暗色槽位 + 中心图片图标（山+太阳几何 path，示意「此处为图片」）
      kids.push(body(6))
      const s = fitScale(e.w, e.h, 52, 40)
      kids.push(el('g', { transform: 'translate(' + (cx - 12 * s) + ',' + (cy - 12 * s) + ') scale(' + s + ')' },
        el('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, className: 'wf-rect-image-glyph' }),
        el('circle', { cx: 9, cy: 9, r: 2, className: 'wf-rect-image-glyph' }),
        el('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21', className: 'wf-rect-image-glyph' }),
      ))
    },
    video: () => {
      kids.push(body(6))
      const s = fitScale(e.w, e.h, 36, 28)
      const pw = 9 * s
      const ph = 13 * s
      kids.push(el('path', {
        d: 'M ' + (cx - pw / 2) + ' ' + (cy - ph / 2) + ' L ' + (cx - pw / 2) + ' ' + (cy + ph / 2) + ' L ' + (cx + pw * 0.55) + ' ' + cy + ' Z',
        className: 'wf-rect-play',
      }))
    },
    audio: () => {
      // 音频：扬声器几何 + 声波弧线（纯 path，无字形）
      kids.push(body(6))
      const s = fitScale(e.w, e.h, 46, 26)
      const sx = cx - 15 * s
      kids.push(el('path', {
        d: 'M ' + sx + ' ' + (cy - 5 * s) + ' L ' + (sx + 6 * s) + ' ' + (cy - 5 * s) + ' L ' + (sx + 12 * s) + ' ' + (cy - 9 * s)
          + ' L ' + (sx + 12 * s) + ' ' + (cy + 9 * s) + ' L ' + (sx + 6 * s) + ' ' + (cy + 5 * s) + ' L ' + sx + ' ' + (cy + 5 * s) + ' Z',
        className: 'wf-rect-audio-glyph',
      }))
      kids.push(el('path', { d: 'M ' + (sx + 18 * s) + ' ' + (cy - 7 * s) + ' A ' + (9 * s) + ' ' + (9 * s) + ' 0 0 1 ' + (sx + 18 * s) + ' ' + (cy + 7 * s), className: 'wf-rect-audio-wave' }))
      kids.push(el('path', { d: 'M ' + (sx + 25 * s) + ' ' + (cy - 10 * s) + ' A ' + (14 * s) + ' ' + (14 * s) + ' 0 0 1 ' + (sx + 25 * s) + ' ' + (cy + 10 * s), className: 'wf-rect-audio-wave' }))
    },
    icon: () => {
      // 图标：accent 弱底 + 四角星（sparkle）几何 path
      kids.push(body(6))
      const s = fitScale(e.w, e.h, 24, 24)
      const g = 8.5 * s // 星形半径
      kids.push(el('path', {
        d: 'M ' + cx + ' ' + (cy - g)
          + ' C ' + (cx + g * 0.18) + ' ' + (cy - g * 0.22) + ' ' + (cx + g * 0.22) + ' ' + (cy - g * 0.18) + ' ' + (cx + g) + ' ' + cy
          + ' C ' + (cx + g * 0.22) + ' ' + (cy + g * 0.18) + ' ' + (cx + g * 0.18) + ' ' + (cy + g * 0.22) + ' ' + cx + ' ' + (cy + g)
          + ' C ' + (cx - g * 0.18) + ' ' + (cy + g * 0.22) + ' ' + (cx - g * 0.22) + ' ' + (cy + g * 0.18) + ' ' + (cx - g) + ' ' + cy
          + ' C ' + (cx - g * 0.22) + ' ' + (cy - g * 0.18) + ' ' + (cx - g * 0.18) + ' ' + (cy - g * 0.22) + ' ' + cx + ' ' + (cy - g) + ' Z',
        className: 'wf-rect-icon-glyph',
      }))
    },
    link: () => {
      if (e.text) {
        // 有文本：accent 链接文字 + 下划线
        kids.push(el('text', { x: e.x + 6, y: e.y + 18, className: 'wf-rect-link-text', ...clickProps }, e.text))
        kids.push(el('line', { x1: e.x + 6, y1: e.y + 21, x2: e.x + Math.min(e.w - 6, 6 + String(e.text).length * 12), y2: e.y + 21, className: 'wf-rect-link-line' }))
      } else {
        // 空链接：弱虚线框 + 链环几何占位（无文字）
        kids.push(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: 'wf-rect wf-rect-ghost' + (selected ? ' wf-selected' : ''), ...clickProps }))
        const s = fitScale(e.w, e.h, 44, 24)
        kids.push(el('g', { transform: 'translate(' + (cx - 12 * s) + ',' + (cy - 12 * s) + ') scale(' + s + ')' },
          el('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', className: 'wf-rect-link-glyph' }),
          el('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', className: 'wf-rect-link-glyph' }),
        ))
      }
    },
    select: () => {
      kids.push(body(4))
      // 下拉箭头：纯几何折线
      kids.push(el('path', { d: 'M ' + (e.x + e.w - 16) + ' ' + (cy - 2) + ' l 4.5 4.5 l 4.5 -4.5', className: 'wf-rect-select-chev' }))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, 'wf-rect-text-ph'))
    },
    checkbox: () => {
      // 复选框：元素级弱虚线框（圈定大小，同文本控件）+ 勾选框；checked 才显示对勾（纯 path）
      kids.push(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: 'wf-rect wf-rect-ghost' + (selected ? ' wf-selected' : ''), ...clickProps }))
      const bs = clamp(Math.min(18, e.h - 8), 12, 18)
      const bx = e.x + 4
      const by = cy - bs / 2
      kids.push(el('rect', { x: bx, y: by, width: bs, height: bs, rx: 4, className: 'wf-rect-box' }))
      if (e.checked) {
        kids.push(el('path', {
          d: 'M ' + (bx + bs * 0.24) + ' ' + (by + bs * 0.52) + ' l ' + (bs * 0.2) + ' ' + (bs * 0.2) + ' l ' + (bs * 0.38) + ' -' + (bs * 0.44),
          className: 'wf-rect-box-check',
        }))
      }
      // 标签 = 显示文本（props.text，与 JSONL 同源；label 已并入 text）
      if (e.text) kids.push(labelText(bx + bs + 8, cy + 4, e.text))
    },
    radio: () => {
      // 单选框：元素级弱虚线框 + 外环；选中时才显示内点
      kids.push(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: 'wf-rect wf-rect-ghost' + (selected ? ' wf-selected' : ''), ...clickProps }))
      const r = clamp(Math.min(9, e.h / 2 - 2), 6, 9)
      const rcx = e.x + 13
      kids.push(el('circle', { cx: rcx, cy, r, className: 'wf-rect-circle' }))
      if (e.checked) kids.push(el('circle', { cx: rcx, cy, r: r * 0.42, className: 'wf-rect-circle-dot' }))
      // 标签 = 显示文本（props.text，与 JSONL 同源；label 已并入 text）
      if (e.text) kids.push(labelText(rcx + r + 7, cy + 4, e.text))
    },
    switch: () => {
      // 开关：元素级弱虚线框 + 轨道；旋钮位置反映 checked（左=关/右=开）
      kids.push(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: 'wf-rect wf-rect-ghost' + (selected ? ' wf-selected' : ''), ...clickProps }))
      const th = clamp(Math.min(16, e.h - 8), 10, 16)
      const tw = clamp(Math.min(34, e.w - 8), 16, 34)
      const tx = e.x + 4
      const ty = cy - th / 2
      const on = !!e.checked
      kids.push(el('rect', { x: tx, y: ty, width: tw, height: th, rx: th / 2, className: 'wf-rect-switch' + (on ? ' wf-rect-switch-on' : '') }))
      const kr = Math.max(3.5, th / 2 - 2.5)
      const kx = on ? tx + tw - kr - 2.5 : tx + kr + 2.5
      kids.push(el('circle', { cx: kx, cy, r: kr, className: 'wf-rect-switch-knob' }))
      // 标签 = 显示文本（props.text，与 JSONL 同源）
      if (e.text) kids.push(labelText(tx + tw + 10, cy + 4, e.text))
    },
    progress: () => {
      // 进度条：轨道 + 示意填充（进度是运行态，画布仅表达结构，固定 60% 示意）
      const th = clamp(Math.min(10, e.h * 0.5), 4, 10)
      const ty = cy - th / 2
      kids.push(el('rect', { x: e.x, y: ty, width: e.w, height: th, rx: th / 2, className: 'wf-rect-progress-bg', ...clickProps }))
      kids.push(el('rect', { x: e.x, y: ty, width: Math.max(th, e.w * 0.6), height: th, rx: th / 2, className: 'wf-rect-progress-fill' }))
    },
    divider: () => {
      // 分割线：主线 + 两端短端帽（可辨识整盒范围）
      const cap = clamp(Math.min(4, e.h * 0.4), 2, 4)
      kids.push(el('line', { x1: e.x, y1: cy, x2: e.x + e.w, y2: cy, className: 'wf-rect-divider', ...clickProps }))
      kids.push(el('line', { x1: e.x, y1: cy - cap, x2: e.x, y2: cy + cap, className: 'wf-rect-divider-cap' }))
      kids.push(el('line', { x1: e.x + e.w, y1: cy - cap, x2: e.x + e.w, y2: cy + cap, className: 'wf-rect-divider-cap' }))
    },
    badge: () => { kids.push(body(Math.max(6, e.h / 2))); if (e.text) kids.push(labelC(e.text)) },
    text: () => {
      // 文本类型：弱虚线外框（ghost，无背景需外框圈定大小）+ 左对齐用户文本
      kids.push(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, rx: 4, className: 'wf-rect wf-rect-ghost' + (selected ? ' wf-selected' : ''), ...clickProps }))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text))
    },
    container: () => {
      // container 与待推断矩形：统一矩形，待推断用虚线提示
      kids.push(body(6))
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text))
    },
  }
  const shape = SHAPES[et] || SHAPES.container
  shape()

  if (selected) {
    // 四边手柄（横向/纵向 resize 视觉指示；命中判定在状态机几何层）：上/下/左/右
    kids.push(el('rect', { x: e.x - 3, y: e.y - 3, width: e.w + 6, height: 6, className: 'wf-edge wf-edge-ns' }))
    kids.push(el('rect', { x: e.x - 3, y: e.y + e.h - 3, width: e.w + 6, height: 6, className: 'wf-edge wf-edge-ns' }))
    kids.push(el('rect', { x: e.x - 3, y: e.y, width: 6, height: e.h, className: 'wf-edge wf-edge-ew' }))
    kids.push(el('rect', { x: e.x + e.w - 3, y: e.y, width: 6, height: e.h, className: 'wf-edge wf-edge-ew' }))
    kids.push(el('rect', { x: e.x + e.w - 9, y: e.y + e.h - 9, width: 10, height: 10, rx: 2, className: 'wf-handle' }))
  }
  kids.push(renderInlineEdit())
  return el('g', { key: e.id }, kids)
}
