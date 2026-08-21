// 画布内悬浮层（纯展示 + 回调）：
// 左上角模式徽标（含 V 键标）/ 右上角 JSONL·预览按钮 / 右下角 撤销·重做·清空 + 缩放 / 输出面板
import React from 'react'
import { JsonView } from '../preview/JsonView.js'
import { SemanticPreview } from '../preview/SemanticPreview.js'
import { buildInsertText } from '../../core/prompt.js'
import {
  IconCodeOutline16, IconChecklistOutline14, IconCloseOutline16,
  IconRefreshOutline16, IconTrashOutline16, IconCopyOutline16, IconSettingsOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'

const el = React.createElement

export function CanvasOverlay(props) {
  const {
    mode, onToggleMode, floatTab, onFloatTab, zoom, pan, onZoomReset, result, onCloseFloat,
    canUndo, canRedo, canClear, onUndo, onRedo, onClear,
    panelOpen, onTogglePanel,
  } = props
  // 语义预览：多页面模式下按页面切换（纯 UI 状态），默认第一个页面
  const [pvIdx, setPvIdx] = React.useState(0)
  // JSONL 复制反馈（纯 UI 状态）
  const [copied, setCopied] = React.useState(false)
  const copyTimer = React.useRef(null)
  // 清空二次确认（纯 UI 状态）：点击后进入确认态，超时自动恢复
  const [clearArm, setClearArm] = React.useState(false)
  const clearTimer = React.useRef(null)
  // 浮窗尺寸（右下角拖拽 resize；初始 = CSS 默认大小，拖拽起点即最小尺寸）
  const [floatSize, setFloatSize] = React.useState(null)
  const floatRef = React.useRef(null)
  const floatResizeRef = React.useRef(null)
  const startFloatResize = (ev) => {
    ev.preventDefault(); ev.stopPropagation()
    const panel = floatRef.current
    if (!panel || !ev.currentTarget.setPointerCapture) return
    ev.currentTarget.setPointerCapture(ev.pointerId)
    floatResizeRef.current = { startX: ev.clientX, startY: ev.clientY, startW: panel.offsetWidth, startH: panel.offsetHeight }
  }
  const moveFloatResize = (ev) => {
    const d = floatResizeRef.current
    if (!d) return
    // 最小尺寸 = 拖拽起点（当前大小）
    setFloatSize({
      w: Math.max(d.startW, d.startW + (ev.clientX - d.startX)),
      h: Math.max(d.startH, d.startH + (ev.clientY - d.startY)),
    })
  }
  const endFloatResize = () => { floatResizeRef.current = null }
  const pages = Array.isArray(result.tree) ? result.tree : (result.tree ? [result.tree] : [])
  const safeIdx = Math.min(pvIdx, Math.max(0, pages.length - 1))
  const zoomPct = Math.round(zoom * 100)
  const atDefault = zoom === 1 && pan.x === 0 && pan.y === 0
  const armClear = () => {
    setClearArm(true)
    if (clearTimer.current) clearTimeout(clearTimer.current)
    clearTimer.current = setTimeout(() => setClearArm(false), 2500)
  }
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildInsertText(result.jsonl))
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1600)
    } catch (e) { /* 剪贴板不可用则忽略 */ }
  }
  React.useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current)
    if (clearTimer.current) clearTimeout(clearTimer.current)
  }, [])
  return el('div', { className: 'wf-canvas-overlay' },
    el('div', {
      className: 'wf-mode-badge' + (mode === 'draw' ? ' wf-mode-badge-draw' : ''),
      title: '点击切换模式；长按 Alt 临时进入绘制模式，松开恢复选择',
      onClick: onToggleMode,
    },
      mode === 'select' ? '选择模式' : '绘制模式',
      el('kbd', { className: 'wf-mode-key' }, 'Alt'),
    ),
    // 右上角工具行：JSONL · 预览 · 设置（右侧面板显示/隐藏开关）
    el('div', { className: 'wf-canvas-tools' },
      el('button', {
        type: 'button',
        className: 'wf-ctool' + (floatTab === 'jsonl' ? ' wf-ctool-on' : ''),
        title: '查看生成的 JSONL',
        onClick: () => onFloatTab(floatTab === 'jsonl' ? null : 'jsonl'),
      }, el(IconCodeOutline16, { size: 14 }), 'JSONL'),
      el('button', {
        type: 'button',
        className: 'wf-ctool' + (floatTab === 'preview' ? ' wf-ctool-on' : ''),
        title: '查看语义预览',
        onClick: () => onFloatTab(floatTab === 'preview' ? null : 'preview'),
      }, el(IconChecklistOutline14, { size: 14 }), '预览'),
      el('button', {
        type: 'button',
        className: 'wf-ctool' + (panelOpen ? ' wf-ctool-on' : ''),
        title: panelOpen ? '隐藏右侧面板' : '显示右侧面板',
        onClick: onTogglePanel,
      },
        el(IconSettingsOutline16, { size: 14 }), '设置'),
    ),
    // 右下角：撤销/重做/清空（不可用即隐藏）+ 缩放
    el('div', { className: 'wf-canvas-actions' },
      el('div', { className: 'wf-action-group' },
        canUndo ? el('button', {
          type: 'button',
          className: 'wf-iaction wf-iaction-undo',
          title: '撤销 (Ctrl+Z)',
          onClick: onUndo,
        }, el(IconRefreshOutline16, { size: 13 })) : null,
        canRedo ? el('button', {
          type: 'button',
          className: 'wf-iaction',
          title: '重做 (Ctrl+Shift+Z)',
          onClick: onRedo,
        }, el(IconRefreshOutline16, { size: 13 })) : null,
        canClear ? (clearArm
          ? el('button', {
            type: 'button',
            className: 'wf-iaction wf-iaction-danger wf-iaction-wide',
            title: '再次点击确认清空',
            onClick: () => { setClearArm(false); onClear() },
          }, '确认清空')
          : el('button', {
            type: 'button',
            className: 'wf-iaction',
            title: '清空画布',
            onClick: armClear,
          }, el(IconTrashOutline16, { size: 13 }))) : null,
      ),
      el('div', { className: 'wf-zoom-bar' },
        // 点击缩放百分比本身恢复 100%（非默认时可点，样式提示可点击）
        el('button', {
          type: 'button',
          className: 'wf-zoom-pct' + (atDefault ? '' : ' wf-zoom-pct-click'),
          title: atDefault ? '100%' : '点击恢复 100%',
          disabled: atDefault,
          onClick: onZoomReset,
        }, zoomPct + '%'),
      ),
    ),
    floatTab ? el('div', { ref: floatRef, className: 'wf-float-panel', style: floatSize ? { width: floatSize.w + 'px', height: floatSize.h + 'px' } : null },
      el('div', { className: 'wf-float-head' },
        el('span', null, floatTab === 'jsonl' ? 'JSONL 输出' : '语义预览'),
        el('span', { className: 'wf-spacer' }),
        floatTab === 'jsonl' ? el('button', {
          type: 'button',
          className: 'wf-float-copy' + (copied ? ' wf-float-copy-ok' : ''),
          title: '复制完整提示词（标准说明 + JSONL），可粘贴到其他工具使用',
          onClick: copyPrompt,
        },
          el(IconCopyOutline16, { size: 13 }),
          copied ? '已复制' : '复制',
        ) : null,
        el('button', { type: 'button', className: 'wf-float-close', title: '关闭', onClick: onCloseFloat },
          el(IconCloseOutline16, { size: 14 })),
      ),
      floatTab === 'jsonl'
        ? el(JsonView, { text: result.jsonl })
        : el('div', { className: 'wf-float-preview' },
            pages.length > 1 ? el('div', { className: 'wf-float-pages' },
              el('select', {
                className: 'wf-float-select',
                value: String(safeIdx),
                onChange: (ev) => setPvIdx(Number(ev.target.value)),
              },
                pages.map((t, i) => el('option', { key: i, value: String(i) }, t.name || '页面' + (i + 1))),
              ),
            ) : null,
            el('div', { className: 'wf-preview' },
              pages.length ? el(SemanticPreview, { tree: pages[safeIdx] }) : el('div', { className: 'wf-empty' }, '（画布为空）'),
            ),
          ),
      // 右下角拖拽 resize 手柄（最小尺寸 = 拖拽起点，即当前大小）
      el('div', {
        className: 'wf-float-resize',
        title: '拖动调整面板大小',
        onPointerDown: startFloatResize,
        onPointerMove: moveFloatResize,
        onPointerUp: endFloatResize,
        onPointerCancel: endFloatResize,
      }),
    ) : null,
  )
}
