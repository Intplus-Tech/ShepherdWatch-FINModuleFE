"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAttendanceModal from "@/components/hr/BranchAdminAttendanceModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrAttendance, useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import {
  ATTENDANCE_STATUS_LABELS,
  formatDate,
  formatDuration,
  formatTime,
  initials,
  statusLabel,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  present: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  late: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  absent: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  half_day: { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  missing: { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
}

const STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Half Day" },
  { value: "missing", label: "Missing" },
]

const PAGE_SIZE = 20

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_STYLES[status] ?? STATUS_STYLES.missing
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        tone.pill
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {statusLabel(ATTENDANCE_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const { logs, pagination, loading, error, refresh } = useHrAttendance({
    page,
    limit: PAGE_SIZE,
    status,
    date,
  })
  const { metrics, refresh: refreshMetrics } = useHrAttendanceMetrics({ date })

  // The list endpoint filters by status and date; the name box narrows the
  // page that came back, since it has no search parameter.
  const search = useDebouncedValue(query, 250)
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return logs
    return logs.filter((row) =>
      `${row.employeeName} ${row.department} ${row.employeeCode}`.toLowerCase().includes(term)
    )
  }, [logs, search])

  const resetFilters = () => {
    setStatus("")
    setDate("")
    setQuery("")
    setPage(1)
  }

  const handleRecorded = () => {
    refresh()
    refreshMetrics()
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

          {/* Live attendance KPIs */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Total Staff", value: String(metrics.totalEmployees) },
              { label: "Clocked In", value: String(metrics.clockedInToday) },
              { label: "Late", value: String(metrics.lateToday) },
              { label: "Absent", value: String(metrics.absentToday) },
              {
                label: "Attendance Rate",
                value: `${metrics.attendanceRate}%`,
                hint: metrics.avgClockInTime ? `Avg in ${metrics.avgClockInTime}` : "",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-[#EEF1F6] bg-white p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {kpi.label}
                </div>
                <div className="mt-1.5 text-[20px] font-bold text-[#111827]">{kpi.value}</div>
                {kpi.hint ? (
                  <div className="text-[11px] text-[#9CA3AF]">{kpi.hint}</div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Filters card */}
          <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]" htmlFor="attendance-status">
                  Status
                </label>
                <select
                  id="attendance-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]" htmlFor="attendance-date">
                  Date
                </label>
                <input
                  id="attendance-date"
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
                            {initials(row.employeeName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">
                              {row.employeeName || "Unnamed staff"}
                            </span>
                            <span className="text-[12px] text-[#6B7280]">
                              {row.department || row.jobTitle || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatDate(row.date)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-4 text-[13px]",
                          row.status === "late" ? "font-semibold text-amber-600" : "text-[#4B5563]"
                        )}
                      >
                        {formatTime(row.clockIn)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatTime(row.clockOut)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatDuration(row.durationMinutes)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={6}
                    loading={loading}
                    error={error}
                    isEmpty={rows.length === 0}
                    emptyMessage="No records match your filters."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="records" />
          </div>
        </main>
      </div>

      <BranchAdminAttendanceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecorded={handleRecorded}
      />
    </div>
  )
}
