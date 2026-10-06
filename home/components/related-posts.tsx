import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import type { PostSummary } from "@/lib/blog"

interface RelatedPostsProps {
  posts: PostSummary[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="font-heading text-2xl font-black mb-6">📖 相关推荐</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.route}
            href={post.route}
            className="group block rounded-xl border-2 border-border overflow-hidden hover:border-primary hover:shadow-md transition-all"
          >
            {post.image && (
              <div className="aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={225}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-heading font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <div className="mt-2 flex items-center text-xs text-primary font-medium">
                阅读更多
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
