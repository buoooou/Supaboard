"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, Clock, Flame, Infinity as InfinityIcon, Layers, ShieldCheck, Sparkles, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { pricingPlans } from "@/config/pricing";
import { DynamicRegisterLink } from "@/components/dynamic-register-link";

const categories = [
  { id: "all", label: "全部套餐", icon: Layers },
  { id: "monthly", label: "周期订阅 (月/季/年)", icon: Clock },
  { id: "traffic", label: "不限时流量包 (用完为止)", icon: InfinityIcon },
  { id: "special", label: "AI & 跨境专区", icon: Sparkles }
].map((cat) => ({
  ...cat,
  count: pricingPlans.filter((plan) => plan.categories.includes(cat.id)).length,
}));

export function PricingGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPlans = pricingPlans.filter((plan) =>
    plan.categories.includes(activeCategory)
  );

  return (
    <div className="space-y-12">
      {/* 1. 分类 Tab 切换栏 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-black text-sm transition-all duration-200 border-2 border-foreground",
                isActive
                  ? "bg-primary text-white shadow-[4px_4px_0px_0px_#1E293B] -translate-y-0.5"
                  : "bg-white text-foreground hover:bg-slate-50 shadow-[2px_2px_0px_0px_#1E293B] hover:-translate-y-0.5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-mono font-bold",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-700"
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. 套餐卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {filteredPlans.map((plan, i) => (
          <div
            key={plan.id}
            className={cn(
              "sticker-card flex flex-col h-full relative transition-all duration-300 animate-in fade-in-50",
              plan.color,
              plan.popular && "ring-4 ring-primary ring-offset-4 shadow-[6px_6px_0px_0px_#1E293B]"
            )}
          >
            {/* 徽章 Badge */}
            {plan.badge && (
              <div
                className={cn(
                  "absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-foreground px-4 py-1 rounded-full font-heading font-black text-xs shadow-[4px_4px_0px_0px_#1E293B] z-20 whitespace-nowrap",
                  plan.badgeColor || "bg-secondary text-foreground"
                )}
              >
                {plan.badge}
              </div>
            )}

            {/* 头部信息 */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={cn(
                    "text-xs font-mono font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider",
                    plan.groupBadgeColor
                  )}
                >
                  {plan.groupBadge}
                </span>
                {plan.popular && (
                  <span className="text-xs font-heading font-black text-primary flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-primary" /> 高性价比
                  </span>
                )}
              </div>

              <h3 className="font-heading text-xl font-black min-h-[32px] flex items-center text-foreground">
                {plan.name}
              </h3>

              {/* 价格显示 */}
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  HK${plan.price}
                </span>
                <span className="text-muted-foreground font-bold text-sm">
                  {plan.unit}
                </span>
              </div>

              {/* 周期/有效期提示 */}
              {plan.cycleHint && (
                <div className="mt-2.5 text-xs font-medium text-slate-600 bg-slate-100/90 rounded-lg px-2.5 py-1.5 border border-slate-200/80 inline-block leading-normal">
                  {plan.cycleHint}
                </div>
              )}
            </div>

            {/* 功能列表 */}
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-sans text-sm font-medium leading-tight text-foreground/80">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* 操作按钮 */}
            <div className="mt-auto pt-2">
              {plan.customLink ? (
                <Link
                  href={plan.customLink}
                  target="_blank"
                  className="candy-button w-full text-center py-3.5 text-sm justify-center"
                >
                  前往平台订阅
                </Link>
              ) : (
                <DynamicRegisterLink
                  href={siteConfig.registerUrl}
                  className="candy-button w-full text-center py-3.5 text-sm justify-center"
                >
                  立即订阅
                </DynamicRegisterLink>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. 底部权益保障横幅 */}
      <div className="sticker-card bg-slate-50/90 border-dashed p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center p-2">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 border-2 border-foreground shadow-[2px_2px_0px_0px_#1E293B]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-base mb-1">IPLC/IEPL 顶级国际专线</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">晚高峰速率不缩水，超低网络延迟与抖动，4K/8K 视频无卡顿秒开</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 border-2 border-foreground shadow-[2px_2px_0px_0px_#1E293B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-base mb-1">纯净住宅 IP · 防风控解封</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">独家针对 ChatGPT、Claude、TikTok 与海外流媒体深度定向优化</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 border-2 border-foreground shadow-[2px_2px_0px_0px_#1E293B]">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-base mb-1">全平台通用 · 无忧订阅</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">支持 iOS/Android/Mac/Windows/软路由客户端，流量不限时长或按月重置</p>
          </div>
        </div>
      </div>
    </div>
  );
}
