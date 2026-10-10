<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import EmailInput from '@/components/EmailInput.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import Captcha from '@/components/Captcha.vue'
import { passportApi } from '@/api'
import { loadGuestConfig, state } from '@/stores/app'
import { setToken } from '@/utils/storage'
import { showError, toast } from '@/utils/feedback'
import { useCountdown } from '@/utils/countdown'
import { routeHref } from '@/utils/routing'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()

const form = ref({
  email: '',
  email_code: '',
  password: '',
  password2: '',
  invite_code: typeof route.query.code === 'string' ? route.query.code : '',
})
const agree = ref(false)
const loading = ref(false)
const sending = ref(false)
const captcha = ref<InstanceType<typeof Captcha> | null>(null)
const { left, start } = useCountdown(60)
const cfg = computed(() => state.guestConfig)
const inviteLocked = !!form.value.invite_code

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
  if (!f.email) return toast.warning(t('请输入邮箱'))
  if (f.password.length < 8) return toast.warning(t('密码长度至少 8 位'))
  if (f.password !== f.password2) return toast.warning(t('两次输入的密码不一致'))
  if (cfg.value?.is_invite_force && !f.invite_code) return toast.warning(t('请输入邀请码'))
  if (cfg.value?.tos_url && !agree.value) return toast.warning(t('请先阅读并同意服务条款'))
  loading.value = true
  try {
    const extra = (await captcha.value?.getPayload('register')) || {}
    const res = await passportApi.register({
      email: f.email,
      password: f.password,
      invite_code: f.invite_code || undefined,
      email_code: f.email_code || undefined,
      ...extra,
    })
    setToken(res.auth_data)
    toast.success(t('注册成功'))
    router.replace('/dashboard')
  } catch (e) {
    showError(e)
  } finally {
    captcha.value?.reset()
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl">{{ t('注册') }}</h2>
    <p class="mt-2 text-sm text-muted-foreground">{{ t('创建账号，几分钟即可开始使用') }}</p>

    <div v-if="!cfg" class="py-12 text-center text-muted-foreground"><Icon name="loader" :size="26" class="mx-auto text-primary" /></div>

    <form v-else class="mt-7 space-y-4" @submit.prevent="submit">
      <div>
        <label class="sb-label">{{ t('邮箱') }}</label>
        <EmailInput v-model="form.email" :suffixes="cfg.email_whitelist_suffix" />
      </div>
      <div v-if="cfg.is_email_verify">
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
        <label class="sb-label">{{ t('密码') }}</label>
        <PasswordInput v-model="form.password" :placeholder="t('至少 8 位')" autocomplete="new-password" />
      </div>
      <div>
        <label class="sb-label">{{ t('确认密码') }}</label>
        <PasswordInput v-model="form.password2" :placeholder="t('再次输入密码')" autocomplete="new-password" />
      </div>
      <div>
        <label class="sb-label">
          {{ t('邀请码') }}
          <span v-if="!cfg.is_invite_force" class="font-normal text-muted-foreground">（{{ t('选填') }}）</span>
        </label>
        <input v-model.trim="form.invite_code" class="sb-input" :placeholder="t('邀请码')" :disabled="inviteLocked" />
      </div>

      <Captcha ref="captcha" :config="cfg" />

      <label class="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
        <input v-model="agree" type="checkbox" class="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
        <span>
          {{ t('我已阅读并同意') }}
          <a :href="cfg.tos_url || routeHref('/terms')" target="_blank" rel="noopener" class="font-semibold text-primary hover:underline">{{ t('服务条款') }}</a>
        </span>
      </label>

      <button type="submit" class="sb-btn-primary sb-btn-lg w-full" :disabled="loading">
        <Icon v-if="loading" name="loader" :size="16" />
        {{ t('注册') }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-muted-foreground">
      {{ t('已有账号？') }}
      <RouterLink to="/login" class="font-semibold text-primary hover:underline">{{ t('立即登录') }}</RouterLink>
    </p>
  </div>
</template>
