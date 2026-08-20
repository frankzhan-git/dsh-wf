// 弹窗壳 / 三栏布局 / 通用按钮 / 右键菜单
// 配色方案完全对齐 dsh-fm-plugin（DSH web 原生弹窗体系）：
//   --wf-bg: bg-layer-2（面板） / raised: bg-layer-1（菜单/浮层） / nested: bg-layer-3 / sunken: bg-layer-1（代码区/输入框）
//   面板 24px 大圆角无边框 + --dsw-shadow-lv3；遮罩 --dsw-alias-bg-mask-1 + backdrop blur
export const BASE_CSS = `
.wf-input-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; padding: 0;
  background: transparent; border: none; border-radius: 6px;
  color: var(--dsw-alias-label-secondary, #8b95a7);
  cursor: pointer;
  transition: background-color .1s ease, color .1s ease;
}
.wf-input-btn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(148,163,184,.12)); color: var(--dsw-alias-label-primary, #e2e8f0); }
.wf-input-btn-on { background: var(--dsw-alias-interactive-bg-hover, rgba(148,163,184,.16)); color: var(--dsw-alias-brand-primary, #6ea8ff); }
.wf-input-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #6ea8ff); outline-offset: -2px; }

/* ---------- 弹窗壳（变量定义在容器级，菜单/浮层继承） ---------- */
.wf-mask {
  --wf-bg: var(--dsw-alias-bg-layer-2, #232833);
  --wf-bg-raised: var(--dsw-alias-bg-layer-1, #2a2f3a);
  --wf-bg-nested: var(--dsw-alias-bg-layer-3, #2f3542);
  --wf-bg-sunken: var(--dsw-alias-bg-layer-1, #1c2028);
  --wf-border: var(--dsw-alias-border-l1, rgba(148,163,184,.22));
  --wf-border-strong: var(--dsw-alias-border-l2, rgba(148,163,184,.4));
  --wf-text: var(--dsw-alias-label-primary, #e2e8f0);
  --wf-text-2: var(--dsw-alias-label-secondary, #8b95a7);
  --wf-accent: var(--dsw-alias-brand-primary, #6ea8ff);
  --wf-danger: var(--dsw-alias-state-error-primary, #f87171);
  --wf-warn: var(--dsw-alias-state-warn-primary, #fbbf24);
  --wf-hover: var(--dsw-alias-interactive-bg-hover, rgba(148,163,184,.12));
  --wf-shadow: 0 8px 24px rgba(0,0,0,.18);

  position: fixed; inset: 0; z-index: 2147483000;
  background: var(--dsw-alias-bg-mask-1, rgba(0,0,0,.45));
  backdrop-filter: var(--dsw-mask-blur, blur(3px));
  display: flex; align-items: center; justify-content: center;
  animation: wf-in .14s ease;
}
@keyframes wf-in { from { opacity: 0; transform: translateY(4px) scale(.995); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wf-mask { animation: none; } }

.wf-modal {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  width: min(1080px, calc(100vw - 48px));
  height: min(720px, calc(100vh - 48px));
  background: var(--wf-bg);
  border-radius: 24px;
  box-shadow: var(--dsw-shadow-lv3, 0 16px 48px rgba(0,0,0,.35));
  color: var(--wf-text);
  font-size: 13px; line-height: 1.5;
  overflow: hidden;
  font-family: var(--dsw-font-family, system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif);
}
/* 全屏模式：弹窗撑满视口，功能全部保留 */
.wf-modal-fs {
  width: 100vw; height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

.wf-head {
  flex: none; display: flex; align-items: center; gap: 10px;
  height: 52px; padding: 0 18px; box-sizing: border-box;
  border-bottom: 1px solid var(--wf-border);
}
.wf-title { font-size: 16px; font-weight: 500; }
.wf-rootname { display: inline-flex; align-items: center; gap: 6px; color: var(--wf-text-2); font-size: 12px; }
.wf-rootname input {
  width: 140px; padding: 4px 8px;
  background: var(--wf-bg-sunken); color: var(--wf-text);
  border: 1px solid var(--wf-border); border-radius: 6px;
  font-size: 12px;
}
.wf-rootname input:focus { outline: 2px solid var(--wf-accent); outline-offset: -1px; }
.wf-spacer { flex: 1; }
.wf-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0;
  background: transparent; border: none; border-radius: 28px;
  color: var(--wf-text); font-size: 16px; cursor: pointer;
  transition: background-color .1s ease, color .1s ease;
}
.wf-icon-btn:hover { background: var(--wf-hover); }
.wf-icon-btn:focus-visible { outline: 2px solid var(--wf-accent); outline-offset: -2px; }
.wf-sep { width: 1px; height: 18px; background: var(--wf-border); }
.wf-error {
  flex: none;
  padding: 6px 14px; font-size: 12px;
  background: color-mix(in srgb, var(--wf-danger) 12%, transparent);
  color: var(--wf-danger);
  border-bottom: 1px solid var(--wf-border);
}

/* ---------- 主体三栏（列继承面板色，仅用分隔线） ---------- */
.wf-body {
  flex: 1 1 0%; min-height: 0;
  display: flex; gap: 0;
}

/* 左栏已移除（M3 起画布占满）；仅保留新建按钮 */
.wf-new-btn { color: var(--wf-accent); }
.wf-new-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); color: var(--wf-accent); }

/* 底栏 */
.wf-footer {
  flex: none; display: flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--wf-border);
}
.wf-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: 1px solid transparent; border-radius: 6px;
  color: var(--wf-text-2); padding: 4px 10px;
  font-size: 12px; cursor: pointer; white-space: nowrap;
  transition: background-color .1s ease, color .1s ease;
}
.wf-btn:hover:not(:disabled) { background: var(--wf-hover); color: var(--wf-text); }
.wf-btn:disabled { opacity: .5; cursor: default; }
.wf-btn:focus-visible { outline: 2px solid var(--wf-accent); outline-offset: -2px; }
/* 主按钮：accent 文字 + accent 边框（深浅主题均清晰，对齐 dsh-fm 彩色按钮风格） */
.wf-btn.wf-primary {
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  font-weight: 500;
}
.wf-btn.wf-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); color: var(--wf-accent); }

/* Toast 浮动提示（不占用布局；后续所有提示统一使用） */
.wf-toast {
  position: fixed; top: 20px; left: 50%;
  transform: translateX(-50%);
  z-index: 2147483005;
  max-width: min(520px, calc(100vw - 48px));
  padding: 7px 14px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border-strong);
  border-radius: 8px;
  box-shadow: var(--dsw-shadow-lv3, 0 16px 48px rgba(0,0,0,.35));
  color: var(--wf-text);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  animation: wf-toast-in .16s ease;
}
@keyframes wf-toast-in { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
.wf-toast-error { border-color: color-mix(in srgb, var(--wf-danger) 55%, transparent); color: var(--wf-danger); }
@media (prefers-reduced-motion: reduce) { .wf-toast { animation: none; } }

/* ---------- 右键菜单（对齐 dsh-fm 菜单风格） ---------- */
.wf-menu-backdrop { position: fixed; inset: 0; z-index: 2147483001; pointer-events: auto; }
.wf-menu {
  position: fixed; z-index: 2147483002; pointer-events: auto;
  min-width: 150px;
  background: var(--wf-bg-raised);
  color: var(--wf-text);
  border: 1px solid var(--wf-border-strong);
  border-radius: 8px;
  box-shadow: var(--wf-shadow);
  padding: 4px;
  font-size: 12px;
}
.wf-menu-item {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px; border-radius: 6px;
  cursor: pointer; color: var(--wf-text); white-space: nowrap;
  transition: background-color .1s ease;
}
.wf-menu-item:hover { background: var(--wf-hover); }
.wf-menu-item:focus-visible { outline: 2px solid var(--wf-accent); outline-offset: -2px; }
.wf-menu-danger { color: var(--wf-danger); }
.wf-menu-danger:hover { background: color-mix(in srgb, var(--wf-danger) 14%, transparent); }
.wf-menu-sep { height: 1px; background: var(--wf-border); margin: 4px 8px; }
/* 「更换控件类型」级联子菜单 */
.wf-menu-caret { margin-left: auto; font-size: 10px; color: var(--wf-text-2); }
.wf-menu-sub {
  position: absolute; left: 100%; top: -6px;
  min-width: 120px; max-height: 320px; overflow-y: auto;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border-strong);
  border-radius: 8px;
  box-shadow: var(--wf-shadow);
  padding: 4px;
}
.wf-menu-item-on { color: var(--wf-accent); background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }

/* ---------- 删除确认弹窗（页面含控件时） ---------- */
.wf-mask-confirm { z-index: 60; display: flex; align-items: center; justify-content: center; }
.wf-confirm {
  width: 300px; max-width: 86vw;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border-strong);
  border-radius: 10px;
  box-shadow: var(--wf-shadow);
  padding: 14px 16px;
  font-size: 12px;
}
.wf-confirm-title { font-size: 13px; font-weight: 500; color: var(--wf-text); margin-bottom: 8px; }
.wf-confirm-body { color: var(--wf-text-2); line-height: 1.6; margin-bottom: 14px; }
.wf-confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
.wf-btn.wf-danger { color: var(--wf-danger); border-color: color-mix(in srgb, var(--wf-danger) 45%, transparent); }
.wf-btn.wf-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-danger) 12%, transparent); color: var(--wf-danger); }
`
