"use client"

import { useState } from "react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"

export default function BranchAdminHrPlaceholder({
  title,
  activeHref,
}: {
  title: string
  activeHref: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar activeHref={activeHref} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col w-full min-h-[100dvh] p-6 lg:p-8">
        <h1 className="text-[20px] font-bold text-[#111827]">{title}</h1>
        <div className="mt-8 rounded-xl border border-[#EEF1F6] bg-white p-12 text-center">
          <p className="text-[15px] font-bold text-[#111827]">{title}</p>
          <p className="text-[13px] text-[#6B7280] mt-2">This module is coming soon.</p>
        </div>
      </div>
    </div>
  )
}
