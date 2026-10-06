import { ref } from 'vue'
import enUS from './en-US'
import zhTW from './zh-TW'

/**
 * 轻量 i18n：文案直接以简体中文为 key，zh-CN 原样返回，其它语言查字典，缺失时回退到中文。
 * 用法：t('剩余 {n} 天', { n: 3 })
 */
export const LANGS = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en-US', label: 'English' },
] as const

const dictionaries: Record<string, Record<string, string>> = {
  'en-US': enUS,
  'zh-TW': zhTW,
}

const LANG_KEY = 'SUPABOARD_LANG'

function detect(): string {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && LANGS.some((l) => l.code === saved)) return saved
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || 'zh-CN').toLowerCase()
  if (nav.startsWith('zh')) {
    return nav.includes('tw') || nav.includes('hk') || nav.includes('hant') ? 'zh-TW' : 'zh-CN'
  }
  return nav.startsWith('en') ? 'en-US' : 'zh-CN'
}

export const currentLang = ref(detect())
document.documentElement.lang = currentLang.value

export function setLang(code: string) {
  currentLang.value = code
  document.documentElement.lang = code
  try {
    localStorage.setItem(LANG_KEY, code)
  } catch {
    /* ignore */
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[currentLang.value]
  let text = (dict && dict[key]) || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v))
    }
  }
  return text
}
