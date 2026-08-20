// 属性面板通用字段（纯展示）：fieldRow 布局 + 按注册表字段类型渲染控件（P2）
// def 来自 core/jsonl/props.js 注册表（type/values）；enum 选项直接取自注册表，不手写
import React from 'react'

const el = React.createElement

// 字段行布局：label + hint + control
export function fieldRow(label, hint, control) {
  return el('div', { className: 'wf-field-row' },
    el('div', { className: 'wf-field-head' },
      el('span', { className: 'wf-field-label' }, label),
      hint ? el('span', { className: 'wf-field-hint' }, hint) : null,
    ),
    control,
  )
}

// 注册表驱动控件渲染：
// def = 注册表字段项；value = el 字段当前值；onChange = patch 回调
// extra: { inputType?: 'text'|'number'（覆盖默认）, placeholder?, trueLabel?, falseLabel? }
export function renderPropControl(def, value, onChange, extra) {
  const ex = extra || {}
  const t = ex.inputType || def.type
  const cls = 'wf-field-input'
  if (t === 'boolean') {
    const on = !!value
    return el('label', { className: 'wf-insp-check' },
      el('input', { type: 'checkbox', checked: on, onChange: (ev) => onChange(ev.target.checked) }),
      on ? (ex.trueLabel || '已选中') : (ex.falseLabel || '未选中'),
    )
  }
  if (t === 'number') {
    return el('input', {
      className: cls, type: 'number', min: 0,
      value: value || '',
      placeholder: ex.placeholder || '',
      onChange: (ev) => onChange(ev.target.value),
    })
  }
  if (t === 'enum') {
    const values = (def.values || [])
    return el('select', {
      className: cls,
      value: value || '',
      onChange: (ev) => onChange(ev.target.value),
    },
      value ? null : el('option', { value: '' }, ex.placeholder || '默认'),
      values.map((v) => el('option', { value: v, key: v }, v)),
    )
  }
  // string / any / array：文本输入（array 用逗号分隔编辑）
  return el('input', {
    className: cls,
    value: value || '',
    placeholder: ex.placeholder || '',
    onChange: (ev) => onChange(ev.target.value),
  })
}
