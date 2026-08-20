// dsh-wf host half — 正式 Cordis 插件入口（webServer 路由 /api/wf-storage 分发全部 RPC）
// 薄入口模式（与 dsh-kb 一致）：本文件只做服务获取、路由注册与错误包装；存储业务见 ./wf-storage.js
// 必须声明 inject：在 Loader 架构下，插件 apply 会在依赖服务提供前先执行，
// 没有 inject 时 ctx.get('fs') 等全部为 undefined，导致 apply 提前返回、路由从未注册。
// 事实核查（2025，参考 dsh-fm /api/fm 与 dsh-kb）：DSH 宿主无内置 storage.* 服务；
// 本插件自建 /api/wf-storage 路由（client 经 fetch 调用），用 DSH 的 fs 服务落盘。
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createWfStorageHandlers, fail } from './wf-storage.js'

const DEFAULT_ROOT = join(homedir(), 'Documents', '界面草图')

function configFile() {
  return join(homedir(), '.dsh', 'wf', 'config.json')
}
function loadConfig() {
  try { return JSON.parse(readFileSync(configFile(), 'utf8')) } catch (e) { return {} }
}
function saveConfig(config) {
  try {
    mkdirSync(join(homedir(), '.dsh', 'wf'), { recursive: true })
    writeFileSync(configFile(), JSON.stringify(config, null, 2), 'utf8')
    return true
  } catch (e) { return false }
}

export default {
  name: 'dsh-wf',
  inject: ['fs', 'shell', 'webServer'],
  apply(ctx) {
    const fs = ctx.get('fs')
    const shell = ctx.get('shell')
    const webServer = ctx.get('webServer')
    if (fs === undefined || shell === undefined || webServer === undefined) return

    const config = loadConfig()
    const root = config.root && typeof config.root === 'string' ? config.root : DEFAULT_ROOT

    const HANDLERS = createWfStorageHandlers({ fs, shell, root })

    // ---------- webServer 路由 ----------
    webServer.register({
      kind: 'exact',
      path: '/api/wf-storage',
      handler: (req, res) => {
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', async () => {
          let payload = {}
          try { payload = body ? JSON.parse(body) : {} } catch (e) { payload = {} }
          const method = payload && payload.method
          const fn = HANDLERS[method]
          let result
          try {
            result = fn ? await fn(payload.args || {}) : { ok: false, error: '未知方法：' + method }
          } catch (e) {
            result = fail(e)
          }
          try {
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify(result))
          } catch (e) { /* client gone */ }
        })
      },
    })
  },
}
