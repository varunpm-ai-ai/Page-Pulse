"use client"

import type { ReactNode } from "react"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

type SiteShellProps = {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default SiteShell
