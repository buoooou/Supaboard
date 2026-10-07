<script setup lang="ts">
import { computed } from 'vue'
import Modal from './Modal.vue'
import { renderMarkdown } from '@/utils/markdown'
import type { Notice } from '@/api'

const props = defineProps<{ notice: Notice | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const rendered = computed(() => renderMarkdown(props.notice?.content))
</script>

<template>
  <Modal :open="!!notice" :title="notice?.title" width="max-w-2xl" @close="emit('close')">
    <img v-if="notice?.img_url" :src="notice.img_url" alt="" class="mb-4 w-full rounded-xl border-2" />
    <div class="sb-prose" v-html="rendered" />
  </Modal>
</template>
