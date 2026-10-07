/**
 * Legal Pages Loader
 */
import { preprocessMdx } from './blog'

export interface PageItem {
  slug: string
  title: string
  description?: string
  body: string
}

function parseFrontmatter<T = Record<string, any>>(raw: string): { data: T; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {} as T, content: raw }
  const data: Record<string, any> = {}
  match[1].split(/\r?\n/).forEach((line) => {
    const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (kvMatch) {
      let val = kvMatch[2].trim().replace(/^['"]|['"]$/g, '')
      data[kvMatch[1].trim()] = val
    }
  })
  return { data: data as T, content: match[2] }
}

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
