"use client"

import { useMemo, useState } from "react"
import { Search, Bell, AlertTriangle } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import ResolveAttendanceModal from "@/components/hr/ResolveAttendanceModal"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useAttendanceLogs,
  useAttendanceMetrics,
} from "@/components/hooks/hr/useHrAttendance"
import {
  ATTENDANCE_STATUS_LABELS,
  branchName,
  clockTime,
  deref,
  duration,
  employeeName,
  initials,
} from "@/lib/hr/normalize"
import { ATTENDANCE_STATUSES, type AttendanceLog, type AttendanceStatus } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function Page() {
  const [status, setStatus] = useState<"all" | AttendanceStatus>("all")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(1)
  const [resolveLog, setResolveLog] = useState<AttendanceLog | null>(null)

  const logs = useAttendanceLogs({
    page,
    limit: PAGE_SIZE,
    status,
    date: date || undefined,
  })
  const metrics = useAttendanceMetrics({ date: date || undefined })

  const rows = useMemo(() => logs.data?.items ?? [], [logs.data])

  const resetAll = () => {
    setStatus("all")
    setDate("")
    setPage(1)
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
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">
                  Avg. Clock-In Time
                </div>
                <div className="mt-1 text-[28px] font-bold text-[#111827]">
                  {metrics.isLoading ? "—" : (metrics.data?.avgClockInTime ?? "—")}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">Attendance Rate</div>
                <div className="mt-1 text-[28px] font-bold text-[#111827]">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={`${metrics.data?.attendanceRate ?? 0}%`}
                  />
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">Clocked In</div>
                <div className="mt-1 text-[28px] font-bold text-emerald-600">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={metrics.data?.clockedInToday ?? 0}
                  />
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">Late</div>
                <div className="mt-1 text-[28px] font-bold text-amber-600">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={metrics.data?.lateToday ?? 0}
                  />
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-[#6B7280]">Absent</div>
                <div className="mt-1 text-[28px] font-bold text-rose-600">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={metrics.data?.absentToday ?? 0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Date</label>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as "all" | AttendanceStatus)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="all">All Status</option>
                  {ATTENDANCE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ATTENDANCE_STATUS_LABELS[s]}
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

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    {[
                      "Staff Member",
                      "Branch",
                      "Date",
                      "Time In",
                      "Time Out",
                      "Duration",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={7}
                    isLoading={logs.isLoading}
                    error={logs.error}
                    isEmpty={rows.length === 0}
                    emptyTitle="No attendance records"
                    emptyDescription="Clock-ins for the selected period will appear here."
                    onRetry={() => logs.refetch()}
                  />

                  {!logs.isLoading &&
                    !logs.error &&
                    rows.map((log) => {
                      const name = employeeName(log.employeeId)
                      const employee = deref(log.employeeId)
                      // A clocked-in row with no clock-out is the anomaly to fix.
                      const needsFix =
                        Boolean(log.clockIn) && !log.clockOut && !log.anomalyFixed
                      return (
                        <tr key={log._id}>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B5BDB] text-[12px] font-bold text-white">
                                {initials(name)}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#111827]">{name}</span>
                                <span className="text-[12px] text-[#9CA3AF]">
                                  {employee?.jobTitle ?? "—"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {branchName(log.branchId)}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatDate(log.date, "medium")}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#111827]">
                                {clockTime(log.clockIn)}
                              </span>
                              {log.status === "present" && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  On Time
                                </span>
                              )}
                              {log.status === "late" && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  Late
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            {!log.clockOut ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Missing
                              </span>
                            ) : (
                              <span className="text-[#4B5563]">{clockTime(log.clockOut)}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {duration(log.durationMinutes)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            {needsFix ? (
                              <button
                                type="button"
                                onClick={() => setResolveLog(log)}
                                className="rounded-md bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                              >
                                Fix Now
                              </button>
                            ) : log.anomalyFixed ? (
                              <span
                                title={log.resolutionNote}
                                className={cn(
                                  "rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]",
                                )}
                              >
                                Resolved
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
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
        </div>
      </main>

      <ResolveAttendanceModal log={resolveLog} onClose={() => setResolveLog(null)} />
    </div>
  )
}
