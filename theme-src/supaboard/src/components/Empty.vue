<script setup lang="ts">
import Icon from './Icon.vue'
withDefaults(defineProps<{ icon?: string; text: string }>(), { icon: 'layers' })
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
    <span class="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed">
      <Icon :name="icon" :size="24" />
    </span>
    <p class="text-sm">{{ text }}</p>
    <slot />
  </div>
</template>
