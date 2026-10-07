<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import Icon from './Icon.vue'

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

const renderedHtml = ref('')

watchEffect(async () => {
  if (features.value) return
  const raw = props.content || ''
  if (!raw) {
    renderedHtml.value = ''
    return
  }
  // 纯文本或简单 HTML 无需加载 105KB 的 markdown-it
  if (!raw.includes('#') && !raw.includes('*') && !raw.includes('`') && !raw.includes('---')) {
    renderedHtml.value = raw
    return
  }
  const { renderMarkdown } = await import('@/utils/markdown')
  renderedHtml.value = renderMarkdown(raw)
})
</script>

<template>
  <ul v-if="features" class="space-y-2 text-sm">
    <li v-for="(f, i) in features" :key="i" class="flex items-start gap-2" :class="f.support ? '' : 'text-muted-foreground line-through'">
      <Icon :name="f.support ? 'check' : 'x'" :size="16" :class="f.support ? 'mt-0.5 text-quaternary' : 'mt-0.5'" />
      {{ f.feature }}
    </li>
  </ul>
  <div v-else class="sb-prose" v-html="renderedHtml" />
</template>
