// 语义预览：把解析出的节点树渲染为结构化 UI，确认解析正确性
// 纯展示组件：不响应交互（按钮 disabled、输入 readOnly）
// 视觉与画布控件语言一致：每种类型渲染为真实 UI 组件形态（按钮像按钮、开关像开关）
import React from 'react'

const el = React.createElement

function renderNode(node, key) {
  const name = node.name || ''
  const text = (node.props && node.props.text) || ''
  const title = node.description || name
  switch (node.type) {
    case 'page':
      // 页面 = 一个设计稿（JSONL 的一行根），以卡片形式与其他页面并排
      return el('div', {
        key,
        className: 'wf-pv-page',
        style: {
          flexDirection: node.direction === 'horizontal' ? 'row' : 'column',
          flexWrap: node.wrap ? 'wrap' : 'nowrap',
        },
        title,
      },
        (node.children || []).map((c, i) => renderNode(c, i)),
        el('span', { className: 'wf-pv-tag' }, name || '页面'),
      )
    case 'container':
      return el('div', {
        key,
        className: 'wf-pv-container',
        style: {
          flexDirection: node.direction === 'horizontal' ? 'row' : 'column',
          flexWrap: node.wrap ? 'wrap' : 'nowrap',
        },
        title,
      },
        (node.children || []).map((c, i) => renderNode(c, i)),
        el('span', { className: 'wf-pv-tag' }, name || '容器'),
      )
    case 'text':
      return el('div', { key, className: 'wf-pv-text', title }, text || name)
    case 'button':
      return el('button', { key, className: 'wf-pv-button', title, disabled: true }, text || '按钮')
    case 'input':
      return el('input', {
        key, className: 'wf-pv-input', title,
        placeholder: (node.props && node.props.placeholder) || '', readOnly: true,
      })
    case 'textarea':
      return el('textarea', {
        key, className: 'wf-pv-textarea', title,
        placeholder: (node.props && node.props.placeholder) || '',
        rows: (node.props && node.props.rows) || 3, readOnly: true,
      })
    case 'image':
      // 图片仅陈述结构（无 src 字段），预览统一占位；资源需求走 description
      return el('div', { key, className: 'wf-pv-image wf-pv-ph', title }, '图片')
    case 'video':
      return el('div', { key, className: 'wf-pv-media wf-pv-video', title },
        el('span', { className: 'wf-pv-media-play' }, '▶'), '视频')
    case 'audio':
      return el('div', { key, className: 'wf-pv-media wf-pv-audio', title }, '♪ 音频')
    case 'icon':
      return el('span', { key, className: 'wf-pv-icon', title }, '✦')
    case 'link':
      return el('a', { key, className: 'wf-pv-link', title }, text || '链接')
    case 'select':
      return el('span', { key, className: 'wf-pv-select', title },
        el('span', { className: 'wf-pv-select-text' }, text || '请选择'),
        el('span', { className: 'wf-pv-select-arrow' }, '▾'),
      )
    case 'checkbox':
      return el('span', { key, className: 'wf-pv-check', title },
        el('span', { className: 'wf-pv-box' }, '✓'),
        text || name,
      )
    case 'radio':
      return el('span', { key, className: 'wf-pv-check', title },
        el('span', { className: 'wf-pv-radio' }),
        text || name,
      )
    case 'switch':
      return el('span', { key, className: 'wf-pv-check', title },
        el('span', { className: 'wf-pv-switch' }),
        text || name,
      )
    case 'progress':
      return el('div', { key, className: 'wf-pv-progress', title },
        el('div', { className: 'wf-pv-progress-fill', style: { width: '60%' } }),
      )
    case 'divider':
      return el('div', { key, className: 'wf-pv-divider' })
    case 'badge':
      return el('span', { key, className: 'wf-pv-badge', title }, text || 'badge')
    default:
      return el('div', { key, className: 'wf-pv-other', title },
        node.type + (text ? '：' + text : '') + (name && name !== text ? '（' + name + '）' : ''))
  }
}

export function SemanticPreview({ tree }) {
  // tree 可为单根或多根数组（多页面模式：每页一个根，并排展示）
  const list = Array.isArray(tree) ? tree : (tree ? [tree] : [])
  if (!list.length) return el('div', { className: 'wf-pv-root' }, null)
  return el('div', { className: 'wf-pv-root' },
    list.map((t, i) => renderNode(t, 'root' + i)),
  )
}
