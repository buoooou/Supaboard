import { SiteConfig } from "types"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.supaboard.cc"

export const siteConfig: SiteConfig = {
  name: "Supaboard",
  description:
    "Supaboard 提供稳定、高速的全球网络加速服务，支持 IPLC/IEPL 专线，解锁流媒体与 ChatGPT，为您提供无忧的互联网访问体验。",
  url: siteUrl,
  ogImage: `${siteUrl}/og.png`,
  registerUrl: "https://cdn.supaboard.cc/#/register?code=xT9EdJGD",
  loginUrl: "https://cdn.supaboard.cc/#/login",
  ipCheckUrl: "https://ip.supaboard.cc",
  registerDomains: [
    "cdn.supaboard.cc",
    "cdn.supaboard.win",
    "cdn.buouui.com",
    "api.buoucoding.com"
  ],
  telegramBot: "https://telegram.me/supaboard_2_bot",
  crispId: "bd8eb971-40f9-4966-82ee-b2ef596f4583", // TODO: 在这里填入你的 Crisp Website ID
  // Verified official profiles, used as schema.org `sameAs` for entity resolution
  sameAs: [
    "https://x.com/Supaboard00",
    "https://github.com/buoooou/v2ray-clash-clients-download",
    "https://telegram.me/+IXFv_lGI_EUzYWNl",
  ],
  links: {
    twitter: "https://x.com/intent/follow?screen_name=Supaboard00",
    github: "https://github.com/buoooou/v2ray-clash-clients-download",
    tiktok: "https://www.tiktok.com/@buoooou",
    thread: "https://www.threads.net/@zhangkuo92",
    ins: "https://www.instagram.com/zhangkuo92",
    discard: "https://discord.gg/nNbB7CpSue",
    telegram: "https://telegram.me/+IXFv_lGI_EUzYWNl",
    ipCheck: "https://ip.supaboard.cc",
  },
}
