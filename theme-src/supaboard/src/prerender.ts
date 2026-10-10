/**
 * 构建期预渲染入口，由 scripts/prerender.mjs 通过 Vite SSR 加载（不会进入浏览器包）。
 * 把公开营销页渲染成 HTML，交给 dashboard.blade.php 按请求路径输出，搜索引擎无需执行 JS 即可抓到正文。
 */
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { router } from './router'
import { siteConfig } from './config/site'
import { resolveAvatarUrl } from './utils/assets'
import { blogPosts, getBlogPageCount, getBlogPagePath } from './utils/blog'
import { docsList } from './utils/docs'
import { legalPages } from './utils/pages'
import { resolveSeo, type PageSeo } from './utils/seo'

export const siteUrl = siteConfig.url.replace(/\/$/, '')
export const siteName = siteConfig.name

export interface PrerenderPage {
  path: string
  lastmod?: string
}

/** 全部需要预渲染并写入 sitemap 的公开页面 */
export function listPages(): PrerenderPage[] {
  const staticPages = router
    .getRoutes()
    .filter((r) => r.meta.seo)
    .map((r) => ({ path: r.path || '/' }))
  const blogPages = Array.from({ length: getBlogPageCount() }, (_, i) => ({ path: getBlogPagePath(i + 1) }))
  return [
    ...staticPages,
    ...docsList.map((d) => ({ path: d.slug ? `/docs/${d.slug}` : '/docs', lastmod: d.date })),
    ...blogPages,
    ...blogPosts.map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.date })),
    ...Object.keys(legalPages).map((slug) => ({ path: `/${slug}` })),
  ]
}

const PARAM = /:[A-Za-z_]+(\([^)]*\))?[?*+]?/g

/**
 * 交给后端 ThemePageController 的路由清单：
 * - spa：只在浏览器端渲染的页面（登录、注册、控制台），`*` 匹配一段路径
 * - redirects：路由表里的固定跳转，后端直接 301
 */
export function listRoutes(): { spa: string[]; redirects: Record<string, string> } {
  const spa: string[] = []
  const redirects: Record<string, string> = {}
  for (const record of router.getRoutes()) {
    if (record.redirect) {
      if (!record.path.includes(':')) {
        redirects[record.path.slice(1)] = router.resolve(record.redirect as string).path
      }
      continue
    }
    if (!record.name) continue
    const params = Object.fromEntries(record.path.match(/:[A-Za-z_]+/g)?.map((p) => [p.slice(1), 'x']) ?? [])
    const { meta } = router.resolve({ name: record.name, params })
    if (meta.auth || meta.guest) spa.push(record.path.slice(1).replace(PARAM, '*'))
  }
  return { spa, redirects }
}

export interface RenderedPage {
  title: string
  description: string
  image: string
  publishedAt?: string
  html: string
}

export async function renderPage(path: string): Promise<RenderedPage> {
  await router.push(path)
  await router.isReady()
  const route = router.currentRoute.value
  if (route.path !== path) throw new Error(`${path} 被重定向到了 ${route.fullPath}`)

  const ctx: { seo?: PageSeo } = {}
  const html = await renderToString(createSSRApp(App).use(router), ctx)
  const seo = ctx.seo ?? route.meta.seo
  if (!seo) throw new Error(`${path} 没有声明标题与描述（meta.seo 或 usePageSeo）`)

  return {
    ...resolveSeo(route, seo),
    image: seo.image || resolveAvatarUrl('/images/og.png'),
    publishedAt: seo.publishedAt,
    html,
  }
}
