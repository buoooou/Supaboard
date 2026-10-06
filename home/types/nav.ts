import { Icons } from "@/components/icons"

export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
  label?: string
  description?: string
  manager?: boolean
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

// MainNavItem 继承自 NavItem，并且 href 必须是字符串
export interface MainNavItem extends Omit<NavItemWithChildren, "href"> {
  href: string
}

export interface SidebarNavItem extends NavItemWithChildren {}
