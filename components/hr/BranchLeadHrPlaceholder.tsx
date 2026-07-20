"use client"

import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"

export default function BranchLeadHrPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">{title}</span>
        </div>
        <div className="mt-8 rounded-[14px] border border-[#EEF1F6] bg-white p-12 text-center">
          <p className="text-[15px] font-bold text-[#111827]">{title}</p>
          <p className="text-[13px] text-[#6B7280] mt-2">This module is coming soon.</p>
        </div>
      </main>
    </div>
  )
}
