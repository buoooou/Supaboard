"use client";

import { Logo } from "@/components/logo";
import {
  Smartphone,
  Monitor,
  Zap,
  ShieldCheck,
  BookOpen,
  Download,
  Rocket,
  Settings,
  MessageSquare,
  ChevronRight,
  HelpCircle,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const platforms = [
  {
    id: "ios-rocket",
    name: "Shadowrocket",
    icon: Rocket,
    system: "iOS",
    color: "bg-primary",
    desc: "iOS 平台最受欢迎的‘小火箭’，上手极其简单。",
    content: {
      intro: "Shadowrocket 是 iOS 平台上支持 SS/SSR/V2ray 等协议的全能客户端。",
      download: "小火箭在中国大陆 AppStore 已下架，请使用非国区 Apple ID 下载。参考价格：2.99＄。",
      steps: [
        {
          title: "订阅导入 (推荐)",
          items: [
            "登录 Supaboard 官网，进入仪表盘，点击‘一键导入 Shadowrocket’。",
            "若导入失效，复制订阅链接。",
            "打开 Shadowrocket，点击右上角 + ，类型选择 Subscribe，粘贴 URL 即可。"
          ]
        },
        {
          title: "手动添加",
          items: [
            "支持扫码导入（点击左上角扫码图标）。",
            "复制 https:// 订阅链接后打开 App 会自动识别并提示保存。"
          ]
        },
        {
          title: "开启服务",
          items: [
            "点击‘连通性测试’查看延迟。",
            "选择节点后打开右上角开关。",
            "首次使用请在系统弹窗中点击 Allow 以允许添加 VPN 配置。"
          ]
        }
      ],
      advanced: [
        "全局路由建议设置为‘配置’模式，实现自动分流。",
        "支持场景模式，可在特定 WIFI 下自动直连。",
        "支持按需求连接，访问被屏蔽网站时自动唤起。"
      ]
    }
  },
  {
    id: "android-clash",
    name: "Clash Meta for Android",
    icon: Smartphone,
    system: "Android",
    color: "bg-secondary",
    desc: "安卓端强烈推荐，支持 VLESS Reality 协议，分流表现卓越。",
    content: {
      intro: "Clash Meta for Android (CMFA) 是原 Clash for Android 的延续版本，内置 Clash Meta (Mihomo) 内核，完美支持 VLESS + Reality 等新协议。",
      download: "可在下载中心直接下载 APK 安装包进行安装。",
      steps: [
        {
          title: "URL 订阅导入",
          items: [
            "登录 Supaboard 官网，复制 Clash Meta 订阅地址。",
            "打开 App，点击‘配置’ -> ‘新配置’ -> ‘URL’。",
            "粘贴链接并保存，选中该配置文件。"
          ]
        },
        {
          title: "开始使用",
          items: [
            "回到首页点击‘已停止’开关开启代理。",
            "点击‘代理’选项卡可进入分流策略组切换节点。",
            "Domestic 处理大陆网站（直连），Global 处理国外网站（代理）。"
          ]
        }
      ]
    }
  },
  {
    id: "win-clash-verge",
    name: "Clash Verge Rev",
    icon: Monitor,
    system: "Windows",
    color: "bg-secondary",
    desc: "Windows 端强烈推荐，界面现代美观，完美替代已停更的 Clash for Windows。",
    content: {
      intro: "Clash Verge Rev 是基于 Tauri 框架的新一代 Clash GUI 客户端，界面清爽、性能优秀，支持 Clash Meta 内核。",
      download: "前往下载中心获取 Windows 安装包（.exe），下载后双击安装即可。",
      steps: [
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，进入仪表盘，复制 Clash 订阅地址。",
            "打开 Clash Verge Rev，点击左侧菜单栏的'订阅'。",
            "在顶部输入框中粘贴订阅 URL，点击'导入'按钮。",
            "导入成功后，右键点击配置文件选择'使用'来激活它。"
          ]
        },
        {
          title: "开启代理",
          items: [
            "点击左侧菜单'设置'，打开'系统代理'开关。",
            "浏览器将自动走代理通道，无需额外设置。",
            "如系统代理不生效，可同时开启'TUN 模式'实现全局接管。"
          ]
        },
        {
          title: "切换节点",
          items: [
            "点击左侧菜单'代理'，可以看到所有分组和节点。",
            "在 Global / Proxy 组中选择想要使用的节点线路。",
            "点击'测速'图标可批量检测延迟，选择最优节点。"
          ]
        }
      ],
      advanced: [
        "建议开启'静默启动'和'开机自启'，确保代理始终可用。",
        "TUN 模式可代理所有应用流量（包括游戏和终端命令行）。",
        "支持自定义规则和脚本，可在'订阅'中使用 Merge 配置扩展。"
      ]
    }
  },
  {
    id: "win-v2rayn",
    name: "v2rayN",
    icon: Monitor,
    system: "Windows",
    color: "bg-primary",
    desc: "老牌经典 V2Ray 客户端，轻量稳定，适合纯代理场景。",
    content: {
      intro: "v2rayN 是 Windows 平台最经典的 V2Ray 图形化客户端，支持 VMess、VLESS、Trojan、SS 等主流协议。",
      download: "前往下载中心获取 v2rayN 压缩包（.zip），解压后直接运行 v2rayN.exe。",
      steps: [
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，复制 V2Ray 订阅地址。",
            "打开 v2rayN，点击菜单栏'订阅分组' -> '订阅分组设置'。",
            "点击'添加'，在'可选地址(url)'中粘贴订阅链接并确定。",
            "返回主界面，点击'订阅分组' -> '更新全部订阅'。"
          ]
        },
        {
          title: "开启代理",
          items: [
            "更新完成后，主界面会显示所有节点列表。",
            "双击某个节点将其设为活跃节点。",
            "在底部状态栏确认'系统代理'模式已开启（右键系统托盘图标可切换）。"
          ]
        },
        {
          title: "选择代理模式",
          items: [
            "右键系统托盘的 v2rayN 图标，可选择代理模式。",
            "'自动配置系统代理'：推荐，自动接管浏览器等流量。",
            "'不改变系统代理'：仅作为 SOCKS/HTTP 本地代理端口使用。"
          ]
        }
      ],
      advanced: [
        "支持自动测速，在服务器列表中右键 -> 'Test server real delay'。",
        "支持路由规则设置，可精细化分流国内外流量。",
        "建议开启'开机自动启动'和'自动更新订阅'。"
      ]
    }
  },
  {
    id: "mac-clash-verge",
    name: "Clash Verge Rev",
    icon: Monitor,
    system: "macOS",
    color: "bg-primary",
    desc: "macOS 端强烈推荐，跨平台神作，M 芯片和 Intel 均完美支持。",
    content: {
      intro: "Clash Verge Rev 同样支持 macOS，M 系列芯片和 Intel 芯片都有对应版本，是目前 Mac 上最佳的 Clash 客户端。",
      download: "前往下载中心根据芯片类型下载对应的 .dmg 安装包。M1/M2/M3/M4 选 ARM 版本，老款 Mac 选 Intel 版本。",
      steps: [
        {
          title: "安装应用",
          items: [
            "双击 .dmg 文件，将 Clash Verge 拖入 Applications 文件夹。",
            "首次打开若提示'未验证的开发者'，请前往系统设置 -> 隐私与安全性 -> 点击'仍然打开'。",
            "也可在终端执行: sudo xattr -rd com.apple.quarantine /Applications/Clash\\ Verge.app"
          ]
        },
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，复制 Clash 订阅地址。",
            "打开 Clash Verge Rev，点击左侧'订阅'。",
            "在输入框中粘贴 URL 后点击'导入'，然后右键选择'使用'激活。"
          ]
        },
        {
          title: "开启代理",
          items: [
            "在左侧'设置'中开启'系统代理'。",
            "macOS 可能弹出密码确认框，输入电脑密码授权即可。",
            "前往'代理'页面选择节点，点击测速选择最优线路。"
          ]
        }
      ],
      advanced: [
        "TUN 模式需要额外授权，但可以代理终端和所有 App 流量。",
        "建议在'设置'中开启'开机自启'和'静默启动'。",
        "macOS Sonoma 及以上系统建议使用最新版以避免兼容问题。"
      ]
    }
  },
  {
    id: "win-nekoray",
    name: "NekoRay",
    icon: Monitor,
    system: "Windows",
    color: "bg-secondary",
    desc: "基于 Qt 编写的 PC 端客户端，支持 Vless + Reality。",
    content: {
      intro: "NekoRay 是一款基于 Qt 编写的 PC 端客户端，内核支持 Sing-box 和 Xray，完美支持 Vless + Reality 等新协议。",
      download: "前往下载中心获取 Windows 压缩包（.zip），解压后运行 nekoray.exe。",
      steps: [
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，进入仪表盘，复制订阅地址。",
            "打开 NekoRay，点击菜单栏'首选项' -> '分组'。",
            "点击'新建分组'，类型选择'订阅'，填入名称和订阅链接，点击'确定'。",
            "在主界面点击'更新订阅'按钮。"
          ]
        },
        {
          title: "开启代理",
          items: [
            "订阅更新后，节点列表中会显示所有节点。",
            "右键点击一个节点，选择'启动'。",
            "勾选主界面上方的'系统代理'复选框，让浏览器流量走代理。"
          ]
        },
        {
          title: "切换内核 (可选)",
          items: [
            "点击菜单栏'首选项' -> '基本设置'。",
            "在'核心'选项卡中，可以选择使用 Xray 或 Sing-box 内核。"
          ]
        }
      ],
      advanced: [
        "支持 TUN 模式，勾选主界面的'TUN 模式'可接管所有软件流量。",
        "推荐在基本设置中开启'开机自启'。",
        "可以通过分组功能管理多个不同的订阅。"
      ]
    }
  },
  {
    id: "mac-v2rayu",
    name: "V2rayU",
    icon: Monitor,
    system: "macOS",
    color: "bg-primary",
    desc: "Mac 上经典且简单易用的原生客户端，完美支持订阅导入。",
    content: {
      intro: "V2rayU 是 macOS 上非常经典且简单易用的原生客户端，支持多种协议，导入直连链接非常稳定。",
      download: "前往下载中心根据您的 Mac 芯片（Intel 或 M 系列）下载对应的 .dmg 安装包。",
      steps: [
        {
          title: "安装应用",
          items: [
            "双击 .dmg 文件，将 V2rayU 拖入 Applications 文件夹。",
            "首次打开若提示无法验证开发者，请前往'系统设置' -> '隐私与安全性'点击'仍然打开'。"
          ]
        },
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，进入仪表盘，复制 https:// 订阅地址。",
            "点击系统菜单栏的 V2rayU 图标，选择'Configure'（配置）。",
            "在配置界面的'Subscribe'（订阅）选项卡中添加。在 URL 框内粘贴订阅地址，填写 Remark（备注），点击'Add'添加。",
            "然后在系统菜单栏的 V2rayU 图标中点击'Update Servers'更新订阅。"
          ]
        },
        {
          title: "开启代理",
          items: [
            "点击菜单栏的 V2rayU 图标，点击'Turn V2ray-Core On'开启代理。",
            "在'Global Mode'（全局模式）或'Pac Mode'（PAC 模式）中进行选择。",
            "推荐使用 PAC 模式，实现自动分流。"
          ]
        }
      ],
      advanced: [
        "PAC 模式如果遇到部分国外网站无法访问，可以临时切换为 Global Mode（全局模式）。"
      ]
    }
  },
  {
    id: "android-nekobox",
    name: "NekoBox",
    icon: Smartphone,
    system: "Android",
    color: "bg-secondary",
    desc: "安卓端体验最好、UI 现代的客户端，完美支持 Reality 协议。",
    content: {
      intro: "NekoBox (NekoBoxForAndroid) 是目前综合体验最好、UI 最现代的安卓客户端之一，底层使用 Sing-box 核心，对 Reality 等新协议支持极度完美。",
      download: "可在下载中心直接下载 NekoBox APK 安装包进行安装。",
      steps: [
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，复制订阅地址。",
            "打开 NekoBox，点击右上角的'分组'图标 -> 再次点击右上角 '+' 号 -> 选择'订阅'。",
            "填入名称，粘贴订阅链接，点击右上角'保存'图标。",
            "在分组列表中，点击刚刚添加的订阅右侧的'更新'按钮。"
          ]
        },
        {
          title: "开始使用",
          items: [
            "回到首页，选择一个节点。",
            "点击底部那个大大的圆形粉色按钮启动代理。",
            "首次连接会弹出 VPN 连接请求，请点击'确定'允许。"
          ]
        },
        {
          title: "测速与选择节点",
          items: [
            "点击右上角的菜单按钮，选择'连接测试'即可对所有节点进行测速。",
            "推荐选择延迟数字较小（显示为绿色）的节点使用。"
          ]
        }
      ],
      advanced: [
        "NekoBox 自带防 DNS 泄露，建议在设置中保持开启状态。",
        "支持路由分流功能，可根据需要配置绕过局域网和大陆 IP。",
        "可以通过长按节点分享单节点配置或二维码。"
      ]
    }
  },
  {
    id: "android-v2rayng",
    name: "v2rayNG",
    icon: Smartphone,
    system: "Android",
    color: "bg-primary",
    desc: "安卓端老牌经典的客户端，连通率和稳定性无可挑剔。",
    content: {
      intro: "v2rayNG 是安卓端最老牌、最经典的 Xray 官方系客户端，界面朴素但极其稳定，属于“万金油”级别的防呆软件。",
      download: "可在下载中心直接下载 v2rayNG APK 安装包进行安装。",
      steps: [
        {
          title: "导入订阅",
          items: [
            "登录 Supaboard 官网，复制订阅地址。",
            "打开 v2rayNG，点击左上角三横线菜单，选择'订阅分组设置'。",
            "点击右上角 '+' 号，填写备注并粘贴订阅链接，点击右上角 '✔' 保存。",
            "返回主界面，点击右上角三个点菜单，选择'更新订阅'。"
          ]
        },
        {
          title: "开始使用",
          items: [
            "在更新出的节点列表中，点击想要使用的节点将其选中（左侧会有指示条）。",
            "点击右下角的 'V' 字圆形按钮启动代理。",
            "首次连接时系统会提示 VPN 连接请求，请点击'确定'。"
          ]
        },
        {
          title: "选择路由模式",
          items: [
            "点击左上角三横线菜单，进入'设置' -> 找到'路由'设置。",
            "在'预定义规则'中，推荐选择'绕过局域网及大陆地址'，实现国内直连、国外代理。"
          ]
        }
      ],
      advanced: [
        "在主界面点击节点右侧的三点可以进行单节点测速。",
        "在设置中可开启'自动更新订阅'功能。",
        "如果遇到连接问题，可以尝试重启软件或更新订阅。"
      ]
    }
  }
];

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState(platforms[0].id);
  const activePlatform = platforms.find(p => p.id === activeTab) || platforms[0];

  return (
    <main className="flex flex-col min-h-screen bg-background dot-grid pb-24 pt-32">
      <div className="px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">

        {/* HEADER */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground bg-primary font-heading font-bold text-sm mb-6 shadow-[4px 4px 0px 0px #1E293B]">
            <BookOpen className="w-4 h-4" />
            使用全攻略
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black mb-6 tracking-tight">
            手把手教你 <span className="text-primary">畅游网络</span>
          </h1>
          <p className="font-sans text-xl text-muted-foreground max-w-2xl mx-auto">
            从下载安装到进阶设置，覆盖主流平台客户端，助你快速上手。
          </p>
        </div>

        {/* TG BOT BANNER */}
        <div className="sticker-card bg-foreground mb-16 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative animate-in fade-in duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shrink-0 border-2 border-white shadow-[4px 4px 0px 0px #6F3CFF]">
            <Logo className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="font-heading text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
              官方 Telegram 机器人
              <span className="text-xs bg-primary px-2 py-1 rounded-full uppercase tracking-widest border border-white/20">Beta</span>
            </h2>
            <p className="font-sans mb-6 text-lg">
              随时随地管理订阅：查询流量余额、获取最新节点、设置流量预警。
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                href="https://telegram.me/supaboard_2_bot"
                className="bg-white text-foreground px-6 py-3 rounded-full font-heading font-black flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                立即体验 @supaboard_2_bot
              </Link>
            </div>
          </div>
        </div>

        {/* PLATFORM SELECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <h3 className="font-heading font-black text-xl mb-6 uppercase tracking-widest text-muted-foreground px-4">选择你的设备</h3>
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={cn(
                  "w-full sticker-card p-6 text-left flex items-center gap-4 transition-all group",
                  activeTab === p.id ? "bg-white border-primary" : "bg-muted/50 hover:bg-white"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-foreground transition-transform group-hover:-rotate-3", p.color)}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-heading font-black text-lg">{p.name}</div>
                  <div className="font-sans text-xs font-bold opacity-60 uppercase">{p.system}</div>
                </div>
                <ChevronRight className={cn("ml-auto w-5 h-5 transition-transform", activeTab === p.id ? "text-primary translate-x-1" : "text-muted-foreground")} />
              </button>
            ))}
          </aside>

          {/* CONTENT AREA */}
          <div className="lg:col-span-8">
            <div
              key={activeTab}
              className="sticker-card bg-white p-8 md:p-12 min-h-[600px] animate-in fade-in duration-300"
            >
              <div className="mb-12 border-b-2 border-dashed border-muted pb-8">
                <h2 className="font-heading text-4xl font-black mb-4 flex items-center gap-4">
                  <activePlatform.icon className={cn("w-10 h-10", activePlatform.color.replace("bg-", "text-"))} />
                  {activePlatform.name} 使用指南
                </h2>
                <p className="font-sans text-lg text-muted-foreground">{activePlatform.content.intro}</p>
              </div>

              {/* DOWNLOAD SECTION */}
              <div className="mb-12">
                <h3 className="font-heading text-2xl font-black mb-6 flex items-center gap-3">
                  <Download className="w-6 h-6 text-primary" />
                  第一步：下载安装
                </h3>
                <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/20 font-sans text-muted-foreground leading-relaxed">
                  {activePlatform.content.download}
                  <div className="mt-6">
                    <Link href="/download" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-heading font-black text-sm hover:bg-primary hover:text-white transition-all shadow-[4px 4px 0px 0px #6F3CFF]">
                      <Download className="w-4 h-4" />
                      前往下载中心
                    </Link>
                  </div>
                </div>
              </div>

              {/* STEPS SECTION */}
              <div className="mb-12 space-y-12">
                {activePlatform.content.steps.map((step, i) => (
                  <div key={i}>
                    <h3 className="font-heading text-2xl font-black mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center text-sm">
                        {i + 2}
                      </div>
                      {step.title}
                    </h3>
                    <div className="space-y-4 pl-11">
                      {step.items.map((item, j) => (
                        <div key={j} className="flex gap-4 items-start group">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
                          <p className="font-sans text-muted-foreground leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADVANCED SECTION */}
              {activePlatform.content.advanced && (
                <div className="mt-12 pt-12 border-t-2 border-dashed border-muted">
                  <h3 className="font-heading text-2xl font-black mb-6 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-secondary" />
                    进阶使用技巧
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlatform.content.advanced.map((tip, i) => (
                      <div key={i} className="bg-secondary/10 p-4 rounded-xl border-2 border-foreground/5 font-sans text-sm font-bold">
                        ✨ {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEED HELP */}
              <div className="mt-16 bg-primary/5 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 border-2 border-primary/20">
                <HelpCircle className="w-12 h-12 text-primary shrink-0" />
                <div>
                  <h4 className="font-heading font-black text-xl mb-1">遇到问题了？</h4>
                  <p className="font-sans text-muted-foreground">如果教程无法解决您的问题，请随时通过在线客服或工单与我们联系。</p>
                </div>
                <Link href="/contact" className="candy-button whitespace-nowrap">获取支持</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
