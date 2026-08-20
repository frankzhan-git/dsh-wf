// 宿主 JSON 目录适配器（正式发布：零依赖，可读可 git）
// 事实核查（dsh-fm 模式）：DSH 宿主无内置 storage.* 服务；宿主半实现 webServer 路由
// （lib/index.js 注册 /api/wf-storage，inject ['fs','webServer']，用 DSH fs 服务落盘），
// rpc = createHostRpc() 的 fetch 封装（{ call(method, args) → { ok, ... } }）。
// 落盘：`<root>/dsh-wf/canvases/{cid}/`{meta.json, body.json, media/{key}} + index.json
// 接口契约与 CanvasStore 完全一致；ready = 宿主路由可用（probeAdapters 自动升级）
const UNIMPLEMENTED = () => { throw new Error('hostFile 适配器未初始化（rpc 缺失）') }

export function hostFileAdapter(rpc) {
  const call = rpc && typeof rpc.call === 'function' ? rpc.call.bind(rpc) : null
  const invoke = async (method, args, fallback) => {
    if (!call) return fallback
    const r = await call(method, args)
    if (!r || r.ok !== true) throw new Error(r && r.error ? r.error : '画布存储调用失败：' + method)
    return r
  }
  return {
    name: 'hostFile',
    ready: !!call,
    rpc: rpc || null,
    listMeta: async (q) => {
      const r = await invoke('listMeta', q, { items: [], total: 0 })
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
      await invoke('saveBody', { id, patch }, false)
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
      await invoke('putMedia', { id, key, base64 }, false)
      return true
    },
    getMedia: async (id, key) => {
      const r = await invoke('getMedia', { id, key }, null)
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
