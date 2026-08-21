// dsh-wf 线协议描述（单一来源）
// 职责：画布记录 schema + 远程调用描述（invocations/descriptors），宿主 typert.host.js 与客户端
//       remote contribution 双端共用，保证线协议永远一致。
// 边界：只依赖 zod（宿主半与 client bundle 均可 import；client 打包只携带本文件 + zod，
//       不引入任何 @deepseek-ai/* —— 那是 external）。
// 导出：META_SCHEMA / BODY_SCHEMA / WF_INVOCATIONS
import { z } from 'zod'

// ---------- 画布记录 schema（线协议校验；持久介质为 wf-canvases/{id}.json，语义清洗走 sanitizeElements） ----------

export const META_SCHEMA = z.object({
  id: z.string().min(1),
  name: z.string(),
  schemaVersion: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  elementCount: z.number().int().nonnegative(),
  hasMedia: z.boolean(),
})

// body 宽松（Element 30+ 字段与前端注册表重复，线协议只保形状；语义清洗走 sanitizeElements）
export const BODY_SCHEMA = z.object({
  schemaVersion: z.number().int().nonnegative(),
  elements: z.array(z.record(z.string(), z.unknown())).default([]),
}).passthrough()

// ---------- 远程调用描述（gateway 严格路径；参数/结果 zod 校验） ----------

const elementRecord = z.record(z.string(), z.unknown())

const okTrue = z.object({ ok: z.literal(true) })
const pingResult = z.object({ ok: z.literal(true), storage: z.string() })
const listMetaArg = z.object({
  page: z.number().int().nonnegative().optional(),
  pageSize: z.number().int().positive().optional(),
  keyword: z.string().optional(),
})
const listMetaResult = z.object({
  ok: z.literal(true),
  items: z.array(META_SCHEMA),
  total: z.number().int().nonnegative(),
})
const getMetaResult = z.object({ ok: z.literal(true), meta: META_SCHEMA.nullable() })
const loadBodyResult = z.object({
  ok: z.literal(true),
  body: z.object({
    elements: z.array(elementRecord),
    schemaVersion: z.number().int().nonnegative(),
    dropped: z.number().int().nonnegative(),
  }).nullable(),
})
const saveBodyArg = z.object({
  id: z.string().min(1),
  patch: z.object({
    set: z.record(z.string(), elementRecord).default({}),
    remove: z.array(z.string()).default([]),
  }),
})
const putMediaArg = z.object({ id: z.string().min(1), key: z.string().min(1), base64: z.string() })
const mediaArg = z.object({ id: z.string().min(1), key: z.string().min(1) })
const getMediaResult = z.object({
  ok: z.literal(true),
  media: z.object({ base64: z.string(), size: z.number().int().nonnegative() }).nullable(),
})

const SRC = { file: 'dsh-wf/lib/wire.js', line: 1, column: 1 }
const strict = (schema, typeSymbol) => ({ mode: 'strict', typeSymbol, schema })

export const WF_INVOCATIONS = [
  {
    id: 'dsh-wf#wfStorage/ping',
    service: 'wfStorage', namespace: 'wfStorage', method: 'ping',
    invocation: { kind: 'direct' }, parameters: [],
    result: strict(pingResult, 'dsh-wf#WfPingResult'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/listMeta',
    service: 'wfStorage', namespace: 'wfStorage', method: 'listMeta',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'q', wire: 'q', source: 'json', codec: strict(listMetaArg, 'dsh-wf#WfListMetaRequest') }],
    result: strict(listMetaResult, 'dsh-wf#WfListMetaResult'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/getMeta',
    service: 'wfStorage', namespace: 'wfStorage', method: 'getMeta',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'id', wire: 'id', source: 'json', codec: strict(z.string().min(1), 'dsh-wf#WfCanvasId') }],
    result: strict(getMetaResult, 'dsh-wf#WfGetMetaResult'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/loadBody',
    service: 'wfStorage', namespace: 'wfStorage', method: 'loadBody',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'id', wire: 'id', source: 'json', codec: strict(z.string().min(1), 'dsh-wf#WfCanvasId') }],
    result: strict(loadBodyResult, 'dsh-wf#WfLoadBodyResult'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/saveMeta',
    service: 'wfStorage', namespace: 'wfStorage', method: 'saveMeta',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'meta', wire: 'meta', source: 'json', codec: strict(META_SCHEMA, 'dsh-wf#WfCanvasMeta') }],
    result: strict(okTrue, 'dsh-wf#WfOk'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/saveBody',
    service: 'wfStorage', namespace: 'wfStorage', method: 'saveBody',
    invocation: { kind: 'direct' },
    parameters: [
      { name: 'id', wire: 'id', source: 'json', codec: strict(z.string().min(1), 'dsh-wf#WfCanvasId') },
      { name: 'patch', wire: 'patch', source: 'json', codec: strict(saveBodyArg.shape.patch, 'dsh-wf#WfElementsPatch') },
    ],
    result: strict(okTrue, 'dsh-wf#WfOk'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/putMedia',
    service: 'wfStorage', namespace: 'wfStorage', method: 'putMedia',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'arg', wire: 'arg', source: 'json', codec: strict(putMediaArg, 'dsh-wf#WfPutMediaRequest') }],
    result: strict(okTrue, 'dsh-wf#WfOk'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/getMedia',
    service: 'wfStorage', namespace: 'wfStorage', method: 'getMedia',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'arg', wire: 'arg', source: 'json', codec: strict(mediaArg, 'dsh-wf#WfMediaRequest') }],
    result: strict(getMediaResult, 'dsh-wf#WfGetMediaResult'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/remove',
    service: 'wfStorage', namespace: 'wfStorage', method: 'remove',
    invocation: { kind: 'direct' },
    parameters: [{ name: 'id', wire: 'id', source: 'json', codec: strict(z.string().min(1), 'dsh-wf#WfCanvasId') }],
    result: strict(okTrue, 'dsh-wf#WfOk'), sourceLocation: SRC,
  },
  {
    id: 'dsh-wf#wfStorage/clear',
    service: 'wfStorage', namespace: 'wfStorage', method: 'clear',
    invocation: { kind: 'direct' }, parameters: [],
    result: strict(okTrue, 'dsh-wf#WfOk'), sourceLocation: SRC,
  },
]
