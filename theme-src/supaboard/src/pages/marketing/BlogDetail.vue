<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { getBlogPostBySlug, getRelatedPosts, loadBlogPostBody } from '@/utils/blog'
import { registerMarkdownImageResolver, renderMarkdown } from '@/utils/markdown'
import { resolveBlogImageUrl, resolveAvatarUrl } from '@/utils/assets'
import { t } from '@/i18n'

registerMarkdownImageResolver(resolveBlogImageUrl)

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))
const post = computed(() => getBlogPostBySlug(slug.value))
const relatedPosts = computed(() => (post.value ? getRelatedPosts(post.value, 3) : []))

const renderedContent = ref('')
const loadingBody = ref(true)

watchEffect(async () => {
  if (!slug.value) return
  loadingBody.value = true
  try {
    const rawBody = await loadBlogPostBody(slug.value)
    renderedContent.value = renderMarkdown(rawBody)
  } finally {
    loadingBody.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <!-- 返回按钮 -->
    <div class="mb-8">
      <RouterLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <Icon name="arrow-left" :size="15" />
        <span>{{ t('返回博客列表') }}</span>
      </RouterLink>
    </div>

    <!-- 文章正文主体 -->
    <article v-if="post" class="sticker-card p-6 sm:p-12">
      <!-- 封面大图 -->
      <div
        v-if="post.image"
        class="mb-8 aspect-video w-full overflow-hidden rounded-xl border-2 bg-muted shadow-[3px_3px_0px_0px_var(--ink)]"
        style="border-color: var(--ink)"
      >
        <img :src="post.image" :alt="post.title" class="h-full w-full object-cover" />
      </div>

      <!-- 标题与文章元信息 -->
      <header class="mb-8 border-b pb-6" style="border-color: rgba(30, 41, 59, 0.1)">
        <h1 class="font-heading text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
          {{ post.title }}
        </h1>
        <p v-if="post.description" class="mt-4 text-base leading-relaxed text-muted-foreground">
          {{ post.description }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
          <div class="flex items-center gap-2">
            <img
              :src="resolveAvatarUrl('/images/avatars/buoooou.png')"
              alt="Author"
              class="h-7 w-7 rounded-full border border-ink object-cover"
              onerror="this.style.display='none'"
            />
            <span>{{ post.authors?.join(', ') || 'Supaboard Team' }}</span>
          </div>
          <span v-if="post.date">· {{ post.date }}</span>
        </div>
      </header>

      <!-- 文章渲染正文 -->
      <div class="sb-prose max-w-none" v-html="renderedContent" />

      <!-- 文章底部行动呼吁 -->
      <div
        class="mt-12 rounded-2xl border-2 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style="border-color: var(--ink)"
      >
        <div>
          <h3 class="font-heading text-xl font-black">{{ t('立即体验极致稳定的国际专线') }}</h3>
          <p class="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            {{ t('Supaboard 全球 IPLC 专线，全量解锁流媒体与 AI，新用户注册即可开始使用。') }}
          </p>
        </div>
        <RouterLink to="/register" class="candy-button text-sm shrink-0">
          {{ t('免费注册体验') }}
        </RouterLink>
      </div>
    </article>

    <div v-else class="sticker-card text-center py-20">
      <p class="text-base text-muted-foreground">{{ t('文章不存在或已被移除') }}</p>
      <RouterLink to="/blog" class="candy-button mt-4 text-sm">
        {{ t('返回博客列表') }}
      </RouterLink>
    </div>

    <!-- 相关文章推荐 -->
    <section v-if="relatedPosts.length" class="mt-16">
      <h2 class="mb-6 font-heading text-2xl font-black">
        {{ t('推荐阅读') }}
      </h2>
      <div class="grid gap-6 sm:grid-cols-3">
        <RouterLink
          v-for="rel in relatedPosts"
          :key="rel.slug"
          :to="`/blog/${rel.slug}`"
          class="sticker-card group p-5 transition-transform hover:-translate-y-1"
        >
          <div v-if="rel.image" class="mb-3 aspect-video w-full overflow-hidden rounded-lg bg-muted border" style="border-color: var(--ink)">
            <img :src="rel.image" :alt="rel.title" class="h-full w-full object-cover" />
          </div>
          <div class="text-xs text-muted-foreground mb-1.5">{{ rel.date }}</div>
          <h3 class="font-heading text-sm font-black line-clamp-2 group-hover:text-primary transition-colors">
            {{ rel.title }}
          </h3>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
