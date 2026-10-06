<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import Icon from '@/components/Icon.vue'
import HeaderTools from '@/components/HeaderTools.vue'
import MarketingFooter from '@/components/marketing/MarketingFooter.vue'
import { siteConfig } from '@/config/site'
import { loadUser, loadUserConfig, settings, state } from '@/stores/app'
import { getToken } from '@/utils/storage'
import { preloadRoute } from '@/utils/preload'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const mobileMenu = ref(false)
const isAuthed = computed(() => !!getToken())

const navLinks = [
  { to: '/', label: '首页', external: false },
  { to: '/download', label: '客户端下载', external: false },
  { to: '/docs', label: '使用教程', external: false },
  { to: '/pricing', label: '价格方案', external: false, isPricing: true },
  { to: '/affiliate', label: '推广返利', external: false },
  { to: '/blog', label: '博客文章', external: false },
  { to: siteConfig.ipCheckUrl, label: 'IP检测', external: true },
]

function onPricingClick(e: MouseEvent) {
  e.preventDefault()
  if (route.path === '/') {
    const el = document.getElementById('pricing')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
  }
  router.push({ path: '/', query: { scroll: 'pricing' } })
}

function isActive(to: string) {
  if (to === '/pricing') return route.path === '/' && route.query.scroll === 'pricing'
  if (to === '/') return route.path === '/' && !route.query.scroll
  return route.path.startsWith(to)
}

watch(
  () => route.fullPath,
  () => {
    mobileMenu.value = false
  },
)

onMounted(() => {
  if (getToken()) {
    loadUser().catch(() => {})
    loadUserConfig().catch(() => {})
  }

  // 可选加载 Crisp 在线客服
  if (siteConfig.crispId && !(window as any).$crisp) {
    try {
      ;(window as any).$crisp = []
      ;(window as any).CRISP_WEBSITE_ID = siteConfig.crispId
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      d.getElementsByTagName('head')[0].appendChild(s)
    } catch {}
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background dot-grid">
    <!-- 顶部固定导航栏 -->
    <header
      class="sticky top-0 z-40 w-full border-b-2 bg-background/95 backdrop-blur transition-colors"
      style="border-color: var(--ink)"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <Logo />
        </RouterLink>

        <!-- 桌面端主导航 -->
        <nav class="hidden items-center gap-1 lg:flex">
          <template v-for="item in navLinks" :key="item.to">
            <a
              v-if="item.external"
              :href="item.to"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {{ t(item.label) }}
              <Icon name="external" :size="12" />
            </a>
            <a
              v-else-if="item.isPricing"
              href="#/pricing"
              class="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer"
              :class="
                isActive(item.to)
                  ? 'bg-primary text-white shadow-[2px_2px_0px_0px_var(--ink)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              "
              @click="onPricingClick"
            >
              {{ t(item.label) }}
            </a>
            <RouterLink
              v-else
              :to="item.to"
              class="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors"
              :class="
                isActive(item.to)
                  ? 'bg-primary text-white shadow-[2px_2px_0px_0px_var(--ink)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              "
              @mouseenter="preloadRoute(item.to)"
            >
              {{ t(item.label) }}
            </RouterLink>
          </template>
        </nav>

        <!-- 右侧操作栏 -->
        <div class="flex items-center gap-2.5">
          <HeaderTools />

          <!-- 未登录状态 -->
          <template v-if="!isAuthed">
            <RouterLink
              to="/login"
              class="hidden sm:inline-flex sb-btn sb-btn-outline sb-btn-sm"
            >
              {{ t('登录') }}
            </RouterLink>
            <RouterLink
              to="/register"
              class="sb-btn sb-btn-primary sb-btn-sm"
            >
              {{ t('免费注册') }}
            </RouterLink>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <RouterLink
              to="/dashboard"
              class="sb-btn sb-btn-primary sb-btn-sm flex items-center gap-1.5"
            >
              <Icon name="home" :size="15" />
              <span>{{ t('控制台') }}</span>
            </RouterLink>
          </template>

          <!-- 移动端汉堡菜单按钮 -->
          <button
            type="button"
            class="sb-btn-ghost p-2 lg:hidden"
            :aria-label="t('切换菜单')"
            @click="mobileMenu = !mobileMenu"
          >
            <Icon :name="mobileMenu ? 'x' : 'menu'" :size="22" />
          </button>
        </div>
      </div>

      <!-- 移动端抽屉菜单 -->
      <div
        v-if="mobileMenu"
        class="border-t-2 bg-background px-5 py-6 lg:hidden"
        style="border-color: var(--ink)"
      >
        <div class="space-y-2">
          <template v-for="item in navLinks" :key="item.to">
            <a
              v-if="item.external"
              :href="item.to"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between rounded-xl p-3 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span>{{ t(item.label) }}</span>
              <Icon name="external" :size="14" />
            </a>
            <a
              v-else-if="item.isPricing"
              href="#/pricing"
              class="block rounded-xl p-3 font-semibold transition-colors cursor-pointer"
              :class="
                isActive(item.to)
                  ? 'bg-primary text-white shadow-[2px_2px_0px_0px_var(--ink)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              "
              @click="(e) => { mobileMenu = false; onPricingClick(e) }"
            >
              {{ t(item.label) }}
            </a>
            <RouterLink
              v-else
              :to="item.to"
              class="block rounded-xl p-3 font-semibold transition-colors"
              :class="
                isActive(item.to)
                  ? 'bg-primary text-white shadow-[2px_2px_0px_0px_var(--ink)]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              "
              @mouseenter="preloadRoute(item.to)"
              @click="mobileMenu = false"
            >
              {{ t(item.label) }}
            </RouterLink>
          </template>
        </div>

        <div class="mt-6 flex flex-col gap-2 border-t-2 pt-4" style="border-color: var(--ink)">
          <template v-if="!isAuthed">
            <RouterLink to="/login" class="sb-btn sb-btn-outline w-full justify-center">
              {{ t('登录') }}
            </RouterLink>
            <RouterLink to="/register" class="sb-btn sb-btn-primary w-full justify-center">
              {{ t('免费注册') }}
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/dashboard" class="sb-btn sb-btn-primary w-full justify-center">
              {{ t('进入控制台') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="sb-fade" mode="out-in">
          <KeepAlive :max="6">
            <component :is="Component" :key="route.path" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </main>

    <!-- 底部页脚 -->
    <MarketingFooter />
  </div>
</template>
