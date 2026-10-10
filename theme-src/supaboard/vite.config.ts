import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { prerender } from './scripts/prerender.mjs'

const THEME_NAME = 'Supaboard'
const BASE = `/theme/${THEME_NAME}/assets/`
const themeDir = fileURLToPath(new URL(`../../theme/${THEME_NAME}`, import.meta.url))

/**
 * 自动提取博客文章元信息生成轻量索引文件 blog-meta.json，
 * 避免在构建时把 40+ 篇全量文章正文全部打包进一个庞大的 bundle。
 */
function blogMetaPlugin(): Plugin {
  function generateMeta() {
    const dir = path.resolve(__dirname, 'src/content/blog')
    if (!fs.existsSync(dir)) return
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
    const metaList = files
      .map((filename) => {
        const slug = filename.replace(/\.mdx$/, '')
        const raw = fs.readFileSync(path.join(dir, filename), 'utf-8')
        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
        const data: Record<string, any> = {}
        if (match) {
          match[1].split(/\r?\n/).forEach((line) => {
            const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
            if (kvMatch) {
              data[kvMatch[1].trim()] = kvMatch[2].trim().replace(/^['"]|['"]$/g, '')
            }
          })
        }
        return {
          slug,
          title: data.title || slug,
          description: data.description || '',
          date: data.date ? String(data.date) : '',
          image: data.image || '',
          authors: ['buoooou'],
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const outPath = path.resolve(__dirname, 'src/content/blog-meta.json')
    fs.writeFileSync(outPath, JSON.stringify(metaList, null, 2) + '\n')
  }

  return {
    name: 'supaboard-blog-meta',
    buildStart() {
      generateMeta()
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('src/content/blog')) {
        generateMeta()
        server.ws.send({ type: 'full-reload' })
      }
    },
  }
}

/**
 * After a production build, read the Vite manifest and render
 * theme/Supaboard/dashboard.blade.php from dashboard.blade.template.php,
 * injecting the hashed entry JS/CSS file names and preload tags.
 * Then prerender the public marketing pages into theme/Supaboard/prerender.
 */
function bladePlugin(): Plugin {
  let manifest: Record<string, any> = {}
  return {
    name: 'supaboard-blade',
    apply: 'build',
    writeBundle() {
      fs.mkdirSync(themeDir, { recursive: true })
      const manifestPath = path.join(themeDir, 'assets/.vite/manifest.json')
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      const entry = manifest['src/main.ts']
      const tpl = fs.readFileSync(path.resolve(__dirname, 'dashboard.blade.template.php'), 'utf-8')

      // 提取核心样式
      const css = (entry.css || [])
        .map((f: string) => `<link rel="stylesheet" href="/theme/{{$theme}}/assets/${f}" />`)
        .join('\n  ')

      // 提取关键预加载资源（主脚本、核心依赖 chunk、关键字体）
      const preloads: string[] = []
      preloads.push(`<link rel="modulepreload" href="/theme/{{$theme}}/assets/${entry.file}" />`)

      if (Array.isArray(entry.imports)) {
        for (const imp of entry.imports) {
          const chunk = manifest[imp]
          if (chunk?.file) {
            preloads.push(`<link rel="modulepreload" href="/theme/{{$theme}}/assets/${chunk.file}" />`)
          }
        }
      }

      for (const item of Object.values<any>(manifest)) {
        if (item?.file && typeof item.file === 'string' && item.file.endsWith('.woff2')) {
          preloads.push(
            `<link rel="preload" href="/theme/{{$theme}}/assets/${item.file}" as="font" type="font/woff2" crossorigin />`,
          )
        }
      }

      const out = tpl
        .replace(/__ENTRY_JS__/g, entry.file)
        .replace('<!-- __ENTRY_CSS__ -->', css)
        .replace('<!-- __ENTRY_PRELOAD__ -->', preloads.join('\n  '))

      fs.writeFileSync(path.join(themeDir, 'dashboard.blade.php'), out)

      // 主题版本与 package.json 保持一致（后台上传更新时要求版本号递增）
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
      const srcCfgPath = path.resolve(__dirname, 'config.json')
      const cfg = JSON.parse(fs.readFileSync(srcCfgPath, 'utf-8'))
      cfg.version = pkg.version
      fs.writeFileSync(srcCfgPath, JSON.stringify(cfg, null, 2) + '\n')
      fs.writeFileSync(path.join(themeDir, 'config.json'), JSON.stringify(cfg, null, 2) + '\n')
      fs.rmSync(path.join(themeDir, 'assets/.vite'), { recursive: true, force: true })
    },
    async closeBundle() {
      await prerender({ themeDir, base: BASE, manifest })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: BASE,
    plugins: [vue(), blogMetaPlugin(), bladePlugin()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:7001',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: path.join(themeDir, 'assets'),
      emptyOutDir: true,
      manifest: true,
      assetsDir: '',
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        input: 'src/main.ts',
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('vue-router')) {
                return 'vendor-vue'
              }
              if (id.includes('markdown-it')) {
                return 'vendor-markdown'
              }
              if (id.includes('qrcode')) {
                return 'vendor-qrcode'
              }
            }
          },
        },
      },
    },
  }
})
