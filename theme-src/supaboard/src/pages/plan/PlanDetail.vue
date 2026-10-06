<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import PlanContent from '@/components/PlanContent.vue'
import { userApi, type Coupon, type Plan } from '@/api'
import { currencySymbol, loadSubscribe, loadUserConfig, state } from '@/stores/app'
import { PERIODS, PERIOD_MONTHS, money, periodLabel } from '@/utils/format'
import { confirm, showError, toast } from '@/utils/feedback'
import { ApiError } from '@/api/http'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const plan = ref<Plan | null>(null)
const period = ref<string>('')
const couponCode = ref('')
const coupon = ref<Coupon | null>(null)
const checking = ref(false)
const submitting = ref(false)

const isCurrent = computed(() => !!state.subscribe?.plan_id && state.subscribe.plan_id === plan.value?.id)

const periods = computed(() => {
  if (!plan.value) return []
  return PERIODS.filter((p) => {
    const v = (plan.value as any)[p]
    if (v === null || v === undefined) return false
    // 流量重置包仅对当前正在使用该套餐的用户开放
    if (p === 'reset_price') return isCurrent.value
    return true
  }).map((p) => ({ key: p, price: (plan.value as any)[p] as number }))
})

const price = computed(() => periods.value.find((p) => p.key === period.value)?.price ?? 0)

const discount = computed(() => {
  const c = coupon.value
  if (!c) return 0
  if (c.limit_period && !c.limit_period.includes(period.value)) return 0
  const d = c.type === 1 ? c.value : Math.floor((price.value * c.value) / 100)
  return Math.min(d, price.value)
})
const total = computed(() => Math.max(0, price.value - discount.value))

onMounted(async () => {
  loadUserConfig().catch(() => {})
  try {
    const [p] = await Promise.all([userApi.plan(String(route.params.plan_id)), loadSubscribe().catch(() => null)])
    plan.value = p
    const q = typeof route.query.period === 'string' ? route.query.period : ''
    period.value = periods.value.some((x) => x.key === q) ? q : periods.value.find((x) => x.key !== 'reset_price')?.key || periods.value[0]?.key || ''
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

watch(period, () => {
  if (coupon.value?.limit_period && !coupon.value.limit_period.includes(period.value)) {
    coupon.value = null
    toast.warning(t('优惠券不适用于当前周期，已移除'))
  }
})

async function checkCoupon() {
  if (!couponCode.value || !plan.value) return
  checking.value = true
  try {
    coupon.value = await userApi.checkCoupon(couponCode.value, plan.value.id, period.value)
    toast.success(t('优惠券可用'))
  } catch (e) {
    coupon.value = null
    showError(e)
  } finally {
    checking.value = false
  }
}

async function submit() {
  if (!plan.value || !period.value) return
  const sub = state.subscribe
  const hasValidPlan = !!sub?.plan_id && (!sub.expired_at || sub.expired_at * 1000 > Date.now())
  if (hasValidPlan && sub!.plan_id !== plan.value.id && period.value !== 'reset_price') {
    const ok = await confirm({
      title: t('更换套餐'),
      content: t('你当前的订阅仍在有效期内，更换套餐后新套餐将覆盖当前订阅，确定继续吗？'),
      confirmText: t('继续购买'),
    })
    if (!ok) return
  }
  if (period.value === 'reset_price') {
    const ok = await confirm({
      title: t('购买流量重置包'),
      content: t('流量重置包购买后立即生效，会将本期已用流量清零，不会延长到期时间。'),
      confirmText: t('确定购买'),
    })
    if (!ok) return
  }
  submitting.value = true
  try {
    const tradeNo = await userApi.saveOrder(plan.value.id, period.value, coupon.value ? couponCode.value : undefined)
    router.push(`/order/${tradeNo}`)
  } catch (e) {
    if (e instanceof ApiError && /unpaid|pending|未付款|待支付|开通中/i.test(e.message)) {
      const go = await confirm({ title: t('存在未完成的订单'), content: e.message, confirmText: t('前往订单') })
      if (go) router.push('/order')
    } else {
      showError(e)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Spinner v-if="loading" />
  <Empty v-else-if="!plan" icon="bag" :text="t('套餐不存在或已下架')">
    <RouterLink to="/plan" class="sb-btn-outline">{{ t('返回套餐列表') }}</RouterLink>
  </Empty>
  <div v-else>
    <RouterLink to="/plan" class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
      <Icon name="arrow-left" :size="16" />{{ t('返回套餐列表') }}
    </RouterLink>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <section class="sb-card p-6">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl">{{ plan.name }}</h1>
            <span v-if="isCurrent" class="sb-badge bg-quaternary">{{ t('当前套餐') }}</span>
            <span v-for="tag in plan.tags || []" :key="tag" class="sb-badge bg-muted">{{ tag }}</span>
          </div>
          <div class="mt-5">
            <PlanContent :content="plan.content" />
          </div>
        </section>

        <section class="sb-card p-6">
          <h3 class="text-lg">{{ t('付款周期') }}</h3>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              v-for="p in periods"
              :key="p.key"
              class="relative flex items-center justify-between rounded-xl border-2 p-4 text-left transition"
              :class="period === p.key ? 'bg-primary/10 shadow-pop' : 'bg-card hover:bg-muted'"
              :style="period === p.key ? 'border-color: hsl(var(--primary))' : 'border-color: hsl(var(--border))'"
              @click="period = p.key"
            >
              <span>
                <span class="block font-semibold">{{ periodLabel(p.key) }}</span>
                <span v-if="PERIOD_MONTHS[p.key] && PERIOD_MONTHS[p.key] > 1" class="block text-xs text-muted-foreground">
                  {{ t('折合 {p}/月', { p: currencySymbol() + money(p.price / PERIOD_MONTHS[p.key]) }) }}
                </span>
              </span>
              <span class="font-heading text-xl">{{ currencySymbol() }}{{ money(p.price) }}</span>
              <span
                v-if="period === p.key"
                class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-primary text-white"
                style="border-color: var(--ink)"
              >
                <Icon name="check" :size="14" />
              </span>
            </button>
          </div>
          <p v-if="isCurrent && !plan.renew && period !== 'reset_price'" class="mt-4 flex items-center gap-1.5 text-xs text-warning">
            <Icon name="alert" :size="14" />{{ t('该套餐不支持续费，如需继续使用请选择其它套餐。') }}
          </p>
        </section>
      </div>

      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section class="sb-card p-6">
          <h3 class="text-lg">{{ t('优惠券') }}</h3>
          <div class="mt-4 flex gap-2">
            <input v-model.trim="couponCode" class="sb-input flex-1" :placeholder="t('输入优惠码')" @keyup.enter="checkCoupon" />
            <button class="sb-btn-outline shrink-0" :disabled="!couponCode || checking" @click="checkCoupon">
              <Icon v-if="checking" name="loader" :size="14" />{{ t('验证') }}
            </button>
          </div>
          <p v-if="coupon" class="mt-3 flex items-center gap-1.5 text-sm text-quaternary">
            <Icon name="tag" :size="14" />{{ coupon.name }}
          </p>
        </section>

        <section class="sb-card p-6">
          <h3 class="text-lg">{{ t('订单总额') }}</h3>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-muted-foreground">{{ plan.name }} × {{ periodLabel(period) }}</dt>
              <dd class="font-mono">{{ currencySymbol() }}{{ money(price) }}</dd>
            </div>
            <div v-if="discount" class="flex justify-between text-quaternary">
              <dt>{{ t('优惠') }}</dt>
              <dd class="font-mono">-{{ currencySymbol() }}{{ money(discount) }}</dd>
            </div>
          </dl>
          <div class="my-4 border-t-2 border-dashed" />
          <div class="flex items-end justify-between">
            <span class="text-sm font-semibold">{{ t('合计') }}</span>
            <span class="font-heading text-3xl">{{ currencySymbol() }}{{ money(total) }}</span>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">{{ t('账户余额、升级折抵等将在下单时自动计算，以订单页为准。') }}</p>
          <button class="sb-btn-primary sb-btn-lg mt-5 w-full" :disabled="!period || submitting" @click="submit">
            <Icon v-if="submitting" name="loader" :size="16" />{{ t('下单') }}
          </button>
        </section>
      </aside>
    </div>
  </div>
</template>
