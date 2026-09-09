"use client"

import { useState } from "react"
import {
  Search,
  UserPlus,
  Download,
  SlidersHorizontal,
  Check,
  X,
  Clock,
  CheckCircle2,
  UserX,
  TrendingUp,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import { useHrLeaves, useHrLeaveMetrics, useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import { useDirectorHrDashboard } from "@/components/hooks/useHrDashboard"
import { formatShortDate, initials } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import { cn } from "@/lib/utils"

const AVATAR_TINTS = ["bg-[#3B5BDB] text-white", "bg-[#111827] text-white"]

/** Leave-type chips are tinted by the code the API returns, with a fallback. */
const TYPE_TINTS = [
  "bg-[#EEF2FF] text-[#3B5BDB]",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
]

/** Keyed by the attendanceHealth flag the dashboard endpoint returns. */
const STATUS_STYLES: Record<string, { pill: string; dot: string; bar: string }> = {
  GOOD: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  WARNING: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
  CRITICAL: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
}

export default function Page() {
  const { pushToast } = useToast()

  // Director view is global: no branchId is sent on any of these.
  const { leaves, loading, error, refresh } = useHrLeaves({
    status: "pending_supervisor",
    limit: 10,
  })
  const { metrics: leaveMetrics, refresh: refreshMetrics } = useHrLeaveMetrics()
  const { metrics: attendance } = useHrAttendanceMetrics()
  const { dashboard } = useDirectorHrDashboard()
  const { approveLeave, rejectLeave } = useLeaveMutations()

  const [decidingId, setDecidingId] = useState<string | null>(null)

  const handleExport = () => {
    const exported = exportHrRows(
      "leave-requests",
      leaves.map((leave) => ({
        Employee: leave.employeeName,
        Type: leave.leaveTypeName,
        From: leave.startDate,
        To: leave.endDate,
        Days: leave.totalDays,
        Status: leave.status,
      }))
    )
    if (!exported) pushToast("Nothing to export yet", "info")
  }

  const stats = [
    {
      label: "Pending Leaves",
      value: String(leaveMetrics.pending),
      icon: Clock,
      iconClass: "bg-amber-100 text-amber-600",
    },
    {
      label: "Approved Leaves",
      value: String(leaveMetrics.approved),
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Absent Today",
      value: String(attendance.absentToday),
      icon: UserX,
      iconClass: "bg-rose-100 text-rose-600",
    },
    {
      label: "Attendance rate",
      value: `${attendance.attendanceRate}%`,
      icon: TrendingUp,
      iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
    },
  ]

  const decide = async (
    leaveId: string,
    name: string,
    action: "approve" | "reject"
  ) => {
    setDecidingId(leaveId)
    try {
      if (action === "approve") {
        await approveLeave(leaveId)
        pushToast(`Leave approved for ${name}`, "success")
      } else {
        await rejectLeave(leaveId, "Declined by the director")
        pushToast(`Leave declined for ${name}`, "success")
      }
      refresh()
      refreshMetrics()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to record that decision", "error")
    } finally {
      setDecidingId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/leave-attendance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Leave &amp; Attendance
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Monitor leave requests and daily attendance across all branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search employees, branches..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[240px]"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                onClick={handleExport}
                type="button"
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div
                  className={cn(
                    "absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg",
                    stat.iconClass
                  )}
                >
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-[12px] font-semibold text-[#6B7280]">
                  {stat.label}
                </div>
                <div className="mt-2 text-[28px] font-bold text-[#111827]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Leave Requests */}
            <div className="lg:col-span-2 rounded-xl border border-[#EEF1F6] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    Leave Requests
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">
                    Pending Director Approval
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 self-start rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Type
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {leaves.map((req, index) => (
                      <tr key={req.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                                AVATAR_TINTS[index % AVATAR_TINTS.length]
                              )}
                            >
                              {initials(req.employeeName)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">
                                {req.employeeName || "Unnamed staff"}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {req.jobTitle || req.employeeCode || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {req.leaveTypeCode || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                              TYPE_TINTS[index % TYPE_TINTS.length]
                            )}
                          >
                            {req.leaveTypeName || "Leave"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111827]">
                              {req.totalDays} {req.totalDays === 1 ? "Day" : "Days"}
                            </span>
                            <span className="text-[12px] text-[#6B7280]">
                              {formatShortDate(req.startDate)} - {formatShortDate(req.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={decidingId === req.id}
                              onClick={() => decide(req.id, req.employeeName, "approve")}
                              aria-label={`Approve ${req.employeeName}'s leave`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={decidingId === req.id}
                              onClick={() => decide(req.id, req.employeeName, "reject")}
                              aria-label={`Reject ${req.employeeName}'s leave`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <HrTableStateRow
                      colSpan={5}
                      loading={loading}
                      error={error}
                      isEmpty={leaves.length === 0}
                      emptyMessage="No leave requests are waiting on approval."
                      onRetry={refresh}
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Attendance Log */}
            <div className="lg:col-span-1 rounded-xl border border-[#EEF1F6] bg-white">
              <div className="border-b border-[#EEF1F6] p-5">
                <h2 className="text-[18px] font-bold text-[#111827]">
                  Attendance Log
                </h2>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  Today - All Branches
                </p>
              </div>

              <div className="flex flex-col gap-4 p-5">
                {dashboard.headcountByBranch.map((item) => {
                  const styles = STATUS_STYLES[item.attendanceHealth as keyof typeof STATUS_STYLES] ??
                    STATUS_STYLES.GOOD
                  return (
                    <div
                      key={item.branchId || item.branchName}
                      className="rounded-xl border border-[#EEF1F6] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-bold text-[#111827]">
                          {item.branchName || "Unnamed branch"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            styles.pill
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                          {item.attendanceHealth || "GOOD"}
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-[#6B7280]">
                        Staff: <span className="font-semibold text-[#4B5563]">{item.count}</span>
                        {item.state ? (
                          <span className="ml-2 text-[#9CA3AF]">{item.state}</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}

                {dashboard.headcountByBranch.length === 0 ? (
                  <p className="text-[13px] text-[#9CA3AF]">No branch attendance reported yet.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
