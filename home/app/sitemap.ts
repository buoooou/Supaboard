import { MetadataRoute } from "next"
import { allDocs, allPages } from "@/.content-collections/generated"

import { staticPages } from "@/config/pages"
import {
  getBlogPageCount,
  getBlogPagePath,
  getPublishedPosts,
} from "@/lib/blog"
import { absoluteUrl } from "@/lib/utils"

// Every URL here must be a final 200 page that matches its own canonical:
// content entries use the collection `route`, never the file `slug`.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts()
  const latestPostDate = posts[0] ? new Date(posts[0].date) : undefined

  // /blog is emitted with the archive pages below
  const staticRoutes = Object.values(staticPages).filter(
    (page) => page.path !== staticPages.blog.path
  )

  const blogArchivePages = Array.from(
    { length: getBlogPageCount() },
    (_, i) => getBlogPagePath(i + 1)
  )

  return [
    ...staticRoutes.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...blogArchivePages.map((route, i) => ({
      url: absoluteUrl(route),
      lastModified: i === 0 ? latestPostDate : undefined,
      changeFrequency: "weekly" as const,
      priority: i === 0 ? staticPages.blog.priority : 0.4,
    })),
    ...(allDocs || [])
      .filter((doc) => doc.published !== false)
      .map((doc) => ({
        url: absoluteUrl(doc.route),
        lastModified: doc.date,
        changeFrequency: "monthly" as const,
        priority: doc.route === "/docs" ? 0.8 : 0.6,
      })),
    ...(allPages || []).map((page) => ({
      url: absoluteUrl(page.route),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(post.route),
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
