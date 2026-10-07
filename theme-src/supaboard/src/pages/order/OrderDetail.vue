<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import Modal from '@/components/Modal.vue'
const QrCode = defineAsyncComponent(() => import('@/components/QrCode.vue'))
import { userApi, type Order, type PaymentMethod } from '@/api'
import { currencySymbol, loadSubscribe, loadUser, loadUserConfig } from '@/stores/app'
import { copyText, formatDate, money, periodLabel } from '@/utils/format'
import { statusClass, statusLabel, typeLabel } from '@/utils/order'
import { confirm, showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const tradeNo = String(route.params.trade_no)

const loading = ref(true)
const order = ref<Order | null>(null)
const methods = ref<PaymentMethod[]>([])
const methodId = ref<number | null>(null)
const paying = ref(false)
const qr = ref('')
let poll: ReturnType<typeof setInterval> | null = null

const method = computed(() => methods.value.find((m) => m.id === methodId.value) || null)
const handling = computed(() => {
  const m = method.value
  if (!m || !order.value || order.value.total_amount <= 0) return 0
  if (!m.handling_fee_fixed && !m.handling_fee_percent) return 0
  return Math.round(order.value.total_amount * ((m.handling_fee_percent || 0) / 100) + (m.handling_fee_fixed || 0))
})
const payable = computed(() => (order.value ? order.value.total_amount + handling.value : 0))
const planTraffic = computed(() => (order.value?.plan?.transfer_enable ? `${order.value.plan.transfer_enable} GB` : '-'))

async function load() {
  order.value = await userApi.order(tradeNo)
  if (order.value.status === 0 || order.value.status === 1) startPolling()
  else stopPolling()
}

onMounted(async () => {
  loadUserConfig().catch(() => {})
  try {
    await load()
    if (order.value?.status === 0) {
      methods.value = await userApi.paymentMethods()
      methodId.value = methods.value[0]?.id ?? null
    }
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

/** 支付状态轮询：从第三方支付页返回、或扫码支付时自动刷新 */
function startPolling() {
  if (poll) return
  poll = setInterval(async () => {
    try {
      const s = await userApi.orderStatus(tradeNo)
      if (order.value && s !== order.value.status) {
        await load()
        if (s === 3) {
          qr.value = ''
          toast.success(t('支付成功，订阅已开通'))
          loadSubscribe().catch(() => {})
          loadUser().catch(() => {})
        }
      }
    } catch {
      /* ignore */
    }
  }, 3000)
}
function stopPolling() {
  if (poll) clearInterval(poll)
  poll = null
}
onBeforeUnmount(stopPolling)

async function pay() {
  if (!order.value) return
  const free = order.value.total_amount <= 0
  if (!free && !methodId.value) return toast.warning(t('请选择支付方式'))
  paying.value = true
  try {
    const res = await userApi.checkout(tradeNo, methodId.value ?? 0)
    if (res.type === -1) {
      toast.success(t('支付成功，订阅已开通'))
      await load()
      loadSubscribe().catch(() => {})
      loadUser().catch(() => {})
    } else if (res.type === 0) {
      qr.value = String(res.data)
      startPolling()
    } else if (res.type === 1) {
      toast.info(t('正在跳转到支付页面…'))
      window.location.href = String(res.data)
    } else {
      toast.error(t('暂不支持该支付方式，请更换其它方式'))
    }
  } catch (e) {
    showError(e)
  } finally {
    paying.value = false
  }
}

async function cancel() {
  const ok = await confirm({ title: t('取消订单'), content: t('确定要取消该订单吗？'), danger: true, confirmText: t('取消订单'), cancelText: t('再想想') })
  if (!ok) return
  try {
    await userApi.cancelOrder(tradeNo)
    toast.success(t('订单已取消'))
    router.push('/order')
  } catch (e) {
    showError(e)
  }
}

async function copyNo() {
  ;(await copyText(tradeNo)) && toast.success(t('已复制'))
}
</script>

<template>
  <Spinner v-if="loading" />
  <Empty v-else-if="!order" icon="receipt" :text="t('订单不存在')">
    <RouterLink to="/order" class="sb-btn-outline">{{ t('返回订单列表') }}</RouterLink>
  </Empty>
  <div v-else>
    <RouterLink to="/order" class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
      <Icon name="arrow-left" :size="16" />{{ t('返回订单列表') }}
    </RouterLink>

    <!-- 状态横幅 -->
    <div
      v-if="order.status !== 0"
      class="sb-card mb-6 flex items-center gap-4 p-5"
      :class="order.status === 3 ? 'bg-quaternary/15' : order.status === 1 ? 'bg-tertiary/10' : 'bg-muted'"
    >
      <span class="sb-icon-tile" :class="order.status === 3 ? 'bg-quaternary' : order.status === 1 ? 'bg-tertiary' : 'bg-muted-foreground'">
        <Icon :name="order.status === 3 ? 'check' : order.status === 1 ? 'loader' : 'x'" :size="20" />
      </span>
      <div>
        <div class="font-heading text-lg">{{ statusLabel(order.status) }}</div>
        <div class="text-sm text-muted-foreground">
          <template v-if="order.status === 3">{{ t('订单已支付并开通，感谢你的支持。') }}</template>
          <template v-else-if="order.status === 1">{{ t('订单已支付，正在为你开通，请稍候…') }}</template>
          <template v-else-if="order.status === 2">{{ t('订单已取消。') }}</template>
          <template v-else>{{ t('该订单已被折抵。') }}</template>
        </div>
      </div>
      <RouterLink v-if="order.status === 3" to="/dashboard" class="sb-btn-primary sb-btn-sm ml-auto">{{ t('前往仪表盘') }}</RouterLink>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <section class="sb-card p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg">{{ t('商品信息') }}</h3>
            <span class="sb-badge" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
          </div>
          <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt class="text-muted-foreground">{{ t('产品名称') }}</dt><dd class="mt-1 font-semibold">{{ order.plan?.name }}</dd></div>
            <div><dt class="text-muted-foreground">{{ t('类型 / 周期') }}</dt><dd class="mt-1 font-semibold">{{ typeLabel(order.type) }} · {{ periodLabel(order.period) }}</dd></div>
            <div><dt class="text-muted-foreground">{{ t('产品流量') }}</dt><dd class="mt-1 font-semibold">{{ planTraffic }}</dd></div>
            <div>
              <dt class="text-muted-foreground">{{ t('订单号') }}</dt>
              <dd class="mt-1 flex items-center gap-1 font-mono text-xs">
                {{ order.trade_no }}
                <button class="sb-btn-ghost p-1" @click="copyNo"><Icon name="copy" :size="14" /></button>
              </dd>
            </div>
            <div><dt class="text-muted-foreground">{{ t('创建时间') }}</dt><dd class="mt-1">{{ formatDate(order.created_at, true) }}</dd></div>
            <div v-if="order.paid_at"><dt class="text-muted-foreground">{{ t('支付时间') }}</dt><dd class="mt-1">{{ formatDate(order.paid_at, true) }}</dd></div>
            <div v-if="order.payment"><dt class="text-muted-foreground">{{ t('支付方式') }}</dt><dd class="mt-1">{{ order.payment.name }}</dd></div>
          </dl>
          <div v-if="order.surplus_orders?.length" class="mt-5 rounded-xl border-2 border-dashed p-3 text-xs text-muted-foreground">
            {{ t('本订单折抵了 {n} 笔旧订单的剩余价值', { n: order.surplus_orders.length }) }}：
            <span v-for="s in order.surplus_orders" :key="s.trade_no" class="mr-2 font-mono">{{ s.trade_no }}</span>
          </div>
        </section>

        <section v-if="order.status === 0 && order.total_amount > 0" class="sb-card p-6">
          <h3 class="text-lg">{{ t('支付方式') }}</h3>
          <Empty v-if="!methods.length" icon="card" :text="t('暂无可用的支付方式，请联系客服')" />
          <div v-else class="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              v-for="m in methods"
              :key="m.id"
              class="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition"
              :class="methodId === m.id ? 'bg-primary/10 shadow-pop' : 'bg-card hover:bg-muted'"
              :style="methodId === m.id ? 'border-color: hsl(var(--primary))' : 'border-color: hsl(var(--border))'"
              @click="methodId = m.id"
            >
              <img v-if="m.icon" :src="m.icon" alt="" class="h-8 w-8 rounded-md object-contain" />
              <span v-else class="sb-icon-tile h-8 w-8 bg-tertiary"><Icon name="card" :size="16" /></span>
              <span class="flex-1">
                <span class="block font-semibold">{{ m.name }}</span>
                <span v-if="m.handling_fee_percent || m.handling_fee_fixed" class="block text-xs text-muted-foreground">
                  {{ t('手续费') }}
                  <template v-if="m.handling_fee_percent">{{ m.handling_fee_percent }}%</template>
                  <template v-if="m.handling_fee_fixed"> + {{ currencySymbol() }}{{ money(m.handling_fee_fixed) }}</template>
                </span>
              </span>
              <Icon v-if="methodId === m.id" name="check-circle" class="text-primary" />
            </button>
          </div>
        </section>
      </div>

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <section class="sb-card p-6">
          <h3 class="text-lg">{{ t('订单总额') }}</h3>
          <dl class="mt-4 space-y-3 text-sm">
            <div v-if="order.discount_amount" class="flex justify-between text-quaternary">
              <dt>{{ t('优惠') }}</dt><dd class="font-mono">-{{ currencySymbol() }}{{ money(order.discount_amount) }}</dd>
            </div>
            <div v-if="order.surplus_amount" class="flex justify-between">
              <dt class="text-muted-foreground">{{ t('旧订阅折抵') }}</dt><dd class="font-mono">-{{ currencySymbol() }}{{ money(order.surplus_amount) }}</dd>
            </div>
            <div v-if="order.balance_amount" class="flex justify-between">
              <dt class="text-muted-foreground">{{ t('余额支付') }}</dt><dd class="font-mono">-{{ currencySymbol() }}{{ money(order.balance_amount) }}</dd>
            </div>
            <div v-if="handling && order.status === 0" class="flex justify-between">
              <dt class="text-muted-foreground">{{ t('手续费') }}</dt><dd class="font-mono">+{{ currencySymbol() }}{{ money(handling) }}</dd>
            </div>
            <div v-else-if="order.handling_amount && order.status !== 0" class="flex justify-between">
              <dt class="text-muted-foreground">{{ t('手续费') }}</dt><dd class="font-mono">+{{ currencySymbol() }}{{ money(order.handling_amount) }}</dd>
            </div>
          </dl>
          <div class="my-4 border-t-2 border-dashed" />
          <div class="flex items-end justify-between">
            <span class="text-sm font-semibold">{{ order.status === 0 ? t('应付金额') : t('实付金额') }}</span>
            <span class="font-heading text-3xl">
              {{ currencySymbol() }}{{ money(order.status === 0 ? payable : order.total_amount + (order.handling_amount || 0)) }}
            </span>
          </div>
          <template v-if="order.status === 0">
            <button class="sb-btn-primary sb-btn-lg mt-5 w-full" :disabled="paying || (order.total_amount > 0 && !methodId)" @click="pay">
              <Icon v-if="paying" name="loader" :size="16" />
              {{ order.total_amount > 0 ? t('立即支付') : t('确认开通') }}
            </button>
            <button class="sb-btn-ghost mt-3 w-full text-destructive" @click="cancel">{{ t('取消订单') }}</button>
          </template>
        </section>
      </aside>
    </div>

    <Modal v-if="qr" :open="!!qr" :title="t('扫码支付')" width="max-w-sm" @close="qr = ''">
      <div class="flex flex-col items-center gap-4 pb-2">
        <QrCode :value="qr" :size="220" />
        <div class="font-heading text-2xl">{{ currencySymbol() }}{{ money(payable) }}</div>
        <p class="flex items-center gap-2 text-center text-sm text-muted-foreground">
          <Icon name="loader" :size="14" />{{ t('请使用对应 App 扫码支付，支付完成后页面将自动刷新') }}
        </p>
      </div>
    </Modal>
  </div>
</template>
