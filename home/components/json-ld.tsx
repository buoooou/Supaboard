import { pricingCurrency, pricingPlans } from "@/config/pricing"
import { siteConfig } from "@/config/site"
import { absoluteUrl, toAbsoluteUrl } from "@/lib/utils"

const organizationId = `${siteConfig.url}/#organization`
const websiteId = `${siteConfig.url}/#website`
const logoUrl = `${siteConfig.url}/android-chrome-512x512.png`

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag early
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: logoUrl,
        description: siteConfig.description,
        foundingDate: "2024-01-01",
        areaServed: "Global",
        sameAs: siteConfig.sameAs,
        knowsAbout: [
          "VPN Services",
          "Proxy Services",
          "IPLC/IEPL",
          "Network Acceleration",
          "Internet Privacy",
          "Streaming Unlock"
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "supaboard@postions.app",
          url: absoluteUrl("/contact"),
          availableLanguage: ["Chinese", "English", "Japanese"],
        },
      }}
    />
  )
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "zh-CN",
        publisher: { "@id": organizationId },
      }}
    />
  )
}

interface FAQItem {
  question: string
  answer: string
}

export function FAQPageJsonLd({ faqs }: { faqs: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  )
}

interface BlogPostJsonLdProps {
  title: string
  description?: string
  datePublished: string
  dateModified?: string
  image?: string
  author?: { name: string; url?: string }
  url: string
}

export function BlogPostJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  image,
  author,
  url,
}: BlogPostJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: description,
        datePublished,
        dateModified: dateModified || datePublished,
        image: image ? toAbsoluteUrl(image) : undefined,
        inLanguage: "zh-CN",
        author: author
          ? { "@type": "Person", name: author.name, url: author.url }
          : { "@id": organizationId },
        publisher: {
          "@type": "Organization",
          "@id": organizationId,
          name: siteConfig.name,
          logo: {
            "@type": "ImageObject",
            url: logoUrl,
          },
        },
        isPartOf: { "@id": websiteId },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".mdx > p:first-of-type"],
        },
      }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  href: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }}
    />
  )
}

/** Plans sold through the Supaboard panel (third-party store items excluded). */
const panelPlans = pricingPlans.filter((plan) => !plan.isAiToken)

export function ServiceJsonLd() {
  const prices = panelPlans.map((plan) => Number(plan.price))

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${siteConfig.name} 网络加速服务`,
        serviceType: "IPLC/IEPL 专线网络加速与代理订阅",
        description: siteConfig.description,
        provider: { "@id": organizationId },
        areaServed: "Global",
        url: siteConfig.url,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: pricingCurrency,
          lowPrice: Math.min(...prices).toFixed(2),
          highPrice: Math.max(...prices).toFixed(2),
          offerCount: panelPlans.length,
          url: absoluteUrl("/#pricing"),
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Supaboard 套餐",
          itemListElement: panelPlans.map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: Number(plan.price).toFixed(2),
            priceCurrency: pricingCurrency,
            description: [plan.unit.replace(/^\//, ""), ...plan.features].join("；"),
          })),
        },
      }}
    />
  )
}
