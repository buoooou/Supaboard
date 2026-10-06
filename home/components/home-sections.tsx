import Link from "next/link";
import { DynamicRegisterLink } from "@/components/dynamic-register-link";
import {
  ArrowRight, Brain, ShieldCheck, Zap, Star, MessageSquare, Globe2, Bot, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";

export function DecorativeShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[10%] -left-12 w-64 h-64 bg-tertiary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] -right-12 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-8 h-8 border-4 border-tertiary rounded-lg rotate-12 opacity-40" />
      <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-quaternary rotate-45 opacity-40" />
    </div>
  );
}

export function HeroAnimation() {
  return (
    <div className="relative animate-in fade-in zoom-in-95 duration-700">
      <div className="relative z-10 sticker-card p-0 overflow-hidden aspect-square flex items-center justify-center bg-primary">
        <div className="absolute inset-0 bg-white/10 dot-grid opacity-50" />
        <Icons.logo className="w-48 h-48 text-white drop-shadow-[8px 8px 0px #1E293B]" />
      </div>
      <div className="absolute -inset-8 bg-secondary blob-radius -z-10 animate-pulse opacity-20" />
    </div>
  );
}

export function HeroCTA() {
  return (
    <div className="flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DynamicRegisterLink href={siteConfig.registerUrl} className="candy-button text-lg group">
        立即注册，领体验流量
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </DynamicRegisterLink>
      <Link href="/download" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-white px-8 py-4 font-heading font-bold text-foreground hover:bg-tertiary transition-all duration-200">
        下载客户端
      </Link>
    </div>
  );
}

export function FeaturesGrid() {
  const features = [
    {
      title: "极速专线接入 (ToC)",
      desc: "采用 IPLC/IEPL 国际专线，越过公网拥堵，延迟极低，晚高峰依然稳如泰山。",
      icon: Zap,
      color: "bg-primary",
      delay: 0.1
    },
    {
      title: "跨境电商专线 (ToB)",
      desc: "为 TikTok、亚马逊运营打造的纯净原生 IP，防关联设计，千兆带宽确保直播流畅。",
      icon: Globe2,
      color: "bg-secondary",
      delay: 0.2
    },
    {
      title: "流媒体全解锁",
      desc: "完美支持 Netflix, Disney+, YouTube Premium 等服务，随时畅享 4K 高清视频。",
      icon: Star,
      color: "bg-tertiary",
      delay: 0.3
    },
    {
      title: "AI Token 中转 (ToB)",
      desc: "直通 Claude 等海外顶级 AI 大模型，提供稳定 API 中转额度，赋能开发者和企业。",
      icon: Bot,
      color: "bg-primary",
      delay: 0.4
    },
    {
      title: "多端完美适配",
      desc: "支持 Windows, macOS, Android, iOS 以及路由器插件，一个账号，全平台通用。",
      icon: ShieldCheck,
      color: "bg-secondary",
      delay: 0.5
    },
    {
      title: "企业级 SLA 保障",
      desc: "面向 B 端客户提供超高可用性，专属 7x24 小时技术支持，护航出海核心业务。",
      icon: Building2,
      color: "bg-tertiary",
      delay: 0.6
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {features.map((feature, i) => (
        <div
          key={i}
          className="sticker-card group hover:bg-muted/50"
        >
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border-2 border-foreground shadow-[4px 4px 0px 0px #1E293B] group-hover:-translate-y-1 transition-transform", feature.color)}>
            <feature.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-heading text-xl font-black mb-4">{feature.title}</h3>
          <p className="font-sans text-muted-foreground leading-relaxed">
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SecuritySection() {
  const securityItems = [
    {
      title: "端到端加密传输",
      desc: "采用最新的 AEAD 加密协议，确保您的所有流量在传输过程中无法被嗅探或破解。",
      icon: ShieldCheck,
      color: "text-primary"
    },
    {
      title: "严格无日志策略",
      desc: "运维团队承诺不记录任何访问目标、时长或流量内容，您的隐私由技术手段强制保障。",
      icon: Brain,
      color: "text-secondary"
    },
    {
      title: "基础设施隐藏保护",
      desc: "核心架构经过脱敏处理与高强度 DDoS 防护，确保服务在极端环境下依然稳健。",
      icon: Zap,
      color: "text-tertiary"
    }
  ];

  return (
    <div>
      <div>
        <h2 className="font-heading text-4xl md:text-6xl font-black mb-8 tracking-tight leading-none">
          不仅快，更要 <br />
          <span className="text-secondary">绝对安全与私密</span>
        </h2>
      </div>
      <div className="space-y-8">
        {securityItems.map((item, i) => (
          <div key={i} className="flex gap-6 items-start">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-foreground shadow-[2px 2px 0px 0px #1E293B] bg-white", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black mb-2">{item.title}</h3>
              <p className="font-sans text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityVisual() {
  return (
    <div className="relative">
      <div className="sticker-card bg-foreground p-0 overflow-hidden aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 dot-grid opacity-30" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white bg-white/10 backdrop-blur-md font-heading font-black text-xl mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            军用级加密标准
          </div>
          <p className="font-sans text-sm font-bold tracking-widest uppercase">
            Protected by Supaboard Guard
          </p>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 sticker-card bg-tertiary rotate-3 p-6 py-4">
        <div className="font-heading font-black text-lg">100% Uptime</div>
        <div className="font-sans text-xs font-bold opacity-70">过去 365 天运行表现</div>
      </div>
    </div>
  );
}


export function ReferralAnimation() {
  return (
    <div className="sticker-card bg-primary/5 border-dashed flex flex-col md:flex-row items-center gap-12 p-12 md:p-16">
      <div className="flex-1 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground bg-secondary font-heading font-bold text-sm mb-6 shadow-[2px 2px 0px 0px #1E293B]">
          🎁 独乐乐不如众乐乐
        </div>
        <h2 className="font-heading text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
          加入「全民合伙人」计划 <br />
          <span className="text-primary">赚取丰厚被动收入</span>
        </h2>
        <p className="font-sans text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          只需分享您的专属链接，即可获得高达 <span className="font-black text-foreground underline decoration-primary decoration-4">15% 的终身循环返利</span>。不仅能帮朋友用上稳定网络，您还能躺着赚现金！
        </p>
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <Link href="/affiliate" className="candy-button text-lg group">
            查看计划详情
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      <div className="relative w-full md:w-1/3 aspect-square max-w-[300px]">
        <div className="absolute inset-0 bg-primary/20 blob-radius animate-pulse" />
        <div className="absolute inset-4 sticker-card bg-white flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
          <div className="text-center">
            <div className="text-5xl font-black text-primary mb-2">15%</div>
            <div className="font-heading font-bold text-sm tracking-widest uppercase">佣金比例</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TGBotAnimation() {
  return (
    <div className="sticker-card bg-foreground p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />

      <div className="flex-1 text-center lg:text-left relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-white bg-white/10 backdrop-blur-md font-heading font-bold text-sm mb-8 shadow-[4px 4px 0px 0px #6F3CFF]">
          <MessageSquare className="w-4 h-4" />
          智能运维助手
        </div>
        <h2 className="font-heading text-4xl md:text-6xl font-black mb-8 tracking-tight leading-none">
          TG 机器人 <br />
          <span className="text-primary">随时随地 触手可及</span>
        </h2>
        <p className="font-sans text-xl mb-10 max-w-xl leading-relaxed">
          无需登录官网，直接在 Telegram 中管理您的订阅。查询剩余流量、获取最新节点地址、甚至接收流量预警，全部一键搞定。
        </p>
        <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
          <Link
            href="https://telegram.me/supaboard_2_bot"
            className="bg-primary text-white px-8 py-4 rounded-full font-heading font-black text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-[4px 4px 0px 0px #6F3CFF] border-2 border-white"
          >
            立即开始 @supaboard_2_bot
          </Link>
        </div>
      </div>

      <div className="w-full lg:w-1/3 relative z-10">
        <div className="sticker-card backdrop-blur-md p-6 rotate-2">
          <div className="space-y-4">
            {[
              { label: "流量查询", value: "实时同步" },
              { label: "余额提醒", value: "自动推送" },
              { label: "节点获取", value: "一键获取" }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-sans text-sm font-bold uppercase">{item.label}</span>
                <span className="font-heading font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
