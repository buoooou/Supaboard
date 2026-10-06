import type { Metadata } from "next"

import { siteConfig } from "@/config/site"
import { absoluteUrl, toAbsoluteUrl } from "@/lib/utils"

interface PageMetadataOptions {
  title: string
  description?: string
  /** Public path of the page, e.g. "/blog/foo". Becomes the canonical URL. */
  path: string
  /**
   * Page-specific share image (absolute URL or site-relative path). Defaults to
   * the site image: a page that defines `openGraph` does not inherit the
   * parent's `opengraph-image` file, so the fallback must be explicit.
   */
  image?: string
  /** Skip the root `%s | Supaboard` title template (titles that already carry the brand). */
  absoluteTitle?: boolean
  article?: {
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
  }
}

/**
 * Single source of per-page metadata. Next.js merges `openGraph`/`twitter`
 * shallowly, so every page must emit the full objects — this keeps canonical,
 * Open Graph and Twitter tags consistent across all routes.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle,
  article,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const imageUrl = toAbsoluteUrl(image ?? siteConfig.ogImage)

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: "zh_CN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      ...(article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
          }
        : { type: "website" }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}
