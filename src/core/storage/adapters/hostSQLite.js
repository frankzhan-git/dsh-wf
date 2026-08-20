// 预留适配器（S6 接口契约验证）：宿主 SQLite（正式发布推荐：WAL 单文件，事务增量）
// 事实核查（dsh-fm 模式）：DSH 宿主无内置 storage.* 服务；需宿主半实现 webServer 路由
// （webServer.register('/api/wf-storage') + inject ['fs','webServer']，参考 dsh-fm /api/fm），
// client 经 fetch 封装（POST JSON { method, args } → { ok, ... }）作为 rpc 参数传入。
// 接口契约与 CanvasStore 完全一致；ready=false 表示未就绪（宿主路由未上线），probeAdapters 不会选中
const UNIMPLEMENTED = () => { throw new Error('hostSQLite 适配器为预留实现（宿主路由未上线）') }

export function hostSQLiteAdapter(rpc) {
  // 未来实现：ready = !!(rpc && typeof rpc.call === 'function')；方法体经 rpc.call(method, args) 转发
  return {
    name: 'hostSQLite',
    ready: false,
    rpc: rpc || null,
    listMeta: UNIMPLEMENTED,
    getMeta: UNIMPLEMENTED,
    loadBody: UNIMPLEMENTED,
    saveMeta: UNIMPLEMENTED,
    saveBody: UNIMPLEMENTED,
    putMedia: UNIMPLEMENTED,
    getMedia: UNIMPLEMENTED,
    remove: UNIMPLEMENTED,
    clear: UNIMPLEMENTED,
  }
}
