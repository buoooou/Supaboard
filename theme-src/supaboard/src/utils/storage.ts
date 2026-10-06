/**
 * 与旧版 Xboard 主题共用登录态：
 * 旧主题（Vue_Naive_ 前缀）把 token 存在 localStorage["VUE_NAIVE_ACCESS_TOKEN"]，
 * 格式为 {"value":"Bearer xxx","time":..., "expire":...}。
 * 这里沿用同一个 key 与格式，切换主题后用户无需重新登录，切回旧主题也一样。
 */
const TOKEN_KEY = 'VUE_NAIVE_ACCESS_TOKEN'
const ONE_YEAR = 365 * 24 * 3600 * 1000

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function getToken(): string | null {
  const raw = safeGet(TOKEN_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    // 旧主题本地只缓存 6 小时，但服务端 token 有效期为 1 年，这里不做本地过期判断，交由接口校验
    return typeof parsed?.value === 'string' && parsed.value ? parsed.value : null
  } catch {
    return raw.startsWith('Bearer ') ? raw : null
  }
}

export function setToken(authData: string) {
  const now = Date.now()
  safeSet(TOKEN_KEY, JSON.stringify({ value: authData, time: now, expire: now + ONE_YEAR }))
}

export function clearToken() {
  safeRemove(TOKEN_KEY)
}

export const prefs = {
  get: (key: string) => safeGet(`SUPABOARD_${key}`),
  set: (key: string, value: string) => safeSet(`SUPABOARD_${key}`, value),
}
