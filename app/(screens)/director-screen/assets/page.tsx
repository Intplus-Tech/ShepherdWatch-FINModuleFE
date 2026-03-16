"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { ChevronDown, Download } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/assets" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

            <div className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4 min-h-[480px]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-[#111827]">Assets</h2>
                  <p className="text-[10px] text-[#9CA3AF]">
                    Consolidated view of HQ remittances across all branches for FY 2023-2024
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                    Oct 2023
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button className="flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-2.5 py-1.5 text-[10px] text-white">
                    <Download className="h-3 w-3" /> Export for Audit
                  </button>
                </div>
              </div>

              <div className="mt-6 h-[320px] rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB]" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
