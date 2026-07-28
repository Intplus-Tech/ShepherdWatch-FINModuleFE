"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAttendanceModal from "@/components/hr/BranchAdminAttendanceModal"
import { cn } from "@/lib/utils"

type Status = "Present" | "Late" | "Absent" | "Half-Day"

type AttendanceRow = {
  id: string
  name: string
  department: string
  initials: string
  date: string
  clockIn: string
  clockInLate?: boolean
  clockOut: string
  totalHours: string
  status: Status
}

const ROWS: AttendanceRow[] = [
  {
    id: "elena-rodriguez",
    name: "Dr. Elena Rodriguez",
    department: "Administration",
    initials: "ER",
    date: "Oct 26, 2023",
    clockIn: "08:45 AM",
    clockOut: "05:15 PM",
    totalHours: "8h 30m",
    status: "Present",
  },
  {
    id: "marcus-thorne",
    name: "Marcus Thorne",
    department: "Pastoral Care",
    initials: "MT",
    date: "Oct 26, 2023",
    clockIn: "09:12 AM",
    clockInLate: true,
    clockOut: "05:00 PM",
    totalHours: "7h 48m",
    status: "Late",
  },
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    department: "Finance",
    initials: "SJ",
    date: "Oct 26, 2023",
    clockIn: "—",
    clockOut: "—",
    totalHours: "0h 0m",
    status: "Absent",
  },
  {
    id: "timothy-park",
    name: "Timothy Park",
    department: "Youth Ministry",
    initials: "TP",
    date: "Oct 26, 2023",
    clockIn: "09:00 AM",
    clockOut: "01:00 PM",
    totalHours: "4h 0m",
    status: "Half-Day",
  },
  {
    id: "david-wilson",
    name: "David Wilson",
    department: "Finance",
    initials: "DW",
    date: "Oct 26, 2023",
    clockIn: "08:00 AM",
    clockOut: "04:30 PM",
    totalHours: "8h 30m",
    status: "Present",
  },
]

const DEPARTMENTS = [
  "All Departments",
  "Administration",
  "Pastoral Care",
  "Finance",
  "Youth Ministry",
]

const STATUS_STYLES: Record<Status, { pill: string; dot: string }> = {
  Present: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Late: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  Absent: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  "Half-Day": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
}

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        s.pill
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  )
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [department, setDepartment] = useState("All Departments")
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROWS.filter((row) => {
      if (department !== "All Departments" && row.department !== department)
        return false
      if (q && !row.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [department, query])

  const resetFilters = () => {
    setDepartment("All Departments")
    setQuery("")
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/attendance"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        {/* Header */}
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
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
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-[#111827]">Attendance Log</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Review and manage branch-level staff check-ins for the current period.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Record New Attendance
            </button>
          </div>

          {/* Filters card */}
          <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">
                  Quick Search
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EEF2FF]">
                  <tr>
                    {[
                      "Employee",
                      "Date",
                      "Clock In",
                      "Clock Out",
                      "Total Hours",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                            {row.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.name}</span>
                            <span className="text-[12px] text-[#6B7280]">
                              {row.department}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.date}</td>
                      <td
                        className={cn(
                          "px-4 py-4 text-[13px]",
                          row.clockInLate ? "font-semibold text-amber-600" : "text-[#4B5563]"
                        )}
                      >
                        {row.clockIn}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.clockOut}</td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.totalHours}</td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]"
                      >
                        No records match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-4 border-t border-[#EEF1F6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] text-[#6B7280]">Showing 5 of 48 records</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex h-8 items-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111827] text-[12px] font-semibold text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  2
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  3
                </button>
                <span className="px-1 text-[12px] text-[#9CA3AF]">…</span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  10
                </button>
                <button
                  type="button"
                  className="flex h-8 items-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BranchAdminAttendanceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
