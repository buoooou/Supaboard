// 构建后把公开营销页预渲染到 theme/Supaboard/prerender，由 vite.config.ts 在打包结束时调用：
//   prerender/pages/<路径>.json  每个页面的标题、描述、canonical、结构化数据与正文 HTML（首页为 index.json）
//   prerender/routes.json        后端 ThemePageController 用的路由清单（纯前端页面、固定跳转）
//   prerender/sitemap.xml
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// 旧版 Next.js 落地页的博客列表每页 6 篇，超出现分页范围的旧地址回到列表首页
const LEGACY_BLOG_PAGE_SIZE = 6

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * @param {{ themeDir: string, base: string, manifest: Record<string, { file: string }> }} options
 */
export async function prerender({ themeDir, base, manifest }) {
  const outDir = path.join(themeDir, 'prerender')
  fs.rmSync(outDir, { recursive: true, force: true })

  // 页面模块在加载时会读取 window.settings，这里提供与 dashboard.blade.php 同结构的构建期默认值
  globalThis.window = {
    routerBase: '/',
    settings: {
      title: 'Supaboard',
      assets_path: base.replace(/\/$/, ''),
      version: '',
      description: '',
      logo: null,
      theme: { default_mode: 'light', landing_url: '', support_url: '', download_url: '' },
      i18n: ['zh-CN', 'zh-TW', 'en-US'],
      routing: 'history',
    },
  }

  const vite = await createServer({
    root,
    appType: 'custom',
    logLevel: 'warn',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  })

  try {
    const { listPages, listRoutes, renderPage, siteUrl, siteName } = await vite.ssrLoadModule('/src/prerender.ts')

    // SSR 下资源地址是源码路径（…/src/assets/blog/x.webp），换成打包后的带哈希文件名
    const toBuiltAssets = (text) =>
      text.replace(new RegExp(`${base}(src/[^"'\\s)?#]+)`, 'g'), (_, src) => {
        const entry = manifest[src]
        if (!entry) throw new Error(`预渲染引用了未打包的资源：${src}`)
        return base + entry.file
      })

    const pages = listPages()
    for (const page of pages) {
      const rendered = await renderPage(page.path)
      const canonical = siteUrl + page.path
      const image = siteUrl + toBuiltAssets(rendered.image)
      const isArticle = !!rendered.publishedAt
      const jsonLd = isArticle && {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: rendered.title.replace(` | ${siteName}`, ''),
        description: rendered.description,
        image,
        datePublished: rendered.publishedAt,
        mainEntityOfPage: canonical,
        author: { '@type': 'Organization', name: siteName, url: siteUrl },
        publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
      }

      const file = path.join(outDir, 'pages', (page.path === '/' ? 'index' : page.path.slice(1)) + '.json')
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(
        file,
        JSON.stringify({
          title: rendered.title,
          description: rendered.description,
          canonical,
          site_name: siteName,
          type: isArticle ? 'article' : 'website',
          image,
          published_at: rendered.publishedAt || null,
          // 直接内联进 <script type="application/ld+json">，转义 < 防止提前闭合标签
          json_ld: jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null,
          html: toBuiltAssets(rendered.html),
        }),
      )
    }

    const routes = listRoutes()
    routes.redirects[`blog/page/1`] = '/blog'
    const blogPosts = pages.filter((p) => /^\/blog\/(?!page\/)/.test(p.path)).length
    const blogPages = pages.filter((p) => p.path === '/blog' || p.path.startsWith('/blog/page/')).length
    for (let n = blogPages + 1; n <= Math.ceil(blogPosts / LEGACY_BLOG_PAGE_SIZE); n++) {
      routes.redirects[`blog/page/${n}`] = '/blog'
    }
    fs.writeFileSync(path.join(outDir, 'routes.json'), JSON.stringify(routes, null, 2) + '\n')

    const urls = pages.map(
      (p) =>
        `  <url><loc>${escapeXml(siteUrl + p.path)}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`,
    )
    fs.writeFileSync(
      path.join(outDir, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    )

    console.log(`✓ Prerendered ${pages.length} pages to ${path.relative(process.cwd(), outDir)}`)
  } finally {
    await vite.close()
    delete globalThis.window
  }
}
