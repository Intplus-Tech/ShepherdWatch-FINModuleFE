"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Download,
  Timer,
  SlidersHorizontal,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrAttendance, useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import BranchAdminAttendanceModal from "@/components/hr/BranchAdminAttendanceModal"
import { useToast } from "@/components/ui/toast"
import {
  ATTENDANCE_STATUS_LABELS,
  formatDate,
  formatDuration,
  formatTime,
  initials,
  statusLabel,
} from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "present", label: "On Time" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Half Day" },
  { value: "missing", label: "Missing" },
]

const AVATAR_TINTS = ["bg-[#3B5BDB] text-white", "bg-[#111827] text-white"]

const PAGE_SIZE = 20

export default function Page() {
  const [manualOpen, setManualOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)

  const { logs, pagination, loading, error, refresh } = useHrAttendance({
    page,
    limit: PAGE_SIZE,
    status,
    startDate,
    endDate,
  })
  const { metrics, refresh: refreshMetrics } = useHrAttendanceMetrics()
  const { pushToast } = useToast()

  const handleExport = () => {
    const exported = exportHrRows(
      "branch-attendance-log",
      rows.map((row) => ({
        Employee: row.employeeName,
        Department: row.department,
        Date: formatDate(row.date),
        "Clock In": formatTime(row.clockIn),
        "Clock Out": formatTime(row.clockOut),
        Duration: formatDuration(row.durationMinutes),
        Status: statusLabel(ATTENDANCE_STATUS_LABELS, row.status),
      }))
    )
    if (!exported) pushToast("Nothing to export on this page", "info")
  }

  const rows = logs

  const resetAll = () => {
    setStatus("")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/attendance" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
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

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827]">Attendance Log</h1>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Review and manage branch-level staff check-ins for the current period.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Avg. Clock-in Time
              </div>
              <div className="mt-1 text-[32px] font-bold text-[#111827]">
                {metrics.avgClockInTime || "—"}
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                {metrics.clockedInToday} of {metrics.totalEmployees} clocked in ·{" "}
                {metrics.lateToday} late · {metrics.absentToday} absent
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                {metrics.attendanceRate}% attendance
              </span>
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                <Timer className="h-4 w-4" />
                Manual Clock-In/Out
              </button>
            </div>
          </div>
        </div>

        {/* Filters card */}
        <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center gap-2 text-[#111827]">
            <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
            <span className="text-[13px] font-bold">Filters</span>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]" htmlFor="attendance-start">
                From
              </label>
              <div className="flex h-[42px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827]">
                <input
                  id="attendance-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-transparent outline-none"
                />
                <Calendar className="h-4 w-4 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]" htmlFor="attendance-end">
                To
              </label>
              <div className="flex h-[42px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827]">
                <input
                  id="attendance-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                  className="w-full bg-transparent outline-none"
                />
                <Calendar className="h-4 w-4 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                Status
              </label>
              <select
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

            <button
              type="button"
              onClick={resetAll}
              className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-2.5"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Time In
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Time Out
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((row, index) => (
                  <tr key={row.id} className={cn(!row.clockOut && "border-l-2 border-rose-500")}>
                    <td className="px-4 py-4 text-[13px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                            AVATAR_TINTS[index % AVATAR_TINTS.length]
                          )}
                        >
                          {initials(row.employeeName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#111827]">
                            {row.employeeName || "Unnamed staff"}
                          </span>
                          <span className="text-[12px] text-[#6B7280]">
                            {row.jobTitle || row.department || "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      {row.department || "—"}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">{formatDate(row.date)}</td>
                    <td className="px-4 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#111827]">{formatTime(row.clockIn)}</span>
                        {row.status === "present" && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            On Time
                          </span>
                        )}
                        {row.status === "late" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Late
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]">
                      {!row.clockOut ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Missing
                        </span>
                      ) : (
                        <span className="text-[#4B5563]">{formatTime(row.clockOut)}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      {formatDuration(row.durationMinutes)}
                    </td>
                  </tr>
                ))}
                <HrTableStateRow
                  colSpan={6}
                  loading={loading}
                  error={error}
                  isEmpty={rows.length === 0}
                  emptyMessage="No attendance records for these filters."
                  onRetry={refresh}
                />
              </tbody>
            </table>
          </div>
          <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="records" />
        </div>
      </main>

      <BranchAdminAttendanceModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onRecorded={() => {
          refresh()
          refreshMetrics()
        }}
      />
    </div>
  )
}
