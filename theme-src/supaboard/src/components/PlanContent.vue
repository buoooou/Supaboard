<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import { renderMarkdown } from '@/utils/markdown'

/** 套餐描述：兼容 JSON 特性列表 [{feature, support}] 与 Markdown/HTML 两种写法 */
const props = defineProps<{ content: string | null | undefined }>()

const features = computed<{ feature: string; support: boolean }[] | null>(() => {
  const c = (props.content || '').trim()
  if (!c.startsWith('[')) return null
  try {
    const arr = JSON.parse(c)
    return Array.isArray(arr) && arr.every((x) => x && typeof x.feature === 'string') ? arr : null
  } catch {
    return null
  }
})
</script>

<template>
  <ul v-if="features" class="space-y-2 text-sm">
    <li v-for="(f, i) in features" :key="i" class="flex items-start gap-2" :class="f.support ? '' : 'text-muted-foreground line-through'">
      <Icon :name="f.support ? 'check' : 'x'" :size="16" :class="f.support ? 'mt-0.5 text-quaternary' : 'mt-0.5'" />
      {{ f.feature }}
    </li>
  </ul>
  <div v-else class="sb-prose" v-html="renderMarkdown(content)" />
</template>
