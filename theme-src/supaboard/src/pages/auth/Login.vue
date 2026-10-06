<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import EmailInput from '@/components/EmailInput.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { passportApi } from '@/api'
import { loadGuestConfig, state } from '@/stores/app'
import { setToken } from '@/utils/storage'
import { showError, toast } from '@/utils/feedback'
import { normalizeRedirect } from '@/router'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const verifying = ref(false)

function done(authData: string) {
  setToken(authData)
  router.replace(normalizeRedirect(route.query.redirect))
}

onMounted(async () => {
  loadGuestConfig().catch(() => {})
  // 邮件链接登录 / 客户端快捷登录：/#/login?verify=xxx&redirect=dashboard
  const verify = route.query.verify
  if (typeof verify === 'string' && verify) {
    verifying.value = true
    try {
      const res = await passportApi.token2Login(verify)
      if (res?.auth_data) return done(res.auth_data)
      toast.error(t('登录链接无效或已过期'))
    } catch (e) {
      showError(e)
    } finally {
      verifying.value = false
    }
  }
})

async function submit() {
  if (!email.value || !password.value) return toast.warning(t('请输入邮箱和密码'))
  loading.value = true
  try {
    const res = await passportApi.login({ email: email.value, password: password.value })
    done(res.auth_data)
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl">{{ t('登录') }}</h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ t('欢迎回来，登录以管理你的订阅') }}</p>

    <div v-if="verifying" class="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
      <Icon name="loader" :size="28" class="text-primary" />
      {{ t('正在验证登录链接…') }}
    </div>

    <form v-else class="mt-7 space-y-5" @submit.prevent="submit">
      <div>
        <label class="sb-label">{{ t('邮箱') }}</label>
        <EmailInput v-model="email" :suffixes="state.guestConfig?.email_whitelist_suffix" />
      </div>
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label class="sb-label mb-0">{{ t('密码') }}</label>
          <RouterLink to="/forgetpassword" class="text-xs font-medium text-primary hover:underline">
            {{ t('忘记密码？') }}
          </RouterLink>
        </div>
        <PasswordInput v-model="password" :placeholder="t('密码')" />
      </div>
      <button type="submit" class="sb-btn-primary sb-btn-lg w-full" :disabled="loading">
        <Icon v-if="loading" name="loader" :size="16" />
        {{ t('登录') }}
      </button>
    </form>

    <p v-if="!verifying" class="mt-6 text-center text-sm text-muted-foreground">
      {{ t('还没有账号？') }}
      <RouterLink :to="{ path: '/register', query: route.query.code ? { code: route.query.code } : {} }" class="font-semibold text-primary hover:underline">
        {{ t('立即注册') }}
      </RouterLink>
    </p>
  </div>
</template>
