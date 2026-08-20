// 会话输入框工具行左端的「草图」按钮（conversation.input.left）
import React from 'react'
import { IconListPenOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { useOpen } from '../hooks/useOpen.js'
import { setOpen } from '../core/store.js'

const el = React.createElement

export function SketchButton() {
  const open = useOpen()
  return el('button', {
    type: 'button',
    className: 'wf-input-btn' + (open ? ' wf-input-btn-on' : ''),
    title: '界面草图：绘制界面布局，转为 JSONL 插入输入框',
    'aria-pressed': open,
    'aria-label': '界面草图',
    onClick: () => setOpen(!open),
  }, el(IconListPenOutline16, { size: 16 }))
}
