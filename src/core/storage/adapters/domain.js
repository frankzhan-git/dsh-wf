// 官方存储域适配器（v5：CanvasStore 契约 → remote.wfStorage）
// 与旧 hostFileAdapter 同构：ready = remote 可用；invoke 解析业务信封（{ ok, ... }）
// 接口契约与 CanvasStore 完全一致；probeAdapters 探测到 remote 即自动升级
const UNIMPLEMENTED = () => { throw new Error('domain 适配器未初始化（remote 缺失）') }

export function domainAdapter(remote) {
  const call = remote && typeof remote.call === 'function' ? remote.call.bind(remote) : null
  const invoke = async (method, args, fallback) => {
    if (!call) return fallback
    const r = await call(method, args)
    if (!r || r.ok !== true) throw new Error(r && r.error ? r.error : '画布存储调用失败：' + method)
    return r
  }
  return {
    name: 'domain',
    ready: !!call,
    rpc: remote || null,
    listMeta: async (q) => {
      const r = await invoke('listMeta', { q: q || {} }, { items: [], total: 0 })
      return { items: (r.items) || [], total: (r.total) || 0 }
    },
    getMeta: async (id) => {
      const r = await invoke('getMeta', { id }, null)
      return r.meta || null
    },
    loadBody: async (id) => {
      const r = await invoke('loadBody', { id }, null)
      return r.body || null
    },
    saveMeta: async (meta) => {
      await invoke('saveMeta', { meta }, null)
    },
    saveBody: async (id, patch) => {
      await invoke('saveBody', { id, patch: patch || { set: {}, remove: [] } }, false)
      return true
    },
    putMedia: async (id, key, blob) => {
      // blob → base64（宿主经 node:fs 写二进制文件）
      const base64 = await new Promise((resolve) => {
        const rd = new FileReader()
        rd.onload = () => resolve(String(rd.result || '').split(',')[1] || '')
        rd.onerror = () => resolve('')
        rd.readAsDataURL(blob)
      })
      if (!base64) return false
      await invoke('putMedia', { arg: { id, key, base64 } }, false)
      return true
    },
    getMedia: async (id, key) => {
      const r = await invoke('getMedia', { arg: { id, key } }, null)
      if (!r.media) return null
      const bin = atob(r.media.base64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new Blob([bytes], { type: 'application/octet-stream' })
    },
    remove: async (id) => { await invoke('remove', { id }, null) },
    clear: async () => { await invoke('clear', {}, null) },
  }
}
