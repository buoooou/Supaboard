<script setup lang="ts">
import { ref } from 'vue'
import Icon from './Icon.vue'
import { LANGS, currentLang, setLang } from '@/i18n'
import { toggleDark } from '@/stores/app'
import { onClickOutside } from '@/utils/dom'

const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))
</script>

<template>
  <div class="flex items-center gap-1">
    <div ref="root" class="relative">
      <button class="sb-btn-ghost" :title="'Language'" @click="open = !open">
        <Icon name="globe" />
        <span class="hidden text-xs sm:inline">{{ LANGS.find((l) => l.code === currentLang)?.label }}</span>
      </button>
      <Transition name="sb-fade">
        <div v-if="open" class="sb-card absolute right-0 top-11 z-40 w-36 overflow-hidden p-1">
          <button
            v-for="l in LANGS"
            :key="l.code"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            @click="setLang(l.code); open = false"
          >
            {{ l.label }}
            <Icon v-if="l.code === currentLang" name="check" :size="14" class="text-primary" />
          </button>
        </div>
      </Transition>
    </div>
    <button class="sb-btn-ghost" title="Theme" @click="toggleDark">
      <Icon name="sun" class="hidden dark:block" />
      <Icon name="moon" class="dark:hidden" />
    </button>
  </div>
</template>
