/**
 * Documentation Loader
 */
import { preprocessMdx } from './blog'

export interface DocItem {
  slug: string
  title: string
  description?: string
  date?: string
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
