// 右侧属性面板（纯展示 + 回调）：选中控件的设置表单
// 字段渲染走 PropField（注册表驱动：inputType 选项等来自 jsonl/props.js）；
// 字段清单按类型显式配置（elKey → 注册表 defKey），保证 UI 文案与旧版逐字一致
import React from 'react'
import { PROPS_BY_KEY } from '../../core/jsonl/props.js'
import { TYPE_LABEL } from '../common/typeLabels.js'
import { fieldRow, renderPropControl } from './PropField.js'

const el = React.createElement

// 显式字段配置：{ label, hint, elKey, defKey, inputType?, placeholder?, trueLabel?, falseLabel? }
// defKey 用于从注册表取类型/选项；elKey 决定读写 el 的哪个字段
const FIELD_DEFS = {
  action: { label: '动作', hint: '作为 props.action（点击后的行为）', elKey: 'action', defKey: 'action', placeholder: '如：提交表单并跳转首页' },
  inputType: { label: '输入类型', hint: '作为 props.inputType', elKey: 'inputType', defKey: 'inputType', placeholder: '文本（默认）' },
  value: { label: '默认值', hint: '作为 props.value', elKey: 'value', defKey: 'value', placeholder: '如：预留的初始内容/选中项' },
  options: { label: '选项', hint: '作为 props.options', elKey: 'optionsText', defKey: 'options', placeholder: '用逗号分隔，如：待付款, 已付款, 已关闭' },
  checked: { label: '默认选中', hint: '作为 props.checked', elKey: 'checked', defKey: 'checked', trueLabel: '已选中', falseLabel: '未选中' },
  label: { label: '标签文字', hint: '作为 props.label', elKey: 'label', defKey: 'label', placeholder: '选项旁边的说明文字' },
  valueNum: { label: '当前进度', hint: '作为 props.value', elKey: 'value', defKey: 'value', inputType: 'number', placeholder: '如 60' },
  max: { label: '最大值', hint: '作为 props.max', elKey: 'max', defKey: 'max', inputType: 'number', placeholder: '如 100' },
  src: { label: '图片地址', hint: '作为 props.src', elKey: 'src', defKey: 'src', placeholder: 'https://…' },
  alt: { label: '替代文本', hint: '作为 props.alt', elKey: 'alt', defKey: 'alt', placeholder: '图片无法加载时的说明' },
  srcV: { label: '视频地址', hint: '作为 props.src', elKey: 'src', defKey: 'src', placeholder: 'https://…' },
  poster: { label: '封面图', hint: '作为 props.poster', elKey: 'poster', defKey: 'poster', placeholder: 'https://…' },
  autoplay: { label: '自动播放', hint: '作为 props.autoplay', elKey: 'autoplay', defKey: 'autoplay', trueLabel: '自动播放', falseLabel: '手动播放' },
  srcA: { label: '音频地址', hint: '作为 props.src', elKey: 'src', defKey: 'src', placeholder: 'https://…' },
  controls: { label: '控制条', hint: '作为 props.controls', elKey: 'controls', defKey: 'controls', trueLabel: '显示控制条', falseLabel: '隐藏控制条' },
  href: { label: '链接地址', hint: '作为 props.href', elKey: 'href', defKey: 'href', placeholder: 'https://…' },
  size: { label: '图标尺寸', hint: '作为 props.size', elKey: 'iconSize', defKey: 'size', inputType: 'number', placeholder: '如 24' },
}

const renderField = (sel, onPatch, key) => {
  const f = FIELD_DEFS[key]
  const def = PROPS_BY_KEY[f.defKey]
  return fieldRow(f.label, f.hint, renderPropControl(def, sel[f.elKey], (v) => onPatch({ [f.elKey]: v }), {
    inputType: f.inputType, placeholder: f.placeholder, trueLabel: f.trueLabel, falseLabel: f.falseLabel,
  }))
}

// 类型 → 字段配置清单（按类型显式列出；新增类型在此补一行即可）
const TYPE_FIELDS = {
  button: ['action'],
  input: ['inputType', 'value'],
  textarea: ['value'],
  select: ['value', 'options'],
  radio: ['checked', 'label', 'value', 'options'],
  checkbox: ['checked', 'label'],
  switch: ['checked'],
  progress: ['valueNum', 'max'],
  image: ['src', 'alt'],
  video: ['srcV', 'poster', 'autoplay'],
  audio: ['srcA', 'controls'],
  link: ['href'],
  icon: ['size'],
}

export function InspectorPanel(props) {
  const { sel, selCount, selHasKids, selIsNested, selTypeOptions, selTypeLabel, onPatch, onRemove } = props
  if (!sel) {
    return el('div', { className: 'wf-insp wf-insp-empty' },
      selCount > 1
        ? '已选中 ' + selCount + ' 个元素\n拖动可整体移动\n拖动外框角可等比缩放'
        : '在画布中选择一个控件\n属性会显示在这里',
    )
  }
  const typeFields = (sel.kind === 'rect' && sel.type && TYPE_FIELDS[sel.type]) ? TYPE_FIELDS[sel.type] : []
  return el('div', { className: 'wf-insp' },
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
    (sel.kind === 'rect' || sel.kind === 'text' || sel.kind === 'note') ? fieldRow(
      sel.kind === 'note' ? '备注内容' : '显示文本',
      sel.kind === 'note' ? null : '作为 props.text；双击画布可编辑',
      el('input', {
        className: 'wf-field-input',
        value: sel.text || '',
        onChange: (ev) => onPatch({ text: ev.target.value }),
      }),
    ) : null,
    fieldRow('要求说明', '作为 description，随 JSONL 发给模型',
      el('input', {
        className: 'wf-field-input',
        value: sel.note || '',
        placeholder: '对元素的要求、业务含义…',
        onChange: (ev) => onPatch({ note: ev.target.value }),
      }),
    ),
    typeFields.map((k) => renderField(sel, onPatch, k)),
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
}
