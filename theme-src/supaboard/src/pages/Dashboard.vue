<script setup lang="ts">
import { computed, defineAsyncComponent, onActivated, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { userApi, type Notice } from '@/api'
import { currencySymbol, loadSubscribe, loadUserConfig, state } from '@/stores/app'
import { daysLeft, formatBytes, formatDate, money } from '@/utils/format'
import { showError } from '@/utils/feedback'
import { t } from '@/i18n'

const SubscribeModal = defineAsyncComponent(() => import('@/components/SubscribeModal.vue'))
const NoticeModal = defineAsyncComponent(() => import('@/components/NoticeModal.vue'))

const router = useRouter()
const loading = ref(!state.subscribe && !state.user)
const notices = ref<Notice[]>([])
const stat = ref<[number, number, number]>([0, 0, 0])
const activeNotice = ref<Notice | null>(null)
const noticeIndex = ref(0)
const showSubscribe = ref(false)

const sub = computed(() => state.subscribe)
const used = computed(() => (sub.value ? (sub.value.u || 0) + (sub.value.d || 0) : 0))
const total = computed(() => sub.value?.transfer_enable || 0)
const usedPct = computed(() => (total.value ? (used.value / total.value) * 100 : 0))
const left = computed(() => daysLeft(sub.value?.expired_at))
const expired = computed(() => !!sub.value?.expired_at && (left.value ?? 1) <= 0)
const hasPlan = computed(() => !!sub.value?.plan_id && !!sub.value?.plan)
const canReset = computed(() => {
  const prices = (sub.value?.plan as any)?.prices
  return !!prices && prices.reset_traffic !== null && prices.reset_traffic !== undefined
})

const POPUP_KEY = 'SUPABOARD_POPUP_SEEN'

onMounted(async () => {
  loadUserConfig().catch(() => {})
  try {
    const [n, s] = await Promise.all([
      userApi.notices().catch(() => ({ data: [] as Notice[], total: 0 })),
      userApi.getStat().catch(() => [0, 0, 0] as [number, number, number]),
      loadSubscribe(),
    ])
    notices.value = n.data || []
    stat.value = s
    // 标签含「弹窗」的公告自动弹出（每个会话只弹一次）
    const popup = notices.value.find((x) => x.tags?.includes('弹窗'))
    if (popup) {
      let seen = ''
      try {
        seen = sessionStorage.getItem(POPUP_KEY) || ''
      } catch {
        /* ignore */
      }
      if (seen !== String(popup.id)) {
        activeNotice.value = popup
        try {
          sessionStorage.setItem(POPUP_KEY, String(popup.id))
        } catch {
          /* ignore */
        }
      }
    }
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

onActivated(() => {
  // 从其他页面切回时静默更新订阅与统计，不闪烁也不重新显示 Spinner
  loadSubscribe(true).catch(() => {})
  userApi.getStat().then((s) => (stat.value = s)).catch(() => {})
})

function renew() {
  if (sub.value?.plan_id) router.push(`/plan/${sub.value.plan_id}`)
  else router.push('/plan')
}

function resetTraffic() {
  if (sub.value?.plan_id) router.push({ path: `/plan/${sub.value.plan_id}`, query: { period: 'reset_price' } })
}

const actions = computed(() => [
  { icon: 'book', color: 'bg-primary', title: '查看教程', desc: '学习如何使用', onClick: () => { router.push('/knowledge') } },
  { icon: 'zap', color: 'bg-tertiary', title: '一键订阅', desc: '快速导入到客户端', onClick: () => { showSubscribe.value = true }, disabled: !hasPlan.value },
  { icon: 'refresh', color: 'bg-secondary', title: hasPlan.value ? '续费订阅' : '购买订阅', desc: hasPlan.value ? '为当前套餐续费' : '选择适合你的套餐', onClick: renew },
  { icon: 'message', color: 'bg-quaternary', title: '遇到问题', desc: '提交工单联系我们', onClick: () => { router.push('/ticket') } },
])
</script>

<template>
  <Spinner v-if="loading" />
  <div v-else class="space-y-6">
    <!-- 提醒 -->
    <div v-if="state.user?.banned" class="sb-card flex items-center gap-3 bg-destructive/10 p-4 text-sm font-medium">
      <Icon name="alert" class="text-destructive" /> {{ t('你的账号已被封禁，如有疑问请提交工单。') }}
    </div>
    <RouterLink
      v-if="stat[0] > 0"
      to="/order"
      class="sb-card flex items-center justify-between gap-3 bg-warning/15 p-4 text-sm font-medium transition hover:shadow-pop-hover"
    >
      <span class="flex items-center gap-3"><Icon name="receipt" class="text-warning" />{{ t('你有 {n} 个待支付的订单', { n: stat[0] }) }}</span>
      <span class="flex items-center gap-1 text-primary">{{ t('立即支付') }}<Icon name="chevron-right" :size="16" /></span>
    </RouterLink>
    <RouterLink
      v-if="stat[1] > 0"
      to="/ticket"
      class="sb-card flex items-center justify-between gap-3 bg-tertiary/10 p-4 text-sm font-medium transition hover:shadow-pop-hover"
    >
      <span class="flex items-center gap-3"><Icon name="message" class="text-tertiary" />{{ t('你有 {n} 个进行中的工单', { n: stat[1] }) }}</span>
      <span class="flex items-center gap-1 text-primary">{{ t('查看') }}<Icon name="chevron-right" :size="16" /></span>
    </RouterLink>

    <!-- 公告 -->
    <section v-if="notices.length" class="sb-card relative overflow-hidden">
      <div
        class="relative flex flex-col justify-center min-h-[220px] sm:min-h-[250px] cursor-pointer bg-cover bg-center p-6 sm:p-10"
        :style="notices[noticeIndex].img_url ? { backgroundImage: `url(${notices[noticeIndex].img_url})` } : {}"
        :class="notices[noticeIndex].img_url ? 'text-white' : 'bg-gradient-to-br from-primary/15 via-card to-secondary/15'"
        @click="activeNotice = notices[noticeIndex]"
      >
        <div v-if="notices[noticeIndex].img_url" class="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
        <div class="relative max-w-2xl">
          <span class="sb-badge bg-card text-foreground shadow-[1px_1px_0px_0px_var(--ink)]"><Icon name="bell" :size="12" />{{ t('公告') }}</span>
          <h2 class="mt-3 font-heading text-xl font-black tracking-tight sm:text-2xl md:text-3xl">{{ notices[noticeIndex].title }}</h2>
          <p class="mt-2.5 text-sm font-medium opacity-90">{{ formatDate(notices[noticeIndex].created_at) }} · {{ t('点击查看详情') }}</p>
        </div>
      </div>
      <div v-if="notices.length > 1" class="absolute bottom-4 right-4 flex gap-1.5">
        <button
          v-for="(n, i) in notices"
          :key="n.id"
          class="h-2.5 rounded-full border-2 transition-all"
          :class="i === noticeIndex ? 'w-6 bg-primary' : 'w-2.5 bg-card'"
          style="border-color: var(--ink)"
          :aria-label="n.title"
          @click.stop="noticeIndex = i"
        />
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- 订阅卡片 -->
      <section class="sb-card p-6 lg:col-span-2">
        <template v-if="hasPlan && sub">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ t('我的订阅') }}</div>
              <h2 class="mt-1 text-2xl">{{ sub.plan?.name }}</h2>
            </div>
            <span v-if="expired" class="sb-badge bg-destructive text-white">{{ t('已过期') }}</span>
            <span v-else-if="sub.expired_at === null" class="sb-badge bg-quaternary">{{ t('长期有效') }}</span>
            <span v-else class="sb-badge" :class="(left ?? 0) <= 7 ? 'bg-warning' : 'bg-quaternary'">
              {{ t('剩余 {n} 天', { n: left ?? 0 }) }}
            </span>
          </div>

          <div class="mt-6">
            <div class="mb-2 flex items-end justify-between text-sm">
              <span class="font-semibold">{{ t('已用流量') }}</span>
              <span class="font-mono text-muted-foreground">{{ formatBytes(used) }} / {{ formatBytes(total) }}</span>
            </div>
            <ProgressBar :value="usedPct" />
            <div class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>{{ t('到期时间') }}：{{ sub.expired_at ? formatDate(sub.expired_at) : t('长期有效') }}</span>
              <span v-if="sub.reset_day !== null && sub.reset_day !== undefined">
                {{ t('距离流量重置还有 {n} 天', { n: sub.reset_day }) }}
              </span>
              <span v-if="sub.device_limit">{{ t('设备数上限') }}：{{ sub.device_limit }}</span>
              <span v-if="sub.speed_limit">{{ t('限速') }}：{{ sub.speed_limit }} Mbps</span>
            </div>
          </div>

          <div v-if="expired" class="mt-5 rounded-xl border-2 border-dashed border-destructive/60 bg-destructive/5 p-3 text-sm">
            {{ t('订阅已过期，续费后即可继续使用。') }}
          </div>
          <div v-else-if="usedPct >= 100" class="mt-5 rounded-xl border-2 border-dashed border-destructive/60 bg-destructive/5 p-3 text-sm">
            {{ t('流量已用尽，可购买流量重置包或等待下次重置。') }}
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button class="sb-btn-primary" :disabled="expired" @click="showSubscribe = true">
              <Icon name="zap" :size="16" />{{ t('一键订阅') }}
            </button>
            <button class="sb-btn-outline" @click="renew"><Icon name="refresh" :size="16" />{{ t('续费') }}</button>
            <button v-if="canReset" class="sb-btn-outline" @click="resetTraffic">
              <Icon name="activity" :size="16" />{{ t('重置流量') }}
            </button>
          </div>
        </template>

        <div v-else class="flex flex-col items-start gap-4 py-4">
          <span class="sb-icon-tile bg-primary"><Icon name="rocket" :size="20" /></span>
          <div>
            <h2 class="text-2xl">{{ t('还没有可用的订阅') }}</h2>
            <p class="mt-2 text-sm text-muted-foreground">{{ t('选择一个套餐，立即开始畅享全球网络。') }}</p>
          </div>
          <RouterLink to="/plan" class="sb-btn-primary">{{ t('购买订阅') }}<Icon name="arrow-right" :size="16" /></RouterLink>
        </div>
      </section>

      <!-- 账户 -->
      <section class="sb-card flex flex-col gap-4 p-6">
        <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ t('我的账户') }}</div>
        <div class="flex items-center gap-4">
          <span class="sb-icon-tile bg-tertiary"><Icon name="wallet" :size="20" /></span>
          <div>
            <div class="text-xs text-muted-foreground">{{ t('账户余额') }}</div>
            <div class="font-heading text-2xl">{{ currencySymbol() }}{{ money(state.user?.balance) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="sb-icon-tile bg-secondary"><Icon name="gift" :size="20" /></span>
          <div>
            <div class="text-xs text-muted-foreground">{{ t('可用佣金') }}</div>
            <div class="font-heading text-2xl">{{ currencySymbol() }}{{ money(state.user?.commission_balance) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="sb-icon-tile bg-quaternary"><Icon name="users" :size="20" /></span>
          <div>
            <div class="text-xs text-muted-foreground">{{ t('已邀请用户') }}</div>
            <div class="font-heading text-2xl">{{ stat[2] }}</div>
          </div>
        </div>
        <RouterLink to="/invite" class="sb-btn-outline mt-auto w-full">{{ t('邀请好友赚佣金') }}<Icon name="arrow-right" :size="16" /></RouterLink>
      </section>
    </div>

    <!-- 快捷操作 -->
    <section>
      <h3 class="mb-4 text-lg">{{ t('快捷操作') }}</h3>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="a in actions"
          :key="a.title"
          class="sb-card flex items-center gap-4 p-5 text-left transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover disabled:opacity-50"
          :disabled="a.disabled"
          @click="a.onClick"
        >
          <span class="sb-icon-tile" :class="a.color"><Icon :name="a.icon" :size="20" /></span>
          <span>
            <span class="block font-semibold">{{ t(a.title) }}</span>
            <span class="block text-xs text-muted-foreground">{{ t(a.desc) }}</span>
          </span>
        </button>
      </div>
    </section>

    <SubscribeModal :open="showSubscribe" :url="sub?.subscribe_url || ''" @close="showSubscribe = false" />

    <NoticeModal :notice="activeNotice" @close="activeNotice = null" />
  </div>
</template>
