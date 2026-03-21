"use client"

import React from "react"
import { Search, Bell, Menu } from "lucide-react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

interface BranchAdminHeaderProps {
  title?: string
  onMenuClick?: () => void
}

export default function BranchAdminHeader({ title = "Dashboard", onMenuClick }: BranchAdminHeaderProps) {
  return (
    <header className={`flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6 ${inter.className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block text-[15px] font-[800] text-[#111827]">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end max-w-[320px] sm:max-w-none">
        <div className="relative flex-1 w-full sm:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            placeholder="Search requisitions..."
            className="h-[38px] w-full rounded-[8px] border border-transparent bg-[#F3F4F6] pl-10 pr-3 text-[13px] text-[#111827] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
          />
        </div>
        <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-[#EEF1F6] hover:border-[#E5E7EB]">
          <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          <span className="absolute right-2 sm:right-2.5 top-2 sm:top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  )
}
