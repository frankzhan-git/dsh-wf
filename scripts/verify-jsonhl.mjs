// 临时验证：JSON 格式化 + 分词
import { formatJson, tokenizeJson } from '../src/core/jsonl/prettify.js'

const jsonl = '{"type":"container","name":"登录页","children":[{"type":"input","name":"用户名","props":{"placeholder":"请输入","value":123}},{"type":"button","props":{"text":"登录","ok":true,"n":null}}]}'
const f = formatJson(jsonl)
console.log('--- formatted ---')
console.log(f)
const toks = tokenizeJson(f)
const cls = {}
for (const t of toks) cls[t.c] = (cls[t.c] || 0) + 1
console.log('--- token classes ---')
console.log(JSON.stringify(cls))
const keys = toks.filter((t) => t.c === 'key').map((t) => t.t).join(',')
console.log('--- keys ---')
console.log(keys)
const ok = (c, n) => { if (!c) { console.log('FAIL ' + n); process.exit(1) } console.log('PASS ' + n) }
ok(cls.key >= 5, '键名分词')
ok(cls.str >= 4, '字符串值分词')
ok(cls.num >= 1, '数字分词')
ok(cls.lit >= 2, 'true/null 字面量分词')
ok(f.split('\n').length > 5, '多行格式化')
ok(!f.includes('\t'), '缩进为空格')

// 多页面（多行 JSONL）：每行独立美化，预览始终结构化
const multi = '{"type":"page","name":"登录页","children":[{"type":"text","props":{"text":"hi"}}]}\n{"type":"page","name":"首页","children":[]}'
const fm = formatJson(multi)
console.log('--- multi-line formatted ---')
console.log(fm)
const fmLines = fm.split('\n')
ok(fmLines.length > 8, '多行输入每行独立美化（结构化展示）')
ok(fm.includes('"name": "登录页"') || fm.includes('"name":"登录页"'), '第一页保留内容')
ok(fm.includes('"name": "首页"') || fm.includes('"name":"首页"'), '第二页保留内容')
ok(tokenizeJson(fm).length > 0, '美化后仍可分词上色')
