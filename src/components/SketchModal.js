// 画板浮层（conversation.input.overlay）：绘制草图 → 实时 JSONL + 语义预览 → 插入输入框
// S2 重构后为纯编排层（≤300 行）：状态在 useSketchState，交互在 useCanvasInteractions，
// 编辑动作在 useCanvasEdit，画布管理/自动保存在 useCanvasManager，全部计算在 core/interactions 纯函数
// 渲染委托给纯展示子组件：CanvasStage / CanvasOverlay / RightPanel（控件设置 + 画布历史）
import React from 'react'
import { CANVAS_W, CANVAS_H, cloneElements, reserveSeqs } from '../core/model.js'
import { contains, inferType } from '../core/infer.js'
import { buildResult } from '../core/pipeline.js'
import { buildInsertText } from '../core/prompt.js'
import { groupBounds } from '../core/interactions.js'
import { useOpen } from '../hooks/useOpen.js'
import { useToasts } from '../hooks/useToasts.js'
import { useSketchState } from '../hooks/useSketchState.js'
import { useCanvasInteractions } from '../hooks/useCanvasInteractions.js'
import { useCanvasEdit } from '../hooks/useCanvasEdit.js'
import { useCanvasManager, initLast, freshPage } from '../hooks/useCanvasManager.js'
import { setOpen } from '../core/store.js'
import { t } from '../i18n/index.js'
import { CanvasStage } from './canvas/CanvasStage.js'
import { CanvasOverlay } from './canvas/CanvasOverlay.js'
import { RightPanel } from './RightPanel.js'
import { TYPE_LABEL } from './common/typeLabels.js'
import { Toast } from './common/Toast.js'
import { IconPlusOutline16, IconCloseOutline16, IconFullscreenOutline16, IconDownloadOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'

const el = React.createElement

export function SketchModal(props) {
  const open = useOpen()
  const p = props || {}
  // 右侧面板显示开关（画布左上角「设置」按钮控制）；hooks 必须位于 early return 之前
  const [panelOpen, setPanelOpen] = React.useState(true)
  // 所有 hooks 必须位于 early return 之前（React 规则）
  const draft = (p.useInput || (() => null))((s) => (s && typeof s.draft === 'string' ? s.draft : ''))
  const { toast, showToast } = useToasts(open)
  const initLastRef = React.useRef(null) // 惰性初始化一次，避免多次读 localStorage
  if (initLastRef.current === null) {
    initLastRef.current = initLast()
    // 载入即推进 id 序列：刷新浏览器后 seq 归零，而画布元素 id 仍从 e1 起 ——
    // 不推进则复制粘贴的副本 id 与既有元素重复（副本无法独立操作、保存覆盖原件）
    if (initLastRef.current) reserveSeqs(initLastRef.current.els)
  }
  const init = initLastRef.current
  const sketch = useSketchState({
    elements: init ? init.els : freshPage(),
    rootName: init ? init.root : '画布',
    currentId: init ? init.id : null,
  })
  const svgRef = React.useRef(null)
  const viewRef = React.useRef(null)
  const result = React.useMemo(() => buildResult(sketch.elements, sketch.rootName), [sketch.elements, sketch.rootName])

  // hook 顺序：toasts → sketchState → canvasEdit（编辑动作） → canvasInteractions（依赖 edit） → canvasManager
  const edit = useCanvasEdit({
    elements: sketch.elements, setElements: sketch.setElements,
    selectedIds: sketch.selectedIds, selectedId: sketch.selectedId,
    applySelection: sketch.applySelection, commitHistory: sketch.commitHistory,
    showToast,
  })

  const interactions = useCanvasInteractions({
    open, elements: sketch.elements, setElements: sketch.setElements,
    selectedIds: sketch.selectedIds, applySelection: sketch.applySelection,
    commitHistory: sketch.commitHistory, mode: sketch.mode, setMode: sketch.setMode,
    editing: edit.editing, setEditing: edit.setEditing,
    copyBuf: sketch.copyBuf, setCopyBuf: sketch.setCopyBuf,
    undo: sketch.undo, redo: sketch.redo,
    removeSel: edit.removeSel, showToast, svgRef, viewRef,
  })

  const manager = useCanvasManager({
    open, result, elements: sketch.elements, setElements: sketch.setElements,
    rootName: sketch.rootName, setRootName: sketch.setRootName,
    currentId: sketch.currentId, setCurrent: sketch.setCurrent, currentIdRef: sketch.currentIdRef,
    applySelection: sketch.applySelection, commitHistory: sketch.commitHistory,
    setPast: sketch.setPast, setFuture: sketch.setFuture, setCopyBuf: sketch.setCopyBuf,
    setEditing: edit.setEditing, setMenu: edit.setMenu, setTypeMenu: edit.setTypeMenu,
    setZoom: interactions.setZoom, setPan: interactions.setPan,
    setSnapLines: interactions.setSnapLines,
    showToast, lastSavedInit: init ? init.els : null,
  })

  if (!open) return null

  const errors = result.issues.filter((i) => i.level === 'error')
  const sel = sketch.elements.find((e) => e.id === sketch.selectedId) || null
  const selHasKids = sel ? sketch.elements.some((o) => o.id !== sel.id && contains(sel, o)) : false
  const selTypeLabel = sel && sel.kind === 'rect' && !sel.type
    ? (inferType(sel) || '容器')
    : (sel ? sel.type : null)

  // ---------- 插入输入框 ----------
  const insert = () => {
    const ia = p.inputActions
    if (!ia || typeof ia.setDraft !== 'function') {
      showToast(t('toast.inputUnavailable'))
      return
    }
    const text = buildInsertText(result.jsonl)
    const cur = typeof draft === 'string' && draft.trim() ? draft.replace(/\s+$/, '') + '\n' : ''
    ia.setDraft(cur + text)
    setOpen(false)
  }

  // ---------- 右键菜单（含「更换控件类型」级联） ----------
  const menuTargetType = edit.menu ? (sketch.elements.find((e) => e.id === edit.menu.id) || {}).type || null : null
  // 类型修改限制：页面锁定 + 被包含不可设 page + 有子不可设非容器（core/types 统一过滤）
  const menuTypeOptions = edit.menu ? edit.selTypeOptions(sketch.elements.find((e) => e.id === edit.menu.id)) : []
  const menuTargetIsPage = menuTargetType === 'page'
  const menuEl = edit.menu ? el('div', {
    className: 'wf-menu-backdrop',
    // 阻止冒泡：点击 backdrop 只关闭菜单，不能让事件穿透到 .wf-mask 关闭整个弹窗
    onClick: (ev) => { ev.stopPropagation(); edit.closeMenu() },
    onContextMenu: (ev) => { ev.preventDefault(); ev.stopPropagation(); edit.closeMenu() },
  },
    el('div', { className: 'wf-menu', style: { left: edit.menu.x, top: edit.menu.y }, onClick: (ev) => ev.stopPropagation() },
      // 页面不允许置顶/置底（页面恒在底层，渲染层由 CanvasStage 保证）
      !menuTargetIsPage ? el('div', { className: 'wf-menu-item', onClick: () => { edit.toTop(edit.menu.id); edit.closeMenu() } }, '置于顶层') : null,
      !menuTargetIsPage ? el('div', { className: 'wf-menu-item', onClick: () => { edit.toBottom(edit.menu.id); edit.closeMenu() } }, '置于底层') : null,
      // 无可选类型（页面锁定 / 无变更余地）时不显示「更换控件类型」
      !menuTargetIsPage && menuTypeOptions.length > 1 ? el('div', {
        className: 'wf-menu-item wf-menu-cascade',
        onMouseEnter: () => edit.setTypeMenu(true),
        onClick: () => edit.setTypeMenu(!edit.typeMenu),
      },
        '更换控件类型',
        el('span', { className: 'wf-menu-caret' }, '▸'),
        edit.typeMenu ? el('div', { className: 'wf-menu wf-menu-sub' },
          menuTypeOptions.map((t) => el('div', {
            key: t,
            className: 'wf-menu-item' + (menuTargetType === t ? ' wf-menu-item-on' : ''),
            onClick: () => { edit.patchType(edit.menu.id, t); edit.closeMenu() },
          }, TYPE_LABEL[t] || t)),
        ) : null,
      ) : null,
      // 分隔线：页面菜单只有「删除」一项，不需要分隔线
      !menuTargetIsPage ? el('div', { className: 'wf-menu-sep' }) : null,
      el('div', {
        className: 'wf-menu-item wf-menu-danger',
        onClick: () => { edit.removeEl(edit.menu.id); edit.closeMenu() },
      }, menuTargetIsPage && edit.pageInnerCount(edit.menu.id) > 0
        ? '删除页面（含 ' + edit.pageInnerCount(edit.menu.id) + ' 个控件）'
        : '删除'),
    ),
  ) : null

  // ---------- 删除确认弹窗（页面含控件时） ----------
  const confirmDialog = edit.confirmDelete ? el('div', { className: 'wf-mask wf-mask-confirm', onClick: edit.confirmDeleteCancel },
    el('div', { className: 'wf-confirm', onClick: (ev) => ev.stopPropagation() },
      el('div', { className: 'wf-confirm-title' }, '删除确认'),
      el('div', { className: 'wf-confirm-body' },
        '删除页面将同时删除其内部 ' + edit.confirmDelete.extraCount + ' 个控件，确定删除？'),
      el('div', { className: 'wf-confirm-actions' },
        el('button', { type: 'button', className: 'wf-btn', onClick: edit.confirmDeleteCancel }, '取消'),
        el('button', { type: 'button', className: 'wf-btn wf-primary wf-danger', onClick: edit.confirmDeleteExecute }, '确认删除'),
      ),
    ),
  ) : null

  return el('div', { className: 'wf-mask', onClick: () => setOpen(false) },
    el('div', { className: 'wf-modal' + (interactions.fullscreen ? ' wf-modal-fs' : ''), onClick: (ev) => ev.stopPropagation() },
      // 顶栏：标题在左，功能菜单（新建 | 最大化/最小化 | 关闭）在右上角（画布改名走历史列表）
      el('div', { className: 'wf-head' },
        el('span', { className: 'wf-title' }, t('title')),
        el('span', { className: 'wf-spacer' }),
        el('div', { className: 'wf-head-menu' },
          el('button', { type: 'button', className: 'wf-mini-btn wf-new-btn', title: t('newTitle'), onClick: manager.newCanvas },
            el(IconPlusOutline16, { size: 14 }), t('new')),
          el('button', {
            type: 'button',
            className: 'wf-icon-btn',
            title: interactions.fullscreen ? t('exitFullscreen') : t('fullscreen'),
            onClick: () => interactions.setFullscreen(!interactions.fullscreen),
          },
            interactions.fullscreen ? el(IconDownloadOutline16, { size: 14 }) : el(IconFullscreenOutline16, { size: 14 }),
          ),
          el('button', {
            type: 'button', className: 'wf-icon-btn', title: t('close'),
            onClick: () => setOpen(false),
          }, el(IconCloseOutline16, { size: 14 })),
        ),
      ),
      // 主体：画布 + 右栏（画布占满左栏空出的空间）
      el('div', { className: 'wf-body' },
        // 中栏：画布舞台 + 悬浮层
        el('div', { className: 'wf-canvas-wrap' },
          el(CanvasStage, {
            elements: sketch.elements, selectedId: sketch.selectedId, editing: edit.editing,
            mode: sketch.mode, zoom: interactions.zoom, pan: interactions.pan,
            spaceDown: interactions.spaceDown, drag: interactions.drag,
            svgRef, viewRef, canvasCursor: interactions.canvasCursor,
            snapLines: interactions.snapLines, selectedIds: sketch.selectedIds,
            groupBounds: groupBounds(sketch.elements, sketch.selectedIds),
            onMouseDown: interactions.onMouseDown, onMouseMove: interactions.onMouseMove,
            onMouseUp: interactions.onMouseUp, onMouseLeave: interactions.onMouseLeave,
            onCloseMenu: edit.closeMenu,
            onSelect: (id) => sketch.applySelection([id]),
            onStartEdit: edit.startEdit,
            onCtxMenu: edit.onCtxMenu,
            onEditChange: (ed) => { edit.setEditing(ed); edit.applyEdit(ed) },
            onEditDone: () => edit.setEditing(null),
          }),
          el(CanvasOverlay, {
            mode: sketch.mode,
            onToggleMode: () => { sketch.setMode(sketch.mode === 'select' ? 'draw' : 'select'); sketch.applySelection([]) },
            floatTab: manager.floatTab, onFloatTab: manager.setFloatTab,
            zoom: interactions.zoom, pan: interactions.pan,
            onZoomReset: () => { interactions.setZoom(1); interactions.setPan({ x: 0, y: 0 }) },
            result,
            onCloseFloat: () => manager.setFloatTab(null),
            canUndo: sketch.past.length > 0,
            canRedo: sketch.future.length > 0,
            canClear: sketch.elements.length > 1, // 仅保留预置空页面时不显示清空
            onUndo: sketch.undo, onRedo: sketch.redo, onClear: manager.clearAll,
            panelOpen, onTogglePanel: () => setPanelOpen(!panelOpen),
          }),
        ),
        // 右栏：控件设置 + 画布历史（可折叠/可拖高；由画布左上角「设置」按钮整体显隐）
        panelOpen ? el(RightPanel, {
          sel, selCount: sketch.selectedIds.length, selHasKids,
          selIsNested: !!sel && sketch.elements.some((o) => o.id !== sel.id && contains(o, sel)),
          selTypeOptions: edit.selTypeOptions(sel),
          selTypeLabel, onPatch: edit.patchSel, onRemove: () => edit.removeEl(sel.id),
          docs: manager.docs, currentId: sketch.currentId,
          onLoad: manager.loadCanvas, onDelete: manager.delCanvas,
          onRename: manager.renameCanvas, onExport: manager.exportCanvas,
          onImport: manager.importCanvas,
        }) : null,
      ),
      // 底栏（状态文本已移除，仅操作按钮）
      el('div', { className: 'wf-footer' },
        el('span', { className: 'wf-spacer' }),
        el('button', { type: 'button', className: 'wf-btn', onClick: () => setOpen(false) }, t('cancel')),
        el('button', {
          type: 'button',
          className: 'wf-btn wf-primary',
          disabled: result.empty || errors.length > 0,
          title: errors.length ? t('insertErrorTitle') : t('insertTitle'),
          onClick: insert,
        }, t('insert')),
      ),
      // Toast 浮动提示（不占用布局，自动消失）
      el(Toast, { toast }),
    ),
    menuEl,
    confirmDialog,
  )
}
