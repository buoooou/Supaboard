<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import PageHeader from '@/components/PageHeader.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { userApi } from '@/api'
import { currencySymbol, loadSubscribe, loadUser, loadUserConfig, resetUserState, state } from '@/stores/app'
import { clearToken } from '@/utils/storage'
import { copyText, formatDate, money } from '@/utils/format'
import { confirm, showError, toast } from '@/utils/feedback'
import { t } from '@/i18n'

const router = useRouter()
const pwd = ref({ old: '', next: '', confirm: '' })
const savingPwd = ref(false)
const savingNotify = ref<string | null>(null)
const resetting = ref(false)
const botName = ref('')

onMounted(async () => {
  try {
    await Promise.all([loadUser(), loadUserConfig(), state.subscribe ? null : loadSubscribe()])
    if (state.userConfig?.is_telegram) {
      userApi.telegramBotInfo().then((r) => (botName.value = r.username)).catch(() => {})
    }
  } catch (e) {
    showError(e)
  }
})

async function changePassword() {
  const p = pwd.value
  if (!p.old || !p.next) return toast.warning(t('请填写完整'))
  if (p.next.length < 8) return toast.warning(t('密码长度至少 8 位'))
  if (p.next !== p.confirm) return toast.warning(t('两次输入的密码不一致'))
  savingPwd.value = true
  try {
    await userApi.changePassword(p.old, p.next)
    toast.success(t('密码已修改，其它设备上的登录已失效'))
    pwd.value = { old: '', next: '', confirm: '' }
  } catch (e) {
    showError(e)
  } finally {
    savingPwd.value = false
  }
}

async function toggle(key: 'remind_expire' | 'remind_traffic') {
  if (!state.user) return
  const next = state.user[key] ? 0 : 1
  savingNotify.value = key
  try {
    await userApi.update({ [key]: next })
    state.user[key] = next
    toast.success(t('已保存'))
  } catch (e) {
    showError(e)
  } finally {
    savingNotify.value = null
  }
}

async function resetSecurity() {
  const ok = await confirm({
    title: t('重置订阅信息'),
    content: t('重置后原订阅链接与 UUID 将立即失效，所有客户端需要重新导入订阅。适用于订阅链接泄露的情况。确定继续吗？'),
    danger: true,
    confirmText: t('确定重置'),
  })
  if (!ok) return
  resetting.value = true
  try {
    await userApi.resetSecurity()
    await loadSubscribe()
    toast.success(t('订阅信息已重置，请重新导入订阅'))
  } catch (e) {
    showError(e)
  } finally {
    resetting.value = false
  }
}

async function copyBind() {
  const cmd = `/bind ${state.subscribe?.subscribe_url || ''}`
  ;(await copyText(cmd)) ? toast.success(t('已复制')) : toast.error(t('复制失败，请手动复制'))
}

async function logout() {
  const ok = await confirm({ title: t('退出登录'), content: t('确定要退出当前账号吗？'), confirmText: t('退出') })
  if (!ok) return
  clearToken()
  resetUserState()
  router.replace('/login')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="t('个人中心')" :desc="t('管理账户安全、通知与订阅信息')" />

    <section class="sb-card flex flex-wrap items-center gap-5 p-6">
      <img v-if="state.user?.avatar_url" :src="state.user.avatar_url" alt="" class="h-16 w-16 rounded-2xl border-2" style="border-color: var(--ink)" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-heading text-xl">{{ state.user?.email }}</div>
        <div class="mt-1 text-xs text-muted-foreground">
          {{ t('注册于') }} {{ formatDate(state.user?.created_at) }}
          <template v-if="state.user?.last_login_at"> · {{ t('最近登录') }} {{ formatDate(state.user.last_login_at, true) }}</template>
        </div>
      </div>
      <div class="rounded-xl border-2 bg-muted/60 px-5 py-3 text-right" style="border-color: var(--ink)">
        <div class="text-xs text-muted-foreground">{{ t('账户余额') }}</div>
        <div class="font-heading text-2xl">{{ currencySymbol() }}{{ money(state.user?.balance) }}</div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 修改密码 -->
      <section class="sb-card p-6">
        <div class="flex items-center gap-3">
          <span class="sb-icon-tile bg-primary"><Icon name="lock" :size="18" /></span>
          <h3 class="text-lg">{{ t('修改密码') }}</h3>
        </div>
        <form class="mt-5 space-y-4" @submit.prevent="changePassword">
          <div>
            <label class="sb-label">{{ t('当前密码') }}</label>
            <PasswordInput v-model="pwd.old" :placeholder="t('当前密码')" />
          </div>
          <div>
            <label class="sb-label">{{ t('新密码') }}</label>
            <PasswordInput v-model="pwd.next" :placeholder="t('至少 8 位')" autocomplete="new-password" />
          </div>
          <div>
            <label class="sb-label">{{ t('确认新密码') }}</label>
            <PasswordInput v-model="pwd.confirm" :placeholder="t('再次输入新密码')" autocomplete="new-password" />
          </div>
          <button type="submit" class="sb-btn-primary" :disabled="savingPwd">
            <Icon v-if="savingPwd" name="loader" :size="14" />{{ t('保存') }}
          </button>
        </form>
      </section>

      <div class="space-y-6">
        <!-- 通知 -->
        <section class="sb-card p-6">
          <div class="flex items-center gap-3">
            <span class="sb-icon-tile bg-tertiary"><Icon name="bell" :size="18" /></span>
            <h3 class="text-lg">{{ t('邮件通知') }}</h3>
          </div>
          <div class="mt-5 space-y-4">
            <div
              v-for="item in [
                { key: 'remind_expire', title: '到期提醒', desc: '订阅即将到期时发送邮件提醒' },
                { key: 'remind_traffic', title: '流量提醒', desc: '流量即将用尽时发送邮件提醒' },
              ] as const"
              :key="item.key"
              class="flex items-center justify-between gap-4"
            >
              <div>
                <div class="text-sm font-semibold">{{ t(item.title) }}</div>
                <div class="text-xs text-muted-foreground">{{ t(item.desc) }}</div>
              </div>
              <button
                role="switch"
                :aria-checked="!!state.user?.[item.key]"
                class="relative h-7 w-12 shrink-0 rounded-full border-2 transition"
                :class="state.user?.[item.key] ? 'bg-primary' : 'bg-muted'"
                style="border-color: var(--ink)"
                :disabled="savingNotify === item.key"
                @click="toggle(item.key)"
              >
                <span
                  class="absolute top-0.5 h-5 w-5 rounded-full border-2 bg-white transition-all"
                  style="border-color: var(--ink)"
                  :class="state.user?.[item.key] ? 'left-[22px]' : 'left-0.5'"
                />
              </button>
            </div>
          </div>
        </section>

        <!-- Telegram -->
        <section v-if="state.userConfig?.is_telegram" class="sb-card p-6">
          <div class="flex items-center gap-3">
            <span class="sb-icon-tile bg-[#229ED9]"><Icon name="telegram" :size="18" /></span>
            <h3 class="text-lg">{{ t('绑定 Telegram') }}</h3>
            <span v-if="state.user?.telegram_id" class="sb-badge ml-auto bg-quaternary">{{ t('已绑定') }}</span>
          </div>
          <template v-if="!state.user?.telegram_id">
            <ol class="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                {{ t('在 Telegram 中搜索并打开机器人') }}
                <a v-if="botName" :href="`https://t.me/${botName}`" target="_blank" rel="noopener" class="font-semibold text-primary hover:underline">@{{ botName }}</a>
              </li>
              <li>{{ t('向机器人发送以下命令完成绑定：') }}</li>
            </ol>
            <div class="mt-3 flex items-center gap-2 rounded-xl border-2 border-dashed bg-muted/50 p-2 pl-3">
              <code class="flex-1 truncate font-mono text-xs">/bind {{ state.subscribe?.subscribe_url }}</code>
              <button class="sb-btn-dark sb-btn-sm" @click="copyBind"><Icon name="copy" :size="14" />{{ t('复制') }}</button>
            </div>
          </template>
          <a
            v-if="state.userConfig?.telegram_discuss_link"
            :href="state.userConfig.telegram_discuss_link"
            target="_blank"
            rel="noopener"
            class="sb-btn-outline sb-btn-sm mt-4"
          >
            <Icon name="users" :size="14" />{{ t('加入 Telegram 讨论群') }}
          </a>
        </section>
      </div>
    </div>

    <!-- 危险操作 -->
    <section class="sb-card border-destructive p-6" style="border-color: hsl(var(--destructive))">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <span class="sb-icon-tile bg-destructive"><Icon name="key" :size="18" /></span>
          <div>
            <h3 class="text-lg">{{ t('重置订阅信息') }}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{{ t('当订阅链接或 UUID 泄露时使用，重置后需要在所有客户端重新导入订阅。') }}</p>
          </div>
        </div>
        <button class="sb-btn-danger" :disabled="resetting" @click="resetSecurity">
          <Icon :name="resetting ? 'loader' : 'refresh'" :size="16" />{{ t('重置') }}
        </button>
      </div>
    </section>

    <button class="sb-btn-outline w-full sm:w-auto" @click="logout"><Icon name="logout" :size="16" />{{ t('退出登录') }}</button>
  </div>
</template>
