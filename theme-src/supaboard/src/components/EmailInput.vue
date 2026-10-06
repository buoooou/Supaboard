<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { t } from '@/i18n'

/** 开启邮箱后缀白名单时，拆成“用户名 + 后缀下拉” */
const props = defineProps<{ modelValue: string; suffixes?: string[] | 0 | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const list = computed(() => (Array.isArray(props.suffixes) && props.suffixes.length ? props.suffixes : null))
const name = ref('')
const suffix = ref('')

watch(
  list,
  (l) => {
    if (l && !suffix.value) suffix.value = l[0]
  },
  { immediate: true },
)
watch([name, suffix], () => {
  if (list.value) emit('update:modelValue', name.value ? `${name.value}@${suffix.value}` : '')
})
</script>

<template>
  <div v-if="list" class="flex gap-2">
    <input v-model.trim="name" class="sb-input flex-1" :placeholder="t('邮箱')" autocomplete="username" />
    <select v-model="suffix" class="sb-input w-auto max-w-[50%]">
      <option v-for="s in list" :key="s" :value="s">@{{ s }}</option>
    </select>
  </div>
  <input
    v-else
    :value="modelValue"
    type="email"
    class="sb-input"
    :placeholder="t('邮箱')"
    autocomplete="username"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value.trim())"
  />
</template>
