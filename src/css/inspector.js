// 右栏：控件设置 + 高度拖拽触发区 + 画布历史
export const INSPECTOR_CSS = `
.wf-right {
  flex: none; width: 304px;
  display: flex; flex-direction: column; min-height: 0;
  border-left: 1px solid var(--wf-border);
  box-sizing: border-box;
}
/* 拖拽调整历史高度时禁止选中文本 */
.wf-right.wf-resizing { user-select: none; }
/* 控件设置模块 */
.wf-insp-wrap {
  flex: 1 1 0%; min-height: 0;
  display: flex; flex-direction: column;
}
.wf-insp {
  flex: 1 1 0%; min-height: 0;
  overflow-y: auto;
  padding: 14px;
  display: flex; flex-direction: column; gap: 12px;
}
.wf-insp-empty {
  justify-content: center; align-items: center;
  color: var(--wf-text-2); font-size: 12px; text-align: center;
  white-space: pre-line; line-height: 2;
}
/* 高度拖拽触发区（画布历史 title 栏上边）：无视觉横线，仅 hover 显示缩放手柄光标 */
.wf-resizer {
  flex: none; height: 6px;
  cursor: ns-resize; touch-action: none;
}
.wf-field-row { display: flex; flex-direction: column; gap: 5px; }
.wf-field-head { display: flex; align-items: baseline; gap: 8px; }
.wf-field-label { font-size: 12px; font-weight: 500; color: var(--wf-text); }
/* 提示语弱化：比标题暗一档，不抢视觉焦点 */
.wf-field-hint { flex: 1; font-size: 11px; color: color-mix(in srgb, var(--wf-text-2) 68%, transparent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wf-field-input {
  width: 100%; box-sizing: border-box;
  padding: 5px 8px;
  background: var(--wf-bg-sunken); color: var(--wf-text);
  border: 1px solid var(--wf-border); border-radius: 6px;
  font-size: 12px;
}
.wf-field-input:focus { outline: 2px solid var(--wf-accent); outline-offset: -1px; }
.wf-insp-row { display: flex; align-items: center; gap: 4px; }
.wf-insp-check { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--wf-text-2); cursor: pointer; }
.wf-insp-actions { margin-top: 2px; }
.wf-mini-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px; font-size: 12px;
  background: transparent; border: none; border-radius: 6px;
  color: var(--wf-text-2); cursor: pointer; white-space: nowrap;
  transition: background-color .1s ease, color .1s ease;
}
.wf-mini-btn:hover:not(:disabled) { background: var(--wf-hover); color: var(--wf-text); }
.wf-mini-btn:disabled { opacity: .5; cursor: default; }
.wf-mini-btn.wf-on { color: var(--wf-accent); background: color-mix(in srgb, var(--wf-accent) 14%, transparent); }
.wf-mini-btn.wf-danger { color: var(--wf-danger); }
.wf-mini-btn.wf-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-danger) 14%, transparent); }
`
