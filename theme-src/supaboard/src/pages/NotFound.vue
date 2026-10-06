<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import { t } from '@/i18n'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
    <Logo />
    <div class="font-heading text-8xl text-primary">404</div>
    <p class="text-muted-foreground">{{ t('你访问的页面不存在') }}</p>
    <RouterLink to="/dashboard" class="sb-btn-primary">{{ t('返回首页') }}</RouterLink>
  </div>
</template>
