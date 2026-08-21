# dsh-wf 画布数据存储最佳方案（v5 定稿）

> 状态：**已实施（S7 完成，2026）**——本文件为实现依据；实施结果见 ARCHITECTURE.md 第 4/7/10 章与 CHANGELOG v2.0.0
> 依据：DSH 0.1.0-rc.7 运行时事实核查 + 官方包源码（`dsh-storage*` / `dsh-typert-*` / `dsh-api-remotes` / `dsh-message-feedback`）+ 现有 v4 蓝本（P1–P7）
> 决策：**一次性按官方建议改到位**——存储内核用官方 `ctx.storageDomain` 领域 KV，传输层用官方 `@Remote` 网关（`ctx.remote.$mount` 挂载），删除全部自建基础设施（webServer 路由、RPC 协议、互斥锁、索引重建、shell 删除）。无过渡路径。

---

## 0. 结论摘要

| 维度 | 现状（S6，废弃） | v5 定稿 |
| --- | --- | --- |
| 存储介质 | 自管文件库 `~/Documents/界面草图/dsh-wf/` | 官方 JSON 后端 `~/.dsh/storages/wf_canvas.json`（临时文件 + fsync + rename 原子写） |
| 宿主入口 | `export default { name, inject, apply }` + 自建 `/api/wf-storage` 路由 | `WfStorageService extends TypertRemoteService`（Cordis Service 类）+ `@Remote` 方法装饰器 |
| 传输 | client `fetch` POST `/api/wf-storage`（无鉴权、无校验） | 官方 api-gateway：client `inject: ['remote']` + `ctx.remote.$mount(wfContribution)` → `ctx.remote.wfStorage.*`（zod 线协议校验） |
| 并发安全 | 仅 saveMeta 互斥锁；saveBody 读-改-写无锁 | 官方每 domain 单写链 + `table.update()` 原子 RMW |
| 损坏容错 | 自研 index 扫描重建 / `.corrupt` | 官方 `malformed-medium` 拒绝 + 宿主半隔离重开 |
| 校验 | 仅 `sanitizeElements` | zod schema 持久边界校验（meta 严格 / elements 宽松）+ sanitizeElements 语义清洗 |
| 索引上限 | index.json 100 条截断（隐藏限制） | 无上限，内存 entries() 迭代 |
| 删除 | shell 拼命令 `Remove-Item`/`rm -rf` | `table.delete` + node:fs `rm`（媒体目录）；**shell 依赖清零** |
| 客户端 | `hostFileAdapter` + `rpc.js`（同步 XHR 探测） | `domainAdapter` + remote 注入（`rpc.js` 删除）；`CanvasStore` 接口与业务层零改动 |

**明确接受的代价**：① 数据位置从 `~/Documents/界面草图/` 移到 DSH 数据目录 `~/.dsh/storages/`（一次性迁移，README 更新）；② 单 domain 单文件 → 任一画布保存触发整文件重写（写放大，量级分析见 3.1）。

---

## 1. 事实核查（官方能力与接入机制，全部经源码/运行时确认）

### 1.1 官方存储三件套（web profile 已挂载）

`dsh-web-app/cordis.patch.yml`：

```yaml
- id: storage          # @deepseek-ai/dsh-storage          中枢 ctx.storage（backend 注册表 + form 挂载）
- id: storage-json     # @deepseek-ai/dsh-storage-json     JSON 后端，root: dshHomePath('storages') → ~/.dsh/storages/
- id: storage-domain   # @deepseek-ai/dsh-storage-domain   领域层 ctx.storageDomain，backend: json
```

运行时 `Service.listService` 确认 `storage` / `storageDomain` 均已挂载。

**领域 API**（`dsh-storage-domain` 源码）：

```ts
defineDomain({ name, version, global?, tables })      // zod schema；域名/表名须匹配 UNIT_NAME_RE（小写下划线）
const domain = await ctx.storageDomain.open(spec)     // → Domain
domain.table('meta').get/put/delete/update(key, fn)/entries()/keys()/size
domain.global.get()/set(value)                        // 单例槽（最近打开指针）
await domain.close()                                  // 生命周期（ctx.effect 注册）
```

**语义保证**：每次写 = 临时文件 + fsync + 原子 rename；每 domain 单写链（写先持久 → 再改内存 → 发 `domain/changed`）；读同步（内存权威）；损坏 → `malformed-medium`；版本不符 → `version-mismatch`（预发布立场，**不迁移**）；zod 在持久读取边界校验。JSON 单位文件格式（`~/.dsh/storages/workspace.json` 实证）：

```json
{ "unit": { "name": "wf_canvas", "version": 1 }, "global": {...}, "tables": { "meta": { "<canvasId>": {...} }, "body": {...} } }
```

### 1.2 官方 @Remote 网关机制（第三方插件可完整接入，已证实）

**Host 侧**（`dsh-message-feedback` 为标准范例）：

```js
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'

class MessageFeedbackService extends TypertRemoteService {
  static inject = ['storageDomain', 'sessionPersistence', 'sessions']
  constructor(ctx, config) { super(ctx, 'messageFeedback') }   // 服务名 = 网关 namespace
  async [Service.init]() {
    const domain = await this.ctx.storageDomain.open(spec)
    this.ctx.effect(() => async () => { await domain.close() }, '…domainClose')
    this.table = domain.table('sessions')
  }
  @Remote('list') async list(request) { ... }                  // 公开为远程方法
}
```

- `TypertRemoteService` 是 Cordis Service 子类：构造即注册服务 + `typertRemote` 绑定；gateway 以 source-mode discovery 发现（`dsh-typert-registry` 反射包元数据）。
- 包 exports 需提供 `./typert`（Host 线协议 schema，`typert.host.js`，zod 生成形态）与 `./remote`（Client contribution，`typert.remote-client.js`，`TYPERT_REMOTE` 形状：`{ invocations: [{ id, service, namespace, method, invocation, parameters: [{ name, wire, source, codec: { schema } }], result: { mode, schema } }] }`）。

**Client 侧**（关键：`$mount` 是公开运行时 API）：

`dsh-api-remotes/lib/client.js` 装配核心（源码实证）：

```js
for (const contribution of [ /* commands / goals / dynamicCordisRunner / pluginInventory / messageFeedback */ ])
  disposers.push(await ctx.remote.$mount(contribution))
```

即官方装配自身就是循环 `ctx.remote.$mount(contribution)`；`ctx.remote` 由 `dsh-api-remotes` 的 client 提供（`inject: ['remote']`）。**第三方 bundle 无需修改官方装配**——自己在 apply 里 `await ctx.remote.$mount(wfContribution)` 即可挂载 `remote.wfStorage`。`ui-message-feedback` 用法实证：`inject: ['remote', 'remote.messageFeedback']` → `ctx.remote.messageFeedback.list({...})`。

### 1.3 为什么这是「最佳」：差距对照

| # | 差距 | 自建现状 | v5 |
| --- | --- | --- | --- |
| G1 | 写原子性 | `fs.writeText` 直接覆写（崩溃半写） | 官方原子替换 |
| G2 | 并发 | 仅 saveMeta 加锁 | 官方写链 + update() RMW |
| G3 | 鉴权/schema | 裸 HTTP 路由 | 官方网关 + zod 线协议 |
| G4 | 索引一致性 | index.json + 扫描重建 | 单文件即全量 |
| G5 | 隐藏限制 | 100 条截断 | 无上限 |
| G6 | 删除安全 | shell 拼命令 | table.delete + node:fs rm |
| G7 | 协议维护 | 自研 `{method,args}` RPC + 同步 XHR 探测 | 官方 typert 线协议 + 注入式探测 |

---

## 2. 目标架构

```
浏览器（client bundle）
  useCanvasManager / hooks ──（零改动）──▶ CanvasStore 接口（P7 不变）
      └─ domainAdapter（新）── ctx.remote.$mount(wfContribution) 后经 ctx.remote.wfStorage.* 调用
                                              ▼ api-gateway（官方传输 + zod 校验）
宿主半（lib/index.js 重写为 Service 类）
  WfStorageService（TypertRemoteService，namespace 'wfStorage'）
      ├─ ctx.storageDomain.open(wfCanvasDomainSpec)（ctx.effect 注册 close）
      ├─ meta / body 两表 + global(lastCanvasId)
      └─ 媒体外置：~/.dsh/storages/wf-media/{cid}/{key}（node:fs，唯一例外）
                                              ▼
官方存储层（DSH 内置，已挂载）
  storage-domain ──▶ storage-json ──▶ ~/.dsh/storages/wf_canvas.json（原子写）
```

分层原则不变：业务层只认 `CanvasStore`；宿主半只认 `storageDomain`；媒体是唯一例外（官方 kv 面向 JSON 记录，二进制外置）。

---

## 3. 详细设计

### 3.1 领域声明（`lib/domain.js`）

```js
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'

// meta：严格 schema（列表门面）
const metaSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  schemaVersion: z.number().int().nonnegative(),
  createdAt: z.string(),          // ISO
  updatedAt: z.string(),
  elementCount: z.number().int().nonnegative(),
  hasMedia: z.boolean(),
})

// body：宽松 schema（Element 30+ 字段与前端注册表重复，持久边界只保形状；语义清洗走 sanitizeElements）
const bodySchema = z.object({
  schemaVersion: z.number().int().nonnegative(),
  elements: z.array(z.record(z.string(), z.unknown())).default([]),
}).passthrough()

export const wfCanvasDomainSpec = defineDomain({
  name: 'wf_canvas',              // 单位文件名 wf_canvas.json
  version: 1,                     // 布局破坏性变更才升；数据级兼容走 schemaVersion 字段（§5）
  global: {
    schema: z.object({ lastCanvasId: z.string().nullable() }),
    initial: { lastCanvasId: null },   // 最近打开指针（替代旧 last 键）
  },
  tables: {
    meta: domainTable(metaSchema),     // key = canvasId
    body: domainTable(bodySchema),     // key = canvasId
  },
})
```

**为什么单 domain（单文件）而不是每画布一 domain**：一个 domain = 一个单位文件 = 全部画布库。每画布一 domain 需动态 open N 个句柄 + 生命周期管理 + `UNIT_NAME_RE` 约束 uuid，数百画布不现实。画布文档量级为 K–数百 KB（300 元素存储往返基线 < 100ms，verify-perf），800ms 防抖 + 串行队列下整文件重写 + fsync 为本地 SSD 数 ms–数十 ms，无感。规模边界见 §6。

### 3.2 宿主半（`lib/index.js` 重写为 Service 类）

```js
import { Service } from '@deepseek-ai/cordis'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { wfCanvasDomainSpec } from './domain.js'
import { sanitizeElements } from '../src/core/storage/integrity.js'   // 复用（纯逻辑，无 React/DSH）

class WfStorageService extends TypertRemoteService {
  static inject = ['storageDomain']
  constructor(ctx) { super(ctx, 'wfStorage') }          // namespace = wfStorage → client: remote.wfStorage
  async [Service.init]() {
    this.domain = await this.openWithQuarantine()       // §4 损坏隔离
    this.ctx.effect(() => async () => { await this.domain.close() }, 'wf-storage.domainClose')
    this.meta = this.domain.table('meta')
    this.body = this.domain.table('body')
  }
  // …方法见 3.3 映射表，全部 @Remote 装饰
}
export default WfStorageService
```

- **包 exports 增加**：`"./typert"` → `lib/typert.host.js`（线协议 schema，§3.4）；`"./remote"` → `lib/typert.remote-client.js`（contribution，§3.5）。
- `lib/wf-storage.js`（自管文件库）与 `lib/index.js` 旧路由实现**整体删除**，其职责由 domain 操作取代；`integrity.js` 的 `sanitizeElements`/`isValidMeta` 保留复用（纯逻辑，迁入宿主半导入）。
- `~/.dsh/wf/config.json` 根目录配置删除（数据根由官方 `storage-json` 行决定，媒体根随之固定 `~/.dsh/storages/wf-media/`）。

### 3.3 方法映射（CanvasStore 契约 → domain，1:1，全部 @Remote）

| Remote 方法 | domain 实现 | 说明 |
| --- | --- | --- |
| `ping()` | 返回 `{ ok: true }` | 能力探测（client 初始化） |
| `listMeta(q)` | `meta.entries()` 内存过滤 keyword + 分页 + `updatedAt` 倒序 | 修复 100 条上限；读同步 |
| `getMeta(id)` | `meta.get(id)`，无则 `null` | |
| `loadBody(id)` | `body.get(id)` → `sanitizeElements` → `{ elements, schemaVersion, dropped }` | 结构清洗在宿主侧（与现状一致） |
| `saveMeta(meta)` | `meta.put(id, meta)` | 写链串行，互斥锁删除 |
| `saveBody(id, patch)` | `body.update(id, fn)`：fn 纯合并 `patch.set` / 删除 `patch.remove`，缺失时以 patch 为全量 | **原子 RMW**：读-改-写在同一写链槽内，天然兼容业务层全量快照语义，也支持未来真增量 |
| `putMedia(id, key, base64)` | node:fs 写 `~/.dsh/storages/wf-media/{cid}/{key}`（mkdir -p） | 与 kv 无关 |
| `getMedia(id, key)` | node:fs 读 → base64 回传 | |
| `remove(id)` | `body.delete(id)` → `meta.delete(id)` → node:fs `rm` 媒体目录 | 两次独立写（官方无跨表事务，§4）；meta 为门面，孤儿 body 无暴露路径 |
| `clear()` | 两表 entries 收集后逐条 delete + 清媒体根 | |

返回值统一 `{ ok: true, ... }` / `{ ok: false, error }` 信封（与现有 client 契约一致，domainAdapter 解析不变）。业务校验（缺 id 等）在宿主方法内显式返回错误分支，**不抛异常**（与 message-feedback 的 ok/error 风格一致）。

### 3.4 Host 线协议 schema（`lib/typert.host.js`）

照抄 `dsh-message-feedback/lib/typert.host.js` 的生成形态（zod，`invocations` 数组：`id`、`service: 'wfStorage'`、`namespace: 'wfStorage'`、`method`、`parameters[{ name, wire, source: 'json', codec: { mode: 'strict', schema } }]`、`result: { mode: 'strict', schema }`）。由 gateway 消费做参数/返回值校验。**手写维护**（wf 为纯 JS 项目，无 typert-generator 构建链；schema 数量 = 10 个方法，与 3.3 表一一对应）。

### 3.5 Client 挂载与调用（`src/core/storage/remote.js` 新文件）

```js
// contribution：invocations 与 typert.host.js 同构（可共享同一份 schema 定义源，双端 import）
export const wfRemoteContribution = { invocations: [ /* …10 方法 */ ] }

// client.js apply（异步初始化）：
const remote = ctx.get('remote')
if (remote) {
  await remote.$mount(wfRemoteContribution)      // 挂载 remote.wfStorage（公开 API，官方装配同款）
  defaultStore(createDomainRemote(remote))       // 注入 domainAdapter 后端
} // 无 remote → 降级链（localStorage）
```

- `domainAdapter`（`src/core/storage/adapters/domain.js`）：方法签名与 `hostFileAdapter` 完全一致，内部 `remote.wfStorage.listMeta(...)` 等；`ready` = `remote.wfStorage` 存在。
- `src/core/storage/rpc.js`（`createHostRpc`/`probeHostRpc` 同步 XHR）**删除**；`probeAdapters` 顺序改为 `domain(官方) > indexedDB > localStorage`，`hostSQLite` 保持预留桩。
- **异步初始化改造**：`client.js` apply 变 async（`await remote.$mount` 后建 store）；`defaultStore` 改为可缓存 Promise 的初始化函数（`initStore()`），`useCanvasManager` 的 `storeRef` 初始化点相应调整为 async 就绪后执行 `refreshDocs`/`restoreLast`（初始渲染用空列表，就绪后刷新——现逻辑已有 requestId 过期丢弃机制，直接复用）。
- `inject` 清单：client 增加 `@deepseek-ai/dsh-api-remotes`（`remote` 服务）+ zod（打包进 bundle 或 external 注入）。
- localStorage 旧键迁移、`sync` 变体路径（`initLast`）全部保留（降级形态不变）。

### 3.6 媒体外置（唯一例外）

- 媒体不进 kv：JSON 单位整文件重写 × base64 使写放大翻倍，且官方 kv 面向 JSON 记录。
- 位置：`~/.dsh/storages/wf-media/{canvasId}/{key}`（与数据同根、同备份单元），宿主半 node:fs 直读写（现有 mediaFs 注入模式保留）。
- 删除：node:fs `rm(path, { recursive: true, force: true })`——**不需要 shell**（此前用 shell 是因为走了 DSH fs 服务；宿主半本就运行在 Node 进程，直连 node:fs 即可）。
- 备选评估：`attachments` 服务是「会话不可变附件」语义（imageLimits、只读），不适合可变的画布文档资产，不用。

### 3.7 旧数据一次性迁移（宿主半启动）

```
检测 ~/Documents/界面草图/dsh-wf/ 存在且 domain 为空
  → 遍历 index.json / canvases/{cid}/（复用现有读取逻辑）
  → migrateFile（v0→v1）+ sanitizeElements
  → 写入 domain（saveMeta + saveBody）
  → 成功：目录改名 dsh-wf.migrated（可配置保留/删除）
  → 失败：保留原目录 + 错误日志（不阻塞启动，下次重试）
```

- localStorage 旧键迁移保留在 client（已有，不动）。
- 迁移只入不覆盖：domain 已有同名 id 时跳过。

---

## 4. 容错与一致性映射（P5 保留）

| 场景 | v5 行为 |
| --- | --- |
| 单位文件损坏 | 官方 open 抛 `malformed-medium` → `openWithQuarantine()`：文件改名 `.corrupt` 隔离 → 重新 open（空库）→ 服务可用 + 记录日志（宿主侧，画布打开时 toast 提示）；业务不崩 |
| 版本不匹配 | 官方 `version-mismatch` 拒绝 → 同上隔离流程；正常路径不会发生（§5 版本策略） |
| 元素结构非法 | `sanitizeElements` 逐元素清洗（宿主读时），dropped 计数随 loadBody 返回（现有逻辑） |
| 并发保存 | 官方单写链 + `update()` RMW；client 串行队列保留（双保险） |
| 删除中途失败 | 先删 body 再删 meta；meta 缺失即视为画布不存在（门面语义），孤儿 body 无暴露路径 |
| 崩溃恢复 | 官方原子写保证文件恒完整；「上次未正常关闭」提示逻辑保留（last 指针迁移到 global） |
| 网关/服务未挂载 | client 无 `remote` → 降级 localStorage（现役兜底，逻辑保留） |

---

## 5. 版本与迁移策略

- **domain `version: 1`** 只标识单位布局，**不随数据 schema 演进**（官方对 version 不匹配采取拒绝而非迁移）。数据级演进一律走：
  - `CanvasFile.schemaVersion` + `migrateFile()` 迁移链（v0→v1，已有）→ 在宿主读写入边界执行；
  - zod 宽松 schema（passthrough）保证旧记录可读、未知字段保留。
- 未来若必须破坏单位布局才升 domain version，并配套一次性迁移（检测 mismatch → 旧文件改名 `.legacy` → 重建 → 迁移数据）。

---

## 6. 规模演进边界（对齐官方路线图）

| 规模 | 方案 | 行为 |
| --- | --- | --- |
| 画布 < 50 / 元素 < 500 | `wf_canvas.json`（v5 默认） | 整文件重写无感 |
| 画布数百 / 元素数千 | 单文件写放大到 MB 级 | 拆表/每画布独立单位，或切 SQLite 后端（官方 roadmap：`sqlite` 后端与 `json` 并排挂载；**CanvasStore 接口不变，仅换后端名**） |
| 需跨画布检索/统计 | SQLite 后端（未来） | domain 表语义不变，entries() 改索引查询 |

与 v4 蓝本结论一致（IndexedDB 仅浏览器端降级；客户端画板不引入 WASM SQLite）；v5 把「宿主正式存储」从自建文件库升级为官方领域存储。

---

## 7. 实施计划（单轨，无过渡）

| 阶段 | 交付 | 验收 |
| --- | --- | --- |
| V5-1 宿主域内核 | `lib/domain.js` + `lib/index.js`（Service 类 + init/quarantine + 10 方法 @Remote）+ `lib/typert.host.js`；删除 `wf-storage.js` 文件库与 `/api/wf-storage` 路由、`~/.dsh/wf/config.json` 逻辑 | verify-host-storage 改造：以临时目录 json 后端（或注册内存 kv 后端）驱动 domain 全流程；26+ 断言全绿 |
| V5-2 客户端挂载 | `src/core/storage/remote.js`（contribution）+ `adapters/domain.js` + `client.js` 异步初始化 + `rpc.js` 删除 + probe 顺序调整 | verify-storage / adapter-contract 全绿；浏览器手工对照：官方存储保存/重开/损坏隔离/降级 |
| V5-3 旧数据迁移 | §3.7 一次性迁移 + 配置项 | 迁移测试：构造旧目录 → 启动迁移 → domain 数据一致 → 目录改名 |
| V5-4 文档 | ARCHITECTURE.md 第 4 章、README 存储演进表、CHANGELOG、安装说明（新增依赖 link） | 核对文档与实现一致；`npm run verify` 全绿 |

**新增依赖**：host `@deepseek-ai/dsh-storage-domain`（^0.1.0-rc.7）、`@deepseek-ai/dsh-typert-protocol`、`zod`；client `@deepseek-ai/dsh-api-remotes`（`remote` 服务）、`zod`。安装沿用现有 pnpm link 模式（`dsh plugin --profile web add`）。

**删除清单**：`lib/wf-storage.js`、`/api/wf-storage` 路由、`src/core/storage/rpc.js`、`~/.dsh/wf/config.json` 读取逻辑、shell 依赖（`inject` 移除 `shell`/`webServer`）。

---

## 8. 风险与权衡

| 风险 | 评估 | 缓解 |
| --- | --- | --- |
| 官方 JSON 后端写放大 | 画布量级下无感；MB 级才需处理 | §6 边界 + 800ms 防抖合并写 |
| 官方「不迁移」立场 | domain version 恒 1，数据级兼容走 schemaVersion + 宽松 schema | §5 |
| 数据位置变更 | `~/Documents/界面草图/` → `~/.dsh/storages/`（用户可见性下降） | 一次性迁移 + README 说明；导出 CanvasFile 仍是可读备份载体 |
| typert 线协议手写维护 | 10 方法 schema 双端各一份 | 共享同一 schema 定义源（`lib/wire.js`），host/remote 双端 import；verify 断言 schema 与接口一致 |
| 官方 API 属 rc 阶段 | 当前版本已挂载且 message-feedback 在产使用 | 适配器隔离（P7）：后端可回退，业务零改动 |
| client 异步初始化时序 | `remote.$mount` 为 async，store 就绪晚于首次渲染 | 列表用空态 + requestId 过期丢弃（现机制）；store 未就绪时保存入队等待 |
| 媒体在 kv 之外 | 与「存储即服务」略有出入 | 明确唯一例外 + 生命周期与画布绑定 |

---

## 附：可复用的同构结论

dsh-fm（`/api/fm`）、dsh-kb 同样自建路由 + fs 落盘。本设计的宿主侧模式（`storageDomain` + `TypertRemoteService` + `remote.$mount`）可完整平移；`WfStorageService` 即为可复制的官方范式样板。
