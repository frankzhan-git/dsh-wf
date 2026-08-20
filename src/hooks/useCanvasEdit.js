// 元素编辑（P1 应用层）：属性修改 / 类型修改限制 / 删除（连带+确认弹窗）/ 层级 / 内联编辑 / 右键菜单状态
// 删除规范（用户 2025 修订）：
//  - 页面删除时连带删除其内部所有控件（中心在页面内）
//  - 页面内有控件时删除需二次确认弹窗（模态）：用户点确认才执行（所有入口统一：Delete 键/右键菜单/属性面板）
//  - 页面不允许置顶/置底（页面恒在底层，渲染层由 CanvasStage 保证）
import React from 'react'
import { cloneElements } from '../core/model.js'
import { contains } from '../core/infer.js'
import { typeOptionsFor } from '../core/types.js'
import { t } from '../i18n/index.js'

export function useCanvasEdit(deps) {
  const {
    elements, setElements, selectedIds, selectedId, applySelection, commitHistory, showToast,
  } = deps
  const [editing, setEditing] = React.useState(null) // 内联编辑：{ id, field: 'text'|'name', value }
  const [menu, setMenu] = React.useState(null) // 右键菜单：{ x, y, id }
  const [typeMenu, setTypeMenu] = React.useState(false) // 「更换控件类型」级联是否展开
  // 删除确认弹窗：{ ids, extraCount } | null（页面含控件时弹出，用户确认后执行）
  const [confirmDelete, setConfirmDelete] = React.useState(null)

  const patchSel = (patch) => {
    commitHistory(cloneElements(elements))
    setElements((els) => els.map((e) => (e.id === selectedId ? Object.assign({}, e, patch) : e)))
  }
  const patchEl = (id, patch) => {
    setElements((els) => els.map((e) => (e.id === id ? Object.assign({}, e, patch) : e)))
  }

  // 类型修改限制（规范三）：页面锁定 / 被包含不可设 page / 有子不可设非容器
  const typeChangeAllowed = (id, type) => {
    const el = elements.find((e) => e.id === id)
    if (!el) return true
    const nested = elements.some((o) => o.id !== id && contains(o, el))
    const hasKids = elements.some((o) => o.id !== id && contains(el, o))
    if (type === 'page' && nested) {
      showToast(t('toast.pageNested'))
      return false
    }
    if (type !== 'container' && type !== 'page' && hasKids) {
      showToast(t('toast.containerHasKids'))
      return false
    }
    return true
  }
  const patchType = (id, type) => {
    if (!typeChangeAllowed(id, type)) return
    commitHistory(cloneElements(elements))
    patchEl(id, { type })
  }

  // ---------- 删除（连带 + 双触确认） ----------

  // 页面内部控件（中心在页面内；与移动跟随同一判定，保证行为一致）
  const pageInnerOf = (id) => {
    const el = elements.find((e) => e.id === id)
    if (!el || el.type !== 'page') return []
    return elements.filter((t) => t.id !== id && t.kind !== 'arrow' &&
      t.x + t.w / 2 >= el.x && t.x + t.w / 2 <= el.x + el.w &&
      t.y + t.h / 2 >= el.y && t.y + t.h / 2 <= el.y + el.h)
  }
  // 页面内部控件数（菜单文案用）
  const pageInnerCount = (id) => pageInnerOf(id).length

  // 统一删除入口：ids + 连带（页面内部控件）→ 有连带时弹确认窗，确认后执行
  const deleteWithConfirm = (ids) => {
    if (!ids.length) return
    const idSet = new Set(ids)
    // 连带：待删页面（本次集合之外的）内部控件
    const extra = []
    for (const id of ids) {
      const el = elements.find((e) => e.id === id)
      if (!el || el.type !== 'page') continue
      for (const t of pageInnerOf(id)) {
        if (!idSet.has(t.id) && !extra.includes(t.id)) extra.push(t.id)
      }
    }
    if (extra.length) {
      // 页面含控件：弹确认窗（用户确认后执行删除）
      setConfirmDelete({ ids: ids.concat(extra), extraCount: extra.length })
      return
    }
    // 无连带：直接执行
    const allSet = new Set(ids)
    commitHistory(cloneElements(elements))
    setElements((els) => els.filter((e) => !allSet.has(e.id)))
    applySelection(selectedIds.filter((x) => !allSet.has(x)))
  }
  // 确认弹窗「确认删除」：执行连带删除
  const confirmDeleteExecute = () => {
    if (!confirmDelete) return
    const allSet = new Set(confirmDelete.ids)
    commitHistory(cloneElements(elements))
    setElements((els) => els.filter((e) => !allSet.has(e.id)))
    applySelection(selectedIds.filter((x) => !allSet.has(x)))
    setConfirmDelete(null)
  }
  // 确认弹窗「取消」
  const confirmDeleteCancel = () => setConfirmDelete(null)

  const removeSel = () => deleteWithConfirm(selectedIds)
  const removeEl = (id) => deleteWithConfirm([id])

  // 层级（z 序 = 数组顺序，数组末尾在最上层）；页面不允许置顶/置底（菜单已隐藏，此处再兜底）
  const toTop = (id) => {
    const el = elements.find((x) => x.id === id)
    if (!el || el.type === 'page') return
    commitHistory(cloneElements(elements))
    setElements((els) => {
      const e = els.find((x) => x.id === id)
      return e ? els.filter((x) => x.id !== id).concat([e]) : els
    })
  }
  const toBottom = (id) => {
    const el = elements.find((x) => x.id === id)
    if (!el || el.type === 'page') return
    commitHistory(cloneElements(elements))
    setElements((els) => {
      const e = els.find((x) => x.id === id)
      return e ? [e].concat(els.filter((x) => x.id !== id)) : els
    })
  }

  // ---------- 内联编辑（双击控件文本 / 双击名字） ----------
  const closeMenu = () => { setMenu(null); setTypeMenu(false) }
  const startEdit = (e, field) => {
    closeMenu() // 防呆：编辑与右键菜单不同时存在
    commitHistory(cloneElements(elements))
    applySelection([e.id])
    setEditing({ id: e.id, field, value: field === 'name' ? (e.name || '') : (e.text || '') })
  }
  const applyEdit = (ed) => {
    const patch = ed.field === 'name' ? { name: ed.value } : { text: ed.value }
    setElements((els) => els.map((e) => (e.id === ed.id ? Object.assign({}, e, patch) : e)))
  }

  const onCtxMenu = (ev, e) => {
    applySelection([e.id])
    setMenu({ x: ev.clientX, y: ev.clientY, id: e.id })
    setTypeMenu(false)
  }

  // 元素可选的类型列表（属性面板与右键菜单共用）：核心规则在 core/types.js（注册表驱动）
  const selTypeOptions = (el) => (el ? typeOptionsFor(el, elements) : [])

  return {
    editing, setEditing, menu, setMenu, typeMenu, setTypeMenu,
    patchSel, patchEl, patchType, removeSel, removeEl,
    pageInnerOf, pageInnerCount, deleteWithConfirm,
    confirmDelete, confirmDeleteExecute, confirmDeleteCancel,
    toTop, toBottom, closeMenu, startEdit, applyEdit, onCtxMenu, selTypeOptions,
  }
}
