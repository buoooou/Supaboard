/**
 * 页面标题 / 描述的唯一来源，构建期预渲染与浏览器端共用，保证两边输出一致。
 * - 静态页面：路由 meta.seo
 * - 博客、文档、条款等动态内容：页面内调用 usePageSeo() 声明
 */
import { shallowRef, useSSRContext, watchEffect } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import { siteConfig } from '@/config/site'
import { appTitle } from '@/stores/app'
import { currentLang, t } from '@/i18n'

export interface PageSeo {
  title: string
  description?: string
  /** 标题已包含品牌名，不再追加 “| Supaboard” */
  absoluteTitle?: boolean
  /** 分享卡片图片（站内资源路径） */
  image?: string
  /** 博客文章发布日期，输出 BlogPosting 结构化数据 */
  publishedAt?: string
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    seo?: PageSeo
    auth?: boolean
    guest?: boolean
  }
}

const declared = shallowRef<{ path: string; seo: PageSeo } | null>(null)

export function usePageSeo(getter: () => PageSeo | undefined) {
  if (import.meta.env.SSR) {
    const ctx = useSSRContext()
    if (ctx) ctx.seo = getter()
    return
  }
  const route = useRoute()
  watchEffect(() => {
    const seo = getter()
    declared.value = seo ? { path: route.path, seo } : null
  })
}

export function fullTitle(seo: PageSeo): string {
  return seo.absoluteTitle ? seo.title : `${seo.title} | ${siteConfig.name}`
}

export function resolveSeo(route: RouteLocationNormalizedLoaded, pageSeo?: PageSeo): { title: string; description: string } {
  const seo = pageSeo ?? (declared.value?.path === route.path ? declared.value.seo : undefined) ?? route.meta.seo
  // SEO 文案只有简体中文，其它语言沿用可翻译的短标题
  if (seo && currentLang.value === 'zh-CN') {
    return { title: fullTitle(seo), description: seo.description || siteConfig.description }
  }
  const title = route.meta.title
  return { title: title ? `${t(title)} - ${appTitle}` : appTitle, description: siteConfig.description }
}

export function applySeo(route: RouteLocationNormalizedLoaded) {
  const { title, description } = resolveSeo(route)
  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}
