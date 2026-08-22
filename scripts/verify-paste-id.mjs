// 回归验证：复制粘贴 id 唯一性（浏览器刷新后 seq 归零的场景）
// 背景（bug）：模块级 seq 只在页面生命周期内递增；刷新后归零，而画布元素 id 仍从 e1 起。
// 此前 buildPaste 直接用 nextId() → 副本 id 与已载入元素重复 → 副本无法独立选中/拖动/删除
// （按 id 操作命中原元素，用户感知「复制粘贴假死」），自动保存还会按 id 覆盖原元素。
// 修复：① reserveSeqs 在载入点推进 seq；② buildPaste 带 existing 逐次跳过冲突（防御）。
// 本脚本必须在独立进程运行（模拟刷新后的模块状态），与 verify-interactions 分开。
import { reserveSeqs, nextId } from '../src/core/model.js'
import { collectCopySet, buildPaste, PASTE_OFFSET } from '../src/core/interactions.js'

const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) process.exitCode = 1 }
const section = (t) => console.log('\n=== ' + t + ' ===')

// 字面构造「刷新后从 localStorage 加载的旧画布」：id 从 e1 起，不经 createElement（seq 保持 0）
const base = (extra) => Object.assign({
  kind: 'rect', type: null, x: 0, y: 0, w: 0, h: 0, radius: 4,
  text: '', note: '', src: '', name: '', action: '', inputType: '', optionsText: '',
  value: '', max: '', alt: '', href: '', label: '', iconSize: '',
  checked: false, controls: false, autoplay: false, poster: '',
}, extra)
const legacy = [
  base({ id: 'e1', type: 'page', x: 20, y: 20, w: 760, h: 480 }),
  base({ id: 'e2', type: 'container', x: 60, y: 60, w: 300, h: 200, text: '登录卡片' }),
  base({ id: 'e3', type: 'button', x: 100, y: 100, w: 120, h: 36, radius: 6, text: '登录' }),
]
const loaded = JSON.parse(JSON.stringify(legacy))

// ---------- ① 防御层：未 reserve 但 buildPaste 带 existing（id 起始即撞车） ----------
section('buildPaste existing 防御（nextId 从 e1 起，全部与加载元素撞车）')
{
  const copySet = collectCopySet(loaded, ['e1'])
  const copies = buildPaste(copySet, PASTE_OFFSET, PASTE_OFFSET, loaded.map((e) => e.id))
  const dup = copies.filter((c) => loaded.some((e) => e.id === c.id))
  ok(copies.length === 3, '粘贴副本数 = 页面 + 内部 2 个子元素')
  ok(dup.length === 0, '副本 id 与已加载元素零冲突（依次跳过 e1/e2/e3）')
  ok(new Set(copies.map((c) => c.id)).size === copies.length, '副本内部 id 亦无重复')
  ok(copies.every((c) => c.x >= 44 && c.y >= 44), '副本整体 +24 偏移保持')
}

// ---------- ② 主修复：reserveSeqs 推进 seq ----------
section('reserveSeqs 推进（载入即恢复 id 序列）')
{
  reserveSeqs(loaded)
  const n = nextId()
  ok(!loaded.some((e) => e.id === n), 'reserveSeqs 后 nextId 不与已载入元素冲突（' + n + '）')
}

// ---------- ③ 完整登录链：reserve → 复制 → 粘贴 → 全部唯一 ----------
section('完整链：载入（reserve）→ 复制页面 → 粘贴')
{
  const els = JSON.parse(JSON.stringify(loaded)) // 再次模拟一次载入（reserve 幂等）
  reserveSeqs(els)
  const copySet = collectCopySet(els, ['e1'])
  const copies = buildPaste(copySet, PASTE_OFFSET, PASTE_OFFSET, els.map((e) => e.id))
  const merged = els.concat(copies)
  ok(new Set(merged.map((e) => e.id)).size === merged.length, '合并后全部 id 唯一（无重复键）')
  const cPage = copies.find((c) => c.type === 'page')
  ok(cPage && cPage.x === 20 + PASTE_OFFSET && cPage.y === 20 + PASTE_OFFSET, '副本整体 +24 偏移')
  // 模拟「点击副本 → 选中（id 语义命中唯一元素）」——id 唯一后副本可独立寻址
  const cBtn = copies.find((c) => c.text === '登录')
  const sel = merged.find((e) => e.id === cBtn.id)
  ok(sel && sel.text === '登录' && sel.x === 100 + PASTE_OFFSET, '副本可被 id 独立选中（id 语义命中的是副本自身）')
}

console.log('\n' + (process.exitCode === 1 ? '✗ 有断言失败' : '✓ 复制粘贴 id 唯一性全部通过'))
