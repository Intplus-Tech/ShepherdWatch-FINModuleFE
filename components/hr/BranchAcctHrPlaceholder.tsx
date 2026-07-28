"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"

export default function BranchAcctHrPlaceholder({
  title,
  activeHref,
}: {
  title: string
  activeHref: string
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref={activeHref} />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        <h1 className="text-[20px] font-bold text-[#111827]">{title}</h1>
        <div className="mt-8 rounded-xl border border-[#EEF1F6] bg-white p-12 text-center">
          <p className="text-[15px] font-bold text-[#111827]">{title}</p>
          <p className="text-[13px] text-[#6B7280] mt-2">This module is coming soon.</p>
        </div>
      </main>
    </div>
  )
}
