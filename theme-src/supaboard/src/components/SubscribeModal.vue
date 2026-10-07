<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import Modal from './Modal.vue'
import Icon from './Icon.vue'
const QrCode = defineAsyncComponent(() => import('./QrCode.vue'))
import { appTitle, settings } from '@/stores/app'
import { copyText, detectPlatform } from '@/utils/format'
import { toast } from '@/utils/feedback'
import { t } from '@/i18n'

const props = defineProps<{ open: boolean; url: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

type Platform = 'windows' | 'mac' | 'ios' | 'android' | 'unknown'
const platform = ref<Platform>(detectPlatform())
const tab = ref<'import' | 'qr'>('import')

/** 协议筛选：通过订阅链接的 types 参数实现，与旧主题一致 */
const TYPES = [
  { label: '全部', value: 'all' },
  { label: 'AnyTLS', value: 'anytls' },
  { label: 'VLESS', value: 'vless' },
  { label: 'Hy1', value: 'hysteria' },
  { label: 'Hy2', value: 'hysteria2' },
  { label: 'Shadowsocks', value: 'shadowsocks' },
  { label: 'VMess', value: 'vmess' },
  { label: 'Trojan', value: 'trojan' },
]
const selected = ref<string[]>(['all'])

function toggleType(v: string) {
  if (v === 'all') return (selected.value = ['all'])
  const rest = selected.value.filter((x) => x !== 'all')
  selected.value = rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v]
  if (!selected.value.length) selected.value = ['all']
}

const finalUrl = computed(() => {
  if (!props.url) return ''
  const s = selected.value
  if (s.includes('all')) return props.url
  try {
    const u = new URL(props.url)
    u.searchParams.set('types', s.join(','))
    return u.toString()
  } catch {
    return props.url
  }
})

watch(
  () => props.open,
  (v) => {
    if (v) {
      tab.value = 'import'
      selected.value = ['all']
    }
  },
)

const clients = computed(() => {
  const url = finalUrl.value
  if (!url) return []
  const enc = encodeURIComponent(url)
  const name = encodeURIComponent(appTitle)
  const b64 = btoa(unescape(encodeURIComponent(url))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const qx = encodeURIComponent(JSON.stringify({ server_remote: [`${url}, tag=${appTitle}`] }))
  const list: { name: string; color: string; platforms: Platform[]; href: string }[] = [
    { name: 'Clash', color: 'bg-[#2d6cdf]', platforms: ['windows'], href: `clash://install-config?url=${enc}&name=${name}` },
    { name: 'Clash Meta', color: 'bg-[#2d6cdf]', platforms: ['mac', 'android'], href: `clash://install-config?url=${enc}&name=${name}` },
    { name: 'Hiddify', color: 'bg-[#1f9d8f]', platforms: ['windows', 'mac', 'android', 'ios'], href: `hiddify://import/${url}#${name}` },
    { name: 'sing-box', color: 'bg-[#334155]', platforms: ['android', 'mac', 'ios'], href: `sing-box://import-remote-profile?url=${enc}#${name}` },
    { name: 'Shadowrocket', color: 'bg-[#1e88e5]', platforms: ['mac', 'ios'], href: `shadowrocket://add/sub://${b64}?remark=${name}` },
    { name: 'Quantumult X', color: 'bg-[#111827]', platforms: ['mac', 'ios'], href: `quantumult-x:///update-configuration?remote-resource=${qx}` },
    { name: 'Surge', color: 'bg-[#f97316]', platforms: ['mac', 'ios'], href: `surge:///install-config?url=${enc}&name=${name}` },
    { name: 'Stash', color: 'bg-[#6366f1]', platforms: ['mac', 'ios'], href: `stash://install-config?url=${enc}&name=${name}` },
    { name: 'Surfboard', color: 'bg-[#0ea5e9]', platforms: ['android'], href: `surfboard:///install-config?url=${enc}&name=${name}` },
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
  ;(await copyText(finalUrl.value)) ? toast.success(t('订阅链接已复制')) : toast.error(t('复制失败，请手动复制'))
}
</script>

<template>
  <Modal :open="open" :title="t('一键订阅')" width="max-w-xl" @close="emit('close')">
    <div class="space-y-5">
      <div class="flex gap-2 rounded-full border-2 bg-muted p-1" style="border-color: var(--ink)">
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

      <div>
        <div class="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Icon name="filter" :size="14" /> {{ t('节点协议') }}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="ty in TYPES"
            :key="ty.value"
            class="rounded-full border-2 px-3 py-1 text-xs font-semibold transition"
            :class="selected.includes(ty.value) ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'"
            style="border-color: var(--ink)"
            @click="toggleType(ty.value)"
          >
            {{ t(ty.label) }}
          </button>
        </div>
      </div>

      <template v-if="tab === 'import'">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in platforms"
            :key="p.value"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition"
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
          <a
            v-if="settings.theme?.download_url"
            :href="settings.theme.download_url"
            target="_blank"
            rel="noopener"
            class="font-semibold text-primary hover:underline"
          >{{ t('前往下载') }}</a>
          <RouterLink v-else to="/knowledge" class="font-semibold text-primary hover:underline" @click="emit('close')">
            {{ t('查看使用文档') }}
          </RouterLink>
        </p>
      </template>

      <div v-else class="flex flex-col items-center gap-4 py-2">
        <QrCode :value="finalUrl" />
        <p class="text-center text-xs text-muted-foreground">{{ t('使用支持扫码的客户端（如 Shadowrocket）扫描二维码导入订阅') }}</p>
      </div>

      <div class="flex items-center gap-2 rounded-xl border-2 border-dashed bg-muted/50 p-2 pl-3">
        <code class="flex-1 truncate font-mono text-xs">{{ finalUrl }}</code>
        <button class="sb-btn-dark sb-btn-sm" @click="copy"><Icon name="copy" :size="14" />{{ t('复制') }}</button>
      </div>
      <p class="flex items-start gap-1.5 text-xs text-warning">
        <Icon name="alert" :size="14" class="mt-px" />
        {{ t('订阅链接等同于账号凭证，请勿泄露给他人。') }}
      </p>
    </div>
  </Modal>
</template>
