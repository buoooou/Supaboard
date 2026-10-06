// 打包 theme/Supaboard 为 zip，用于在管理后台「主题配置 → 上传主题」
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const projectRoot = path.resolve(root, '../..')
const themeParent = path.resolve(projectRoot, 'theme')
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
const outDir = path.join(root, 'release')
const rootOutDir = path.join(projectRoot, 'release')
const out = path.join(outDir, `Supaboard-${version}.zip`)
const latestOut = path.join(outDir, 'Supaboard.zip')

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(rootOutDir, { recursive: true })
fs.rmSync(out, { force: true })
fs.rmSync(latestOut, { force: true })

// 打包，使用 -X 剔除 macOS 额外属性，并排除 .DS_Store 及 __MACOSX 目录
execFileSync(
  'zip',
  ['-rq', '-X', out, 'Supaboard', '-x', '*.DS_Store', '__MACOSX*', '*/.DS_Store*'],
  { cwd: themeParent, stdio: 'inherit' },
)

fs.copyFileSync(out, latestOut)
fs.copyFileSync(out, path.join(rootOutDir, `Supaboard-${version}.zip`))
fs.copyFileSync(out, path.join(rootOutDir, 'Supaboard.zip'))

const stat = fs.statSync(out)
const sizeMb = (stat.size / 1024 / 1024).toFixed(2)
console.log(`✓ Zip package generated: ${path.relative(process.cwd(), out)} (${sizeMb} MB)`)
console.log(`✓ Also available at: release/Supaboard.zip (${sizeMb} MB)`)

if (stat.size > 10 * 1024 * 1024) {
  console.warn(`⚠️ Warning: Package size (${sizeMb} MB) exceeds Xboard 10MB limit!`)
} else {
  console.log(`✓ Package size is well within the 10MB limit.`)
}
