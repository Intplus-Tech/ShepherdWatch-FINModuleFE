"use client"

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
import { cn } from "@/lib/utils"

type LeaveType = "Vacation" | "Sick" | "Personal"

type LeaveRequest = {
  id: string
  name: string
  title: string
  initials: string
  avatarColor: string
  branch: string
  type: LeaveType
  duration: string
  dateRange: string
}

type AttendanceStatus = "GOOD" | "WARNING" | "CRITICAL"

type BranchAttendance = {
  id: string
  branch: string
  staff: number
  present: number
  absent: number
  rate: number
  status: AttendanceStatus
}

const STATS = [
  { label: "Pending Leaves", value: "12", icon: Clock, iconClass: "bg-amber-100 text-amber-600" },
  { label: "Approved Leaves", value: "42", icon: CheckCircle2, iconClass: "bg-emerald-100 text-emerald-600" },
  { label: "Absent Today", value: "18", icon: UserX, iconClass: "bg-rose-100 text-rose-600" },
  { label: "Attendance rate", value: "94%", icon: TrendingUp, iconClass: "bg-[#EEF2FF] text-[#3B5BDB]" },
] as const

const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "sarah-musa",
    name: "Sarah Musa",
    title: "Senior Admin",
    initials: "SM",
    avatarColor: "bg-[#3B5BDB] text-white",
    branch: "Ibadan HQ",
    type: "Vacation",
    duration: "4 Days",
    dateRange: "28 - 31 Oct",
  },
  {
    id: "john-obi",
    name: "John Obi",
    title: "IT Support",
    initials: "JO",
    avatarColor: "bg-[#111827] text-white",
    branch: "Maryland LAG",
    type: "Sick",
    duration: "2 Days",
    dateRange: "25 - 26 Oct",
  },
  {
    id: "elizabeth-ade",
    name: "Elizabeth Ade",
    title: "Accounting",
    initials: "EA",
    avatarColor: "bg-[#0EA5A4] text-white",
    branch: "Ado Ekiti",
    type: "Personal",
    duration: "1 Day",
    dateRange: "29 Oct",
  },
]

const ATTENDANCE_LOG: BranchAttendance[] = [
  { id: "maryland-lagos", branch: "Maryland Lagos", staff: 68, present: 62, absent: 6, rate: 91, status: "GOOD" },
  { id: "ibadan-hq", branch: "Ibadan HQ", staff: 120, present: 115, absent: 5, rate: 96, status: "GOOD" },
  { id: "ado-ekiti", branch: "Ado Ekiti", staff: 42, present: 36, absent: 6, rate: 86, status: "WARNING" },
  { id: "agodi-ibadan", branch: "Agodi Ibadan", staff: 30, present: 22, absent: 8, rate: 73, status: "CRITICAL" },
]

const LEAVE_TYPE_STYLES: Record<LeaveType, string> = {
  Vacation: "bg-blue-100 text-blue-700",
  Sick: "bg-rose-100 text-rose-700",
  Personal: "bg-slate-100 text-slate-600",
}

const STATUS_STYLES: Record<
  AttendanceStatus,
  { pill: string; dot: string; bar: string }
> = {
  GOOD: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  WARNING: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
  CRITICAL: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
}

export default function Page() {
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
            {STATS.map((stat) => (
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
                    {LEAVE_REQUESTS.map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                                req.avatarColor
                              )}
                            >
                              {req.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">
                                {req.name}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {req.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {req.branch}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                              LEAVE_TYPE_STYLES[req.type]
                            )}
                          >
                            {req.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111827]">
                              {req.duration}
                            </span>
                            <span className="text-[12px] text-[#6B7280]">
                              {req.dateRange}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              aria-label={`Approve ${req.name}'s leave`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Reject ${req.name}'s leave`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                {ATTENDANCE_LOG.map((item) => {
                  const styles = STATUS_STYLES[item.status]
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#EEF1F6] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-bold text-[#111827]">
                          {item.branch}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            styles.pill
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] text-[#6B7280]">
                        Staff: <span className="font-semibold text-[#4B5563]">{item.staff}</span>
                        {"   "}Present: <span className="font-semibold text-[#4B5563]">{item.present}</span>
                        {"   "}Absent: <span className="font-semibold text-rose-600">{item.absent}</span>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-[#EEF1F6]">
                          <div
                            className={cn("h-2 rounded-full", styles.bar)}
                            style={{ width: `${Math.round((item.present / item.staff) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[16px] font-bold text-[#111827]">
                          {item.rate}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
