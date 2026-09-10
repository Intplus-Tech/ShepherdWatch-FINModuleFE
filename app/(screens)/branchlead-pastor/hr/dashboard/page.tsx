"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { HrPanelState, HrTableState } from "@/components/hr/HrDataState"
import { usePastorHrDashboard } from "@/components/hooks/hr/useHrDashboard"
import { useEmployees } from "@/components/hooks/hr/useHrEmployees"
import { useAttendanceLogs } from "@/components/hooks/hr/useHrAttendance"
import {
  ATTENDANCE_STATUS_LABELS,
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  clockTime,
  deref,
  employeeName,
  initials,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Clock,
  Calendar,
  Plus,
  UserPlus,
  CalendarDays,
  ClipboardCheck,
  Banknote,
  GraduationCap,
} from "lucide-react"

const cardCls =
  "rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

const QUICK_ACTIONS = [
  {
    title: "Add Employee",
    description: "Onboard new branch staff and ministry volunteers.",
    icon: UserPlus,
    tint: "bg-[#EEF2FF] text-[#3B5BDB]",
    href: "/branchlead-pastor/hr/employee-directory",
  },
  {
    title: "Review Leave",
    description: "Process time-off requests and sabbatical tracking.",
    icon: CalendarDays,
    tint: "bg-[#ECFDF5] text-emerald-600",
    href: "/branchlead-pastor/hr/leave",
  },
  {
    title: "Attendance",
    description: "Daily check-ins for operational and ministerial staff.",
    icon: ClipboardCheck,
    tint: "bg-[#FEF3C7] text-amber-600",
    href: "/branchlead-pastor/hr/attendance",
  },
  {
    title: "Staff Loans",
    description: "Staff welfare fund applications and appraisals.",
    icon: Banknote,
    tint: "bg-[#F3E8FF] text-purple-600",
    href: "/branchlead-pastor/hr/employee-loans",
  },
]

export default function Page() {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const dashboard = usePastorHrDashboard()
  const summary = dashboard.data?.operationalSummary

  const staff = useEmployees({ limit: 5 })
  const activity = useAttendanceLogs({ limit: 5 })

  const attendanceRate = summary?.attendanceRate ?? 0
  const onLeave = summary?.staffOnLeave ?? []
  const nextTraining = summary?.nextTraining ?? null

  const donut = useMemo(() => {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    return {
      radius,
      circumference,
      offset: circumference * (1 - attendanceRate / 100),
    }
  }, [attendanceRate])

  const today = new Date()

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/branchlead-pastor/hr/attendance")}
              className="flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white"
            >
              <Clock className="h-4 w-4" />
              Clock-In · Clock-Out
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Page header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="text-[26px] font-bold text-[#111827]">Branch HR Dashboard</h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Operational home for Branch Administration •{" "}
                {today.toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/branchlead-pastor/hr/training-management")}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4" />
                Training Schedule
              </button>
              <button
                onClick={() => router.push("/branchlead-pastor/hr/employee-directory")}
                className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.title}
                  onClick={() => router.push(action.href)}
                  className={cn(cardCls, "text-left")}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      action.tint,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-[16px] font-bold text-[#111827]">{action.title}</h3>
                  <p className="mt-1 text-[13px] text-[#6B7280]">{action.description}</p>
                </button>
              )
            })}
          </div>

          {/* Main grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Today's Operational Summary */}
              <div className={cardCls}>
                <div className="flex items-start justify-between">
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Today&apos;s Operational Summary
                  </h2>
                  {summary && (
                    <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold text-[#6B7280]">
                      {summary.presentToday} / {summary.totalEmployees} present
                    </span>
                  )}
                </div>

                {dashboard.isLoading || dashboard.error || !summary ? (
                  <HrPanelState
                    isLoading={dashboard.isLoading}
                    error={dashboard.error}
                    isEmpty={!summary}
                    emptyTitle="No summary available"
                    onRetry={() => dashboard.refetch()}
                    className="mt-5 border-0"
                  />
                ) : (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Attendance Rate donut */}
                    <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                      <p className="text-[13px] font-semibold text-[#6B7280]">Attendance Rate</p>
                      <div className="mt-3 flex items-center justify-center">
                        <div className="relative h-[110px] w-[110px]">
                          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r={donut.radius}
                              fill="none"
                              stroke="#EEF1F6"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r={donut.radius}
                              fill="none"
                              stroke="#3B5BDB"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={donut.circumference}
                              strokeDashoffset={donut.offset}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[22px] font-bold text-[#111827]">
                              {attendanceRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-center text-[12px] text-[#6B7280]">
                        {summary.presentToday} of {summary.totalEmployees} clocked in today
                      </p>
                    </div>

                    {/* Staff on Leave */}
                    <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                      <p className="text-[13px] font-semibold text-[#6B7280]">
                        Staff on Leave ({onLeave.length})
                      </p>
                      {onLeave.length === 0 ? (
                        <p className="mt-3 text-[12px] text-[#9CA3AF]">Everyone is in today.</p>
                      ) : (
                        <div className="mt-3 flex flex-col gap-3">
                          {onLeave.slice(0, 4).map((entry, index) => {
                            const name = employeeName(entry.employee)
                            return (
                              <div key={`${name}-${index}`} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                                  {initials(name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                                    {name}
                                  </p>
                                  <p className="text-[11px] text-[#9CA3AF]">
                                    Back {formatDate(entry.returnDate, "short")}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Next Training */}
                    <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                      <p className="text-[13px] font-semibold text-[#6B7280]">Next Training</p>
                      {nextTraining ? (
                        <div className="mt-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-purple-600">
                            <GraduationCap className="h-5 w-5" />
                          </span>
                          <p className="mt-3 text-[15px] font-bold text-[#111827]">
                            {nextTraining.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(nextTraining.startDate, "short")} ·{" "}
                            {nextTraining.startTime}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-[12px] text-[#9CA3AF]">Nothing scheduled.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Staff Status Overview */}
              <div className={cn(cardCls, "p-0 overflow-hidden")}>
                <div className="p-5 pb-4">
                  <h2 className="text-[16px] font-bold text-[#111827]">Staff Status Overview</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        {["Employee", "Role", "Dept", "Status"].map((h) => (
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
                        colSpan={4}
                        isLoading={staff.isLoading}
                        error={staff.error}
                        isEmpty={(staff.data?.items.length ?? 0) === 0}
                        emptyTitle="No staff records"
                        onRetry={() => staff.refetch()}
                      />

                      {!staff.isLoading &&
                        !staff.error &&
                        staff.data?.items.map((employee) => (
                          <tr key={employee._id}>
                            <td className="px-4 py-3 text-[13px] font-semibold text-[#111827]">
                              {userName(employee.userId, employee.employeeId)}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#4B5563]">
                              {employee.jobTitle}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#4B5563]">
                              {employee.department ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-[13px]">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                  badgeFor(EMPLOYMENT_STATUS_BADGES, employee.employmentStatus),
                                )}
                              >
                                {lookup(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT: Recent Activity */}
            <div className={cardCls}>
              <h2 className="text-[16px] font-bold text-[#111827]">Recent Activity</h2>

              {activity.isLoading ||
              activity.error ||
              (activity.data?.items.length ?? 0) === 0 ? (
                <HrPanelState
                  isLoading={activity.isLoading}
                  error={activity.error}
                  isEmpty={(activity.data?.items.length ?? 0) === 0}
                  emptyTitle="No activity yet"
                  emptyDescription="Clock-ins will show up here."
                  onRetry={() => activity.refetch()}
                  className="mt-4 border-0 p-4"
                />
              ) : (
                <div className="mt-4 flex flex-col gap-5">
                  {activity.data?.items.map((log, idx, all) => {
                    const last = idx === all.length - 1
                    const staffName = employeeName(log.employeeId)
                    const employee = deref(log.employeeId)
                    return (
                      <div key={log._id} className="relative flex gap-3">
                        {!last && (
                          <span className="absolute left-[15px] top-9 bottom-[-20px] w-px bg-[#F3F4F6]" />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                            log.status === "late"
                              ? "bg-[#FEF3C7] text-amber-600"
                              : log.status === "absent"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-[#ECFDF5] text-emerald-600",
                          )}
                        >
                          {initials(staffName)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-[#111827]">
                            <span className="font-semibold">{staffName}</span>{" "}
                            {log.clockIn
                              ? "clocked in"
                              : `marked ${lookup(
                                  ATTENDANCE_STATUS_LABELS,
                                  log.status,
                                ).toLowerCase()}`}
                            {employee?.department ? ` · ${employee.department}` : ""}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                            {log.clockIn
                              ? clockTime(log.clockIn)
                              : formatDate(log.date, "medium")}
                          </p>
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
    </div>
  )
}
