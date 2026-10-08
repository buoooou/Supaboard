<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import { getToken } from '@/utils/storage'
import { t } from '@/i18n'

const isAuthed = computed(() => !!getToken())

const highlights = [
  {
    title: '高达 15% 的超高返佣',
    desc: '拒绝套路，直给高利润！只要通过您的专属链接注册，您将获得其每笔订单金额 15% 的现金提成！',
    icon: 'chart',
    color: 'bg-primary',
  },
  {
    title: '终身循环，拒绝一次性',
    desc: '佣金绝非仅限首单！只要您邀请的用户在我们这里产生消费，您都能无限期拿提成！',
    icon: 'rotate-ccw',
    color: 'bg-secondary',
  },
  {
    title: '链接永久有效',
    desc: '生成的专属邀请链接永不失效。发一次朋友圈、群聊或博客，长期为您自动“打工”！',
    icon: 'link',
    color: 'bg-tertiary',
  },
]

const payoutInfo = [
  {
    title: '自动结算',
    desc: '为防止恶意退款套现，订单完成后 3 天，佣金将自动划转至您的账户余额。',
    icon: 'shield',
  },
  {
    title: '灵活提现',
    desc: '佣金满 100 元即可无门槛申请提现！支持 USDT (TRC20) / 支付宝快速打款。',
    icon: 'wallet',
  },
  {
    title: '极速到账',
    desc: '提交申请后，财务专员将在 24 小时内完成审核并打款，绝不拖延。',
    icon: 'zap',
  },
]

const steps = [
  {
    title: '获取专属链接',
    desc: '登录 Supaboard 用户中心，进入「我的邀请」页面，一键复制您的专属邀请链接。',
  },
  {
    title: '分享给好友/社群',
    desc: '将链接发送给身边的朋友、发布到社交媒体、博客、论坛或 Telegram 频道中。',
  },
  {
    title: '躺赚现金收益',
    desc: '好友通过链接注册并充值，系统立即自动计算 15% 提成，满额随时提现！',
  },
]
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <!-- HERO SECTION -->
    <section class="mb-16 text-center">
      <div
        class="mb-4 inline-flex items-center gap-2 rounded-full border-2 bg-primary/10 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wider"
        style="border-color: var(--ink)"
      >
        <Icon name="gift" :size="14" class="text-primary" />
        <span>{{ t('全民合伙人计划') }}</span>
      </div>
      <h1 class="font-heading text-4xl font-black tracking-tight leading-tight sm:text-6xl md:text-7xl">
        {{ t('独乐乐不如众乐乐') }} <br />
        <span class="text-primary underline decoration-secondary decoration-8">{{ t('赚取丰厚被动收入') }}</span>
      </h1>
      <p class="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-xl">
        {{ t('为了感谢大家一直以来的支持，我们正式推出全新的「高额循环返利计划」！只需分享您的专属邀请链接，不仅能帮朋友用上稳定极速的网络，您还能获得源源不断的现金奖励！') }}
      </p>
      <div class="mt-8 flex justify-center">
        <RouterLink
          :to="isAuthed ? '/invite' : '/register'"
          class="candy-button text-base sm:text-lg group"
        >
          <span>{{ isAuthed ? t('获取我的专属邀请链接') : t('立即注册，开始分享赚钱') }}</span>
          <Icon name="arrow-right" :size="18" class="transition-transform group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </section>

    <!-- HIGHLIGHTS GRID -->
    <section class="mb-20 grid gap-8 md:grid-cols-3">
      <div
        v-for="(item, i) in highlights"
        :key="i"
        class="sticker-card group"
      >
        <div
          class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-white shadow-[3px_3px_0px_0px_var(--ink)]"
          :class="item.color"
          style="border-color: var(--ink)"
        >
          <Icon :name="item.icon" :size="26" />
        </div>
        <h3 class="mb-3 font-heading text-2xl font-black">{{ t(item.title) }}</h3>
        <p class="text-sm leading-relaxed text-muted-foreground">{{ t(item.desc) }}</p>
      </div>
    </section>

    <!-- PAYOUT INFO -->
    <section class="mb-20 grid items-center gap-12 lg:grid-cols-2">
      <div>
        <h2 class="mb-8 font-heading text-3xl font-black uppercase sm:text-4xl md:text-5xl">
          💸 {{ t('佣金如何结算与提现？') }}
        </h2>
        <div class="space-y-6">
          <div
            v-for="(info, i) in payoutInfo"
            :key="i"
            class="flex items-start gap-4"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-secondary/15 text-secondary shadow-[2px_2px_0px_0px_var(--ink)]"
              style="border-color: var(--ink)"
            >
              <Icon :name="info.icon" :size="22" />
            </div>
            <div>
              <h3 class="mb-1 font-heading text-lg font-black">{{ t(info.title) }}</h3>
              <p class="text-sm leading-relaxed text-muted-foreground">{{ t(info.desc) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="sticker-card relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-tertiary">
        <div class="absolute inset-0 dot-grid opacity-30" />
        <div class="relative z-10 text-center">
          <div
            class="sticker-card -rotate-3 bg-card p-8 text-foreground transition-transform hover:rotate-0"
          >
            <div class="font-heading text-6xl font-black text-primary">¥100</div>
            <div class="mt-2 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {{ t('起提门槛金额') }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- QUICK START STEPS -->
    <section class="mb-20">
      <div class="sticker-card border-dashed bg-secondary/10 p-8 sm:p-12">
        <div class="mb-12 text-center">
          <h2 class="font-heading text-3xl font-black uppercase sm:text-4xl">
            🚀 {{ t('赚取第一笔佣金只需 3 步') }}
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">{{ t('简单易上手，快速开启您的被动收入之旅') }}</p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="relative"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-primary font-heading text-xl font-black text-white shadow-[3px_3px_0px_0px_var(--ink)]"
              style="border-color: var(--ink)"
            >
              {{ i + 1 }}
            </div>
            <h3 class="mb-2 font-heading text-lg font-black">{{ t(step.title) }}</h3>
            <p class="text-sm leading-relaxed text-muted-foreground">{{ t(step.desc) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BOTTOM CTA -->
    <section class="text-center">
      <div class="sticker-card bg-slate-800 p-10 text-white sm:p-16">
        <h2 class="mb-6 font-heading text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
          {{ t('还在等什么？') }} <br />
          <span class="text-primary">{{ t('现在就去生成你的专属链接！') }}</span>
        </h2>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <RouterLink
            :to="isAuthed ? '/invite' : '/login'"
            class="candy-button bg-card text-foreground hover:bg-tertiary hover:text-white"
          >
            {{ isAuthed ? t('前往「我的邀请」获取链接') : t('立即登录获取链接') }}
          </RouterLink>
          <RouterLink
            to="/"
            class="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-3.5 font-heading text-base font-bold text-white hover:bg-white/10 transition-colors"
          >
            {{ t('返回官网首页') }}
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
