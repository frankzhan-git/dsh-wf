// 预留适配器（S6 接口契约验证）：宿主 SQLite（规模演进：画布数百份/跨画布检索时启用）
// v2.1 现状：画布正文介质为宿主半目录文件（wf-canvases/，domain 适配器现役）；SQLite 是规模
// 演进项（CanvasStore 接口不变，仅换宿主侧介质实现）。
// 接口契约与 CanvasStore 完全一致；ready=false 表示未就绪，probeAdapters 不会选中
const UNIMPLEMENTED = () => { throw new Error('hostSQLite 适配器为预留实现（规模演进时启用）') }

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
