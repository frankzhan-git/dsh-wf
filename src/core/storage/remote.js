// 官方 @Remote 网关接入（P6 适配层）：client 挂载 remote.wfStorage 并封装调用
// $mount 为公开运行时 API（api-remotes 装配同款：await ctx.remote.$mount(contribution)）；
// descriptors 与宿主 typert.host.js 的 invocations 共用单一来源（lib/wire.js）
// 信封：remote.wfStorage.* 返回载体层 { ok, value }；value 为业务层 { ok, ... } | { ok: false, error }
import { WF_INVOCATIONS } from '../../../lib/wire.js'

export const wfRemoteContribution = { package: 'dsh-wf', descriptors: WF_INVOCATIONS }

// remote → rpc 封装（{ call(method, args) → 业务信封 }，形状同旧 createHostRpc）
export function createDomainRemote(remote) {
  const ns = remote && remote.wfStorage
  return {
    endpoint: 'remote.wfStorage',
    async call(method, args) {
      const fn = ns && ns[method]
      if (typeof fn !== 'function') return { ok: false, error: '画布存储方法不可用：' + method }
      const carried = await fn(args || {})
      if (!carried || carried.ok !== true) {
        const err = carried && carried.error
        return { ok: false, error: err && err.message ? err.message : (err ? String(err) : '载体调用失败') }
      }
      return carried.value || { ok: true }
    },
  }
}
