import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getBlogPageCount,
  getBlogPagePath,
  getPostsForPage,
} from "@/lib/blog"
import { buildPageMetadata } from "@/lib/seo"
import { BlogArchive } from "@/components/blog-post-list"

interface BlogPaginatedPageProps {
  params: Promise<{ page: string }>
}

// Page 1 is served by /blog; only pages 2..N exist here.
export const dynamicParams = false

export function generateStaticParams() {
  return Array.from({ length: getBlogPageCount() - 1 }, (_, i) => ({
    page: String(i + 2),
  }))
}

function parsePage(value: string) {
  const page = Number(value)
  return Number.isInteger(page) && page >= 2 && page <= getBlogPageCount()
    ? page
    : null
}

export async function generateMetadata({
  params,
}: BlogPaginatedPageProps): Promise<Metadata> {
  const page = parsePage((await params).page)
  if (!page) {
    return {}
  }

  const titles = getPostsForPage(page)
    .slice(0, 3)
    .map((post) => post.title)
    .join("；")

  return buildPageMetadata({
    title: `博客 — 第 ${page} 页`,
    description: `Supaboard 博客文章列表第 ${page} 页，收录翻墙教程、客户端配置与网络加速干货，本页包括：${titles}`,
    path: getBlogPagePath(page),
  })
}

export default async function BlogPaginatedPage({
  params,
}: BlogPaginatedPageProps) {
  const page = parsePage((await params).page)
  if (!page) {
    notFound()
  }

  return (
    <BlogArchive
      posts={getPostsForPage(page)}
      currentPage={page}
      totalPages={getBlogPageCount()}
    />
  )
}
