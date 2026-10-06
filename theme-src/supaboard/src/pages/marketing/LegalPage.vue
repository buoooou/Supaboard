<script setup lang="ts">
import { computed } from 'vue'
import { legalPages } from '@/utils/content'
import { renderMarkdown } from '@/utils/markdown'
import { t } from '@/i18n'

const props = defineProps<{
  page: string
}>()

const pageData = computed(() => {
  return legalPages[props.page]
})

const renderedBody = computed(() => {
  return renderMarkdown(pageData.value?.body || '')
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <div v-if="pageData" class="sticker-card p-6 sm:p-12">
      <div class="mb-8 border-b pb-6" style="border-color: rgba(30, 41, 59, 0.1)">
        <h1 class="font-heading text-3xl font-black sm:text-4xl md:text-5xl">
          {{ pageData.title }}
        </h1>
        <p v-if="pageData.description" class="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {{ pageData.description }}
        </p>
      </div>

      <div class="sb-prose max-w-none" v-html="renderedBody" />
    </div>

    <div v-else class="sticker-card text-center py-20">
      <p class="text-muted-foreground">{{ t('页面不存在') }}</p>
      <RouterLink to="/" class="candy-button mt-4 text-sm">
        {{ t('返回首页') }}
      </RouterLink>
    </div>
  </div>
</template>
