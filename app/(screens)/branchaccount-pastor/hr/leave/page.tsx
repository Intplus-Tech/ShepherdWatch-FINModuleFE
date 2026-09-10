"use client"

import { useMemo, useState } from "react"
import { Search, Bell } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useLeaveMetrics, useLeaveRequests } from "@/components/hooks/hr/useHrLeave"
import {
  LEAVE_STATUS_BADGES,
  LEAVE_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  lookup,
} from "@/lib/hr/normalize"
import { LEAVE_STATUSES, type LeaveStatus } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

/**
 * Finance's view of leave.
 *
 * Approvals belong to the admin and pastor screens; this is read-only because
 * the accountant role is not in `authorizeRoles` for the approve/reject
 * endpoints — it exists so payroll can see who is off and for how long.
 */
export default function Page() {
  const [status, setStatus] = useState<"all" | LeaveStatus>("all")
  const [page, setPage] = useState(1)

  const leaves = useLeaveRequests({ page, limit: PAGE_SIZE, status })
  const metrics = useLeaveMetrics()

  const rows = useMemo(() => leaves.data?.items ?? [], [leaves.data])

  function handleExport() {
    const csv = rowsToCsv(
      rows.map((leave) => ({
        Employee: employeeName(leave.employeeId),
        Type: deref(leave.leaveTypeId)?.name ?? "Leave",
        Start: formatDate(leave.startDate, "iso"),
        End: formatDate(leave.endDate, "iso"),
        Days: leave.totalDays,
        Status: lookup(LEAVE_STATUS_LABELS, leave.status),
      })),
    )
    downloadCsv(`leave-register-${todayStamp()}.csv`, csv)
  }

  const stats = [
    { label: "Total Requests", value: metrics.data?.total ?? 0 },
    { label: "Pending", value: metrics.data?.pending ?? 0 },
    { label: "Approved", value: metrics.data?.approved ?? 0 },
    { label: "Declined", value: metrics.data?.declined ?? 0 },
  ]

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/leave" />
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

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827]">Leave Register</h1>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Time-off records for payroll reconciliation. Approvals are handled by the branch
              admin and pastor.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export Register
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                {stat.label}
              </div>
              <div className="mt-2 text-[24px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={stat.value}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#6B7280]">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | LeaveStatus)
                setPage(1)
              }}
              className="h-[42px] w-full max-w-[260px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
            >
              <option value="all">All Statuses</option>
              {LEAVE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAVE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF2FF]">
                <tr>
                  {["Employee", "Leave Type", "Dates", "Days", "Status"].map((h) => (
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
                <HrTableState
                  colSpan={5}
                  isLoading={leaves.isLoading}
                  error={leaves.error}
                  isEmpty={rows.length === 0}
                  emptyTitle="No leave records"
                  emptyDescription="Requests appear here once staff apply for time off."
                  onRetry={() => leaves.refetch()}
                />

                {!leaves.isLoading &&
                  !leaves.error &&
                  rows.map((leave) => {
                    const name = employeeName(leave.employeeId)
                    const staff = deref(leave.employeeId)
                    return (
                      <tr key={leave._id} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                              {initials(name)}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">{name}</div>
                              <div className="text-[12px] text-[#9CA3AF]">
                                {staff?.jobTitle ?? "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {deref(leave.leaveTypeId)?.name ?? "Leave"}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(leave.startDate, "medium")} –{" "}
                          {formatDate(leave.endDate, "medium")}
                        </td>
                        <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                          {leave.totalDays}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(LEAVE_STATUS_BADGES, leave.status),
                            )}
                          >
                            {lookup(LEAVE_STATUS_LABELS, leave.status)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          <HrPagination
            pagination={leaves.data?.pagination}
            page={page}
            onPageChange={setPage}
            itemCount={rows.length}
            noun="requests"
          />
        </div>
      </main>
    </div>
  )
}
