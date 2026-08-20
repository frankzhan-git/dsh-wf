// 输出区与语义预览：JSON 语法高亮、语义预览、空态
export const PREVIEW_CSS = `
.wf-empty { padding: 24px; text-align: center; color: var(--wf-text-2); }

/* JSON 语法高亮（配色同 dsh-fm 代码预览：键浅蓝/字符串橙/数字绿/字面量蓝） */
.wf-j-key { color: #9cdcfe; }
.wf-j-str { color: #ce9178; }
.wf-j-num { color: #b5cea8; }
.wf-j-lit { color: #569cd6; }
.wf-j-punc { color: var(--wf-text-2); }

/* ---------- 语义预览 ---------- */
.wf-pv-root { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }
.wf-pv-page {
  flex: 1 1 240px; min-width: 0;
  display: flex; gap: 8px;
  padding: 12px; position: relative;
  border: 1.5px solid var(--wf-border-strong); border-radius: 10px;
  background: var(--wf-bg-raised);
  min-height: 28px;
}
.wf-pv-container {
  flex: 1 1 auto; display: flex; gap: 8px;
  padding: 10px; position: relative;
  border: 1.5px dashed var(--wf-border-strong); border-radius: 8px;
  background: color-mix(in srgb, var(--wf-accent) 4%, transparent);
  min-height: 28px;
}
.wf-pv-tag {
  position: absolute; top: -8px; left: 8px;
  font-size: 10px; color: var(--wf-text-2);
  background: var(--wf-bg-raised); padding: 0 4px; border-radius: 4px;
  white-space: nowrap; max-width: 60%; overflow: hidden; text-overflow: ellipsis;
}
.wf-pv-text { flex: 0 0 auto; font-size: 13px; }
.wf-pv-button {
  flex: 0 0 auto; padding: 4px 14px; font-size: 12px;
  background: var(--wf-bg-raised); border: 1px solid var(--wf-border-strong); border-radius: 6px;
  color: var(--wf-text);
}
.wf-pv-input, .wf-pv-textarea {
  flex: 0 0 auto; width: 150px; padding: 4px 8px;
  background: var(--wf-bg-sunken); border: 1px solid var(--wf-border); border-radius: 6px;
  color: var(--wf-text); font-size: 12px;
}
.wf-pv-image {
  flex: 0 0 auto; max-width: 160px; max-height: 90px;
  border-radius: 6px; object-fit: contain;
}
.wf-pv-image.wf-pv-ph {
  display: inline-flex; align-items: center; justify-content: center;
  width: 120px; height: 64px;
  border: 1px dashed var(--wf-border-strong); border-radius: 6px;
  color: var(--wf-text-2); font-size: 12px;
}
.wf-pv-icon { flex: 0 0 auto; font-size: 16px; color: var(--wf-text-2); }
.wf-pv-divider { flex: 0 0 auto; height: 1px; background: var(--wf-border-strong); margin: 8px 0; }
.wf-pv-badge {
  flex: 0 0 auto; padding: 1px 8px; font-size: 11px;
  background: color-mix(in srgb, var(--wf-accent) 18%, transparent);
  color: var(--wf-accent); border-radius: 10px;
}
.wf-pv-switch {
  flex: 0 0 auto; width: 28px; height: 16px;
  background: var(--wf-accent); border-radius: 8px; position: relative;
}
.wf-pv-switch::after {
  content: ''; position: absolute; top: 2px; right: 2px;
  width: 12px; height: 12px; background: #fff; border-radius: 50%;
}
.wf-pv-check { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--wf-text); }
.wf-pv-box {
  flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
  width: 15px; height: 15px; border-radius: 4px;
  background: var(--wf-bg-sunken); border: 1px solid var(--wf-border-strong);
  color: var(--wf-accent); font-size: 11px;
}
.wf-pv-radio {
  flex: 0 0 auto; width: 14px; height: 14px; border-radius: 50%;
  border: 1px solid var(--wf-border-strong);
  box-shadow: inset 0 0 0 3px var(--wf-bg-sunken);
  background: var(--wf-accent);
}
.wf-pv-select {
  flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px;
  padding: 3px 8px; min-width: 110px;
  background: var(--wf-bg-sunken); border: 1px solid var(--wf-border); border-radius: 6px;
  color: var(--wf-text-2); font-size: 12px;
}
.wf-pv-select-arrow { color: var(--wf-text-2); font-size: 10px; }
.wf-pv-link { flex: 0 0 auto; font-size: 12px; color: var(--wf-accent); text-decoration: underline; }
.wf-pv-media {
  flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px;
  font-size: 12px; color: var(--wf-text-2);
  border: 1px solid var(--wf-border);
  background: color-mix(in srgb, #000 12%, transparent);
}
.wf-pv-video { min-width: 120px; }
.wf-pv-media-play { color: var(--wf-accent); font-size: 11px; }
.wf-pv-progress {
  flex: 0 0 auto; width: 120px; height: 10px; border-radius: 5px;
  background: var(--wf-bg-sunken); border: 1px solid var(--wf-border);
  overflow: hidden;
}
.wf-pv-progress-fill {
  height: 100%; border-radius: 5px;
  background: color-mix(in srgb, var(--wf-accent) 65%, transparent);
}
.wf-pv-other {
  flex: 0 0 auto; padding: 4px 10px; font-size: 12px;
  border: 1px dashed var(--wf-border); border-radius: 6px; color: var(--wf-text-2);
}
`
