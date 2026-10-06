<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type TrafficLog } from '@/api'
import { formatBytes, formatDate, formatDateTime } from '@/utils/format'
import { showError } from '@/utils/feedback'
import { t } from '@/i18n'

const loading = ref(true)
const logs = ref<TrafficLog[]>([])

onMounted(async () => {
  try {
    logs.value = await userApi.trafficLog()
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

const actualU = (l: TrafficLog) => Number(l.u) / (Number(l.server_rate) || 1)
const actualD = (l: TrafficLog) => Number(l.d) / (Number(l.server_rate) || 1)
const charged = (l: TrafficLog) => Number(l.u) + Number(l.d)

/**
 * 格式化记录时间：
 * 后端 v2_stat_user 表为按天汇总数据，record_at 为当天 0 点时间戳。
 * 若后端返回了精确的更新时间 updated_at / created_at，则展示完整时分秒；
 * 否则仅展示日期（YYYY-MM-DD），避免时区偏差导致强行显示如 01:00:00 这类无效时间。
 */
function formatRecordTime(l: TrafficLog): string {
  const exact = l.updated_at || l.created_at
  if (exact) {
    return formatDateTime(exact, true)
  }
  return formatDate(l.record_at)
}

/** 按天聚合，用于顶部柱状图 */
const daily = computed(() => {
  const map = new Map<string, number>()
  for (const l of logs.value) {
    const k = formatDate(l.record_at)
    map.set(k, (map.get(k) || 0) + charged(l))
  }
  return [...map.entries()].map(([day, v]) => ({ day, v })).reverse()
})
const max = computed(() => Math.max(1, ...daily.value.map((d) => d.v)))
const sum = computed(() => logs.value.reduce((s, l) => s + charged(l), 0))
</script>

<template>
  <div>
    <PageHeader :title="t('流量明细')" :desc="t('仅展示本月的流量使用记录，数据可能存在延迟')" />
    <Spinner v-if="loading" />
    <div v-else-if="!logs.length" class="sb-card"><Empty icon="chart" :text="t('本月暂无流量记录')" /></div>
    <div v-else class="space-y-6">
      <section class="sb-card p-6">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ t('本月合计扣除') }}</div>
            <div class="mt-1 font-heading text-3xl">{{ formatBytes(sum) }}</div>
          </div>
        </div>
        <div class="mt-6 flex h-40 items-end gap-1.5 overflow-x-auto pb-1">
          <div v-for="d in daily" :key="d.day" class="group flex min-w-[18px] flex-1 flex-col items-center justify-end gap-1" :title="`${d.day}  ${formatBytes(d.v)}`">
            <div class="w-full rounded-t-md border-2 bg-primary transition group-hover:bg-secondary" style="border-color: var(--ink)" :style="{ height: Math.max(4, (d.v / max) * 140) + 'px' }" />
            <span class="text-[10px] text-muted-foreground">{{ d.day.slice(8) }}</span>
          </div>
        </div>
      </section>

      <section class="sb-card overflow-x-auto">
        <table class="sb-table">
          <thead>
            <tr>
              <th>{{ t('记录时间') }}</th>
              <th class="text-right">{{ t('实际上行') }}</th>
              <th class="text-right">{{ t('实际下行') }}</th>
              <th class="text-right">{{ t('扣费倍率') }}</th>
              <th class="text-right">{{ t('合计') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in logs" :key="i" class="hover:bg-muted/50">
              <td class="whitespace-nowrap font-mono text-xs sm:text-sm">{{ formatRecordTime(l) }}</td>
              <td class="text-right font-mono">{{ formatBytes(actualU(l)) }}</td>
              <td class="text-right font-mono">{{ formatBytes(actualD(l)) }}</td>
              <td class="text-right"><span class="sb-badge bg-muted">{{ l.server_rate }}x</span></td>
              <td class="text-right font-mono font-semibold">{{ formatBytes(charged(l)) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>
