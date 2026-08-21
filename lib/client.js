window.__ModuleLoader__.load({
  id: "dsh界面草图",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  default: () => client_default
});
module.exports = __toCommonJS(client_exports);
var import_react21 = __toESM(require("react"), 1);

// src/css/base.js
var BASE_CSS = `
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

/* ---------- \u5F39\u7A97\u58F3\uFF08\u53D8\u91CF\u5B9A\u4E49\u5728\u5BB9\u5668\u7EA7\uFF0C\u83DC\u5355/\u6D6E\u5C42\u7EE7\u627F\uFF09 ---------- */
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
/* \u5168\u5C4F\u6A21\u5F0F\uFF1A\u5F39\u7A97\u6491\u6EE1\u89C6\u53E3\uFF0C\u529F\u80FD\u5168\u90E8\u4FDD\u7559 */
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
/* \u9876\u680F\u53F3\u4E0A\u89D2\u529F\u80FD\u83DC\u5355\uFF1A\u65B0\u5EFA | \u6700\u5927\u5316/\u6700\u5C0F\u5316 | \u5173\u95ED */
.wf-head-menu { display: flex; align-items: center; gap: 2px; }
/* \u53F3\u680F\u6A21\u5757\u6807\u9898\u680F\uFF08\u63A7\u4EF6\u8BBE\u7F6E / \u753B\u5E03\u5386\u53F2\uFF09 */
.wf-panel-head {
  flex: none; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--wf-border);
}
.wf-panel-title { font-size: 12px; font-weight: 500; color: var(--wf-text); }
.wf-title { font-size: 16px; font-weight: 500; }
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

/* ---------- \u4E3B\u4F53\u4E09\u680F\uFF08\u5217\u7EE7\u627F\u9762\u677F\u8272\uFF0C\u4EC5\u7528\u5206\u9694\u7EBF\uFF09 ---------- */
.wf-body {
  flex: 1 1 0%; min-height: 0;
  display: flex; gap: 0;
}

/* \u5DE6\u680F\u5DF2\u79FB\u9664\uFF08M3 \u8D77\u753B\u5E03\u5360\u6EE1\uFF09\uFF1B\u4EC5\u4FDD\u7559\u65B0\u5EFA\u6309\u94AE */
.wf-new-btn { color: var(--wf-accent); }
.wf-new-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); color: var(--wf-accent); }

/* \u5E95\u680F */
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
/* \u4E3B\u6309\u94AE\uFF1Aaccent \u6587\u5B57 + accent \u8FB9\u6846\uFF08\u6DF1\u6D45\u4E3B\u9898\u5747\u6E05\u6670\uFF0C\u5BF9\u9F50 dsh-fm \u5F69\u8272\u6309\u94AE\u98CE\u683C\uFF09 */
.wf-btn.wf-primary {
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  font-weight: 500;
}
.wf-btn.wf-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); color: var(--wf-accent); }

/* Toast \u6D6E\u52A8\u63D0\u793A\uFF08\u4E0D\u5360\u7528\u5E03\u5C40\uFF1B\u540E\u7EED\u6240\u6709\u63D0\u793A\u7EDF\u4E00\u4F7F\u7528\uFF09 */
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

/* ---------- \u53F3\u952E\u83DC\u5355\uFF08\u5BF9\u9F50 dsh-fm \u83DC\u5355\u98CE\u683C\uFF09 ---------- */
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
/* \u300C\u66F4\u6362\u63A7\u4EF6\u7C7B\u578B\u300D\u7EA7\u8054\u5B50\u83DC\u5355 */
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

/* ---------- \u5220\u9664\u786E\u8BA4\u5F39\u7A97\uFF08\u9875\u9762\u542B\u63A7\u4EF6\u65F6\uFF09 ---------- */
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
`;

// src/css/canvas.js
var CANVAS_CSS = `
/* \u4E2D\u680F\uFF1A\u753B\u5E03\uFF08view \u88C1\u526A + stage \u5E73\u79FB\u7F29\u653E\uFF0CSVG \u56FA\u5B9A\u903B\u8F91\u5C3A\u5BF8\u4E0D\u53D8\u5F62\uFF09 */
.wf-canvas-wrap {
  flex: 1 1 0%; min-width: 0; position: relative;
  padding: 14px 16px; box-sizing: border-box; display: flex;
}
.wf-canvas-view {
  flex: 1 1 0%; min-height: 0; min-width: 0;
  overflow: hidden;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
  position: relative;
  touch-action: none;
}
/* \u65E0\u9650\u753B\u5E03\uFF08\u76F8\u673A\u65B9\u6848\uFF09\uFF1ASVG \u586B\u6EE1\u89C6\u53E3\uFF0CviewBox \u968F\u5E73\u79FB/\u7F29\u653E\u52A8\u6001\u53D8\u5316 */
.wf-canvas {
  display: block; width: 100%; height: 100%;
  background: var(--wf-bg-sunken);
  user-select: none; -webkit-user-select: none;
}
.wf-canvas-bg { fill: color-mix(in srgb, var(--wf-accent) 2%, transparent); pointer-events: none; }
/* \u63A7\u4EF6\u6A21\u5F0F\uFF08draw\uFF09\uFF1A\u9F20\u6807\u5728\u753B\u5E03\u4E0A\u6052\u4E3A\u5341\u5B57\u5F62\uFF08\u8986\u76D6\u5143\u7D20\u4E0A\u7684 move/default \u5149\u6807\uFF09 */
.wf-canvas-draw .wf-rect,
.wf-canvas-draw .wf-note,
.wf-canvas-draw .wf-text-el,
.wf-canvas-draw .wf-arrow { cursor: crosshair !important; }
/* \u7A7A\u683C\u6309\u4F4F\uFF08\u7A7A\u95F4\u5E73\u79FB\uFF09\uFF1A\u65E0\u8BBA\u6A21\u5F0F\u3001\u65E0\u8BBA\u9F20\u6807\u5728\u753B\u5E03\u8FD8\u662F\u63A7\u4EF6\u4E0A\uFF0C\u4E00\u5F8B\u624B\u578B\u5149\u6807\uFF1B
   \u62D6\u62FD\u4E2D\uFF08pan\uFF09\u663E\u793A\u6293\u63E1\u6001\u3002!important \u8986\u76D6 draw \u6A21\u5F0F crosshair \u4E0E\u63A7\u4EF6 move */
.wf-canvas-space .wf-rect,
.wf-canvas-space .wf-note,
.wf-canvas-space .wf-text-el,
.wf-canvas-space .wf-arrow,
.wf-canvas-space .wf-handle { cursor: grab !important; }
.wf-canvas-pan .wf-rect,
.wf-canvas-pan .wf-note,
.wf-canvas-pan .wf-text-el,
.wf-canvas-pan .wf-arrow,
.wf-canvas-pan .wf-handle { cursor: grabbing !important; }
.wf-rect {
  fill: color-mix(in srgb, var(--wf-accent) 5%, transparent);
  stroke: var(--wf-border-strong); stroke-width: 1.2;
  cursor: move;
}
/* \u7C7B\u578B\u5316\u6837\u5F0F\uFF1A\u753B\u5E03\u4E0A\u4E00\u773C\u533A\u5206\u63A7\u4EF6\u7C7B\u578B\uFF08\u6BCF\u79CD\u7C7B\u578B\u6E32\u67D3\u4E3A\u771F\u5B9E UI \u7EC4\u4EF6\u5F62\u6001\uFF09
   \u586B\u5145\u4F53\u7CFB\uFF08\u5355\u4E00\u89C4\u8303\uFF09\uFF1A\u9759\u6001\u533A = bg-sunken\uFF1B\u5F3A\u8C03\u533A = accent \u6DF7\u8272\uFF1B\u65E0\u80CC\u666F\u7C7B = transparent + \u5F31\u63CF\u8FB9 */
.wf-rect-auto { stroke-dasharray: 5 4; }                                   /* \u5F85\u63A8\u65AD\uFF1A\u865A\u7EBF */
.wf-rect-container { fill: color-mix(in srgb, var(--wf-accent) 3%, transparent); }
.wf-rect-page {
  fill: var(--wf-bg-raised);                  /* \u9875\u9762 = \u8BBE\u8BA1\u7A3F\u5361\u7247\uFF1A\u5B9E\u5E95 + \u63CF\u8FB9\uFF0C\u533A\u522B\u4E8E\u5BB9\u5668 */
  stroke: var(--wf-border-strong);
}
.wf-rect-button {
  fill: color-mix(in srgb, var(--wf-accent) 14%, transparent);
  stroke: color-mix(in srgb, var(--wf-accent) 50%, transparent);
}
/* \u8F93\u5165\u6846\uFF1A\u5F31\u6846 + accent \u4E0B\u5212\u7EBF\uFF1B\u6587\u672C\u57DF\uFF1A\u5168\u8FB9\u6846\u5F3A\u63CF\u8FB9\uFF08\u5F62\u6001\u533A\u5206\uFF09 */
.wf-rect-input { fill: var(--wf-bg-sunken); stroke: var(--wf-border); }
.wf-rect-textarea { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); }
.wf-rect-underline { stroke: color-mix(in srgb, var(--wf-accent) 55%, transparent); stroke-width: 1.6; }
.wf-rect-image { fill: var(--wf-bg-sunken); }                              /* \u56FE\u7247 = \u69FD\u4F4D */
.wf-rect-image-glyph { fill: none; stroke: var(--wf-border-strong); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-video { fill: var(--wf-bg-sunken); }
.wf-rect-play { fill: var(--wf-accent); }
.wf-rect-audio { fill: var(--wf-bg-sunken); }
.wf-rect-audio-glyph { fill: var(--wf-text-2); }
.wf-rect-audio-wave { fill: none; stroke: var(--wf-text-2); stroke-width: 1.6; stroke-linecap: round; }
.wf-rect-icon { fill: color-mix(in srgb, var(--wf-accent) 10%, transparent); }
.wf-rect-icon-glyph { fill: none; stroke: var(--wf-accent); stroke-width: 1.6; stroke-linejoin: round; }
.wf-rect-link-text { fill: var(--wf-accent); font-size: 13px; }
.wf-rect-link-line { stroke: var(--wf-accent); stroke-width: 1; opacity: .8; }
.wf-rect-link-glyph { fill: none; stroke: var(--wf-accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-select-chev { fill: none; stroke: var(--wf-text-2); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-box { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-box-check { fill: none; stroke: var(--wf-accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.wf-rect-circle { fill: transparent; stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-circle-dot { fill: var(--wf-accent); }
.wf-rect-switch { fill: var(--wf-bg-sunken); stroke: var(--wf-border-strong); stroke-width: 1.2; }
.wf-rect-switch-on { fill: color-mix(in srgb, var(--wf-accent) 65%, transparent); stroke: color-mix(in srgb, var(--wf-accent) 50%, transparent); }
.wf-rect-switch-knob { fill: #fff; }
.wf-rect-progress-bg { fill: var(--wf-bg-sunken); stroke: var(--wf-border); stroke-width: 1; }
.wf-rect-progress-fill { fill: color-mix(in srgb, var(--wf-accent) 65%, transparent); }
.wf-rect-divider { stroke: var(--wf-border-strong); stroke-width: 1.4; }
.wf-rect-divider-cap { stroke: var(--wf-border-strong); stroke-width: 1.4; stroke-linecap: round; }
.wf-rect-badge {
  fill: color-mix(in srgb, var(--wf-accent) 18%, transparent);
  stroke: transparent;
}
/* \u901A\u7528\u5360\u4F4D\u865A\u6846\uFF08ghost\uFF09\uFF1A\u65E0\u80CC\u666F\u63A7\u4EF6\uFF08\u6587\u672C/\u590D\u9009/\u5355\u9009/\u5F00\u5173/\u7A7A\u94FE\u63A5\uFF09\u7684\u5F31\u89C6\u89C9\u5916\u6846\uFF0C\u5708\u5B9A\u7EC4\u4EF6\u5927\u5C0F */
.wf-rect-ghost { fill: transparent; stroke: var(--wf-border); stroke-dasharray: 5 4; }
.wf-rect-text-center { text-anchor: middle; }
.wf-rect-text-ph { fill: var(--wf-text-2); }
.wf-rect.wf-selected { stroke: var(--wf-accent); stroke-width: 1.8; stroke-dasharray: none; }
.wf-text-el { fill: var(--wf-text); font-size: 15px; cursor: default; }
.wf-note {
  fill: color-mix(in srgb, var(--wf-warn) 10%, transparent);
  stroke: var(--wf-warn); stroke-width: 1.2; stroke-dasharray: 5 3;
  cursor: move;
}
.wf-note.wf-selected { stroke-width: 1.8; }
.wf-note-text { fill: var(--wf-warn); font-size: 12px; }
.wf-arrow { stroke: var(--wf-text-2); stroke-width: 1.6; }
.wf-arrow.wf-selected { stroke: var(--wf-accent); stroke-width: 2; }
.wf-rect-text { fill: var(--wf-text-2); font-size: 12px; pointer-events: none; }
.wf-handle { fill: var(--wf-accent); stroke: var(--wf-bg-sunken); stroke-width: 1.2; cursor: nwse-resize; }
/* \u62D6\u52A8\u5BF9\u9F50\u865A\u7EBF\uFF08\u5438\u9644\u6307\u793A\uFF09 */
.wf-snap {
  stroke: var(--wf-accent);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: .9;
  pointer-events: none;
}
/* \u6846\u9009\u77E9\u5F62\uFF08marquee\uFF09 */
.wf-marquee {
  fill: color-mix(in srgb, var(--wf-accent) 10%, transparent);
  stroke: var(--wf-accent);
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  pointer-events: none;
}
/* \u591A\u9009\u6574\u4F53\u5916\u6846 + \u89D2\u624B\u67C4\uFF08\u7B49\u6BD4\u7F29\u653E\uFF09 */
.wf-group-box {
  fill: none;
  stroke: var(--wf-accent);
  stroke-width: 1.2;
  stroke-dasharray: 6 4;
  pointer-events: none;
}
.wf-group-handle {
  fill: var(--wf-accent);
  stroke: var(--wf-bg-sunken);
  stroke-width: 1.2;
  cursor: nwse-resize;
}
/* \u540D\u5B57\u6807\u7B7E\uFF1A\u5143\u7D20\u5DE6\u4E0A\u89D2\u5916\u4FA7\uFF0C\u5C0F\u5706\u89D2\u80CC\u666F + \u6587\u5B57\uFF08\u540C\u8BED\u4E49\u9884\u89C8\u6807\u7B7E\u98CE\u683C\uFF09 */
.wf-el-name rect {
  fill: var(--wf-bg-raised);
  stroke: var(--wf-border);
  stroke-width: .8;
}
.wf-el-name text {
  fill: var(--wf-accent);
  font-size: 10px; font-weight: 600;
  letter-spacing: .02em;
  paint-order: stroke;
  stroke: var(--wf-bg-raised); stroke-width: 2px;
  stroke-linejoin: round;
}
/* \u81EA\u52A8\u7C7B\u578B\u540D\u6807\u7B7E\uFF08\u7528\u6237\u672A\u547D\u540D\u65F6\uFF09\uFF1A\u5F31\u5316\u663E\u793A\uFF0C\u533A\u522B\u4E8E\u7528\u6237\u547D\u540D\u7684 accent \u8272 */
.wf-el-name-auto rect { stroke-dasharray: 3 2; }
.wf-el-name-auto text { fill: var(--wf-text-2); font-weight: 500; }

/* \u753B\u5E03\u5185\u60AC\u6D6E\u5C42\uFF08\u5DE6\u4E0A\u89D2\u6A21\u5F0F\u5FBD\u6807 / \u53F3\u4E0A\u89D2 JSONL\xB7\u9884\u89C8\xB7\u8BBE\u7F6E\u6309\u94AE / \u53F3\u4E0B\u89D2\u7F29\u653E / \u8F93\u51FA\u9762\u677F\uFF09 */
.wf-canvas-overlay {
  position: absolute; inset: 14px 16px;
  pointer-events: none;
}
.wf-mode-badge {
  position: absolute; top: 8px; left: 8px;
  padding: 3px 10px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 11px; font-weight: 500;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: var(--wf-shadow);
  user-select: none;
}
.wf-mode-badge:hover { color: var(--wf-text); }
.wf-mode-badge-draw {
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  background: color-mix(in srgb, var(--wf-accent) 12%, transparent);
}
.wf-mode-key {
  margin-left: 5px;
  padding: 0 4px;
  font-family: Consolas, 'Cascadia Code', Menlo, monospace;
  font-size: 9px; line-height: 14px;
  color: var(--wf-text-2);
  border: 1px solid var(--wf-border-strong);
  border-radius: 4px;
  background: transparent;
}
.wf-mode-badge-draw .wf-mode-key { color: var(--wf-accent); border-color: color-mix(in srgb, var(--wf-accent) 40%, transparent); }
.wf-canvas-tools {
  position: absolute; top: 8px; right: 8px;
  display: flex; gap: 4px;
  pointer-events: auto;
}
.wf-ctool {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 12px; cursor: pointer;
  box-shadow: var(--wf-shadow);
  transition: background-color .1s ease, color .1s ease, border-color .1s ease;
}
.wf-ctool:hover { color: var(--wf-text); }
.wf-ctool-on { color: var(--wf-accent); border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent); background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }
/* \u53F3\u4E0B\u89D2\uFF1A\u64A4\u9500/\u91CD\u505A/\u6E05\u7A7A\uFF08\u4E0D\u53EF\u7528\u5373\u9690\u85CF\uFF09+ \u7F29\u653E */
.wf-canvas-actions {
  position: absolute; right: 8px; bottom: 8px;
  display: flex; align-items: center; gap: 8px;
  pointer-events: none;
}
.wf-action-group { display: flex; align-items: center; gap: 2px; pointer-events: auto; }
.wf-iaction {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; padding: 0;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); cursor: pointer;
  box-shadow: var(--wf-shadow);
  transition: background-color .1s ease, color .1s ease;
}
.wf-iaction:hover { color: var(--wf-text); }
.wf-iaction:focus-visible { outline: 2px solid var(--wf-accent); outline-offset: -2px; }
.wf-iaction-undo svg { transform: scaleX(-1); } /* \u64A4\u9500 = \u5237\u65B0\u56FE\u6807\u6C34\u5E73\u955C\u50CF\uFF08\u9006\u65F6\u9488\uFF09 */
/* \u6E05\u7A7A\u4E8C\u6B21\u786E\u8BA4\u6001 */
.wf-iaction-danger { color: var(--wf-danger); border-color: color-mix(in srgb, var(--wf-danger) 45%, transparent); }
.wf-iaction-danger:hover { color: var(--wf-danger); background: color-mix(in srgb, var(--wf-danger) 12%, transparent); }
.wf-iaction-wide { width: auto; padding: 0 8px; font-size: 11px; }
.wf-zoom-bar {
  display: flex; align-items: center; gap: 2px;
  pointer-events: auto;
}
.wf-zoom-pct {
  padding: 3px 8px;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border);
  border-radius: 6px;
  color: var(--wf-text-2); font-size: 11px;
  font-variant-numeric: tabular-nums;
  box-shadow: var(--wf-shadow);
  font-family: inherit;
}
/* \u7F29\u653E\u767E\u5206\u6BD4 = \u6062\u590D\u6309\u94AE\uFF1A\u975E 100% \u65F6\u53EF\u70B9\u51FB\uFF08\u70B9\u51FB\u6062\u590D 100% \u89C6\u56FE\uFF09 */
.wf-zoom-pct-click {
  cursor: pointer;
  color: var(--wf-accent);
  border-color: color-mix(in srgb, var(--wf-accent) 45%, transparent);
  transition: background-color .1s ease;
}
.wf-zoom-pct-click:hover { background: color-mix(in srgb, var(--wf-accent) 12%, transparent); }
.wf-zoom-pct:disabled { cursor: default; }
.wf-float-panel {
  position: absolute; top: 42px; right: 8px;
  width: 380px; max-width: calc(100% - 16px);
  max-height: calc(100% - 52px);
  display: flex; flex-direction: column;
  background: var(--wf-bg-raised);
  border: 1px solid var(--wf-border-strong);
  border-radius: 10px;
  box-shadow: var(--wf-shadow);
  pointer-events: auto;
  overflow: hidden;
}
.wf-float-head {
  flex: none; display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; font-size: 12px; font-weight: 500;
  color: var(--wf-text);
  border-bottom: 1px solid var(--wf-border);
}
.wf-float-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; padding: 0;
  background: transparent; border: none; border-radius: 5px;
  color: var(--wf-text-2); cursor: pointer;
}
.wf-float-close:hover { background: var(--wf-hover); color: var(--wf-text); }
/* JSONL \u6D6E\u7A97\u590D\u5236\u6309\u94AE\uFF08\u590D\u5236\u5B8C\u6574\u63D0\u793A\u8BCD\uFF09 */
.wf-float-copy {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px;
  background: transparent; border: 1px solid var(--wf-border); border-radius: 5px;
  color: var(--wf-text-2); font-size: 11px; cursor: pointer;
  transition: background-color .1s ease, color .1s ease, border-color .1s ease;
}
.wf-float-copy:hover { background: var(--wf-hover); color: var(--wf-text); }
.wf-float-copy-ok {
  color: var(--dsw-alias-state-success-primary, #3fb950);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #3fb950) 45%, transparent);
}
.wf-float-panel .wf-jsonl {
  flex: 1 1 0%; min-height: 0; max-height: 320px;
  margin: 8px; overflow: auto;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
}
/* \u8BED\u4E49\u9884\u89C8\u533A\uFF1A\u9875\u9762\u5207\u6362\u4E0B\u62C9 + \u9884\u89C8\uFF08\u591A\u9875\u9762\u65F6\u4E0B\u62C9\u663E\u793A\uFF09 */
.wf-float-preview {
  flex: 1 1 0%; min-height: 0;
  display: flex; flex-direction: column;
  padding: 8px;
}
.wf-float-pages { flex: none; padding: 0 0 8px; }
.wf-float-select {
  width: 100%; box-sizing: border-box;
  padding: 4px 8px;
  background: var(--wf-bg-sunken); color: var(--wf-text);
  border: 1px solid var(--wf-border); border-radius: 6px;
  font-size: 12px;
}
.wf-float-select:focus { outline: 2px solid var(--wf-accent); outline-offset: -1px; }
.wf-float-preview .wf-preview {
  flex: 1 1 0%; min-height: 0; overflow: auto;
  background: var(--wf-bg-sunken);
  border: 1px solid var(--wf-border); border-radius: 8px;
  padding: 12px;
}

/* \u5185\u8054\u7F16\u8F91\u6846\uFF08\u53CC\u51FB\u63A7\u4EF6\u6587\u672C/\u540D\u5B57\uFF09 */
.wf-inline-edit {
  width: 100%; height: 100%;
  display: flex; align-items: center;
}
.wf-inline-edit input {
  width: 100%; box-sizing: border-box;
  padding: 2px 6px;
  background: var(--wf-bg-raised); color: var(--wf-text);
  border: 1.5px solid var(--wf-accent); border-radius: 4px;
  font-size: 12px; font-family: inherit;
  outline: none;
}
`;

// src/css/inspector.js
var INSPECTOR_CSS = `
.wf-right {
  flex: none; width: 304px;
  display: flex; flex-direction: column; min-height: 0;
  border-left: 1px solid var(--wf-border);
  box-sizing: border-box;
}
/* \u62D6\u62FD\u8C03\u6574\u5386\u53F2\u9AD8\u5EA6\u65F6\u7981\u6B62\u9009\u4E2D\u6587\u672C */
.wf-right.wf-resizing { user-select: none; }
/* \u63A7\u4EF6\u8BBE\u7F6E\u6A21\u5757 */
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
/* \u9AD8\u5EA6\u62D6\u62FD\u89E6\u53D1\u533A\uFF08\u753B\u5E03\u5386\u53F2 title \u680F\u4E0A\u8FB9\uFF09\uFF1A\u65E0\u89C6\u89C9\u6A2A\u7EBF\uFF0C\u4EC5 hover \u663E\u793A\u7F29\u653E\u624B\u67C4\u5149\u6807 */
.wf-resizer {
  flex: none; height: 6px;
  cursor: ns-resize; touch-action: none;
}
.wf-field-row { display: flex; flex-direction: column; gap: 5px; }
.wf-field-head { display: flex; align-items: baseline; gap: 8px; }
.wf-field-label { font-size: 12px; font-weight: 500; color: var(--wf-text); }
/* \u63D0\u793A\u8BED\u5F31\u5316\uFF1A\u6BD4\u6807\u9898\u6697\u4E00\u6863\uFF0C\u4E0D\u62A2\u89C6\u89C9\u7126\u70B9 */
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
`;

// src/css/history.js
var HISTORY_CSS = `
.wf-history {
  flex: none;
  display: flex; flex-direction: column; min-height: 0;
  overflow: hidden;              /* \u7EA6\u675F\u5B50\u9879\uFF0C\u4FDD\u8BC1\u5217\u8868\u53EF\u6EDA\u52A8 */
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
  /* \u56FA\u5B9A\u884C\u9AD8\uFF1Ahover \u65F6\u65E5\u671F\u2194\u6309\u94AE\u5207\u6362\u4E0D\u6539\u53D8\u884C\u9AD8\uFF08\u6309\u94AE 20px > \u65E5\u671F ~16px\uFF0C
     \u884C\u9AD8\u53D8\u5316\u4F1A\u5BFC\u81F4\u5217\u8868\u91CD\u6392\u3001\u9F20\u6807\u4E0B\u5185\u5BB9\u79FB\u52A8 \u2192 hover \u6296\u52A8\u5FAA\u73AF\uFF09 */
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
/* \u5220\u9664\u4E8C\u6B21\u786E\u8BA4\uFF08\u884C\u5185\u786E\u8BA4\u6761\uFF09 */
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
/* \u6587\u6863\u7BA1\u7406\uFF08S4\uFF09\uFF1A\u5143\u4FE1\u606F + \u64CD\u4F5C\u6309\u94AE + \u884C\u5185\u91CD\u547D\u540D
   hover \u5207\u6362\uFF1A\u9ED8\u8BA4\u663E\u793A\u65E5\u671F\uFF08\u53F3\u5BF9\u9F50\u3001\u4E0D\u9884\u7559\u6309\u94AE\u4F4D\uFF09\uFF1Bhover \u65F6\u9690\u85CF\u65E5\u671F\u3001\u663E\u793A\u64CD\u4F5C\u6309\u94AE */
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
`;

// src/css/preview.js
var PREVIEW_CSS = `
.wf-empty { padding: 24px; text-align: center; color: var(--wf-text-2); }

/* JSON \u8BED\u6CD5\u9AD8\u4EAE\uFF08\u914D\u8272\u540C dsh-fm \u4EE3\u7801\u9884\u89C8\uFF1A\u952E\u6D45\u84DD/\u5B57\u7B26\u4E32\u6A59/\u6570\u5B57\u7EFF/\u5B57\u9762\u91CF\u84DD\uFF09 */
.wf-j-key { color: #9cdcfe; }
.wf-j-str { color: #ce9178; }
.wf-j-num { color: #b5cea8; }
.wf-j-lit { color: #569cd6; }
.wf-j-punc { color: var(--wf-text-2); }

/* ---------- \u8BED\u4E49\u9884\u89C8 ---------- */
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
`;

// src/css/index.js
var WF_CSS = BASE_CSS + CANVAS_CSS + INSPECTOR_CSS + HISTORY_CSS + PREVIEW_CSS;

// src/components/SketchButton.js
var import_react2 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/hooks/useOpen.js
var import_react = __toESM(require("react"), 1);

// src/core/store.js
var store = { open: false };
var listeners = /* @__PURE__ */ new Set();
var subscribe = (fn) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
var setOpen = (open) => {
  store.open = open;
  listeners.forEach((fn) => fn(open));
};

// src/hooks/useOpen.js
function useOpen() {
  const [open, set] = import_react.default.useState(store.open);
  import_react.default.useEffect(() => subscribe(set), []);
  return open;
}

// src/components/SketchButton.js
var el = import_react2.default.createElement;
function SketchButton() {
  const open = useOpen();
  return el("button", {
    type: "button",
    className: "wf-input-btn" + (open ? " wf-input-btn-on" : ""),
    title: "\u754C\u9762\u8349\u56FE\uFF1A\u7ED8\u5236\u754C\u9762\u5E03\u5C40\uFF0C\u8F6C\u4E3A JSONL \u63D2\u5165\u8F93\u5165\u6846",
    "aria-pressed": open,
    "aria-label": "\u754C\u9762\u8349\u56FE",
    onClick: () => setOpen(!open)
  }, el(import_dsh_client_ui_primitives.IconListPenOutline16, { size: 16 }));
}

// src/components/SketchModal.js
var import_react20 = __toESM(require("react"), 1);

// src/core/model.js
var CANVAS_W = 800;
var CANVAS_H = 520;
var seq = 0;
function nextId() {
  return "e" + ++seq;
}
function createElement(tool, x, y, w, h) {
  const base = {
    id: nextId(),
    name: "",
    x,
    y,
    w,
    h,
    radius: 4,
    text: "",
    note: "",
    src: "",
    type: null,
    action: "",
    inputType: "",
    optionsText: "",
    value: "",
    max: "",
    alt: "",
    href: "",
    label: "",
    iconSize: "",
    checked: false,
    controls: false,
    autoplay: false,
    poster: ""
  };
  switch (tool.kind) {
    case "text":
      return Object.assign(base, { kind: "text", type: "text", text: "\u6587\u672C" });
    case "note":
      return Object.assign(base, { kind: "note", text: "\u5907\u6CE8\uFF1A\u5199\u8981\u6C42", dashed: true, fill: "note" });
    case "arrow":
      return Object.assign(base, { kind: "arrow", x2: x + w, y2: y + h });
    case "rect":
      return Object.assign(base, { kind: "rect", type: tool.type || null });
    default:
      return null;
  }
}
function cloneElements(elements) {
  return elements.map((e) => JSON.parse(JSON.stringify(e)));
}
function hitTest(elements, px, py) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const e = elements[i];
    if (e.kind === "arrow") {
      if (Math.abs(px - e.x) <= 8 && Math.abs(py - e.y) <= 8) return e;
      continue;
    }
    if (e.kind === "text") {
      if (px >= e.x && px <= e.x + Math.max(e.w, 80) && py >= e.y && py <= e.y + Math.max(e.h, 24)) return e;
      continue;
    }
    if (px >= e.x && px <= e.x + e.w && py >= e.y && py <= e.y + e.h) return e;
  }
  return null;
}

// src/core/infer.js
var BTN_MAX_CHARS = 6;
var INPUT_RE = /^(请输入|搜索|输入|填写|用户名|密码|邮箱|手机号|账号|占位)/;
var IMAGE_RE = /^(图片|img|image|示意图|照片)/;
var CONTAIN_RATIO = 0.92;
function contains(a, b) {
  if (a === b) return false;
  const areaRatio = b.w * b.h / (a.w * a.h);
  if (areaRatio > CONTAIN_RATIO) return false;
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w + 1 && b.y + b.h <= a.y + a.h + 1;
}
function inferType(el16) {
  if (el16.type) return el16.type;
  if (el16.kind === "text") return "text";
  const t2 = String(el16.text || "").trim();
  if (!t2) return null;
  if (el16.radius >= 6 && t2.length <= BTN_MAX_CHARS) return "button";
  if (INPUT_RE.test(t2)) return el16.h > 48 ? "textarea" : "input";
  if (IMAGE_RE.test(t2)) return "image";
  if (el16.w <= 24 && el16.h <= 24) return "icon";
  if (el16.h > 48) return "textarea";
  return "container";
}
function effTypeOf(elements, e) {
  if (e.type) return e.type;
  const hasKids = elements.some((o) => o.id !== e.id && contains(e, o));
  if (hasKids) return "container";
  return inferType(e) || "container";
}
function inferDirection(kids) {
  if (!kids.length) return "vertical";
  const xs = kids.map((k) => k.x + k.w / 2);
  const ys = kids.map((k) => k.y + k.h / 2);
  const rangeX = Math.max(...xs) - Math.min(...xs);
  const rangeY = Math.max(...ys) - Math.min(...ys);
  return rangeX >= rangeY ? "horizontal" : "vertical";
}
function isLowConfidence(el16) {
  return el16.kind === "rect" && !el16.type && !String(el16.text || "").trim();
}

// src/core/geometry.js
var CONTAIN_RATIO2 = 0.92;
function contains2(a, b) {
  if (a === b) return false;
  const areaRatio = b.w * b.h / (a.w * a.h);
  if (areaRatio > CONTAIN_RATIO2) return false;
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w + 1 && b.y + b.h <= a.y + a.h + 1;
}
function parseOptions(text) {
  if (!text) return [];
  return String(text).split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean);
}
function cut(s, n) {
  const t2 = String(s || "").trim();
  return t2.length > n ? t2.slice(0, n) : t2;
}
function strOrUndef(v) {
  const t2 = String(v == null ? "" : v).trim();
  return t2 || void 0;
}

// src/core/types.js
var TYPE_REGISTRY = [
  { type: "page", label: "\u9875\u9762", isContainer: true, isRoot: true, lockType: true, propsSchema: [], render: "page", preview: "page", minW: 32, minH: 24, fields: [] },
  { type: "container", label: "\u5BB9\u5668", isContainer: true, propsSchema: [], render: "container", preview: "container", minW: 24, minH: 16, fields: [] },
  { type: "text", label: "\u6587\u672C", propsSchema: ["text"], render: "text", preview: "text", minW: 24, minH: 14, fields: [] },
  { type: "button", label: "\u6309\u94AE", propsSchema: ["text", "action"], render: "button", preview: "button", minW: 40, minH: 20, fields: ["action"] },
  { type: "input", label: "\u8F93\u5165\u6846", propsSchema: ["placeholder", "inputType"], render: "input", preview: "input", minW: 40, minH: 18, fields: ["inputType"] },
  { type: "textarea", label: "\u6587\u672C\u57DF", propsSchema: ["placeholder"], render: "input", preview: "input", minW: 40, minH: 18, fields: [] },
  { type: "image", label: "\u56FE\u7247", propsSchema: [], render: "image", preview: "image", minW: 24, minH: 24, fields: [] },
  { type: "video", label: "\u89C6\u9891", propsSchema: [], render: "video", preview: "video", minW: 40, minH: 28, fields: [] },
  { type: "audio", label: "\u97F3\u9891", propsSchema: [], render: "audio", preview: "audio", minW: 40, minH: 20, fields: [] },
  { type: "icon", label: "\u56FE\u6807", propsSchema: [], render: "icon", preview: "icon", minW: 16, minH: 16, fields: [] },
  { type: "link", label: "\u94FE\u63A5", propsSchema: ["text"], render: "link", preview: "link", minW: 24, minH: 14, fields: [] },
  { type: "select", label: "\u4E0B\u62C9\u9009\u62E9", propsSchema: ["options"], render: "select", preview: "select", minW: 40, minH: 18, fields: ["options"] },
  { type: "checkbox", label: "\u590D\u9009\u6846", propsSchema: [{ key: "text", label: "\u6807\u7B7E\u6587\u5B57" }, "checked"], render: "checkbox", preview: "checkbox", minW: 24, minH: 20, fields: ["checked"] },
  { type: "radio", label: "\u5355\u9009\u6846", propsSchema: [{ key: "text", label: "\u6807\u7B7E\u6587\u5B57" }, "checked"], render: "radio", preview: "radio", minW: 24, minH: 20, fields: ["checked"] },
  { type: "switch", label: "\u5F00\u5173", propsSchema: ["checked"], render: "switch", preview: "switch", minW: 40, minH: 20, fields: ["checked"] },
  { type: "progress", label: "\u8FDB\u5EA6\u6761", propsSchema: [], render: "progress", preview: "progress", minW: 40, minH: 12, fields: [] },
  { type: "divider", label: "\u5206\u5272\u7EBF", propsSchema: [], render: "divider", preview: "divider", minW: 16, minH: 8, fields: [] },
  { type: "badge", label: "\u5FBD\u6807", propsSchema: ["text"], render: "badge", preview: "badge", minW: 24, minH: 16, fields: [] }
];
var TYPE_BY_TYPE = Object.fromEntries(TYPE_REGISTRY.map((t2) => [t2.type, t2]));
var ALL_TYPES = TYPE_REGISTRY.map((t2) => t2.type);
var TYPE_LABEL = Object.fromEntries(TYPE_REGISTRY.map((t2) => [t2.type, t2.label]));
var isContainerType = (t2) => {
  const d = TYPE_BY_TYPE[t2];
  return !!(d && d.isContainer);
};
function canBeParent(el16) {
  return el16.type === "container" || el16.type === "page" || !el16.type;
}
function typeOptionsFor(el16, elements) {
  if (!el16) return [];
  if (el16.type === "page") return [];
  const nested = elements.some((o) => o.id !== el16.id && contains2(o, el16));
  const hasKids = elements.some((o) => o.id !== el16.id && contains2(el16, o));
  let types = ALL_TYPES.slice();
  if (nested) types = types.filter((t2) => t2 !== "page");
  if (hasKids) types = types.filter((t2) => t2 === "container" || t2 === "page");
  return types;
}
function minSizeOf(elements, el16) {
  if (el16.kind === "arrow") return { w: 8, h: 8 };
  if (el16.kind === "note") return { w: 40, h: 24 };
  if (el16.kind === "text") return { w: 24, h: 14 };
  const et = effTypeOf(elements, el16);
  const d = TYPE_BY_TYPE[et];
  return { w: d && d.minW || 24, h: d && d.minH || 16 };
}

// src/core/jsonl/props.js
var PROPS_REGISTRY = [
  { key: "text", type: "string", label: "\u6587\u672C", serialize: (el16) => strOrUndef(el16.text) },
  { key: "placeholder", type: "string", label: "\u5360\u4F4D\u63D0\u793A", serialize: (el16) => strOrUndef(el16.text) },
  { key: "inputType", type: "enum", label: "\u8F93\u5165\u7C7B\u578B", values: ["text", "password", "number", "email", "tel", "url", "search"], serialize: (el16) => el16.inputType || void 0 },
  { key: "options", type: "array", label: "\u9009\u9879", serialize: (el16) => {
    const o = parseOptions(el16.optionsText);
    return o.length ? o : void 0;
  } },
  { key: "action", type: "string", label: "\u52A8\u4F5C", serialize: (el16) => strOrUndef(el16.action) },
  { key: "checked", type: "boolean", label: "\u9ED8\u8BA4\u9009\u4E2D", serialize: (el16) => el16.checked ? true : void 0 }
];
var PROPS_BY_KEY = Object.fromEntries(PROPS_REGISTRY.map((p) => [p.key, p]));

// src/core/jsonl/serializer.js
function serializeProps(el16, type) {
  const def = TYPE_BY_TYPE[type];
  if (!def) return {};
  const out = {};
  for (const item of def.propsSchema) {
    const key = typeof item === "string" ? item : item.key;
    const p = PROPS_BY_KEY[key];
    if (!p) continue;
    const serialize = typeof item === "object" && item.serialize ? item.serialize : p.serialize;
    const v = serialize(el16);
    if (v !== void 0) out[key] = v;
  }
  return out;
}
function serializeTree(node) {
  const o = { type: node.type };
  if (node.name) o.name = node.name;
  if (node.description) o.description = node.description;
  if (node.props && Object.keys(node.props).length) o.props = node.props;
  if ((node.type === "container" || node.type === "page") && node.direction && node.direction !== "vertical") o.direction = node.direction;
  if ((node.type === "container" || node.type === "page") && node.wrap) o.wrap = true;
  if (node.children && node.children.length) o.children = node.children.map(serializeTree);
  return o;
}

// src/core/jsonl/validator.js
function validateTree(tree) {
  const issues = [];
  if (!tree) {
    issues.push({ level: "error", message: "\u753B\u5E03\u4E3A\u7A7A\uFF1A\u8BF7\u5148\u7ED8\u5236\u754C\u9762\u8349\u56FE" });
    return issues;
  }
  const walk = (node, path) => {
    if (!node || typeof node !== "object") {
      issues.push({ level: "error", message: `${path} \u4E0D\u662F\u6709\u6548\u8282\u70B9` });
      return;
    }
    if (ALL_TYPES.indexOf(node.type) === -1) {
      issues.push({ level: "error", message: `${path} \u7C7B\u578B\u300C${node.type}\u300D\u4E0D\u5728\u6807\u51C6\u5185` });
    }
    if (!isContainerType(node.type) && node.children && node.children.length) {
      issues.push({ level: "error", message: `${path} \u975E\u5BB9\u5668\u7C7B\u578B\u4E0D\u5E94\u5305\u542B\u5B50\u8282\u70B9` });
    }
    if (isContainerType(node.type)) {
      if (node.direction !== void 0 && node.direction !== "horizontal" && node.direction !== "vertical") {
        issues.push({ level: "error", message: `${path} direction \u4EC5\u5141\u8BB8 horizontal/vertical` });
      }
      if (node.wrap !== void 0 && typeof node.wrap !== "boolean") {
        issues.push({ level: "error", message: `${path} wrap \u5FC5\u987B\u662F\u5E03\u5C14\u503C` });
      }
    }
    if (node.children) {
      node.children.forEach((c, i) => walk(c, `${path}.children[${i}]`));
    }
  };
  walk(tree, "#");
  return issues;
}

// src/core/pipeline.js
var ROW_TOL = 12;
var NAME_MAX = 12;
var mergeDesc = (a, b) => {
  if (!b) return a;
  if (!a) return b;
  return String(a).trim() + "\uFF1B" + String(b).trim();
};
function sortLayout(elements) {
  const items = elements.filter((e) => e.kind === "rect" || e.kind === "text");
  const sorted = items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const rows = [];
  for (const e of sorted) {
    const row = rows.find((r) => Math.abs(r.y - e.y) <= ROW_TOL);
    if (row) {
      row.items.push(e);
      row.items.sort((a, b) => a.x - b.x);
    } else rows.push({ y: e.y, items: [e] });
  }
  rows.sort((a, b) => a.y - b.y);
  return rows.flatMap((r) => r.items);
}
function buildNesting(ordered) {
  const parentOf = /* @__PURE__ */ new Map();
  for (const b of ordered) {
    let best = null;
    let bestArea = Infinity;
    for (const a of ordered) {
      if (!canBeParent(a)) continue;
      if (!contains2(a, b)) continue;
      const area = a.w * a.h;
      if (area < bestArea) {
        best = a;
        bestArea = area;
      }
    }
    if (best) parentOf.set(b.id, best.id);
  }
  const kidsOf = new Map(ordered.map((e) => [e.id, []]));
  const roots = [];
  for (const e of ordered) {
    const p = parentOf.get(e.id);
    if (p !== void 0) kidsOf.get(p).push(e);
    else roots.push(e);
  }
  return { kidsOf, roots };
}
function nodeFromElement(el16, kidEls, noteText) {
  const type = el16.type ? el16.type : kidEls.length ? "container" : inferType(el16) || "container";
  const node = { type };
  if (el16.name && String(el16.name).trim()) node.name = cut(String(el16.name).trim(), NAME_MAX);
  const desc = noteText || el16.note;
  if (desc) node.description = String(desc).trim();
  const props = serializeProps(el16, type);
  if (Object.keys(props).length) node.props = props;
  if (type === "container" || type === "page") {
    if (kidEls.length > 1) {
      if (el16.direction === "horizontal" || el16.direction === "vertical") {
        node.direction = el16.direction;
      } else {
        node.direction = inferDirection(kidEls);
      }
      if (el16.wrap) node.wrap = true;
    } else if (el16.wrap) {
      node.wrap = true;
    }
  }
  return node;
}
function buildResult(elements, rootName) {
  const issues = [];
  const notes = elements.filter((e) => e.kind === "note");
  const arrows = elements.filter((e) => e.kind === "arrow");
  const ordered = sortLayout(elements);
  const { kidsOf, roots } = buildNesting(ordered);
  for (const e of elements) {
    if (isLowConfidence(e)) {
      issues.push({ level: "warning", message: `\u300C${String(e.text || e.id)}\u300D\u4E3A\u7A7A\u77E9\u5F62\uFF0C\u5DF2\u6309\u5BB9\u5668\u5904\u7406\uFF0C\u53EF\u9009\u4E2D\u540E\u4FEE\u6539\u7C7B\u578B` });
    }
  }
  const noteMap = /* @__PURE__ */ new Map();
  const canvasNotes = [];
  for (const n of notes) {
    const cx = n.x + n.w / 2;
    const cy = n.y + n.h / 2;
    const target = ordered.slice().reverse().find((e) => cx >= e.x && cx <= e.x + e.w && cy >= e.y && cy <= e.y + e.h);
    const text = String(n.text || "").replace(/^备注[:：]?\s*/, "").trim();
    if (target) {
      if (text) noteMap.set(target.id, noteMap.get(target.id) ? noteMap.get(target.id) + "\uFF1B" + text : text);
    } else if (text) {
      canvasNotes.push(text);
    }
  }
  for (const a of arrows) {
    const from = ordered.slice().reverse().find((e) => e.x <= a.x && a.x <= e.x + e.w && e.y <= a.y && a.y <= e.y + e.h);
    const to = ordered.slice().reverse().find((e) => e.x <= a.x2 && a.x2 <= e.x + e.w && e.y <= a.y2 && a.y2 <= e.y + e.h);
    if (from && to && from.id !== to.id) {
      canvasNotes.push(`${cut(String(from.text || from.id), 8)} \u2192 ${cut(String(to.text || to.id), 8)} \u8DF3\u8F6C`);
    }
  }
  const canvasNote = canvasNotes.length ? canvasNotes.join("\uFF1B") : "";
  const buildNode = (el16) => {
    const kidEls = (kidsOf.get(el16.id) || []).filter((k) => k.type !== "page");
    const node = nodeFromElement(el16, kidEls, noteMap.get(el16.id));
    node.children = kidEls.map(buildNode);
    return node;
  };
  const pageEls = ordered.filter((el16) => el16.type === "page");
  let tree = null;
  let jsonl = "";
  if (pageEls.length) {
    const pageTrees = pageEls.map(buildNode).filter((t2) => t2.children && t2.children.length);
    if (pageTrees.length) tree = pageTrees.length === 1 ? pageTrees[0] : pageTrees;
    const stray = roots.filter((el16) => el16.type !== "page");
    if (stray.length) {
      const kids = stray.map(buildNode);
      const strayRoot = { type: "container", name: cut(rootName || "\u753B\u5E03", NAME_MAX), children: kids };
      if (kids.length > 1) strayRoot.direction = inferDirection(stray);
      pageTrees.push(strayRoot);
    }
    if (pageTrees.length) jsonl = pageTrees.map((t2) => JSON.stringify(serializeTree(t2))).join("\n");
    tree = pageTrees.length === 1 ? pageTrees[0] : pageTrees.length ? pageTrees : null;
  } else if (roots.length === 1 && roots[0].type === "container") {
    tree = buildNode(roots[0]);
  } else if (roots.length) {
    const kids = roots.map(buildNode);
    const treeRoot = {
      type: "container",
      name: cut(rootName || "\u753B\u5E03", NAME_MAX),
      children: kids
    };
    if (kids.length > 1) treeRoot.direction = inferDirection(roots);
    tree = treeRoot;
  }
  const firstRoot = Array.isArray(tree) ? tree[0] : tree;
  if (firstRoot && canvasNote) {
    firstRoot.description = mergeDesc(firstRoot.description, canvasNote);
  }
  const v = firstRoot == null ? [{ level: "error", message: "\u753B\u5E03\u4E3A\u7A7A\uFF1A\u8BF7\u5148\u7ED8\u5236\u754C\u9762\u8349\u56FE" }] : validateTree(firstRoot);
  issues.push(...v);
  jsonl = jsonl || (tree ? JSON.stringify(serializeTree(tree)) : "");
  return { tree, jsonl, issues, canvasNote, empty: !jsonl };
}

// src/core/prompt.js
var STANDARD_NOTE = "\u8FD9\u662F\u6211\u7ED8\u5236\u7684\u754C\u9762\u8349\u56FE\uFF0C\u5DF2\u8F6C\u4E3A JSONL \u8BED\u4E49\u63CF\u8FF0\u3002\u6BCF\u884C\u4E00\u4E2A\u5B8C\u6574 JSON \u5BF9\u8C61 = \u4E00\u4E2A\u9875\u9762\uFF08\u8BBE\u8BA1\u7A3F\uFF09\u3002\u5B57\u6BB5\u542B\u4E49\uFF1Atype=\u8282\u70B9\u7C7B\u578B(page/container/text/button/input/textarea/image/video/audio/icon/link/select/checkbox/radio/switch/progress/divider/badge\uFF0C\u5176\u4E2D page \u8868\u793A\u4E00\u4E2A\u9875\u9762/\u8BBE\u8BA1\u7A3F\uFF0C\u4E3A\u6839\u8282\u70B9\u7C7B\u578B)\uFF1Bprops=\u5143\u7D20\u5C5E\u6027(text/placeholder/inputType/options/src/action\u7B49)\uFF1Bdirection=\u5BB9\u5668\u65B9\u5411(vertical\u4E0A\u4E0B/horizontal\u5DE6\u53F3\uFF0C\u9ED8\u8BA4vertical)\uFF1Bwrap=true\u4E3A\u6D41\u5F0F\u5E03\u5C40\uFF1Bdescription=\u6211\u5BF9\u5143\u7D20\u7684\u8981\u6C42\u8BF4\u660E\u3002\u8BF7\u4E25\u683C\u6309\u6B64\u7ED3\u6784\u7406\u89E3\u6211\u60F3\u8981\u7684\u754C\u9762\uFF1A";
function buildInsertText(jsonl) {
  return "[\u754C\u9762\u8349\u56FE] " + STANDARD_NOTE + "\n" + jsonl;
}

// src/core/interactions.js
var ZOOM_MIN = 0.25;
var ZOOM_MAX = 3;
var MAX_ELEMENTS = 300;
var PAGE_GAP = 16;
var PASTE_OFFSET = 24;
function groupBounds(els, ids) {
  const set = new Set(ids);
  const list = els.filter((e) => set.has(e.id));
  if (!list.length) return null;
  const minX = Math.min(...list.map((e) => e.x));
  const minY = Math.min(...list.map((e) => e.y));
  const maxX = Math.max(...list.map((e) => e.x + e.w));
  const maxY = Math.max(...list.map((e) => e.y + e.h));
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
function toLocal(ev, rect, zoom, pan) {
  const vw = CANVAS_W / zoom;
  const vh = CANVAS_H / zoom;
  const scale = Math.min(rect.width / vw, rect.height / vh);
  const ox = (rect.width - vw * scale) / 2;
  const oy = (rect.height - vh * scale) / 2;
  return {
    x: pan.x + (ev.clientX - rect.left - ox) / scale,
    y: pan.y + (ev.clientY - rect.top - oy) / scale
  };
}
function zoomAt(factor, zoom, pan) {
  const nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoom * factor).toFixed(3)));
  const cx = pan.x + CANVAS_W / zoom / 2;
  const cy = pan.y + CANVAS_H / zoom / 2;
  return { zoom: nz, pan: { x: cx - CANVAS_W / nz / 2, y: cy - CANVAS_H / nz / 2 } };
}
function decidePointerDown(ctx, x, y, clientX, clientY) {
  if (ctx.spaceDown) {
    return { kind: "pan", drag: { mode: "pan", sx: clientX, sy: clientY, px: ctx.pan.x, py: ctx.pan.y } };
  }
  const { elements, mode, zoom, selectedIds } = ctx;
  const hit = hitTest(elements, x, y);
  const hitContainerLike = !!(hit && mode === "draw" && (hit.type === "page" || hit.type === "container" || !hit.type));
  const hitNonContainerInDraw = !!(hit && mode === "draw" && !hitContainerLike);
  if (hit && !hitContainerLike) {
    const onHandle = hit.kind !== "arrow" && x > hit.x + hit.w - 14 / zoom && y > hit.y + hit.h - 14 / zoom;
    if (mode === "draw" && !onHandle) {
      if (hitNonContainerInDraw) {
        return { kind: "select", ids: [hit.id] };
      }
    } else {
      if (mode === "select" && ctx.ctrl) {
        const has = selectedIds.indexOf(hit.id) !== -1;
        const next = has ? selectedIds.filter((i) => i !== hit.id) : selectedIds.concat([hit.id]);
        return { kind: "toggle", ids: next };
      }
      const keepMulti = !!(mode === "select" && selectedIds.length > 1 && selectedIds.indexOf(hit.id) !== -1);
      const selIds = keepMulti ? selectedIds : [hit.id];
      const page2 = elements.find((e) => e.type === "page" && e.id !== hit.id && hit.x + hit.w / 2 >= e.x && hit.x + hit.w / 2 <= e.x + e.w && hit.y + hit.h / 2 >= e.y && hit.y + hit.h / 2 <= e.y + e.h);
      const pageSnap2 = page2 ? { x: page2.x, y: page2.y, w: page2.w, h: page2.h } : null;
      const drag = {
        mode: onHandle ? "resize" : "move",
        id: hit.id,
        sx: x,
        sy: y,
        ox: hit.x,
        oy: hit.y,
        ow: hit.w,
        oh: hit.h,
        prev: null,
        // 由调用方填充（elements 深拷贝）
        page: pageSnap2
      };
      return { kind: drag.mode, drag, sel: keepMulti ? null : selIds };
    }
  }
  if (mode === "select") {
    if (selectedIds.length > 1) {
      const gb = groupBounds(elements, selectedIds);
      const handle = 10 / zoom;
      const corners = [
        { k: "tl", x: gb.x, y: gb.y },
        { k: "tr", x: gb.x + gb.w, y: gb.y },
        { k: "bl", x: gb.x, y: gb.y + gb.h },
        { k: "br", x: gb.x + gb.w, y: gb.y + gb.h }
      ];
      const hitCorner = corners.find((c) => x >= c.x - handle && x <= c.x + handle && y >= c.y - handle && y <= c.y + handle);
      if (hitCorner) {
        return { kind: "groupResize", drag: { mode: "groupResize", corner: hitCorner.k, sx: x, sy: y, gb } };
      }
    }
    return { kind: "marquee", drag: { mode: "marquee", sx: x, sy: y } };
  }
  if (elements.length >= MAX_ELEMENTS) {
    return { kind: "limit" };
  }
  const inPage = elements.some((e) => e.type === "page" && x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h);
  const page = elements.find((e) => e.type === "page" && x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h);
  const pageSnap = page ? { x: page.x, y: page.y, w: page.w, h: page.h } : null;
  const tmp = createElement({ kind: "rect", type: inPage ? "container" : "page" }, x, y, 0, 0);
  tmp.dragTmp = true;
  return { kind: "create", element: tmp, drag: { mode: "create", tmpId: tmp.id, sx: x, sy: y, page: pageSnap } };
}
function updateDrag(ctx, drag, x, y, clientX, clientY) {
  if (drag.mode === "pan") return { pan: computePan(drag, clientX, clientY, ctx.rect, ctx.zoom) };
  if (drag.mode === "create") return { patch: computeCreate(ctx, drag, x, y) };
  if (drag.mode === "move") return computeMove(ctx, drag, x, y);
  if (drag.mode === "marquee") return { nextDrag: Object.assign({}, drag, { mq: computeMarquee(drag, x, y) }) };
  if (drag.mode === "groupResize") return { patches: computeGroupResize(ctx, drag, x, y) };
  if (drag.mode === "resize") {
    const r = computeResize(ctx, drag, x, y);
    if (!r) return {};
    const { snaps, ...patch } = r;
    return { patch, snaps };
  }
  return {};
}
function computePan(drag, clientX, clientY, rect, zoom) {
  const scale = Math.min(rect.width / (CANVAS_W / zoom), rect.height / (CANVAS_H / zoom));
  return {
    x: drag.px - (clientX - drag.sx) / scale,
    y: drag.py - (clientY - drag.sy) / scale
  };
}
function computeCreate(ctx, drag, x, y) {
  const tmp = ctx.elements.find((e) => e.id === drag.tmpId);
  if (!tmp) return null;
  if (tmp.kind === "arrow") return { x2: x, y2: y };
  let nx = Math.min(x, drag.sx);
  let ny = Math.min(y, drag.sy);
  let nw = Math.max(4, Math.abs(x - drag.sx));
  let nh = Math.max(4, Math.abs(y - drag.sy));
  if (drag.page) {
    nw = Math.min(nw, drag.page.x + drag.page.w - nx);
    nh = Math.min(nh, drag.page.y + drag.page.h - ny);
  }
  return { x: nx, y: ny, w: Math.max(4, nw), h: Math.max(4, nh) };
}
function computeMove(ctx, drag, x, y) {
  const { elements, zoom, selectedIds } = ctx;
  const dx = x - drag.sx;
  const dy = y - drag.sy;
  const el16 = elements.find((e) => e.id === drag.id);
  if (!el16) return {};
  let nx = drag.ox + dx;
  let ny = drag.oy + dy;
  const tol = 6 / zoom;
  const snaps = [];
  const targets = elements.filter((t2) => t2.id !== el16.id && t2.kind !== "arrow");
  if (drag.page) targets.push(drag.page);
  let bx = null;
  let by = null;
  for (const t2 of targets) {
    const xs = [
      { d: Math.abs(nx - t2.x), pos: t2.x, line: t2.x },
      { d: Math.abs(nx + el16.w - (t2.x + t2.w)), pos: t2.x + t2.w - el16.w, line: t2.x + t2.w },
      { d: Math.abs(nx + el16.w / 2 - (t2.x + t2.w / 2)), pos: t2.x + t2.w / 2 - el16.w / 2, line: t2.x + t2.w / 2 }
    ];
    const ys = [
      { d: Math.abs(ny - t2.y), pos: t2.y, line: t2.y },
      { d: Math.abs(ny + el16.h - (t2.y + t2.h)), pos: t2.y + t2.h - el16.h, line: t2.y + t2.h },
      { d: Math.abs(ny + el16.h / 2 - (t2.y + t2.h / 2)), pos: t2.y + t2.h / 2 - el16.h / 2, line: t2.y + t2.h / 2 }
    ];
    for (const c of xs) if (c.d < tol && (!bx || c.d < bx.d)) bx = c;
    for (const c of ys) if (c.d < tol && (!by || c.d < by.d)) by = c;
  }
  if (bx) {
    nx = bx.pos;
    snaps.push({ axis: "v", pos: bx.line });
  }
  if (by) {
    ny = by.pos;
    snaps.push({ axis: "h", pos: by.line });
  }
  if (drag.page) {
    nx = Math.max(drag.page.x, Math.min(drag.page.x + drag.page.w - el16.w, nx));
    ny = Math.max(drag.page.y, Math.min(drag.page.y + drag.page.h - el16.h, ny));
  }
  const deltaX = nx - drag.ox;
  const deltaY = ny - drag.oy;
  const movingIds = /* @__PURE__ */ new Set();
  if (selectedIds.length > 1 && selectedIds.indexOf(el16.id) !== -1) {
    selectedIds.forEach((id) => movingIds.add(id));
  }
  movingIds.add(el16.id);
  if (el16.type === "page") {
    for (const t2 of elements) {
      if (t2.id === el16.id || t2.kind === "arrow") continue;
      const cx = t2.x + t2.w / 2;
      const cy = t2.y + t2.h / 2;
      if (cx >= el16.x && cx <= el16.x + el16.w && cy >= el16.y && cy <= el16.y + el16.h) movingIds.add(t2.id);
    }
  }
  let pageNx = el16.type === "page" ? nx : null;
  let pageNy = el16.type === "page" ? ny : null;
  if (pageNx !== null) {
    for (const p of elements) {
      if (p.id === el16.id || p.type !== "page") continue;
      const overlapX = pageNx < p.x + p.w + PAGE_GAP && pageNx + el16.w > p.x - PAGE_GAP;
      const overlapY = pageNy < p.y + p.h + PAGE_GAP && pageNy + el16.h > p.y - PAGE_GAP;
      if (!overlapX || !overlapY) continue;
      const dLeft = Math.abs(p.x - PAGE_GAP - el16.w - pageNx);
      const dRight = Math.abs(p.x + p.w + PAGE_GAP - pageNx);
      const dTop = Math.abs(p.y - PAGE_GAP - el16.h - pageNy);
      const dBottom = Math.abs(p.y + p.h + PAGE_GAP - pageNy);
      const min = Math.min(dLeft, dRight, dTop, dBottom);
      if (min === dLeft) pageNx = p.x - PAGE_GAP - el16.w;
      else if (min === dRight) pageNx = p.x + p.w + PAGE_GAP;
      else if (min === dTop) pageNy = p.y - PAGE_GAP - el16.h;
      else pageNy = p.y + p.h + PAGE_GAP;
    }
    nx = pageNx;
    ny = pageNy;
  }
  const patches = [];
  const incX = deltaX - (drag.lastDx || 0);
  const incY = deltaY - (drag.lastDy || 0);
  for (const e of elements) {
    if (!movingIds.has(e.id)) continue;
    if (e.id === el16.id) {
      patches.push({ id: e.id, x: nx, y: ny });
      continue;
    }
    let ex = e.x + incX;
    let ey = e.y + incY;
    const pg = elements.find((p) => p.type === "page" && p.id !== e.id && e.x + e.w / 2 >= p.x && e.x + e.w / 2 <= p.x + p.w && e.y + e.h / 2 >= p.y && e.y + e.h / 2 <= p.y + p.h);
    if (pg) {
      if (pg.id === el16.id) {
        ex = e.x + incX;
        ey = e.y + incY;
      } else {
        const pgDx = movingIds.has(pg.id) ? deltaX : 0;
        const pgDy = movingIds.has(pg.id) ? deltaY : 0;
        ex = Math.max(pg.x + pgDx, Math.min(pg.x + pgDx + pg.w - e.w, ex));
        ey = Math.max(pg.y + pgDy, Math.min(pg.y + pgDy + pg.h - e.h, ey));
      }
    }
    patches.push({ id: e.id, x: ex, y: ey });
  }
  return { patches, snaps, lastDx: deltaX, lastDy: deltaY };
}
function computeMarquee(drag, x, y) {
  return { x: Math.min(x, drag.sx), y: Math.min(y, drag.sy), w: Math.abs(x - drag.sx), h: Math.abs(y - drag.sy) };
}
function computeGroupResize(ctx, drag, x, y) {
  const gb = drag.gb;
  let nw = gb.w;
  let nh = gb.h;
  if (drag.corner === "tl") {
    nw = gb.w + (gb.x - x);
    nh = gb.h + (gb.y - y);
  } else if (drag.corner === "tr") {
    nw = x - gb.x;
    nh = gb.h + (gb.y - y);
  } else if (drag.corner === "bl") {
    nw = gb.w + (gb.x - x);
    nh = y - gb.y;
  } else {
    nw = x - gb.x;
    nh = y - gb.y;
  }
  const scale = Math.max(0.1, Math.min(10, nw / gb.w));
  const idSet = new Set(ctx.selectedIds);
  const patches = [];
  for (const e of ctx.elements) {
    if (!idSet.has(e.id)) continue;
    const min = minSizeOf(ctx.elements, e);
    patches.push({
      id: e.id,
      x: gb.x + (e.x - gb.x) * scale,
      y: gb.y + (e.y - gb.y) * scale,
      w: Math.max(min.w, e.w * scale),
      h: Math.max(min.h, e.h * scale)
    });
  }
  return patches;
}
function computeResize(ctx, drag, x, y) {
  const el16 = ctx.elements.find((e) => e.id === drag.id);
  if (!el16) return null;
  const { zoom, elements } = ctx;
  const min = minSizeOf(elements, el16);
  let w = Math.max(min.w, drag.ow + x - drag.sx);
  let h = Math.max(min.h, drag.oh + y - drag.sy);
  const tol = 6 / zoom;
  const snaps = [];
  const targets = elements.filter((t2) => t2.id !== el16.id && t2.kind !== "arrow");
  if (drag.page) targets.push(drag.page);
  const rightX = el16.x + w;
  let bw = null;
  for (const t2 of targets) {
    for (const [d, pos] of [[Math.abs(rightX - t2.x), t2.x], [Math.abs(rightX - (t2.x + t2.w)), t2.x + t2.w]]) {
      if (d < tol && (!bw || d < bw.d)) bw = { d, pos };
    }
  }
  if (bw) {
    w = Math.max(min.w, bw.pos - el16.x);
    snaps.push({ axis: "v", pos: bw.pos });
  }
  const bottomY = el16.y + h;
  let bh = null;
  for (const t2 of targets) {
    for (const [d, pos] of [[Math.abs(bottomY - t2.y), t2.y], [Math.abs(bottomY - (t2.y + t2.h)), t2.y + t2.h]]) {
      if (d < tol && (!bh || d < bh.d)) bh = { d, pos };
    }
  }
  if (bh) {
    h = Math.max(min.h, bh.pos - el16.y);
    snaps.push({ axis: "h", pos: bh.pos });
  }
  if (drag.page) {
    w = Math.min(w, drag.page.x + drag.page.w - el16.x);
    h = Math.min(h, drag.page.y + drag.page.h - el16.y);
  }
  return { w, h, snaps };
}
function settleDrag(ctx, drag) {
  if (drag.mode === "create") {
    const tmp = ctx.elements.find((e) => e.id === drag.tmpId);
    if (!tmp) return { commit: true };
    const strip = (c) => {
      const o = Object.assign({}, c);
      delete o.dragTmp;
      return o;
    };
    if (tmp.kind === "arrow") {
      const tiny2 = Math.abs(tmp.x2 - tmp.x) < 4 && Math.abs(tmp.y2 - tmp.y) < 4;
      return tiny2 ? { remove: [drag.tmpId], commit: true } : { patch: strip(tmp), commit: true };
    }
    if (tmp.kind === "text") {
      const tiny2 = tmp.w < 8 || tmp.h < 8;
      return tiny2 ? { patch: strip(Object.assign({}, tmp, { w: 120, h: 24 })), commit: true } : { patch: strip(tmp), commit: true };
    }
    const tiny = tmp.w < 8 || tmp.h < 8;
    return tiny ? { remove: [drag.tmpId], commit: true } : { patch: strip(tmp), commit: true };
  }
  if (drag.mode === "marquee") {
    const m = drag.mq;
    let selection = null;
    if (m && m.w > 4 && m.h > 4) {
      const picked = ctx.elements.filter((e) => e.kind !== "arrow" && e.x >= m.x && e.y >= m.y && e.x + e.w <= m.x + m.w && e.y + e.h <= m.y + m.h);
      selection = picked.map((e) => e.id);
    }
    return { selection, commit: true };
  }
  if (drag.mode === "groupResize" || drag.mode === "move" || drag.mode === "resize") {
    return { commit: true };
  }
  return {};
}
function collectCopySet(elements, ids) {
  const selEls = [];
  for (const id of ids) {
    const e = elements.find((x) => x.id === id);
    if (e) selEls.push(e);
  }
  const picked = /* @__PURE__ */ new Map();
  for (const e of elements) {
    const inSet = selEls.some((p) => p.id === e.id || contains(p, e));
    if (inSet) picked.set(e.id, e);
  }
  return cloneElements([...picked.values()]);
}
function buildPaste(copySet, dx, dy) {
  return copySet.map((e) => {
    const c = cloneElements([e])[0];
    c.id = nextId();
    c.x += dx;
    c.y += dy;
    return c;
  });
}

// src/hooks/useToasts.js
var import_react3 = __toESM(require("react"), 1);
function useToasts(open) {
  const [toast, setToast] = import_react3.default.useState(null);
  const toastTimer = import_react3.default.useRef(null);
  const showToast = import_react3.default.useCallback((text, type) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, type: type || "error", key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3e3);
  }, []);
  import_react3.default.useEffect(() => {
    if (open) return;
    setToast(null);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, [open]);
  return { toast, showToast };
}

// src/hooks/useSketchState.js
var import_react4 = __toESM(require("react"), 1);
var HISTORY_MAX = 50;
function useSketchState(init) {
  const [elements, setElements] = import_react4.default.useState(init.elements);
  const [rootName, setRootName] = import_react4.default.useState(init.rootName);
  const [mode, setMode] = import_react4.default.useState("select");
  const [selectedIds, setSelectedIds] = import_react4.default.useState([]);
  const [selectedId, setSelectedId] = import_react4.default.useState(null);
  const [past, setPast] = import_react4.default.useState([]);
  const [future, setFuture] = import_react4.default.useState([]);
  const [copyBuf, setCopyBuf] = import_react4.default.useState(null);
  const [currentId, setCurrentId] = import_react4.default.useState(init.currentId);
  const currentIdRef = import_react4.default.useRef(init.currentId);
  const applySelection = import_react4.default.useCallback((ids) => {
    setSelectedIds(ids);
    setSelectedId(ids.length ? ids[ids.length - 1] : null);
  }, []);
  const setCurrent = import_react4.default.useCallback((id) => {
    currentIdRef.current = id;
    setCurrentId(id);
  }, []);
  const commitHistory = import_react4.default.useCallback((before) => {
    setPast((p) => (p.length >= HISTORY_MAX ? p.slice(1) : p).concat([before]));
    setFuture([]);
  }, []);
  const undo = import_react4.default.useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => (f.length >= HISTORY_MAX ? f.slice(0, HISTORY_MAX - 1) : f).concat([cloneElements(elements)]));
      setElements(prev);
      applySelection([]);
      return p.slice(0, -1);
    });
  }, [elements, applySelection]);
  const redo = import_react4.default.useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setPast((p) => (p.length >= HISTORY_MAX ? p.slice(1) : p).concat([cloneElements(elements)]));
      setElements(next);
      applySelection([]);
      return f.slice(1);
    });
  }, [elements, applySelection]);
  return {
    elements,
    setElements,
    rootName,
    setRootName,
    mode,
    setMode,
    selectedIds,
    selectedId,
    applySelection,
    past,
    setPast,
    future,
    setFuture,
    undo,
    redo,
    copyBuf,
    setCopyBuf,
    currentId,
    setCurrent,
    currentIdRef,
    commitHistory
  };
}

// src/hooks/useCanvasInteractions.js
var import_react5 = __toESM(require("react"), 1);

// src/i18n/index.js
var zh = {
  // toast
  "toast.limit": "\u63A7\u4EF6\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\uFF08{max}\uFF09\uFF0C\u8BF7\u5148\u5220\u9664\u90E8\u5206\u63A7\u4EF6",
  "toast.capacity": "\u753B\u5E03\u6570\u636E\u8D85\u51FA\u672C\u5730\u5B58\u50A8\u5BB9\u91CF\uFF0C\u8BF7\u5BFC\u51FA\u5907\u4EFD\u540E\u6E05\u7406",
  "toast.exportMissing": "\u753B\u5E03\u6570\u636E\u4E0D\u5B58\u5728\u6216\u5DF2\u635F\u574F",
  "toast.readFail": "\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25",
  "toast.notJson": "\u6587\u4EF6\u4E0D\u662F\u5408\u6CD5 JSON",
  "toast.imported": "\u5DF2\u5BFC\u5165\u753B\u5E03\uFF1A{name}",
  "toast.inputUnavailable": "\u8F93\u5165\u6846\u63A5\u53E3\u4E0D\u53EF\u7528\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5",
  "toast.saveFailed": "\u753B\u5E03\u4FDD\u5B58\u5931\u8D25\uFF1A\u5B58\u50A8\u670D\u52A1\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5",
  "toast.pageNested": "\u88AB\u5BB9\u5668\u5305\u542B\u7684\u63A7\u4EF6\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u9875\u9762",
  "toast.containerHasKids": "\u5305\u542B\u5B50\u5143\u7D20\u7684\u5BB9\u5668\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u975E\u5BB9\u5668",
  // 画板外壳
  "title": "\u754C\u9762\u8349\u56FE",
  "new": "\u65B0\u5EFA",
  "newTitle": "\u65B0\u5EFA\u753B\u5E03\uFF08\u81EA\u52A8\u4FDD\u5B58\u5F53\u524D\uFF09",
  "fullscreen": "\u5168\u5C4F",
  "exitFullscreen": "\u9000\u51FA\u5168\u5C4F (Esc)",
  "close": "\u5173\u95ED (Esc)",
  "cancel": "\u53D6\u6D88",
  "insert": "\u63D2\u5165\u5230\u8F93\u5165\u6846",
  "insertTitle": "\u5C06 JSONL \u63D2\u5165\u4F1A\u8BDD\u8F93\u5165\u6846",
  "insertErrorTitle": "\u5B58\u5728\u9519\u8BEF\uFF0C\u4FEE\u590D\u540E\u53EF\u63D2\u5165"
};
var LOCALE = zh;
function t(key, params) {
  let s = LOCALE[key];
  if (s == null) return key;
  if (params) {
    for (const k of Object.keys(params)) {
      s = s.split("{" + k + "}").join(String(params[k]));
    }
  }
  return s;
}

// src/hooks/useCanvasInteractions.js
function useCanvasInteractions(deps) {
  const {
    open,
    elements,
    setElements,
    selectedIds,
    applySelection,
    commitHistory,
    mode,
    setMode,
    editing,
    setEditing,
    copyBuf,
    setCopyBuf,
    undo,
    redo,
    removeSel,
    showToast,
    svgRef,
    viewRef
  } = deps;
  const [zoom, setZoom] = import_react5.default.useState(1);
  const [pan, setPan] = import_react5.default.useState({ x: 0, y: 0 });
  const [drag, setDrag] = import_react5.default.useState(null);
  const [snapLines, setSnapLines] = import_react5.default.useState([]);
  const [spaceDown, setSpaceDown] = import_react5.default.useState(false);
  const spaceRef = import_react5.default.useRef(false);
  const modeRef = import_react5.default.useRef(mode);
  modeRef.current = mode;
  const altRef = import_react5.default.useRef(false);
  const [fullscreen, setFullscreen] = import_react5.default.useState(false);
  const onMouseDown = (ev) => {
    ev.preventDefault();
    if (editing) setEditing(null);
    const rect = svgRef.current.getBoundingClientRect();
    const { x, y } = toLocal(ev, rect, zoom, pan);
    const dec = decidePointerDown({
      elements,
      mode: modeRef.current,
      zoom,
      selectedIds,
      spaceDown: spaceRef.current,
      pan,
      ctrl: ev.ctrlKey
    }, x, y, ev.clientX, ev.clientY);
    if (dec.kind === "pan") {
      setDrag(dec.drag);
      return;
    }
    if (dec.kind === "select") {
      applySelection(dec.ids);
      return;
    }
    if (dec.kind === "toggle") {
      applySelection(dec.ids);
      return;
    }
    if (dec.kind === "move" || dec.kind === "resize") {
      if (dec.sel) applySelection(dec.sel);
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }));
      return;
    }
    if (dec.kind === "groupResize") {
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }));
      return;
    }
    if (dec.kind === "marquee") {
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }));
      applySelection([]);
      return;
    }
    if (dec.kind === "limit") {
      showToast(t("toast.limit", { max: MAX_ELEMENTS }));
      return;
    }
    if (dec.kind === "create") {
      applySelection([]);
      setElements((els) => els.concat([dec.element]));
      setDrag(Object.assign({}, dec.drag, { prev: cloneElements(elements) }));
      return;
    }
  };
  const onMouseMove = (ev) => {
    if (!drag) return;
    const rect = svgRef.current.getBoundingClientRect();
    const { x, y } = toLocal(ev, rect, zoom, pan);
    const r = updateDrag({ elements, zoom, selectedIds, rect }, drag, x, y, ev.clientX, ev.clientY);
    if (r.pan) {
      setPan(r.pan);
      return;
    }
    if (r.patch) {
      const targetId = drag.mode === "create" ? drag.tmpId : drag.id;
      setElements((els) => els.map((e) => e.id === targetId ? Object.assign({}, e, r.patch) : e));
      if (r.snaps) setSnapLines(r.snaps);
      return;
    }
    if (r.patches) {
      const pm = new Map(r.patches.map((p) => [p.id, p]));
      setElements((els) => els.map((e) => pm.has(e.id) ? Object.assign({}, e, pm.get(e.id)) : e));
      if (r.snaps) setSnapLines(r.snaps);
      if (r.lastDx !== void 0) setDrag((d) => d ? Object.assign({}, d, { lastDx: r.lastDx, lastDy: r.lastDy }) : d);
      return;
    }
    if (r.nextDrag) {
      setDrag(r.nextDrag);
      return;
    }
  };
  const endDrag = () => {
    if (!drag) return;
    const r = settleDrag({ elements }, drag);
    if (r.remove) {
      const rm = new Set(r.remove);
      setElements((els) => els.filter((e) => !rm.has(e.id)));
    } else if (r.patch) {
      const p = r.patch;
      setElements((els) => els.map((e) => e.id === p.id ? p : e));
    }
    if (r.selection) applySelection(r.selection);
    else if (drag.mode === "create") applySelection([drag.tmpId]);
    if (r.commit && drag.prev) commitHistory(drag.prev);
    setDrag(null);
    setSnapLines([]);
  };
  import_react5.default.useEffect(() => {
    if (!open) return;
    const isEditable = (t2) => t2 && (t2.tagName === "INPUT" || t2.tagName === "TEXTAREA" || t2.tagName === "SELECT" || t2.isContentEditable);
    const onKeyDown = (ev) => {
      if (ev.code === "Space" && !isEditable(ev.target)) {
        ev.preventDefault();
        spaceRef.current = true;
        setSpaceDown(true);
        return;
      }
      if (ev.key === "Alt" && !isEditable(ev.target)) {
        ev.preventDefault();
        altRef.current = true;
        modeRef.current = "draw";
        setMode("draw");
        return;
      }
      if (ev.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else setOpen(false);
        return;
      }
      if (isEditable(ev.target)) return;
      const k = ev.key.toLowerCase();
      if ((ev.ctrlKey || ev.metaKey) && k === "z") {
        ev.preventDefault();
        if (ev.shiftKey) redo();
        else undo();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && k === "y") {
        ev.preventDefault();
        redo();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && k === "c") {
        ev.preventDefault();
        if (selectedIds.length) setCopyBuf(collectCopySet(elements, selectedIds));
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && k === "v") {
        ev.preventDefault();
        if (!copyBuf || !copyBuf.length) return;
        if (elements.length + copyBuf.length > MAX_ELEMENTS) {
          showToast(t("toast.limit", { max: MAX_ELEMENTS }));
          return;
        }
        const copies = buildPaste(copyBuf, PASTE_OFFSET, PASTE_OFFSET);
        commitHistory(cloneElements(elements));
        setElements((els) => els.concat(copies));
        applySelection(copies.map((c) => c.id));
        return;
      }
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        if (editing) {
          setEditing(null);
          return;
        }
        if (selectedIds.length) removeSel();
        return;
      }
    };
    const onKeyUp = (ev) => {
      if (ev.code === "Space") {
        spaceRef.current = false;
        setSpaceDown(false);
      }
      if (ev.key === "Alt") {
        if (altRef.current) {
          modeRef.current = "select";
          setMode("select");
        }
        altRef.current = false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  });
  import_react5.default.useEffect(() => {
    if (!open) return;
    const view = viewRef.current;
    if (!view) return;
    const onWheel = (ev) => {
      ev.preventDefault();
      const factor = ev.deltaY < 0 ? 1.1 : 1 / 1.1;
      const r = zoomAt(factor, zoom, pan);
      setZoom(r.zoom);
      setPan(r.pan);
    };
    view.addEventListener("wheel", onWheel, { passive: false });
    return () => view.removeEventListener("wheel", onWheel);
  });
  import_react5.default.useEffect(() => {
    if (open) return;
    setDrag(null);
    spaceRef.current = false;
    altRef.current = false;
    setSpaceDown(false);
    setSnapLines([]);
  }, [open]);
  const canvasCursor = spaceDown ? drag && drag.mode === "pan" ? "grabbing" : "grab" : mode === "draw" ? "crosshair" : "default";
  return {
    zoom,
    pan,
    setZoom,
    setPan,
    drag,
    snapLines,
    spaceDown,
    fullscreen,
    setFullscreen,
    canvasCursor,
    onMouseDown,
    onMouseMove,
    onMouseUp: endDrag,
    onMouseLeave: endDrag
  };
}

// src/hooks/useCanvasEdit.js
var import_react6 = __toESM(require("react"), 1);
function useCanvasEdit(deps) {
  const {
    elements,
    setElements,
    selectedIds,
    selectedId,
    applySelection,
    commitHistory,
    showToast
  } = deps;
  const [editing, setEditing] = import_react6.default.useState(null);
  const [menu, setMenu] = import_react6.default.useState(null);
  const [typeMenu, setTypeMenu] = import_react6.default.useState(false);
  const [confirmDelete, setConfirmDelete] = import_react6.default.useState(null);
  const patchSel = (patch) => {
    commitHistory(cloneElements(elements));
    setElements((els) => els.map((e) => e.id === selectedId ? Object.assign({}, e, patch) : e));
  };
  const patchEl = (id, patch) => {
    setElements((els) => els.map((e) => e.id === id ? Object.assign({}, e, patch) : e));
  };
  const typeChangeAllowed = (id, type) => {
    const el16 = elements.find((e) => e.id === id);
    if (!el16) return true;
    const nested = elements.some((o) => o.id !== id && contains(o, el16));
    const hasKids = elements.some((o) => o.id !== id && contains(el16, o));
    if (type === "page" && nested) {
      showToast(t("toast.pageNested"));
      return false;
    }
    if (type !== "container" && type !== "page" && hasKids) {
      showToast(t("toast.containerHasKids"));
      return false;
    }
    return true;
  };
  const patchType = (id, type) => {
    if (!typeChangeAllowed(id, type)) return;
    commitHistory(cloneElements(elements));
    patchEl(id, { type });
  };
  const pageInnerOf = (id) => {
    const el16 = elements.find((e) => e.id === id);
    if (!el16 || el16.type !== "page") return [];
    return elements.filter((t2) => t2.id !== id && t2.kind !== "arrow" && t2.x + t2.w / 2 >= el16.x && t2.x + t2.w / 2 <= el16.x + el16.w && t2.y + t2.h / 2 >= el16.y && t2.y + t2.h / 2 <= el16.y + el16.h);
  };
  const pageInnerCount = (id) => pageInnerOf(id).length;
  const deleteWithConfirm = (ids) => {
    if (!ids.length) return;
    const idSet = new Set(ids);
    const extra = [];
    for (const id of ids) {
      const el16 = elements.find((e) => e.id === id);
      if (!el16 || el16.type !== "page") continue;
      for (const t2 of pageInnerOf(id)) {
        if (!idSet.has(t2.id) && !extra.includes(t2.id)) extra.push(t2.id);
      }
    }
    if (extra.length) {
      setConfirmDelete({ ids: ids.concat(extra), extraCount: extra.length });
      return;
    }
    const allSet = new Set(ids);
    commitHistory(cloneElements(elements));
    setElements((els) => els.filter((e) => !allSet.has(e.id)));
    applySelection(selectedIds.filter((x) => !allSet.has(x)));
  };
  const confirmDeleteExecute = () => {
    if (!confirmDelete) return;
    const allSet = new Set(confirmDelete.ids);
    commitHistory(cloneElements(elements));
    setElements((els) => els.filter((e) => !allSet.has(e.id)));
    applySelection(selectedIds.filter((x) => !allSet.has(x)));
    setConfirmDelete(null);
  };
  const confirmDeleteCancel = () => setConfirmDelete(null);
  const removeSel = () => deleteWithConfirm(selectedIds);
  const removeEl = (id) => deleteWithConfirm([id]);
  const toTop = (id) => {
    const el16 = elements.find((x) => x.id === id);
    if (!el16 || el16.type === "page") return;
    commitHistory(cloneElements(elements));
    setElements((els) => {
      const e = els.find((x) => x.id === id);
      return e ? els.filter((x) => x.id !== id).concat([e]) : els;
    });
  };
  const toBottom = (id) => {
    const el16 = elements.find((x) => x.id === id);
    if (!el16 || el16.type === "page") return;
    commitHistory(cloneElements(elements));
    setElements((els) => {
      const e = els.find((x) => x.id === id);
      return e ? [e].concat(els.filter((x) => x.id !== id)) : els;
    });
  };
  const closeMenu = () => {
    setMenu(null);
    setTypeMenu(false);
  };
  const startEdit = (e, field) => {
    closeMenu();
    commitHistory(cloneElements(elements));
    applySelection([e.id]);
    setEditing({ id: e.id, field, value: field === "name" ? e.name || "" : e.text || "" });
  };
  const applyEdit = (ed) => {
    const patch = ed.field === "name" ? { name: ed.value } : { text: ed.value };
    setElements((els) => els.map((e) => e.id === ed.id ? Object.assign({}, e, patch) : e));
  };
  const onCtxMenu = (ev, e) => {
    applySelection([e.id]);
    setMenu({ x: ev.clientX, y: ev.clientY, id: e.id });
    setTypeMenu(false);
  };
  const selTypeOptions = (el16) => el16 ? typeOptionsFor(el16, elements) : [];
  return {
    editing,
    setEditing,
    menu,
    setMenu,
    typeMenu,
    setTypeMenu,
    patchSel,
    patchEl,
    patchType,
    removeSel,
    removeEl,
    pageInnerOf,
    pageInnerCount,
    deleteWithConfirm,
    confirmDelete,
    confirmDeleteExecute,
    confirmDeleteCancel,
    toTop,
    toBottom,
    closeMenu,
    startEdit,
    applyEdit,
    onCtxMenu,
    selTypeOptions
  };
}

// src/hooks/useCanvasManager.js
var import_react7 = __toESM(require("react"), 1);

// src/core/storage/schema.js
var CURRENT_SCHEMA_VERSION = 1;
function genCanvasId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 6);
}

// src/core/storage/migrate.js
function migrateFile(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.schemaVersion === CURRENT_SCHEMA_VERSION) return raw;
  if (typeof raw.id === "string" && raw.id && typeof raw.name === "string" && Array.isArray(raw.elements)) {
    const t2 = typeof raw.time === "string" && raw.time ? raw.time : (/* @__PURE__ */ new Date()).toISOString();
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: raw.id,
      name: raw.name,
      createdAt: t2,
      updatedAt: t2,
      elements: raw.elements,
      meta: {
        source: "migrated",
        canvasNote: typeof raw.canvasNote === "string" ? raw.canvasNote : "",
        jsonlPreview: typeof raw.jsonl === "string" ? raw.jsonl : ""
      }
    };
  }
  return null;
}

// src/core/storage/integrity.js
function sanitizeElements(elements) {
  if (!Array.isArray(elements)) return { elements: [], dropped: 0 };
  const out = [];
  let dropped = 0;
  for (const e of elements) {
    if (e && typeof e === "object" && typeof e.id === "string" && e.id && typeof e.x === "number" && typeof e.y === "number" && typeof e.w === "number" && typeof e.h === "number") {
      out.push(e);
    } else {
      dropped++;
    }
  }
  return { elements: out, dropped };
}
function isValidMeta(m) {
  return !!(m && typeof m === "object" && typeof m.id === "string" && m.id && typeof m.name === "string" && typeof m.updatedAt === "string");
}

// src/core/storage/adapters/localStorage.js
var INDEX_KEY = "dsh-wf:index";
var LEGACY_KEY = "dsh-wf.history.v1";
var CAPACITY_LIMIT = 4 * 1024 * 1024;
var bodyKey = (id) => "dsh-wf:body:" + id;
var mediaPrefix = (id) => "dsh-wf:media:" + id + ":";
var mediaKey = (id, key) => "dsh-wf:media:" + id + ":" + key;
function readIndex() {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(isValidMeta) : [];
  } catch (e) {
    return [];
  }
}
function writeIndex(list) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch (e) {
  }
}
function sortMeta(list) {
  return list.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}
function fits(value) {
  return !value || String(value).length < CAPACITY_LIMIT;
}
function localStorageAdapter() {
  const listMeta = async (q) => {
    let items = sortMeta(readIndex());
    const kw = q && q.keyword ? String(q.keyword).trim() : "";
    if (kw) items = items.filter((m) => m.name.includes(kw));
    const total = items.length;
    if (q && typeof q.page === "number") {
      const size = q && q.pageSize || 20;
      items = items.slice(q.page * size, q.page * size + size);
    }
    return { items, total };
  };
  const getMeta = async (id) => readIndex().find((m) => m.id === id) || null;
  const loadBody = async (id) => {
    const raw = localStorage.getItem(bodyKey(id));
    if (!raw) return null;
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return null;
    }
    const { elements, dropped } = sanitizeElements(parsed.elements);
    return { elements, schemaVersion: parsed && parsed.schemaVersion || 1, dropped };
  };
  const saveMeta = async (meta) => {
    const list = readIndex().filter((m) => m.id !== meta.id);
    list.unshift(meta);
    writeIndex(list.slice(0, 100));
  };
  const saveBody = async (id, patch) => {
    const prev = await loadBody(id);
    const map = new Map((prev ? prev.elements : []).map((e) => [e.id, e]));
    for (const rm of patch.remove || []) map.delete(rm);
    for (const k of Object.keys(patch.set || {})) map.set(k, patch.set[k]);
    const body = { schemaVersion: 1, elements: Array.from(map.values()) };
    const json = JSON.stringify(body);
    if (!fits(json)) return false;
    try {
      localStorage.setItem(bodyKey(id), json);
    } catch (e) {
      return false;
    }
    return true;
  };
  const putMedia = async (id, key, blob) => {
    const dataUrl = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
    if (dataUrl == null || !fits(dataUrl)) return false;
    try {
      localStorage.setItem(mediaKey(id, key), dataUrl);
    } catch (e) {
      return false;
    }
    return true;
  };
  const getMedia = async (id, key) => {
    const raw = localStorage.getItem(mediaKey(id, key));
    if (!raw) return null;
    try {
      return await (await fetch(raw)).blob();
    } catch (e) {
      return null;
    }
  };
  const remove = async (id) => {
    const list = readIndex().filter((m) => m.id !== id);
    writeIndex(list);
    localStorage.removeItem(bodyKey(id));
    const prefix = mediaPrefix(id);
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  };
  const clear = async () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("dsh-wf:")) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  };
  const sync = {
    listMeta: () => sortMeta(readIndex()),
    getMeta: (id) => readIndex().find((m) => m.id === id) || null,
    loadBody: (id) => {
      const raw = localStorage.getItem(bodyKey(id));
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return { elements: sanitizeElements(parsed.elements).elements, schemaVersion: parsed && parsed.schemaVersion || 1 };
      } catch (e) {
        return null;
      }
    }
  };
  const migrateLegacy = async () => {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return 0;
    let arr = [];
    try {
      arr = JSON.parse(raw);
    } catch (e) {
      localStorage.removeItem(LEGACY_KEY);
      return 0;
    }
    if (!Array.isArray(arr)) {
      localStorage.removeItem(LEGACY_KEY);
      return 0;
    }
    let n = 0;
    for (const h of arr) {
      const cf = migrateFile(h);
      if (!cf) continue;
      await saveMeta({
        id: cf.id,
        name: cf.name,
        schemaVersion: cf.schemaVersion,
        createdAt: cf.createdAt,
        updatedAt: cf.updatedAt,
        elementCount: (cf.elements || []).length,
        hasMedia: false
      });
      const json = JSON.stringify({ schemaVersion: cf.schemaVersion, elements: cf.elements || [] });
      try {
        localStorage.setItem(bodyKey(cf.id), json);
      } catch (e) {
        continue;
      }
      n++;
    }
    localStorage.removeItem(LEGACY_KEY);
    return n;
  };
  return {
    listMeta,
    getMeta,
    loadBody,
    saveMeta,
    saveBody,
    putMedia,
    getMedia,
    remove,
    clear,
    sync,
    migrateLegacy,
    name: "localStorage"
  };
}

// src/core/storage/adapters/indexedDB.js
var UNIMPLEMENTED = () => {
  throw new Error("indexedDB \u9002\u914D\u5668\u4E3A\u9884\u7559\u5B9E\u73B0\uFF08\u672A\u542F\u7528\uFF09");
};
function indexedDBAdapter() {
  return {
    name: "indexedDB",
    ready: false,
    // 预留标记：未实现 → 不被 probeAdapters 选中（安全降级到 localStorage）
    listMeta: UNIMPLEMENTED,
    getMeta: UNIMPLEMENTED,
    loadBody: UNIMPLEMENTED,
    saveMeta: UNIMPLEMENTED,
    saveBody: UNIMPLEMENTED,
    putMedia: UNIMPLEMENTED,
    getMedia: UNIMPLEMENTED,
    remove: UNIMPLEMENTED,
    clear: UNIMPLEMENTED
  };
}

// src/core/storage/adapters/hostSQLite.js
var UNIMPLEMENTED2 = () => {
  throw new Error("hostSQLite \u9002\u914D\u5668\u4E3A\u9884\u7559\u5B9E\u73B0\uFF08\u5BBF\u4E3B\u8DEF\u7531\u672A\u4E0A\u7EBF\uFF09");
};
function hostSQLiteAdapter(rpc) {
  return {
    name: "hostSQLite",
    ready: false,
    rpc: rpc || null,
    listMeta: UNIMPLEMENTED2,
    getMeta: UNIMPLEMENTED2,
    loadBody: UNIMPLEMENTED2,
    saveMeta: UNIMPLEMENTED2,
    saveBody: UNIMPLEMENTED2,
    putMedia: UNIMPLEMENTED2,
    getMedia: UNIMPLEMENTED2,
    remove: UNIMPLEMENTED2,
    clear: UNIMPLEMENTED2
  };
}

// src/core/storage/adapters/hostFile.js
function hostFileAdapter(rpc) {
  const call = rpc && typeof rpc.call === "function" ? rpc.call.bind(rpc) : null;
  const invoke = async (method, args, fallback) => {
    if (!call) return fallback;
    const r = await call(method, args);
    if (!r || r.ok !== true) throw new Error(r && r.error ? r.error : "\u753B\u5E03\u5B58\u50A8\u8C03\u7528\u5931\u8D25\uFF1A" + method);
    return r;
  };
  return {
    name: "hostFile",
    ready: !!call,
    rpc: rpc || null,
    listMeta: async (q) => {
      const r = await invoke("listMeta", q, { items: [], total: 0 });
      return { items: r.items || [], total: r.total || 0 };
    },
    getMeta: async (id) => {
      const r = await invoke("getMeta", { id }, null);
      return r.meta || null;
    },
    loadBody: async (id) => {
      const r = await invoke("loadBody", { id }, null);
      return r.body || null;
    },
    saveMeta: async (meta) => {
      await invoke("saveMeta", { meta }, null);
    },
    saveBody: async (id, patch) => {
      await invoke("saveBody", { id, patch }, false);
      return true;
    },
    putMedia: async (id, key, blob) => {
      const base64 = await new Promise((resolve) => {
        const rd = new FileReader();
        rd.onload = () => resolve(String(rd.result || "").split(",")[1] || "");
        rd.onerror = () => resolve("");
        rd.readAsDataURL(blob);
      });
      if (!base64) return false;
      await invoke("putMedia", { id, key, base64 }, false);
      return true;
    },
    getMedia: async (id, key) => {
      const r = await invoke("getMedia", { id, key }, null);
      if (!r.media) return null;
      const bin = atob(r.media.base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: "application/octet-stream" });
    },
    remove: async (id) => {
      await invoke("remove", { id }, null);
    },
    clear: async () => {
      await invoke("clear", {}, null);
    }
  };
}

// src/core/storage/index.js
function probeAdapters(hostRpc) {
  const available = [];
  for (const c of [hostSQLiteAdapter(hostRpc), hostFileAdapter(hostRpc), indexedDBAdapter()]) {
    if (c.ready) available.push(c);
  }
  available.push(localStorageAdapter());
  return available;
}
var cached = null;
function defaultStore(hostRpc) {
  if (cached) return cached;
  cached = probeAdapters(hostRpc)[0];
  if (cached.name === "localStorage") cached.migrateLegacy().catch(() => {
  });
  return cached;
}
async function exportCanvasFile(store2, id) {
  const meta = await store2.getMeta(id);
  const body = await store2.loadBody(id);
  if (!meta || !body) return null;
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: meta.id,
    name: meta.name,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    elements: body.elements,
    meta: { source: "export" }
  };
}
async function importCanvasFile(store2, file) {
  if (!file || typeof file !== "object") return { ok: false, reason: "\u4E0D\u662F\u6709\u6548\u7684\u753B\u5E03\u6587\u4EF6" };
  const cf = migrateFile(file);
  if (!cf || !Array.isArray(cf.elements)) return { ok: false, reason: "\u6587\u4EF6\u5185\u5BB9\u65E0\u6CD5\u8BC6\u522B\uFF08\u9700\u4E3A dsh-wf \u753B\u5E03 JSON\uFF09" };
  const id = genCanvasId();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await store2.saveMeta({
    id,
    name: cf.name || "\u672A\u547D\u540D\u753B\u5E03",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    elementCount: cf.elements.length,
    hasMedia: false
  });
  const set = {};
  for (const e of cf.elements) set[e.id] = e;
  const okBody = await store2.saveBody(id, { set, remove: [] });
  if (!okBody) return { ok: false, reason: "\u753B\u5E03\u6570\u636E\u8D85\u51FA\u5B58\u50A8\u5BB9\u91CF\uFF0C\u5BFC\u5165\u5931\u8D25" };
  return { ok: true, id };
}

// src/hooks/useCanvasManager.js
var AUTO_SAVE_MS = 800;
var LIST_PAGE = { page: 0, pageSize: 100 };
function freshPage() {
  const page = createElement({ kind: "rect", type: "page" }, 20, 20, 760, 480);
  return [page];
}
function initLast() {
  const store2 = defaultStore();
  if (!store2.sync) return null;
  const docs = store2.sync.listMeta();
  if (docs.length) {
    const body = store2.sync.loadBody(docs[0].id);
    if (body && body.elements.length) {
      return { els: cloneElements(body.elements), root: docs[0].name, id: docs[0].id };
    }
  }
  return null;
}
function useCanvasManager(deps) {
  const {
    open,
    result,
    elements,
    setElements,
    rootName,
    setRootName,
    currentId,
    setCurrent,
    currentIdRef,
    applySelection,
    commitHistory,
    setPast,
    setFuture,
    setCopyBuf,
    setEditing,
    setMenu,
    setTypeMenu,
    setZoom,
    setPan,
    setSnapLines,
    showToast,
    lastSavedInit
  } = deps;
  const storeRef = import_react7.default.useRef(null);
  const [docs, setDocs] = import_react7.default.useState([]);
  const [floatTab, setFloatTab] = import_react7.default.useState(null);
  const saveTimer = import_react7.default.useRef(null);
  const lastSavedRef = import_react7.default.useRef(lastSavedInit ? cloneElements(lastSavedInit) : null);
  const saveQueueRef = import_react7.default.useRef(Promise.resolve());
  const enqueueSave = import_react7.default.useCallback((task) => {
    const run = saveQueueRef.current.then(task);
    saveQueueRef.current = run.catch(() => {
    });
    return run;
  }, []);
  const docsReqRef = import_react7.default.useRef(0);
  const refreshDocs = import_react7.default.useCallback(async () => {
    const reqId = ++docsReqRef.current;
    try {
      const r = await storeRef.current.listMeta(LIST_PAGE);
      if (reqId !== docsReqRef.current) return;
      const items = r.items.slice().sort((a, b) => String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || "")));
      setDocs(items);
    } catch (e) {
    }
  }, []);
  const restoreLast = import_react7.default.useCallback(async () => {
    try {
      const s = storeRef.current;
      const r = await s.listMeta(LIST_PAGE);
      const latest = r.items.slice().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
      if (!latest) return;
      const body = await s.loadBody(latest.id);
      if (!body || !body.elements || !body.elements.length) return;
      if (currentIdRef.current !== null || lastSavedRef.current !== null) return;
      const els = cloneElements(body.elements);
      setElements(els);
      lastSavedRef.current = cloneElements(els);
      setRootName(latest.name || "\u753B\u5E03");
      setCurrent(latest.id);
      applySelection([]);
    } catch (e) {
    }
  }, [applySelection, setCurrent, setElements, setRootName]);
  const persistSnapshot = import_react7.default.useCallback(async (id, els, name) => {
    try {
      const s = storeRef.current;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const meta = await s.getMeta(id);
      await s.saveMeta({
        id,
        name,
        schemaVersion: 1,
        createdAt: meta ? meta.createdAt : now,
        updatedAt: now,
        elementCount: els.length,
        hasMedia: false
      });
      const set = {};
      for (const e of els) set[e.id] = e;
      const prev = await s.loadBody(id);
      const remove = prev && prev.elements ? prev.elements.filter((p) => !set[p.id]).map((p) => p.id) : [];
      const ok = await s.saveBody(id, { set, remove });
      if (!ok) showToast(t("toast.capacity"), "error");
      await refreshDocs();
    } catch (e) {
      showToast(t("toast.saveFailed"), "error");
    }
  }, [refreshDocs, showToast]);
  const flushSave = import_react7.default.useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const id = currentIdRef.current;
    if (!id || !result.jsonl) return Promise.resolve();
    if (lastSavedRef.current && JSON.stringify(lastSavedRef.current) === JSON.stringify(elements)) {
      return Promise.resolve();
    }
    const snap = cloneElements(elements);
    return enqueueSave(async () => {
      await persistSnapshot(id, snap, rootName);
      lastSavedRef.current = cloneElements(snap);
    });
  }, [result, elements, rootName, currentIdRef, enqueueSave, persistSnapshot]);
  import_react7.default.useEffect(() => {
    if (!open || !result.jsonl) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, AUTO_SAVE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  });
  import_react7.default.useEffect(() => {
    storeRef.current = defaultStore();
    refreshDocs();
    if (currentIdRef.current === null && lastSavedRef.current === null) restoreLast();
  }, []);
  import_react7.default.useEffect(() => {
    if (open) return;
    flushSave();
    setEditing(null);
    setMenu(null);
    setTypeMenu(false);
  }, [open]);
  const creatingRef = import_react7.default.useRef(false);
  const newCanvas = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    try {
      const oldId = currentIdRef.current || (result.jsonl ? genCanvasId() : null);
      if (oldId) {
        await enqueueSave(() => persistSnapshot(oldId, cloneElements(elements), rootName));
      }
      const id = genCanvasId();
      const fp = freshPage();
      await enqueueSave(() => persistSnapshot(id, fp, "\u753B\u5E03"));
      setCurrent(id);
      setElements(fp);
      lastSavedRef.current = cloneElements(fp);
      setRootName("\u753B\u5E03");
      applySelection([]);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setPast([]);
      setFuture([]);
      setCopyBuf(null);
      setSnapLines([]);
      setMenu(null);
      setTypeMenu(false);
      setEditing(null);
      setFloatTab(null);
    } finally {
      creatingRef.current = false;
    }
  };
  const loadCanvas = async (h) => {
    await flushSave();
    const body = await storeRef.current.loadBody(h.id);
    const els = body ? body.elements : [];
    setElements(cloneElements(els));
    lastSavedRef.current = cloneElements(els);
    setRootName(typeof h.name === "string" ? h.name : "\u753B\u5E03");
    setCurrent(h.id);
    applySelection([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const delCanvas = async (id) => {
    await enqueueSave(() => storeRef.current.remove(id));
    setDocs((d) => d.filter((x) => x.id !== id));
    if (currentIdRef.current === id) setCurrent(null);
  };
  const renameCanvas = async (id, name) => {
    await enqueueSave(async () => {
      const meta = await storeRef.current.getMeta(id);
      if (!meta) return;
      await storeRef.current.saveMeta(Object.assign({}, meta, { name, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }));
      await refreshDocs();
    });
    setDocs((d) => d.map((x) => x.id === id ? Object.assign({}, x, { name }) : x));
    if (currentIdRef.current === id) setRootName(name);
  };
  const clearAll = () => {
    if (!elements.length) return;
    commitHistory(cloneElements(elements));
    setElements(freshPage());
    applySelection([]);
  };
  const exportCanvas = async (id) => {
    const cf = await exportCanvasFile(storeRef.current, id);
    if (!cf) {
      showToast(t("toast.exportMissing"));
      return;
    }
    const blob = new Blob([JSON.stringify(cf, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (cf.name || "\u753B\u5E03") + ".dshwf.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
  const importCanvas = async (file) => {
    let text = "";
    try {
      text = await file.text();
    } catch (e) {
      showToast(t("toast.readFail"));
      return;
    }
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      showToast(t("toast.notJson"));
      return;
    }
    const r = await enqueueSave(() => importCanvasFile(storeRef.current, parsed));
    if (!r.ok) {
      showToast(r.reason);
      return;
    }
    showToast(t("toast.imported", { name: parsed.name || "\u672A\u547D\u540D" }), "info");
    await refreshDocs();
  };
  return {
    docs,
    setDocs,
    floatTab,
    setFloatTab,
    flushSave,
    refreshDocs,
    newCanvas,
    loadCanvas,
    delCanvas,
    renameCanvas,
    clearAll,
    exportCanvas,
    importCanvas
  };
}

// src/components/canvas/CanvasStage.js
var import_react11 = __toESM(require("react"), 1);

// src/components/canvas/NodeRenderer.js
var import_react8 = __toESM(require("react"), 1);
var el2 = import_react8.default.createElement;
function typeNameOf(elements, e) {
  if (e.kind === "note") return "\u5907\u6CE8";
  if (e.kind === "arrow") return "\u7BAD\u5934";
  if (e.kind === "text") return "\u6587\u672C";
  const et = effTypeOf(elements, e);
  return TYPE_LABEL[et] || et;
}
function NodeRenderer(props) {
  const { e, elements, selected, editing, onSelect, onStartEdit, onCtxMenu, onEditChange, onEditDone } = props;
  const renderNameTag = () => {
    const user = e.name && String(e.name).trim();
    const label = user || typeNameOf(elements, e);
    const editingName = editing && editing.id === e.id && editing.field === "name";
    if (!editingName && !label) return null;
    const w = Math.max(10 + label.length * 10, 40);
    return el2(
      "g",
      {
        className: "wf-el-name" + (user ? "" : " wf-el-name-auto"),
        transform: "translate(" + e.x + "," + e.y + ")",
        onDoubleClick: (ev) => {
          ev.stopPropagation();
          onStartEdit(e, "name");
        }
      },
      el2("rect", { x: 0, y: -15, width: w, height: 13, rx: 3 }),
      el2("text", { x: 4, y: -5.5 }, label)
    );
  };
  const renderInlineEdit = () => {
    if (!editing || editing.id !== e.id) return null;
    const isName = editing.field === "name";
    const x = isName ? e.x : e.x + 2;
    const y = isName ? e.y - 15 : e.y + (e.kind === "text" ? -2 : 2);
    const w = isName ? Math.min(Math.max(80, (editing.value.length || 2) * 12 + 24), 280) : Math.min(Math.max(80, e.w + 8), 320);
    return el2(
      "foreignObject",
      { x, y, width: w, height: 22 },
      el2(
        "div",
        { xmlns: "http://www.w3.org/1999/xhtml", className: "wf-inline-edit" },
        el2("input", {
          autoFocus: true,
          value: editing.value,
          placeholder: isName ? "\u8F93\u5165\u540D\u79F0" : "\u8F93\u5165\u6587\u672C",
          onMouseDown: (ev) => ev.stopPropagation(),
          onDoubleClick: (ev) => ev.stopPropagation(),
          onChange: (ev) => {
            const next = Object.assign({}, editing, { value: ev.target.value });
            onEditChange(next);
          },
          onBlur: onEditDone,
          onKeyDown: (ev) => {
            ev.stopPropagation();
            if (ev.key === "Enter") onEditDone();
            if (ev.key === "Escape") onEditDone();
          }
        })
      )
    );
  };
  const cls = (base) => base + (selected ? " wf-selected" : "");
  const ctxProps = {
    onContextMenu: (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      onCtxMenu(ev, e);
    }
  };
  const clickSel = { onClick: (ev) => {
    ev.stopPropagation();
    onSelect(e.id);
  } };
  if (e.kind === "arrow") {
    return el2(
      "g",
      { key: e.id },
      renderNameTag(),
      el2("line", {
        x1: e.x,
        y1: e.y,
        x2: e.x2,
        y2: e.y2,
        className: "wf-arrow" + (selected ? " wf-selected" : ""),
        ...ctxProps
      })
    );
  }
  if (e.kind === "text") {
    return el2(
      "g",
      { key: e.id },
      renderNameTag(),
      el2("text", {
        x: e.x + 4,
        y: e.y + 18,
        className: cls("wf-text-el"),
        ...clickSel,
        onDoubleClick: (ev) => {
          ev.stopPropagation();
          onStartEdit(e, "text");
        },
        ...ctxProps
      }, e.text),
      renderInlineEdit()
    );
  }
  if (e.kind === "note") {
    return el2(
      "g",
      { key: e.id },
      renderNameTag(),
      el2("rect", {
        x: e.x,
        y: e.y,
        width: e.w,
        height: e.h,
        rx: 6,
        className: cls("wf-note"),
        ...clickSel,
        onDoubleClick: (ev) => {
          ev.stopPropagation();
          onStartEdit(e, "text");
        },
        ...ctxProps
      }),
      el2("text", { x: e.x + 6, y: e.y + 18, className: "wf-note-text" }, e.text),
      renderInlineEdit()
    );
  }
  const et = effTypeOf(elements, e);
  const baseCls = "wf-rect wf-rect-" + et + (selected ? " wf-selected" : "");
  const clickProps = Object.assign({
    // 页面双击编辑名称（页面内容为空，文本无意义）；其余控件双击编辑文本
    onDoubleClick: (ev) => {
      ev.stopPropagation();
      onStartEdit(e, et === "page" ? "name" : "text");
    }
  }, clickSel, ctxProps);
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const kids = [renderNameTag()];
  const body = (rx) => el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx, className: baseCls, ...clickProps });
  const labelText = (x, y, text, extra) => el2("text", { x, y, className: "wf-rect-text" + (extra ? " " + extra : "") }, text);
  const labelC = (text, extra) => el2("text", { x: cx, y: cy + 4, className: "wf-rect-text wf-rect-text-center" + (extra ? " " + extra : "") }, text);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fitScale = (w, h, bw, bh) => Math.min(1, w / bw, h / bh);
  const SHAPES = {
    page: () => {
      kids.push(body(10));
    },
    button: () => {
      kids.push(body(8));
      if (e.text) kids.push(labelC(e.text));
    },
    input: () => {
      kids.push(body(4));
      kids.push(el2("line", { x1: e.x + 3, y1: e.y + e.h - 1.5, x2: e.x + e.w - 3, y2: e.y + e.h - 1.5, className: "wf-rect-underline" }));
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, "wf-rect-text-ph"));
    },
    textarea: () => {
      kids.push(body(4));
      if (e.text) kids.push(labelText(e.x + 6, e.y + 16, e.text, "wf-rect-text-ph"));
    },
    image: () => {
      kids.push(body(6));
      const s = fitScale(e.w, e.h, 52, 40);
      kids.push(el2(
        "g",
        { transform: "translate(" + (cx - 12 * s) + "," + (cy - 12 * s) + ") scale(" + s + ")" },
        el2("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2, className: "wf-rect-image-glyph" }),
        el2("circle", { cx: 9, cy: 9, r: 2, className: "wf-rect-image-glyph" }),
        el2("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", className: "wf-rect-image-glyph" })
      ));
    },
    video: () => {
      kids.push(body(6));
      const s = fitScale(e.w, e.h, 36, 28);
      const pw = 9 * s;
      const ph = 13 * s;
      kids.push(el2("path", {
        d: "M " + (cx - pw / 2) + " " + (cy - ph / 2) + " L " + (cx - pw / 2) + " " + (cy + ph / 2) + " L " + (cx + pw * 0.55) + " " + cy + " Z",
        className: "wf-rect-play"
      }));
    },
    audio: () => {
      kids.push(body(6));
      const s = fitScale(e.w, e.h, 46, 26);
      const sx = cx - 15 * s;
      kids.push(el2("path", {
        d: "M " + sx + " " + (cy - 5 * s) + " L " + (sx + 6 * s) + " " + (cy - 5 * s) + " L " + (sx + 12 * s) + " " + (cy - 9 * s) + " L " + (sx + 12 * s) + " " + (cy + 9 * s) + " L " + (sx + 6 * s) + " " + (cy + 5 * s) + " L " + sx + " " + (cy + 5 * s) + " Z",
        className: "wf-rect-audio-glyph"
      }));
      kids.push(el2("path", { d: "M " + (sx + 18 * s) + " " + (cy - 7 * s) + " A " + 9 * s + " " + 9 * s + " 0 0 1 " + (sx + 18 * s) + " " + (cy + 7 * s), className: "wf-rect-audio-wave" }));
      kids.push(el2("path", { d: "M " + (sx + 25 * s) + " " + (cy - 10 * s) + " A " + 14 * s + " " + 14 * s + " 0 0 1 " + (sx + 25 * s) + " " + (cy + 10 * s), className: "wf-rect-audio-wave" }));
    },
    icon: () => {
      kids.push(body(6));
      const s = fitScale(e.w, e.h, 24, 24);
      const g = 8.5 * s;
      kids.push(el2("path", {
        d: "M " + cx + " " + (cy - g) + " C " + (cx + g * 0.18) + " " + (cy - g * 0.22) + " " + (cx + g * 0.22) + " " + (cy - g * 0.18) + " " + (cx + g) + " " + cy + " C " + (cx + g * 0.22) + " " + (cy + g * 0.18) + " " + (cx + g * 0.18) + " " + (cy + g * 0.22) + " " + cx + " " + (cy + g) + " C " + (cx - g * 0.18) + " " + (cy + g * 0.22) + " " + (cx - g * 0.22) + " " + (cy + g * 0.18) + " " + (cx - g) + " " + cy + " C " + (cx - g * 0.22) + " " + (cy - g * 0.18) + " " + (cx - g * 0.18) + " " + (cy - g * 0.22) + " " + cx + " " + (cy - g) + " Z",
        className: "wf-rect-icon-glyph"
      }));
    },
    link: () => {
      if (e.text) {
        kids.push(el2("text", { x: e.x + 6, y: e.y + 18, className: "wf-rect-link-text", ...clickProps }, e.text));
        kids.push(el2("line", { x1: e.x + 6, y1: e.y + 21, x2: e.x + Math.min(e.w - 6, 6 + String(e.text).length * 12), y2: e.y + 21, className: "wf-rect-link-line" }));
      } else {
        kids.push(el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: "wf-rect wf-rect-ghost" + (selected ? " wf-selected" : ""), ...clickProps }));
        const s = fitScale(e.w, e.h, 44, 24);
        kids.push(el2(
          "g",
          { transform: "translate(" + (cx - 12 * s) + "," + (cy - 12 * s) + ") scale(" + s + ")" },
          el2("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", className: "wf-rect-link-glyph" }),
          el2("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", className: "wf-rect-link-glyph" })
        ));
      }
    },
    select: () => {
      kids.push(body(4));
      kids.push(el2("path", { d: "M " + (e.x + e.w - 16) + " " + (cy - 2) + " l 4.5 4.5 l 4.5 -4.5", className: "wf-rect-select-chev" }));
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text, "wf-rect-text-ph"));
    },
    checkbox: () => {
      kids.push(el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: "wf-rect wf-rect-ghost" + (selected ? " wf-selected" : ""), ...clickProps }));
      const bs = clamp(Math.min(18, e.h - 8), 12, 18);
      const bx = e.x + 4;
      const by = cy - bs / 2;
      kids.push(el2("rect", { x: bx, y: by, width: bs, height: bs, rx: 4, className: "wf-rect-box" }));
      if (e.checked) {
        kids.push(el2("path", {
          d: "M " + (bx + bs * 0.24) + " " + (by + bs * 0.52) + " l " + bs * 0.2 + " " + bs * 0.2 + " l " + bs * 0.38 + " -" + bs * 0.44,
          className: "wf-rect-box-check"
        }));
      }
      if (e.text) kids.push(labelText(bx + bs + 8, cy + 4, e.text));
    },
    radio: () => {
      kids.push(el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: "wf-rect wf-rect-ghost" + (selected ? " wf-selected" : ""), ...clickProps }));
      const r = clamp(Math.min(9, e.h / 2 - 2), 6, 9);
      const rcx = e.x + 13;
      kids.push(el2("circle", { cx: rcx, cy, r, className: "wf-rect-circle" }));
      if (e.checked) kids.push(el2("circle", { cx: rcx, cy, r: r * 0.42, className: "wf-rect-circle-dot" }));
      if (e.text) kids.push(labelText(rcx + r + 7, cy + 4, e.text));
    },
    switch: () => {
      kids.push(el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx: 6, className: "wf-rect wf-rect-ghost" + (selected ? " wf-selected" : ""), ...clickProps }));
      const th = clamp(Math.min(16, e.h - 8), 10, 16);
      const tw = clamp(Math.min(34, e.w - 8), 16, 34);
      const tx = e.x + 4;
      const ty = cy - th / 2;
      const on = !!e.checked;
      kids.push(el2("rect", { x: tx, y: ty, width: tw, height: th, rx: th / 2, className: "wf-rect-switch" + (on ? " wf-rect-switch-on" : "") }));
      const kr = Math.max(3.5, th / 2 - 2.5);
      const kx = on ? tx + tw - kr - 2.5 : tx + kr + 2.5;
      kids.push(el2("circle", { cx: kx, cy, r: kr, className: "wf-rect-switch-knob" }));
      if (e.text) kids.push(labelText(tx + tw + 10, cy + 4, e.text));
    },
    progress: () => {
      const th = clamp(Math.min(10, e.h * 0.5), 4, 10);
      const ty = cy - th / 2;
      kids.push(el2("rect", { x: e.x, y: ty, width: e.w, height: th, rx: th / 2, className: "wf-rect-progress-bg", ...clickProps }));
      kids.push(el2("rect", { x: e.x, y: ty, width: Math.max(th, e.w * 0.6), height: th, rx: th / 2, className: "wf-rect-progress-fill" }));
    },
    divider: () => {
      const cap = clamp(Math.min(4, e.h * 0.4), 2, 4);
      kids.push(el2("line", { x1: e.x, y1: cy, x2: e.x + e.w, y2: cy, className: "wf-rect-divider", ...clickProps }));
      kids.push(el2("line", { x1: e.x, y1: cy - cap, x2: e.x, y2: cy + cap, className: "wf-rect-divider-cap" }));
      kids.push(el2("line", { x1: e.x + e.w, y1: cy - cap, x2: e.x + e.w, y2: cy + cap, className: "wf-rect-divider-cap" }));
    },
    badge: () => {
      kids.push(body(Math.max(6, e.h / 2)));
      if (e.text) kids.push(labelC(e.text));
    },
    text: () => {
      kids.push(el2("rect", { x: e.x, y: e.y, width: e.w, height: e.h, rx: 4, className: "wf-rect wf-rect-ghost" + (selected ? " wf-selected" : ""), ...clickProps }));
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text));
    },
    container: () => {
      kids.push(body(6));
      if (e.text) kids.push(labelText(e.x + 6, e.y + 18, e.text));
    }
  };
  const shape = SHAPES[et] || SHAPES.container;
  shape();
  if (selected) {
    kids.push(el2("rect", { x: e.x + e.w - 9, y: e.y + e.h - 9, width: 10, height: 10, rx: 2, className: "wf-handle" }));
  }
  kids.push(renderInlineEdit());
  return el2("g", { key: e.id }, kids);
}

// src/components/canvas/SelectionOverlay.js
var import_react9 = __toESM(require("react"), 1);
var el3 = import_react9.default.createElement;
function SelectionOverlay({ selectedIds, elements, groupBounds: groupBounds2 }) {
  if (selectedIds.length <= 1 || !groupBounds2) return null;
  const corners = [
    [groupBounds2.x, groupBounds2.y],
    [groupBounds2.x + groupBounds2.w, groupBounds2.y],
    [groupBounds2.x, groupBounds2.y + groupBounds2.h],
    [groupBounds2.x + groupBounds2.w, groupBounds2.y + groupBounds2.h]
  ];
  return el3(
    "g",
    { className: "wf-group" },
    el3("rect", { x: groupBounds2.x - 3, y: groupBounds2.y - 3, width: groupBounds2.w + 6, height: groupBounds2.h + 6, className: "wf-group-box" }),
    corners.map((p, i) => el3("rect", { key: i, x: p[0] - 4, y: p[1] - 4, width: 8, height: 8, rx: 2, className: "wf-group-handle" }))
  );
}

// src/components/canvas/SnapLines.js
var import_react10 = __toESM(require("react"), 1);
var el4 = import_react10.default.createElement;
function SnapLines({ lines, pan, vw, vh }) {
  if (!lines || !lines.length) return null;
  return lines.map((ln, i) => ln.axis === "v" ? el4("line", { key: "snap" + i, x1: ln.pos, y1: pan.y - 4e3, x2: ln.pos, y2: pan.y + vh + 4e3, className: "wf-snap" }) : el4("line", { key: "snap" + i, x1: pan.x - 4e3, y1: ln.pos, x2: pan.x + vw + 4e3, y2: ln.pos, className: "wf-snap" }));
}

// src/components/canvas/CanvasStage.js
var el5 = import_react11.default.createElement;
function CanvasStage(props) {
  const {
    elements,
    selectedId,
    editing,
    mode,
    zoom,
    pan,
    spaceDown,
    drag,
    svgRef,
    viewRef,
    canvasCursor,
    snapLines,
    selectedIds,
    groupBounds: groupBounds2,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onCloseMenu,
    onSelect,
    onStartEdit,
    onCtxMenu,
    onEditChange,
    onEditDone
  } = props;
  const vw = CANVAS_W / zoom;
  const vh = CANVAS_H / zoom;
  const orderedElements = elements.slice().sort((a, b) => (a.type === "page" ? 0 : 1) - (b.type === "page" ? 0 : 1));
  const spaceCls = spaceDown ? drag && drag.mode === "pan" ? " wf-canvas-pan" : " wf-canvas-space" : "";
  return el5(
    "div",
    { className: "wf-canvas-view", ref: viewRef },
    el5(
      "svg",
      {
        ref: svgRef,
        className: "wf-canvas" + (mode === "draw" ? " wf-canvas-draw" : "") + spaceCls,
        viewBox: pan.x + " " + pan.y + " " + vw + " " + vh,
        preserveAspectRatio: "xMidYMid meet",
        style: { cursor: canvasCursor },
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        onContextMenu: (ev) => {
          ev.preventDefault();
          onCloseMenu();
        }
      },
      el5("rect", { x: pan.x - 2e3, y: pan.y - 2e3, width: vw + 4e3, height: vh + 4e3, className: "wf-canvas-bg" }),
      orderedElements.map((e) => el5(NodeRenderer, {
        key: e.id,
        e,
        elements,
        selected: e.id === selectedId,
        editing,
        onSelect,
        onStartEdit,
        onCtxMenu,
        onEditChange,
        onEditDone
      })),
      el5(SnapLines, { lines: snapLines, pan, vw, vh }),
      // 框选矩形（marquee）
      drag && drag.mode === "marquee" && drag.mq && drag.mq.w > 0 && drag.mq.h > 0 ? el5("rect", { x: drag.mq.x, y: drag.mq.y, width: drag.mq.w, height: drag.mq.h, className: "wf-marquee" }) : null,
      el5(SelectionOverlay, { selectedIds, elements, groupBounds: groupBounds2 })
    )
  );
}

// src/components/canvas/CanvasOverlay.js
var import_react14 = __toESM(require("react"), 1);

// src/components/preview/JsonView.js
var import_react12 = __toESM(require("react"), 1);

// src/core/jsonl/prettify.js
function formatJson(jsonl) {
  if (!jsonl) return "";
  const lines = String(jsonl).split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "";
  return lines.map((line) => {
    try {
      return JSON.stringify(JSON.parse(line), null, 2);
    } catch (e) {
      return line;
    }
  }).join("\n\n");
}
var WS = /* @__PURE__ */ new Set([" ", "\n", "	", "\r"]);
var isDigit = (c) => c >= "0" && c <= "9";
var isWord = (c) => c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
function tokenizeJson(text) {
  const out = [];
  const n = text.length;
  let i = 0;
  const push = (t2, c) => {
    if (t2) out.push({ t: t2, c: c || "" });
  };
  while (i < n) {
    const ch = text[i];
    if (ch === '"') {
      let j = i + 1;
      let esc = false;
      while (j < n) {
        const c2 = text[j];
        if (c2 === "\\" && !esc) {
          esc = true;
          j++;
          continue;
        }
        if (c2 === '"' && !esc) {
          j++;
          break;
        }
        esc = false;
        j++;
      }
      const str = text.slice(i, j);
      i = j;
      let k = i;
      while (k < n && WS.has(text[k])) k++;
      push(str, text[k] === ":" ? "key" : "str");
    } else if (isDigit(ch) || ch === "-" && i + 1 < n && isDigit(text[i + 1])) {
      let j = i + 1;
      while (j < n && /[0-9.eE+\-]/.test(text[j])) j++;
      push(text.slice(i, j), "num");
      i = j;
    } else if (isWord(ch)) {
      let j = i;
      while (j < n && isWord(text[j])) j++;
      const word = text.slice(i, j);
      push(word, word === "true" || word === "false" || word === "null" ? "lit" : "");
      i = j;
    } else if (ch === "{" || ch === "}" || ch === "[" || ch === "]" || ch === ":" || ch === ",") {
      push(ch, "punc");
      i++;
    } else {
      let j = i;
      while (j < n) {
        const c2 = text[j];
        if (c2 === '"' || isDigit(c2) || isWord(c2) || c2 === "{" || c2 === "}" || c2 === "[" || c2 === "]" || c2 === ":" || c2 === "," || c2 === "-" && j + 1 < n && isDigit(text[j + 1])) break;
        j++;
      }
      push(text.slice(i, j), "");
      i = j;
    }
  }
  return out;
}

// src/components/preview/JsonView.js
var el6 = import_react12.default.createElement;
function JsonView({ text, className }) {
  if (!text) return el6("div", { className: "wf-empty" }, "\uFF08\u753B\u5E03\u4E3A\u7A7A\uFF09");
  const formatted = formatJson(text);
  const tokens = tokenizeJson(formatted);
  return el6(
    "pre",
    { className: className || "wf-jsonl" },
    tokens.map((tok, i) => tok.c ? el6("span", { key: i, className: "wf-j-" + tok.c }, tok.t) : tok.t)
  );
}

// src/components/preview/SemanticPreview.js
var import_react13 = __toESM(require("react"), 1);
var el7 = import_react13.default.createElement;
function renderNode(node, key) {
  const name = node.name || "";
  const text = node.props && node.props.text || "";
  const title = node.description || name;
  switch (node.type) {
    case "page":
      return el7(
        "div",
        {
          key,
          className: "wf-pv-page",
          style: {
            flexDirection: node.direction === "horizontal" ? "row" : "column",
            flexWrap: node.wrap ? "wrap" : "nowrap"
          },
          title
        },
        (node.children || []).map((c, i) => renderNode(c, i)),
        el7("span", { className: "wf-pv-tag" }, name || "\u9875\u9762")
      );
    case "container":
      return el7(
        "div",
        {
          key,
          className: "wf-pv-container",
          style: {
            flexDirection: node.direction === "horizontal" ? "row" : "column",
            flexWrap: node.wrap ? "wrap" : "nowrap"
          },
          title
        },
        (node.children || []).map((c, i) => renderNode(c, i)),
        el7("span", { className: "wf-pv-tag" }, name || "\u5BB9\u5668")
      );
    case "text":
      return el7("div", { key, className: "wf-pv-text", title }, text || name);
    case "button":
      return el7("button", { key, className: "wf-pv-button", title, disabled: true }, text || "\u6309\u94AE");
    case "input":
      return el7("input", {
        key,
        className: "wf-pv-input",
        title,
        placeholder: node.props && node.props.placeholder || "",
        readOnly: true
      });
    case "textarea":
      return el7("textarea", {
        key,
        className: "wf-pv-textarea",
        title,
        placeholder: node.props && node.props.placeholder || "",
        rows: node.props && node.props.rows || 3,
        readOnly: true
      });
    case "image":
      return el7("div", { key, className: "wf-pv-image wf-pv-ph", title }, "\u56FE\u7247");
    case "video":
      return el7(
        "div",
        { key, className: "wf-pv-media wf-pv-video", title },
        el7("span", { className: "wf-pv-media-play" }, "\u25B6"),
        "\u89C6\u9891"
      );
    case "audio":
      return el7("div", { key, className: "wf-pv-media wf-pv-audio", title }, "\u266A \u97F3\u9891");
    case "icon":
      return el7("span", { key, className: "wf-pv-icon", title }, "\u2726");
    case "link":
      return el7("a", { key, className: "wf-pv-link", title }, text || "\u94FE\u63A5");
    case "select":
      return el7(
        "span",
        { key, className: "wf-pv-select", title },
        el7("span", { className: "wf-pv-select-text" }, text || "\u8BF7\u9009\u62E9"),
        el7("span", { className: "wf-pv-select-arrow" }, "\u25BE")
      );
    case "checkbox":
      return el7(
        "span",
        { key, className: "wf-pv-check", title },
        el7("span", { className: "wf-pv-box" }, "\u2713"),
        text || name
      );
    case "radio":
      return el7(
        "span",
        { key, className: "wf-pv-check", title },
        el7("span", { className: "wf-pv-radio" }),
        text || name
      );
    case "switch":
      return el7(
        "span",
        { key, className: "wf-pv-check", title },
        el7("span", { className: "wf-pv-switch" }),
        text || name
      );
    case "progress":
      return el7(
        "div",
        { key, className: "wf-pv-progress", title },
        el7("div", { className: "wf-pv-progress-fill", style: { width: "60%" } })
      );
    case "divider":
      return el7("div", { key, className: "wf-pv-divider" });
    case "badge":
      return el7("span", { key, className: "wf-pv-badge", title }, text || "badge");
    default:
      return el7(
        "div",
        { key, className: "wf-pv-other", title },
        node.type + (text ? "\uFF1A" + text : "") + (name && name !== text ? "\uFF08" + name + "\uFF09" : "")
      );
  }
}
function SemanticPreview({ tree }) {
  const list = Array.isArray(tree) ? tree : tree ? [tree] : [];
  if (!list.length) return el7("div", { className: "wf-pv-root" }, null);
  return el7(
    "div",
    { className: "wf-pv-root" },
    list.map((t2, i) => renderNode(t2, "root" + i))
  );
}

// src/components/canvas/CanvasOverlay.js
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
var el8 = import_react14.default.createElement;
function CanvasOverlay(props) {
  const {
    mode,
    onToggleMode,
    floatTab,
    onFloatTab,
    zoom,
    pan,
    onZoomReset,
    result,
    onCloseFloat,
    canUndo,
    canRedo,
    canClear,
    onUndo,
    onRedo,
    onClear,
    panelOpen,
    onTogglePanel
  } = props;
  const [pvIdx, setPvIdx] = import_react14.default.useState(0);
  const [copied, setCopied] = import_react14.default.useState(false);
  const copyTimer = import_react14.default.useRef(null);
  const [clearArm, setClearArm] = import_react14.default.useState(false);
  const clearTimer = import_react14.default.useRef(null);
  const pages = Array.isArray(result.tree) ? result.tree : result.tree ? [result.tree] : [];
  const safeIdx = Math.min(pvIdx, Math.max(0, pages.length - 1));
  const zoomPct = Math.round(zoom * 100);
  const atDefault = zoom === 1 && pan.x === 0 && pan.y === 0;
  const armClear = () => {
    setClearArm(true);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setClearArm(false), 2500);
  };
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildInsertText(result.jsonl));
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch (e) {
    }
  };
  import_react14.default.useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    if (clearTimer.current) clearTimeout(clearTimer.current);
  }, []);
  return el8(
    "div",
    { className: "wf-canvas-overlay" },
    el8(
      "div",
      {
        className: "wf-mode-badge" + (mode === "draw" ? " wf-mode-badge-draw" : ""),
        title: "\u70B9\u51FB\u5207\u6362\u6A21\u5F0F\uFF1B\u957F\u6309 Alt \u4E34\u65F6\u8FDB\u5165\u7ED8\u5236\u6A21\u5F0F\uFF0C\u677E\u5F00\u6062\u590D\u9009\u62E9",
        onClick: onToggleMode
      },
      mode === "select" ? "\u9009\u62E9\u6A21\u5F0F" : "\u7ED8\u5236\u6A21\u5F0F",
      el8("kbd", { className: "wf-mode-key" }, "Alt")
    ),
    // 右上角工具行：JSONL · 预览 · 设置（右侧面板显示/隐藏开关）
    el8(
      "div",
      { className: "wf-canvas-tools" },
      el8("button", {
        type: "button",
        className: "wf-ctool" + (floatTab === "jsonl" ? " wf-ctool-on" : ""),
        title: "\u67E5\u770B\u751F\u6210\u7684 JSONL",
        onClick: () => onFloatTab(floatTab === "jsonl" ? null : "jsonl")
      }, el8(import_dsh_client_ui_primitives2.IconCodeOutline16, { size: 14 }), "JSONL"),
      el8("button", {
        type: "button",
        className: "wf-ctool" + (floatTab === "preview" ? " wf-ctool-on" : ""),
        title: "\u67E5\u770B\u8BED\u4E49\u9884\u89C8",
        onClick: () => onFloatTab(floatTab === "preview" ? null : "preview")
      }, el8(import_dsh_client_ui_primitives2.IconChecklistOutline14, { size: 14 }), "\u9884\u89C8"),
      el8(
        "button",
        {
          type: "button",
          className: "wf-ctool" + (panelOpen ? " wf-ctool-on" : ""),
          title: panelOpen ? "\u9690\u85CF\u53F3\u4FA7\u9762\u677F" : "\u663E\u793A\u53F3\u4FA7\u9762\u677F",
          onClick: onTogglePanel
        },
        el8(import_dsh_client_ui_primitives2.IconSettingsOutline16, { size: 14 }),
        "\u8BBE\u7F6E"
      )
    ),
    // 右下角：撤销/重做/清空（不可用即隐藏）+ 缩放
    el8(
      "div",
      { className: "wf-canvas-actions" },
      el8(
        "div",
        { className: "wf-action-group" },
        canUndo ? el8("button", {
          type: "button",
          className: "wf-iaction wf-iaction-undo",
          title: "\u64A4\u9500 (Ctrl+Z)",
          onClick: onUndo
        }, el8(import_dsh_client_ui_primitives2.IconRefreshOutline16, { size: 13 })) : null,
        canRedo ? el8("button", {
          type: "button",
          className: "wf-iaction",
          title: "\u91CD\u505A (Ctrl+Shift+Z)",
          onClick: onRedo
        }, el8(import_dsh_client_ui_primitives2.IconRefreshOutline16, { size: 13 })) : null,
        canClear ? clearArm ? el8("button", {
          type: "button",
          className: "wf-iaction wf-iaction-danger wf-iaction-wide",
          title: "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u6E05\u7A7A",
          onClick: () => {
            setClearArm(false);
            onClear();
          }
        }, "\u786E\u8BA4\u6E05\u7A7A") : el8("button", {
          type: "button",
          className: "wf-iaction",
          title: "\u6E05\u7A7A\u753B\u5E03",
          onClick: armClear
        }, el8(import_dsh_client_ui_primitives2.IconTrashOutline16, { size: 13 })) : null
      ),
      el8(
        "div",
        { className: "wf-zoom-bar" },
        // 点击缩放百分比本身恢复 100%（非默认时可点，样式提示可点击）
        el8("button", {
          type: "button",
          className: "wf-zoom-pct" + (atDefault ? "" : " wf-zoom-pct-click"),
          title: atDefault ? "100%" : "\u70B9\u51FB\u6062\u590D 100%",
          disabled: atDefault,
          onClick: onZoomReset
        }, zoomPct + "%")
      )
    ),
    floatTab ? el8(
      "div",
      { className: "wf-float-panel" },
      el8(
        "div",
        { className: "wf-float-head" },
        el8("span", null, floatTab === "jsonl" ? "JSONL \u8F93\u51FA" : "\u8BED\u4E49\u9884\u89C8"),
        el8("span", { className: "wf-spacer" }),
        floatTab === "jsonl" ? el8(
          "button",
          {
            type: "button",
            className: "wf-float-copy" + (copied ? " wf-float-copy-ok" : ""),
            title: "\u590D\u5236\u5B8C\u6574\u63D0\u793A\u8BCD\uFF08\u6807\u51C6\u8BF4\u660E + JSONL\uFF09\uFF0C\u53EF\u7C98\u8D34\u5230\u5176\u4ED6\u5DE5\u5177\u4F7F\u7528",
            onClick: copyPrompt
          },
          el8(import_dsh_client_ui_primitives2.IconCopyOutline16, { size: 13 }),
          copied ? "\u5DF2\u590D\u5236" : "\u590D\u5236"
        ) : null,
        el8(
          "button",
          { type: "button", className: "wf-float-close", title: "\u5173\u95ED", onClick: onCloseFloat },
          el8(import_dsh_client_ui_primitives2.IconCloseOutline16, { size: 14 })
        )
      ),
      floatTab === "jsonl" ? el8(JsonView, { text: result.jsonl }) : el8(
        "div",
        { className: "wf-float-preview" },
        pages.length > 1 ? el8(
          "div",
          { className: "wf-float-pages" },
          el8(
            "select",
            {
              className: "wf-float-select",
              value: String(safeIdx),
              onChange: (ev) => setPvIdx(Number(ev.target.value))
            },
            pages.map((t2, i) => el8("option", { key: i, value: String(i) }, t2.name || "\u9875\u9762" + (i + 1)))
          )
        ) : null,
        el8(
          "div",
          { className: "wf-preview" },
          pages.length ? el8(SemanticPreview, { tree: pages[safeIdx] }) : el8("div", { className: "wf-empty" }, "\uFF08\u753B\u5E03\u4E3A\u7A7A\uFF09")
        )
      )
    ) : null
  );
}

// src/components/RightPanel.js
var import_react18 = __toESM(require("react"), 1);

// src/components/inspector/InspectorPanel.js
var import_react16 = __toESM(require("react"), 1);

// src/components/inspector/PropField.js
var import_react15 = __toESM(require("react"), 1);
var el9 = import_react15.default.createElement;
function fieldRow(label, hint, control) {
  return el9(
    "div",
    { className: "wf-field-row" },
    el9(
      "div",
      { className: "wf-field-head" },
      el9("span", { className: "wf-field-label" }, label),
      hint ? el9("span", { className: "wf-field-hint" }, hint) : null
    ),
    control
  );
}
function renderPropControl(def, value, onChange, extra) {
  const ex = extra || {};
  const t2 = ex.inputType || def.type;
  const cls = "wf-field-input";
  if (t2 === "boolean") {
    const on = !!value;
    return el9(
      "label",
      { className: "wf-insp-check" },
      el9("input", { type: "checkbox", checked: on, onChange: (ev) => onChange(ev.target.checked) }),
      on ? ex.trueLabel || "\u5DF2\u9009\u4E2D" : ex.falseLabel || "\u672A\u9009\u4E2D"
    );
  }
  if (t2 === "number") {
    return el9("input", {
      className: cls,
      type: "number",
      min: 0,
      value: value || "",
      placeholder: ex.placeholder || "",
      onChange: (ev) => onChange(ev.target.value)
    });
  }
  if (t2 === "enum") {
    const values = def.values || [];
    return el9(
      "select",
      {
        className: cls,
        value: value || "",
        onChange: (ev) => onChange(ev.target.value)
      },
      value ? null : el9("option", { value: "" }, ex.placeholder || "\u9ED8\u8BA4"),
      values.map((v) => el9("option", { value: v, key: v }, v))
    );
  }
  return el9("input", {
    className: cls,
    value: value || "",
    placeholder: ex.placeholder || "",
    onChange: (ev) => onChange(ev.target.value)
  });
}

// src/components/inspector/InspectorPanel.js
var el10 = import_react16.default.createElement;
var FIELD_DEFS = {
  action: { label: "\u52A8\u4F5C", hint: "\u4F5C\u4E3A props.action\uFF08\u70B9\u51FB\u540E\u7684\u884C\u4E3A\uFF09", elKey: "action", defKey: "action", placeholder: "\u5982\uFF1A\u63D0\u4EA4\u8868\u5355\u5E76\u8DF3\u8F6C\u9996\u9875" },
  inputType: { label: "\u8F93\u5165\u7C7B\u578B", hint: "\u4F5C\u4E3A props.inputType", elKey: "inputType", defKey: "inputType", placeholder: "\u6587\u672C\uFF08\u9ED8\u8BA4\uFF09" },
  options: { label: "\u9009\u9879", hint: "\u4F5C\u4E3A props.options", elKey: "optionsText", defKey: "options", placeholder: "\u7528\u9017\u53F7\u5206\u9694\uFF0C\u5982\uFF1A\u5F85\u4ED8\u6B3E, \u5DF2\u4ED8\u6B3E, \u5DF2\u5173\u95ED" },
  checked: { label: "\u9ED8\u8BA4\u9009\u4E2D", hint: "\u4F5C\u4E3A props.checked", elKey: "checked", defKey: "checked", trueLabel: "\u5DF2\u9009\u4E2D", falseLabel: "\u672A\u9009\u4E2D" }
};
var renderField = (sel, onPatch, key) => {
  const f = FIELD_DEFS[key];
  if (!f) return null;
  const def = PROPS_BY_KEY[f.defKey];
  return fieldRow(f.label, f.hint, renderPropControl(def, sel[f.elKey], (v) => onPatch({ [f.elKey]: v }), {
    inputType: f.inputType,
    placeholder: f.placeholder,
    trueLabel: f.trueLabel,
    falseLabel: f.falseLabel
  }));
};
var TEXT_FIELD_BY_KEY = {
  text: { label: "\u663E\u793A\u6587\u672C", hint: "\u4F5C\u4E3A props.text\uFF1B\u53CC\u51FB\u753B\u5E03\u53EF\u7F16\u8F91", placeholder: null },
  placeholder: { label: "\u5360\u4F4D\u63D0\u793A", hint: "\u4F5C\u4E3A props.placeholder\uFF1B\u53CC\u51FB\u753B\u5E03\u53EF\u7F16\u8F91", placeholder: "\u5982\uFF1A\u8BF7\u8F93\u5165\u7528\u6237\u540D" }
};
var renderTextField = (sel, onPatch, selHasKids) => {
  if (sel.kind === "note") {
    return fieldRow(
      "\u5907\u6CE8\u5185\u5BB9",
      null,
      el10("input", { className: "wf-field-input", value: sel.text || "", onChange: (ev) => onPatch({ text: ev.target.value }) })
    );
  }
  if (sel.kind === "text") {
    return fieldRow(
      "\u663E\u793A\u6587\u672C",
      "\u4F5C\u4E3A props.text\uFF1B\u53CC\u51FB\u753B\u5E03\u53EF\u7F16\u8F91",
      el10("input", { className: "wf-field-input", value: sel.text || "", onChange: (ev) => onPatch({ text: ev.target.value }) })
    );
  }
  const effType = sel.type || (selHasKids ? "container" : inferType(sel) || "container");
  const def = TYPE_BY_TYPE[effType];
  if (!def) return null;
  const textKey = def.propsSchema.map((k) => typeof k === "string" ? k : k.key).find((k) => TEXT_FIELD_BY_KEY[k]);
  if (!textKey) return null;
  const override = def.propsSchema.find((k) => typeof k === "object" && k.key === textKey);
  const t2 = Object.assign({}, TEXT_FIELD_BY_KEY[textKey], override && override.label ? { label: override.label } : null);
  return fieldRow(
    t2.label,
    t2.hint,
    el10("input", {
      className: "wf-field-input",
      value: sel.text || "",
      placeholder: t2.placeholder,
      onChange: (ev) => onPatch({ text: ev.target.value })
    })
  );
};
function InspectorPanel(props) {
  const { sel, selCount, selHasKids, selIsNested, selTypeOptions, selTypeLabel, onPatch, onRemove } = props;
  const head = el10(
    "div",
    { className: "wf-panel-head" },
    el10("span", { className: "wf-panel-title" }, "\u63A7\u4EF6\u8BBE\u7F6E")
  );
  const body = !sel ? el10(
    "div",
    { className: "wf-insp wf-insp-empty" },
    selCount > 1 ? "\u5DF2\u9009\u4E2D " + selCount + " \u4E2A\u5143\u7D20\n\u62D6\u52A8\u53EF\u6574\u4F53\u79FB\u52A8\n\u62D6\u52A8\u5916\u6846\u89D2\u53EF\u7B49\u6BD4\u7F29\u653E" : "\u5728\u753B\u5E03\u4E2D\u9009\u62E9\u4E00\u4E2A\u63A7\u4EF6\n\u5C5E\u6027\u4F1A\u663E\u793A\u5728\u8FD9\u91CC"
  ) : el10(
    "div",
    { className: "wf-insp" },
    fieldRow(
      "\u540D\u79F0",
      "\u53CC\u51FB\u753B\u5E03\u540D\u5B57\u53EF\u76F4\u63A5\u7F16\u8F91",
      el10("input", {
        className: "wf-field-input",
        value: sel.name || "",
        placeholder: "\u7559\u7A7A\u4E0D\u8F93\u51FA",
        onChange: (ev) => onPatch({ name: ev.target.value })
      })
    ),
    // 类型选择（限制：页面锁定 / 被包含不可设页面 / 有子不可设非容器；选项由 selTypeOptions 给出）
    sel.kind === "rect" && sel.type !== "page" && selTypeOptions.length > 1 || sel.kind === "note" && selTypeOptions.length > 1 ? fieldRow(
      "\u7C7B\u578B",
      (selIsNested ? "\u88AB\u5BB9\u5668\u5305\u542B\uFF0C\u4E0D\u53EF\u8BBE\u4E3A\u9875\u9762" : null) || (selHasKids ? "\u542B\u5B50\u5143\u7D20\uFF0C\u4EC5\u53EF\u4E3A\u5BB9\u5668" : null) || (sel.type ? null : "\u81EA\u52A8\u63A8\u65AD\u4E3A\u300C" + (selTypeLabel || "?") + "\u300D"),
      el10(
        "select",
        {
          className: "wf-field-input",
          value: sel.type || "auto",
          onChange: (ev) => onPatch({ type: ev.target.value === "auto" ? null : ev.target.value })
        },
        sel.type == null ? el10("option", { value: "auto" }, "\u81EA\u52A8\u63A8\u65AD\uFF08" + (selTypeLabel || "?") + "\uFF09") : null,
        selTypeOptions.map((t2) => el10("option", { value: t2, key: t2 }, TYPE_LABEL[t2] || t2))
      )
    ) : null,
    renderTextField(sel, onPatch, selHasKids),
    fieldRow(
      "\u8981\u6C42\u8BF4\u660E",
      "\u4F5C\u4E3A description\uFF0C\u968F JSONL \u53D1\u7ED9\u6A21\u578B",
      el10("input", {
        className: "wf-field-input",
        value: sel.note || "",
        placeholder: "\u5BF9\u5143\u7D20\u7684\u8981\u6C42\u3001\u4E1A\u52A1\u542B\u4E49\u2026",
        onChange: (ev) => onPatch({ note: ev.target.value })
      })
    ),
    // 注册表 fields（types.js）：仅列该类型真实消费的 props 字段
    sel.kind === "rect" && sel.type && TYPE_BY_TYPE[sel.type] ? TYPE_BY_TYPE[sel.type].fields.map((k) => renderField(sel, onPatch, k)) : null,
    selHasKids ? el10(
      "div",
      { className: "wf-field-row" },
      el10(
        "div",
        { className: "wf-field-head" },
        el10("span", { className: "wf-field-label" }, "\u6392\u5217\u65B9\u5411"),
        el10("span", { className: "wf-field-hint" }, "\u4F5C\u4E3A direction\uFF1B\u81EA\u52A8=\u6309\u5B50\u5143\u7D20\u5206\u5E03\u63A8\u65AD")
      ),
      el10(
        "div",
        { className: "wf-insp-row" },
        el10("button", {
          type: "button",
          className: "wf-mini-btn" + (sel.direction == null ? " wf-on" : ""),
          title: "\u6309\u5B50\u5143\u7D20\u5206\u5E03\u81EA\u52A8\u63A8\u65AD",
          onClick: () => onPatch({ direction: null })
        }, "\u81EA\u52A8"),
        el10("button", {
          type: "button",
          className: "wf-mini-btn" + (sel.direction === "vertical" ? " wf-on" : ""),
          title: "\u5B50\u5143\u7D20\u4ECE\u4E0A\u5230\u4E0B\u6392\u5217\uFF08vertical\uFF09",
          onClick: () => onPatch({ direction: "vertical" })
        }, "\u4E0A\u4E0B"),
        el10("button", {
          type: "button",
          className: "wf-mini-btn" + (sel.direction === "horizontal" ? " wf-on" : ""),
          title: "\u5B50\u5143\u7D20\u4ECE\u5DE6\u5230\u53F3\u6392\u5217\uFF08horizontal\uFF09",
          onClick: () => onPatch({ direction: "horizontal" })
        }, "\u5DE6\u53F3"),
        el10(
          "label",
          { className: "wf-insp-check" },
          el10("input", { type: "checkbox", checked: !!sel.wrap, onChange: (ev) => onPatch({ wrap: ev.target.checked }) }),
          "\u6362\u884C"
        )
      )
    ) : null,
    el10(
      "div",
      { className: "wf-insp-actions" },
      el10("button", { type: "button", className: "wf-mini-btn wf-danger", onClick: onRemove }, "\u5220\u9664\u63A7\u4EF6")
    )
  );
  return el10("div", { className: "wf-insp-wrap" }, head, body);
}

// src/components/history/DocumentPanel.js
var import_react17 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");
var el11 = import_react17.default.createElement;
function fmtDate(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch (e) {
    return "";
  }
}
function DocumentPanel(props) {
  const { docs, currentId, onLoad, onDelete, onRename, onExport, onImport, height } = props;
  const [confirmId, setConfirmId] = import_react17.default.useState(null);
  const confirmTimer = import_react17.default.useRef(null);
  const [renameId, setRenameId] = import_react17.default.useState(null);
  const [renameVal, setRenameVal] = import_react17.default.useState("");
  const fileRef = import_react17.default.useRef(null);
  const armDelete = (id) => {
    setConfirmId(id);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmId(null), 2500);
  };
  import_react17.default.useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
  }, []);
  const startRename = (h) => {
    setRenameId(h.id);
    setRenameVal(h.name);
  };
  const commitRename = () => {
    const name = renameVal.trim();
    if (renameId && name) onRename(renameId, name);
    setRenameId(null);
  };
  return el11(
    "div",
    { className: "wf-history", style: { height } },
    el11(
      "div",
      { className: "wf-history-head" },
      el11("span", { className: "wf-history-title" }, "\u753B\u5E03\u5386\u53F2"),
      el11("span", { className: "wf-history-count" }, docs.length + " \u4E2A"),
      el11("span", { className: "wf-spacer" }),
      el11("button", {
        type: "button",
        className: "wf-mini-btn",
        title: "\u5BFC\u5165\u753B\u5E03\u6587\u4EF6\uFF08.dshwf.json\uFF09",
        onClick: () => {
          if (fileRef.current) fileRef.current.click();
        }
      }, "\u5BFC\u5165"),
      el11("input", {
        ref: fileRef,
        type: "file",
        accept: ".json,.dshwf.json,application/json",
        style: { display: "none" },
        onChange: (ev) => {
          const f = ev.target.files && ev.target.files[0];
          if (f) onImport(f);
          ev.target.value = "";
        }
      })
    ),
    docs.length ? el11(
      "div",
      { className: "wf-history-list" },
      docs.map((h) => el11(
        "div",
        {
          key: h.id,
          className: "wf-history-item" + (currentId === h.id ? " wf-history-item-on" : ""),
          title: "\u70B9\u51FB\u8F7D\u5165\u8BE5\u753B\u5E03",
          onClick: () => onLoad(h)
        },
        renameId === h.id ? el11("input", {
          className: "wf-field-input wf-history-rename",
          value: renameVal,
          autoFocus: true,
          onFocus: (ev) => ev.stopPropagation(),
          onClick: (ev) => ev.stopPropagation(),
          onChange: (ev) => setRenameVal(ev.target.value),
          onBlur: commitRename,
          onKeyDown: (ev) => {
            ev.stopPropagation();
            if (ev.key === "Enter") commitRename();
            if (ev.key === "Escape") setRenameId(null);
          }
        }) : el11("span", {
          className: "wf-history-name",
          onDoubleClick: (ev) => {
            ev.stopPropagation();
            startRename(h);
          }
        }, h.name),
        el11("span", { className: "wf-history-meta" }, fmtDate(h.createdAt || h.updatedAt)),
        confirmId === h.id ? el11(
          "span",
          { className: "wf-history-confirm", onClick: (ev) => ev.stopPropagation() },
          el11("button", {
            type: "button",
            className: "wf-history-confirm-btn wf-history-confirm-ok",
            title: "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u5220\u9664",
            onClick: () => {
              setConfirmId(null);
              onDelete(h.id);
            }
          }, "\u786E\u8BA4\u5220\u9664"),
          el11("button", {
            type: "button",
            className: "wf-history-confirm-btn",
            title: "\u53D6\u6D88",
            onClick: () => setConfirmId(null)
          }, el11(import_dsh_client_ui_primitives3.IconCloseOutline16, { size: 11 }))
        ) : el11(
          "span",
          { className: "wf-history-actions", onClick: (ev) => ev.stopPropagation() },
          el11("button", {
            type: "button",
            className: "wf-history-act",
            title: "\u91CD\u547D\u540D\uFF08\u53CC\u51FB\u540D\u79F0\u4E5F\u53EF\uFF09",
            onClick: () => startRename(h)
          }, "\u6539\u540D"),
          el11("button", {
            type: "button",
            className: "wf-history-act",
            title: "\u5BFC\u51FA\u753B\u5E03\u6587\u4EF6",
            onClick: () => onExport(h.id)
          }, el11(import_dsh_client_ui_primitives3.IconDownloadOutline16, { size: 12 })),
          el11("button", {
            type: "button",
            className: "wf-history-act wf-history-del",
            title: "\u5220\u9664\u8BE5\u753B\u5E03",
            onClick: () => armDelete(h.id)
          }, el11(import_dsh_client_ui_primitives3.IconTrashOutline16, { size: 12 }))
        )
      ))
    ) : el11("div", { className: "wf-history-empty" }, "\u7ED8\u5236\u5185\u5BB9\u5C06\u81EA\u52A8\u4FDD\u5B58\u5230\u8FD9\u91CC\uFF0C\u70B9\u51FB\u53EF\u968F\u65F6\u8F7D\u5165\uFF1B\u652F\u6301\u5BFC\u51FA/\u5BFC\u5165\u5907\u4EFD")
  );
}

// src/components/RightPanel.js
var el12 = import_react18.default.createElement;
var HIST_MIN = 80;
var HIST_DEFAULT = 180;
var HIST_KEY = "wf.histH";
function RightPanel(props) {
  const {
    sel,
    selCount,
    selHasKids,
    selIsNested,
    selTypeOptions,
    selTypeLabel,
    onPatch,
    onRemove,
    docs,
    currentId,
    onLoad,
    onDelete,
    onRename,
    onExport,
    onImport
  } = props;
  const [histH, setHistH] = import_react18.default.useState(() => {
    try {
      const v = Number(localStorage.getItem(HIST_KEY));
      return Number.isFinite(v) && v >= HIST_MIN ? v : HIST_DEFAULT;
    } catch (e) {
      return HIST_DEFAULT;
    }
  });
  const [dragging, setDragging] = import_react18.default.useState(false);
  const rightRef = import_react18.default.useRef(null);
  const dragRef = import_react18.default.useRef(null);
  import_react18.default.useEffect(() => {
    try {
      localStorage.setItem(HIST_KEY, String(histH));
    } catch (e) {
    }
  }, [histH]);
  const startResize = (ev) => {
    ev.preventDefault();
    const right = rightRef.current;
    if (!right || !ev.currentTarget.setPointerCapture) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    dragRef.current = {
      startY: ev.clientY,
      startH: histH,
      maxH: Math.max(HIST_MIN, right.clientHeight - 170)
    };
    setDragging(true);
  };
  const moveResize = (ev) => {
    const d = dragRef.current;
    if (!d) return;
    setHistH(Math.max(HIST_MIN, Math.min(d.maxH, d.startH + (d.startY - ev.clientY))));
  };
  const endResize = () => {
    dragRef.current = null;
    setDragging(false);
  };
  return el12(
    "div",
    { ref: rightRef, className: "wf-right" + (dragging ? " wf-resizing" : "") },
    el12(InspectorPanel, {
      sel,
      selCount,
      selHasKids,
      selIsNested,
      selTypeOptions,
      selTypeLabel,
      onPatch,
      onRemove
    }),
    // 高度拖拽触发区：画布历史 title 栏上边（无视觉横线，仅 hover 显示 ns-resize 光标）
    el12("div", {
      className: "wf-resizer",
      title: "\u62D6\u52A8\u8C03\u6574\u753B\u5E03\u5386\u53F2\u9AD8\u5EA6",
      onPointerDown: startResize,
      onPointerMove: moveResize,
      onPointerUp: endResize,
      onPointerCancel: endResize
    }),
    el12(DocumentPanel, {
      docs,
      currentId,
      onLoad,
      onDelete,
      onRename,
      onExport,
      onImport,
      height: histH
    })
  );
}

// src/components/common/Toast.js
var import_react19 = __toESM(require("react"), 1);
var el13 = import_react19.default.createElement;
function Toast({ toast }) {
  if (!toast) return null;
  return el13("div", { key: toast.key, className: "wf-toast wf-toast-" + (toast.type || "error") }, toast.text);
}

// src/components/SketchModal.js
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");
var el14 = import_react20.default.createElement;
function SketchModal(props) {
  const open = useOpen();
  const p = props || {};
  const [panelOpen, setPanelOpen] = import_react20.default.useState(true);
  const draft = (p.useInput || (() => null))((s) => s && typeof s.draft === "string" ? s.draft : "");
  const { toast, showToast } = useToasts(open);
  const initLastRef = import_react20.default.useRef(null);
  if (initLastRef.current === null) initLastRef.current = initLast();
  const init = initLastRef.current;
  const sketch = useSketchState({
    elements: init ? init.els : freshPage(),
    rootName: init ? init.root : "\u753B\u5E03",
    currentId: init ? init.id : null
  });
  const svgRef = import_react20.default.useRef(null);
  const viewRef = import_react20.default.useRef(null);
  const result = import_react20.default.useMemo(() => buildResult(sketch.elements, sketch.rootName), [sketch.elements, sketch.rootName]);
  const edit = useCanvasEdit({
    elements: sketch.elements,
    setElements: sketch.setElements,
    selectedIds: sketch.selectedIds,
    selectedId: sketch.selectedId,
    applySelection: sketch.applySelection,
    commitHistory: sketch.commitHistory,
    showToast
  });
  const interactions = useCanvasInteractions({
    open,
    elements: sketch.elements,
    setElements: sketch.setElements,
    selectedIds: sketch.selectedIds,
    applySelection: sketch.applySelection,
    commitHistory: sketch.commitHistory,
    mode: sketch.mode,
    setMode: sketch.setMode,
    editing: edit.editing,
    setEditing: edit.setEditing,
    copyBuf: sketch.copyBuf,
    setCopyBuf: sketch.setCopyBuf,
    undo: sketch.undo,
    redo: sketch.redo,
    removeSel: edit.removeSel,
    showToast,
    svgRef,
    viewRef
  });
  const manager = useCanvasManager({
    open,
    result,
    elements: sketch.elements,
    setElements: sketch.setElements,
    rootName: sketch.rootName,
    setRootName: sketch.setRootName,
    currentId: sketch.currentId,
    setCurrent: sketch.setCurrent,
    currentIdRef: sketch.currentIdRef,
    applySelection: sketch.applySelection,
    commitHistory: sketch.commitHistory,
    setPast: sketch.setPast,
    setFuture: sketch.setFuture,
    setCopyBuf: sketch.setCopyBuf,
    setEditing: edit.setEditing,
    setMenu: edit.setMenu,
    setTypeMenu: edit.setTypeMenu,
    setZoom: interactions.setZoom,
    setPan: interactions.setPan,
    setSnapLines: interactions.setSnapLines,
    showToast,
    lastSavedInit: init ? init.els : null
  });
  if (!open) return null;
  const errors = result.issues.filter((i) => i.level === "error");
  const sel = sketch.elements.find((e) => e.id === sketch.selectedId) || null;
  const selHasKids = sel ? sketch.elements.some((o) => o.id !== sel.id && contains(sel, o)) : false;
  const selTypeLabel = sel && sel.kind === "rect" && !sel.type ? inferType(sel) || "\u5BB9\u5668" : sel ? sel.type : null;
  const insert = () => {
    const ia = p.inputActions;
    if (!ia || typeof ia.setDraft !== "function") {
      showToast(t("toast.inputUnavailable"));
      return;
    }
    const text = buildInsertText(result.jsonl);
    const cur = typeof draft === "string" && draft.trim() ? draft.replace(/\s+$/, "") + "\n" : "";
    ia.setDraft(cur + text);
    setOpen(false);
  };
  const menuTargetType = edit.menu ? (sketch.elements.find((e) => e.id === edit.menu.id) || {}).type || null : null;
  const menuTypeOptions = edit.menu ? edit.selTypeOptions(sketch.elements.find((e) => e.id === edit.menu.id)) : [];
  const menuTargetIsPage = menuTargetType === "page";
  const menuEl = edit.menu ? el14(
    "div",
    {
      className: "wf-menu-backdrop",
      // 阻止冒泡：点击 backdrop 只关闭菜单，不能让事件穿透到 .wf-mask 关闭整个弹窗
      onClick: (ev) => {
        ev.stopPropagation();
        edit.closeMenu();
      },
      onContextMenu: (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        edit.closeMenu();
      }
    },
    el14(
      "div",
      { className: "wf-menu", style: { left: edit.menu.x, top: edit.menu.y }, onClick: (ev) => ev.stopPropagation() },
      // 页面不允许置顶/置底（页面恒在底层，渲染层由 CanvasStage 保证）
      !menuTargetIsPage ? el14("div", { className: "wf-menu-item", onClick: () => {
        edit.toTop(edit.menu.id);
        edit.closeMenu();
      } }, "\u7F6E\u4E8E\u9876\u5C42") : null,
      !menuTargetIsPage ? el14("div", { className: "wf-menu-item", onClick: () => {
        edit.toBottom(edit.menu.id);
        edit.closeMenu();
      } }, "\u7F6E\u4E8E\u5E95\u5C42") : null,
      // 无可选类型（页面锁定 / 无变更余地）时不显示「更换控件类型」
      !menuTargetIsPage && menuTypeOptions.length > 1 ? el14(
        "div",
        {
          className: "wf-menu-item wf-menu-cascade",
          onMouseEnter: () => edit.setTypeMenu(true),
          onClick: () => edit.setTypeMenu(!edit.typeMenu)
        },
        "\u66F4\u6362\u63A7\u4EF6\u7C7B\u578B",
        el14("span", { className: "wf-menu-caret" }, "\u25B8"),
        edit.typeMenu ? el14(
          "div",
          { className: "wf-menu wf-menu-sub" },
          menuTypeOptions.map((t2) => el14("div", {
            key: t2,
            className: "wf-menu-item" + (menuTargetType === t2 ? " wf-menu-item-on" : ""),
            onClick: () => {
              edit.patchType(edit.menu.id, t2);
              edit.closeMenu();
            }
          }, TYPE_LABEL[t2] || t2))
        ) : null
      ) : null,
      // 分隔线：页面菜单只有「删除」一项，不需要分隔线
      !menuTargetIsPage ? el14("div", { className: "wf-menu-sep" }) : null,
      el14("div", {
        className: "wf-menu-item wf-menu-danger",
        onClick: () => {
          edit.removeEl(edit.menu.id);
          edit.closeMenu();
        }
      }, menuTargetIsPage && edit.pageInnerCount(edit.menu.id) > 0 ? "\u5220\u9664\u9875\u9762\uFF08\u542B " + edit.pageInnerCount(edit.menu.id) + " \u4E2A\u63A7\u4EF6\uFF09" : "\u5220\u9664")
    )
  ) : null;
  const confirmDialog = edit.confirmDelete ? el14(
    "div",
    { className: "wf-mask wf-mask-confirm", onClick: edit.confirmDeleteCancel },
    el14(
      "div",
      { className: "wf-confirm", onClick: (ev) => ev.stopPropagation() },
      el14("div", { className: "wf-confirm-title" }, "\u5220\u9664\u786E\u8BA4"),
      el14(
        "div",
        { className: "wf-confirm-body" },
        "\u5220\u9664\u9875\u9762\u5C06\u540C\u65F6\u5220\u9664\u5176\u5185\u90E8 " + edit.confirmDelete.extraCount + " \u4E2A\u63A7\u4EF6\uFF0C\u786E\u5B9A\u5220\u9664\uFF1F"
      ),
      el14(
        "div",
        { className: "wf-confirm-actions" },
        el14("button", { type: "button", className: "wf-btn", onClick: edit.confirmDeleteCancel }, "\u53D6\u6D88"),
        el14("button", { type: "button", className: "wf-btn wf-primary wf-danger", onClick: edit.confirmDeleteExecute }, "\u786E\u8BA4\u5220\u9664")
      )
    )
  ) : null;
  return el14(
    "div",
    { className: "wf-mask", onClick: () => setOpen(false) },
    el14(
      "div",
      { className: "wf-modal" + (interactions.fullscreen ? " wf-modal-fs" : ""), onClick: (ev) => ev.stopPropagation() },
      // 顶栏：标题在左，功能菜单（新建 | 最大化/最小化 | 关闭）在右上角（画布改名走历史列表）
      el14(
        "div",
        { className: "wf-head" },
        el14("span", { className: "wf-title" }, t("title")),
        el14("span", { className: "wf-spacer" }),
        el14(
          "div",
          { className: "wf-head-menu" },
          el14(
            "button",
            { type: "button", className: "wf-mini-btn wf-new-btn", title: t("newTitle"), onClick: manager.newCanvas },
            el14(import_dsh_client_ui_primitives4.IconPlusOutline16, { size: 14 }),
            t("new")
          ),
          el14(
            "button",
            {
              type: "button",
              className: "wf-icon-btn",
              title: interactions.fullscreen ? t("exitFullscreen") : t("fullscreen"),
              onClick: () => interactions.setFullscreen(!interactions.fullscreen)
            },
            interactions.fullscreen ? el14(import_dsh_client_ui_primitives4.IconDownloadOutline16, { size: 14 }) : el14(import_dsh_client_ui_primitives4.IconFullscreenOutline16, { size: 14 })
          ),
          el14("button", {
            type: "button",
            className: "wf-icon-btn",
            title: t("close"),
            onClick: () => setOpen(false)
          }, el14(import_dsh_client_ui_primitives4.IconCloseOutline16, { size: 14 }))
        )
      ),
      // 主体：画布 + 右栏（画布占满左栏空出的空间）
      el14(
        "div",
        { className: "wf-body" },
        // 中栏：画布舞台 + 悬浮层
        el14(
          "div",
          { className: "wf-canvas-wrap" },
          el14(CanvasStage, {
            elements: sketch.elements,
            selectedId: sketch.selectedId,
            editing: edit.editing,
            mode: sketch.mode,
            zoom: interactions.zoom,
            pan: interactions.pan,
            spaceDown: interactions.spaceDown,
            drag: interactions.drag,
            svgRef,
            viewRef,
            canvasCursor: interactions.canvasCursor,
            snapLines: interactions.snapLines,
            selectedIds: sketch.selectedIds,
            groupBounds: groupBounds(sketch.elements, sketch.selectedIds),
            onMouseDown: interactions.onMouseDown,
            onMouseMove: interactions.onMouseMove,
            onMouseUp: interactions.onMouseUp,
            onMouseLeave: interactions.onMouseLeave,
            onCloseMenu: edit.closeMenu,
            onSelect: (id) => sketch.applySelection([id]),
            onStartEdit: edit.startEdit,
            onCtxMenu: edit.onCtxMenu,
            onEditChange: (ed) => {
              edit.setEditing(ed);
              edit.applyEdit(ed);
            },
            onEditDone: () => edit.setEditing(null)
          }),
          el14(CanvasOverlay, {
            mode: sketch.mode,
            onToggleMode: () => {
              sketch.setMode(sketch.mode === "select" ? "draw" : "select");
              sketch.applySelection([]);
            },
            floatTab: manager.floatTab,
            onFloatTab: manager.setFloatTab,
            zoom: interactions.zoom,
            pan: interactions.pan,
            onZoomReset: () => {
              interactions.setZoom(1);
              interactions.setPan({ x: 0, y: 0 });
            },
            result,
            onCloseFloat: () => manager.setFloatTab(null),
            canUndo: sketch.past.length > 0,
            canRedo: sketch.future.length > 0,
            canClear: sketch.elements.length > 1,
            // 仅保留预置空页面时不显示清空
            onUndo: sketch.undo,
            onRedo: sketch.redo,
            onClear: manager.clearAll,
            panelOpen,
            onTogglePanel: () => setPanelOpen(!panelOpen)
          })
        ),
        // 右栏：控件设置 + 画布历史（可折叠/可拖高；由画布左上角「设置」按钮整体显隐）
        panelOpen ? el14(RightPanel, {
          sel,
          selCount: sketch.selectedIds.length,
          selHasKids,
          selIsNested: !!sel && sketch.elements.some((o) => o.id !== sel.id && contains(o, sel)),
          selTypeOptions: edit.selTypeOptions(sel),
          selTypeLabel,
          onPatch: edit.patchSel,
          onRemove: () => edit.removeEl(sel.id),
          docs: manager.docs,
          currentId: sketch.currentId,
          onLoad: manager.loadCanvas,
          onDelete: manager.delCanvas,
          onRename: manager.renameCanvas,
          onExport: manager.exportCanvas,
          onImport: manager.importCanvas
        }) : null
      ),
      // 底栏（状态文本已移除，仅操作按钮）
      el14(
        "div",
        { className: "wf-footer" },
        el14("span", { className: "wf-spacer" }),
        el14("button", { type: "button", className: "wf-btn", onClick: () => setOpen(false) }, t("cancel")),
        el14("button", {
          type: "button",
          className: "wf-btn wf-primary",
          disabled: result.empty || errors.length > 0,
          title: errors.length ? t("insertErrorTitle") : t("insertTitle"),
          onClick: insert
        }, t("insert"))
      ),
      // Toast 浮动提示（不占用布局，自动消失）
      el14(Toast, { toast })
    ),
    menuEl,
    confirmDialog
  );
}

// src/core/storage/rpc.js
function createHostRpc(path) {
  const endpoint = path || "/api/wf-storage";
  return {
    endpoint,
    // 调用宿主方法；返回 { ok, ... } 原始结果
    async call(method, args) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ method, args: args || {} })
      });
      if (!res.ok) {
        let detail = "";
        try {
          detail = String(await res.text()).trim().slice(0, 200);
        } catch (e) {
        }
        throw new Error("\u753B\u5E03\u5B58\u50A8\u63A5\u53E3\u4E0D\u53EF\u7528\uFF08HTTP " + res.status + "\uFF09" + (detail ? " " + detail : ""));
      }
      return res.json();
    }
  };
}
function probeHostRpc(path) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", path || "/api/wf-storage", false);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify({ method: "ping", args: {} }));
    if (xhr.status >= 200 && xhr.status < 300) {
      const r = JSON.parse(xhr.responseText || "{}");
      if (r && r.ok === true) return createHostRpc(path);
    }
    return null;
  } catch (e) {
    return null;
  }
}

// src/client.js
var el15 = import_react21.default.createElement;
var client_default = {
  name: "dsh-wf",
  apply(ctx) {
    const slots = ctx.get("slots");
    if (slots === void 0) return;
    const styleEl = document.createElement("style");
    styleEl.textContent = WF_CSS;
    document.head.appendChild(styleEl);
    ctx.effect(() => () => {
      if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    });
    const hostRpc = probeHostRpc();
    if (hostRpc) defaultStore(hostRpc);
    slots.inject("conversation.input.left", () => slots.register(
      { name: "conversation.input.left", id: "wf-button", order: 5, label: "\u8349\u56FE" },
      () => el15(SketchButton, null)
    ));
    slots.inject("conversation.input.overlay", () => slots.register(
      { name: "conversation.input.overlay", id: "wf-panel", order: 5 },
      (props) => el15(SketchModal, props)
    ));
  }
};
return module.exports;
  }
});

