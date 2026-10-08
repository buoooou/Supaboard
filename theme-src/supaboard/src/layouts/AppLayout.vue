<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from '@/components/Logo.vue'
import Icon from '@/components/Icon.vue'
import HeaderTools from '@/components/HeaderTools.vue'
import { loadUser, loadUserConfig, resetUserState, settings, state } from '@/stores/app'
import { clearToken } from '@/utils/storage'
import { onClickOutside } from '@/utils/dom'
import { confirm } from '@/utils/feedback'
import { preloadRoute } from '@/utils/preload'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const drawer = ref(false)
const userMenu = ref(false)
const userMenuEl = ref<HTMLElement | null>(null)
onClickOutside(userMenuEl, () => (userMenu.value = false))

const groups = [
  {
    title: '',
    items: [
      { to: '/dashboard', icon: 'home', label: '仪表盘' },
      { to: '/download', icon: 'download', label: '客户端下载' },
      { to: '/docs', icon: 'book', label: '使用教程' },
      { to: '/knowledge', icon: 'info', label: '使用文档' },
    ],
  },
  {
    title: '订阅',
    items: [
      { to: '/plan', icon: 'bag', label: '购买订阅' },
      { to: '/node', icon: 'server', label: '节点状态' },
    ],
  },
  {
    title: '财务',
    items: [
      { to: '/order', icon: 'receipt', label: '我的订单' },
      { to: '/invite', icon: 'gift', label: '我的邀请' },
    ],
  },
  {
    title: '用户',
    items: [
      { to: '/profile', icon: 'user', label: '个人中心' },
      { to: '/ticket', icon: 'message', label: '我的工单' },
      { to: '/traffic', icon: 'chart', label: '流量明细' },
    ],
  },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

const pageTitle = computed(() => t((route.meta.title as string) || ''))

watch(
  () => route.fullPath,
  () => (drawer.value = false),
)

onMounted(() => {
  loadUser().catch(() => {})
  loadUserConfig().catch(() => {})
})

async function logout() {
  userMenu.value = false
  const ok = await confirm({ title: t('退出登录'), content: t('确定要退出当前账号吗？'), confirmText: t('退出') })
  if (!ok) return
  clearToken()
  resetUserState()
  router.replace('/login')
}
</script>

<template>
  <div class="min-h-screen lg:pl-64">
    <!-- 侧边栏 -->
    <div
      v-if="drawer"
      class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
      @click="drawer = false"
    />
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 bg-background transition-transform duration-200 lg:translate-x-0"
      :class="drawer ? 'translate-x-0' : '-translate-x-full'"
      style="border-color: var(--ink)"
    >
      <div class="flex h-16 items-center justify-between border-b-2 px-5" style="border-color: var(--ink)">
        <RouterLink to="/dashboard"><Logo /></RouterLink>
        <button class="sb-btn-ghost p-1.5 lg:hidden" @click="drawer = false"><Icon name="x" /></button>
      </div>
      <nav class="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        <div v-for="g in groups" :key="g.title">
          <div v-if="g.title" class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {{ t(g.title) }}
          </div>
          <RouterLink
            v-for="item in g.items"
            :key="item.to"
            :to="item.to"
            class="mb-1 flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition"
            :class="
              isActive(item.to)
                ? 'bg-primary text-primary-foreground shadow-pop-active'
                : 'border-transparent text-foreground/80 hover:bg-muted hover:text-foreground'
            "
            :style="isActive(item.to) ? 'border-color: var(--ink)' : ''"
            @mouseenter="preloadRoute(item.to)"
          >
            <Icon :name="item.icon" :size="18" />
            {{ t(item.label) }}
          </RouterLink>
        </div>
      </nav>
      <div class="border-t-2 border-dashed p-4">
        <RouterLink
          to="/"
          class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          @mouseenter="preloadRoute('/')"
        >
          <Icon name="external" :size="16" /> {{ t('官网首页') }}
        </RouterLink>
      </div>
    </aside>

    <!-- 顶栏 -->
    <header
      class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 bg-background px-4 sm:px-6"
      style="border-color: var(--ink)"
    >
      <div class="flex min-w-0 items-center gap-2">
        <button class="sb-btn-ghost p-2 lg:hidden" aria-label="menu" @click="drawer = true">
          <Icon name="menu" :size="20" />
        </button>
        <span class="truncate font-heading text-lg">{{ pageTitle }}</span>
      </div>
      <div class="flex items-center gap-1">
        <HeaderTools />
        <div ref="userMenuEl" class="relative ml-1">
          <button
            class="flex items-center gap-2 rounded-full border-2 bg-card py-1 pl-1 pr-3 text-sm font-medium transition hover:bg-muted"
            style="border-color: var(--ink)"
            @click="userMenu = !userMenu"
          >
            <img
              v-if="state.user?.avatar_url"
              :src="state.user.avatar_url"
              alt=""
              class="h-7 w-7 rounded-full bg-muted"
            />
            <span v-else class="h-7 w-7 rounded-full bg-primary/20" />
            <span class="hidden max-w-[160px] truncate sm:inline">{{ state.user?.email || '...' }}</span>
            <Icon name="chevron-down" :size="14" />
          </button>
          <Transition name="sb-fade">
            <div v-if="userMenu" class="sb-card absolute right-0 top-12 z-40 w-56 overflow-hidden p-1">
              <div class="truncate px-3 py-2 text-xs text-muted-foreground sm:hidden">{{ state.user?.email }}</div>
              <RouterLink
                to="/profile"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                @click="userMenu = false"
              >
                <Icon name="user" :size="16" /> {{ t('个人中心') }}
              </RouterLink>
              <RouterLink
                to="/order"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                @click="userMenu = false"
              >
                <Icon name="receipt" :size="16" /> {{ t('我的订单') }}
              </RouterLink>
              <button
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                @click="logout"
              >
                <Icon name="logout" :size="16" /> {{ t('退出登录') }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <main class="sb-dots min-h-[calc(100vh-4rem)]">
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <RouterView v-slot="{ Component }">
          <Transition name="sb-fade" mode="out-in">
            <!-- 详情页带轮询且依赖路由参数，缓存会导致离开后仍在轮询、或忽略新的 query -->
            <KeepAlive :max="8" :exclude="['OrderDetail', 'TicketDetail', 'PlanDetail']">
              <component :is="Component" :key="route.path" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>
