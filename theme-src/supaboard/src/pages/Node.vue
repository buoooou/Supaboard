<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type ServerNode } from '@/api'
import { loadSubscribe, state } from '@/stores/app'
import { showError } from '@/utils/feedback'
import { t } from '@/i18n'

const loading = ref(true)
const nodes = ref<ServerNode[]>([])
const keyword = ref('')

onMounted(async () => {
  try {
    const [list] = await Promise.all([userApi.servers(), state.subscribe ? null : loadSubscribe().catch(() => null)])
    nodes.value = list
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
})

onActivated(async () => {
  try {
    nodes.value = await userApi.servers()
  } catch {}
})

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return k ? nodes.value.filter((n) => n.name.toLowerCase().includes(k) || (n.tags || []).some((x) => x.toLowerCase().includes(k))) : nodes.value
})
const online = computed(() => nodes.value.filter((n) => !!n.is_online).length)
const noPlan = computed(() => !state.subscribe?.plan_id)
</script>

<template>
  <div>
    <PageHeader :title="t('节点状态')" :desc="t('节点在线状态每分钟更新一次')">
      <div v-if="nodes.length" class="relative">
        <Icon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input v-model="keyword" class="sb-input w-56 pl-9" :placeholder="t('搜索节点')" />
      </div>
    </PageHeader>

    <Spinner v-if="loading" />
    <div v-else-if="!nodes.length" class="sb-card">
      <Empty icon="server" :text="noPlan ? t('你还没有可用的订阅，购买后即可查看节点') : t('暂无可用节点，订阅可能已过期或流量已用尽')">
        <RouterLink to="/plan" class="sb-btn-primary sb-btn-sm">{{ noPlan ? t('购买订阅') : t('续费订阅') }}</RouterLink>
      </Empty>
    </div>
    <template v-else>
      <div class="mb-5 flex flex-wrap gap-3 text-sm">
        <span class="sb-badge bg-card">{{ t('共 {n} 个节点', { n: nodes.length }) }}</span>
        <span class="sb-badge bg-quaternary">{{ t('{n} 个在线', { n: online }) }}</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in filtered" :key="n.id + n.type" class="sb-card flex flex-col gap-3 p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate font-semibold" :title="n.name">{{ n.name }}</div>
              <div class="mt-1 text-xs uppercase text-muted-foreground">{{ n.type }}</div>
            </div>
            <span class="flex shrink-0 items-center gap-1.5 text-xs font-semibold" :class="n.is_online ? 'text-quaternary' : 'text-muted-foreground'">
              <span class="inline-flex h-2.5 w-2.5 rounded-full" :class="n.is_online ? 'bg-quaternary' : 'bg-muted-foreground'" />
              {{ n.is_online ? t('在线') : t('离线') }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="sb-badge bg-primary/15">{{ n.rate }}x</span>
            <span v-for="tag in n.tags || []" :key="tag" class="sb-badge bg-muted">{{ tag }}</span>
          </div>
        </div>
      </div>
      <p class="mt-6 text-xs text-muted-foreground">{{ t('倍率表示使用该节点时流量的扣除倍数，例如 2x 节点使用 1GB 将扣除 2GB。') }}</p>
    </template>
  </div>
</template>
