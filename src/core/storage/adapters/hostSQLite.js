// 预留适配器（S6 接口契约验证）：宿主 SQLite（规模演进：画布数百份/跨画布检索时启用）
// v5 演进：存储后端由官方 storage-domain 承担（domain 适配器现役）；SQLite 是官方路线图的
// 后端替换项（`sqlite` 后端与 `json` 并排挂载，CanvasStore 接口不变，仅换后端路由）。
// 接口契约与 CanvasStore 完全一致；ready=false 表示未就绪（官方 sqlite 后端未发布），probeAdapters 不会选中
const UNIMPLEMENTED = () => { throw new Error('hostSQLite 适配器为预留实现（官方 sqlite 后端未发布）') }

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
