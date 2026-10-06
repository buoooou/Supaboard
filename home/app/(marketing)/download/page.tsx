import Link from "next/link";
import {
  ArrowRight,
  Download,
  ExternalLink,
  Info,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const R2_BASE_URL = "https://img.buoucoding.com/vpn/app";

export default function DownloadPage() {
  const platforms = [
    {
      name: "iOS (苹果手机 / iPad)",
      icon: Icons.apple,
      color: "bg-primary",
      warning: "千万不要在系统的“设置”中登录 iCloud！只能在 App Store 软件内登录，否则有手机被锁死的风险！",
      items: [
        {
          title: "Shadowrocket (小火箭)/Clash Mi",
          desc: "最经典、最普及的代理软件，支持几乎所有协议。（需付费购买，约 $2.99）",
          links: [
            { text: "共享账号下载与使用教程", href: "/blog/shadowrocket-shared-apple-id-guide", icon: BookOpen }
          ]
        },
        {
          title: "Stash / Quantumult X / Loon",
          desc: "需支持VLESS + Reality 协议，Surge不支持，其他客户端，要注意版本，有些版本不支持",
          links: []
        }
      ]
    },
    {
      name: "Windows (电脑端)",
      icon: Icons.windows,
      color: "bg-secondary",
      items: [
        {
          title: "v2rayN",
          desc: "强烈推荐。非常轻量、稳定，并且支持包括 Reality 在内的所有主流协议。",
          links: [
            { text: "🚀 R2 高速直连", href: `${R2_BASE_URL}/v2rayN-windows-64.zip`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/2dust/v2rayN/releases", icon: ExternalLink }
          ]
        },
        {
          title: "Clash Verge Rev",
          desc: "现代化界面的 Clash 内核客户端，支持各种高级分流和规则配置，颜值极高。",
          links: [
            { text: "🚀 R2 高速直连 (x64 安装包)", href: `${R2_BASE_URL}/Clash.Verge_2.4.4_x64-setup.exe`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/clash-verge-rev/clash-verge-rev/releases", icon: ExternalLink }
          ]
        },
        {
          title: "Flclash",
          desc: "基于 Flutter 开发的跨平台客户端，简洁美观，支持多种代理内核。",
          links: [
            { text: "🚀 R2 高速直连", href: `${R2_BASE_URL}/Flclash-0.8.90-windows-amd64-setup.exe`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/chen08209/FlClash/releases", icon: ExternalLink }
          ]
        }
      ]
    },
    {
      name: "macOS (苹果电脑)",
      icon: Icons.apple,
      color: "bg-tertiary",
      items: [
        {
          title: "Clash Verge Rev",
          desc: "macOS 平台强烈推荐！全面适配 Apple Silicon (M1/M2/M3) 及 Intel 芯片，支持深色模式与 TUN 全局模式。",
          links: [
            { text: "🚀 R2 高速直连 (M系列/ARM64)", href: `${R2_BASE_URL}/Clash.Verge_2.4.4_aarch64.dmg`, icon: Download },
            { text: "🚀 R2 高速直连 (Intel/x64)", href: `${R2_BASE_URL}/Clash.Verge_2.4.4_x64.dmg`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/clash-verge-rev/clash-verge-rev/releases", icon: ExternalLink }
          ]
        },
        {
          title: "Flclash",
          desc: "现代化 Flutter 跨平台客户端，支持 Apple Silicon 及 Intel 芯片。",
          links: [
            { text: "🚀 R2 高速直连 (M系列/ARM64)", href: `${R2_BASE_URL}/Flclash-0.8.90-macos-arm64.dmg`, icon: Download },
            { text: "🚀 R2 高速直连 (Intel/x64)", href: `${R2_BASE_URL}/Flclash-0.8.90-macos-x64.dmg`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/chen08209/FlClash/releases", icon: ExternalLink }
          ]
        },
        {
          title: "V2rayU",
          desc: "极为小巧的 macOS 原生状态栏客户端，内存占用极低，随开随用。",
          links: [
            { text: "🚀 R2 高速直连 (Universal 通用包)", href: `${R2_BASE_URL}/V2rayU-64.dmg`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/yanue/V2rayU/releases", icon: ExternalLink }
          ]
        }
      ]
    },
    {
      name: "Android (安卓手机 / 平板)",
      icon: Icons.google,
      color: "bg-foreground text-white",
      items: [
        {
          title: "NekoBox for Android",
          desc: "目前安卓端最为推荐的客户端！功能全面，基于 Sing-box 内核开发，完美支持包括 Reality 在内的各种新一代协议。",
          links: [
            { text: "🚀 R2 高速直连 (arm64-v8a)", href: `${R2_BASE_URL}/NekoBox-1.4.2-arm64-v8a.apk`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/MatsuriDayo/NekoBoxForAndroid/releases", icon: ExternalLink }
          ]
        },
        {
          title: "v2rayNG",
          desc: "安卓端最老牌、最经典的 Xray 官方系客户端。界面虽然比较朴素，但连通率和稳定性无可挑剔，属于“万金油”级别的防呆软件。",
          links: [
            { text: "🚀 R2 高速直连", href: `${R2_BASE_URL}/v2rayNG_2.1.3-fdroid_universal.apk`, icon: Download },
            { text: "🔗 点击这里下载 (Releases)", href: "https://github.com/2dust/v2rayNG/releases", icon: ExternalLink }
          ]
        }
      ]
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-background dot-grid pb-24">
      {/* HEADER */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground bg-primary/10 font-heading font-bold text-sm mb-6">
            <Download className="w-4 h-4" />
            客户端下载直通车
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight mb-6">
            选择您的设备
          </h1>
          <p className="font-sans text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            请根据您的设备系统，选择对应的客户端进行安装。所有链接均指向官方发布页面，确保安全可靠。
          </p>
        </div>
      </section>

      {/* PLATFORMS GRID */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 z-10">
        {platforms.map((platform, i) => (
          <div
            key={i}
            className="sticker-card flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border-2 border-foreground shadow-[4px 4px 0px 0px #1E293B]", platform.color)}>
                <platform.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-tight">{platform.name}</h2>
            </div>

            {platform.warning && (
              <div className="bg-amber-100 border-2 border-amber-500 p-4 rounded-xl mb-8 flex gap-3 items-start">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm font-sans font-bold text-amber-800 leading-snug">
                  {platform.warning}
                </p>
              </div>
            )}

            <div className="space-y-8 flex-1">
              {platform.items.map((item, j) => (
                <div key={j} className="border-b-2 border-foreground/5 pb-8 last:border-0 last:pb-0">
                  <h3 className="font-heading text-xl font-black mb-2">{item.title}</h3>
                  <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex flex-wrap gap-4">
                    {item.links.map((link, k) => (
                      <div key={k} className="flex flex-col gap-1 w-full sm:w-auto">
                        <Link
                          href={link.href}
                          target="_blank"
                          className="inline-flex items-center gap-2 font-heading font-black text-sm text-primary hover:translate-x-1 transition-transform"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.text}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
