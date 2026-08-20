# dsh-wf 架构蓝本 v4（范式规整 · 待核对）

> 范式定义：**分层领域 + 注册表驱动 + 纯函数状态机 + 命令副作用隔离 + 单一数据所有权 + 宿主解耦 + 存储即服务**。
> 本蓝本覆盖五个维度：工程目录、宿主集成（视图层）、领域模型、文档与存储管理、应用内部架构（注册表/状态机/模块）。
> 功能与视觉保持完全不变——这是结构规整，不是行为变更。

---

## 第 0 章 范式总纲

### 0.1 七个范式原则

| # | 范式 | 含义 | 违例信号 |
| --- | --- | --- | --- |
| P1 | 分层领域 | core（领域，纯逻辑）/ hooks（应用，状态编排）/ components（表现，渲染）/ css（样式）四层，依赖单向 | core 出现 React/DOM；组件出现业务判断 |
| P2 | 注册表驱动 | 控件类型、JSONL 字段、渲染器、表单控件都是**注册数据**；新增能力 = 注册，不改既有代码（开闭原则） | 新增类型需改动注册表以外的业务逻辑（渲染/预览形态代码除外） |
| P3 | 纯函数状态机 | 交互 = `interact(state, event, ctx) → { state, commands }` 纯函数；副作用只经 commands 由适配层执行 | 状态机内出现 setState / DOM / localStorage |
| P4 | 单一数据所有权 | elements 唯一状态源；一切派生（tree/jsonl/issues/预览）为纯函数 + memo；历史快照不可变 | 派生结果被写回 elements |
| P5 | 容错契约 | 解析/导入/读取永不抛：逐行容错 + issue 收集 + 结构自动修正 + 损坏隔离 | 一个损坏文件/非法导入导致整体失败 |
| P6 | 宿主解耦 | DSH 特有知识（槽位、props、图标、i18n、主题 token、bundle 协议）全部收敛在**宿主适配层**；画布应用对 DSH 一无所知 | canvas 组件里出现 `useInput`/`inputActions` |
| P7 | 存储即服务 | 一切持久化走 `CanvasStore` 接口；适配器可替换（localStorage → IndexedDB → 宿主文件）；数据带 schema 版本、可迁移、可恢复、可导出 | 业务代码直接读写 localStorage 键 |

### 0.2 数据流总览（含存储与宿主）

```
┌─ 宿主适配层（P6）──────────────────────────────────────┐
│ cordis.patch.yml 注册 → ModuleLoader bundle → 槽位注入     │
│ conversation.input.left（按钮） / .overlay（模态画板）      │
│ props: useInput / inputActions.setDraft / 主题 token      │
└──────────────────────┬───────────────────────────────────┘
                       ▼ 注入（open / setDraft / onClose）
┌─ 应用层（hooks）────────────────────────────────────────┐
│ useSketchState(elements) ──▶ core/interactions.interact   │
│    │  auto-save(800ms)+flushSave             │ commands[]  │
│    ▼                                          ▼            │
│ core/storage/CanvasStore ◀── 副作用执行 ◀── setState ──▶ components 渲染
│    │  load / save / list / remove                          │
│    ▼  派生（P4）                                            │
│ core/pipeline.buildResult(elements) ─▶ useMemo ─▶ JsonView / SemanticPreview
│    │  output.emit（命令）→ 适配层 → inputActions.setDraft 回填草稿
└───────────────────────────────────────────────────────────┘
```

---

## 第 1 章 工程目录架构

### 1.1 仓库全树（每个文件的职责）

```
dsh-wf-plugin/                          # 插件仓库（包名 dsh-wf）
├── package.json                        # 入口 lib/index.js；scripts: build / verify
├── cordis.patch.yml                    # DSH 注册：insert [{ id: dsh-wf, name: dsh界面草图 }]
├── schema.json                         # JSONL Schema（与 core/jsonl 注册表一致性由测试保证）
│
├── src/                                # ★ 唯一手写源
│   ├── client.js                       # 宿主适配层入口（样式注入 + 槽位注册 + 图标/文案）
│   ├── core/                           # 领域层（禁 React/DOM/DSH 服务，P1）
│   │   ├── model.js  types.js  geometry.js  infer.js  interactions.js
│   │   ├── jsonl/  props.js  serializer.js  validator.js  prettify.js
│   │   ├── pipeline.js  prompt.js  store.js
│   │   └── storage/
│   │       ├── index.js                # CanvasStore 接口 + 适配器装配（能力探测）
│   │       ├── schema.js  migrate.js   # 文件 schema 版本 / 迁移链
│   │       ├── integrity.js            # 损坏隔离 + 结构清洗
│   │       └── adapters/  localStorage.js  indexedDB.js(预留)  hostSQLite.js(预留)  hostFile.js(预留)
│   ├── i18n/                           # 文案表（zh 默认，key 化预留多语言；S5）
│   │   └── index.js                    # t(key, params) + zh 表（toast + 外壳文案）
│   ├── hooks/                          # 应用层（唯一允许直接持有 elements 状态）
│   │   ├── useOpen.js  useSketchState.js  useCanvasInteractions.js
│   │   ├── useCanvasEdit.js  useToasts.js  useCanvasManager.js   # useStorage 已并入 useCanvasManager（S4）
│   ├── components/                     # 表现层（纯渲染 + 回调）
│   │   ├── SketchButton.js             # 槽位按钮（宿主适配层组件）
│   │   ├── SketchModal.js              # 画板外壳（≤300 行，只做编排）
│   │   ├── canvas/     CanvasStage  CanvasOverlay  NodeRenderer  SelectionOverlay  SnapLines
│   │   ├── inspector/  InspectorPanel  PropField
│   │   ├── history/    DocumentPanel   # 画布文档管理（列表/重命名/删除/导出/导入）
│   │   ├── preview/    SemanticPreview  JsonView
│   │   └── common/     Toast  typeLabels(从注册表派生)
│   └── css/                            # base  canvas  inspector  history  preview + index 聚合
│
├── scripts/                            # 构建 + 全部验证（npm run verify 一键全绿）
│   ├── build.mjs                       # esbuild → lib/client.js（external: react/*, @deepseek-ai/*）
│   ├── verify-core.mjs  verify-jsonhl.mjs          # 集成（42 断言，保持）
│   ├── verify-registry.mjs  verify-serializer.mjs
│   ├── verify-interactions.mjs  verify-storage.mjs  verify-perf.mjs
│
├── lib/
│   ├── index.js                        # 宿主入口占位（loader 必需，缺它 DSH 启动崩溃）
│   └── client.js                       # ★ 构建产物（由 build.mjs 生成，不手改）
│
└── ARCHITECTURE.md  README.md          # 本蓝本 / 功能演进记录（15–31 节）
```

### 1.2 构建与安装管线

```
开发：编辑 src/ → npm run build（esbuild，需 danger-full-access 沙箱，否则 spawn EPERM 静默失败）
安装：pnpm link 依赖入 ~/.dsh/profiles/web/package.json
     + junction ~/.dsh/profiles/node_modules/dsh界面草图 → web/node_modules/dsh-wf
     + 配置目录放置 cordis.patch.yml（banner id 必须等于 name: dsh界面草图）
产物：lib/client.js 经 ModuleLoader.load({ id: 'dsh界面草图', factory }) 注入
```

### 1.3 工程约定

- `src/` 是唯一手写源；`lib/client.js` 只由构建生成；`cordis.patch.yml` 只做注册不做逻辑。
- core 不 import 任何 `@deepseek-ai/*`；允许出现 `@deepseek-ai/*` 的只有 `client.js` 与宿主适配组件（P6）。
- 每个模块头注释：`职责 / 边界（依赖与禁止）/ 导出清单`。
- 任何 PR 必须：`npm run verify` 全绿 + 功能对照清单逐项勾选。

---

## 第 2 章 宿主集成（视图层）架构

### 2.1 插件注册契约

| 环节 | 内容 | 位置 |
| --- | --- | --- |
| 注册行 | `insert: [{ id: dsh-wf, name: dsh界面草图 }]` | cordis.patch.yml |
| Bundle | `window.__ModuleLoader__.load({ id: 'dsh界面草图', factory })`，banner id 与 name 严格一致 | build.mjs banner |
| 宿主入口 | `lib/index.js`（现为占位；正式发布时实现为宿主半：`inject: ['fs','shell','sandboxPolicy','sessions','webServer']` + `webServer.register('/api/wf-storage')`，参考 dsh-fm `/api/fm`） | lib/index.js |
| 依赖注入 | `@deepseek-ai/dsh-client-ui-primitives / -ui-slots / -client-runtime / -client-locale` | package.json |

### 2.2 槽位契约（视图层唯一对外接口）

| 槽位 | 用途 | 注入内容 |
| --- | --- | --- |
| `conversation.input.left` | 工具栏「画草图」按钮 | 按钮 + open 事件 |
| `conversation.input.overlay` | 画板模态 | SketchModal 挂载点 |

适配层 props 标准：
- `useInput()` → `{ draft }`：读取草稿状态
- `inputActions.setDraft(text)`：JSONL 插入回填草稿（唯一写入口，桥接 output.emit）
- 主题：`--dsw-*` token → `--wf-*` 别名（深浅色自适应）
- 图标：仅 DSH 内置图标库（无内缩箭头字形 → 用 `IconDownloadOutline16` 作还原退出，已记录）

### 2.3 适配层职责边界（P6）

```
宿主适配层（src/client.js + SketchButton.js）
  ├─ 槽位注册、props 读取、bundle 协议
  ├─ 样式注入（css 聚合）、图标映射、i18n 文案表（zh 默认，key 化预留）
  └─ 注入点：open / setDraft（桥接 output.emit）/ onClose / theme tokens
        │（props 回调传入，画布应用不感知 DSH）
应用层 hooks：useSketchState 等全部与 DSH 无关（useOpen 属应用层，open 状态由适配层回调注入）
```

- 画布应用（core + hooks + canvas/inspector/history/preview 组件）**零 DSH 依赖**：可独立在 storybook/测试环境运行。
- 图标豁免（S5 审计结论）：`@deepseek-ai/dsh-client-ui-primitives` 的图标组件被视为**展示资源**（蓝本 2.2 明确"仅 DSH 内置图标库"），允许在展示组件中使用；槽位 props / 运行时 / 语言包等 DSH 服务知识仍只允许出现在适配层。
- 生命周期：open → 载入最近文档 → 编辑（800ms 自动保存）→ 关闭 flushSave；`escape` 先退出全屏再关弹窗；backdrop 点击关闭必须 `stopPropagation`（历史教训：否则右键菜单被整窗关闭）。

### 2.4 弹窗与浮层栈（视图层状态图）

```
CLOSED ──open──▶ OPEN ──载入完成──▶ READY
  ▲                │                  │
  └──escape/backdrop/关闭──◀──FULLSCREEN（canvas.requestFullscreen）
                                     │ escape 先退全屏
READY: 浮层内还有子状态——toast(3s) / 右键菜单 / 删除二次确认
```

---

## 第 3 章 领域模型（数据契约）

### 3.1 画布元素 Element（唯一事实源）

```ts
interface Element {
  id: string; kind: 'rect'|'text'|'note'|'arrow'
  type: TypeId | null            // null = 待推断
  name: string                   // 用户标识（空 = 不输出 JSONL name）
  x: number; y: number; w: number; h: number; radius: number
  text: string; note: string
  action: string; inputType: string; optionsText: string
  value: string; max: string; alt: string; href: string
  label: string; iconSize: string
  checked: boolean; controls: boolean; autoplay: boolean; poster: string
  direction?: 'horizontal'|'vertical'; wrap?: boolean
  dragTmp?: boolean
}
```

### 3.2 状态机状态 / 交互事件 / 命令

```ts
interface SketchState {
  phase: 'IDLE'|'PAN'|'MOVE'|'RESIZE'|'CREATE'|'MARQUEE'|'GROUP_RESIZE'
  drag: DragInfo | null; selection: string[]; snapLines: SnapLine[]; marquee: Rect | null
}
type InteractionEvent =                    // 完整事件表（见 6.1）
  | { type: 'pointer.down'|'pointer.move'|'pointer.up'|'pointer.leave'; x?: number; y?: number; ctrl?: boolean; mode?: 'select'|'draw' }
  | { type: 'wheel'; deltaY: number }
  | { type: 'key.space.down' } | { type: 'key.space.up' }
  | { type: 'shortcut'; key: 'undo'|'redo'|'copy'|'paste'|'delete'|'mode'|'escape' }
  | { type: 'edit.start'; id: string; field: 'text'|'name' } | { type: 'edit.change'; value: string } | { type: 'edit.end' }
  | { type: 'menu.open'; id: string } | { type: 'menu.close' } | { type: 'commit' }
type Command =                             // 副作用唯一出口（见 6.1）
  | { op: 'selection.set'|'selection.toggle'|'selection.clear' }  (+ids)
  | { op: 'elements.update'; patches: { id: string; patch: Partial<Element> }[] }  // 批量原子
  | { op: 'elements.insert'; element: Element } | { op: 'elements.remove'; ids: string[] }
  | { op: 'history.commit' } | { op: 'history.reset' }
  | { op: 'snap.set'; lines: SnapLine[] }
  | { op: 'toast.show'; text: string; type?: 'error'|'info' }
  | { op: 'output.emit'; text: string } | { op: 'persist.flush' } | { op: 'view.reset' }   // output.emit 是通用出口，由适配层桥接为 setDraft（P6）
```

### 3.3 JSONL 节点 TreeNode（纯净七字段）

```ts
interface TreeNode {
  type: TypeId; name?: string; description?: string
  props?: Record<string, unknown>
  direction?: 'horizontal'       // vertical 省略
  wrap?: boolean; children?: TreeNode[]
}
// 根：page 恒为根；多页面 = 多行；空页面不输出
// name 恒为用户标识（原则⑥：仅用户显式设置时输出；props.name 是 icon 的图标名，二者不同义）
```

### 3.4 存储文件契约 CanvasFile（P7，见第 4 章）

```ts
interface CanvasFile {
  schemaVersion: 1
  id: string; name: string                 // 文档名（仅管理用，绝不注入 JSONL）
  createdAt: string; updatedAt: string     // ISO
  elements: Element[]
  meta?: { source?: 'canvas'|'import'|'migrated'; canvasNote?: string; jsonlPreview?: string }
}
// canvasNote：画布级说明（合并进第一个 page 的 description）——必须落盘，否则保存后丢失
```

> 定位：CanvasFile 是**导出 / 导入 / 迁移**的完整文件形态（单一 JSON，便于备份与分享）；
> 存储内部按文档库语义拆为 `meta`（轻量索引）与 `body`（elements 正文）分离存放（见 4.2），两者由 schemaVersion 保证可互相转换。

---

## 第 4 章 文档与存储管理架构（项目目录 + 文件存储）

> 补足「项目目录及文件管理」与「正式发布后的默认画布数据保存及管理」两个维度。
> 原则：**画布应用只认 CanvasStore 接口，不认存储实现**（P7）；存储后端可随发布阶段升级，业务零改动。

### 4.1 文档模型：画布（唯一文档单位）

```
画布 Canvas（一个 UI 设计 = 一份文档 = 一组 JSONL 行）
  └─ 内部：elements（画布）+ jsonl 派生（只读预览）
```

- 无项目/分组概念：画布是唯一文档单位，全部平铺管理（已确认需求）。
- 两个名称概念（勿混淆）：
  - **界面名称 rootName**：用户输入的界面名，输出为合成根容器（无 page 根时的包装容器）的 name——符合原则⑥（用户设置才输出）；page 根有自己的 name，不受 rootName 影响。
  - **文档名（CanvasFile.name，S4 引入）**：仅文档管理/列表展示用，**绝不注入 JSONL**。
- 画布级说明 canvasNote：写入 CanvasFile.meta（3.4），pipeline 合并进第一个 page 的 description。
- 最近打开记忆：`last` 指针，重开自动载入。

### 4.2 CanvasStore 接口：文档库语义（core/storage/index.js）

> 范式修正（质询结论）：**接口抽象科学，但"整文档文件式读写"粒度不适用于大数据量**。
> 存取语义定为**文档库（document store）**：元数据与正文分离、增量写入、媒体外置、分页查询。

```ts
interface CanvasStore {
  listMeta(q?: { page?: number; pageSize?: number; keyword?: string }): Promise<{ items: CanvasFileMeta[]; total: number }>
  getMeta(id: string): Promise<CanvasFileMeta | null>          // 轻量：最近打开 / 单文档信息
  loadBody(id: string): Promise<{ elements: Element[]; schemaVersion: number } | null>   // 按需加载正文
  saveMeta(meta: CanvasFileMeta): Promise<void>
  saveBody(id: string, patch: ElementsPatch): Promise<void>    // 增量：只写变更元素
  putMedia(id: string, key: string, blob: Blob): Promise<void> // 媒体外置（图片贴图等）
  getMedia(id: string, key: string): Promise<Blob | null>
  remove(id: string): Promise<void>   // 级联删除 body + media
  clear(): Promise<void>
}
interface ElementsPatch { set: Record<string, Element>; remove: string[] }
interface CanvasFileMeta { id: string; name: string; schemaVersion: number; createdAt: string; updatedAt: string; elementCount: number; hasMedia: boolean }
```

- 业务（hooks/useStorage）只依赖此接口；适配器内部才出现具体键名/文件路径；patch 语义是契约，适配器可退化为全量写（见 4.3）。
- 自动保存管线：useSketchState 维护 **dirty 集合**（自上次保存以来变更/新增/删除的元素 id）→ 800ms 防抖 → `saveBody(id, { set, remove })` → 更新 meta.updatedAt/elementCount。
- 打开画布：先 `getMeta`（轻量）再 `loadBody`（正文）；文档管理面板只调 `listMeta`，不触 body。

**数据规模演进边界**：

| 规模 | 存储方案 | 行为 |
| --- | --- | --- |
| 元素 < 500 / 画布 < 50 | localStorage（全量退化实现） | 无感 |
| 元素 500–5000 | IndexedDB（meta/body/media 三 store，全量 JSON 单条） | 单次读写 < 50ms；增量是优化项 |
| 元素 > 5000 或含媒体 | IndexedDB/宿主存储：增量 + 媒体外置 + body 分块 | 分块实现留到真实需要时（接口已支持） |
| 画布数百份 | 宿主 SQLite（索引/检索/统计）或 listMeta 分页 + keyword | 列表不触 body；跨画布需求走 SQL |

### 4.3 四级存储适配器（发布演进路线，写粒度随能力退化）

| 适配器 | 载体 | 状态 | 写粒度 | 说明 |
| --- | --- | --- | --- | --- |
| `localStorageAdapter` | `dsh-wf:index` / `dsh-wf:body:{id}` / `dsh-wf:media:{id}:{key}` / `dsh-wf:last` | **现役（默认）** | 全量退化（量小无感） | 容量探测（~5MB），超限 toast + 引导导出；启动即迁移旧 `dsh-wf:history` 键；媒体存 dataURL，超限拒绝并提示 |
| `indexedDBAdapter` | DB `dsh-wf`：store `meta` / `body` / `media`(blob) | 预留 | 增量 patch | 事务批量；body 单条全量 JSON，量大再分块；浏览器端正解（原生、异步、按 key 索引），**不引入 WASM SQLite**（包体/兼容性代价 vs 无 SQL 需求） |
| `hostSQLiteAdapter` | 宿主 RPC（自建 webServer 路由）→ `<DSH 数据目录>/dsh-wf/dsh-wf.db`（WAL 模式） | **预留（正式发布推荐）** | 增量 patch（事务） | **DSH 宿主无内置 storage.\* 服务**：需宿主半实现 `webServer.register` 注册路由（参考 dsh-fm `/api/fm` 模式：`inject: ['fs','webServer']`，client `fetch` 调用），用 DSH 的 `fs` 服务落盘（better-sqlite3 或 node:sqlite）；事务 + WAL 崩溃安全、索引查询、单文件备份 |
| `hostFileAdapter` | 宿主 RPC（同上）→ `<DSH 数据目录>/dsh-wf/canvases/{cid}/`{meta.json, body.json, media/{key}} + index.json | 预留（备选） | 增量 patch（合并写 body.json） | 同上（自建路由 + fs 服务）；JSON 目录人类可读、可 git 管理；与 SQLite 同为适配器，按规模/偏好切换 |

> 正式发布形态：宿主端以 **SQLite 单文件（WAL）为主存储**，浏览器存储（IndexedDB/localStorage）仅作离线缓存降级；
> 人类可读/可迁移由 CanvasFile JSON 导出承担（导出/导入/备份载体）。切换标准：画布数百份以上、需跨画布检索/统计、需事务级并发安全时启用 SQLite；规模小且偏好可读数据时用 JSON 目录。客户端画板始终不引入 WASM SQLite。
>
> **宿主 RPC 事实核查（2025 查证 dsh-fm-plugin）**：DSH 宿主**不提供内置 `storage.*` 服务**；提供的是 `fs` / `shell` / `sandboxPolicy` / `sessions` / `webServer`（Cordis 服务）。
> 成熟模式 = 宿主半实现自建路由（`webServer.register({ path: '/api/wf-storage', handler })`，`inject: ['fs','webServer']`）+ client `fetch` 封装（POST JSON `{ method, args }` → `{ ok, ... }`），
> 与 dsh-fm `/api/fm`、dsh-kb 完全同构。hostSQLite/hostFile 适配器的 `rpc` 参数即此 fetch 封装。
>
> **宿主半已实现（S6 追加）**：`lib/index.js`（正式入口：inject `['fs','shell','webServer']` + `/api/wf-storage` 路由 + `~/.dsh/wf/config.json` 可配根目录，默认 `~/Documents/界面草图/`）+ `lib/wf-storage.js`（画布库文件存储：index.json 聚合 + `canvases/{cid}/`{meta.json, body.json, media/}；损坏隔离 `.corrupt` + index 扫描重建；删除经 shell；媒体经 node:fs 注入化）。client 侧 `src/core/storage/rpc.js`（createHostRpc/probeHostRpc 同步探测）+ `hostFileAdapter` 全功能实现（rpc 转发），`src/client.js` apply 时探测 → `defaultStore(hostRpc)` 自动升级。verify-host-storage 26 断言守护。

### 4.4 Schema 版本与迁移（schema.js / migrate.js）

- 每条 CanvasFile 带 `schemaVersion`；`migrateFile(raw)` 按版本链逐级升级（v0 历史条目 → v1 无损转换）。
- 升级规则：缺字段补默认值；未知字段**保留**（前向兼容，导出不丢数据）。
- 写回时总是最新版本。

### 4.5 完整性与恢复（integrity.js，P5）

| 场景 | 处理 |
| --- | --- |
| JSON.parse 失败 | 原文件改名 `.corrupt` 隔离 → 返回 null → toast「画布文件损坏，已隔离」 |
| 元素结构非法 | `sanitizeBody` 逐元素校验，非法元素丢弃并计数上报 |
| 崩溃恢复 | 打开时若存在「上次未正常关闭」标记 → 提示恢复最近自动保存 |
| 自动保存 | 800ms 防抖 + 关闭 flushSave + **增量 patch**；dirty 集合由 useSketchState 收集，提交由 useStorage 执行 |

### 4.6 导出 / 导入（文档管理的一部分）

- 导出：画布 JSON（CanvasFile 完整，含版本与 canvasNote）+ JSONL（纯语义）双格式，Blob 下载。
- 导入：仅 **CanvasFile JSON**（备份恢复）：parse → migrate（版本链）→ sanitizeBody → 校验 → **重新分配 id 新建画布**（绝不覆盖现有）。JSONL 反向还原画布不在需求内，不做。
- 文档管理面板（components/history/DocumentPanel，由 HistoryPanel 升级）：
  列表（名称/更新时间/元素数）· 打开 · 新建 · 重命名 · 删除（二次确认）· 导出 · 导入。

---

## 第 5 章 注册表规格（P2）

### 5.1 控件类型注册表 core/types.js

```ts
interface TypeDef {
  label: string; isContainer?: boolean; isRoot?: boolean; lockType?: boolean
  propsSchema: PropKey[]; render: RenderKey; preview: PreviewKey
}
```

完整注册清单（18 项）：

| type | label | isContainer | isRoot/lockType | propsSchema | render/preview |
| --- | --- | --- | --- | --- | --- |
| page | 页面 | ✓ | ✓/✓ | direction, wrap | page |
| container | 容器 | ✓ | – | direction, wrap | container |
| text | 文本 | – | – | text | text |
| button | 按钮 | – | – | text, action | button |
| input | 输入框 | – | – | placeholder, value, inputType | input |
| textarea | 文本域 | – | – | placeholder, value | input |
| image | 图片 | – | – | src, alt | image |
| video | 视频 | – | – | src, poster, autoplay | video |
| audio | 音频 | – | – | src, controls | audio |
| icon | 图标 | – | – | iconName, size | icon |
| link | 链接 | – | – | text, href | link |
| select | 下拉 | – | – | options, value | select |
| checkbox | 复选框 | – | – | label, checked | checkbox |
| radio | 单选框 | – | – | label, checked, options, value | radio |
| switch | 开关 | – | – | checked | switch |
| progress | 进度条 | – | – | value, max | progress |
| divider | 分割线 | – | – | – | divider |
| badge | 徽标 | – | – | text | badge |

派生规则（不手写）：`canBeParent` / `typeOptionsFor` / 校验规则全部由注册表推导。

### 5.2 JSONL 字段注册表 core/jsonl/props.js（17 项，含序列化省略规则）

| key | type | label | serialize（undefined 省略） |
| --- | --- | --- | --- |
| text | string | 文本 | `el.text \|\| undefined` |
| placeholder | string | 占位提示 | `el.text \|\| undefined` |
| value | any | 默认值 | `el.value \|\| undefined` |
| inputType | enum | 输入类型 | `el.inputType \|\| undefined`（text/password/number/email/tel/url/search） |
| options | array | 选项 | `parseOptions(el.optionsText)`（空→undefined） |
| action | string | 动作 | `el.action \|\| undefined` |
| src | string | 地址 | `el.src \|\| undefined` |
| alt | string | 替代文本 | `el.alt \|\| undefined` |
| poster | string | 封面 | `el.poster \|\| undefined` |
| autoplay | boolean | 自动播放 | `el.autoplay \|\| undefined` |
| controls | boolean | 控制条 | `el.controls \|\| undefined` |
| href | string | 链接地址 | `el.href \|\| undefined` |
| label | string | 标签文字 | `el.label \|\| undefined` |
| checked | boolean | 默认选中 | `el.checked \|\| undefined` |
| max | number | 最大值 | `numOr(el.max)` |
| size | number | 图标尺寸 | `numOr(el.iconSize)` |
| iconName | string | 图标名（props.name） | `cut(el.text) \|\| undefined`（未设置即省略，原则④/⑥） |

> 注：`iconName` 序列化为 JSONL 的 `props.name`（图标名），与顶层 `name`（用户标识，原则⑥）不同义，二者不混用。

---

## 第 6 章 交互状态机规格（P3）

### 6.1 事件 → 迁移表

`core/interactions.js`：`interact(state, event, ctx) → { state, commands }`，`ctx = { elements, zoom, pan, mode, selectedIds, pageSnap, constants }`。

**pointer.down**（逻辑坐标）：

| 当前 phase | 条件 | 迁移 | 命令 |
| --- | --- | --- | --- |
| IDLE | space 按住 | PAN | – |
| IDLE | draw 模式 + 命中显式非容器（非手柄） | IDLE | selection.set([id]) |
| IDLE | draw 模式 + 命中容器/页面/空白 | CREATE | elements.insert + selection.clear |
| IDLE | select + Ctrl + 命中 | IDLE | selection.toggle(id) |
| IDLE | select + 命中 + 在多选集内 | MOVE | drag.page 快照 |
| IDLE | select + 命中 + 不在多选集 | MOVE | selection.set([id]) + drag.page 快照 |
| IDLE | select + 命中手柄 | RESIZE | drag 记录 |
| IDLE | select + 空白 + 组外框角 | GROUP_RESIZE | drag 记录 |
| IDLE | select + 空白 | MARQUEE | selection.clear |

**pointer.move**：

| phase | 计算 | 命令 |
| --- | --- | --- |
| PAN | 视口位移（方向取反 + 比例换算） | view（适配层） |
| CREATE | 矩形归一 + 页面边界钳制 | elements.update |
| MOVE | 对齐吸附（6 向）+ 页面钳制 + 页面间距钳制（page）+ 跟随模型（2025 修订：普通控件/容器只移动自身；页面拖动时其内部控件按中心判定跟随、保持相对位置不做钳制） | elements.update(批量) + snap.set |
| RESIZE | 尺寸 + 页面钳制 | elements.update |
| MARQUEE | 选框矩形 | state 更新 |
| GROUP_RESIZE | 等比 scale（锚定对角） | elements.update(批量) |

**pointer.up / pointer.leave → commit 归一**：

| phase | 结算 | 命令 |
| --- | --- | --- |
| CREATE | 过小删除 / 文本默认尺寸 | elements.update/remove + selection.set + history.commit |
| MOVE/RESIZE | – | history.commit + snap.clear |
| MARQUEE | 完全包含结算 | selection.set(包含元素) + history.commit |
| GROUP_RESIZE | – | history.commit |
| PAN | – | – |

**shortcut**：undo/redo（hooks 撤销栈）、copy/paste（+24 偏移 + 上限检查）、delete（remove+clear+commit）、mode（切换+clear）、escape（退全屏→关弹窗）。

### 6.2 纯函数几何工具（可单测）

```
alignCandidates(el, targets) → { bx, by, snaps }    // 6 向对齐，容差 6/zoom
clampToPage(x, y, el, page) → { x, y }              // 页面内贴边
clampPages(nx, ny, el, others, GAP=16) → { x, y }   // 页面间距逐轴钳制
// 跟随模型（2025 修订，computeMove 内联）：普通控件/容器拖动不携带后代；
// 页面拖动时其内部控件（中心在页面内）跟随且保持相对位置（不做页面钳制）
```

---

## 第 7 章 模块规格（文件 × 接口）

### 7.1 core/（21 文件）

| 文件 | 导出 | 职责 |
| --- | --- | --- |
| types.js | `TYPE_REGISTRY`、`typeOptionsFor(el, elements)`、`canBeParent(el)` | 控件注册表 + 派生规则 |
| model.js | `createElement(tool, x, y, w, h)`、`cloneElements(els)`、`hitTest(els, px, py)`、`nextId()` | 工厂/深拷贝/命中 |
| geometry.js | `contains(a,b)`、`rectsOverlap`、`groupBounds(els, ids)`、`parseOptions(text)`、`numOr(v)`、`cut(s,n)` | 纯几何/文本工具 |
| infer.js | `inferType(el)`、`inferDirection(kids)`、`isLowConfidence(el)` | 语义推断 |
| interactions.js | `interact(state, event, ctx)`、`alignCandidates`、`clampToPage`、`clampPages` | 状态机纯函数（跟随模型内联于 computeMove） |
| jsonl/props.js | `PROPS_REGISTRY` | 字段注册表 |
| jsonl/serializer.js | `serializeTree(tree)`、`serializeProps(el, type)` | 树→JSONL 单行 |
| jsonl/validator.js | `validateTree(tree)`、`validateJsonl(text)` | 注册表驱动校验（输出前自检） |
| jsonl/prettify.js | `formatJson(jsonl)`、`tokenizeJson(text)` | 美化/分词 |
| pipeline.js | `buildResult(elements, canvasNote) → { tree, jsonl, issues, empty }` | 编排：推断→嵌套→语义化→多页根→校验 |
| prompt.js | `buildInsertText(jsonl)`、`STANDARD_NOTE` | 提示词 |
| store.js | `store`、`subscribe(fn)`、`setOpen(open)` | 画板开关 |
| storage/index.js | `CanvasStore` 文档库接口（meta/body/media/patch）、`probeAdapters()`、`defaultStore()` | 存储装配（P7），业务只认此接口 |
| storage/schema.js | `CURRENT_SCHEMA_VERSION`、`newCanvasFile(name)` | 版本常量 + 画布工厂 |
| storage/migrate.js | `migrateFile(raw)` | 版本链迁移 |
| storage/integrity.js | `sanitizeBody(raw)`、`quarantine(raw, store)` | 损坏隔离 + 结构清洗 |
| storage/adapters/localStorage.js | `localStorageAdapter()` | 现役适配器（全量退化 + 容量探测 + sync 变体 + 旧键迁移） |
| storage/adapters/indexedDB.js | `indexedDBAdapter()` | 预留（meta/body/media 三 store，增量） |
| storage/adapters/hostSQLite.js | `hostSQLiteAdapter(rpc)` | 预留（正式发布推荐：WAL 单文件，事务增量） |
| storage/adapters/hostFile.js | `hostFileAdapter(rpc)` | 预留（备选：目录式 JSON，可读可 git） |

### 7.2 hooks/（6 文件）

| hook | 状态 | 暴露 |
| --- | --- | --- |
| useOpen | open | 开关订阅（适配层喂入） |
| useSketchState | elements/rootName/currentId/mode/past/future/copyBuf | 状态容器 + 撤销/重做 + 自动保存调度 |
| useCanvasInteractions | phase/drag/selection/snapLines | onPointer*/onWheel/onKey → interact + 执行 commands |
| useCanvasEdit | editing/menu/typeMenu | startEdit/applyEdit/finishEdit、patchSel/patchEl/patchType、removeEl/removeSel、层级/右键菜单 |
| useToasts | toast | showToast（3s 自消） |
| useCanvasManager | docs/floatTab | 存储化：flushSave（dirty 增量）/loadCanvas/delCanvas/renameCanvas/newCanvas/clearAll/exportCanvas/importCanvas |

> 注：S4 实施中 useStorage 职责并入 useCanvasManager（文档列表即 docs 状态，无需独立 hook）。

### 7.3 components/（14 文件）

| 组件 | props（完整接口） | 职责 |
| --- | --- | --- |
| SketchButton | `{ onOpen }` | 槽位按钮（宿主适配层） |
| SketchModal | – | 编排 + 布局（≤200 行） |
| canvas/CanvasStage | `{ elements, selectedIds, groupBounds, marquee, snapLines, editing, mode, zoom, pan, cursor, svgRef, viewRef, onPointer*, onContextMenu }` | SVG 舞台 + 图层编排 |
| canvas/NodeRenderer | `{ element, elements, selected, editing, onSelect, onStartEdit, onContextMenu }` | 注册表 render 分派（17 形态） |
| canvas/SelectionOverlay | `{ selectedIds, elements, groupBounds }` | 多选外框 + 四角手柄 |
| canvas/SnapLines | `{ lines, view }` | 吸附虚线 |
| canvas/CanvasOverlay | `{ mode, zoom, pan, floatTab, result, can*, on* }` | 悬浮层 |
| inspector/InspectorPanel | `{ sel, selCount, selHasKids, selIsNested, selTypeOptions, onPatch, onRemove }` | 面板编排 |
| inspector/PropField | `{ def, value, onChange }` | 注册表驱动通用表单 |
| history/DocumentPanel | `{ docs, currentId, onLoad, onDelete, onRename, onExport, onImport }` | 文档管理 |
| preview/SemanticPreview | `{ tree }` | 语义预览（preview 分派） |
| preview/JsonView | `{ text }` | 美化 + 高亮 |
| common/Toast | `{ toast }` | 浮动提示 |
| common/typeLabels | `TYPE_LABEL`（从 TYPE_REGISTRY 派生） | 类型标签 |

### 7.4 css/（5 文件）

base / canvas / inspector / history / preview + index 聚合（顺序 = 优先级基线）；类名 BEM；颜色一律 `--wf-*` token。

---

## 第 8 章 迁移映射（现有 → 新）

| 现有文件 | 去向 | 拆分动作 |
| --- | --- | --- |
| model.js | core/model.js + core/types.js | ALL_TYPES/TYPE_LABEL → 注册表 |
| infer.js | core/geometry.js + core/infer.js | contains 等几何移出 |
| build.js | core/pipeline.js + core/jsonl/{serializer,validator}.js | inferProps→serializer；nodeToJson→serializeTree；validateTree→validator；多页根/纯净七字段→pipeline |
| validate.js | core/jsonl/validator.js | 注册表驱动 |
| jsonHighlight.js | → core/jsonl/prettify.js（S1 转发，S5 已删转发层） | 不变 |
| prompt.js / store.js | 不变 | – |
| history.js | → core/storage/*（S4 收敛）+ DocumentPanel 内联 fmtTime（S5 删除） | 旧键启动迁移 |
| SketchModal.js | hooks/useSketchState + useCanvasInteractions + useCanvasEdit + useCanvasManager + components/SketchModal.js | 拖拽/选中/吸附 → interactions；自动保存/撤销 → useSketchState；编辑 → useCanvasEdit |
| CanvasStage.js | components/canvas/{CanvasStage,NodeRenderer,SelectionOverlay,SnapLines}.js | renderEl → NodeRenderer；选中/外框 → SelectionOverlay |
| CanvasOverlay.js | components/canvas/CanvasOverlay.js | 不变（props 微调） |
| InspectorPanel.js | components/inspector/{InspectorPanel,PropField}.js | 表单分支 → PropField |
| HistoryPanel.js | → components/history/DocumentPanel.js（S4 已升级：重命名/导出/导入） | 增加重命名/导出/导入 |
| SemanticPreview.js / JsonView.js / SketchButton.js | 不变 | – |
| typeLabels.js | 从 TYPE_REGISTRY 派生 | 删除手写表 |

---

## 第 9 章 测试矩阵

| 套件 | 文件 | 覆盖 |
| --- | --- | --- |
| 注册表完整性 | verify-registry.mjs | 18 类型 × 字段有注册；serialize 全覆盖；typeOptionsFor 规则 |
| 序列化 | verify-serializer.mjs | 17 类型 props 输出；空值省略；数字/布尔；纯净七字段 |
| 状态机 | verify-interactions.mjs | 框选（完全包含）、吸附、页面钳制、间距钳制、批量移动、组缩放、Ctrl 多选 |
| 存储 | verify-storage.mjs | meta/body 分离；增量 patch 往返（set/remove）；损坏隔离；v0→v1 迁移；旧键启动迁移；id 稳定性；媒体外置往返；listMeta 分页；CanvasFile 导入容错（未知字段保留）；导出重建 |
| 集成（现有） | verify-core.mjs / verify-jsonhl.mjs | 全量管线 42 断言保持 |
| 性能 | verify-perf.mjs | 300 元素 buildResult < 50ms；300 元素存储往返 < 100ms |

---

## 第 10 章 实施计划（行为不变，每阶段回归全绿）

> 进度：S1 ✅｜ S2 ✅｜ S3 ✅｜ S4 ✅｜ S5 ✅｜ **S6 ✅ 全部完成**

| 阶段 | 交付 | 验收 | 状态 |
| --- | --- | --- | --- |
| S1 注册表 + 序列化 | core/types.js + jsonl/{props,serializer,validator,prettify}.js + pipeline.js；build.js/jsonHighlight.js 转转发层 | verify-registry/serializer 全绿 + 42 断言全绿 | ✅ 完成 |
| S2 状态机 + hooks 拆分 | core/interactions.js（decide/update/settle 纯函数）+ useSketchState/useCanvasInteractions/useCanvasEdit/useToasts/useCanvasManager 5 个新 hook + SketchModal 瘦身（842→330 行）+ 适配层桥接 output.emit → setDraft（保留 inputActions.setDraft 调用） | verify-interactions 全绿（29 断言）+ 全部旧验证全绿 + 构建成功 | ✅ 完成 |
| S3 渲染拆分 | canvas/{NodeRenderer(17 形态),SelectionOverlay,SnapLines,CanvasStage 瘦身 257→84} + inspector/{PropField(注册表驱动),InspectorPanel 字段配置化} + typeLabels 派生化 | 构建成功 + 全验证绿 + grep 审计：子组件零业务逻辑 | ✅ 完成 |
| S3 渲染拆分 | canvas/{NodeRenderer(17 形态),SelectionOverlay,SnapLines,CanvasStage 瘦身 257→84} + inspector/{PropField(注册表驱动),InspectorPanel 字段配置化} + typeLabels 派生化 | 构建成功 + 全验证绿 + grep 审计：子组件零业务逻辑 | ✅ 完成 |
| S4 存储与文档管理 | core/storage/*（schema/migrate/integrity + localStorage 适配器 + 装配 index）+ useCanvasManager 存储化（dirty 增量管线 + 异步 docs 列表）+ DocumentPanel（重命名/导出/导入）+ 旧键自动迁移 | verify-storage 全绿（32 断言）；重开画布/损坏隔离/增量保存/导出导入手工对照 | ✅ 完成 |
| S5 宿主层收口 | 转发层删除（build/jsonHighlight/history → 直连 pipeline/prettify/内联）+ typeLabels/Toast 迁 common/ + CanvasOverlay·preview 目录对齐 + i18n 文案 key 化（src/i18n/，toast+外壳文案）+ P6 三层审计（core 零 DSH / @deepseek-ai 仅图标 / 宿主 props 仅 SketchModal 注入）+ verify-perf | 7 套验证全绿；审计通过；构建成功（147KB） | ✅ 完成 |
| S6 发布就绪 | indexedDB/hostSQLite/hostFile 适配器桩 + probeAdapters 能力探测（安全降级）+ verify-adapter-contract（契约形状/预留标记/降级）+ schema.json 一致性强化（props 字段）+ README 架构总览与发布 checklist + package.json verify 一键脚本 | 8 套验证全绿（180+ 断言）+ 构建成功 + 发布 checklist 全项可勾选 | ✅ 完成 |

---

## 第 11 章 核对问题

1. **七个范式原则（P1–P7）** 是否认可为规整基准？（新增 P6 宿主解耦、P7 存储即服务）
2. **工程目录架构**（第 1 章：src 唯一手写源 / 产物分离 / 构建安装管线）是否接受？
3. **宿主集成视图层划分**（第 2 章：适配层只认槽位 props，画布应用零 DSH 依赖）是否接受？
4. **存储管理**（第 4 章：画布文档模型（无项目概念）、**文档库语义接口（meta/body 分离 + 增量 patch + 媒体外置 + 分页）**、四级适配器 **localStorage → IndexedDB → hostSQLite（正式发布推荐）→ hostFile（备选）**、版本迁移/损坏隔离/导出导入、默认画布与最近打开）是否接受？
5. **注册表驱动**（18 类型 + 17 字段全量注册）是否接受？
6. **状态机纯函数化**（interact/commands，副作用隔离）是否接受？
7. **模块划分与迁移映射**（第 7/8 章）有无异议或补充？
8. **实施顺序 S1→S6** 是否按此推进？
9. **已确认边界**：不做模型回传 JSONL 还原画布（无 parser，导入仅 CanvasFile 备份恢复）；画布无项目/分组概念，是唯一文档单位（无 documents.js，hostFile 路径已去 projects 层级）。

---

## 实施完成记录（S1–S6 全部完成）

| 阶段 | 结果 |
| --- | --- |
| S1 注册表 + 序列化 | types.js + jsonl 四件套 + pipeline.js；verify-registry/serializer + 42 断言全绿 |
| S2 状态机 + hooks | interactions.js 纯函数（decide/update/settle）+ 5 hooks；SketchModal 842→330 行；verify-interactions 29 断言 |
| S3 渲染拆分 | NodeRenderer(17 形态)/SelectionOverlay/SnapLines/PropField；typeLabels 派生化；grep 审计零业务逻辑 |
| S4 存储与文档 | storage 六件套 + dirty 增量管线 + DocumentPanel（重命名/导出/导入）；verify-storage 32 断言；旧键自动迁移 |
| S5 宿主层收口 | 转发层全删 + i18n + P6 三层审计 + verify-perf（管线 4.4ms/往返 1.4ms/增量 0.8ms） |
| S6 发布就绪 | 三级适配器桩 + probeAdapters 安全降级 + 契约验证 + README 架构总览/发布 checklist + `npm run verify` 一键 180+ 断言全绿 |
