<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type Order } from '@/api'
import { currencySymbol, loadUserConfig } from '@/stores/app'
import { formatDate, money, periodLabel } from '@/utils/format'
import { statusClass, statusLabel, typeLabel } from '@/utils/order'
import { confirm, showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const loading = ref(true)
const orders = ref<Order[]>([])

async function load() {
  try {
    orders.value = await userApi.orders()
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserConfig().catch(() => {})
  load()
})

onActivated(() => {
  load().catch(() => {})
})

async function cancel(o: Order) {
  const ok = await confirm({ title: t('取消订单'), content: t('确定要取消该订单吗？'), danger: true, confirmText: t('取消订单'), cancelText: t('再想想') })
  if (!ok) return
  try {
    await userApi.cancelOrder(o.trade_no)
    toast.success(t('订单已取消'))
    load()
  } catch (e) {
    showError(e)
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('我的订单')" :desc="t('查看所有订单与支付状态')" />
    <Spinner v-if="loading" />
    <div v-else-if="!orders.length" class="sb-card">
      <Empty icon="receipt" :text="t('暂无订单')">
        <RouterLink to="/plan" class="sb-btn-primary sb-btn-sm">{{ t('去购买') }}</RouterLink>
      </Empty>
    </div>
    <template v-else>
      <!-- 桌面端表格 -->
      <div class="sb-card hidden overflow-x-auto md:block">
        <table class="sb-table">
          <thead>
            <tr>
              <th>{{ t('订单号') }}</th>
              <th>{{ t('套餐') }}</th>
              <th>{{ t('类型') }}</th>
              <th>{{ t('周期') }}</th>
              <th>{{ t('金额') }}</th>
              <th>{{ t('状态') }}</th>
              <th>{{ t('创建时间') }}</th>
              <th class="text-right">{{ t('操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.trade_no" class="hover:bg-muted/50">
              <td class="font-mono text-xs">{{ o.trade_no }}</td>
              <td class="font-medium">{{ o.plan?.name || '-' }}</td>
              <td>{{ typeLabel(o.type) }}</td>
              <td>{{ periodLabel(o.period) }}</td>
              <td class="font-mono">{{ currencySymbol() }}{{ money(o.total_amount) }}</td>
              <td><span class="sb-badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
              <td class="whitespace-nowrap text-muted-foreground">{{ formatDate(o.created_at, true) }}</td>
              <td class="whitespace-nowrap text-right">
                <RouterLink :to="`/order/${o.trade_no}`" class="sb-btn-ghost text-primary">
                  {{ o.status === 0 ? t('去支付') : t('查看详情') }}
                </RouterLink>
                <button v-if="o.status === 0" class="sb-btn-ghost text-destructive" @click="cancel(o)">{{ t('取消') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 移动端卡片 -->
      <div class="space-y-4 md:hidden">
        <div v-for="o in orders" :key="o.trade_no" class="sb-card p-4">
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{ o.plan?.name || '-' }}</span>
            <span class="sb-badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
          </div>
          <div class="mt-2 space-y-1 text-xs text-muted-foreground">
            <div>{{ typeLabel(o.type) }} · {{ periodLabel(o.period) }}</div>
            <div class="font-mono">{{ o.trade_no }}</div>
            <div>{{ formatDate(o.created_at, true) }}</div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="font-heading text-xl">{{ currencySymbol() }}{{ money(o.total_amount) }}</span>
            <div class="flex gap-2">
              <button v-if="o.status === 0" class="sb-btn-outline sb-btn-sm" @click="cancel(o)">{{ t('取消') }}</button>
              <RouterLink :to="`/order/${o.trade_no}`" class="sb-btn-primary sb-btn-sm">
                {{ o.status === 0 ? t('去支付') : t('详情') }}<Icon name="chevron-right" :size="14" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
