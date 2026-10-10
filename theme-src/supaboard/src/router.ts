import { watchEffect } from 'vue'
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/storage'
import { i18nReady } from '@/i18n'
import { historyMode } from '@/utils/routing'
import { applySeo } from '@/utils/seo'

/**
 * 路由配置：
 * 1. 营销落地页、客户端下载、使用文档、合伙人返利、博客文章、服务条款等公共页面
 * 2. 登录、注册、找回密码认证页面
 * 3. 需登录的用户控制台页面（保持与旧 Xboard 主题 hash 路径一致）
 *
 * 带 meta.seo 的静态页面和博客 / 文档 / 条款内容页会在构建期预渲染（scripts/prerender.mjs）。
 */
const routes: RouteRecordRaw[] = [
  // 1. 公共营销与文档系统
  {
    path: '/',
    component: () => import('@/layouts/MarketingLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/marketing/Home.vue'),
        meta: {
          title: '首页',
          seo: {
            title: 'Supaboard — 稳定高速的全球网络加速服务 | IPLC专线 | ChatGPT/Netflix 解锁',
            description:
              'Supaboard 提供 IPLC/IEPL 专线接入，晚高峰不卡顿。全量解锁 Netflix、Disney+、ChatGPT 等全球服务。支持 Windows、macOS、iOS、Android 全平台。',
            absoluteTitle: true,
          },
        },
      },
      {
        path: 'download',
        name: 'Download',
        component: () => import('@/pages/marketing/Download.vue'),
        meta: {
          title: '客户端下载',
          seo: {
            title: '客户端下载 — 全平台代理软件下载直通车',
            description:
              '下载 Supaboard 推荐的全平台代理客户端：Clash Verge Rev、Shadowrocket、v2rayN、v2rayNG 等。支持 Windows、macOS、iOS、Android，提供 R2 高速直连下载。',
          },
        },
      },
      { path: 'pricing', redirect: { path: '/', query: { scroll: 'pricing' } } },
      {
        path: 'affiliate',
        name: 'Affiliate',
        component: () => import('@/pages/marketing/Affiliate.vue'),
        meta: {
          title: '全民合伙人计划',
          seo: {
            title: '全民合伙人计划 — 15% 终身循环返佣',
            description:
              '加入 Supaboard 合伙人计划，分享专属链接即可获得高达 15% 的终身循环返利。佣金满 100 元即可提现，支持 USDT 和支付宝。',
          },
        },
      },
      { path: 'docs/:slug(.*)?', name: 'Docs', component: () => import('@/pages/marketing/Docs.vue'), meta: { title: '使用文档与教程' } },
      { path: 'tutorial', redirect: '/docs' },
      { path: 'blog', name: 'BlogList', component: () => import('@/pages/marketing/BlogList.vue'), meta: { title: '博客文章' } },
      { path: 'blog/page/:page(\\d+)', name: 'BlogListPage', component: () => import('@/pages/marketing/BlogList.vue'), meta: { title: '博客文章' } },
      { path: 'blog/:slug', name: 'BlogDetail', component: () => import('@/pages/marketing/BlogDetail.vue'), meta: { title: '博客详情' } },
      { path: 'terms', name: 'Terms', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'terms' }, meta: { title: '服务条款' } },
      { path: 'privacy', name: 'Privacy', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'privacy' }, meta: { title: '隐私政策' } },
      { path: 'refund', name: 'Refund', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'refund' }, meta: { title: '退款政策' } },
      { path: 'aup', name: 'Aup', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'aup' }, meta: { title: '使用守则' } },
      { path: 'dmca', name: 'Dmca', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'dmca' }, meta: { title: 'DMCA 投诉' } },
      { path: 'license', name: 'License', component: () => import('@/pages/marketing/LegalPage.vue'), props: { page: 'license' }, meta: { title: '开源许可' } },
    ],
  },
  // 2. 身份认证页面
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'Login', component: () => import('@/pages/auth/Login.vue'), meta: { title: '登录', guest: true } },
      { path: 'register', name: 'Register', component: () => import('@/pages/auth/Register.vue'), meta: { title: '注册', guest: true } },
      { path: 'forgetpassword', name: 'ForgetPassword', component: () => import('@/pages/auth/ForgetPassword.vue'), meta: { title: '忘记密码', guest: true } },
    ],
  },
  // 3. 用户控制台（需登录）
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { auth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/pages/Dashboard.vue'), meta: { title: '仪表盘' } },
      { path: 'knowledge', name: 'Knowledge', component: () => import('@/pages/Knowledge.vue'), meta: { title: '使用文档' } },
      { path: 'plan', name: 'Plan', component: () => import('@/pages/plan/PlanList.vue'), meta: { title: '购买订阅' } },
      { path: 'plan/:plan_id', name: 'PlanDetail', component: () => import('@/pages/plan/PlanDetail.vue'), meta: { title: '配置订阅' } },
      { path: 'order', name: 'Order', component: () => import('@/pages/order/OrderList.vue'), meta: { title: '我的订单' } },
      { path: 'order/:trade_no', name: 'OrderDetail', component: () => import('@/pages/order/OrderDetail.vue'), meta: { title: '订单详情' } },
      { path: 'node', name: 'Node', component: () => import('@/pages/Node.vue'), meta: { title: '节点状态' } },
      { path: 'ticket', name: 'Ticket', component: () => import('@/pages/ticket/TicketList.vue'), meta: { title: '我的工单' } },
      { path: 'ticket/:ticket_id', name: 'TicketDetail', component: () => import('@/pages/ticket/TicketDetail.vue'), meta: { title: '工单详情' } },
      { path: 'traffic', name: 'Traffic', component: () => import('@/pages/Traffic.vue'), meta: { title: '流量明细' } },
      { path: 'invite', name: 'Invite', component: () => import('@/pages/Invite.vue'), meta: { title: '我的邀请' } },
      { path: 'profile', name: 'Profile', component: () => import('@/pages/Profile.vue'), meta: { title: '个人中心' } },
    ],
  },
  { path: '/404', name: 'NotFound', component: () => import('@/pages/NotFound.vue'), meta: { title: '页面不存在' } },
  { path: '/:pathMatch(.*)*', name: 'CatchAll', redirect: '/404' },
]

// 旧链接兼容：邮件、支付回跳、邀请链接里的 /#/login?verify=xxx 在 history 模式下转成 /login?verify=xxx
if (!import.meta.env.SSR && historyMode && window.location.hash.startsWith('#/')) {
  window.history.replaceState(window.history.state, '', window.location.hash.slice(1))
}

export const router = createRouter({
  history: import.meta.env.SSR ? createMemoryHistory() : historyMode ? createWebHistory() : createWebHashHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (to.query.scroll) return false
    return { top: 0 }
  },
})

/** 兼容旧主题 redirect=dashboard（不带斜杠）的写法 */
export function normalizeRedirect(r: unknown): string {
  if (typeof r !== 'string' || !r) return '/dashboard'
  if (/^https?:/i.test(r) || r.startsWith('//')) return '/dashboard'
  return r.startsWith('/') ? r : '/' + r
}

router.beforeEach((to) => {
  const authed = !!getToken()
  if (to.matched.some((r) => r.meta.auth) && !authed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // 带 verify 参数的登录链接需要先走 Login 页处理
  if (to.meta.guest && authed && !to.query.verify) {
    return normalizeRedirect(to.query.redirect)
  }
  return true
})

// 标题 / 描述随路由、页面声明和语言变化；首个路由可能先于语言字典就绪，等字典加载完再取
if (!import.meta.env.SSR) {
  i18nReady.then(() => watchEffect(() => applySeo(router.currentRoute.value)))
}

router.afterEach(() => {
  // SPA 路由切换时向 Google Analytics 同步上报页面浏览 (GA4: G-C156V21PNC)，延后一拍以取到页面声明的标题
  if (import.meta.env.SSR || typeof (window as any).gtag !== 'function') return
  i18nReady.then(() =>
    setTimeout(() => {
      ;(window as any).gtag('config', 'G-C156V21PNC', {
        page_path: window.location.pathname + window.location.search + window.location.hash,
        page_title: document.title,
      })
    }),
  )
})
