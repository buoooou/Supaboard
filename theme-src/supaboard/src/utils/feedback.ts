import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let seq = 0
export const toastState = reactive<{ items: ToastItem[] }>({ items: [] })

function push(type: ToastType, message: string, duration = 3000) {
  const id = ++seq
  toastState.items.push({ id, type, message })
  setTimeout(() => {
    const i = toastState.items.findIndex((x) => x.id === id)
    if (i >= 0) toastState.items.splice(i, 1)
  }, duration)
}

export const toast = {
  success: (m: string) => push('success', m),
  error: (m: string) => push('error', m, 4500),
  info: (m: string) => push('info', m),
  warning: (m: string) => push('warning', m, 4000),
}

/** 统一处理接口错误提示 */
export function showError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  toast.error(msg)
}

interface ConfirmOptions {
  title: string
  content?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export const confirmState = reactive<{
  open: boolean
  options: ConfirmOptions
  resolve: ((v: boolean) => void) | null
}>({ open: false, options: { title: '' }, resolve: null })

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    confirmState.options = options
    confirmState.resolve = resolve
    confirmState.open = true
  })
}

export function settleConfirm(v: boolean) {
  confirmState.open = false
  confirmState.resolve?.(v)
  confirmState.resolve = null
}
