// dsh-wf host half — 正式 Cordis 插件入口（官方存储域 + Typert Remote 网关）
// 存储内核：ctx.storageDomain（官方领域 KV，JSON 后端原子写：临时文件 + fsync + rename）
//   → 数据落 ~/.dsh/storages/wf_canvas.json（meta/body 两表 + global），媒体外置 ~/.dsh/storages/wf-media/
// 传输：ctx.typert.register(TYPERT_HOST) 严格描述符（zod 线协议校验）+ ctx.provide('wfStorage')
//   + bindTypertRemote → 浏览器经 api-gateway 以 remote.wfStorage.* 调用（官方 @Remote 范式）
// 生命周期：ctx.effect 注册 typert 卸载 + domain close
// 旧数据：v4 文件库（~/Documents/界面草图/dsh-wf/）启动时一次性迁移（尽力，不阻塞）
// 依赖可选（ctx.get）：非 web profile（无 storage-domain/typert）时宿主半无效果，client 自动降级 localStorage
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { bindTypertRemote } from '@deepseek-ai/dsh-typert-protocol'
import { createWfService } from './wf-service.js'
import { TYPERT_HOST } from './typert.host.js'
import { migrateLegacy } from './migrate-legacy.js'

const LEGACY_ROOT = join(homedir(), 'Documents', '界面草图', 'dsh-wf')

export default {
  name: 'dsh-wf',
  apply(ctx) {
    const storageDomain = ctx.get('storageDomain')
    const typert = ctx.get('typert')
    if (storageDomain === undefined || typert === undefined) return

    const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
    const mediaRoot = join(dshHome, 'storages', 'wf-media')

    ctx.effect(async () => {
      await mkdir(mediaRoot, { recursive: true })
      const service = await createWfService({ storageDomain, mediaRoot })

      // 服务注册（fiber 生命周期内）+ 网关绑定 + 严格描述符（gateway 发现 wfStorage/* 端点）
      ctx.provide('wfStorage', service)
      bindTypertRemote(service, 'wfStorage')
      const disposeTypert = typert.register(TYPERT_HOST)

      // 旧数据一次性迁移（尽力：失败保留原目录，下次启动重试；不阻塞存储服务）
      migrateLegacy(service, LEGACY_ROOT).catch(() => {})

      return async () => {
        disposeTypert()
        await service.close().catch(() => {})
      }
    }, 'wf-storage')
  },
}
