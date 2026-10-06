import { notFound } from "next/navigation"
import { allPages } from "@/.content-collections/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"

import { buildPageMetadata } from "@/lib/seo"

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

async function getPageFromParams(params: { slug: string[] }) {
  const slug = params?.slug?.join("/")
  const page = allPages?.find((page) => page.slugAsParams === slug)

  if (!page) {
    return null
  }

  return page
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPageFromParams(await params)

  if (!page) {
    return {}
  }

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.route,
  })
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  if (!allPages) {
    console.error("Content-collections: allPages is undefined!")
    return []
  }

  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }))
}

export default async function PagePage({ params }: PageProps) {
  const page = await getPageFromParams(await params)

  if (!page) {
    notFound()
  }

  return (
    <article className="container max-w-3xl py-6 lg:py-12">
      <div className="space-y-4">
        <h1 className="inline-block font-heading text-4xl lg:text-5xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-xl text-muted-foreground">{page.description}</p>
        )}
      </div>
      <hr className="my-4" />
      <Mdx code={page.body.code} />
    </article>
  )
}
