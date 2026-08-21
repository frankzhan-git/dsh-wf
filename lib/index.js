// dsh-wf host half — 正式 Cordis 插件入口（目录文件存储 + Typert Remote 网关）
// 存储介质：宿主半 node:fs 自管目录文件（每画布一个 JSON，原子写：临时文件 + fsync + rename）
//   → 数据落 <DSH 数据根>/storages/wf-canvases/{canvasId}.json（归类目录，可读可备份），
//     媒体 <root>/wf-media/{cid}/{key}（二进制外置）；官方 json 后端单位文件平铺互不干扰
// 传输：ctx.typert.register(TYPERT_HOST) 严格描述符（zod 线协议校验）+ ctx.provide('wfStorage')
//   + bindTypertRemote → 浏览器经 api-gateway 以 remote.wfStorage.* 调用（官方 @Remote 范式）
// 生命周期：ctx.effect 注册 typert 卸载 + service.close
// 迁移：旧官方域单位文件 wf_canvas.json → 每画布文件（init 内自动拆分）；
//       v4 旧文件库（~/Documents/界面草图/dsh-wf/）启动时一次性迁移（尽力，不阻塞）
// 依赖可选（ctx.get）：非 web profile（无 typert）时宿主半无效果，client 自动降级 localStorage
import { homedir } from 'node:os'
import { join } from 'node:path'
import { bindTypertRemote } from '@deepseek-ai/dsh-typert-protocol'
import { createWfService } from './wf-service.js'
import { TYPERT_HOST } from './typert.host.js'
import { migrateLegacy } from './migrate-legacy.js'

const LEGACY_ROOT = join(homedir(), 'Documents', '界面草图', 'dsh-wf')

export default {
  name: 'dsh-wf',
  apply(ctx) {
    const typert = ctx.get('typert')
    if (typert === undefined) return

    const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
    const storagesRoot = join(dshHome, 'storages')
    const mediaRoot = join(storagesRoot, 'wf-media')

    ctx.effect(async () => {
      const service = await createWfService({ storagesRoot, mediaRoot })

      // 服务注册（fiber 生命周期内）+ 网关绑定 + 严格描述符（gateway 发现 wfStorage/* 端点）
      ctx.provide('wfStorage', service)
      bindTypertRemote(service, 'wfStorage')
      const disposeTypert = typert.register(TYPERT_HOST)

      // v4 旧文件库一次性迁移（尽力：失败保留原目录，下次启动重试；不阻塞存储服务）
      migrateLegacy(service, LEGACY_ROOT).catch(() => {})

      return async () => {
        disposeTypert()
        await service.close().catch(() => {})
      }
    }, 'wf-storage')
  },
}
