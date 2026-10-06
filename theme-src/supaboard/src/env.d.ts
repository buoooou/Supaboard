/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

interface SupaboardSettings {
  title: string
  assets_path: string
  version: string
  description: string
  logo: string | null
  theme: {
    default_mode: 'light' | 'dark' | 'system'
    landing_url: string
    support_url: string
    download_url: string
  }
  i18n: string[]
}

interface Window {
  routerBase?: string
  settings: SupaboardSettings
  grecaptcha?: any
  turnstile?: any
}
