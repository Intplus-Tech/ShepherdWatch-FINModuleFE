"use client"

import { Bell, Search } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import ServiceAttendanceLog from "@/components/attendance/ServiceAttendanceLog"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex h-[42.67px] items-center justify-between border-b border-[#EEF1F6]">
          <span className="text-[13px] font-bold">Service Attendance</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          <ServiceAttendanceLog
            branchLabel="Maryland, Lagos Branch"
            title="Service Attendance"
            subtitle="Maryland, Lagos Branch — Weekly congregational attendance under your pastoral oversight."
            showServiceBreakdown
          />
        </div>
      </main>
    </div>
  )
}
