<script setup lang="ts">
import FeedbackHost from '@/components/FeedbackHost.vue'
import { currentLang } from '@/i18n'
</script>

<template>
  <!-- 切换语言时整体重新渲染，保证所有 t() 文案刷新 -->
  <RouterView :key="currentLang" />
  <FeedbackHost />
</template>
