<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import Modal from '@/components/Modal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type CommissionLog, type InviteData } from '@/api'
import { currencySymbol, loadUser, loadUserConfig, state } from '@/stores/app'
import { copyText, formatDate, money } from '@/utils/format'
import { showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const loading = ref(true)
const invite = ref<InviteData | null>(null)
const generating = ref(false)

const logs = ref<CommissionLog[]>([])
const logTotal = ref(0)
const page = ref(1)
const PAGE_SIZE = 10
const logsLoading = ref(false)

const transferOpen = ref(false)
const transferAmount = ref('')
const transferring = ref(false)

const withdrawOpen = ref(false)
const withdrawForm = ref({ method: '', account: '' })
const withdrawing = ref(false)

const stat = computed(() => invite.value?.stat ?? [0, 0, 0, 0, 0])
const cfg = computed(() => state.userConfig)

function inviteLink(code: string) {
  const base = (window.routerBase || '/').replace(/\/?$/, '/')
  return `${window.location.origin}${base}#/register?code=${code}`
}

async function loadInvite() {
  invite.value = await userApi.invite()
}

async function loadLogs() {
  logsLoading.value = true
  try {
    const res = await userApi.inviteDetails(page.value, PAGE_SIZE)
    logs.value = res.data || []
    logTotal.value = res.total || 0
  } catch (e) {
    showError(e)
  } finally {
    logsLoading.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadInvite(), loadUserConfig(), loadLogs()])
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

async function generate() {
  generating.value = true
  try {
    await userApi.inviteSave()
    await loadInvite()
    toast.success(t('邀请码已生成'))
  } catch (e) {
    showError(e)
  } finally {
    generating.value = false
  }
}

async function copy(text: string) {
  ;(await copyText(text)) ? toast.success(t('已复制')) : toast.error(t('复制失败，请手动复制'))
}

function goPage(p: number) {
  page.value = p
  loadLogs()
}
const pages = computed(() => Math.max(1, Math.ceil(logTotal.value / PAGE_SIZE)))

async function doTransfer() {
  const yuan = Number(transferAmount.value)
  const cents = Math.round(yuan * 100)
  if (!yuan || cents < 1) return toast.warning(t('请输入正确的金额'))
  if (cents > stat.value[4]) return toast.warning(t('可用佣金不足'))
  transferring.value = true
  try {
    await userApi.transfer(cents)
    toast.success(t('已划转到账户余额'))
    transferOpen.value = false
    transferAmount.value = ''
    await Promise.all([loadInvite(), loadUser()])
  } catch (e) {
    showError(e)
  } finally {
    transferring.value = false
  }
}

function openWithdraw() {
  withdrawForm.value = { method: cfg.value?.withdraw_methods?.[0] || '', account: '' }
  withdrawOpen.value = true
}

async function doWithdraw() {
  if (!withdrawForm.value.method || !withdrawForm.value.account.trim()) return toast.warning(t('请填写提现方式和账号'))
  withdrawing.value = true
  try {
    await userApi.withdraw(withdrawForm.value.method, withdrawForm.value.account.trim())
    toast.success(t('提现申请已提交，可在工单中查看进度'))
    withdrawOpen.value = false
  } catch (e) {
    showError(e)
  } finally {
    withdrawing.value = false
  }
}
</script>

<template>
  <Spinner v-if="loading" />
  <div v-else class="space-y-6">
    <PageHeader :title="t('我的邀请')" :desc="t('邀请好友注册并购买，即可获得佣金返利')" />

    <!-- 佣金概览 -->
    <section class="sb-card overflow-hidden">
      <div class="grid gap-6 bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-6 md:grid-cols-[1.3fr_1fr]">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ t('可用佣金') }}</div>
          <div class="mt-2 font-heading text-4xl">{{ currencySymbol() }}{{ money(stat[4]) }}</div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button class="sb-btn-primary" :disabled="!stat[4]" @click="transferOpen = true">
              <Icon name="wallet" :size="16" />{{ t('划转到余额') }}
            </button>
            <button v-if="!cfg?.withdraw_close" class="sb-btn-outline" :disabled="!stat[4]" @click="openWithdraw">
              <Icon name="download" :size="16" />{{ t('申请提现') }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl border-2 bg-card p-4" style="border-color: var(--ink)">
            <div class="text-xs text-muted-foreground">{{ t('已注册用户') }}</div>
            <div class="mt-1 font-heading text-2xl">{{ stat[0] }}</div>
          </div>
          <div class="rounded-xl border-2 bg-card p-4" style="border-color: var(--ink)">
            <div class="text-xs text-muted-foreground">{{ t('佣金比例') }}</div>
            <div class="mt-1 font-heading text-2xl">{{ stat[3] }}%</div>
          </div>
          <div class="rounded-xl border-2 bg-card p-4" style="border-color: var(--ink)">
            <div class="text-xs text-muted-foreground">{{ t('确认中的佣金') }}</div>
            <div class="mt-1 font-heading text-2xl">{{ currencySymbol() }}{{ money(stat[2]) }}</div>
          </div>
          <div class="rounded-xl border-2 bg-card p-4" style="border-color: var(--ink)">
            <div class="text-xs text-muted-foreground">{{ t('累计获得佣金') }}</div>
            <div class="mt-1 font-heading text-2xl">{{ currencySymbol() }}{{ money(stat[1]) }}</div>
          </div>
        </div>
      </div>
      <div v-if="cfg?.commission_distribution_enable" class="flex flex-wrap gap-3 border-t-2 border-dashed px-6 py-4 text-sm">
        <span class="font-semibold">{{ t('三级分销') }}：</span>
        <span>{{ t('一级') }} {{ cfg.commission_distribution_l1 }}%</span>
        <span>{{ t('二级') }} {{ cfg.commission_distribution_l2 }}%</span>
        <span>{{ t('三级') }} {{ cfg.commission_distribution_l3 }}%</span>
      </div>
      <p class="border-t-2 border-dashed px-6 py-3 text-xs text-muted-foreground">
        {{ t('被邀请用户的订单完成后，佣金会先进入“确认中”，审核通过后转入可用佣金。') }}
      </p>
    </section>

    <!-- 邀请码 -->
    <section class="sb-card p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg">{{ t('邀请码管理') }}</h3>
        <button class="sb-btn-dark sb-btn-sm" :disabled="generating" @click="generate">
          <Icon :name="generating ? 'loader' : 'plus'" :size="14" />{{ t('生成邀请码') }}
        </button>
      </div>
      <Empty v-if="!invite?.codes.length" icon="link" :text="t('还没有邀请码，点击右上角生成')" />
      <div v-else class="mt-4 space-y-3">
        <div
          v-for="c in invite.codes"
          :key="c.code"
          class="flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-3"
        >
          <span class="sb-badge bg-primary text-primary-foreground font-mono">{{ c.code }}</span>
          <code class="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{{ inviteLink(c.code) }}</code>
          <span class="text-xs text-muted-foreground">{{ t('访问 {n} 次', { n: c.pv }) }}</span>
          <button class="sb-btn-outline sb-btn-sm" @click="copy(inviteLink(c.code))"><Icon name="copy" :size="14" />{{ t('复制链接') }}</button>
        </div>
      </div>
    </section>

    <!-- 佣金明细 -->
    <section class="sb-card overflow-hidden">
      <div class="px-6 pt-6"><h3 class="text-lg">{{ t('佣金发放记录') }}</h3></div>
      <Spinner v-if="logsLoading" />
      <Empty v-else-if="!logs.length" icon="receipt" :text="t('暂无佣金记录')" />
      <div v-else class="mt-2 overflow-x-auto">
        <table class="sb-table">
          <thead>
            <tr>
              <th>{{ t('发放时间') }}</th>
              <th>{{ t('订单号') }}</th>
              <th class="text-right">{{ t('订单金额') }}</th>
              <th class="text-right">{{ t('佣金') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id">
              <td class="whitespace-nowrap">{{ formatDate(l.created_at, true) }}</td>
              <td class="font-mono text-xs">{{ l.trade_no }}</td>
              <td class="text-right font-mono">{{ currencySymbol() }}{{ money(l.order_amount) }}</td>
              <td class="text-right font-mono font-semibold text-quaternary">+{{ currencySymbol() }}{{ money(l.get_amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pages > 1" class="flex items-center justify-end gap-2 border-t-2 border-dashed px-6 py-3">
        <button class="sb-btn-ghost" :disabled="page <= 1" @click="goPage(page - 1)"><Icon name="chevron-left" :size="16" /></button>
        <span class="text-sm">{{ page }} / {{ pages }}</span>
        <button class="sb-btn-ghost" :disabled="page >= pages" @click="goPage(page + 1)"><Icon name="chevron-right" :size="16" /></button>
      </div>
    </section>

    <Modal :open="transferOpen" :title="t('划转到余额')" width="max-w-md" @close="transferOpen = false">
      <p class="mb-4 text-sm text-muted-foreground">{{ t('划转后的余额仅可用于站内消费，无法再提现。') }}</p>
      <label class="sb-label">{{ t('划转金额') }}（{{ t('可用') }} {{ currencySymbol() }}{{ money(stat[4]) }}）</label>
      <div class="flex gap-2">
        <input v-model="transferAmount" type="number" min="0.01" step="0.01" class="sb-input flex-1" :placeholder="t('请输入金额')" />
        <button class="sb-btn-outline shrink-0" @click="transferAmount = money(stat[4])">{{ t('全部') }}</button>
      </div>
      <template #footer>
        <button class="sb-btn-outline" @click="transferOpen = false">{{ t('取消') }}</button>
        <button class="sb-btn-primary" :disabled="transferring" @click="doTransfer">
          <Icon v-if="transferring" name="loader" :size="14" />{{ t('确认划转') }}
        </button>
      </template>
    </Modal>

    <Modal :open="withdrawOpen" :title="t('申请提现')" width="max-w-md" @close="withdrawOpen = false">
      <div class="space-y-4">
        <div>
          <label class="sb-label">{{ t('提现方式') }}</label>
          <select v-model="withdrawForm.method" class="sb-input">
            <option v-for="m in cfg?.withdraw_methods || []" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div>
          <label class="sb-label">{{ t('提现账号') }}</label>
          <input v-model="withdrawForm.account" class="sb-input" :placeholder="t('请输入提现账号')" />
        </div>
        <p class="text-xs text-muted-foreground">{{ t('提交后系统会自动创建工单，客服处理完成后会在工单中回复。') }}</p>
      </div>
      <template #footer>
        <button class="sb-btn-outline" @click="withdrawOpen = false">{{ t('取消') }}</button>
        <button class="sb-btn-primary" :disabled="withdrawing" @click="doWithdraw">
          <Icon v-if="withdrawing" name="loader" :size="14" />{{ t('提交申请') }}
        </button>
      </template>
    </Modal>
  </div>
</template>
