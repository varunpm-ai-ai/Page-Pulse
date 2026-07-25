"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  GlobeCheck,
  ClipboardClock,
  ScanSearch,
  GitFork,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    label: "Inspect URL",
    href: "/",
    icon: ScanSearch,
  },
    {
    label: "History",
    href: "/history",
    icon: ClipboardClock,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-background">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground shadow-sm">
            <GlobeCheck className="size-5" />
          </div>

          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              Page Pulse
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Website Health Inspector
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="GitHub repository">
              <a
                href="https://github.com/varunpm-ai-ai/Page-Pulse"
                target="_blank"
                rel="noreferrer"
              >
                <GitFork />
                <span>GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
