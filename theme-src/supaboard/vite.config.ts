import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const THEME_NAME = 'Supaboard'
const themeDir = fileURLToPath(new URL(`../../theme/${THEME_NAME}`, import.meta.url))

/**
 * After a production build, read the Vite manifest and render
 * theme/Supaboard/dashboard.blade.php from dashboard.blade.template.php,
 * injecting the hashed entry JS/CSS file names.
 */
function bladePlugin(): Plugin {
  return {
    name: 'supaboard-blade',
    apply: 'build',
    writeBundle() {
      fs.mkdirSync(themeDir, { recursive: true })
      const manifestPath = path.join(themeDir, 'assets/.vite/manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      const entry = manifest['src/main.ts']
      const tpl = fs.readFileSync(path.resolve(__dirname, 'dashboard.blade.template.php'), 'utf-8')
      const css = (entry.css || [])
        .map((f: string) => `<link rel="stylesheet" href="/theme/{{$theme}}/assets/${f}" />`)
        .join('\n  ')
      const out = tpl
        .replace(/__ENTRY_JS__/g, entry.file)
        .replace('<!-- __ENTRY_CSS__ -->', css)
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
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: `/theme/${THEME_NAME}/assets/`,
    plugins: [vue(), bladePlugin()],
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
