<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import PageHeader from '@/components/PageHeader.vue'
import PlanContent from '@/components/PlanContent.vue'
import { userApi, type Plan } from '@/api'
import { currencySymbol, loadUserConfig } from '@/stores/app'
import { PERIODS, PERIOD_MONTHS, money, periodLabel } from '@/utils/format'
import { showError } from '@/utils/feedback'
import { t } from '@/i18n'

const loading = ref(true)
const plans = ref<Plan[]>([])
const filter = ref<'all' | 'period' | 'traffic'>('all')

onMounted(async () => {
  loadUserConfig().catch(() => {})
  try {
    plans.value = await userApi.plans()
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

onActivated(async () => {
  try {
    plans.value = await userApi.plans()
  } catch {}
})

const SELLABLE = PERIODS.filter((p) => p !== 'reset_price')

function lowest(plan: Plan) {
  // 优先展示月付，否则展示第一个有价格的周期
  for (const p of SELLABLE) {
    const v = (plan as any)[p]
    if (v !== null && v !== undefined) return { period: p, price: v as number }
  }
  return null
}

function isOnetime(plan: Plan) {
  return SELLABLE.every((p) => p === 'onetime_price' || (plan as any)[p] === null || (plan as any)[p] === undefined) && plan.onetime_price !== null
}

const list = computed(() => {
  if (filter.value === 'period') return plans.value.filter((p) => !isOnetime(p))
  if (filter.value === 'traffic') return plans.value.filter((p) => isOnetime(p))
  return plans.value
})

const soldOut = (p: Plan) => typeof p.capacity_limit === 'string'
const accents = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-quaternary']
</script>

<template>
  <div>
    <PageHeader :title="t('购买订阅')" :desc="t('选择最适合你的套餐，所有套餐均支持全平台使用')">
      <div class="flex gap-1 rounded-full border-2 bg-card p-1" style="border-color: var(--ink)">
        <button
          v-for="f in [
            { v: 'all', l: '全部' },
            { v: 'period', l: '按周期' },
            { v: 'traffic', l: '按流量' },
          ]"
          :key="f.v"
          class="rounded-full px-4 py-1.5 text-sm font-semibold transition"
          :class="filter === f.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="filter = f.v as any"
        >
          {{ t(f.l) }}
        </button>
      </div>
    </PageHeader>

    <Spinner v-if="loading" />
    <Empty v-else-if="!list.length" icon="bag" :text="t('暂无可购买的套餐')" />
    <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="(plan, i) in list" :key="plan.id" class="sb-card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop-lg">
        <div class="flex items-start justify-between gap-3">
          <span class="sb-icon-tile" :class="accents[i % accents.length]"><Icon name="zap" :size="20" /></span>
          <div class="flex flex-wrap justify-end gap-1.5">
            <span v-for="tag in plan.tags || []" :key="tag" class="sb-badge bg-muted">{{ tag }}</span>
            <span v-if="soldOut(plan)" class="sb-badge bg-destructive text-white">{{ t('已售罄') }}</span>
          </div>
        </div>
        <h2 class="mt-5 text-xl">{{ plan.name }}</h2>
        <div v-if="lowest(plan)" class="mt-3 flex items-baseline gap-1">
          <span class="font-heading text-4xl">{{ currencySymbol() }}{{ money(lowest(plan)!.price) }}</span>
          <span class="text-sm text-muted-foreground">/ {{ periodLabel(lowest(plan)!.period) }}</span>
        </div>
        <div
          v-if="lowest(plan) && PERIOD_MONTHS[lowest(plan)!.period] && plan.year_price && lowest(plan)!.period !== 'year_price'"
          class="mt-1 text-xs text-muted-foreground"
        >
          {{ t('年付低至 {p}/月', { p: currencySymbol() + money(plan.year_price / 12) }) }}
        </div>
        <div class="my-5 border-t-2 border-dashed" />
        <div class="flex-1">
          <PlanContent :content="plan.content" />
        </div>
        <RouterLink
          :to="`/plan/${plan.id}`"
          class="mt-6 w-full"
          :class="soldOut(plan) ? 'sb-btn-outline pointer-events-none opacity-50' : 'sb-btn-primary'"
        >
          {{ soldOut(plan) ? t('已售罄') : t('立即订阅') }}<Icon v-if="!soldOut(plan)" name="arrow-right" :size="16" />
        </RouterLink>
      </article>
    </div>
  </div>
</template>
