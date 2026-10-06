import type { Icon } from "lucide-react";

import { Icons } from "@/components/icons";

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  registerUrl: string
  loginUrl: string
  ipCheckUrl?: string
  registerDomains?: string[]
  telegramBot: string
  crispId?: string
  sameAs: string[]
  links: {
    twitter: string
    github: string
    tiktok: string
    ins: string
    thread: string
    discard: string
    telegram: string
    ipCheck?: string
  }
}

export type DocsConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export type MarketingConfig = {
  mainNav: MainNavItem[]
}
