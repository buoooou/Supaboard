import { reactive, ref } from 'vue'
import { guestApi, userApi, type GuestConfig, type Subscribe, type UserConfig, type UserInfo } from '@/api'
import { clearApiCache } from '@/api/http'
import { prefs } from '@/utils/storage'

export const settings: SupaboardSettings = window.settings || {
  title: 'Supaboard',
  assets_path: '',
  version: '',
  description: '',
  logo: null,
  theme: { default_mode: 'light', landing_url: '', support_url: '', download_url: '' },
  i18n: ['zh-CN'],
}

export const appTitle = settings.title || 'Supaboard'

export const state = reactive<{
  guestConfig: GuestConfig | null
  userConfig: UserConfig | null
  user: UserInfo | null
  subscribe: Subscribe | null
}>({
  guestConfig: null,
  userConfig: null,
  user: null,
  subscribe: null,
})

export function loadGuestConfig(force = false) {
  return guestApi.config(force).then((c) => {
    state.guestConfig = c
    return c
  })
}

export function loadUserConfig(force = false) {
  return userApi.config(force).then((c) => {
    state.userConfig = c
    return c
  })
}

export function loadUser(force = false) {
  return userApi.info(force).then((u) => {
    state.user = u
    return u
  })
}

export function loadSubscribe(force = false) {
  return userApi.getSubscribe(force).then((s) => {
    state.subscribe = s
    return s
  })
}

export function resetUserState() {
  state.user = null
  state.subscribe = null
  state.userConfig = null
  clearApiCache()
}

export function currencySymbol() {
  return state.userConfig?.currency_symbol || '¥'
}

/* ---------- 深浅色 ---------- */
type Mode = 'light' | 'dark' | 'system'
export const colorMode = ref<Mode>((prefs.get('COLOR_MODE') as Mode) || settings.theme?.default_mode || 'light')

export function applyColorMode() {
  const dark =
    colorMode.value === 'dark' ||
    (colorMode.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function toggleDark() {
  const isDark = document.documentElement.classList.contains('dark')
  colorMode.value = isDark ? 'light' : 'dark'
  prefs.set('COLOR_MODE', colorMode.value)
  applyColorMode()
}
