<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Icon from '@/components/Icon.vue'
import Spinner from '@/components/Spinner.vue'
import Empty from '@/components/Empty.vue'
import Modal from '@/components/Modal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { userApi, type KnowledgeItem } from '@/api'
import { currentLang, t } from '@/i18n'
import { formatDate } from '@/utils/format'
import { renderMarkdown } from '@/utils/markdown'
import { showError } from '@/utils/feedback'

const loading = ref(true)
const groups = ref<Record<string, KnowledgeItem[]>>({})
const keyword = ref('')
const lang = ref(currentLang.value)
const article = ref<KnowledgeItem | null>(null)
const articleLoading = ref(false)

async function load() {
  loading.value = true
  try {
    let res = await userApi.knowledge(lang.value, keyword.value || undefined)
    // 当前语言没有文档时回退到简体中文
    if (!keyword.value && !Object.keys(res || {}).length && lang.value !== 'zh-CN') {
      lang.value = 'zh-CN'
      res = await userApi.knowledge(lang.value)
    }
    groups.value = res || {}
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  searchTimer && clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 350)
}

async function open(item: KnowledgeItem) {
  article.value = { ...item, body: undefined }
  articleLoading.value = true
  try {
    article.value = await userApi.knowledgeDetail(item.id, lang.value)
  } catch (e) {
    showError(e)
  } finally {
    articleLoading.value = false
  }
}

const entries = computed(() => Object.entries(groups.value))
const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-quaternary']
</script>

<template>
  <div>
    <PageHeader :title="t('使用文档')" :desc="t('客户端下载、配置教程与常见问题')">
      <div class="relative">
        <Icon name="search" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input v-model="keyword" class="sb-input w-64 pl-9" :placeholder="t('搜索文档')" @input="onSearch" />
      </div>
    </PageHeader>

    <Spinner v-if="loading" />
    <div v-else-if="!entries.length" class="sb-card"><Empty icon="book" :text="keyword ? t('没有找到相关文档') : t('暂无文档')" /></div>
    <div v-else class="space-y-8">
      <section v-for="([category, items], gi) in entries" :key="category">
        <div class="mb-4 flex items-center gap-3">
          <span class="h-3 w-3 rounded-full border-2" :class="colors[gi % colors.length]" style="border-color: var(--ink)" />
          <h2 class="text-lg">{{ category }}</h2>
          <span class="text-xs text-muted-foreground">{{ items.length }}</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="item in items"
            :key="item.id"
            class="sb-card flex items-center gap-4 p-5 text-left transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover"
            @click="open(item)"
          >
            <span class="sb-icon-tile" :class="colors[gi % colors.length]"><Icon name="book" :size="18" /></span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold">{{ item.title }}</span>
              <span class="block text-xs text-muted-foreground">{{ t('更新于') }} {{ formatDate(item.updated_at) }}</span>
            </span>
            <Icon name="chevron-right" class="text-muted-foreground" />
          </button>
        </div>
      </section>
    </div>

    <Modal :open="!!article" :title="article?.title" width="max-w-3xl" @close="article = null">
      <Spinner v-if="articleLoading" />
      <div v-else class="sb-prose" v-html="renderMarkdown(article?.body)" />
    </Modal>
  </div>
</template>
