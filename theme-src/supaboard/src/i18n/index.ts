import { ref } from 'vue'

/**
 * 轻量 i18n：文案直接以简体中文为 key，zh-CN 原样快速返回，其它语言按需异步加载字典。
 * 用法：t('剩余 {n} 天', { n: 3 })
 */
export const LANGS = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en-US', label: 'English' },
] as const

const dictionaries: Record<string, Record<string, string>> = {}

const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  'en-US': () => import('./en-US'),
  'zh-TW': () => import('./zh-TW'),
}

export async function loadLang(code: string): Promise<void> {
  if (code === 'zh-CN' || dictionaries[code]) return
  const loader = loaders[code]
  if (loader) {
    try {
      const mod = await loader()
      dictionaries[code] = mod.default
    } catch {
      /* ignore */
    }
  }
}

const LANG_KEY = 'SUPABOARD_LANG'

function detect(): string {
  // 预渲染固定输出简体中文
  if (import.meta.env.SSR) return 'zh-CN'
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved && LANGS.some((l) => l.code === saved)) return saved
  } catch {
    /* ignore */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language || 'zh-CN' : 'zh-CN').toLowerCase()
  if (nav.startsWith('zh')) {
    return nav.includes('tw') || nav.includes('hk') || nav.includes('hant') ? 'zh-TW' : 'zh-CN'
  }
  return nav.startsWith('en') ? 'en-US' : 'zh-CN'
}

const initialLang = detect()
export const currentLang = ref(initialLang)
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang.value
}

/** 非简体中文首屏等字典就绪再挂载，避免先渲染中文再整页重渲染一次 */
export const i18nReady: Promise<void> = loadLang(initialLang)

export async function setLang(code: string): Promise<void> {
  if (code !== 'zh-CN' && !dictionaries[code]) {
    await loadLang(code)
  }
  currentLang.value = code
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code
  }
  try {
    localStorage.setItem(LANG_KEY, code)
  } catch {
    /* ignore */
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  // 简体中文直通分支，零字典开销与极致渲染性能
  if (currentLang.value === 'zh-CN') {
    if (!params) return key
    let text = key
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v))
    }
    return text
  }

  const dict = dictionaries[currentLang.value]
  let text = (dict && dict[key]) || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v))
    }
  }
  return text
}
