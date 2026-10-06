<script setup lang="ts">
import { appTitle, settings } from '@/stores/app'
withDefaults(defineProps<{ size?: 'sm' | 'md' }>(), { size: 'md' })
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <img v-if="settings.logo" :src="settings.logo" :alt="appTitle" class="h-7 w-7 rounded-lg object-contain" />
    <svg v-else :width="size === 'sm' ? 18 : 22" :height="size === 'sm' ? 18 : 22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 2 2 9.5l7.5 3L22 2Z" fill="hsl(var(--primary))" />
      <path d="M22 2 9.5 12.5v7L13 15l5 4L22 2Z" fill="hsl(var(--primary) / .75)" />
    </svg>
    <span class="font-heading tracking-tight" :class="size === 'sm' ? 'text-base' : 'text-lg'">{{ appTitle }}</span>
  </span>
</template>
