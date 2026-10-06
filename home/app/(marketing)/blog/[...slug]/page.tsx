import { notFound } from "next/navigation"
import { allAuthors } from "@/.content-collections/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
  type Post,
} from "@/lib/blog"
import { buildPageMetadata } from "@/lib/seo"
import { absoluteUrl, cn, formatDate } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/components/json-ld"
import { RelatedPosts } from "@/components/related-posts"

interface PostPageProps {
  params: Promise<{
    slug: string[]
  }>
}

function getAuthors(post: Post) {
  return post.authors
    .map((author) => allAuthors.find(({ slug }) => slug === `/authors/${author}`))
    .filter((author): author is NonNullable<typeof author> => Boolean(author))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug((await params).slug.join("/"))

  if (!post) {
    return {}
  }

  const authors = getAuthors(post)

  return {
    ...buildPageMetadata({
      title: post.title,
      description: post.description,
      path: post.route,
      image: post.image,
      article: {
        publishedTime: new Date(post.date).toISOString(),
        authors: authors.map((author) => `https://x.com/${author.twitter}`),
      },
    }),
    authors: authors.map((author) => ({
      name: author.title,
      url: `https://x.com/${author.twitter}`,
    })),
  }
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return getPublishedPosts().map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug((await params).slug.join("/"))

  if (!post) {
    notFound()
  }

  const authors = getAuthors(post)
  const primaryAuthor = authors[0]

  return (
    <article className="container relative max-w-4xl py-4">
      <BreadcrumbJsonLd
        items={[
          { name: "首页", href: "/" },
          { name: "博客", href: "/blog" },
          { name: post.title, href: post.route },
        ]}
      />
      <BlogPostJsonLd
        title={post.title}
        description={post.description}
        datePublished={new Date(post.date).toISOString()}
        image={post.image}
        author={
          primaryAuthor && {
            name: primaryAuthor.title,
            url: `https://x.com/${primaryAuthor.twitter}`,
          }
        }
        url={absoluteUrl(post.route)}
      />
      <div>
        {post.date && (
          <time
            dateTime={post.date}
            className="block text-sm text-muted-foreground"
          >
            发布于 {formatDate(post.date)}
          </time>
        )}
        <h1 className="mt-2 inline-block font-heading text-4xl leading-tight lg:text-5xl">
          {post.title}
        </h1>
        {authors?.length ? (
          <div className="mt-4 flex space-x-4">
            {authors.map((author) =>
              author ? (
                <Link
                  key={author.twitter}
                  href={`https://x.com/${author.twitter}`}
                  rel="author"
                  className="flex items-center space-x-2 text-sm"
                >
                  <Image
                    src={author.avatar}
                    alt={author.title}
                    width={42}
                    height={42}
                    className="rounded-full bg-white"
                  />
                  <div className="flex-1 text-left leading-tight">
                    <p className="font-medium">{author.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      @{author.twitter}
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        ) : null}
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={720}
          height={405}
          className="my-8 rounded-md border bg-muted transition-colors"
          priority
        />
      )}
      <Mdx code={post.body.code} />

      <RelatedPosts posts={getRelatedPosts(post)} />

      <hr className="mt-12" />
      <div className="flex justify-center py-6 lg:py-10">
        <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.chevronLeft className="mr-2 size-4" />
          查看全部文章
        </Link>
      </div>
    </article>
  )
}
