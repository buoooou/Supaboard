<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import Modal from '@/components/Modal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type Ticket } from '@/api'
import { formatDate } from '@/utils/format'
import { LEVELS, levelClass, levelLabel, ticketState } from '@/utils/ticket'
import { confirm, showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const router = useRouter()
const loading = ref(true)
const tickets = ref<Ticket[]>([])
const creating = ref(false)
const saving = ref(false)
const form = ref({ subject: '', level: 1, message: '' })

async function load() {
  try {
    tickets.value = await userApi.tickets()
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

function openCreate() {
  form.value = { subject: '', level: 1, message: '' }
  creating.value = true
}

async function save() {
  const f = form.value
  if (!f.subject.trim() || !f.message.trim()) return toast.warning(t('请填写主题和内容'))
  saving.value = true
  try {
    await userApi.saveTicket(f.subject.trim(), f.level, f.message.trim())
    toast.success(t('工单已提交，我们会尽快回复'))
    creating.value = false
    load()
  } catch (e) {
    showError(e)
  } finally {
    saving.value = false
  }
}

async function close(tk: Ticket) {
  const ok = await confirm({ title: t('关闭工单'), content: t('关闭后将无法继续回复，确定关闭吗？'), danger: true, confirmText: t('关闭') })
  if (!ok) return
  try {
    await userApi.closeTicket(tk.id)
    toast.success(t('工单已关闭'))
    load()
  } catch (e) {
    showError(e)
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('我的工单')" :desc="t('遇到问题？提交工单，我们会尽快为你处理')">
      <button class="sb-btn-primary" @click="openCreate"><Icon name="plus" :size="16" />{{ t('新建工单') }}</button>
    </PageHeader>

    <Spinner v-if="loading" />
    <div v-else-if="!tickets.length" class="sb-card"><Empty icon="message" :text="t('暂无工单')" /></div>
    <div v-else class="space-y-3">
      <div
        v-for="tk in tickets"
        :key="tk.id"
        class="sb-card flex cursor-pointer flex-wrap items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-pop-hover sm:p-5"
        @click="router.push(`/ticket/${tk.id}`)"
      >
        <span class="sb-icon-tile bg-tertiary"><Icon name="message" :size="18" /></span>
        <div class="min-w-0 flex-1">
          <div class="truncate font-semibold">{{ tk.subject }}</div>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>#{{ tk.id }}</span>
            <span>{{ t('更新于') }} {{ formatDate(tk.updated_at, true) }}</span>
          </div>
        </div>
        <span class="sb-badge" :class="levelClass(tk.level)">{{ t('优先级') }}：{{ levelLabel(tk.level) }}</span>
        <span class="sb-badge" :class="ticketState(tk.status, tk.reply_status).cls">{{ ticketState(tk.status, tk.reply_status).label }}</span>
        <button v-if="tk.status === 0" class="sb-btn-ghost text-destructive" @click.stop="close(tk)">{{ t('关闭') }}</button>
        <Icon name="chevron-right" class="text-muted-foreground" />
      </div>
    </div>

    <Modal v-if="creating" :open="creating" :title="t('新建工单')" @close="creating = false">
      <div class="space-y-4">
        <div>
          <label class="sb-label">{{ t('主题') }}</label>
          <input v-model="form.subject" class="sb-input" :placeholder="t('简要描述你的问题')" maxlength="100" />
        </div>
        <div>
          <label class="sb-label">{{ t('优先级') }}</label>
          <div class="flex gap-2">
            <button
              v-for="l in LEVELS"
              :key="l.value"
              class="flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition"
              :class="form.level === l.value ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'"
              style="border-color: var(--ink)"
              @click="form.level = l.value"
            >
              {{ t(l.label) }}
            </button>
          </div>
        </div>
        <div>
          <label class="sb-label">{{ t('内容') }}</label>
          <textarea v-model="form.message" rows="6" class="sb-input resize-y" :placeholder="t('请详细描述遇到的问题，如客户端、节点、报错截图链接等')" />
        </div>
      </div>
      <template #footer>
        <button class="sb-btn-outline" @click="creating = false">{{ t('取消') }}</button>
        <button class="sb-btn-primary" :disabled="saving" @click="save">
          <Icon v-if="saving" name="loader" :size="14" />{{ t('提交') }}
        </button>
      </template>
    </Modal>
  </div>
</template>
