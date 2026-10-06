import { t } from '@/i18n'

export const ORDER_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: '待支付', cls: 'bg-warning' },
  1: { label: '开通中', cls: 'bg-tertiary text-white' },
  2: { label: '已取消', cls: 'bg-muted text-muted-foreground' },
  3: { label: '已完成', cls: 'bg-quaternary' },
  4: { label: '已折抵', cls: 'bg-muted text-muted-foreground' },
}

export const ORDER_TYPE: Record<number, string> = {
  1: '新购',
  2: '续费',
  3: '升级',
  4: '流量重置',
}

export function statusLabel(s: number) {
  return t(ORDER_STATUS[s]?.label ?? String(s))
}
export function statusClass(s: number) {
  return ORDER_STATUS[s]?.cls ?? 'bg-muted'
}
export function typeLabel(ty: number) {
  return t(ORDER_TYPE[ty] ?? String(ty))
}
