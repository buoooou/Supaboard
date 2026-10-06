/**
 * Intelligent Route Preloader
 * 1. Background idle prefetch of core routes
 * 2. On-demand prefetch when user hovers over links
 */

const loaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/marketing/Home.vue'),
  '/download': () => import('@/pages/marketing/Download.vue'),
  '/docs': () => import('@/pages/marketing/Docs.vue'),
  '/affiliate': () => import('@/pages/marketing/Affiliate.vue'),
  '/blog': () => import('@/pages/marketing/BlogList.vue'),
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

/** 浏览器空闲时自动预加载高频核心页面 */
export function initRoutePreload() {
  if (typeof window === 'undefined') return
  const queue = ['/dashboard', '/plan', '/download', '/docs', '/node', '/order', '/']
  const run = () => {
    queue.forEach((p) => preloadRoute(p))
  }
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run, { timeout: 1500 })
  } else {
    setTimeout(run, 500)
  }
}
