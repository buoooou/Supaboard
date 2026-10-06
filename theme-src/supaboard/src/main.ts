import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { applyColorMode } from './stores/app'
import { setUnauthorizedHandler } from './api/http'
import './style.css'

applyColorMode()

setUnauthorizedHandler(() => {
  const current = router.currentRoute.value
  if (current.matched.some((r) => r.meta.auth)) {
    router.replace({ path: '/login', query: { redirect: current.fullPath } })
  }
})

import { initRoutePreload } from './utils/preload'

createApp(App).use(router).mount('#app')

// 页面挂载后在空闲时段自动预加载高频页面模块
initRoutePreload()
