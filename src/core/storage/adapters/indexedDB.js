// 预留适配器（S6 接口契约验证）：IndexedDB 实现，待正式发布启用
// 接口契约与 CanvasStore 完全一致（方法齐全）；ready=false 表示未就绪，probeAdapters 不会选中
// 启用步骤：实现方法体 → ready 改为真实探测（typeof indexedDB !== 'undefined'）→ 更新 verify-adapter-contract
const UNIMPLEMENTED = () => { throw new Error('indexedDB 适配器为预留实现（未启用）') }

export function indexedDBAdapter() {
  return {
    name: 'indexedDB',
    ready: false, // 预留标记：未实现 → 不被 probeAdapters 选中（安全降级到 localStorage）
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
