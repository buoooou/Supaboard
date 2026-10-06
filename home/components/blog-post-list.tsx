import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getBlogPagePath, type PostSummary } from "@/lib/blog"
import { formatDate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function BlogPostGrid({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) {
    return <p>No posts published.</p>
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) => (
        <article
          key={post.route}
          className="sticker-card p-4 group relative flex flex-col space-y-4 hover:bg-muted/50 transition-colors"
        >
          {post.image && (
            <div className="overflow-hidden rounded-xl border-2 border-foreground shadow-[2px 2px 0px 0px #1E293B]">
              <Image
                src={post.image}
                alt={post.title}
                width={504}
                height={252}
                className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                priority={index <= 1}
              />
            </div>
          )}
          <div className="flex-grow space-y-2">
            <h2 className="text-2xl font-black font-heading leading-tight">{post.title}</h2>
            {post.description && (
              <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-dashed">
            {post.date && (
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {formatDate(post.date)}
              </p>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border border-foreground shadow-[2px 2px 0px 0px #1E293B]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <Link href={post.route} className="absolute inset-0">
            <span className="sr-only">View Article</span>
          </Link>
        </article>
      ))}
    </div>
  )
}

// Markup mirrors the previous client-side pagination; only the hrefs changed
// from `?page=N` to crawlable static paths.
export function BlogPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-12">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={getBlogPagePath(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {/* Desktop view */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1
              if (
                totalPages > 5 &&
                Math.abs(pageNum - currentPage) > 1 &&
                pageNum !== 1 &&
                pageNum !== totalPages
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={getBlogPagePath(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
          </div>

          {/* Mobile view */}
          <PaginationItem className="sm:hidden px-4 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href={getBlogPagePath(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function BlogArchive({
  posts,
  currentPage,
  totalPages,
}: {
  posts: PostSummary[]
  currentPage: number
  totalPages: number
}) {
  return (
    <div className="container py-4 max-w-7xl">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            最新的产品动态、网络技术干货以及隐私安全指南。
          </p>
        </div>
      </div>
      <hr className="my-8" />
      <BlogPostGrid posts={posts} />
      <BlogPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
