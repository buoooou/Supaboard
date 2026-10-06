/**
 * Content loader for Docs, Blog, Legal Pages and Authors
 */

export interface DocItem {
  slug: string
  title: string
  description?: string
  date?: string
  body: string
}

export interface PageItem {
  slug: string
  title: string
  description?: string
  body: string
}

export interface BlogPost {
  slug: string
  title: string
  description?: string
  date: string
  image?: string
  authors: string[]
  body: string
}

// 1. Resolve compiled image URLs
const blogImages = import.meta.glob<string>('../assets/blog/*', { eager: true, import: 'default' })
const avatarImages = import.meta.glob<string>('../assets/images/**/*', { eager: true, import: 'default' })

export function resolveBlogImageUrl(imgPath?: string): string {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath
  const clean = imgPath.replace(/^\/blog\//, '').replace(/^blog\//, '')
  const webpClean = clean.replace(/\.(png|jpe?g)$/i, '.webp')
  const keyWebp = `../assets/blog/${webpClean}`
  if (blogImages[keyWebp]) return blogImages[keyWebp]
  const key = `../assets/blog/${clean}`
  if (blogImages[key]) return blogImages[key]
  return imgPath
}

export function resolveAvatarUrl(avatarPath?: string): string {
  if (!avatarPath) return ''
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath
  const clean = avatarPath.replace(/^\/images\//, '').replace(/^images\//, '')
  const key = `../assets/images/${clean}`
  if (avatarImages[key]) return avatarImages[key]
  return avatarPath
}

// 2. Simple frontmatter parser
export function parseFrontmatter<T = Record<string, any>>(raw: string): { data: T; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { data: {} as T, content: raw }
  }

  const yamlStr = match[1]
  const content = match[2]
  const data: Record<string, any> = {}

  let currentKey = ''
  let currentArray: string[] | null = null

  yamlStr.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    // Array item: "  - buoooou"
    const arrayItemMatch = line.match(/^\s*-\s+(.*)$/)
    if (arrayItemMatch) {
      if (currentKey && currentArray) {
        currentArray.push(arrayItemMatch[1].trim().replace(/^['"]|['"]$/g, ''))
      }
      return
    }

    // Key-value item: "title: 服务条款"
    const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1].trim()
      let val = kvMatch[2].trim()

      if (!val) {
        // Multi-line or array follows
        currentKey = key
        currentArray = []
        data[key] = currentArray
        return
      }

      currentKey = key
      currentArray = null

      // Inline array: ["all", "monthly"]
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          data[key] = JSON.parse(val)
          return
        } catch {}
      }

      // Quoted string
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }

      if (val === 'true') data[key] = true
      else if (val === 'false') data[key] = false
      else data[key] = val
    }
  })

  return { data: data as T, content }
}

// 3. Transform MDX tags like <Steps> and <Step>
export function preprocessMdx(src: string): string {
  return src
    .replace(/<Steps>/g, '<div class="sb-steps-container space-y-4 my-6">')
    .replace(/<\/Steps>/g, '</div>')
    .replace(/<Step>(.*?)<\/Step>/gs, (_, title) => {
      return `<div class="sb-step-item flex items-center gap-3 font-heading font-black text-lg text-primary pt-2 border-t-2 border-ink/10"><span class="sb-badge bg-primary text-white">步骤</span> ${title}</div>`
    })
}

// 4. Load Docs
const rawDocs = import.meta.glob<string>('../content/docs/*.mdx', { eager: true, query: '?raw', import: 'default' })

export const docsList: DocItem[] = Object.entries(rawDocs).map(([filepath, raw]) => {
  const filename = filepath.split('/').pop() || ''
  const slug = filename.replace(/\.mdx$/, '')
  const { data, content } = parseFrontmatter<Partial<DocItem>>(raw)
  return {
    slug: slug === 'index' ? '' : slug,
    title: data.title || slug,
    description: data.description,
    date: data.date,
    body: preprocessMdx(content),
  }
})

export function getDocBySlug(slug: string = ''): DocItem | undefined {
  const normalized = slug === 'index' ? '' : slug
  return docsList.find((d) => d.slug === normalized) || docsList.find((d) => d.slug === '')
}

// 5. Load Legal Pages
const rawPages = import.meta.glob<string>('../content/pages/*.mdx', { eager: true, query: '?raw', import: 'default' })

export const legalPages: Record<string, PageItem> = {}
Object.entries(rawPages).forEach(([filepath, raw]) => {
  const filename = filepath.split('/').pop() || ''
  const slug = filename.replace(/\.mdx$/, '')
  const { data, content } = parseFrontmatter<Partial<PageItem>>(raw)
  legalPages[slug] = {
    slug,
    title: data.title || slug,
    description: data.description,
    body: preprocessMdx(content),
  }
})

// 6. Load Blog Posts
const rawBlog = import.meta.glob<string>('../content/blog/*.mdx', { eager: true, query: '?raw', import: 'default' })

export const blogPosts: BlogPost[] = Object.entries(rawBlog)
  .map(([filepath, raw]) => {
    const filename = filepath.split('/').pop() || ''
    const slug = filename.replace(/\.mdx$/, '')
    const { data, content } = parseFrontmatter<{
      title?: string
      description?: string
      date?: string
      image?: string
      authors?: string[]
      published?: boolean
    }>(raw)

    let parsedBody: string | null = null

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date ? String(data.date) : '',
      image: resolveBlogImageUrl(data.image),
      authors: Array.isArray(data.authors) ? data.authors : ['buoooou'],
      get body() {
        if (parsedBody === null) {
          parsedBody = preprocessMdx(content)
        }
        return parsedBody
      },
    }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getRelatedPosts(current: BlogPost, limit = 3): BlogPost[] {
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
