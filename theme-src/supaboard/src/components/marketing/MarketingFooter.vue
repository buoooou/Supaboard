<script setup lang="ts">
import { computed } from 'vue'
import Logo from '@/components/Logo.vue'
import Icon from '@/components/Icon.vue'
import { siteConfig } from '@/config/site'
import { settings, state } from '@/stores/app'
import { t } from '@/i18n'

const year = new Date().getFullYear()
const isAuthed = computed(() => !!state.user)
</script>

<template>
  <footer class="relative mt-20 border-t-4 bg-background transition-colors" style="border-color: var(--ink)">
    <div class="mx-auto max-w-7xl px-6 py-16 md:flex md:items-start md:gap-16 md:px-8 md:py-20">
      <!-- 品牌 & 简介 -->
      <div class="mb-12 md:mb-0 md:w-1/3">
        <RouterLink to="/" class="flex items-center gap-2">
          <Logo />
        </RouterLink>
        <p class="mt-3 text-xs opacity-70">
          © {{ year }} {{ settings.title || 'Supaboard' }} Ltd. {{ t('保留所有权利') }}
        </p>
        <p class="mt-4 text-sm leading-relaxed text-muted-foreground">
          {{ settings.description || siteConfig.description }}
        </p>

        <!-- 社交媒体链接 -->
        <div class="mt-6 flex items-center gap-3">
          <a
            v-if="siteConfig.links.twitter"
            :href="siteConfig.links.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="sb-icon-tile bg-white text-foreground hover:-translate-y-0.5 transition-transform"
            title="Twitter / X"
          >
            <Icon name="twitter" :size="18" />
          </a>
          <a
            v-if="siteConfig.links.github"
            :href="siteConfig.links.github"
            target="_blank"
            rel="noopener noreferrer"
            class="sb-icon-tile bg-white text-foreground hover:-translate-y-0.5 transition-transform"
            title="GitHub"
          >
            <Icon name="github" :size="18" />
          </a>
          <a
            v-if="siteConfig.links.telegram"
            :href="siteConfig.links.telegram"
            target="_blank"
            rel="noopener noreferrer"
            class="sb-icon-tile bg-white text-foreground hover:-translate-y-0.5 transition-transform"
            title="Telegram"
          >
            <Icon name="telegram" :size="18" />
          </a>
          <a
            v-if="siteConfig.links.discord"
            :href="siteConfig.links.discord"
            target="_blank"
            rel="noopener noreferrer"
            class="sb-icon-tile bg-white text-foreground hover:-translate-y-0.5 transition-transform"
            title="Discord"
          >
            <Icon name="discord" :size="18" />
          </a>
        </div>
      </div>

      <!-- 导航列 -->
      <div class="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <!-- 产品与服务 -->
        <div class="space-y-4">
          <h3 class="font-heading text-xs font-black uppercase tracking-wider text-primary">
            {{ t('产品服务') }}
          </h3>
          <ul class="space-y-2.5 text-sm font-semibold">
            <li>
              <RouterLink :to="isAuthed ? '/dashboard' : '/login'" class="text-muted-foreground hover:text-primary transition-colors">
                {{ isAuthed ? t('用户控制台') : t('用户登录') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('官网首页') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/pricing" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('价格方案') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/download" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('客户端下载') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/docs" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('使用文档与教程') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/affiliate" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('全民合伙人计划') }}
              </RouterLink>
            </li>
            <li>
              <a :href="siteConfig.ipCheckUrl" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary transition-colors">
                {{ t('IP 纯净度检测') }} ↗
              </a>
            </li>
            <li>
              <div class="flex items-center gap-2 text-muted-foreground cursor-default">
                <span>{{ t('全节点状态') }}</span>
                <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </li>
          </ul>
        </div>

        <!-- 相关资源 -->
        <div class="space-y-4">
          <h3 class="font-heading text-xs font-black uppercase tracking-wider text-secondary">
            {{ t('相关资源') }}
          </h3>
          <ul class="space-y-2.5 text-sm font-semibold">
            <li>
              <RouterLink to="/blog" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('博客文章') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/privacy" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('隐私政策') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/refund" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('退款政策') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/terms" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('服务条款') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/aup" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('可接受使用守则 (AUP)') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/dmca" class="text-muted-foreground hover:text-secondary transition-colors">
                {{ t('DMCA 滥用申诉') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- 官方支持与联系 -->
        <div class="col-span-2 sm:col-span-1 space-y-4">
          <h3 class="font-heading text-xs font-black uppercase tracking-wider text-tertiary">
            {{ t('官方支持') }}
          </h3>
          <ul class="space-y-2.5 text-sm font-semibold">
            <li>
              <a :href="siteConfig.telegramBot" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-tertiary transition-colors">
                {{ t('Telegram 智能机器人') }} ↗
              </a>
            </li>
            <li>
              <a :href="siteConfig.links.telegram" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-tertiary transition-colors">
                {{ t('Telegram 交流群组') }} ↗
              </a>
            </li>
            <li v-if="isAuthed">
              <RouterLink to="/ticket" class="text-muted-foreground hover:text-tertiary transition-colors">
                {{ t('在线支持工单') }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>
