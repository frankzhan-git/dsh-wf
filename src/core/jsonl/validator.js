// 校验：节点树结构合法性（注册表驱动，与 schema.json 对应）
// 返回 [{ level: 'error'|'warning', message }]

import { ALL_TYPES, isContainerType } from '../types.js'

export function validateTree(tree) {
  const issues = []
  if (!tree) {
    issues.push({ level: 'error', message: '画布为空：请先绘制界面草图' })
    return issues
  }
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') {
      issues.push({ level: 'error', message: `${path} 不是有效节点` })
      return
    }
    if (ALL_TYPES.indexOf(node.type) === -1) {
      issues.push({ level: 'error', message: `${path} 类型「${node.type}」不在标准内` })
    }
    // 规则：容器可嵌套任意内容，非容器不可嵌套（由注册表 isContainer 推导）
    if (!isContainerType(node.type) && node.children && node.children.length) {
      issues.push({ level: 'error', message: `${path} 非容器类型不应包含子节点` })
    }
    if (isContainerType(node.type)) {
      if (node.direction !== undefined && node.direction !== 'horizontal' && node.direction !== 'vertical') {
        issues.push({ level: 'error', message: `${path} direction 仅允许 horizontal/vertical` })
      }
      if (node.wrap !== undefined && typeof node.wrap !== 'boolean') {
        issues.push({ level: 'error', message: `${path} wrap 必须是布尔值` })
      }
    }
    if (node.children) {
      node.children.forEach((c, i) => walk(c, `${path}.children[${i}]`))
    }
  }
  walk(tree, '#')
  return issues
}

// JSONL 文本逐行校验（P5 容错：非法行不抛，收集为 issue）
export function validateJsonl(text) {
  const issues = []
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) {
    issues.push({ level: 'error', message: '画布为空：请先绘制界面草图' })
    return issues
  }
  lines.forEach((line, i) => {
    let node
    try {
      node = JSON.parse(line)
    } catch (e) {
      issues.push({ level: 'error', message: `第 ${i + 1} 行不是合法 JSON：${String(e.message || e)}` })
      return
    }
    issues.push(...validateTree(node).map((x) => ({ ...x, message: `第 ${i + 1} 行：${x.message}` })))
  })
  return issues
}
