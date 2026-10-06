import { t } from '@/i18n'

export const LEVELS = [
  { value: 0, label: '低', cls: 'bg-muted' },
  { value: 1, label: '中', cls: 'bg-warning' },
  { value: 2, label: '高', cls: 'bg-destructive text-white' },
]
export const levelLabel = (v: number) => t(LEVELS.find((l) => l.value === v)?.label ?? '-')
export const levelClass = (v: number) => LEVELS.find((l) => l.value === v)?.cls ?? 'bg-muted'

/** status: 0 开启 / 1 关闭；reply_status: 0 待回复 / 1 已回复 */
export function ticketState(status: number, reply: number) {
  if (status === 1) return { label: t('已关闭'), cls: 'bg-muted text-muted-foreground' }
  return reply === 1 ? { label: t('已回复'), cls: 'bg-quaternary' } : { label: t('待回复'), cls: 'bg-warning' }
}
