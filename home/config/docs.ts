import { MainNavItem, SidebarNavItem } from "types/nav";





export interface DocsConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "下载",
      href: "/download",
      items: [],
    },
    {
      title: "教程",
      href: "/tutorial",
      items: [],
    },
    {
      title: "定价",
      href: "/#pricing",
      items: [],
    },
    {
      title: "返佣",
      href: "/affiliate",
      items: [],
    },
    {
      title: "IP检测",
      href: "https://ip.supaboard.cc",
      external: true,
      items: [],
    },
  ],
  sidebarNav: [
    {
      title: "开始使用",
      items: [
        {
          title: "帮助中心",
          href: "/docs",
          items: [],
        },
      ],
    },
    {
      title: "各平台教程",
      items: [
        {
          title: "Windows 教程",
          href: "/docs/windows-tutorial",
          items: [],
        },
        {
          title: "macOS 教程",
          href: "/docs/macos-tutorial",
          items: [],
        },
        {
          title: "iOS 教程（Shadowrocket）",
          href: "/docs/ios-tutorial",
          items: [],
        },
        {
          title: "Android 教程",
          href: "/docs/android-tutorial",
          items: [],
        },
      ],
    },
  ],
}