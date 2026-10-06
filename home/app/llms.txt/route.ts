import { allDocs, allPages } from "@/.content-collections/generated"

import { staticPages } from "@/config/pages"
import { pricingCurrency, pricingPlans } from "@/config/pricing"
import { siteConfig } from "@/config/site"
import { getPublishedPosts } from "@/lib/blog"
import { absoluteUrl } from "@/lib/utils"

// Generated at build time from the same sources as the site (config + MDX),
// following https://llmstxt.org — it cannot drift from the published pages.
export const dynamic = "force-static"

function link(title: string, path: string, description?: string) {
  return `- [${title}](${absoluteUrl(path)})${description ? `: ${description}` : ""}`
}

export function GET() {
  const panelPrices = pricingPlans
    .filter((plan) => !plan.isAiToken)
    .map((plan) => Number(plan.price))
  const docs = (allDocs || [])
    .filter((doc) => doc.published !== false)
    .sort((a, b) => a.route.localeCompare(b.route))

  const sections = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.description}`,
    [
      "## Key Facts",
      "- 服务类型: IPLC/IEPL 跨境专线网络加速与代理订阅",
      `- 套餐价格: ${pricingCurrency} ${Math.min(...panelPrices)} – ${Math.max(...panelPrices)}（月/季/年周期订阅与不限时流量包，详见 ${absoluteUrl("/#pricing")}）`,
      "- 支持平台: Windows、macOS、iOS、Android",
      "- 推荐客户端: Clash Verge Rev（Windows/macOS）、Shadowrocket（iOS）、Clash Meta for Android",
      "- 适用场景: ChatGPT/Claude 等 AI 服务访问，Netflix、Disney+、YouTube 等流媒体解锁",
    ].join("\n"),
    [
      "## Pages",
      ...Object.values(staticPages).map((page) =>
        link(page.label, page.path, page.description)
      ),
    ].join("\n"),
    ["## Docs", ...docs.map((doc) => link(doc.title, doc.route, doc.description))].join("\n"),
    [
      "## Blog",
      ...getPublishedPosts().map((post) =>
        link(post.title, post.route, post.description)
      ),
    ].join("\n"),
    [
      "## Optional",
      ...(allPages || []).map((page) => link(page.title, page.route, page.description)),
    ].join("\n"),
    [
      "## Contact",
      `- Email: supaboard@postions.app`,
      `- Telegram Bot: ${siteConfig.telegramBot}`,
      ...siteConfig.sameAs.map((profile) => `- Official profile: ${profile}`),
    ].join("\n"),
  ]

  return new Response(sections.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
