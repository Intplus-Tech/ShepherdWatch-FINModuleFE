"use client"

import { useState } from "react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminHeader from "@/components/navigation/BranchAdminHeader"
import ServiceAttendanceLog from "@/components/attendance/ServiceAttendanceLog"

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] lg:flex-row">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <BranchAdminSidebar
        activeHref="/branch-admin/hr/service-attendance"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="relative flex min-h-[100dvh] w-full flex-1 flex-col">
        <BranchAdminHeader title="Dashboard" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ServiceAttendanceLog
            branchLabel="Maryland, Lagos Branch"
            title="Event Attendance Log"
            subtitle="Maryland, Lagos Branch — Comprehensive structural view of congregational demographics."
            editable
          />
        </main>
      </div>
    </div>
  )
}
