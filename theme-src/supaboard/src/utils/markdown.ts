import MarkdownIt from 'markdown-it'
import { resolveBlogImageUrl } from './content'

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

const defaultLinkOpen =
  md.renderer.rules.link_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  let href = tokens[idx].attrGet('href') || ''
  if (/^https?:/i.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener')
  } else if (href.startsWith('/') && !href.startsWith('/#') && !href.startsWith('//')) {
    // 转换为 hash 路由以在 SPA 内部正常跳转
    tokens[idx].attrSet('href', '#' + href)
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

const defaultImage =
  md.renderer.rules.image || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const src = tokens[idx].attrGet('src') || ''
  if (src.startsWith('/blog/') || src.startsWith('blog/')) {
    tokens[idx].attrSet('src', resolveBlogImageUrl(src))
  }
  return defaultImage(tokens, idx, options, env, self)
}

export function renderMarkdown(src: string | null | undefined): string {
  return md.render(src || '')
}
