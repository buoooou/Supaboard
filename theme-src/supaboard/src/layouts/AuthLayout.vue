<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import HeaderTools from '@/components/HeaderTools.vue'
import Icon from '@/components/Icon.vue'
import { settings } from '@/stores/app'
import { t } from '@/i18n'

const features = [
  { icon: 'zap', color: 'bg-primary', title: '极速专线接入', desc: 'IPLC/IEPL 国际专线，晚高峰依然稳定' },
  { icon: 'star', color: 'bg-tertiary', title: '流媒体全解锁', desc: 'Netflix、Disney+、ChatGPT 一键畅享' },
  { icon: 'shield', color: 'bg-secondary', title: '多端完美适配', desc: 'Windows、macOS、iOS、Android 全平台' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-30 border-b-2 bg-background" style="border-color: var(--ink)">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <RouterLink to="/" class="flex items-center">
          <Logo />
        </RouterLink>
        <div class="flex items-center gap-2">
          <RouterLink to="/" class="sb-btn-ghost hidden sm:inline-flex">
            {{ t('返回官网') }}
          </RouterLink>
          <HeaderTools />
        </div>
      </div>
    </header>

    <main class="relative flex-1 overflow-hidden">
      <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <!-- 品牌区：与落地页 Hero 同风格 -->
        <section class="relative hidden lg:block">
          <span class="sb-badge bg-tertiary/90 text-white">
            <Icon name="star" :size="12" /> {{ t('稳定 · 高速 · 全球解锁') }}
          </span>
          <h1 class="mt-6 text-5xl leading-tight">
            {{ t('欢迎来到') }}<br />
            <span class="text-primary">{{ settings.title }}</span>
          </h1>
          <p class="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            {{ settings.description || t('提供 IPLC/IEPL 专线接入，晚高峰不卡顿。全量解锁全球流媒体与 AI 服务。') }}
          </p>
          <div class="mt-10 space-y-4">
            <div v-for="f in features" :key="f.title" class="flex items-start gap-4">
              <span class="sb-icon-tile" :class="f.color"><Icon :name="f.icon" :size="20" /></span>
              <div>
                <div class="font-semibold">{{ t(f.title) }}</div>
                <div class="text-sm text-muted-foreground">{{ t(f.desc) }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="relative mx-auto w-full max-w-md">
          <div
            class="absolute -right-10 -top-10 -z-0 h-72 w-72 rounded-[45%_55%_60%_40%] bg-secondary/40 blur-0"
            aria-hidden="true"
          />
          <div
            class="absolute -bottom-12 -left-12 -z-0 h-56 w-56 rounded-[60%_40%_45%_55%] bg-primary/20"
            aria-hidden="true"
          />
          <div class="sb-card relative z-10 p-6 shadow-pop-lg sm:p-8">
            <RouterView />
          </div>
        </section>
      </div>
    </main>

    <footer class="py-6 text-center text-xs text-muted-foreground">
      © {{ new Date().getFullYear() }} {{ settings.title }}
    </footer>
  </div>
</template>
