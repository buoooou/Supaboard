<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import { userApi, type Ticket } from '@/api'
import { state } from '@/stores/app'
import { formatDate } from '@/utils/format'
import { levelClass, levelLabel, ticketState } from '@/utils/ticket'
import { confirm, showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const route = useRoute()
const id = Number(route.params.ticket_id)
const loading = ref(true)
const ticket = ref<Ticket | null>(null)
const message = ref('')
const sending = ref(false)
const box = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load(scroll = true) {
  const prev = ticket.value?.message?.length ?? 0
  ticket.value = await userApi.ticket(id)
  if (scroll && (ticket.value.message?.length ?? 0) !== prev) {
    await nextTick()
    box.value?.scrollTo({ top: box.value.scrollHeight, behavior: 'smooth' })
  }
}

onMounted(async () => {
  try {
    await load()
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
  // 开启状态下定时拉取新回复
  timer = setInterval(() => {
    if (ticket.value?.status === 0 && document.visibilityState === 'visible') load().catch(() => {})
  }, 10000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

async function send() {
  if (!message.value.trim()) return
  sending.value = true
  try {
    await userApi.replyTicket(id, message.value.trim())
    message.value = ''
    await load()
  } catch (e) {
    showError(e)
  } finally {
    sending.value = false
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
}

async function close() {
  const ok = await confirm({ title: t('关闭工单'), content: t('关闭后将无法继续回复，确定关闭吗？'), danger: true, confirmText: t('关闭') })
  if (!ok) return
  try {
    await userApi.closeTicket(id)
    toast.success(t('工单已关闭'))
    load(false)
  } catch (e) {
    showError(e)
  }
}
</script>

<template>
  <Spinner v-if="loading" />
  <Empty v-else-if="!ticket" icon="message" :text="t('工单不存在')">
    <RouterLink to="/ticket" class="sb-btn-outline">{{ t('返回工单列表') }}</RouterLink>
  </Empty>
  <div v-else>
    <RouterLink to="/ticket" class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
      <Icon name="arrow-left" :size="16" />{{ t('返回工单列表') }}
    </RouterLink>

    <section class="sb-card flex h-[calc(100vh-13rem)] min-h-[480px] flex-col overflow-hidden">
      <header class="flex flex-wrap items-center gap-3 border-b-2 px-5 py-4" style="border-color: var(--ink)">
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg">{{ ticket.subject }}</h1>
          <div class="text-xs text-muted-foreground">#{{ ticket.id }} · {{ formatDate(ticket.created_at, true) }}</div>
        </div>
        <span class="sb-badge" :class="levelClass(ticket.level)">{{ levelLabel(ticket.level) }}</span>
        <span class="sb-badge" :class="ticketState(ticket.status, ticket.reply_status).cls">{{ ticketState(ticket.status, ticket.reply_status).label }}</span>
        <button v-if="ticket.status === 0" class="sb-btn-outline sb-btn-sm" @click="close">{{ t('关闭工单') }}</button>
      </header>

      <div ref="box" class="sb-dots flex-1 space-y-4 overflow-y-auto p-5">
        <div v-for="m in ticket.message || []" :key="m.id" class="flex gap-3" :class="m.is_me ? 'flex-row-reverse' : ''">
          <img v-if="m.is_me && state.user?.avatar_url" :src="state.user.avatar_url" alt="" class="h-9 w-9 rounded-full border-2" style="border-color: var(--ink)" />
          <span v-else class="sb-icon-tile h-9 w-9 rounded-full" :class="m.is_me ? 'bg-primary' : 'bg-tertiary'">
            <Icon :name="m.is_me ? 'user' : 'sparkles'" :size="16" />
          </span>
          <div class="max-w-[80%]" :class="m.is_me ? 'items-end text-right' : ''">
            <div
              class="inline-block whitespace-pre-wrap break-words rounded-2xl border-2 px-4 py-2.5 text-left text-sm"
              :class="m.is_me ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm bg-card'"
              style="border-color: var(--ink)"
            >{{ m.message }}</div>
            <div class="mt-1 text-[11px] text-muted-foreground">
              {{ m.is_me ? t('我') : t('客服') }} · {{ formatDate(m.created_at, true) }}
            </div>
          </div>
        </div>
      </div>

      <footer class="border-t-2 p-4" style="border-color: var(--ink)">
        <div v-if="ticket.status === 1" class="py-2 text-center text-sm text-muted-foreground">{{ t('工单已关闭，如有新问题请新建工单') }}</div>
        <div v-else class="flex items-end gap-3">
          <textarea
            v-model="message"
            rows="2"
            class="sb-input flex-1 resize-none"
            :placeholder="t('输入回复内容，Ctrl/⌘ + Enter 发送')"
            @keydown="onKey"
          />
          <button class="sb-btn-primary h-11 shrink-0" :disabled="sending || !message.trim()" @click="send">
            <Icon :name="sending ? 'loader' : 'send'" :size="16" /><span class="hidden sm:inline">{{ t('发送') }}</span>
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>
