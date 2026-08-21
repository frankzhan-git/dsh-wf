// 画布历史（自动保存，点击即载入；高度由拖拽手柄设定，列表独立滚动）
export const HISTORY_CSS = `
.wf-history {
  flex: none;
  display: flex; flex-direction: column; min-height: 0;
  overflow: hidden;              /* 约束子项，保证列表可滚动 */
  border-top: 1px solid var(--wf-border);
}
.wf-history-head {
  flex: none; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
}
.wf-history-title { font-size: 12px; font-weight: 500; color: var(--wf-text); }
.wf-history-count { font-size: 11px; color: var(--wf-text-2); }
.wf-history-list { flex: 1 1 0%; min-height: 0; overflow-y: auto; padding: 0 6px 8px; }
.wf-history-item {
  display: flex; align-items: center; gap: 8px;
  /* 固定行高：hover 时日期↔按钮切换不改变行高（按钮 20px > 日期 ~16px，
     行高变化会导致列表重排、鼠标下内容移动 → hover 抖动循环） */
  height: 30px; box-sizing: border-box;
  margin: 2px 0; padding: 0 8px; border-radius: 6px;
  cursor: pointer;
  transition: background-color .1s ease;
}
.wf-history-item:hover { background: var(--wf-hover); }
.wf-history-item-on { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }
.wf-history-item-on:hover { background: color-mix(in srgb, var(--wf-accent) 16%, transparent); }
.wf-history-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--wf-text); }
.wf-history-del {
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 20px; height: 20px; padding: 0;
  background: transparent; border: none; border-radius: 5px;
  color: var(--wf-text-2); cursor: pointer;
}
.wf-history-del:hover { background: color-mix(in srgb, var(--wf-danger) 14%, transparent); color: var(--wf-danger); }
/* 删除二次确认（行内确认条） */
.wf-history-confirm {
  display: inline-flex; align-items: center; gap: 2px;
  flex: none;
}
.wf-history-confirm-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 6px;
  background: transparent; border: 1px solid var(--wf-border);
  border-radius: 5px;
  color: var(--wf-text-2); font-size: 11px; cursor: pointer;
  white-space: nowrap;
}
.wf-history-confirm-btn:hover { background: var(--wf-hover); color: var(--wf-text); }
.wf-history-confirm-ok { color: var(--wf-danger); border-color: color-mix(in srgb, var(--wf-danger) 45%, transparent); }
.wf-history-confirm-ok:hover { background: color-mix(in srgb, var(--wf-danger) 12%, transparent); color: var(--wf-danger); }
.wf-history-empty {
  padding: 10px 14px 14px;
  font-size: 11px; color: var(--wf-text-2);
}
/* 文档管理（S4）：元信息 + 操作按钮 + 行内重命名
   hover 切换：默认显示日期（右对齐、不预留按钮位）；hover 时隐藏日期、显示操作按钮 */
.wf-history-meta { flex: none; font-size: 11px; color: var(--wf-text-2); font-variant-numeric: tabular-nums; }
.wf-history-actions { display: none; align-items: center; gap: 2px; flex: none; }
.wf-history-item:hover .wf-history-meta { display: none; }
.wf-history-item:hover .wf-history-actions { display: inline-flex; }
.wf-history-del {
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 20px; height: 20px; padding: 0;
  background: transparent; border: none; border-radius: 5px;
  color: var(--wf-text-2); cursor: pointer;
}
.wf-history-del:hover { background: color-mix(in srgb, var(--wf-danger) 14%, transparent); color: var(--wf-danger); }
.wf-history-act {
  display: inline-flex; align-items: center; justify-content: center;
  height: 20px; padding: 0 5px;
  background: transparent; border: none; border-radius: 5px;
  color: var(--wf-text-2); font-size: 11px; cursor: pointer; white-space: nowrap;
}
.wf-history-act:hover { background: var(--wf-hover); color: var(--wf-text); }
.wf-history-rename { flex: 1; min-width: 0; padding: 2px 6px; font-size: 12px; }
`
