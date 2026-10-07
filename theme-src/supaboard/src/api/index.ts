import { http, clearApiCache, type Envelope } from './http'

/* ---------- 类型（字段与后端 V1 接口一一对应） ---------- */

export interface GuestConfig {
  tos_url: string | null
  is_email_verify: 0 | 1
  is_invite_force: 0 | 1
  email_whitelist_suffix: string[] | 0
  is_captcha: 0 | 1
  captcha_type: 'recaptcha' | 'recaptcha-v3' | 'turnstile'
  recaptcha_site_key: string | null
  recaptcha_v3_site_key: string | null
  turnstile_site_key: string | null
  app_description: string | null
  app_url: string | null
  logo: string | null
}

export interface UserConfig {
  is_telegram: number
  telegram_discuss_link: string | null
  withdraw_methods: string[]
  withdraw_close: number
  currency: string
  currency_symbol: string
  commission_distribution_enable: number
  commission_distribution_l1: string | null
  commission_distribution_l2: string | null
  commission_distribution_l3: string | null
}

export interface AuthData {
  token: string
  auth_data: string
  is_admin?: boolean
}

export interface UserInfo {
  email: string
  transfer_enable: number
  last_login_at: number | null
  created_at: number
  banned: number
  remind_expire: number
  remind_traffic: number
  expired_at: number | null
  balance: number
  commission_balance: number
  plan_id: number | null
  discount: number | null
  commission_rate: number | null
  telegram_id: number | null
  uuid: string
  avatar_url: string
}

export interface Plan {
  id: number
  group_id: number
  name: string
  tags: string[] | null
  content: string
  month_price: number | null
  quarter_price: number | null
  half_year_price: number | null
  year_price: number | null
  two_year_price: number | null
  three_year_price: number | null
  onetime_price: number | null
  reset_price: number | null
  capacity_limit: number | string | null
  transfer_enable: number
  speed_limit: number | null
  device_limit: number | null
  show: boolean
  sell: boolean
  renew: boolean
  reset_traffic_method: number | null
  sort: number
}

export interface Subscribe {
  plan_id: number | null
  token: string
  expired_at: number | null
  u: number
  d: number
  transfer_enable: number
  email: string
  uuid: string
  device_limit: number | null
  speed_limit: number | null
  next_reset_at: number | null
  plan?: Plan & { prices?: Record<string, number | null> }
  subscribe_url: string
  reset_day: number | null
}

export interface Notice {
  id: number
  title: string
  content: string
  img_url: string | null
  tags: string[] | null
  created_at: number
  updated_at: number
}

export interface PaymentMethod {
  id: number
  name: string
  payment: string
  icon: string | null
  handling_fee_fixed: number | null
  handling_fee_percent: number | null
}

export interface Order {
  id: number
  trade_no: string
  plan_id: number
  period: string
  type: number
  status: number
  total_amount: number
  handling_amount: number | null
  balance_amount: number | null
  discount_amount: number | null
  surplus_amount: number | null
  refund_amount: number | null
  coupon_id: number | null
  payment_id: number | null
  created_at: number
  updated_at: number
  paid_at?: number | null
  plan?: Plan
  payment?: { id: number; name: string; payment: string; icon: string | null } | null
  try_out_plan_id?: number
  surplus_orders?: Order[]
}

export interface CheckoutResult {
  type: -1 | 0 | 1 | number
  data: any
}

export interface Coupon {
  id: number
  name: string
  code: string
  type: 1 | 2
  value: number
  limit_plan_ids: string[] | null
  limit_period: string[] | null
}

export interface ServerNode {
  id: number
  type: string
  version: string | null
  name: string
  rate: string | number
  tags: string[] | null
  is_online: number | boolean
  cache_key: string
  last_check_at: number | null
}

export interface TicketMessage {
  id: number
  ticket_id: number
  is_me: boolean
  message: string
  created_at: number
  updated_at: number
}

export interface Ticket {
  id: number
  level: number
  reply_status: number
  status: number
  subject: string
  message: TicketMessage[] | null
  created_at: number
  updated_at: number
}

export interface InviteCode {
  user_id: number
  code: string
  pv: number
  status: number
  created_at: number
  updated_at: number
}

export interface InviteData {
  codes: InviteCode[]
  /** [邀请人数, 累计获得佣金, 确认中佣金, 佣金比例, 可用佣金] */
  stat: [number, number, number, number, number]
}

export interface CommissionLog {
  id: number
  order_amount: number
  trade_no: string
  get_amount: number
  created_at: number
}

export interface KnowledgeItem {
  id: number
  category: string
  title: string
  body?: string
  updated_at: number
}

export interface TrafficLog {
  u: number
  d: number
  record_at: number
  server_rate: string | number
  updated_at?: number | null
  created_at?: number | null
}

/* ---------- 接口 ---------- */

const data = <T>(p: Promise<Envelope<T>>) => p.then((r) => r.data)

export const guestApi = {
  config: (force = false) => data(http.get<Envelope<GuestConfig>>('/guest/comm/config', undefined, { force })),
}

export const passportApi = {
  login: (body: Record<string, unknown>) => data(http.post<Envelope<AuthData>>('/passport/auth/login', body)),
  register: (body: Record<string, unknown>) => data(http.post<Envelope<AuthData>>('/passport/auth/register', body)),
  forget: (body: Record<string, unknown>) => data(http.post<Envelope<boolean>>('/passport/auth/forget', body)),
  sendEmailVerify: (body: Record<string, unknown>) =>
    data(http.post<Envelope<boolean>>('/passport/comm/sendEmailVerify', body)),
  /** 邮件链接 / 快捷登录：/#/login?verify=xxx */
  token2Login: (verify: string) => data(http.get<Envelope<AuthData>>('/passport/auth/token2Login', { verify })),
}

export const userApi = {
  info: (force = false) => data(http.get<Envelope<UserInfo>>('/user/info', undefined, { force })),
  config: (force = false) => data(http.get<Envelope<UserConfig>>('/user/comm/config', undefined, { force })),
  getStat: (force = false) => data(http.get<Envelope<[number, number, number]>>('/user/getStat', undefined, { force })),
  getSubscribe: (force = false) => data(http.get<Envelope<Subscribe>>('/user/getSubscribe', undefined, { force })),
  resetSecurity: () =>
    data(http.get<Envelope<string>>('/user/resetSecurity')).then((res) => {
      clearApiCache('/user/getSubscribe')
      return res
    }),
  changePassword: (old_password: string, new_password: string) =>
    data(http.post<Envelope<boolean>>('/user/changePassword', { old_password, new_password })),
  update: (body: { remind_expire?: number; remind_traffic?: number }) =>
    data(http.post<Envelope<boolean>>('/user/update', body)),
  transfer: (transfer_amount: number) => data(http.post<Envelope<boolean>>('/user/transfer', { transfer_amount })),
  telegramBotInfo: () => data(http.get<Envelope<{ username: string }>>('/user/telegram/getBotInfo')),

  notices: (current = 1, force = false) => http.get<{ data: Notice[]; total: number }>('/user/notice/fetch', { current }, { force }),

  plans: (force = false) => data(http.get<Envelope<Plan[]>>('/user/plan/fetch', undefined, { force })),
  plan: (id: number | string) => data(http.get<Envelope<Plan>>('/user/plan/fetch', { id })),
  checkCoupon: (code: string, plan_id: number, period: string) =>
    data(http.post<Envelope<Coupon>>('/user/coupon/check', { code, plan_id, period })),

  orders: (force = false) => data(http.get<Envelope<Order[]>>('/user/order/fetch', undefined, { force })),
  order: (trade_no: string) => data(http.get<Envelope<Order>>('/user/order/detail', { trade_no })),
  orderStatus: (trade_no: string) => data(http.get<Envelope<number>>('/user/order/check', { trade_no })),
  saveOrder: (plan_id: number, period: string, coupon_code?: string) =>
    data(http.post<Envelope<string>>('/user/order/save', { plan_id, period, coupon_code: coupon_code || undefined })),
  checkout: (trade_no: string, method: number) =>
    http.post<CheckoutResult>('/user/order/checkout', { trade_no, method }),
  paymentMethods: () => data(http.get<Envelope<PaymentMethod[]>>('/user/order/getPaymentMethod')),
  cancelOrder: (trade_no: string) => data(http.post<Envelope<boolean>>('/user/order/cancel', { trade_no })),

  servers: (force = false) => http.get<{ data: ServerNode[] }>('/user/server/fetch', undefined, { force }).then((r) => r?.data ?? []),

  tickets: (force = false) => data(http.get<Envelope<Ticket[]>>('/user/ticket/fetch', undefined, { force })),
  ticket: (id: number | string) => data(http.get<Envelope<Ticket>>('/user/ticket/fetch', { id })),
  saveTicket: (subject: string, level: number, message: string) =>
    data(http.post<Envelope<boolean>>('/user/ticket/save', { subject, level, message })),
  replyTicket: (id: number, message: string) =>
    data(http.post<Envelope<boolean>>('/user/ticket/reply', { id, message })),
  closeTicket: (id: number) => data(http.post<Envelope<boolean>>('/user/ticket/close', { id })),
  withdraw: (withdraw_method: string, withdraw_account: string) =>
    data(http.post<Envelope<boolean>>('/user/ticket/withdraw', { withdraw_method, withdraw_account })),

  invite: (force = false) => data(http.get<Envelope<InviteData>>('/user/invite/fetch', undefined, { force })),
  inviteSave: () => data(http.get<Envelope<boolean>>('/user/invite/save')),
  inviteDetails: (current: number, page_size: number) =>
    http.get<{ data: CommissionLog[]; total: number }>('/user/invite/details', { current, page_size }),

  knowledge: (language: string, keyword?: string, force = false) =>
    data(http.get<Envelope<Record<string, KnowledgeItem[]>>>('/user/knowledge/fetch', { language, keyword }, { force })),
  knowledgeDetail: (id: number, language: string) =>
    data(http.get<Envelope<KnowledgeItem>>('/user/knowledge/fetch', { id, language })),

  trafficLog: (force = false) => data(http.get<Envelope<TrafficLog[]>>('/user/stat/getTrafficLog', undefined, { force })),
}
