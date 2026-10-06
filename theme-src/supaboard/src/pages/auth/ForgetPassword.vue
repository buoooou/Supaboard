<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import EmailInput from '@/components/EmailInput.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import Captcha from '@/components/Captcha.vue'
import { passportApi } from '@/api'
import { loadGuestConfig, state } from '@/stores/app'
import { showError, toast } from '@/utils/feedback'
import { useCountdown } from '@/utils/countdown'
import { t } from '@/i18n'

const router = useRouter()
const form = ref({ email: '', email_code: '', password: '', password2: '' })
const loading = ref(false)
const sending = ref(false)
const captcha = ref<InstanceType<typeof Captcha> | null>(null)
const { left, start } = useCountdown(60)

onMounted(() => loadGuestConfig().catch(showError))

async function sendCode() {
  if (!form.value.email) return toast.warning(t('请输入邮箱'))
  sending.value = true
  try {
    const extra = (await captcha.value?.getPayload('send_email')) || {}
    await passportApi.sendEmailVerify({ email: form.value.email, ...extra })
    toast.success(t('验证码已发送，请查收邮件'))
    start()
  } catch (e) {
    showError(e)
  } finally {
    captcha.value?.reset()
    sending.value = false
  }
}

async function submit() {
  const f = form.value
  if (!f.email || !f.email_code) return toast.warning(t('请输入邮箱和验证码'))
  if (f.password.length < 8) return toast.warning(t('密码长度至少 8 位'))
  if (f.password !== f.password2) return toast.warning(t('两次输入的密码不一致'))
  loading.value = true
  try {
    await passportApi.forget({ email: f.email, email_code: f.email_code, password: f.password })
    toast.success(t('密码已重置，请使用新密码登录'))
    router.replace('/login')
  } catch (e) {
    showError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl">{{ t('重置密码') }}</h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ t('通过邮箱验证码设置新密码') }}</p>

    <form class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="sb-label">{{ t('邮箱') }}</label>
        <EmailInput v-model="form.email" :suffixes="state.guestConfig?.email_whitelist_suffix" />
      </div>
      <div>
        <label class="sb-label">{{ t('邮箱验证码') }}</label>
        <div class="flex gap-2">
          <input v-model.trim="form.email_code" class="sb-input flex-1" :placeholder="t('邮箱验证码')" inputmode="numeric" />
          <button type="button" class="sb-btn-outline shrink-0" :disabled="sending || left > 0" @click="sendCode">
            <Icon v-if="sending" name="loader" :size="14" />
            {{ left > 0 ? t('{n} 秒后重发', { n: left }) : t('发送验证码') }}
          </button>
        </div>
      </div>
      <div>
        <label class="sb-label">{{ t('新密码') }}</label>
        <PasswordInput v-model="form.password" :placeholder="t('至少 8 位')" autocomplete="new-password" />
      </div>
      <div>
        <label class="sb-label">{{ t('确认密码') }}</label>
        <PasswordInput v-model="form.password2" :placeholder="t('再次输入密码')" autocomplete="new-password" />
      </div>

      <Captcha v-if="state.guestConfig" ref="captcha" :config="state.guestConfig" />

      <button type="submit" class="sb-btn-primary sb-btn-lg w-full" :disabled="loading">
        <Icon v-if="loading" name="loader" :size="16" />
        {{ t('重置密码') }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      <RouterLink to="/login" class="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
        <Icon name="arrow-left" :size="14" /> {{ t('返回登录') }}
      </RouterLink>
    </p>
  </div>
</template>
