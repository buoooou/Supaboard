<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import { blogPosts, type BlogPost } from '@/utils/content'
import { t } from '@/i18n'

const search = ref('')
const currentPage = ref(1)
const pageSize = 9

const filteredPosts = computed(() => {
  const kw = search.value.trim().toLowerCase()
  if (!kw) return blogPosts
  return blogPosts.filter(
    (p) => p.title.toLowerCase().includes(kw) || (p.description && p.description.toLowerCase().includes(kw)),
  )
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize) || 1)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPosts.value.slice(start, start + pageSize)
})

function onSearch() {
  currentPage.value = 1
}

function setPage(p: number) {
  currentPage.value = Math.max(1, Math.min(p, totalPages.value))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-14 text-center">
      <div
        class="mb-4 inline-flex items-center gap-2 rounded-full border-2 bg-secondary/15 px-4 py-1.5 font-heading text-xs font-bold text-secondary"
        style="border-color: var(--ink)"
      >
        <Icon name="book" :size="14" />
        <span>{{ t('技术博客与加速资讯') }}</span>
      </div>
      <h1 class="font-heading text-4xl font-black sm:text-5xl md:text-6xl">
        {{ t('Supaboard 博客') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {{ t('探索翻墙教程、客户端配置干货、全球节点选购评测及网络加速前沿技术。') }}
      </p>

      <!-- 搜索框 -->
      <div class="mx-auto mt-8 max-w-md">
        <div class="relative">
          <Icon name="search" :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="search"
            type="search"
            class="sb-input pl-11 pr-4 py-3 rounded-full text-base"
            :placeholder="t('搜索文章关键词...')"
            @input="onSearch"
          />
        </div>
      </div>
    </div>

    <!-- 文章网格 -->
    <div v-if="paginatedPosts.length" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="post in paginatedPosts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="sticker-card group flex flex-col justify-between overflow-hidden p-0 transition-transform hover:-translate-y-1"
      >
        <!-- 封面图 -->
        <div class="relative aspect-video w-full overflow-hidden bg-muted border-b-2" style="border-color: var(--ink)">
          <img
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Icon name="book" :size="36" />
          </div>
        </div>

        <!-- 文本内容 -->
        <div class="flex flex-1 flex-col justify-between p-6">
          <div>
            <div class="mb-2.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span v-if="post.date">{{ post.date }}</span>
              <span v-if="post.authors?.length">· {{ post.authors.join(', ') }}</span>
            </div>
            <h2 class="font-heading text-lg font-black leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {{ post.title }}
            </h2>
            <p v-if="post.description" class="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {{ post.description }}
            </p>
          </div>

          <div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-primary">
            <span>{{ t('阅读全文') }}</span>
            <Icon name="arrow-right" :size="13" class="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- 空状态 -->
    <div v-else class="sticker-card text-center py-20">
      <p class="text-base text-muted-foreground">{{ t('未找到相关文章，换个关键词试试？') }}</p>
    </div>

    <!-- 分页导航 -->
    <div v-if="totalPages > 1" class="mt-14 flex items-center justify-center gap-2">
      <button
        type="button"
        class="sb-btn sb-btn-outline sb-btn-sm"
        :disabled="currentPage <= 1"
        @click="setPage(currentPage - 1)"
      >
        <Icon name="chevron-left" :size="14" />
        <span>{{ t('上一页') }}</span>
      </button>

      <span class="px-4 text-sm font-bold font-mono">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        type="button"
        class="sb-btn sb-btn-outline sb-btn-sm"
        :disabled="currentPage >= totalPages"
        @click="setPage(currentPage + 1)"
      >
        <span>{{ t('下一页') }}</span>
        <Icon name="chevron-right" :size="14" />
      </button>
    </div>
  </div>
</template>
