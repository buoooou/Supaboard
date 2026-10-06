import Link from "next/link";
import { DynamicRegisterLink } from "@/components/dynamic-register-link";
import { siteConfig } from "@/config/site";
import {
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Link2,
  ShieldCheck,
  Wallet,
  Zap,
  CheckCircle2,
  ChevronRight,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AffiliatePage() {
  const highlights = [
    {
      title: "高达 15% 的超高返佣",
      desc: "拒绝套路，直给高利润！只要通过您的链接注册，您将获得其每笔订单金额 15% 的现金提成！",
      icon: TrendingUp,
      color: "bg-primary"
    },
    {
      title: "终身循环，拒绝一次性",
      desc: "佣金绝非仅限首单！只要您邀请的用户在我们这里产生消费，您都能无限期拿提成！",
      icon: RotateCcw,
      color: "bg-secondary"
    },
    {
      title: "链接永久有效",
      desc: "生成的专属邀请链接永不失效。发一次朋友圈、群聊或博客，长期为您自动“打工”！",
      icon: Link2,
      color: "bg-tertiary"
    }
  ];

  const payoutInfo = [
    {
      title: "自动结算",
      desc: "为防止恶意退款套现，订单完成后 3天，佣金将自动划转至您的账户余额。",
      icon: ShieldCheck
    },
    {
      title: "灵活提现",
      desc: "佣金满 100元 即可无门槛申请提现！支持 USDT (TRC20) / 支付宝 快速打款。",
      icon: Wallet
    },
    {
      title: "极速到账",
      desc: "提交申请后，财务专员将在 24小时 内完成审核并打款，绝不拖延。",
      icon: Zap
    }
  ];

  const steps = [
    {
      title: "获取专属链接",
      desc: "登录 Supaboard 官网仪表盘，进入「推广返利」页面，一键复制您的专属邀请链接。"
    },
    {
      title: "分享给好友/社群",
      desc: "将链接发送给身边的朋友、发布到社交媒体、博客、论坛或 Telegram 频道中。"
    },
    {
      title: "躺赚现金收益",
      desc: "好友通过链接注册并充值，系统立即自动计算 15% 提成，满额随时提现！"
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-background dot-grid pb-24">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground bg-primary/10 font-heading font-bold text-sm mb-6 uppercase tracking-wider">
            <Gift className="w-4 h-4 text-primary" />
            全民合伙人计划
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
            独乐乐不如众乐乐 <br />
            <span className="text-primary underline decoration-secondary decoration-8">赚取丰厚被动收入</span>
          </h1>
          <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            为了感谢大家一直以来的支持，我们正式推出全新的「高额循环返利计划」！
            只需分享您的专属邀请链接，不仅能帮朋友用上稳定极速的网络，您还能获得源源不断的现金奖励！
          </p>
          <div className="flex justify-center">
            <DynamicRegisterLink href={siteConfig.registerUrl} className="candy-button text-lg px-12 group">
              立即开始分享
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </DynamicRegisterLink>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS GRID */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 z-10 py-16">
        {highlights.map((item, i) => (
          <div
            key={i}
            className="sticker-card group"
          >
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border-2 border-foreground shadow-[4px 4px 0px 0px #1E293B] mb-6", item.color)}>
              <item.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
            <p className="font-sans text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* PAYOUT INFO */}
      <section className="relative py-24 px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">
              💸 佣金如何结算与提现？
            </h2>
            <div className="space-y-8">
              {payoutInfo.map((info, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border-2 border-foreground shadow-[2px 2px 0px 0px #1E293B]">
                    <info.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-black mb-2">{info.title}</h3>
                    <p className="font-sans text-muted-foreground leading-relaxed">{info.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="sticker-card bg-tertiary relative overflow-hidden aspect-[4/3] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/10 dot-grid opacity-50" />
            <div className="relative z-10 text-center scale-125">
              <div className="bg-white p-8 rounded-2xl border-4 border-foreground shadow-[8px 8px 0px 0px #1E293B] -rotate-3 hover:rotate-0 transition-transform cursor-pointer group">
                <div className="text-6xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">¥100</div>
                <div className="font-heading font-bold text-sm tracking-widest uppercase opacity-60">起提金额</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK START STEPS */}
      <section className="relative py-24 px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <div className="sticker-card bg-secondary/10 border-dashed border-secondary/50">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-black mb-4 uppercase">🚀 赚取第一笔佣金只需 3 步</h2>
            <p className="font-sans text-muted-foreground">简单易上手，快速开启您的被动收入之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-heading font-black text-xl mb-6 border-2 border-foreground shadow-[4px 4px 0px 0px #1E293B]">
                  {i + 1}
                </div>
                <h3 className="font-heading text-xl font-black mb-3">{step.title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 -right-6 text-foreground/20">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 lg:px-8 max-w-4xl mx-auto text-center z-10 py-16">
        <div
          className="sticker-card bg-foreground p-12 md:p-20"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-8 leading-tight">
            还在等什么？ <br />
            现在就去生成你的专属链接！
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <DynamicRegisterLink href={siteConfig.registerUrl} className="candy-button bg-white text-foreground hover:bg-tertiary transition-colors">
              立即登录获取链接
            </DynamicRegisterLink>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-heading font-bold hover:bg-white/10 transition-all">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
