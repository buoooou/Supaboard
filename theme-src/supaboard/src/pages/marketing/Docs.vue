<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { docsList, getDocBySlug } from '@/utils/content'
import { renderMarkdown } from '@/utils/markdown'
import { usePageSeo } from '@/utils/seo'
import { t } from '@/i18n'

const route = useRoute()

const sidebarGroups = [
  {
    title: '开始使用',
    items: [
      { slug: '', label: '帮助中心 & 快速上手', icon: 'book' },
    ],
  },
  {
    title: '各平台使用教程',
    items: [
      { slug: 'windows-tutorial', label: 'Windows 使用教程', icon: 'windows' },
      { slug: 'macos-tutorial', label: 'macOS 使用教程', icon: 'apple' },
      { slug: 'ios-tutorial', label: 'iOS 教程 (Shadowrocket)', icon: 'apple' },
      { slug: 'android-tutorial', label: 'Android 教程 (CMFA)', icon: 'android' },
    ],
  },
]

const currentSlug = computed(() => {
  const p = route.params.slug
  return typeof p === 'string' ? p : Array.isArray(p) ? p.join('/') : ''
})

const currentDoc = computed(() => {
  return getDocBySlug(currentSlug.value)
})

const renderedBody = computed(() => {
  return renderMarkdown(currentDoc.value?.body || '')
})

usePageSeo(() => currentDoc.value && { title: currentDoc.value.title, description: currentDoc.value.description })

function isCurrent(slug: string) {
  return currentSlug.value === slug
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- 左侧教程目录侧边栏 -->
      <aside class="w-full shrink-0 lg:w-72">
        <div class="sticker-card p-5 sticky top-24">
          <div class="mb-4 flex items-center gap-2 border-b pb-3" style="border-color: rgba(30, 41, 59, 0.1)">
            <Icon name="book" :size="20" class="text-primary" />
            <h2 class="font-heading text-base font-black">{{ t('使用文档与教程') }}</h2>
          </div>

          <div class="space-y-6">
            <div v-for="(group, gi) in sidebarGroups" :key="gi">
              <div class="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {{ t(group.title) }}
              </div>
              <ul class="space-y-1">
                <li v-for="item in group.items" :key="item.slug">
                  <RouterLink
                    :to="item.slug ? `/docs/${item.slug}` : '/docs'"
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors"
                    :class="
                      isCurrent(item.slug)
                        ? 'bg-primary text-white shadow-[2px_2px_0px_0px_var(--ink)]'
                        : 'text-foreground hover:bg-muted'
                    "
                  >
                    <Icon :name="item.icon" :size="15" />
                    <span>{{ t(item.label) }}</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>

          <div class="mt-8 border-t pt-4" style="border-color: rgba(30, 41, 59, 0.1)">
            <RouterLink
              to="/download"
              class="flex items-center justify-between rounded-xl bg-primary/10 p-3 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <span>{{ t('前往客户端下载中心') }}</span>
              <Icon name="arrow-right" :size="14" />
            </RouterLink>
          </div>
        </div>
      </aside>

      <!-- 右侧正文区 -->
      <main class="min-w-0 flex-1">
        <div v-if="currentDoc" class="sticker-card p-6 sm:p-10">
          <!-- 标题与简介 -->
          <div class="mb-8 border-b pb-6" style="border-color: rgba(30, 41, 59, 0.1)">
            <h1 class="font-heading text-3xl font-black sm:text-4xl md:text-5xl">
              {{ currentDoc.title }}
            </h1>
            <p v-if="currentDoc.description" class="mt-3 text-base leading-relaxed text-muted-foreground">
              {{ currentDoc.description }}
            </p>
            <div v-if="currentDoc.date" class="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="clock" :size="13" />
              <span>{{ t('更新于') }} {{ currentDoc.date }}</span>
            </div>
          </div>

          <!-- 正文 Markdown 富文本 -->
          <div class="sb-prose max-w-none" v-html="renderedBody" />

          <!-- 底部帮助引导 -->
          <div class="mt-12 rounded-2xl border-2 bg-muted/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style="border-color: var(--ink)">
            <div>
              <div class="font-heading font-black text-base">{{ t('遇到连接或使用问题？') }}</div>
              <div class="text-xs text-muted-foreground mt-1">{{ t('加入官方交流群或在线提交工单，技术专员协助排查') }}</div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <RouterLink to="/download" class="sb-btn sb-btn-outline sb-btn-sm">
                {{ t('下载客户端') }}
              </RouterLink>
              <RouterLink to="/login" class="sb-btn sb-btn-primary sb-btn-sm">
                {{ t('提交工单') }}
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="sticker-card text-center py-20">
          <p class="text-muted-foreground">{{ t('文档不存在或已移动') }}</p>
          <RouterLink to="/docs" class="candy-button mt-4 text-sm">
            {{ t('返回帮助中心') }}
          </RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>
