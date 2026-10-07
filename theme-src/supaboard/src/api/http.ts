import { clearToken, getToken } from '@/utils/storage'
import { currentLang, t } from '@/i18n'

export class ApiError extends Error {
  status: number
  body: any
  constructor(message: string, status: number, body?: any) {
    super(message)
    this.status = status
    this.body = body
  }
}

function apiBase(): string {
  const base = window.routerBase || '/'
  return (base.endsWith('/') ? base : base + '/') + 'api/v1'
}

type Params = Record<string, string | number | boolean | null | undefined>

export interface RequestOptions {
  force?: boolean
  ttl?: number
}

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

// 缓存与请求合并去重
interface CacheEntry<T> {
  data: T
  expireAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const inFlightRequests = new Map<string, Promise<any>>()

// 针对高频幂等只读接口设置默认内存缓存 TTL (毫秒)
const DEFAULT_TTLS: Record<string, number> = {
  '/guest/comm/config': 300_000,
  '/user/comm/config': 300_000,
  '/user/plan/fetch': 60_000,
  '/user/server/fetch': 30_000,
  '/user/notice/fetch': 60_000,
  '/user/knowledge/fetch': 120_000,
  '/user/getSubscribe': 15_000,
  '/user/info': 15_000,
  '/user/getStat': 15_000,
}

export function clearApiCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear()
    return
  }
  for (const k of memoryCache.keys()) {
    if (k.includes(urlPrefix)) memoryCache.delete(k)
  }
}

async function request<T = any>(
  method: 'GET' | 'POST',
  url: string,
  params?: Params,
  body?: unknown,
  force?: boolean,
): Promise<T> {
  const qs = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    }
  }
  if (force) qs.set('_t', String(Date.now()))
  const query = qs.toString()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Language': currentLang.value,
  }
  const token = getToken()
  if (token) headers.Authorization = token
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${apiBase()}${url}${query ? `?${query}` : ''}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(t('网络异常，请检查网络后重试'), 0)
  }

  let json: any = null
  const text = await res.text()
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    const message =
      (json && (json.message || (json.errors && Object.values(json.errors).flat()[0]))) ||
      t('请求失败（{s}）', { s: res.status })
    if ((res.status === 403 || res.status === 401) && url.startsWith('/user/')) {
      clearToken()
      clearApiCache()
      onUnauthorized?.()
    }
    throw new ApiError(String(message), res.status, json)
  }
  return json as T
}

export const http = {
  get: <T = any>(url: string, params?: Params, options?: RequestOptions): Promise<T> => {
    const qs = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
      }
    }
    const query = qs.toString()
    // 缓存键绑定语言与当前 Token 片段，彻底杜绝语言切换或账号切换时产生脏缓存
    const token = getToken()
    const tokenPart = token ? token.slice(-10) : 'anon'
    const cacheKey = `${currentLang.value}:${tokenPart}:${url}?${query}`

    // 1. 命中有效内存缓存
    if (!options?.force) {
      const cached = memoryCache.get(cacheKey)
      if (cached && cached.expireAt > Date.now()) {
        return Promise.resolve(cached.data)
      }
    }

    // 2. 并发合并去重
    if (!options?.force && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!
    }

    // 3. 执行网络请求并按需写入缓存
    const effectiveTtl = options?.ttl ?? DEFAULT_TTLS[url] ?? 0
    const p = request<T>('GET', url, params, undefined, options?.force)
      .then((data) => {
        if (effectiveTtl > 0) {
          memoryCache.set(cacheKey, { data, expireAt: Date.now() + effectiveTtl })
        }
        return data
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey)
      })

    inFlightRequests.set(cacheKey, p)
    return p
  },

  post: <T = any>(url: string, body?: unknown): Promise<T> => {
    // 变更操作自动清理相关缓存，保证状态绝对一致
    if (url.includes('/order/')) {
      clearApiCache('/user/order')
      clearApiCache('/user/getSubscribe')
      clearApiCache('/user/info')
      clearApiCache('/user/getStat')
    }
    if (url.includes('/ticket/')) clearApiCache('/user/ticket')
    if (url.includes('/user/update') || url.includes('/changePassword') || url.includes('/transfer')) {
      clearApiCache('/user/info')
      clearApiCache('/user/getStat')
    }
    if (url.includes('/passport/auth/login') || url.includes('/passport/auth/register')) {
      clearApiCache()
    }
    return request<T>('POST', url, undefined, body ?? {})
  },
}

/** 标准响应：{ status, message, data } */
export interface Envelope<T> {
  status?: string
  message?: string
  data: T
}
