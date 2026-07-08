"use client"

import SidebarNav from "@/components/navigation/SidebarNav"

export default function HrPlaceholder({
  title,
  activeHref,
}: {
  title: string
  activeHref: string
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref={activeHref}
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <h1 className="text-[24px] leading-none font-bold text-[#111827]">{title}</h1>
          <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Human Resourcing</p>
          <div className="mt-8 rounded-xl border border-[#EEF1F6] bg-white p-12 text-center">
            <p className="text-[15px] font-bold text-[#111827]">{title}</p>
            <p className="text-[13px] text-[#6B7280] mt-2">This module is coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
