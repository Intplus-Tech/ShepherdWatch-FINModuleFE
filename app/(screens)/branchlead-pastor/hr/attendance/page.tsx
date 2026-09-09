"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Power,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import ResolveAttendanceModal from "@/components/hr/ResolveAttendanceModal"
import BranchAdminAttendanceModal from "@/components/hr/BranchAdminAttendanceModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrAttendance, useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import { formatDate, formatDuration, formatTime, initials } from "@/lib/hr/display"
import type { HrAttendanceLog } from "@/lib/hr/types"
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
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)
  const [resolving, setResolving] = useState<HrAttendanceLog | null>(null)
  const [manualOpen, setManualOpen] = useState(false)

  const { logs, pagination, loading, error, refresh } = useHrAttendance({
    page,
    limit: PAGE_SIZE,
    status,
    date,
  })
  const { metrics, refresh: refreshMetrics } = useHrAttendanceMetrics({ date })

  const rows = logs

  const resetAll = () => {
    setStatus("")
    setDate("")
    setPage(1)
  }

  const handleChanged = () => {
    refresh()
    refreshMetrics()
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold">Attendance Management</span>
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
          {/* Summary card */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">
                  Avg. Clock-In Time
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
                  className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
                >
                  <Power className="h-4 w-4" />
                  Manual Clock-In/Out
                </button>
              </div>
            </div>
          </div>

          {/* Filters card */}
          <div className="mt-6 rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#111827]">
              <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
              <span className="text-[13px] font-bold">Filters</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]" htmlFor="attendance-date">
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
                className="text-[13px] font-semibold text-[#2563EB] lg:mb-2.5"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="mt-6 overflow-hidden rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Staff Member
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Time In
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Time Out
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {rows.map((row, index) => {
                    // A punch with no clock-out (or an unresolved absence) is the
                    // anomaly the Fix Now action exists for.
                    const isAnomaly =
                      !row.anomalyFixed && (!row.clockOut || row.status === "absent" || row.status === "missing")
                    return (
                      <tr key={row.id} className={cn(isAnomaly && "border-l-2 border-rose-500")}>
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
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#111827]">
                              {formatTime(row.clockIn)}
                            </span>
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
                        <td className="px-4 py-4 text-[13px]">
                          {isAnomaly ? (
                            <button
                              type="button"
                              onClick={() => setResolving(row)}
                              className="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                            >
                              Fix Now
                            </button>
                          ) : row.anomalyFixed ? (
                            <span className="text-[11px] font-semibold text-emerald-600">Resolved</span>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                  <HrTableStateRow
                    colSpan={7}
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
        </div>
      </main>

      <ResolveAttendanceModal
        log={resolving}
        onClose={() => setResolving(null)}
        onResolved={handleChanged}
      />

      <BranchAdminAttendanceModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onRecorded={handleChanged}
      />
    </div>
  )
}
