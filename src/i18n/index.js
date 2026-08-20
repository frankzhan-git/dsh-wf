// 文案表（i18n 最小落地，S5）：当前 zh 单语言，key 化预留多语言
// 使用范围：应用层 hooks 的 toast 消息 + 画板外壳主要按钮文案
// 展示组件内的字段 label/hint 暂保持字面（多语言需求出现时全量迁移）
const zh = {
  // toast
  'toast.limit': '控件数量已达上限（{max}），请先删除部分控件',
  'toast.capacity': '画布数据超出本地存储容量，请导出备份后清理',
  'toast.exportMissing': '画布数据不存在或已损坏',
  'toast.readFail': '读取文件失败',
  'toast.notJson': '文件不是合法 JSON',
  'toast.imported': '已导入画布：{name}',
  'toast.inputUnavailable': '输入框接口不可用，请刷新页面后重试',
  'toast.saveFailed': '画布保存失败：存储服务不可用，请检查后重试',
  'toast.pageNested': '被容器包含的控件不能设置为页面',
  'toast.containerHasKids': '包含子元素的容器不能设置为非容器',
  // 画板外壳
  'title': '界面草图',
  'rootNameLabel': '画布名称',
  'new': '新建',
  'newTitle': '新建画布（自动保存当前）',
  'fullscreen': '全屏',
  'exitFullscreen': '退出全屏 (Esc)',
  'close': '关闭 (Esc)',
  'cancel': '取消',
  'insert': '插入到输入框',
  'insertTitle': '将 JSONL 插入会话输入框',
  'insertErrorTitle': '存在错误，修复后可插入',
}

const LOCALE = zh // 当前语言（多语言时切换/合并此处）

// 取文案；{param} 占位符替换
export function t(key, params) {
  let s = LOCALE[key]
  if (s == null) return key
  if (params) {
    for (const k of Object.keys(params)) {
      s = s.split('{' + k + '}').join(String(params[k]))
    }
  }
  return s
}
