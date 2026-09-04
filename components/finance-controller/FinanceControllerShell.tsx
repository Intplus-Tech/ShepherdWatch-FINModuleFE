"use client"

import { Bell, Search } from "lucide-react"
import FinanceControllerSidebar from "@/components/navigation/FinanceControllerSidebar"

/**
 * Page frame for the Finance Controller (Admin's View) screens: sidebar,
 * top bar with search + notifications, and the scrollable content column.
 */
export default function FinanceControllerShell({
  activeHref,
  topbarTitle = "Dashboard",
  children,
}: {
  activeHref: string
  topbarTitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white font-sans text-[#111827]">
      <FinanceControllerSidebar activeHref={activeHref} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[46px] shrink-0 items-center justify-between border-b border-[#EEF1F6] px-4 sm:px-6">
          <span className="text-[13px] font-bold text-[#111827]">{topbarTitle}</span>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[30px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-8 pr-3 text-[12px] outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
