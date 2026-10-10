import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { applyColorMode } from './stores/app'
import { setUnauthorizedHandler } from './api/http'
import { i18nReady } from './i18n'
import { historyMode } from './utils/routing'
import './style.css'

applyColorMode()

setUnauthorizedHandler(() => {
  const current = router.currentRoute.value
  if (current.matched.some((r) => r.meta.auth)) {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
})

import { initRoutePreload } from './utils/preload'

// use(router) 时已开始解析首个路由，与字典加载并行；
// 等首个路由组件就绪再挂载，预渲染的首屏内容被原样替换，不会先清空成白屏
const app = createApp(App).use(router)
Promise.all([i18nReady, router.isReady()]).then(() => app.mount('#app'))

// history 模式下 Markdown 正文里的站内链接是普通 <a href="/blog/xxx">，拦截后走 SPA 跳转，避免整页刷新
if (historyMode) {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a')
    const href = a?.getAttribute('href')
    if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target || a.hasAttribute('download')) return
    if (router.resolve(href).name === 'CatchAll') return
    e.preventDefault()
    router.push(href)
  })
}

// 页面挂载后在空闲时段自动预加载高频页面模块
initRoutePreload()
