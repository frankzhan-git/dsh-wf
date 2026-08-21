// dsh-wf 宿主线协议贡献（gateway 严格路径）：ctx.typert.register(TYPERT_HOST)
// invocations 与客户端 remote contribution 的 descriptors 共用单一来源（lib/wire.js）
// 形态对齐官方生成物（dsh-message-feedback/lib/typert.host.js）
import { WF_INVOCATIONS } from './wire.js'

export const TYPERT_HOST = {
  package: 'dsh-wf',
  face: 'host',
  model: { name: 'dsh-wf', description: '界面草图画布库存储服务（CanvasStore 契约）' },
  schemas: [],
  invocations: WF_INVOCATIONS,
}

export default TYPERT_HOST
