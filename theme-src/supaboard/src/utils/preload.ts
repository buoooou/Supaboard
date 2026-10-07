/**
 * Intelligent Route Preloader
 * 1. Background staggered idle prefetch of core routes based on auth status
 * 2. On-demand prefetch when user hovers over links
 */
import { getToken } from './storage'

const loaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/marketing/Home.vue'),
  '/download': () => import('@/pages/marketing/Download.vue'),
  '/docs': () => import('@/pages/marketing/Docs.vue'),
  '/affiliate': () => import('@/pages/marketing/Affiliate.vue'),
  '/blog': () => import('@/pages/marketing/BlogList.vue'),
  '/login': () => import('@/pages/auth/Login.vue'),
  '/register': () => import('@/pages/auth/Register.vue'),
  '/dashboard': () => import('@/pages/Dashboard.vue'),
  '/plan': () => import('@/pages/plan/PlanList.vue'),
  '/order': () => import('@/pages/order/OrderList.vue'),
  '/node': () => import('@/pages/Node.vue'),
  '/traffic': () => import('@/pages/Traffic.vue'),
  '/profile': () => import('@/pages/Profile.vue'),
  '/invite': () => import('@/pages/Invite.vue'),
  '/knowledge': () => import('@/pages/Knowledge.vue'),
  '/ticket': () => import('@/pages/ticket/TicketList.vue'),
}

const loaded = new Set<string>()

export function preloadRoute(path?: string) {
  if (!path) return
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/'
  const loader = loaders[clean]
  if (loader && !loaded.has(clean)) {
    loaded.add(clean)
    loader().catch(() => {})
  }
}

/** 浏览器空闲时根据登录态平滑错峰预加载高频页面 */
export function initRoutePreload() {
  if (typeof window === 'undefined') return
  // 尊重用户省流量偏好
  if ((navigator as any)?.connection?.saveData) return

  const authed = !!getToken()
  // 区分访客与已登录用户的高频目标页，避免盲目拉取全量无用路由
  const queue = authed ? ['/plan', '/node', '/order'] : ['/download', '/login', '/register']

  let idx = 0
  const step = () => {
    if (idx >= queue.length) return
    preloadRoute(queue[idx++])
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(step, { timeout: 3000 })
    } else {
      setTimeout(step, 1200)
    }
  }

  // 初始延迟启动，保证首屏渲染与关键资源完全加载完毕
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(step, { timeout: 2500 })
  } else {
    setTimeout(step, 1500)
  }
}
