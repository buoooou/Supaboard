import * as React from "react"
import Link from "next/link"
import { DynamicRegisterLink } from "@/components/dynamic-register-link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className, "relative bg-background border-t-4 border-foreground mt-20")}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:flex md:items-start md:gap-16 md:px-8 md:py-24">
        <div className="mb-12 md:mb-0 md:w-1/3">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg border-2 border-foreground shadow-[2px 2px 0px 0px #1E293B]">
              <Icons.logo className="size-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-black tracking-tighter uppercase">{siteConfig.name}</span>
          </div>
          <div className="flex flex-col md:flex-row md:px-0">
            <p className="text-sm font-sans font-medium text-left mt-4 opacity-70">
              © 2026 Supaboard Ltd.
            </p>
          </div>
          <p className="mt-4 text-base font-sans text-muted-foreground leading-relaxed">
            {siteConfig.description}
          </p>

          <div className="mt-8 flex gap-4 items-center">
            {[
              { href: siteConfig.links.twitter, icon: Icons.twitter },
              { href: siteConfig.links.github, icon: Icons.github },
              { href: siteConfig.links.telegram, icon: Icons.telegram },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-foreground bg-white shadow-[2px 2px 0px 0px #1E293B] hover:-translate-y-1 transition-all"
              >
                <item.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation columns */}
        <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-2">
          <div className="space-y-8">
            <h3 className="font-heading font-black text-sm tracking-widest uppercase text-primary">产品服务</h3>
            <ul className="space-y-4 font-sans font-bold text-base">
              <li>
                <DynamicRegisterLink href={siteConfig.registerUrl} className="hover:text-primary transition-colors">
                  登录
                </DynamicRegisterLink>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-primary transition-colors">
                  价格方案
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary transition-colors">
                  帮助文档
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-primary transition-colors">
                  合伙人计划
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-primary transition-colors">
                  更新日志
                </Link>
              </li>
              <li>
                <div className="text-muted-foreground flex items-center gap-2 cursor-default">
                  服务状态
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="所有系统运行正常" />
                </div>
              </li>
            </ul>
          </div>
          <div className="space-y-8">
            <h3 className="font-heading font-black text-sm tracking-widest uppercase text-secondary">相关资源</h3>
            <ul className="space-y-4 font-sans font-bold text-base">
              <li>
                <Link href="/privacy" className="hover:text-secondary transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-secondary transition-colors">
                  退款政策
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-secondary transition-colors">
                  滥用处理 (DMCA)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-secondary transition-colors">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="/aup" className="hover:text-secondary transition-colors">
                  使用守则 (AUP)
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-secondary transition-colors">
                  博客文章
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
