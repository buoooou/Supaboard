<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Logo from '@/components/Logo.vue'
import { siteConfig } from '@/config/site'
import { pricingPlans, type PricingPlan } from '@/config/pricing'
import { settings, state } from '@/stores/app'
import { getToken } from '@/utils/storage'
import { t } from '@/i18n'

const route = useRoute()
const isAuthed = computed(() => !!getToken())

function checkScrollToPricing() {
  if (route.query.scroll === 'pricing' || window.location.hash.includes('pricing')) {
    nextTick(() => {
      setTimeout(() => {
        const el = document.getElementById('pricing')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })
  }
}

onMounted(() => {
  checkScrollToPricing()
})

watch(
  () => route.query.scroll,
  (val) => {
    if (val === 'pricing') {
      checkScrollToPricing()
    }
  },
)

// 1. 套餐分类切换
const activeCategory = ref('all')
const categories = [
  { id: 'all', label: '全部套餐', icon: 'layers' },
  { id: 'monthly', label: '周期订阅', icon: 'clock' },
  { id: 'traffic', label: '不限时流量包', icon: 'infinity' },
  { id: 'special', label: 'AI & 跨境专区', icon: 'sparkles' },
]

const filteredPlans = computed(() => {
  return pricingPlans.filter((plan) => plan.categories.includes(activeCategory.value))
})

function getCategoryCount(catId: string) {
  return pricingPlans.filter((plan) => plan.categories.includes(catId)).length
}

// 2. 特性列表
const features = [
  {
    title: '极速专线接入 (ToC)',
    desc: '采用 IPLC/IEPL 国际专线，越过公网拥堵，延迟极低，晚高峰依然稳如泰山。',
    icon: 'zap',
    color: 'bg-primary',
  },
  {
    title: '跨境电商专线 (ToB)',
    desc: '为 TikTok、亚马逊运营打造的纯净原生 IP，防关联设计，千兆带宽确保直播流畅。',
    icon: 'globe',
    color: 'bg-secondary',
  },
  {
    title: '流媒体全解锁',
    desc: '完美支持 Netflix, Disney+, YouTube Premium 等服务，随时畅享 4K 高清视频。',
    icon: 'star',
    color: 'bg-tertiary',
  },
  {
    title: 'AI Token 中转 (ToB)',
    desc: '直通 Claude、ChatGPT 等海外顶级 AI 大模型，提供稳定 API 中转额度，赋能开发者和企业。',
    icon: 'bot',
    color: 'bg-primary',
  },
  {
    title: '多端完美适配',
    desc: '支持 Windows, macOS, Android, iOS 以及路由器插件，一个账号，全平台通用。',
    icon: 'shield',
    color: 'bg-secondary',
  },
  {
    title: '企业级 SLA 保障',
    desc: '面向 B 端客户提供超高可用性，专属 7x24 小时技术支持，护航出海核心业务。',
    icon: 'building',
    color: 'bg-tertiary',
  },
]

// 3. 安全与信任
const securityItems = [
  {
    title: '端到端加密传输',
    desc: '采用最新的 AEAD 加密协议，确保您的所有流量在传输过程中无法被嗅探或破解。',
    icon: 'shield',
    color: 'text-primary',
  },
  {
    title: '严格无日志策略',
    desc: '运维团队承诺不记录任何访问目标、时长或流量内容，您的隐私由技术手段强制保障。',
    icon: 'brain',
    color: 'text-secondary',
  },
  {
    title: '基础设施隐藏保护',
    desc: '核心架构经过脱敏处理与高强度 DDoS 防护，确保服务在极端环境下依然稳健。',
    icon: 'zap',
    color: 'text-tertiary',
  },
]

// 4. 快速上手 3 步
const steps = [
  {
    title: '获取订阅链接',
    desc: '前往 Supaboard 注册并选购套餐。在「仪表盘」点击「一键订阅」，复制您的专属订阅链接。',
  },
  {
    title: '导入客户端',
    desc: '打开下载好的客户端，找到「配置」或「订阅」选项。粘贴订阅链接，并点击「下载」或「更新」。',
  },
  {
    title: '开启系统代理',
    desc: '刷新出节点后，选择一个延迟较低的节点。打开「系统代理」开关，即可畅游自由网络。',
  },
]

// 5. 常见问题 FAQ
const faqs = [
  {
    question: '为什么我更新了订阅，但是依然无法上网？',
    answer:
      '请检查几个地方：1. 您的套餐是否已过期或流量耗尽（可前往官网查看）；2. 电脑系统时间是否准确（必须自动同步北京时间）；3. 是否正确开启了「系统代理 (System Proxy)」或 TUN 虚拟网卡模式。',
  },
  {
    question: '什么是「系统代理」和「TUN 模式」？',
    answer:
      '「系统代理」一般只能代理浏览器流量；如果您的游戏、命令行、Telegram 等软件需要代理，建议在客户端设置中开启「TUN 模式 (虚拟网卡模式)」，可以实现全局强制代理。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '支持支付宝、微信支付、USDT (TRC20) 加密货币以及 Stripe 信用卡等多种便捷安全的支付渠道。',
  },
  {
    question: '购买后支持退款吗？',
    answer:
      '我们提供完善的服务质量承诺，若因我方专线节点故障导致无法使用，可按服务条款申请退款支持。详情可参阅底部的《退款政策》。',
  },
]
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- 装饰光晕背景 -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -left-12 top-[8%] h-72 w-72 rounded-full bg-tertiary/20 blur-3xl" />
      <div class="absolute -right-12 bottom-[25%] h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div class="absolute left-1/4 top-1/4 h-4 w-4 rounded-full bg-primary opacity-40" />
      <div class="absolute right-1/4 top-1/3 h-8 w-8 rotate-12 rounded-lg border-4 border-tertiary opacity-40" />
      <div class="absolute bottom-1/4 left-1/3 h-6 w-6 rotate-45 bg-quaternary opacity-40" />
    </div>

    <!-- 1. HERO 头部横幅区 -->
    <section class="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 md:pt-28 md:pb-28 lg:px-8">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div class="text-left">
          <!-- 徽章 -->
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border-2 bg-tertiary/15 px-4 py-2 font-heading text-sm font-bold shadow-[3px_3px_0px_0px_var(--ink)]"
            style="border-color: var(--ink)"
          >
            <Icon name="star" :size="16" class="text-amber-500 fill-amber-500" />
            <span>{{ t('稳定 · 高速 · 全球解锁') }}</span>
          </div>

          <!-- 主标题 -->
          <h1 class="mb-6 font-heading text-5xl font-black tracking-tight leading-[1.05] sm:text-6xl md:text-7xl">
            【{{ settings.title || 'Supaboard' }}】 <br />
            <span class="text-primary">{{ t('ChatGPT 无忧访问') }}</span>
          </h1>

          <!-- 副标题 -->
          <p class="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {{ settings.description || t('提供 IPLC/IEPL 专线接入，晚高峰不卡顿。全量解锁 Netflix / Disney+ / YouTube Premium 等全球流媒体与 AI 工具服务。') }}
          </p>

          <!-- 行动号召按钮组 -->
          <div class="flex flex-wrap items-center gap-4">
            <RouterLink
              :to="isAuthed ? '/dashboard' : '/register'"
              class="candy-button text-lg group"
            >
              <span>{{ isAuthed ? t('进入控制台') : t('立即注册，领体验流量') }}</span>
              <Icon name="arrow-right" :size="18" class="transition-transform group-hover:translate-x-1" />
            </RouterLink>

            <RouterLink
              to="/download"
              class="inline-flex select-none items-center justify-center gap-2 rounded-full border-2 bg-card px-7 py-3.5 font-heading text-base font-bold text-foreground hover:bg-tertiary hover:text-white transition-all duration-200 shadow-[3px_3px_0px_0px_var(--ink)]"
              style="border-color: var(--ink)"
            >
              <Icon name="download" :size="18" />
              <span>{{ t('下载客户端') }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- Hero 动效右图 -->
        <div class="relative flex items-center justify-center">
          <div
            class="sticker-card relative z-10 flex aspect-square w-full max-w-md items-center justify-center overflow-hidden bg-primary p-0 shadow-[8px_8px_0px_0px_var(--ink)]"
          >
            <div class="absolute inset-0 dot-grid opacity-30" />
            <div class="relative z-10 flex flex-col items-center justify-center text-white p-8 text-center">
              <div class="mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border-4 bg-white/10 shadow-[6px_6px_0px_0px_#1E293B]" style="border-color: var(--ink)">
                <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 2 2 9.5l7.5 3L22 2Z" fill="#FFF" />
                  <path d="M22 2 9.5 12.5v7L13 15l5 4L22 2Z" fill="rgba(255,255,255,0.7)" />
                </svg>
              </div>
              <div class="font-heading text-3xl font-black tracking-tight">Supaboard</div>
              <div class="mt-2 text-sm font-semibold opacity-90">{{ t('新一代高速专线加速网络') }}</div>
            </div>
          </div>
          <!-- 背景圆斑 -->
          <div
            class="blob-radius absolute -inset-6 -z-10 bg-secondary/30 animate-pulse-slow"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>

    <!-- 2. FEATURES 特性矩阵区 -->
    <section id="features" class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div class="mb-16 text-center">
        <h2 class="font-heading text-4xl font-black sm:text-5xl md:text-6xl">
          {{ t('卓越的网络性能') }}
        </h2>
        <div class="mx-auto mt-4 h-2 w-24 rounded-full bg-primary" />
      </div>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(f, i) in features"
          :key="i"
          class="sticker-card group hover:bg-muted/40"
        >
          <div
            class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-white shadow-[3px_3px_0px_0px_var(--ink)] transition-transform group-hover:-translate-y-1"
            :class="f.color"
            style="border-color: var(--ink)"
          >
            <Icon :name="f.icon" :size="26" />
          </div>
          <h3 class="mb-3 font-heading text-xl font-black">
            {{ t(f.title) }}
          </h3>
          <p class="text-sm leading-relaxed text-muted-foreground">
            {{ t(f.desc) }}
          </p>
        </div>
      </div>
    </section>

    <!-- 3. SECURITY 安全与无日志策略 -->
    <section class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 cv-auto">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 class="mb-8 font-heading text-4xl font-black tracking-tight leading-tight sm:text-5xl md:text-6xl">
            {{ t('不仅快，更要') }} <br />
            <span class="text-secondary">{{ t('绝对安全与私密') }}</span>
          </h2>
          <div class="space-y-6">
            <div
              v-for="(item, i) in securityItems"
              :key="i"
              class="flex items-start gap-4"
            >
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 bg-card shadow-[2px_2px_0px_0px_var(--ink)]"
                :class="item.color"
                style="border-color: var(--ink)"
              >
                <Icon :name="item.icon" :size="22" />
              </div>
              <div>
                <h3 class="mb-1 font-heading text-lg font-black">{{ t(item.title) }}</h3>
                <p class="text-sm leading-relaxed text-muted-foreground">{{ t(item.desc) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="sticker-card aspect-video flex items-center justify-center overflow-hidden bg-slate-800 p-0 text-white"
          >
            <div class="absolute inset-0 dot-grid opacity-20" />
            <div class="relative z-10 text-center p-6">
              <div
                class="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/10 px-5 py-2 font-heading text-lg font-black backdrop-blur-md"
              >
                <Icon name="shield" :size="20" class="text-emerald-400" />
                <span>{{ t('军用级加密标准') }}</span>
              </div>
              <p class="text-xs font-bold uppercase tracking-widest opacity-80">
                Protected by Supaboard Guard
              </p>
            </div>
          </div>
          <div
            class="sticker-card absolute -bottom-5 -right-5 rotate-3 bg-tertiary px-6 py-4 text-white shadow-[4px_4px_0px_0px_var(--ink)]"
          >
            <div class="font-heading text-lg font-black">100% Uptime</div>
            <div class="text-xs font-bold opacity-80">{{ t('过去 365 天运行表现') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. QUICK START 快速上手教程 -->
    <section class="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 cv-auto">
      <div class="sticker-card border-dashed bg-secondary/10">
        <div class="mb-12 text-center">
          <h2 class="font-heading text-3xl font-black uppercase sm:text-4xl">
            📖 {{ t('快速上手教程') }}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">{{ t('三步连接，畅享自由网络') }}</p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="relative"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foreground font-heading text-xl font-black text-background shadow-[3px_3px_0px_0px_#6F3CFF]"
            >
              {{ i + 1 }}
            </div>
            <h3 class="mb-2 font-heading text-lg font-black">{{ t(step.title) }}</h3>
            <p class="text-sm leading-relaxed text-muted-foreground">{{ t(step.desc) }}</p>
          </div>
        </div>

        <div class="mt-12 text-center">
          <RouterLink to="/docs" class="candy-button text-base group">
            <span>{{ t('查看更详细的使用教程') }}</span>
            <Icon name="arrow-right" :size="16" class="transition-transform group-hover:translate-x-1" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 5. PRICING 套餐价格区 -->
    <section id="pricing" class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div class="mb-14 text-center">
        <h2 class="font-heading text-4xl font-black sm:text-5xl md:text-6xl">
          {{ t('选择适合您的套餐') }}
        </h2>
        <div class="mx-auto mt-4 h-2 w-24 rounded-full bg-primary" />
      </div>

      <!-- 分类 Tab 切换 -->
      <div class="mb-12 flex flex-wrap items-center justify-center gap-2.5">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 font-heading text-sm font-bold transition-all"
          :class="
            activeCategory === cat.id
              ? 'bg-primary text-white shadow-[3px_3px_0px_0px_var(--ink)] -translate-y-0.5'
              : 'bg-card text-foreground hover:bg-muted shadow-[2px_2px_0px_0px_var(--ink)]'
          "
          style="border-color: var(--ink)"
          @click="activeCategory = cat.id"
        >
          <Icon :name="cat.icon" :size="15" />
          <span>{{ t(cat.label) }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-mono font-bold"
            :class="activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'"
          >
            {{ getCategoryCount(cat.id) }}
          </span>
        </button>
      </div>

      <!-- 套餐卡片列表 -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="plan in filteredPlans"
          :key="plan.id"
          class="sticker-card relative flex flex-col justify-between"
          :class="plan.popular ? 'ring-4 ring-primary ring-offset-2' : ''"
        >
          <!-- 热门推荐徽章 -->
          <div
            v-if="plan.badge"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border-2 px-3.5 py-0.5 font-heading text-xs font-black shadow-[2px_2px_0px_0px_var(--ink)] whitespace-nowrap"
            :class="plan.badgeColor || 'bg-secondary text-white'"
            style="border-color: var(--ink)"
          >
            {{ plan.badge }}
          </div>

          <div>
            <!-- 分组标签 -->
            <div class="mb-3 flex items-center justify-between">
              <span
                class="rounded-md px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider"
                :class="plan.groupBadgeColor"
              >
                {{ plan.groupBadge }}
              </span>
              <span v-if="plan.popular" class="flex items-center gap-1 font-heading text-xs font-black text-primary">
                <Icon name="flame" :size="14" class="text-secondary" />
                {{ t('热销爆款') }}
              </span>
            </div>

            <!-- 套餐名 -->
            <h3 class="font-heading text-2xl font-black">{{ plan.name }}</h3>

            <!-- 价格展示 -->
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-sm font-bold text-muted-foreground">HK$</span>
              <span class="font-heading text-5xl font-black tracking-tight text-primary">{{ plan.price }}</span>
              <span class="text-sm font-semibold text-muted-foreground">{{ plan.unit }}</span>
            </div>
            <p class="mt-2 text-xs font-medium text-muted-foreground">{{ plan.cycleHint }}</p>

            <hr class="my-6 border-ink/10" />

            <!-- 特权清单 -->
            <ul class="space-y-3 text-sm">
              <li
                v-for="(f, fi) in plan.features"
                :key="fi"
                class="flex items-start gap-2.5"
              >
                <Icon name="check-circle" :size="16" class="mt-0.5 shrink-0 text-quaternary" />
                <span class="leading-snug">{{ f }}</span>
              </li>
            </ul>
          </div>

          <!-- 购买 / 订购按钮 -->
          <div class="mt-8">
            <a
              v-if="plan.customLink"
              :href="plan.customLink"
              target="_blank"
              rel="noopener noreferrer"
              class="sb-btn sb-btn-outline w-full justify-center"
            >
              {{ t('前往选购') }} ↗
            </a>
            <RouterLink
              v-else-if="isAuthed"
              to="/plan"
              class="sb-btn sb-btn-primary w-full justify-center"
            >
              {{ t('立即购买') }}
            </RouterLink>
            <RouterLink
              v-else
              to="/register"
              class="sb-btn sb-btn-primary w-full justify-center"
            >
              {{ t('注册并购买') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. REFERRAL 合伙人推广返佣卡片 -->
    <section class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 cv-auto">
      <div class="sticker-card border-dashed bg-primary/5 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-10">
        <div class="flex-1 text-center md:text-left">
          <div
            class="mb-4 inline-flex items-center gap-2 rounded-full border-2 bg-secondary px-4 py-1.5 font-heading text-xs font-bold text-white shadow-[2px_2px_0px_0px_var(--ink)]"
            style="border-color: var(--ink)"
          >
            <Icon name="gift" :size="14" />
            <span>{{ t('独乐乐不如众乐乐') }}</span>
          </div>
          <h2 class="mb-4 font-heading text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {{ t('加入「全民合伙人」计划') }} <br />
            <span class="text-primary">{{ t('赚取丰厚被动收入') }}</span>
          </h2>
          <p class="mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
            {{ t('只需分享您的专属链接，即可获得高达 15% 的终身循环返利。不仅能帮朋友用上极速稳定网络，您还能躺着赚现金！') }}
          </p>
          <RouterLink to="/affiliate" class="candy-button text-base group">
            <span>{{ t('查看返佣计划详情') }}</span>
            <Icon name="arrow-right" :size="16" class="transition-transform group-hover:translate-x-1" />
          </RouterLink>
        </div>

        <div class="relative w-full max-w-[260px] aspect-square flex items-center justify-center">
          <div class="blob-radius absolute inset-0 bg-primary/20 animate-pulse-slow" />
          <div
            class="sticker-card relative z-10 flex h-44 w-44 rotate-3 items-center justify-center bg-card text-center shadow-[6px_6px_0px_0px_var(--ink)]"
          >
            <div>
              <div class="font-heading text-5xl font-black text-primary">15%</div>
              <div class="mt-1 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {{ t('终身佣金比例') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. TG ROBOT 电报机器人服务 -->
    <section class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 cv-auto">
      <div
        class="sticker-card relative flex flex-col items-center gap-10 overflow-hidden bg-slate-800 p-8 text-white sm:p-12 md:p-16 lg:flex-row"
      >
        <div class="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

        <div class="relative z-10 flex-1 text-center lg:text-left">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/10 px-4 py-1.5 font-heading text-xs font-bold backdrop-blur-md"
          >
            <Icon name="message" :size="14" />
            <span>{{ t('智能运维助手') }}</span>
          </div>
          <h2 class="mb-4 font-heading text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {{ t('TG 机器人') }} <br />
            <span class="text-primary">{{ t('随时随地 触手可及') }}</span>
          </h2>
          <p class="mb-8 max-w-xl text-base opacity-90 sm:text-lg">
            {{ t('无需登录官网，直接在 Telegram 中管理您的订阅。查询剩余流量、获取最新节点地址、甚至接收流量预警，全部一键搞定。') }}
          </p>
          <a
            :href="siteConfig.telegramBot"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 rounded-full border-2 border-white bg-primary px-8 py-3.5 font-heading text-base font-black text-white hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#6F3CFF]"
          >
            <Icon name="telegram" :size="18" />
            <span>{{ t('立即接入') }} @supaboard_2_bot</span>
          </a>
        </div>

        <div class="relative z-10 w-full max-w-xs">
          <div class="sticker-card rotate-2 bg-background p-6 text-foreground shadow-[6px_6px_0px_0px_var(--ink)]">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b pb-2">
                <span class="text-xs font-bold text-muted-foreground">{{ t('流量查询') }}</span>
                <span class="font-heading font-black text-primary">{{ t('秒级同步') }}</span>
              </div>
              <div class="flex items-center justify-between border-b pb-2">
                <span class="text-xs font-bold text-muted-foreground">{{ t('余额提醒') }}</span>
                <span class="font-heading font-black text-secondary">{{ t('自动推送') }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-muted-foreground">{{ t('节点获取') }}</span>
                <span class="font-heading font-black text-quaternary">{{ t('一键发送') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. IP CHECK 在线诊断工具 -->
    <section class="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 cv-auto">
      <div class="sticker-card flex flex-col items-center gap-10 lg:flex-row">
        <div class="flex-1 text-center lg:text-left">
          <div
            class="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 bg-tertiary/15 px-3.5 py-1 font-heading text-xs font-bold"
            style="border-color: var(--ink)"
          >
            <Icon name="search" :size="13" />
            <span>{{ t('在线网络诊断') }}</span>
          </div>
          <h2 class="mb-3 font-heading text-3xl font-black leading-tight sm:text-4xl">
            {{ settings.title || 'Supaboard' }} <span class="text-primary">{{ t('IP 纯净度检测') }}</span>
          </h2>
          <p class="mb-6 text-sm text-muted-foreground leading-relaxed sm:text-base">
            {{ t('一键快速检测当前节点的真实 IP 属性、欺诈分值（Fraud Score）、地理位置、ASN 运营商以及流媒体与 ChatGPT 解锁状态。') }}
          </p>
          <a
            :href="siteConfig.ipCheckUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="candy-button text-base group"
          >
            <span>{{ t('前往 IP 检测工具') }}</span>
            <Icon name="external" :size="16" class="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div class="w-full lg:w-5/12 grid grid-cols-2 gap-3.5">
          <div class="rounded-xl border-2 bg-blue-50/50 p-4 shadow-[2px_2px_0px_0px_var(--ink)]" style="border-color: var(--ink)">
            <Icon name="globe" :size="20" class="text-blue-600 mb-2" />
            <h4 class="font-heading text-sm font-black">{{ t('IP 与地理定位') }}</h4>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('精确经纬度与线路运营商') }}</p>
          </div>
          <div class="rounded-xl border-2 bg-purple-50/50 p-4 shadow-[2px_2px_0px_0px_var(--ink)]" style="border-color: var(--ink)">
            <Icon name="shield" :size="20" class="text-purple-600 mb-2" />
            <h4 class="font-heading text-sm font-black">{{ t('欺诈风险评分') }}</h4>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('评估纯净度，防风控拦截') }}</p>
          </div>
          <div class="rounded-xl border-2 bg-amber-50/50 p-4 shadow-[2px_2px_0px_0px_var(--ink)]" style="border-color: var(--ink)">
            <Icon name="zap" :size="20" class="text-amber-600 mb-2" />
            <h4 class="font-heading text-sm font-black">{{ t('连通性与延迟') }}</h4>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('测试全网节点连通速率') }}</p>
          </div>
          <div class="rounded-xl border-2 bg-emerald-50/50 p-4 shadow-[2px_2px_0px_0px_var(--ink)]" style="border-color: var(--ink)">
            <Icon name="star" :size="20" class="text-emerald-600 mb-2" />
            <h4 class="font-heading text-sm font-black">{{ t('AI 与流媒体') }}</h4>
            <p class="mt-1 text-xs text-muted-foreground">{{ t('ChatGPT/Netflix 可用性') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. FAQ 常见问题 -->
    <section class="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 cv-auto">
      <div class="mb-12 text-center">
        <h2 class="font-heading text-3xl font-black uppercase sm:text-4xl">
          ❓ {{ t('常见问题 FAQ') }}
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="sticker-card bg-card p-6"
        >
          <h3 class="mb-2 flex items-start gap-2.5 font-heading text-base font-black">
            <span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">Q{{ i + 1 }}</span>
            <span>{{ t(faq.question) }}</span>
          </h3>
          <p class="pl-8 text-sm leading-relaxed text-muted-foreground">
            {{ t(faq.answer) }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
