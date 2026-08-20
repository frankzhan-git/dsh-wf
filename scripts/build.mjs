// 构建 dsh-wf 的 client bundle（ModuleLoader 格式）
// 依赖：react / react/jsx-runtime / @deepseek-ai/* 保留为共享 require；其余第三方库内联。
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

// banner id 必须与 cordis.patch.yml 中的 name 一致（dsh界面草图）
const banner = `window.__ModuleLoader__.load({
  id: "dsh界面草图",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
`

const footer = `return module.exports;
  }
});
`

await build({
  entryPoints: [join(root, 'src', 'client.js')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  outfile: join(root, 'lib', 'client.js'),
  external: ['react', 'react/jsx-runtime', 'react-dom', '@deepseek-ai/*'],
  banner: { js: banner },
  footer: { js: footer },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
})

console.log('client bundle built -> lib/client.js')
