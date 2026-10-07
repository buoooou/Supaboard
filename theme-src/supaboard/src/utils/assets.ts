/**
 * Asset URL Resolvers
 * Isolated from core bundles to avoid dragging asset maps into unrelated pages.
 */

// 仅在博客详情与文章渲染时使用
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
