import Link from "next/link"
import { DynamicRegisterLink, DynamicLoginLink } from "@/components/dynamic-register-link"

import { siteConfig } from "@/config/site"
import { marketingConfig } from "@/config/marketing"
import { docsConfig } from "@/config/docs"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { SiteFooter } from "@/components/site-footer"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background dot-grid">
      <header className="sticky z-50 top-0 w-full border-b-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-6">
          <MainNav items={marketingConfig.mainNav} />
          <MobileNav mainNav={marketingConfig.mainNav} sidebarNav={docsConfig.sidebarNav} />
          <div className="flex flex-1 items-center space-x-4 justify-end">
            <nav className="flex items-center gap-4">
              <DynamicLoginLink
                href={siteConfig.loginUrl}
                className="inline-flex items-center justify-center rounded-full border-2 border-foreground bg-white px-6 py-2 text-sm font-heading font-bold shadow-[2px 2px 0px 0px #1E293B] hover:bg-tertiary transition-all"
              >
                登录
              </DynamicLoginLink>
              <DynamicRegisterLink
                href={siteConfig.registerUrl}
                className="inline-flex items-center justify-center rounded-full border-2 border-foreground bg-foreground px-6 py-2 text-sm font-heading font-bold shadow-[2px 2px 0px 0px #1E293B] hover:bg-foreground/90 transition-all text-background"
              >
                注册
              </DynamicRegisterLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-20">{children}</main>
      <SiteFooter />
    </div>
  )
}
