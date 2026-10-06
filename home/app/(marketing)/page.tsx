import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Star, HelpCircle, Globe, ShieldCheck, Zap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { staticPages } from "@/config/pages";
import { buildPageMetadata } from "@/lib/seo";
import {
  DecorativeShapes,
  HeroAnimation,
  HeroCTA,
  FeaturesGrid,
  SecuritySection,
  SecurityVisual,
  ReferralAnimation,
  TGBotAnimation,
} from "@/components/home-sections";
import { PricingGrid } from "@/components/pricing-grid";
import { OrganizationJsonLd, WebSiteJsonLd, FAQPageJsonLd, ServiceJsonLd } from "@/components/json-ld";
import { CrispChat } from "@/components/crisp-chat";

export const metadata: Metadata = buildPageMetadata(staticPages.home);



const steps = [
  {
    title: "获取订阅链接",
    desc: "前往 Supaboard 官网注册并选购套餐。在「仪表盘」点击「一键订阅」，复制您的订阅链接。"
  },
  {
    title: "导入客户端",
    desc: "打开下载好的客户端，找到「配置」或「订阅」选项。粘贴订阅链接，并点击「下载」或「更新」。"
  },
  {
    title: "开启系统代理",
    desc: "刷新出节点后，选择一个延迟较低的节点。打开「系统代理」开关，即可畅游网络。"
  }
];

const faqs = [
  {
    question: "为什么我更新了订阅，但是依然无法上网？",
    answer: "请检查几个地方：1. 您的套餐是否已过期或流量耗尽（可前往官网查看）；2. 电脑系统时间是否准确（必须自动同步北京时间）；3. 是否正确开启了「系统代理 (System Proxy)」。"
  },
  {
    question: "什么是「系统代理」和「TUN 模式」？",
    answer: "「系统代理」一般只能代理浏览器流量；如果您的游戏、命令行、Telegram 等软件需要代理，建议在客户端设置中开启「TUN 模式 (虚拟网卡模式)」，可以实现全局强制代理。"
  }
];

export default function IndexPage() {
  return (
    <main className="relative overflow-hidden">
      <DecorativeShapes />

      <CrispChat />

      {/* JSON-LD Structured Data */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FAQPageJsonLd faqs={faqs} />
      <ServiceJsonLd />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground bg-tertiary font-heading font-bold text-sm mb-8 shadow-[4px 4px 0px 0px #1E293B]">
              <Star className="w-4 h-4 fill-foreground" />
              稳定 · 高速 · 全球解锁
            </div>

            <h1 className="font-heading text-6xl md:text-8xl font-black tracking-tight leading-[0.95] text-foreground mb-8">
              【Supaboard】 <br />
              <span className="text-primary text-5xl md:text-7xl">ChatGPT 无忧访问</span>
            </h1>

            <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-xl tracking-tight leading-relaxed mb-12">
              提供 IPLC/IEPL 专线接入，晚高峰不卡顿。全量解锁 Netflix / Disney+ / YouTube Premium 等全球流媒体服务。
            </p>

            <HeroCTA />
          </div>

          <HeroAnimation />
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="relative py-24 md:py-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl md:text-6xl font-black mb-6">卓越的网络性能</h2>
          <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
        </div>
        <FeaturesGrid />
      </section>

      {/* 3. SECURITY & TRUST SECTION */}
      <section className="relative py-24 md:py-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SecuritySection />
          <SecurityVisual />
        </div>
      </section>

      {/* 4. QUICK START */}
      <section className="relative py-24 px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <div className="sticker-card bg-secondary/10 border-dashed">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-black mb-4 uppercase">📖 快速上手教程</h2>
            <p className="font-sans text-muted-foreground">三步连接，畅享自由网络</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-heading font-black text-xl mb-6 shadow-[4px 4px 0px 0px #6F3CFF]">
                  {i + 1}
                </div>
                <h3 className="font-heading text-xl font-black mb-3">{step.title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 -right-6 text-foreground/20">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/tutorial" className="candy-button text-lg group">
              查看更详细的使用教程
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="relative py-24 md:py-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl md:text-6xl font-black mb-6">选择适合您的套餐</h2>
          <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
        </div>

        <PricingGrid />
      </section>

      {/* 6. REFERRAL SUMMARY SECTION */}
      <section className="relative py-24 md:py-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <ReferralAnimation />
      </section>

      {/* TG ROBOT SECTION */}
      <section className="relative py-24 md:py-32 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <TGBotAnimation />
      </section>

      {/* IP CHECK TOOL SECTION */}
      <section className="px-6 lg:px-8 max-w-5xl mx-auto z-10 pb-24">
        <div className="sticker-card bg-white p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-foreground bg-tertiary font-heading font-bold text-sm mb-6 shadow-[2px 2px 0px 0px #1E293B]">
              🔎 在线网络诊断
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Supaboard <span className="text-primary">IP 纯净度检测</span>
            </h2>
            <p className="font-sans text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              一键快速检测当前节点的真实 IP 属性、欺诈分值（Fraud Score）、地理位置、ASN 运营商以及流媒体与 ChatGPT 解锁状态。
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <a
                href={siteConfig.ipCheckUrl ?? "https://ip.supaboard.cc"}
                target="_blank"
                rel="noopener noreferrer"
                className="candy-button text-base md:text-lg group inline-flex items-center gap-2"
              >
                前往 IP 检测工具
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="w-full lg:w-5/12 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border-2 border-foreground bg-primary/5 shadow-[2px 2px 0px 0px #1E293B]">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-base mb-1">IP 与地理定位</h4>
              <p className="font-sans text-xs text-muted-foreground">精准显示经纬度、城市与 ASN 线路信息</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-foreground bg-purple-50 shadow-[2px 2px 0px 0px #1E293B]">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-base mb-1">欺诈风险评分</h4>
              <p className="font-sans text-xs text-muted-foreground">评估 IP 纯净度，避免被网站风控拦截</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-foreground bg-amber-50 shadow-[2px 2px 0px 0px #1E293B]">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-base mb-1">连通性与延迟</h4>
              <p className="font-sans text-xs text-muted-foreground">测试全网节点连通性与网络响应速度</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-foreground bg-emerald-50 shadow-[2px 2px 0px 0px #1E293B]">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                <Star className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-base mb-1">AI 与流媒体解锁</h4>
              <p className="font-sans text-xs text-muted-foreground">检测 ChatGPT / Netflix 等服务可用性</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 lg:px-8 max-w-4xl mx-auto z-10 pb-24">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-black mb-4 uppercase">❓ 常见问题 FAQ</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="sticker-card bg-white hover:bg-muted/30 transition-colors">
              <h3 className="font-heading font-black text-lg mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Q{i + 1}：{faq.question}
              </h3>
              <p className="font-sans text-muted-foreground leading-relaxed pl-7">
                A：{faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
