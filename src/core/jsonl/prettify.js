// JSON 格式化 + 语法分词（纯函数，零依赖）——由 src/core/jsonHighlight.js 迁移而来
// tokenizeJson 返回 [{ t: 文本, c: 颜色类 }]，c ∈ '' | 'key' | 'str' | 'num' | 'lit' | 'punc'

// JSONL 美化：每行独立格式化（2 空格缩进），行间空行分隔；解析失败的行原样保留
// 保证多页面（多行 JSONL）时预览始终是结构化展示，而非单行紧凑描述
export function formatJson(jsonl) {
  if (!jsonl) return ''
  const lines = String(jsonl).split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return ''
  return lines.map((line) => {
    try {
      return JSON.stringify(JSON.parse(line), null, 2)
    } catch (e) {
      return line
    }
  }).join('\n\n')
}

const WS = new Set([' ', '\n', '\t', '\r'])
const isDigit = (c) => c >= '0' && c <= '9'
const isWord = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'

export function tokenizeJson(text) {
  const out = []
  const n = text.length
  let i = 0
  const push = (t, c) => { if (t) out.push({ t, c: c || '' }) }

  while (i < n) {
    const ch = text[i]
    if (ch === '"') {
      // 扫描字符串（含转义）
      let j = i + 1
      let esc = false
      while (j < n) {
        const c2 = text[j]
        if (c2 === '\\' && !esc) { esc = true; j++; continue }
        if (c2 === '"' && !esc) { j++; break }
        esc = false
        j++
      }
      const str = text.slice(i, j)
      i = j
      // 判断是否为键名（跳过空白后跟冒号）
      let k = i
      while (k < n && WS.has(text[k])) k++
      push(str, text[k] === ':' ? 'key' : 'str')
    } else if (isDigit(ch) || (ch === '-' && i + 1 < n && isDigit(text[i + 1]))) {
      let j = i + 1
      while (j < n && /[0-9.eE+\-]/.test(text[j])) j++
      push(text.slice(i, j), 'num')
      i = j
    } else if (isWord(ch)) {
      let j = i
      while (j < n && isWord(text[j])) j++
      const word = text.slice(i, j)
      push(word, word === 'true' || word === 'false' || word === 'null' ? 'lit' : '')
      i = j
    } else if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === ':' || ch === ',') {
      push(ch, 'punc')
      i++
    } else {
      // 空白等原样输出
      let j = i
      while (j < n) {
        const c2 = text[j]
        if (c2 === '"' || isDigit(c2) || isWord(c2) ||
            c2 === '{' || c2 === '}' || c2 === '[' || c2 === ']' || c2 === ':' || c2 === ',' ||
            (c2 === '-' && j + 1 < n && isDigit(text[j + 1]))) break
        j++
      }
      push(text.slice(i, j), '')
      i = j
    }
  }
  return out
}
