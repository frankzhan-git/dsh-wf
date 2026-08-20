// 嵌入输入框的包裹文本：自解释标准说明 + JSONL（+ 画布备注）
// 说明随 JSONL 一起进消息，任何模型无需预设知识即可精确解析

export const STANDARD_NOTE =
  '这是我绘制的界面草图，已转为 JSONL 语义描述。每行一个完整 JSON 对象 = 一个页面（设计稿）。字段含义：' +
  'type=节点类型(page/container/text/button/input/textarea/image/video/audio/icon/link/select/checkbox/radio/switch/progress/divider/badge，其中 page 表示一个页面/设计稿，为根节点类型)；' +
  'props=元素属性(text/placeholder/inputType/options/src/action等)；direction=容器方向(vertical上下/horizontal左右，默认vertical)；' +
  'wrap=true为流式布局；description=我对元素的要求说明。请严格按此结构理解我想要的界面：'

// 组装插入输入框的完整文本
// 画布级要求（跳转/未挂接备注）已合并进 JSON 根容器的 description，此处不再重复拼接
export function buildInsertText(jsonl) {
  return '[界面草图] ' + STANDARD_NOTE + '\n' + jsonl
}
