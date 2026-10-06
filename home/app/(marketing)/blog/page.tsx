import { getBlogPageCount, getPostsForPage } from "@/lib/blog"
import { staticPages } from "@/config/pages"
import { buildPageMetadata } from "@/lib/seo"
import { BlogArchive } from "@/components/blog-post-list"

export const metadata = buildPageMetadata(staticPages.blog)

export default function BlogPage() {
  return (
    <BlogArchive
      posts={getPostsForPage(1)}
      currentPage={1}
      totalPages={getBlogPageCount()}
    />
  )
}
