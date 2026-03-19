"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { CalendarDays, ChevronDown, Download } from "lucide-react"

const smallText = "text-[11.86px] leading-[17.79px] font-normal text-[#667085]"
const bigText = "text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/assets"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="rounded-[18px] border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className={bigText}>Assets</h2>
                <p className={smallText}>
                  Consolidated view of HQ remittances across all branches for FY 2023-2024
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                  <CalendarDays className="h-4 w-4 text-[#6B7280]" />
                  Oct 2023
                  <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
                </button>
                <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
                  <Download className="h-4 w-4" /> Export for Audit
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[12px] border border-dashed border-[#E5E7EB] bg-white h-[520px]" />
          </div>
        </div>
      </main>
    </div>
  )
}
