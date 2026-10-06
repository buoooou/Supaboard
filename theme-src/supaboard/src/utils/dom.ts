import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function onClickOutside(target: Ref<HTMLElement | null>, handler: () => void) {
  const listener = (e: Event) => {
    const el = target.value
    if (el && !el.contains(e.target as Node)) handler()
  }
  onMounted(() => document.addEventListener('pointerdown', listener))
  onBeforeUnmount(() => document.removeEventListener('pointerdown', listener))
}
