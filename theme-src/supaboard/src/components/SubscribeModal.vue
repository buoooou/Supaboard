<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import Modal from './Modal.vue'
import Icon from './Icon.vue'
const QrCode = defineAsyncComponent(() => import('./QrCode.vue'))
import { appTitle } from '@/stores/app'
import { copyText, detectPlatform } from '@/utils/format'
import { toast } from '@/utils/feedback'
import { t } from '@/i18n'

const props = defineProps<{ open: boolean; url: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

type Platform = 'windows' | 'mac' | 'ios' | 'android' | 'unknown'
const device = detectPlatform()
const platform = ref<Platform>(device)
const tab = ref<'import' | 'qr'>('import')
// 手机上无法扫描自己屏幕上的二维码，只在电脑端提供扫码订阅
const showQr = device !== 'ios' && device !== 'android'

const clients = computed(() => {
  const url = props.url
  if (!url) return []
  const enc = encodeURIComponent(url)
  const name = encodeURIComponent(appTitle)
  const b64 = btoa(unescape(encodeURIComponent(url))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const qx = encodeURIComponent(JSON.stringify({ server_remote: [`${url}, tag=${appTitle}`] }))
  // 只保留支持 VLESS Reality 的客户端；Surge / Surfboard / 原版 Clash 不支持 VLESS
  const list: { name: string; color: string; platforms: Platform[]; href: string }[] = [
    { name: 'Clash Verge', color: 'bg-[#2d6cdf]', platforms: ['windows', 'mac'], href: `clash://install-config?url=${enc}&name=${name}` },
    { name: 'Clash Meta', color: 'bg-[#2d6cdf]', platforms: ['android'], href: `clash://install-config?url=${enc}&name=${name}` },
    { name: 'Shadowrocket', color: 'bg-[#1e88e5]', platforms: ['ios', 'mac'], href: `shadowrocket://add/sub://${b64}?remark=${name}` },
    { name: 'Stash', color: 'bg-[#6366f1]', platforms: ['ios', 'mac'], href: `stash://install-config?url=${enc}&name=${name}` },
    { name: 'Quantumult X', color: 'bg-[#111827]', platforms: ['ios', 'mac'], href: `quantumult-x:///update-configuration?remote-resource=${qx}` },
    { name: 'Hiddify', color: 'bg-[#1f9d8f]', platforms: ['windows', 'mac', 'android', 'ios'], href: `hiddify://import/${url}#${name}` },
    { name: 'sing-box', color: 'bg-[#334155]', platforms: ['android', 'mac', 'ios'], href: `sing-box://import-remote-profile?url=${enc}#${name}` },
  ]
  return platform.value === 'unknown' ? list : list.filter((c) => c.platforms.includes(platform.value))
})

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'windows', label: 'Windows', icon: 'monitor' },
  { value: 'mac', label: 'macOS', icon: 'monitor' },
  { value: 'ios', label: 'iOS', icon: 'smartphone' },
  { value: 'android', label: 'Android', icon: 'smartphone' },
]

async function copy() {
  ;(await copyText(props.url)) ? toast.success(t('订阅链接已复制')) : toast.error(t('复制失败，请手动复制'))
}
</script>

<template>
  <Modal :open="open" :title="t('一键订阅')" width="max-w-xl" @close="emit('close')">
    <div class="space-y-5">
      <div v-if="showQr" class="flex gap-2 rounded-full border-2 bg-muted p-1" style="border-color: var(--ink)">
        <button
          v-for="x in [
            { v: 'import', l: '导入客户端', i: 'download' },
            { v: 'qr', l: '扫码订阅', i: 'qr' },
          ]"
          :key="x.v"
          class="flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition"
          :class="tab === x.v ? 'bg-card shadow-pop-active' : 'text-muted-foreground'"
          @click="tab = x.v as any"
        >
          <Icon :name="x.i" :size="16" /> {{ t(x.l) }}
        </button>
      </div>

      <template v-if="tab === 'import'">
        <div class="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:gap-2">
          <button
            v-for="p in platforms"
            :key="p.value"
            class="inline-flex items-center justify-center gap-1.5 rounded-lg px-1 py-1.5 text-sm font-medium transition sm:px-3"
            :class="platform === p.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'"
            @click="platform = p.value"
          >
            <Icon :name="p.icon" :size="14" /> {{ p.label }}
          </button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            class="flex items-center gap-3 rounded-xl border-2 bg-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-pop"
            style="border-color: var(--ink)"
            @click="copy"
          >
            <span class="sb-icon-tile h-10 w-10 bg-primary"><Icon name="copy" :size="18" /></span>
            <span>
              <span class="block text-sm font-semibold">{{ t('复制订阅链接') }}</span>
              <span class="block text-xs text-muted-foreground">{{ t('适用于所有客户端') }}</span>
            </span>
          </button>
          <a
            v-for="c in clients"
            :key="c.name"
            :href="c.href"
            class="flex items-center gap-3 rounded-xl border-2 bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-pop"
            style="border-color: var(--ink)"
          >
            <span class="sb-icon-tile h-10 w-10 text-sm font-bold" :class="c.color">{{ c.name.slice(0, 1) }}</span>
            <span>
              <span class="block text-sm font-semibold">{{ t('导入到 {name}', { name: c.name }) }}</span>
              <span class="block text-xs text-muted-foreground">{{ t('需已安装客户端') }}</span>
            </span>
          </a>
        </div>
        <p class="text-xs text-muted-foreground">
          {{ t('没有安装客户端？') }}
          <RouterLink to="/download" class="font-semibold text-primary hover:underline" @click="emit('close')">
            {{ t('前往下载') }}
          </RouterLink>
        </p>
      </template>

      <div v-else class="flex flex-col items-center gap-4 py-2">
        <QrCode :value="url" />
        <div class="space-y-1 text-center text-xs text-muted-foreground">
          <p>{{ t('打开手机上的 Shadowrocket、Stash、Hiddify 等客户端，用其中的「扫码」功能扫描导入') }}</p>
          <p class="font-semibold text-warning">{{ t('请勿使用微信或系统相机扫码，会在浏览器中打开并泄露订阅链接') }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 rounded-xl border-2 border-dashed bg-muted/50 p-2 pl-3">
        <code class="flex-1 truncate font-mono text-xs">{{ url }}</code>
        <button class="sb-btn-dark sb-btn-sm" @click="copy"><Icon name="copy" :size="14" />{{ t('复制') }}</button>
      </div>
      <p class="flex items-start gap-1.5 text-xs text-warning">
        <Icon name="alert" :size="14" class="mt-px" />
        {{ t('订阅链接等同于账号凭证，请勿泄露给他人。') }}
      </p>
    </div>
  </Modal>
</template>
