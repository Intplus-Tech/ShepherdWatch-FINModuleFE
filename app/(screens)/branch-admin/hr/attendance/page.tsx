"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAttendanceModal from "@/components/hr/BranchAdminAttendanceModal"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useAttendanceLogs } from "@/components/hooks/hr/useHrAttendance"
import {
  ATTENDANCE_STATUS_LABELS,
  clockTime,
  deref,
  duration,
  employeeName,
  initials,
  lookup,
} from "@/lib/hr/normalize"
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const ALL_DEPARTMENTS = "All Departments"

const STATUS_STYLES: Record<AttendanceStatus, { pill: string; dot: string }> = {
  present: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  late: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  absent: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  half_day: { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  missing: { pill: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.missing
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        style.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {lookup(ATTENDANCE_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [department, setDepartment] = useState(ALL_DEPARTMENTS)
  const [status, setStatus] = useState<"all" | AttendanceStatus>("all")
  const [date, setDate] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const logs = useAttendanceLogs({
    page,
    limit: PAGE_SIZE,
    status,
    date: date || undefined,
  })

  const rows = useMemo(
    () =>
      (logs.data?.items ?? []).map((log) => {
        const employee = deref(log.employeeId)
        return {
          id: log._id,
          name: employeeName(log.employeeId),
          department: employee?.department ?? "—",
          date: formatDate(log.date, "medium"),
          clockIn: clockTime(log.clockIn),
          clockInLate: log.status === "late",
          clockOut: clockTime(log.clockOut),
          totalHours: duration(log.durationMinutes),
          status: log.status,
        }
      }),
    [logs.data],
  )

  /**
   * Department and name filtering happen on the loaded page: the attendance
   * list endpoint takes branch, employee, status and date, but has no
   * department or free-text search parameter.
   */
  const departments = useMemo(
    () => [
      ALL_DEPARTMENTS,
      ...Array.from(new Set(rows.map((row) => row.department).filter((d) => d !== "—"))),
    ],
    [rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (department !== ALL_DEPARTMENTS && row.department !== department) return false
      if (q && !row.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, department, query])

  const resetFilters = () => {
    setDepartment(ALL_DEPARTMENTS)
    setStatus("all")
    setDate("")
    setQuery("")
    setPage(1)
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
                <label className="text-[12px] font-semibold text-[#6B7280]">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as "all" | AttendanceStatus)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="all">All Statuses</option>
                  {ATTENDANCE_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {ATTENDANCE_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                />
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Quick Search</label>
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
                    {["Employee", "Date", "Clock In", "Clock Out", "Total Hours", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={6}
                    isLoading={logs.isLoading}
                    error={logs.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="No attendance records"
                    emptyDescription="Records appear here once staff clock in or entries are added."
                    onRetry={() => logs.refetch()}
                  />

                  {!logs.isLoading &&
                    !logs.error &&
                    filtered.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                              {initials(row.name)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[#111827]">{row.name}</span>
                              <span className="text-[12px] text-[#6B7280]">{row.department}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.date}</td>
                        <td
                          className={cn(
                            "px-4 py-4 text-[13px]",
                            row.clockInLate ? "font-semibold text-amber-600" : "text-[#4B5563]",
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
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={logs.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={rows.length}
              noun="records"
            />
          </div>
        </main>
      </div>

      <BranchAdminAttendanceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
