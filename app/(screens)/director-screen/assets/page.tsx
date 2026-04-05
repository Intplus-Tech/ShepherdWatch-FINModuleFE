"use client"

import { useState } from "react"
import Image from "next/image"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { CalendarDays, ChevronDown, Download, Menu } from "lucide-react"

const smallText = "text-[11.86px] leading-[17.79px] font-normal text-[#667085]"
const bigText = "text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]"

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm xl:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SidebarNav
        activeHref="/director-screen/assets"
        className={`fixed inset-y-0 left-0 z-40 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6] transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } xl:static xl:flex`}
      />

      <main className="flex-1 flex flex-col min-w-0 text-[#111827]">
        {/* Mobile Header Top Bar */}
        <header className="xl:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={130} height={28} className="object-contain" />
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
            <Image src="/images/Beared%20Guy02-min%201.jpg" alt="User" width={32} height={32} className="h-full w-full object-cover" />
          </div>
        </header>

        <div className="mx-auto w-full px-4 sm:px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl overflow-hidden">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="rounded-[18px] border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className={bigText}>Assets</h2>
                <p className={smallText}>
                  Consolidated view of HQ remittances across all branches for FY 2023-2024
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
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
