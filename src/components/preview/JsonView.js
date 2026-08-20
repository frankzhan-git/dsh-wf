// JSON 格式化 + 语法高亮视图（画布悬浮面板 / 历史条目复用）
import React from 'react'
import { formatJson, tokenizeJson } from '../../core/jsonl/prettify.js'

const el = React.createElement

export function JsonView({ text, className }) {
  if (!text) return el('div', { className: 'wf-empty' }, '（画布为空）')
  const formatted = formatJson(text)
  const tokens = tokenizeJson(formatted)
  return el('pre', { className: className || 'wf-jsonl' },
    tokens.map((tok, i) => (tok.c ? el('span', { key: i, className: 'wf-j-' + tok.c }, tok.t) : tok.t)),
  )
}
