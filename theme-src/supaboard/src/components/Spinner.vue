<script setup lang="ts">
import Icon from './Icon.vue'
defineProps<{ text?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
    <Icon name="loader" :size="28" class="text-primary" />
    <span v-if="text" class="text-sm">{{ text }}</span>
  </div>
</template>
