// 宿主 RPC 封装（P6 适配层）：client → /api/wf-storage（POST JSON { method, args } → { ok, ... }）
// 与 dsh-fm src/core/api.js 同构；宿主路由由 lib/index.js（host 半）注册
export function createHostRpc(path) {
  const endpoint = path || '/api/wf-storage'
  return {
    endpoint,
    // 调用宿主方法；返回 { ok, ... } 原始结果
    async call(method, args) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ method, args: args || {} }),
      })
      if (!res.ok) {
        let detail = ''
        try { detail = String(await res.text()).trim().slice(0, 200) } catch (e) { /* ignore */ }
        throw new Error('画布存储接口不可用（HTTP ' + res.status + '）' + (detail ? ' ' + detail : ''))
      }
      return res.json()
    },
  }
}

// 宿主路由探测（同步 XHR：client.js apply 阶段同步决定存储后端，避免异步竞态）
// 返回 rpc 或 null（路由不存在 → 降级 localStorage）
export function probeHostRpc(path) {
  try {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', path || '/api/wf-storage', false) // 同步：仅初始化时一次
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.send(JSON.stringify({ method: 'ping', args: {} }))
    if (xhr.status >= 200 && xhr.status < 300) {
      const r = JSON.parse(xhr.responseText || '{}')
      if (r && r.ok === true) return createHostRpc(path)
    }
    return null
  } catch (e) {
    return null
  }
}
