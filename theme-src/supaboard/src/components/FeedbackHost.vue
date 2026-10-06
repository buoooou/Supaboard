<script setup lang="ts">
import Icon from './Icon.vue'
import Modal from './Modal.vue'
import { confirmState, settleConfirm, toastState } from '@/utils/feedback'
import { t } from '@/i18n'

const iconOf = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert' } as const
const colorOf = {
  success: 'bg-quaternary',
  error: 'bg-destructive',
  info: 'bg-tertiary',
  warning: 'bg-warning',
} as const
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <TransitionGroup name="sb-fade">
        <div
          v-for="item in toastState.items"
          :key="item.id"
          class="sb-card pointer-events-auto flex max-w-md items-center gap-3 px-4 py-3 text-sm font-medium"
        >
          <span class="flex h-7 w-7 items-center justify-center rounded-full text-white" :class="colorOf[item.type]">
            <Icon :name="iconOf[item.type]" :size="16" />
          </span>
          <span class="break-words">{{ item.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>

  <Modal :open="confirmState.open" :title="confirmState.options.title" width="max-w-md" @close="settleConfirm(false)">
    <p v-if="confirmState.options.content" class="whitespace-pre-line text-sm text-muted-foreground">
      {{ confirmState.options.content }}
    </p>
    <template #footer>
      <button class="sb-btn-outline" @click="settleConfirm(false)">
        {{ confirmState.options.cancelText || t('取消') }}
      </button>
      <button
        :class="confirmState.options.danger ? 'sb-btn-danger' : 'sb-btn-primary'"
        @click="settleConfirm(true)"
      >
        {{ confirmState.options.confirmText || t('确定') }}
      </button>
    </template>
  </Modal>
</template>
