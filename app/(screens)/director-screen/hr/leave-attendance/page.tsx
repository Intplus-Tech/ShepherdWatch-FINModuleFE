"use client"

import { useMemo, useState } from "react"
import { Clock, CheckCircle2, UserX, TrendingUp, Search } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import BranchLeadLeaveApprovalModal from "@/components/hr/BranchLeadLeaveApprovalModal"
import { HrPanelState, HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useDirectorHrOverview } from "@/components/hooks/hr/useHrDashboard"
import { useAttendanceMetrics } from "@/components/hooks/hr/useHrAttendance"
import { useLeaveMetrics, useLeaveRequests } from "@/components/hooks/hr/useHrLeave"
import { branchName, deref, employeeName } from "@/lib/hr/normalize"
import type { LeaveRequest } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const HEALTH_STYLES: Record<string, { pill: string; dot: string; bar: string }> = {
  GOOD: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  WARNING: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
  CRITICAL: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
  UNKNOWN: { pill: "bg-[#F3F4F6] text-[#4B5563]", dot: "bg-[#9CA3AF]", bar: "bg-[#9CA3AF]" },
}

export default function Page() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<{
    request: LeaveRequest
    intent: "approve" | "reject"
  } | null>(null)

  const leaveMetrics = useLeaveMetrics()
  const attendanceMetrics = useAttendanceMetrics()
  const overview = useDirectorHrOverview()

  /** The director sees requests that have cleared the supervisor and sit with HR. */
  const leaves = useLeaveRequests({ page, limit: PAGE_SIZE, status: "pending_hr" })

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const items = leaves.data?.items ?? []
    if (!query) return items
    return items.filter((req) => employeeName(req.employeeId).toLowerCase().includes(query))
  }, [leaves.data, search])

  const branches = overview.data?.headcountByBranch ?? []

  const stats = [
    {
      label: "Pending Leaves",
      value: leaveMetrics.data?.pending ?? 0,
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-600",
      loading: leaveMetrics.isLoading,
      error: leaveMetrics.error,
    },
    {
      label: "Approved Leaves",
      value: leaveMetrics.data?.approved ?? 0,
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
      loading: leaveMetrics.isLoading,
      error: leaveMetrics.error,
    },
    {
      label: "Absent Today",
      value: attendanceMetrics.data?.absentToday ?? 0,
      icon: UserX,
      iconClass: "bg-rose-100 text-rose-600",
      loading: attendanceMetrics.isLoading,
      error: attendanceMetrics.error,
    },
    {
      label: "Attendance Rate",
      value: `${attendanceMetrics.data?.attendanceRate ?? 0}%`,
      icon: TrendingUp,
      iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
      loading: attendanceMetrics.isLoading,
      error: attendanceMetrics.error,
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/leave-attendance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Leave &amp; Attendance
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Organisation-wide time-off and presence
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by employee..."
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#EEF1F6] bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        {stat.label}
                      </div>
                      <div className="mt-2 text-[28px] font-bold text-[#111827]">
                        <HrStatValue
                          isLoading={stat.loading}
                          error={stat.error}
                          value={stat.value}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        stat.iconClass,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT: Leave requests */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="border-b border-[#EEF1F6] p-5">
                <h2 className="text-[18px] font-bold text-[#111827]">Leave Requests</h2>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">
                  Awaiting HR sign-off after supervisor approval
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Employee", "Branch", "Type", "Dates"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                        >
                          {h}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    <HrTableState
                      colSpan={5}
                      isLoading={leaves.isLoading}
                      error={leaves.error}
                      isEmpty={filtered.length === 0}
                      emptyTitle="Nothing awaiting HR"
                      emptyDescription="Requests reach you after a supervisor approves them."
                      onRetry={() => leaves.refetch()}
                    />

                    {!leaves.isLoading &&
                      !leaves.error &&
                      filtered.map((req) => (
                        <tr key={req._id}>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">
                                {employeeName(req.employeeId)}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {deref(req.employeeId)?.jobTitle ?? "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {branchName(req.branchId)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                              {deref(req.leaveTypeId)?.name ?? "Leave"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">
                                {formatDate(req.startDate, "short")} –{" "}
                                {formatDate(req.endDate, "short")}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {req.totalDays} {req.totalDays === 1 ? "day" : "days"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDecision({ request: req, intent: "reject" })}
                                className="rounded-md border border-rose-200 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                onClick={() => setDecision({ request: req, intent: "approve" })}
                                className="rounded-md bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
                              >
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <HrPagination
                pagination={leaves.data?.pagination}
                page={page}
                onPageChange={setPage}
                itemCount={leaves.data?.items.length ?? 0}
                noun="requests"
              />
            </div>

            {/* RIGHT: Attendance Log */}
            <div className="lg:col-span-1 rounded-xl border border-[#EEF1F6] bg-white">
              <div className="border-b border-[#EEF1F6] p-5">
                <h2 className="text-[18px] font-bold text-[#111827]">Attendance Log</h2>
                <p className="text-[12px] text-[#6B7280] mt-0.5">Today - All Branches</p>
              </div>

              {overview.isLoading || overview.error || branches.length === 0 ? (
                <HrPanelState
                  isLoading={overview.isLoading}
                  error={overview.error}
                  isEmpty={branches.length === 0}
                  emptyTitle="No branch data"
                  emptyDescription="Attendance appears once staff are assigned to branches."
                  onRetry={() => overview.refetch()}
                  className="border-0 p-6"
                />
              ) : (
                <div className="flex flex-col gap-4 p-5">
                  {branches.map((item) => {
                    const styles = HEALTH_STYLES[item.attendanceHealth] ?? HEALTH_STYLES.UNKNOWN
                    const absent = Math.max(0, item.count - item.presentToday)
                    return (
                      <div
                        key={item.branchId}
                        className="rounded-xl border border-[#EEF1F6] p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-bold text-[#111827]">
                            {item.branchName}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                              styles.pill,
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                            {item.attendanceHealth}
                          </span>
                        </div>

                        <div className="mt-2 text-[12px] text-[#6B7280]">
                          Staff:{" "}
                          <span className="font-semibold text-[#4B5563]">{item.count}</span>
                          {"   "}Present:{" "}
                          <span className="font-semibold text-[#4B5563]">
                            {item.presentToday}
                          </span>
                          {"   "}Absent:{" "}
                          <span className="font-semibold text-rose-600">{absent}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-[#EEF1F6]">
                            <div
                              className={cn("h-2 rounded-full", styles.bar)}
                              style={{ width: `${Math.min(100, item.attendanceRate)}%` }}
                            />
                          </div>
                          <span className="text-[16px] font-bold text-[#111827]">
                            {item.attendanceRate}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BranchLeadLeaveApprovalModal
        open={decision !== null}
        request={decision?.request ?? null}
        intent={decision?.intent ?? "approve"}
        onClose={() => setDecision(null)}
      />
    </div>
  )
}
