/**
 * Optimized Blog Data Loader
 * - Metadata is loaded from lightweight blog-meta.json (~12KB)
 * - Article bodies are code-split and loaded on demand per slug
 */
import rawMeta from '@/content/blog-meta.json'
import { resolveBlogImageUrl } from './assets'

export interface BlogPostMeta {
  slug: string
  title: string
  description?: string
  date: string
  image?: string
  authors: string[]
}

export interface BlogPost extends BlogPostMeta {
  body?: string
}

export const blogPosts: BlogPost[] = (rawMeta as BlogPostMeta[]).map((item) => ({
  ...item,
  image: resolveBlogImageUrl(item.image),
}))

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getRelatedPosts(current: BlogPostMeta, limit = 3): BlogPost[] {
  const keywords = current.title.split(/[\s，、：|—()（）]/).filter((w) => w.length >= 2)
  return blogPosts
    .filter((p) => p.slug !== current.slug)
    .map((candidate) => {
      let score = 0
      keywords.forEach((kw) => {
        if (candidate.title.includes(kw)) score += 2
        if (candidate.description?.includes(kw)) score += 1
      })
      return { candidate, score }
    })
    .sort((a, b) => b.score - a.score || new Date(b.candidate.date).getTime() - new Date(a.candidate.date).getTime())
    .slice(0, limit)
    .map((item) => item.candidate)
}

// 动态按需加载文章正文
const blogLoaders = import.meta.glob<string>('../content/blog/*.mdx', { query: '?raw', import: 'default' })
const bodyCache = new Map<string, string>()

export function preprocessMdx(src: string): string {
  return src
    .replace(/<Steps>/g, '<div class="sb-steps-container space-y-4 my-6">')
    .replace(/<\/Steps>/g, '</div>')
    .replace(/<Step>(.*?)<\/Step>/gs, (_, title) => {
      return `<div class="sb-step-item flex items-center gap-3 font-heading font-black text-lg text-primary pt-2 border-t-2 border-ink/10"><span class="sb-badge bg-primary text-white">步骤</span> ${title}</div>`
    })
}

export function parseFrontmatterBody(raw: string): string {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  return match ? match[2] : raw
}

export async function loadBlogPostBody(slug: string): Promise<string> {
  if (bodyCache.has(slug)) return bodyCache.get(slug)!
  const key = `../content/blog/${slug}.mdx`
  const loader = blogLoaders[key]
  if (!loader) return ''
  try {
    const raw = await loader()
    const body = preprocessMdx(parseFrontmatterBody(raw))
    bodyCache.set(slug, body)
    return body
  } catch {
    return ''
  }
}
