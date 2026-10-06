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

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

async function request<T = any>(method: 'GET' | 'POST', url: string, params?: Params, body?: unknown): Promise<T> {
  const qs = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    }
  }
  if (method === 'GET') qs.set('t', String(Date.now()))
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
      onUnauthorized?.()
    }
    throw new ApiError(String(message), res.status, json)
  }
  return json as T
}

export const http = {
  get: <T = any>(url: string, params?: Params) => request<T>('GET', url, params),
  post: <T = any>(url: string, body?: unknown) => request<T>('POST', url, undefined, body ?? {}),
}

/** 标准响应：{ status, message, data } */
export interface Envelope<T> {
  status?: string
  message?: string
  data: T
}
