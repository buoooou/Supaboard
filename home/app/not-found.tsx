"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Book,
  MessageCircle,
  Newspaper,
} from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="w-full bg-background dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-in-out">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl tracking-tighter text-blue-500 dark:text-blue-400 font-medium">
              404 页面不存在
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              抱歉，您访问的页面不存在或已被移除。以下链接可能对您有帮助。
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回上页
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-primary-foreground hover:bg-blue-500/90 h-10 px-4 py-2"
            >
              返回首页
            </Link>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ease-in-out">
          <Link
            href="/tutorial"
            className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
              <Book className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-foreground">使用教程</h3>
              <p className="mt-2 text-muted-foreground">
                详细的客户端配置与使用指南。
              </p>
              <div className="mt-3 inline-flex items-center text-blue-500 dark:text-blue-400">
                查看教程
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
          <Link
            href="/blog"
            className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
              <Newspaper className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-foreground">博客文章</h3>
              <p className="mt-2 text-muted-foreground">
                阅读最新的技术干货和产品动态。
              </p>
              <div className="mt-3 inline-flex items-center text-blue-500 dark:text-blue-400">
                浏览博客
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
          <Link
            href="/contact"
            className="group relative rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
              <MessageCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-foreground">联系我们</h3>
              <p className="mt-2 text-muted-foreground">
                找不到需要的内容？联系我们获取帮助。
              </p>
              <div className="mt-3 inline-flex items-center text-blue-500 dark:text-blue-400">
                获取支持
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
