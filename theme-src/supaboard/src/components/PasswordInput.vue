<script setup lang="ts">
import { ref } from 'vue'
import Icon from './Icon.vue'
defineProps<{ modelValue: string; placeholder?: string; autocomplete?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const show = ref(false)
</script>

<template>
  <div class="relative">
    <input
      :value="modelValue"
      :type="show ? 'text' : 'password'"
      class="sb-input pr-11"
      :placeholder="placeholder"
      :autocomplete="autocomplete || 'current-password'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      tabindex="-1"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      @click="show = !show"
    >
      <Icon :name="show ? 'eye-off' : 'eye'" :size="18" />
    </button>
  </div>
</template>
