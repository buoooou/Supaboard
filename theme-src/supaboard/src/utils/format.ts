import { t } from '@/i18n'

export function formatBytes(bytes: number | null | undefined, digits = 2): string {
  const n = Number(bytes) || 0
  if (n <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1)
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : digits)} ${units[i]}`
}

/** 金额：后端以“分”为单位 */
export function money(cents: number | null | undefined): string {
  const n = Number(cents) || 0
  return (n / 100).toFixed(2)
}

export function formatDate(ts: number | null | undefined, withTime = false): string {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  const pad = (x: number) => String(x).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date
}

export function formatDateTime(ts: number | null | undefined, withSeconds = true): string {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  const pad = (x: number) => String(x).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const time = withSeconds
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${date} ${time}`
}

export function daysLeft(ts: number | null | undefined): number | null {
  if (!ts) return null
  return Math.ceil((ts * 1000 - Date.now()) / 86400000)
}

/** 与后端 Plan::LEGACY_PERIOD_MAPPING 保持一致 */
export const PERIODS = [
  'month_price',
  'quarter_price',
  'half_year_price',
  'year_price',
  'two_year_price',
  'three_year_price',
  'onetime_price',
  'reset_price',
] as const
export type PeriodKey = (typeof PERIODS)[number]

export function periodLabel(p: string): string {
  const map: Record<string, string> = {
    month_price: t('月付'),
    quarter_price: t('季付'),
    half_year_price: t('半年付'),
    year_price: t('年付'),
    two_year_price: t('两年付'),
    three_year_price: t('三年付'),
    onetime_price: t('一次性'),
    reset_price: t('流量重置包'),
  }
  return map[p] ?? p
}

/** 每期折合月数，用于展示“折合每月” */
export const PERIOD_MONTHS: Record<string, number> = {
  month_price: 1,
  quarter_price: 3,
  half_year_price: 6,
  year_price: 12,
  two_year_price: 24,
  three_year_price: 36,
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }
}

export function detectPlatform(): 'windows' | 'mac' | 'ios' | 'android' | 'unknown' {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('windows')) return 'windows'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios'
  if (ua.includes('android')) return 'android'
  if (ua.includes('macintosh')) {
    // iPadOS 13+ 伪装为 Mac
    return navigator.maxTouchPoints > 1 ? 'ios' : 'mac'
  }
  return 'unknown'
}
