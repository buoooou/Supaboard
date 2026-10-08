import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { applyColorMode } from './stores/app'
import { setUnauthorizedHandler } from './api/http'
import { i18nReady } from './i18n'
import './style.css'

applyColorMode()

setUnauthorizedHandler(() => {
  const current = router.currentRoute.value
  if (current.matched.some((r) => r.meta.auth)) {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
})

import { initRoutePreload } from './utils/preload'

// use(router) 时已开始解析首个路由，与字典加载并行
const app = createApp(App).use(router)
i18nReady.then(() => app.mount('#app'))

// 页面挂载后在空闲时段自动预加载高频页面模块
initRoutePreload()
