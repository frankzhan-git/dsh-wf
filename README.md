# dsh-wf — 会话输入框里的界面草图插件

> **画草图 → 自动转 JSONL → 嵌入输入框 → 随需求发给 DSH agent**
>
> 让模型精确理解你想要的界面，而不是用文字反复描述、反复猜。

[![v1.1.0](https://img.shields.io/badge/version-1.1.0-2f6feb)](https://github.com/frankzhan-git/dsh-wf)
[![10 套验证全绿](https://img.shields.io/badge/verify-10%20suites%20%E2%9C%93-2ea043)]()

dsh-wf 是 [DeepSeek Harness](https://github.com/deepseek-ai) 的正式插件：在会话输入框的工具行点「草图」按钮唤起轻量画板，绘制界面布局后一键生成 **JSONL 语义描述**，嵌入输入框随你的文字需求一起发给 agent——结构、层级、比例、要求全部精确传达，无需多轮澄清。

---

## ✨ 特性

- **轻量画板**：双模式（选择 / 绘制，长按 `Alt` 临时绘制）、无限画布（平移 / 缩放）、对齐吸附、多选批量操作、等比缩放
- **页面（多设计稿）**：一个画布可含多个页面，每个页面 = JSONL 的一行根，独立输出
- **JSONL 一等公民**：输出遵循《UI布局语义描述标准》——纯净七字段、空值省略、只表达结构语义，不输出坐标/尺寸/样式
- **语义预览**：画布内实时预览解析出的 JSON 与控件树，解析不对立刻可见
- **画布文档管理**：自动保存（增量写入）、最近打开、重命名、删除（二次确认）、导出 / 导入备份
- **宿主存储**：数据落盘为可读可 git 的 JSON 文件库（`~/Documents/界面草图/`），浏览器存储自动降级
- **注册表驱动**：18 种控件类型、6 个 JSONL 结构字段全部注册表化，新增类型不改业务逻辑
- **结构陈述而非高保真**：JSONL 只表达结构与内容（文字/占位/输入类型/选项/动作/选中态）；资源地址、尺寸、播放行为、默认值、进度等运行态与实现细节一律走 `description`，由模型结合上下文实现

---

## 🎯 设计理念

### 为什么是 JSONL，而不是让模型"看图"或"读文字"？

用户向 agent 派界面任务时，最大的痛点是**描述的精准度**：

| 方式 | 问题 |
| --- | --- |
| 纯文字描述 | 「上面标题下面两个按钮」——结构、层级、间距、要求全靠猜，多轮往返对齐 |
| 截图/图片 | 模型看到的是像素，布局的**语义归属**（哪个容器包着哪个按钮、按钮点击做什么）不明确 |

dsh-wf 的思路：**人画图 → 插件转 JSONL → 模型推理**。JSONL 是**结构化的界面语义**——容器嵌套关系、控件类型、排列方向、业务要求，全部是模型可以直接推理的数据结构。画布解决"表达"，JSONL 解决"精准"。

> JSONL 只用于向模型表达界面设计的结构及要求。它不包含任何样式、尺寸、交互逻辑或代码——那些是模型该做的工作。

### 八条 JSON 设计原则（本项目的行为宪法）

1. **结构可精确重建**：一棵 JSONL 树可以 1:1 还原界面的布局意图——嵌套即包含，顺序即排列
2. **模型可理解**：字段与值使用界面设计的通用词汇（container/button/input），不发明私有方言
3. **最小 Token**：空值一律省略，自动推断的名称不输出——发给模型的每一行都尽量短
4. **不含样式/尺寸/交互/代码**：坐标、宽高、颜色、事件处理器全部剥离（那是实现细节，不是意图）
5. **只澄清结构**：direction（排列方向）、wrap（换行）等结构性字段是模型推理布局的必要信息
6. **name = 用户标识**：只有用户显式命名的元素才输出 name（如「保存按钮」），自动名称会与 text 重复且浪费 token
7. **description = 模型面向的要求**：元素备注、画布级要求（跳转关系、未挂接说明）合并进 JSON，成为布局意图的一部分而非外部补充
8. **模型从结构自推断**：direction 未设置时按子元素分布自动推断，模型拿到的永远是"用户意图优先、自动推断兜底"

### 七范式架构（P1–P7）

完整设计见 [`ARCHITECTURE.md`](ARCHITECTURE.md)（v4 蓝本：范式定义 + 模块规格 + 实施记录）。

| 范式 | 含义 |
| --- | --- |
| P1 分层领域 | core（纯逻辑，零 React/DSH）/ hooks（状态编排）/ components（纯展示）/ css，依赖单向 |
| P2 注册表驱动 | 18 控件类型 + 6 JSONL 结构字段全注册（含序列化规则内聚）；新增能力 = 注册，不改既有代码 |
| P3 纯函数状态机 | 交互 = `decide → compute → settle` 纯函数，副作用经命令由 hooks 执行，行为可单测 |
| P4 单一数据所有权 | elements 是唯一事实源；tree/jsonl/issues 全部纯函数派生 + memo |
| P5 容错契约 | 解析/读取永不抛：逐行容错、损坏文件隔离（`.corrupt`）、索引损坏自动重建 |
| P6 宿主解耦 | DSH 知识（槽位/props/i18n）只出现在适配层；画布应用零 DSH 依赖 |
| P7 存储即服务 | 一切持久化走 CanvasStore 接口；适配器可替换（localStorage → 宿主文件库 → SQLite），schema 版本迁移 |

### 数据流

```
DOM 事件 → components 回调 → hooks
    → core/interactions（纯函数状态机）→ { state, commands }
    → setElements → 渲染
    → core/pipeline.buildResult(elements)  → JSONL + 语义预览（memo）
    → 自动保存（diff 增量）→ CanvasStore → 宿主文件库 / localStorage
```

---

## 🚀 安装（同事 / 新环境）

**前置**：已安装 DSH（`dsh` 在 PATH）、Node ≥ 20、pnpm。

```powershell
# 1. 获取代码
git clone https://github.com/frankzhan-git/dsh-wf.git
cd dsh-wf

# 2. 安装依赖并构建（仓库已提交构建产物，跳过构建也可）
npm install
npm run build

# 3. 安装到 DSH profile（官方命令）
dsh plugin --profile web add "dsh-wf@file:<本目录绝对路径>"

# 4. 中文显示名目录联接（必须！pnpm 不接受中文依赖键）
cmd /c mklink /J "%USERPROFILE%\.dsh\profiles\node_modules\dsh界面草图" "%USERPROFILE%\.dsh\profiles\web\node_modules\dsh-wf"

# 5. 把 dsh-wf 加入 profile manifest 的 bundles 列表（pnpm add 不会自动改）
#    编辑 %USERPROFILE%\.dsh\profiles\web\package.json：
#    "dsh": { "profile": { "bundles": [ "@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", ..., "dsh-wf" ] } }

# 6. 验证注册
dsh --profile web --dump-config | findstr dsh-wf

# 7. 重启 DSH 并刷新页面
```

> **不用中文显示名？** 把 `cordis.patch.yml` 的 `name` 与 `scripts/build.mjs` 的 banner id 都改为 `dsh-wf` 后重新构建，即可跳过第 4 步。

**常见问题**

| 现象 | 原因与解决 |
| --- | --- |
| 按钮不出现 | 第 4 步 junction 缺失或第 5 步 bundles 漏加 → 补齐后重启 |
| 控制台报 `Cannot find module 'dsh界面草图'` | banner id 与 patch name 不一致 → 重新构建 |
| 画布保存失败 toast | 宿主路由未生效 → 确认重启过 DSH；或自动降级 localStorage（不影响使用） |
| 画布数据在 `~/Documents/界面草图/dsh-wf/` | 宿主存储正常；改目录编辑 `~/.dsh/wf/config.json` 的 `root` |

---

## 📖 使用教程

### 基本流程（三步）

```
① 输入框工具行点「草图」→ 画板浮层出现
② 绘制草图 → 画布内实时显示 JSONL + 语义预览（可确认解析对不对）
③ 点「插入到输入框」→ JSONL 嵌入输入框，随你的文字需求发送
```

示例：你想做"商品详情页"，画好布局后输入框变成：

```
帮我做商品详情页，按下面草图的布局：
[界面草图] 这是我绘制的界面草图，已转为 JSONL 语义描述。字段含义：...
{"type":"container","name":"商品详情页","children":[{"type":"image","props":{"src":"..."}},...]}
```

### 画布操作

| 操作 | 方式 |
| --- | --- |
| 切换模式（选择 / 绘制） | 长按 `Alt` 临时进入绘制模式（松开恢复选择），或点画布左上角模式徽标 |
| 绘制 | 绘制模式：画布空白处拖拽 = 新建页面；页面内拖拽 = 新建容器 |
| 移动 / 改尺寸 | 选择模式点击拖动；右下角手柄改尺寸 |
| 平移画布 | 按住空格 + 拖动 |
| 缩放 | 滚轮（视口中心锚定） |
| 对齐吸附 | 拖动时自动吸附（6 向对齐 + 吸附虚线） |
| 多选 | 空白处框选（完全包含）；`Ctrl` + 点击精准多选 |
| 批量缩放 | 多选后拖外框四角（等比） |
| 撤销 / 重做 | `Ctrl+Z` / `Ctrl+Shift+Z`（或 `Ctrl+Y`） |
| 复制 / 粘贴 | `Ctrl+C` / `Ctrl+V`（偏移 +24 防重叠） |
| 删除 | `Delete` / `Backspace`（页面含控件时弹窗确认，连带删除） |
| 编辑文本 / 名称 | 双击控件 / 双击左上角名字标签 |
| 右键菜单 | 置于顶层/底层（页面除外）、更换控件类型、删除 |
| 全屏 | 顶栏全屏按钮；`Esc` 先退全屏再关弹窗 |

### 控件类型（18 种）

页面 · 容器 · 文本 · 按钮 · 输入框 · 文本域 · 图片 · 视频 · 音频 · 图标 · 链接 · 下拉选择 · 复选框 · 单选框 · 开关 · 进度条 · 分割线 · 徽标

- 绘制模式下绘制矩形 → 在右侧属性面板或右键菜单中设置类型
- 未设类型的矩形按**包含关系 + 文本启发式自动推断**（如圆角短文本 → 按钮、占位文本 → 输入框）
- 嵌套规则：**容器可嵌套任意内容；非容器不可嵌套**（内部控件自动提升到父级）；**页面恒为根**且恒在底层

### 页面（多设计稿）

- 页面 = 一个设计稿 = JSONL 的一行根；一个画布可含多个页面
- 拖动页面时，页面内所有控件保持相对位置跟随
- 页面删除：连带删除内部控件（有内容时二次确认弹窗）

### 画布文档管理

- 右侧「画布文档」面板：自动保存的文档列表，点击载入
- 重命名（双击名称或「改名」）、导出（`.dshwf.json` 备份）、导入（重建 id 绝不覆盖）、删除（二次确认）
- 宿主存储启用时，数据落盘 `~/Documents/界面草图/dsh-wf/`（index.json + canvases/，JSON 可读可 git）；未启用时自动降级浏览器 localStorage

---

## 🏗️ 架构

```
dsh-wf/
├── lib/                    # 宿主半（Node 进程）
│   ├── index.js            #   Cordis 入口：inject [fs,shell,webServer] + /api/wf-storage 路由
│   └── wf-storage.js       #   画布文件库：index.json + canvases/{id}/{meta,body}.json + media/
├── src/
│   ├── client.js           # 客户端入口（槽位注册 + 宿主存储探测）
│   ├── core/               # 纯逻辑（零 React/DSH）
│   │   ├── types.js        #   控件类型注册表（18 类型 + 派生规则）
│   │   ├── interactions.js #   交互状态机（decide/compute/settle 纯函数）
│   │   ├── pipeline.js     #   元素 → JSONL 解析管线
│   │   ├── jsonl/          #   props 注册表 / 序列化 / 校验 / 美化
│   │   └── storage/        #   CanvasStore 接口 + 适配器（localStorage 现役 / 宿主文件 / SQLite 预留）
│   ├── hooks/              # 应用层（useSketchState / useCanvasInteractions / ...）
│   ├── components/         # 表现层（画布 / 属性面板 / 文档管理 / 预览，全部纯展示）
│   ├── i18n/               # 文案表（zh 默认，key 化预留多语言）
│   └── css/                # 样式（--wf-* token）
├── scripts/                # 构建 + 10 套验证脚本
├── schema.json             # JSONL 标准 Schema（与注册表一致性自动检查）
└── ARCHITECTURE.md         # 完整架构蓝本（七范式 + 实施记录）
```

### 存储演进

| 阶段 | 存储 | 说明 |
| --- | --- | --- |
| 现役 | localStorage（浏览器） | 无宿主时自动降级，容量探测 + 导出引导 |
| 正式发布 | 宿主文件库（`/api/wf-storage`） | JSON 目录可读可 git；数据随 DSH 落盘 |
| 预留 | SQLite（hostSQLite） | 数据量大 / 跨画布检索时启用（Node 22.5+） |

存储后端通过 `probeAdapters` 能力探测自动选择，业务代码零改动。

---

## 🧪 验证

```bash
npm run verify   # 10 套脚本一键全绿
```

| 套件 | 覆盖 |
| --- | --- |
| verify-core | 解析管线行为（登录页/商品卡片/多页面/嵌套规则等 10 场景） |
| verify-registry / serializer | 注册表完整性 / 类型 props / schema.json 一致性 / 字段面板对齐 |
| verify-interactions | 交互状态机（决策/吸附/钳制/多帧增量跟随/结算/resize 吸附） |
| verify-newcanvas | 新建画布端到端管线（严格顺序/无幽灵画布/页面不丢失） |
| verify-storage / host-storage | 存储往返 / 增量 patch / 迁移 / 损坏隔离 / 宿主文件库全流程 |
| verify-adapter-contract | 四级适配器接口契约 |
| verify-perf | 性能基线（300 元素管线 < 50ms） |

---

## 📄 文档

- [CHANGELOG.md](CHANGELOG.md) — 版本更新记录
- [ARCHITECTURE.md](ARCHITECTURE.md) — 完整架构蓝本（七范式 P1–P7、模块规格、S1–S6 实施记录）
- [schema.json](schema.json) — JSONL 标准 Schema
- [README 演进记录]() — 功能迭代历史（M2.x–M4.x）见仓库 docs 分支记录

## 📝 许可证

[MIT](LICENSE) © FrankZhan
