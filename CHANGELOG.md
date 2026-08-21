# 更新日志

## v2.1.0（2026）

### 存储介质 v2.1：每画布一个 JSON 文件，归类目录

- **画布正文介质从官方存储域单文件改为目录文件**：`~/.dsh/storages/wf-canvases/{canvasId}.json`（CanvasFile 完整形态，meta + elements 合一）；官方 json 后端固定单单位单文件平铺、无子目录、无单位枚举，无法满足「每画布一文件 + 目录归类」→ 正文介质由宿主半 node:fs 自管
- **原子写**：writeAtomic（临时文件 + fsync + rename，官方 JSON 后端同款模式）；崩溃安全保留
- **写放大消失**：单画布保存只重写自己那个文件（官方域单文件方案下任一画布保存触发整文件重写）
- **meta 缓存**：启动扫描 `wf-canvases/` 建内存索引（文件权威，损坏可重建）；无 100 条索引上限
- **容错**：损坏文件改名 `.corrupt` 隔离 + 缓存剔除；宿主侧写链串行（读-改-写）
- **迁移**：旧官方域单位文件 `wf_canvas.json` 启动自动拆分到每画布文件（只入不覆盖，成功后改名 `.migrated`）；v4 旧文件库迁移不变
- **传输与接口零改动**：官方 @Remote 网关（typert 严格路径 + remote.$mount）、wire 线协议、CanvasStore 接口、client 全部不变；`domainAdapter` 现役
- **依赖清理**：移除 `@deepseek-ai/dsh-storage-domain`（生产）与 `dsh-storage-json`（dev，冒烟改用真 fs 临时目录）
- 验证：verify-host-storage 35+ 断言（含域文件拆分迁移/只入不覆盖/损坏隔离）+ smoke-storage.mjs 真 fs 冒烟 + 10 套全绿

## v2.0.0（2026）

### 存储架构 v5 定稿：官方存储域 + @Remote 网关

- **存储内核迁移官方 `ctx.storageDomain`**：数据落 `~/.dsh/storages/wf_canvas.json`（JSON 后端原子写：临时文件 + fsync + rename），meta/body 两表 + global；`saveBody` 增量 patch 映射 `table.update()` 原子 RMW；单写链串行化
- **传输层迁移官方 api-gateway**：宿主半 `ctx.provide('wfStorage')` + `bindTypertRemote` + `ctx.typert.register`（严格描述符，zod 线协议校验）；客户端 `ctx.remote.$mount` 挂载 `remote.wfStorage`（公开运行时 API，无需改官方装配）
- **删除全部自建存储基础设施**：`lib/wf-storage.js`（自管文件库）、`/api/wf-storage` 路由、`src/core/storage/rpc.js`（同步 XHR 探测）、`hostFileAdapter`、shell 删除依赖、`~/.dsh/wf/config.json` 逻辑
- **`domainAdapter` 现役**：CanvasStore 接口与业务层（hooks/components）零改动；探测链 `domain > indexedDB > localStorage`
- **旧数据一次性迁移**：v4 文件库（`~/Documents/界面草图/dsh-wf/`）启动时自动迁移（只入不覆盖，成功改名 `.migrated`）
- **损坏容错升级**：官方 `malformed-medium` 拒绝 → `.corrupt` 隔离重开空库；修复 index 100 条隐藏上限
- 依赖：`@deepseek-ai/dsh-storage-domain` / `dsh-typert-protocol` / `zod`（版本与 DSH 运行时严格一致 rc.7）；`dsh-storage-json` 为 devDependency（真后端冒烟）
- 验证：10 套全绿 + `scripts/smoke-domain.mjs` 真后端冒烟（原子写单位文件 / 损坏隔离 / 级联删除）

## v1.1.0（2026-08）

### 设计哲学：结构陈述而非高保真

- **JSONL 字段收敛 17 → 6**：仅保留结构内容（`text` / `placeholder` / `inputType` / `options` / `action` / `checked`）；
  资源地址、尺寸、播放行为、默认值、进度等实现细节一律走 `description`，由模型结合上下文实现
- `radio` 回归「单选项」语义（与 `checkbox` 对称）：互斥单选组由容器结构表达，`options` 不再用于单选
- checkbox/radio 的标签并入 `text`（JSONL 输出 `props.text`，面板显示「标签文字」）

### 画布样式体系重构

- 统一填充体系（静态区 / 强调区 / 无背景类），移除硬编码黑色
- 占位符全部几何化（图片图标、音频波形、四角星、对勾 path、下拉箭头、链环），无文字/字形占位
- checkbox/radio/switch 增加弱虚线外框圈定组件大小；progress 固定示意填充
- 每类型最小尺寸注册表化（minW/minH），resize/组缩放统一钳制

### 业务管线重构（新建画布）

- 串行持久化队列 + 全量快照保存 + 显式创建画布 id：
  修复「新建后列表不显示」「幽灵画布」「切换后页面丢失」等并发竞态问题
- 新建严格顺序：旧画布落盘 → 新文件落盘（列表刷新）→ 选中 → 展示，防连点
- 宿主存储 saveMeta 加互斥锁（防御 index 并发覆盖）

### 交互与界面

- 模式：**长按 `Alt` 临时进入绘制模式，松开恢复选择**（原「控件模式」更名「绘制模式」）
- 空格按住 = 平移画布（含控件上方），ref 实时读取消除滞后，CSS 强制手型光标
- 复制/粘贴：支持多选与容器/页面连带子元素，整体偏移防重叠
- resize 下边/右边对齐吸附（阈值与移动一致），吸附虚线反馈
- 右侧面板：控件设置/画布历史模块化；历史高度拖拽（title 栏上边触发）；列表按创建日期排序、仅显示日期；hover 切换日期↔操作按钮（固定行高防抖动）
- 双击编辑：点击画布其他位置自动保存并关闭编辑框；Esc 关闭
- 启动恢复最近打开的画布（宿主存储异步恢复）；新建画布立即落盘
- 历史列表操作按钮不再预留空间，hover 时隐藏日期显示按钮

### 验证

- 验证套件 9 → 10（新增新建画布端到端管线套件）

## v1.0.0（2025）

- 会话输入框界面草图插件首发：绘制草图 → JSONL 语义描述 → 嵌入输入框
- 七范式架构、注册表驱动（18 控件类型）、宿主文件存储、语义预览
