import { allPosts } from "@/.content-collections/generated"

export const POSTS_PER_PAGE = 6

export type Post = (typeof allPosts)[number]

/** Lightweight shape passed to list UIs (avoids shipping compiled MDX). */
export interface PostSummary {
  route: string
  title: string
  description?: string
  date: string
  image?: string
}

export function getPublishedPosts(): Post[] {
  return (allPosts || [])
    .filter((post) => post.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((post) => post.slugAsParams === slug)
}

export function toPostSummary(post: Post): PostSummary {
  return {
    route: post.route,
    title: post.title,
    description: post.description,
    date: post.date,
    image: post.image,
  }
}

export function getBlogPageCount(): number {
  return Math.max(1, Math.ceil(getPublishedPosts().length / POSTS_PER_PAGE))
}

/** Page 1 lives at /blog; later pages at /blog/page/N (crawlable, static). */
export function getBlogPagePath(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`
}

export function getPostsForPage(page: number): PostSummary[] {
  return getPublishedPosts()
    .slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)
    .map(toPostSummary)
}

/** Ranks other posts by title-keyword overlap, newest first on ties. */
export function getRelatedPosts(post: Post, limit = 3): PostSummary[] {
  const keywords = post.title
    .split(/[\s，、：|—]/)
    .filter((word) => word.length >= 2)

  return getPublishedPosts()
    .filter((candidate) => candidate.slugAsParams !== post.slugAsParams)
    .map((candidate) => ({
      candidate,
      score: keywords.filter(
        (keyword) =>
          candidate.title.includes(keyword) ||
          candidate.description?.includes(keyword)
      ).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => toPostSummary(candidate))
}
