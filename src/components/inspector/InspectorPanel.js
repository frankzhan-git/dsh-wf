// 右侧属性面板（纯展示 + 回调）：选中控件的设置表单
// 字段渲染走 PropField（注册表驱动：inputType 选项等来自 jsonl/props.js）；
// 字段清单 = 注册表 fields（types.js）+ 文本类字段（propsSchema 驱动显隐与标签），不再手写 TYPE_FIELDS
import React from 'react'
import { PROPS_BY_KEY } from '../../core/jsonl/props.js'
import { TYPE_LABEL } from '../common/typeLabels.js'
import { TYPE_BY_TYPE } from '../../core/types.js'
import { inferType } from '../../core/infer.js'
import { fieldRow, renderPropControl } from './PropField.js'

const el = React.createElement

// 显式字段配置：{ label, hint, elKey, defKey, inputType?, placeholder?, trueLabel?, falseLabel? }
// defKey 用于从注册表取类型/选项；elKey 决定读写 el 的哪个字段
// 字段哲学：只承载结构内容（文字/选项/选中态/行为/输入类型）；资源/尺寸/播放细节走「要求说明」
const FIELD_DEFS = {
  action: { label: '动作', hint: '作为 props.action（点击后的行为）', elKey: 'action', defKey: 'action', placeholder: '如：提交表单并跳转首页' },
  inputType: { label: '输入类型', hint: '作为 props.inputType', elKey: 'inputType', defKey: 'inputType', placeholder: '文本（默认）' },
  options: { label: '选项', hint: '作为 props.options', elKey: 'optionsText', defKey: 'options', placeholder: '用逗号分隔，如：待付款, 已付款, 已关闭' },
  checked: { label: '默认选中', hint: '作为 props.checked', elKey: 'checked', defKey: 'checked', trueLabel: '已选中', falseLabel: '未选中' },
}

const renderField = (sel, onPatch, key) => {
  const f = FIELD_DEFS[key]
  if (!f) return null
  const def = PROPS_BY_KEY[f.defKey]
  return fieldRow(f.label, f.hint, renderPropControl(def, sel[f.elKey], (v) => onPatch({ [f.elKey]: v }), {
    inputType: f.inputType, placeholder: f.placeholder, trueLabel: f.trueLabel, falseLabel: f.falseLabel,
  }))
}

// 文本类字段（读写 el.text）：由类型 propsSchema 驱动显隐与标签，与 JSONL 输出语义严格一致
//  - propsSchema 含 text → 「显示文本」（props.text）
//  - 含 placeholder → 「占位提示」（props.placeholder）
//  - 都不含（媒体/图标/下拉/复选/开关/进度/分割线/容器类）→ 不显示，细节需求走「要求说明」
const TEXT_FIELD_BY_KEY = {
  text: { label: '显示文本', hint: '作为 props.text；双击画布可编辑', placeholder: null },
  placeholder: { label: '占位提示', hint: '作为 props.placeholder；双击画布可编辑', placeholder: '如：请输入用户名' },
}

const renderTextField = (sel, onPatch, selHasKids) => {
  if (sel.kind === 'note') {
    return fieldRow('备注内容', null,
      el('input', { className: 'wf-field-input', value: sel.text || '', onChange: (ev) => onPatch({ text: ev.target.value }) }),
    )
  }
  if (sel.kind === 'text') {
    return fieldRow('显示文本', '作为 props.text；双击画布可编辑',
      el('input', { className: 'wf-field-input', value: sel.text || '', onChange: (ev) => onPatch({ text: ev.target.value }) }),
    )
  }
  // rect：按有效类型（显式 / 含子 → 容器 / 推断）取 propsSchema；文本类字段支持 per-type label 覆盖
  // （checkbox/radio 的 text 在面板叫「标签文字」，JSONL 仍输出 props.text）
  const effType = sel.type || (selHasKids ? 'container' : (inferType(sel) || 'container'))
  const def = TYPE_BY_TYPE[effType]
  if (!def) return null
  const textKey = def.propsSchema
    .map((k) => (typeof k === 'string' ? k : k.key))
    .find((k) => TEXT_FIELD_BY_KEY[k])
  if (!textKey) return null
  const override = def.propsSchema.find((k) => typeof k === 'object' && k.key === textKey)
  const t = Object.assign({}, TEXT_FIELD_BY_KEY[textKey], override && override.label ? { label: override.label } : null)
  return fieldRow(t.label, t.hint,
    el('input', {
      className: 'wf-field-input',
      value: sel.text || '',
      placeholder: t.placeholder,
      onChange: (ev) => onPatch({ text: ev.target.value }),
    }),
  )
}

export function InspectorPanel(props) {
  const { sel, selCount, selHasKids, selIsNested, selTypeOptions, selTypeLabel, onPatch, onRemove } = props
  const head = el('div', { className: 'wf-panel-head' },
    el('span', { className: 'wf-panel-title' }, '控件设置'),
  )
  const body = !sel
    ? el('div', { className: 'wf-insp wf-insp-empty' },
        selCount > 1
          ? '已选中 ' + selCount + ' 个元素\n拖动可整体移动\n拖动外框角可等比缩放'
          : '在画布中选择一个控件\n属性会显示在这里',
      )
    : el('div', { className: 'wf-insp' },
        fieldRow('名称', '双击画布名字可直接编辑',
          el('input', {
            className: 'wf-field-input',
            value: sel.name || '',
            placeholder: '留空不输出',
            onChange: (ev) => onPatch({ name: ev.target.value }),
          }),
        ),
        // 类型选择（限制：页面锁定 / 被包含不可设页面 / 有子不可设非容器；选项由 selTypeOptions 给出）
        (sel.kind === 'rect' && sel.type !== 'page' && selTypeOptions.length > 1) || (sel.kind === 'note' && selTypeOptions.length > 1) ? fieldRow('类型',
          (selIsNested ? '被容器包含，不可设为页面' : null) || (selHasKids ? '含子元素，仅可为容器' : null) || (sel.type ? null : '自动推断为「' + (selTypeLabel || '?') + '」'),
          el('select', {
            className: 'wf-field-input',
            value: sel.type || 'auto',
            onChange: (ev) => onPatch({ type: ev.target.value === 'auto' ? null : ev.target.value }),
          },
            sel.type == null ? el('option', { value: 'auto' }, '自动推断（' + (selTypeLabel || '?') + '）') : null,
            selTypeOptions.map((t) => el('option', { value: t, key: t }, TYPE_LABEL[t] || t)),
          ),
        ) : null,
        renderTextField(sel, onPatch, selHasKids),
        fieldRow('要求说明', '作为 description，随 JSONL 发给模型',
          el('input', {
            className: 'wf-field-input',
            value: sel.note || '',
            placeholder: '对元素的要求、业务含义…',
            onChange: (ev) => onPatch({ note: ev.target.value }),
          }),
        ),
        // 注册表 fields（types.js）：仅列该类型真实消费的 props 字段
        (sel.kind === 'rect' && sel.type && TYPE_BY_TYPE[sel.type]) ? TYPE_BY_TYPE[sel.type].fields.map((k) => renderField(sel, onPatch, k)) : null,
        selHasKids ? el('div', { className: 'wf-field-row' },
          el('div', { className: 'wf-field-head' },
            el('span', { className: 'wf-field-label' }, '排列方向'),
            el('span', { className: 'wf-field-hint' }, '作为 direction；自动=按子元素分布推断'),
          ),
          el('div', { className: 'wf-insp-row' },
            el('button', {
              type: 'button', className: 'wf-mini-btn' + (sel.direction == null ? ' wf-on' : ''),
              title: '按子元素分布自动推断',
              onClick: () => onPatch({ direction: null }),
            }, '自动'),
            el('button', {
              type: 'button', className: 'wf-mini-btn' + (sel.direction === 'vertical' ? ' wf-on' : ''),
              title: '子元素从上到下排列（vertical）',
              onClick: () => onPatch({ direction: 'vertical' }),
            }, '上下'),
            el('button', {
              type: 'button', className: 'wf-mini-btn' + (sel.direction === 'horizontal' ? ' wf-on' : ''),
              title: '子元素从左到右排列（horizontal）',
              onClick: () => onPatch({ direction: 'horizontal' }),
            }, '左右'),
            el('label', { className: 'wf-insp-check' },
              el('input', { type: 'checkbox', checked: !!sel.wrap, onChange: (ev) => onPatch({ wrap: ev.target.checked }) }),
              '换行',
            ),
          ),
        ) : null,
        el('div', { className: 'wf-insp-actions' },
          el('button', { type: 'button', className: 'wf-mini-btn wf-danger', onClick: onRemove }, '删除控件'),
        ),
      )
  return el('div', { className: 'wf-insp-wrap' }, head, body)
}
