<script setup lang="ts">
defineProps<{ title: string; desc?: string }>()
</script>

<template>
  <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="sb-title-underline text-2xl sm:text-3xl">{{ title }}</h1>
      <p v-if="desc" class="mt-5 text-sm text-muted-foreground">{{ desc }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-3">
      <slot />
    </div>
  </div>
</template>
