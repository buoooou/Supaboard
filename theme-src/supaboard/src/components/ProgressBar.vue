<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ value: number }>()
const pct = computed(() => Math.max(0, Math.min(100, props.value || 0)))
const color = computed(() => (pct.value >= 90 ? 'bg-destructive' : pct.value >= 70 ? 'bg-warning' : 'bg-primary'))
</script>

<template>
  <div class="h-4 w-full overflow-hidden rounded-full border-2 bg-muted" style="border-color: var(--ink)">
    <div class="h-full rounded-full transition-all duration-500" :class="color" :style="{ width: pct + '%' }" />
  </div>
</template>
