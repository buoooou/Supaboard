import * as React from "react"
import Link from "next/link"
import { MainNavItem } from "types/nav"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

const navLinkClassName =
  "relative inline-flex h-10 w-max items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-4 font-heading font-bold">
      <Link href="/" className="hidden items-center space-x-2 lg:flex">
        <Icons.logo className="size-6" />
        <span>{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="hidden lg:flex gap-2">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer noopener" : undefined}
              className={navLinkClassName}
            >
              {item.title}
              {item.label && (
                <span className="absolute -top-2 right-0 z-10 ml-2 rounded-md bg-[#fbbf24] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
