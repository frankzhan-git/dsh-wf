// dsh-wf 宿主半：画布库领域声明（官方 storage-domain 数据形态）
// 职责：声明 wf_canvas domain（meta/body 两表 + global 最近打开槽）；zod schema 在持久边界校验
// 边界：只做声明，不含 IO/业务（业务见 ./wf-service.js）；仅宿主半使用（依赖 @deepseek-ai/dsh-storage-domain）
// 导出：wfCanvasDomainSpec
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import { META_SCHEMA, BODY_SCHEMA, GLOBAL_SCHEMA } from './wire.js'

export const wfCanvasDomainSpec = defineDomain({
  name: 'wf_canvas',               // 单位文件名 wf_canvas.json（~/.dsh/storages/）
  version: 1,                      // 布局破坏性变更才升；数据级兼容走 CanvasFile.schemaVersion + 宽松 schema
  global: {
    schema: GLOBAL_SCHEMA,
    initial: { lastCanvasId: null },   // 最近打开指针（预留；client 现按 listMeta 排序恢复）
  },
  tables: {
    meta: domainTable(META_SCHEMA),    // key = canvasId，value = CanvasFileMeta
    body: domainTable(BODY_SCHEMA),    // key = canvasId，value = { schemaVersion, elements }
  },
})
