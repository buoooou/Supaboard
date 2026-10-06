<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { t } from '@/i18n'

const R2_BASE_URL = 'https://img.buoucoding.com/vpn/app'

const platforms = [
  {
    name: 'iOS (苹果手机 / iPad)',
    icon: 'apple',
    color: 'bg-primary',
    warning: '千万不要在系统的“设置”中登录他人 Apple ID！只能在 App Store 软件内登录，否则有设备被锁死风险！',
    items: [
      {
        title: 'Shadowrocket (小火箭) / Clash Mi',
        desc: '最经典、最普及的代理软件，支持几乎所有主流协议。（需美区/港区 App Store 购买，约 $2.99）',
        links: [
          { text: '共享账号获取与使用指南', href: '#/blog/shadowrocket-shared-apple-id-guide', icon: 'book', isExternal: false },
        ],
      },
      {
        title: 'Stash / Quantumult X / Loon',
        desc: '支持分流规则及 VLESS + Reality 协议。注意部分软件历史版本协议支持情况。',
        links: [
          { text: 'Quantumult X 新手上手教程', href: '#/blog/quantumult-x-beginner-guide', icon: 'book', isExternal: false },
        ],
      },
    ],
  },
  {
    name: 'Windows (电脑端)',
    icon: 'windows',
    color: 'bg-secondary',
    items: [
      {
        title: 'Clash Verge Rev',
        desc: '现代化界面的 Clash 内核客户端，支持各种高级分流和规则配置，颜值极高。',
        links: [
          { text: '🚀 R2 高速直连 (x64 安装包)', href: `${R2_BASE_URL}/Clash.Verge_2.4.4_x64-setup.exe`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', icon: 'external', isExternal: true },
        ],
      },
      {
        title: 'v2rayN',
        desc: '强烈推荐。非常轻量、稳定，并且支持包括 Reality 在内的所有主流协议。',
        links: [
          { text: '🚀 R2 高速直连 (zip 便携包)', href: `${R2_BASE_URL}/v2rayN-windows-64.zip`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/2dust/v2rayN/releases', icon: 'external', isExternal: true },
        ],
      },
      {
        title: 'Flclash',
        desc: '基于 Flutter 开发的跨平台客户端，简洁美观，支持多种代理内核。',
        links: [
          { text: '🚀 R2 高速直连', href: `${R2_BASE_URL}/Flclash-0.8.90-windows-amd64-setup.exe`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/chen08209/FlClash/releases', icon: 'external', isExternal: true },
        ],
      },
    ],
  },
  {
    name: 'macOS (苹果电脑)',
    icon: 'apple',
    color: 'bg-tertiary',
    items: [
      {
        title: 'Clash Verge Rev',
        desc: 'macOS 平台强烈推荐！全面适配 Apple Silicon (M1/M2/M3/M4) 及 Intel 芯片，支持深色模式与 TUN 全局模式。',
        links: [
          { text: '🚀 R2 高速直连 (M系列/ARM64)', href: `${R2_BASE_URL}/Clash.Verge_2.4.4_aarch64.dmg`, icon: 'download', isExternal: true },
          { text: '🚀 R2 高速直连 (Intel/x64)', href: `${R2_BASE_URL}/Clash.Verge_2.4.4_x64.dmg`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/clash-verge-rev/clash-verge-rev/releases', icon: 'external', isExternal: true },
        ],
      },
      {
        title: 'Flclash',
        desc: '现代化 Flutter 跨平台客户端，支持 Apple Silicon 及 Intel 芯片。',
        links: [
          { text: '🚀 R2 高速直连 (ARM64)', href: `${R2_BASE_URL}/Flclash-0.8.90-macos-arm64.dmg`, icon: 'download', isExternal: true },
          { text: '🚀 R2 高速直连 (Intel/x64)', href: `${R2_BASE_URL}/Flclash-0.8.90-macos-x64.dmg`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/chen08209/FlClash/releases', icon: 'external', isExternal: true },
        ],
      },
      {
        title: 'V2rayU',
        desc: '极为小巧的 macOS 原生状态栏客户端，内存占用极低，随开随用。',
        links: [
          { text: '🚀 R2 高速直连 (Universal 通用包)', href: `${R2_BASE_URL}/V2rayU-64.dmg`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/yanue/V2rayU/releases', icon: 'external', isExternal: true },
        ],
      },
    ],
  },
  {
    name: 'Android (安卓手机 / 平板)',
    icon: 'android',
    color: 'bg-quaternary',
    items: [
      {
        title: 'NekoBox for Android',
        desc: '目前安卓端最为推荐的客户端！功能全面，基于 Sing-box 内核开发，完美支持 Reality 等新协议。',
        links: [
          { text: '🚀 R2 高速直连 (arm64-v8a)', href: `${R2_BASE_URL}/NekoBox-1.4.2-arm64-v8a.apk`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/MatsuriDayo/NekoBoxForAndroid/releases', icon: 'external', isExternal: true },
        ],
      },
      {
        title: 'v2rayNG',
        desc: '安卓端老牌经典的 Xray 官方系客户端。连通率和稳定性极其出色，属于防呆级别的万金油软件。',
        links: [
          { text: '🚀 R2 高速直连 (通用包)', href: `${R2_BASE_URL}/v2rayNG_2.1.3-fdroid_universal.apk`, icon: 'download', isExternal: true },
          { text: '🔗 GitHub Releases 下载', href: 'https://github.com/2dust/v2rayNG/releases', icon: 'external', isExternal: true },
        ],
      },
    ],
  },
]
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-14 text-center">
      <div
        class="mb-4 inline-flex items-center gap-2 rounded-full border-2 bg-primary/10 px-4 py-1.5 font-heading text-xs font-bold"
        style="border-color: var(--ink)"
      >
        <Icon name="download" :size="14" />
        <span>{{ t('客户端下载直通车') }}</span>
      </div>
      <h1 class="font-heading text-4xl font-black sm:text-5xl md:text-6xl">
        {{ t('选择您的设备') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {{ t('请根据您的操作系统，选择对应的客户端进行安装。提供官方直链与高速镜像下载，安全可靠。') }}
      </p>
    </div>

    <!-- Platforms Grid -->
    <div class="grid gap-10 md:grid-cols-2">
      <div
        v-for="(platform, pi) in platforms"
        :key="pi"
        class="sticker-card flex flex-col justify-between"
      >
        <div>
          <!-- 平台标题与图标 -->
          <div class="mb-6 flex items-center gap-4">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-white shadow-[3px_3px_0px_0px_var(--ink)]"
              :class="platform.color"
              style="border-color: var(--ink)"
            >
              <Icon :name="platform.icon" :size="26" />
            </div>
            <h2 class="font-heading text-2xl font-black">{{ t(platform.name) }}</h2>
          </div>

          <!-- 警告提示 -->
          <div
            v-if="platform.warning"
            class="mb-6 flex items-start gap-3 rounded-xl border-2 border-amber-500 bg-amber-100 p-4 text-amber-900"
          >
            <Icon name="alert" :size="20" class="mt-0.5 shrink-0 text-amber-600" />
            <p class="text-xs font-bold leading-relaxed">{{ t(platform.warning) }}</p>
          </div>

          <!-- 客户端列表 -->
          <div class="space-y-6">
            <div
              v-for="(item, ii) in platform.items"
              :key="ii"
              class="border-b pb-6 last:border-b-0 last:pb-0"
              style="border-color: rgba(30, 41, 59, 0.1)"
            >
              <h3 class="font-heading text-lg font-black">{{ item.title }}</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground">{{ t(item.desc) }}</p>

              <!-- 下载按钮与链接 -->
              <div class="mt-3.5 flex flex-wrap gap-2.5">
                <a
                  v-for="(link, li) in item.links"
                  :key="li"
                  :href="link.href"
                  :target="link.isExternal ? '_blank' : undefined"
                  :rel="link.isExternal ? 'noopener noreferrer' : undefined"
                  class="inline-flex items-center gap-1.5 rounded-lg border-2 bg-background px-3 py-1.5 font-heading text-xs font-bold transition-all hover:bg-primary hover:text-white"
                  style="border-color: var(--ink)"
                >
                  <Icon :name="link.icon" :size="13" />
                  <span>{{ link.text }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 border-t pt-4 text-right" style="border-color: rgba(30, 41, 59, 0.1)">
          <RouterLink to="/docs" class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <span>{{ t('查看配套配置教程') }}</span>
            <Icon name="arrow-right" :size="12" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
