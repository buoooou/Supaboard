import Link from "next/link"
import { Github, Mail, Twitter } from "lucide-react"

import { siteConfig } from "@/config/site"
import { staticPages } from "@/config/pages"
import { buildPageMetadata } from "@/lib/seo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"

export const metadata = buildPageMetadata(staticPages.contact)
const contactCards = [
  {
    title: "X(Twitter)",
    description: "点击这里获取更多帮助。",
    icon: Twitter,
    href: siteConfig.links.twitter,
  },
  {
    title: "Github",
    description: "关注产品更新和开源工作。",
    icon: Github,
    href: siteConfig.links.github,
  },
  {
    title: "Telegram",
    description: "加入社区，咨询产品问题。",
    icon: Icons.telegram,
    href: siteConfig.links.telegram,
  },
  {
    title: "电子邮箱",
    // The whole card is already a mailto link; a styled span keeps the look
    // without nesting <a> inside <a> (invalid HTML, causes hydration errors)
    description: (
      <>
        联系邮箱：{" "}
        <span className="underline hover:text-primary transition-colors">
          supaboard@postions.app
        </span>
        。
      </>
    ),
    icon: Mail,
    href: "mailto:supaboard@postions.app",
  },
]
export default function BusinessPlanPage() {
  return (
    <section className="container flex flex-col gap-6 md:max-w-[64rem] pt-5 overflow-hidden">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          联系我们
        </h1>
      </div>
      <Card className="h-full bg-background/50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            感谢您关注 Supaboard。
          </div>
          <CardDescription className="mt-2">
            如果您有关于部署、私有化定制或产品支持的问题，请随时联系我们。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {contactCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block transition-transform hover:-translate-y-1"
            >
              <Card className="h-full bg-background/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <card.icon className="w-6 h-6 text-muted-foreground" />
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
