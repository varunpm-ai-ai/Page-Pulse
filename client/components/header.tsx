"use client"

import { GlobeCheck } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'

const header = () => {
  return (
    <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900 shadow-sm">
            <GlobeCheck className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight text-slate-900">
              Page Pulse
            </div>
            <div className="text-sm text-slate-500">Website Health Inspector</div>
          </div>
        </div>

        <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm sm:block">
          Inspect any public webpage in seconds.
        </div>
      </div>
    </header>
  )
}

export default header
