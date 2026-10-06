<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { GuestConfig } from '@/api'
import { t } from '@/i18n'

/**
 * 人机验证，兼容后端 CaptchaService 支持的三种类型：
 * recaptcha(v2) -> recaptcha_data，recaptcha-v3 -> recaptcha_v3_token，turnstile -> turnstile_token
 */
const props = defineProps<{ config: GuestConfig }>()

const el = ref<HTMLElement | null>(null)
const token = ref('')
let widgetId: any = null

const loaded = new Map<string, Promise<void>>()
function loadScript(src: string): Promise<void> {
  if (loaded.has(src)) return loaded.get(src)!
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(t('人机验证加载失败，请刷新重试')))
    document.head.appendChild(s)
  })
  loaded.set(src, p)
  return p
}

function waitFor(check: () => boolean, timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const tick = () => {
      if (check()) return resolve()
      if (Date.now() - start > timeout) return reject(new Error(t('人机验证加载失败，请刷新重试')))
      setTimeout(tick, 100)
    }
    tick()
  })
}

const type = props.config.captcha_type

onMounted(async () => {
  if (!props.config.is_captcha) return
  try {
    if (type === 'turnstile' && props.config.turnstile_site_key) {
      await loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit')
      await waitFor(() => !!window.turnstile)
      widgetId = window.turnstile.render(el.value, {
        sitekey: props.config.turnstile_site_key,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        callback: (v: string) => (token.value = v),
        'expired-callback': () => (token.value = ''),
      })
    } else if (type === 'recaptcha' && props.config.recaptcha_site_key) {
      await loadScript('https://www.recaptcha.net/recaptcha/api.js?render=explicit')
      await waitFor(() => !!window.grecaptcha?.render)
      widgetId = window.grecaptcha.render(el.value, {
        sitekey: props.config.recaptcha_site_key,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        callback: (v: string) => (token.value = v),
        'expired-callback': () => (token.value = ''),
      })
    } else if (type === 'recaptcha-v3' && props.config.recaptcha_v3_site_key) {
      await loadScript(`https://www.recaptcha.net/recaptcha/api.js?render=${props.config.recaptcha_v3_site_key}`)
      await waitFor(() => !!window.grecaptcha?.execute)
    }
  } catch {
    /* 提交时会提示 */
  }
})

onBeforeUnmount(() => {
  try {
    if (widgetId !== null && type === 'turnstile') window.turnstile?.remove(widgetId)
  } catch {
    /* ignore */
  }
})

/** 返回需要附加到请求体里的字段；未完成验证时抛错 */
async function getPayload(action = 'submit'): Promise<Record<string, string>> {
  if (!props.config.is_captcha) return {}
  if (type === 'recaptcha-v3') {
    if (!window.grecaptcha?.execute) throw new Error(t('人机验证加载失败，请刷新重试'))
    const v: string = await new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(props.config.recaptcha_v3_site_key, { action }).then(resolve, reject)
      })
    })
    return { recaptcha_v3_token: v }
  }
  if (!token.value) throw new Error(t('请先完成人机验证'))
  return type === 'turnstile' ? { turnstile_token: token.value } : { recaptcha_data: token.value }
}

/** v2 / turnstile 的 token 只能用一次，每次请求后重置 */
function reset() {
  token.value = ''
  try {
    if (widgetId === null) return
    if (type === 'turnstile') window.turnstile?.reset(widgetId)
    else if (type === 'recaptcha') window.grecaptcha?.reset(widgetId)
  } catch {
    /* ignore */
  }
}

defineExpose({ getPayload, reset })
</script>

<template>
  <div v-if="config.is_captcha && type !== 'recaptcha-v3'" ref="el" class="flex min-h-[65px] justify-center" />
</template>
