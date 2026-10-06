<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{ value: string; size?: number }>(), { size: 220 })
const src = ref('')

watchEffect(async () => {
  if (!props.value) return (src.value = '')
  src.value = await QRCode.toDataURL(props.value, { width: props.size * 2, margin: 1, errorCorrectionLevel: 'M' })
})
</script>

<template>
  <div class="inline-block rounded-2xl border-2 bg-white p-3" style="border-color: var(--ink)">
    <img v-if="src" :src="src" :width="size" :height="size" alt="QR code" />
    <div v-else :style="{ width: size + 'px', height: size + 'px' }" />
  </div>
</template>
