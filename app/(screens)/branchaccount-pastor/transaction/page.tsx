"use client"

import { useState } from "react"
import { Bell, Download, Menu, Search } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { BankTransactions } from "@/app/(screens)/director-screen/transaction/page"

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchAccountantSidebar
        activeHref="/branchaccount-pastor/transaction"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 min-w-0 text-[#111827]">
        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[15px] font-bold text-[#111827]">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827]" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 right-0 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="w-full px-4 pt-5 pb-6 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
          {/* Header actions (no currency / branch / month filters for accountant) */}
          <div className="mb-6 sm:mb-8 flex items-center justify-end gap-3 border-b border-[#EEF1F6] pb-5 sm:pb-6">
            <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-3.5 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>

          <BankTransactions />
        </div>
      </main>
    </div>
  )
}
