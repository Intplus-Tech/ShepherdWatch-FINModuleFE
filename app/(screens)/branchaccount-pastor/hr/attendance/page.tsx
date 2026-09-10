"use client"

import { useMemo, useState } from "react"
import { Search, Bell, Download, AlertTriangle } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useAttendanceLogs } from "@/components/hooks/hr/useHrAttendance"
import {
  ATTENDANCE_STATUS_LABELS,
  branchName,
  clockTime,
  deref,
  duration,
  employeeName,
  initials,
} from "@/lib/hr/normalize"
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const AVATAR_TINTS = [
  "bg-[#E8EDFF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
]

export default function Page() {
  const [status, setStatus] = useState<"all" | AttendanceStatus>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)

  const logs = useAttendanceLogs({
    page,
    limit: PAGE_SIZE,
    status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const rows = useMemo(
    () =>
      (logs.data?.items ?? []).map((log) => {
        const employee = deref(log.employeeId)
        return {
          id: log._id,
          name: employeeName(log.employeeId),
          title: employee?.jobTitle ?? "—",
          branch: branchName(log.branchId),
          date: formatDate(log.date, "medium"),
          timeIn: clockTime(log.clockIn),
          timeOut: log.clockOut ? clockTime(log.clockOut) : null,
          durationLabel: duration(log.durationMinutes),
          status: log.status,
        }
      }),
    [logs.data],
  )

  const resetAll = () => {
    setStatus("all")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  function handleExport() {
    const csv = rowsToCsv(
      rows.map((row) => ({
        Staff: row.name,
        "Job Title": row.title,
        Branch: row.branch,
        Date: row.date,
        "Time In": row.timeIn,
        "Time Out": row.timeOut ?? "Missing",
        Duration: row.durationLabel,
        Status: ATTENDANCE_STATUS_LABELS[row.status] ?? row.status,
      })),
    )
    downloadCsv(`attendance-log-${todayStamp()}.csv`, csv)
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
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Log
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">To</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
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

        {/* Table card */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  {["Staff Member", "Branch", "Date", "Time In", "Time Out", "Duration"].map(
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
                  isEmpty={rows.length === 0}
                  emptyTitle="No attendance records"
                  emptyDescription="Clock-ins for the selected period will appear here."
                  onRetry={() => logs.refetch()}
                />

                {!logs.isLoading &&
                  !logs.error &&
                  rows.map((row, i) => (
                    <tr key={row.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                              AVATAR_TINTS[i % AVATAR_TINTS.length],
                            )}
                          >
                            {initials(row.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.name}</span>
                            <span className="text-[12px] text-[#9CA3AF]">{row.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.branch}</td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.date}</td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#4B5563]">{row.timeIn}</span>
                          {row.status === "late" && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              Late
                            </span>
                          )}
                          {row.status === "absent" && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              Absent
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        {row.timeOut === null ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Missing
                          </span>
                        ) : (
                          <span className="text-[#4B5563]">{row.timeOut}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {row.durationLabel}
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
  )
}
