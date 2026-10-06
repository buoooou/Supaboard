/**
 * SEO copy for hand-built (non-MDX) routes. Single source for page metadata,
 * sitemap.xml and llms.txt, so the three never drift apart.
 */
export interface StaticPageConfig {
  path: string
  title: string
  /** Short label used in navigation-style listings (llms.txt) */
  label: string
  description: string
  priority: number
  /** Title already carries the brand; skip the `%s | Supaboard` template */
  absoluteTitle?: boolean
}

export const staticPages = {
  home: {
    path: "/",
    label: "首页",
    title: "Supaboard — 稳定高速的全球网络加速服务 | IPLC专线 | ChatGPT/Netflix 解锁",
    description:
      "Supaboard 提供 IPLC/IEPL 专线接入，晚高峰不卡顿。全量解锁 Netflix、Disney+、ChatGPT 等全球服务。支持 Windows、macOS、iOS、Android 全平台。",
    priority: 1.0,
    absoluteTitle: true,
  },
  download: {
    path: "/download",
    label: "客户端下载",
    title: "客户端下载 — 全平台代理软件下载直通车",
    description:
      "下载 Supaboard 推荐的全平台代理客户端：Clash Verge Rev、Shadowrocket、v2rayN、v2rayNG 等。支持 Windows、macOS、iOS、Android，提供 R2 高速直连下载。",
    priority: 0.9,
  },
  tutorial: {
    path: "/tutorial",
    label: "使用教程",
    title: "使用教程 — 手把手教你配置代理客户端",
    description:
      "Supaboard 全平台使用教程：包含 Shadowrocket、Quantumult X、Clash Meta for Android (CMFA) 的详细图文配置指南，从安装到进阶设置一应俱全。",
    priority: 0.8,
  },
  affiliate: {
    path: "/affiliate",
    label: "合伙人计划",
    title: "全民合伙人计划 — 15% 终身循环返佣",
    description:
      "加入 Supaboard 合伙人计划，分享专属链接即可获得高达 15% 的终身循环返利。佣金满 100 元即可提现，支持 USDT 和支付宝。",
    priority: 0.7,
  },
  contact: {
    path: "/contact",
    label: "联系我们",
    title: "联系我们",
    description:
      "联系 Supaboard 团队获取产品支持：可通过 Telegram 社区、X (Twitter)、GitHub 或邮箱 supaboard@postions.app 咨询订阅、客户端配置与账户问题。",
    priority: 0.6,
  },
  changelog: {
    path: "/changelog",
    label: "更新日志",
    title: "更新日志 — Supaboard 产品迭代记录",
    description:
      "查看 Supaboard 的最新功能更新、线路扩容与系统优化记录。我们不断迭代，只为给您带来更完美的网络体验。",
    priority: 0.5,
  },
  blog: {
    path: "/blog",
    label: "博客",
    title: "博客 — 翻墙教程与网络加速干货",
    description:
      "Supaboard 博客：Clash、Shadowrocket、v2rayN 等客户端配置教程，机场与 VPS 选购评测，ChatGPT 与 Netflix 解锁方案，以及代理连接故障排查与隐私安全指南。",
    priority: 0.8,
  },
} satisfies Record<string, StaticPageConfig>
