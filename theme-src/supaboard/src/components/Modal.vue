<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import Icon from './Icon.vue'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; width?: string; closable?: boolean }>(),
  { width: 'max-w-lg', closable: true },
)
const emit = defineEmits<{ (e: 'close'): void }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open && props.closable) emit('close')
}
watch(
  () => props.open,
  (v) => {
    if (import.meta.env.SSR) return
    document.body.style.overflow = v ? 'hidden' : ''
    if (v) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sb-fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" @click="closable && emit('close')" />
        <div
          class="sb-card relative z-10 flex max-h-[92vh] w-full flex-col rounded-b-none sm:rounded-2xl"
          :class="width"
          role="dialog"
          aria-modal="true"
        >
          <div v-if="title || closable" class="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6">
            <h3 class="text-lg">{{ title }}</h3>
            <button v-if="closable" class="sb-btn-ghost -mr-2 p-1.5" aria-label="close" @click="emit('close')">
              <Icon name="x" />
            </button>
          </div>
          <div class="overflow-y-auto px-5 py-4 sm:px-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex flex-wrap justify-end gap-3 border-t-2 border-dashed px-5 py-4 sm:px-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
