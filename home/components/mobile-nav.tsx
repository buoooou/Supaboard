"use client";

import * as React from "react";
import Link, { LinkProps } from "next/link";
import { PanelLeft } from "lucide-react"
import { MainNavItem, SidebarNavItem } from "types/nav"

import { docsConfig } from "@/config/docs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"

interface MobileNavProps {
  mainNav?: MainNavItem[]
  sidebarNav?: SidebarNavItem[]
}

export function MobileNav({
  mainNav = docsConfig.mainNav,
  sidebarNav = docsConfig.sidebarNav,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <PanelLeft />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Logo className="size-6" />
          <span className="ml-2 font-bold">{siteConfig.name}</span>
        </MobileLink>
        <div className="my-4 h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {mainNav?.map(
              (item) =>
                item.href && (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer noopener" : undefined}
                    onOpenChange={setOpen}
                  >
                    {item.title}
                  </MobileLink>
                )
            )}
          </div>
          {sidebarNav?.length ? (
            <div className="flex flex-col space-y-2">
              {sidebarNav.map((item, index) => (
                <div key={index} className="flex flex-col space-y-3 pt-6">
                  <h4 className="font-medium">{item.title}</h4>
                  {item?.items?.length &&
                    item.items.map((item) => (
                      <React.Fragment key={item.href}>
                        {!item.disabled &&
                          (item.href ? (
                            <MobileLink
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noreferrer noopener" : undefined}
                              onOpenChange={setOpen}
                              className="pl-4 text-muted-foreground"
                            >
                              {item.title}
                              {item.label && (
                                <span
                                  className={`ml-2 rounded-md px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline ${item.label === "New"
                                    ? " bg-[#adfa1d]"
                                    : item.label === "Hot"
                                      ? " bg-[#dc2626] "
                                      : ""
                                    }`}
                                >
                                  {item.label}
                                </span>
                              )}
                            </MobileLink>
                          ) : (
                            item.title
                          ))}
                      </React.Fragment>
                    ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  target,
  rel,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={() => {
        if (href.toString().startsWith("#")) {
          return
        }
        onOpenChange?.(false)
      }}
      className={cn(className, "font-heading font-bold")}
      {...props}
    >
      {children}
    </Link>
  )
}
