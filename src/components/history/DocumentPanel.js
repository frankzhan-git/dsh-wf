// 画布文档面板（纯展示 + 回调）：列表（名称/创建日期）+ 打开 + 重命名 + 删除（二次确认）+ 导出 + 导入
// 由 HistoryPanel 升级（S4）：数据源为 CanvasStore 文档（meta），支持文档级管理
import React from 'react'
import { IconTrashOutline16, IconCloseOutline16, IconDownloadOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'

const el = React.createElement

// 日期格式化（纯函数，随组件维护）：只显示日期（创建日期），不显示时分秒
function fmtDate(iso) {
  try {
    const d = new Date(iso)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  } catch (e) {
    return ''
  }
}

export function DocumentPanel(props) {
  const { docs, currentId, onLoad, onDelete, onRename, onExport, onImport, height } = props
  // 删除二次确认（纯 UI 状态）：点击垃圾桶进入确认态，超时自动恢复
  const [confirmId, setConfirmId] = React.useState(null)
  const confirmTimer = React.useRef(null)
  // 重命名（纯 UI 状态）：点击名称进入行内编辑
  const [renameId, setRenameId] = React.useState(null)
  const [renameVal, setRenameVal] = React.useState('')
  const fileRef = React.useRef(null)
  const armDelete = (id) => {
    setConfirmId(id)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setConfirmId(null), 2500)
  }
  React.useEffect(() => () => { if (confirmTimer.current) clearTimeout(confirmTimer.current) }, [])
  const startRename = (h) => { setRenameId(h.id); setRenameVal(h.name) }
  const commitRename = () => {
    const name = renameVal.trim()
    if (renameId && name) onRename(renameId, name)
    setRenameId(null)
  }
  // title 栏：标题 + 文档数在左，导入按钮在右；列表使用拖拽设定的高度
  return el('div', { className: 'wf-history', style: { height } },
    el('div', { className: 'wf-history-head' },
      el('span', { className: 'wf-history-title' }, '画布历史'),
      el('span', { className: 'wf-history-count' }, docs.length + ' 个'),
      el('span', { className: 'wf-spacer' }),
      el('button', {
        type: 'button', className: 'wf-mini-btn', title: '导入画布文件（.dshwf.json）',
        onClick: () => { if (fileRef.current) fileRef.current.click() },
      }, '导入'),
      el('input', {
        ref: fileRef, type: 'file', accept: '.json,.dshwf.json,application/json',
        style: { display: 'none' },
        onChange: (ev) => {
          const f = ev.target.files && ev.target.files[0]
          if (f) onImport(f)
          ev.target.value = ''
        },
      }),
    ),
    docs.length
      ? el('div', { className: 'wf-history-list' },
          docs.map((h) => el('div', {
            key: h.id,
            className: 'wf-history-item' + (currentId === h.id ? ' wf-history-item-on' : ''),
            title: '点击载入该画布',
            onClick: () => onLoad(h),
          },
            renameId === h.id
              ? el('input', {
                className: 'wf-field-input wf-history-rename',
                value: renameVal,
                autoFocus: true,
                onFocus: (ev) => ev.stopPropagation(),
                onClick: (ev) => ev.stopPropagation(),
                onChange: (ev) => setRenameVal(ev.target.value),
                onBlur: commitRename,
                onKeyDown: (ev) => {
                  ev.stopPropagation()
                  if (ev.key === 'Enter') commitRename()
                  if (ev.key === 'Escape') setRenameId(null)
                },
              })
              : el('span', {
                className: 'wf-history-name',
                onDoubleClick: (ev) => { ev.stopPropagation(); startRename(h) },
              }, h.name),
            el('span', { className: 'wf-history-meta' }, fmtDate(h.createdAt || h.updatedAt)),
            confirmId === h.id
              ? el('span', { className: 'wf-history-confirm', onClick: (ev) => ev.stopPropagation() },
                  el('button', {
                    type: 'button',
                    className: 'wf-history-confirm-btn wf-history-confirm-ok',
                    title: '再次点击确认删除',
                    onClick: () => { setConfirmId(null); onDelete(h.id) },
                  }, '确认删除'),
                  el('button', {
                    type: 'button',
                    className: 'wf-history-confirm-btn',
                    title: '取消',
                    onClick: () => setConfirmId(null),
                  }, el(IconCloseOutline16, { size: 11 })),
                )
              : el('span', { className: 'wf-history-actions', onClick: (ev) => ev.stopPropagation() },
                  el('button', {
                    type: 'button', className: 'wf-history-act', title: '重命名（双击名称也可）',
                    onClick: () => startRename(h),
                  }, '改名'),
                  el('button', {
                    type: 'button', className: 'wf-history-act', title: '导出画布文件',
                    onClick: () => onExport(h.id),
                  }, el(IconDownloadOutline16, { size: 12 })),
                  el('button', {
                    type: 'button', className: 'wf-history-act wf-history-del', title: '删除该画布',
                    onClick: () => armDelete(h.id),
                  }, el(IconTrashOutline16, { size: 12 })),
                ),
          )),
        )
      : el('div', { className: 'wf-history-empty' }, '绘制内容将自动保存到这里，点击可随时载入；支持导出/导入备份'),
  )
}
