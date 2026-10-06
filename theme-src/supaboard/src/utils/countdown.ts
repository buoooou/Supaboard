import { onBeforeUnmount, ref } from 'vue'

export function useCountdown(seconds = 60) {
  const left = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  function start() {
    left.value = seconds
    timer && clearInterval(timer)
    timer = setInterval(() => {
      left.value--
      if (left.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }
  onBeforeUnmount(() => timer && clearInterval(timer))
  return { left, start }
}
