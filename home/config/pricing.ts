export interface PricingPlan {
  id: string
  name: string
  /** Price in HKD, as displayed on the pricing grid */
  price: string
  unit: string
  cycleHint: string
  badge?: string
  badgeColor?: string
  groupBadge: string
  groupBadgeColor: string
  features: string[]
  color: string
  popular: boolean
  /** Sold on a third-party store rather than the Supaboard panel */
  isAiToken?: boolean
  customLink?: string
  categories: string[]
}

export const pricingCurrency = "HKD"

export const pricingPlans: PricingPlan[] = [
  // 1. 基础月Base套餐
  {
    id: "base-monthly",
    name: "基础套餐 (Base)",
    price: "24",
    unit: "/月付",
    cycleHint: "年付 HK$244.80 (立省15%) · 季付 HK$68.40",
    groupBadge: "Base 组",
    groupBadgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
    features: [
      "基础专线节点，速度 500Mbps",
      "每月 50G 高速流量",
      "支持 2 台设备同时在线",
      "超低延迟在 100ms 以内",
      "日常网页浏览与基础海外办公"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "monthly"]
  },
  // 2. 畅享月Base套餐
  {
    id: "enjoy-monthly",
    name: "畅享套餐 (Base)",
    price: "35",
    unit: "/月付",
    cycleHint: "年付 HK$357.00 (立省15%) · 季付 HK$99.75",
    badge: "最受欢迎",
    badgeColor: "bg-secondary text-white",
    groupBadge: "Base 组",
    groupBadgeColor: "bg-sky-100 text-sky-800 border border-sky-200",
    features: [
      "高速专线节点，速度 1000Mbps",
      "每月 100G 高速流量",
      "限制设备 5 台同时在线",
      "超低延迟在 100ms 以内",
      "4K 超清流媒体秒开支持"
    ],
    color: "bg-tertiary",
    popular: true,
    categories: ["all", "monthly"]
  },
  // 3. 无限月SVIP套餐
  {
    id: "svip-monthly",
    name: "无限套餐 (SVIP)",
    price: "117",
    unit: "/月付",
    cycleHint: "年付 HK$1193.40 (立省15%) · 季付 HK$333.45",
    badge: "SVIP 旗舰",
    badgeColor: "bg-amber-400 text-slate-900",
    groupBadge: "SVIP 专线",
    groupBadgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
    features: [
      "超高速顶级专线，速度 2000Mbps",
      "每月 500G 海量流量",
      "支持 10 台设备同时在线",
      "SVIP 专属 VIP 队列低延迟",
      "晚高峰无拥堵速率保障"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "monthly"]
  },
  // 4. TikTok/跨境电商独享专线
  {
    id: "tiktok-dedicated",
    name: "TikTok/跨境电商独享专线",
    price: "500",
    unit: "/月付",
    cycleHint: "独立纯净原生 IP · 彻底防关联",
    badge: "企业跨境",
    badgeColor: "bg-emerald-400 text-slate-900",
    groupBadge: "独享专线",
    groupBadgeColor: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    features: [
      "独享纯净原生住宅 IP，防关联设计",
      "完美解锁 TikTok/亚马逊跨境电商",
      "独享 1000Mbps 带宽，丝滑直播",
      "7x24 小时跨境出海专属运维"
    ],
    color: "bg-white",
    popular: false,
    customLink: "https://pro.supaboard.cc",
    categories: ["all", "monthly", "special"]
  },
  // 5. 不限时Base套餐
  {
    id: "base-traffic",
    name: "不限时Base套餐",
    price: "47",
    unit: "/流量包",
    cycleHint: "永久有效 · 流量用完为止",
    badge: "4000+ 用户选择",
    badgeColor: "bg-sky-400 text-slate-900",
    groupBadge: "Base 组",
    groupBadgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
    features: [
      "100G 不限时流量，永久有效不过期",
      "高速节点，速度 1000Mbps",
      "支持 2 台设备同时在线",
      "超低延迟在 100ms 以内",
      "低频随用随走，备用梯子首选"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "traffic"]
  },
  // 6. AI不限时VIP套餐
  {
    id: "ai-vip-traffic",
    name: "AI不限时VIP套餐",
    price: "59",
    unit: "/流量包",
    cycleHint: "永久有效 · 专为 AI 工具调优",
    badge: "AI 用户首选",
    badgeColor: "bg-primary text-white",
    groupBadge: "VIP 组",
    groupBadgeColor: "bg-purple-100 text-purple-800 border border-purple-300",
    features: [
      "100G VIP 专享 AI 原生优化节点与纯净 IP",
      "无缝直通 ChatGPT、Claude、Perplexity",
      "不限时长，流量用完为止无过期限制",
      "超低网络抖动，守护 AI 账号安全",
      "支持 3 台设备同时在线"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "traffic", "special"]
  },
  // 7. AI大流量不限时VIP套餐
  {
    id: "ai-heavy-traffic",
    name: "AI大流量不限时VIP套餐",
    price: "260",
    unit: "/流量包",
    cycleHint: "永久有效 · 团队与重度研发包",
    badge: "AI 生产力",
    badgeColor: "bg-purple-600 text-white",
    groupBadge: "VIP 组",
    groupBadgeColor: "bg-purple-100 text-purple-800 border border-purple-300",
    features: [
      "500G 超大 AI 专用流量池，终身无到期时间",
      "深度优化 Claude / GPT-4o 批量交互",
      "VIP 专属高优先级路由，超高稳定性",
      "支持 5 台设备并发，适合科研创作团队"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "traffic", "special"]
  },
  // 8. 中流量不限时SVIP套餐
  // {
  //   id: "svip-mid-traffic",
  //   name: "中流量不限时SVIP套餐",
  //   price: "175",
  //   unit: "/流量包",
  //   cycleHint: "永久有效 · SVIP 骨干专线",
  //   badge: "SVIP 专线",
  //   badgeColor: "bg-amber-400 text-slate-900",
  //   groupBadge: "SVIP 专线",
  //   groupBadgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
  //   features: [
  //     "1000G SVIP 顶级 IPLC/IEPL 国际专线",
  //     "不限时长，大容量用完为止",
  //     "极速 2000Mbps 极速吞吐与微秒级抖动",
  //     "支持 5 台设备，4K/8K 流媒体全解锁"
  //   ],
  //   color: "bg-white",
  //   popular: false,
  //   categories: ["all", "traffic"]
  // },
  // 9. 大流量不限时SVIP套餐
  {
    id: "svip-large-traffic",
    name: "大流量不限时SVIP套餐",
    price: "350",
    unit: "/流量包",
    cycleHint: "永久有效 · 2000Mbps 极速",
    badge: "SVIP 大容量",
    badgeColor: "bg-amber-400 text-slate-900",
    groupBadge: "SVIP 专线",
    groupBadgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
    features: [
      "1000G 海量 SVIP 专线高速流量，终身有效",
      "超高 2000Mbps 速率，支持大文件速传",
      "支持 10 台设备同时并发高速上网",
      "晚高峰优先调度，享受最顶级专线带宽池"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "traffic"]
  },
  // 10. 超大流量不限时SVIP套餐
  {
    id: "svip-super-traffic",
    name: "超大流量不限时SVIP套餐",
    price: "700",
    unit: "/流量包",
    cycleHint: "永久有效 · 旗舰级海量流量池",
    badge: "旗舰流量池",
    badgeColor: "bg-amber-400 text-slate-900",
    groupBadge: "SVIP 专线",
    groupBadgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
    features: [
      "2000G SVIP 旗舰级海量流量池，全节点开放",
      "最高优先级 QoS 专线带宽通道",
      "多团队/多设备并发高吞吐无压力",
      "7x24 小时运维专席保障与优先响应"
    ],
    color: "bg-white",
    popular: false,
    categories: ["all", "traffic"]
  },
  // 11. AI Token中转套餐 (Claude+vpn)
  {
    id: "ai-token-custom",
    name: "AI Token中转套餐 (Claude+vpn)",
    price: "300",
    unit: "/流量包",
    cycleHint: "第三方平台直通 · API Token 额度",
    badge: "开发者特供",
    badgeColor: "bg-primary text-white",
    groupBadge: "API 平台",
    groupBadgeColor: "bg-indigo-100 text-indigo-800 border border-indigo-300",
    features: [
      "AI 原生高速节点支持",
      "无缝解锁 Claude 等 AI 大模型",
      "Token 中转调用额度直通接入",
      "尊享 VIP 专属网络通信保障"
    ],
    color: "bg-white",
    popular: false,
    isAiToken: true,
    customLink: "https://supastore.cc",
    categories: ["all", "special"]
  }
];
