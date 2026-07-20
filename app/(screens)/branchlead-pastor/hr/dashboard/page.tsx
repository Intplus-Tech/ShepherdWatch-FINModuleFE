"use client"

import { useMemo, useState } from "react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
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
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  Flag,
} from "lucide-react"

type QuickAction = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

type LeaveEntry = {
  name: string
  type: string
}

type StaffStatus = "ACTIVE" | "ON LEAVE"

type StaffRow = {
  name: string
  role: string
  dept: string
  status: StaffStatus
}

type Activity = {
  text: string
  time: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Add Employee",
    description: "Onboard new branch staff and ministry volunteers.",
    icon: UserPlus,
    tint: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  {
    title: "Apply for Leave",
    description: "Process time-off requests and sabbatical tracking.",
    icon: CalendarDays,
    tint: "bg-[#ECFDF5] text-emerald-600",
  },
  {
    title: "Mark Attendance",
    description: "Daily check-ins for operational and ministerial staff.",
    icon: ClipboardCheck,
    tint: "bg-[#FEF3C7] text-amber-600",
  },
  {
    title: "Initiate Loan",
    description: "Staff welfare fund applications and appraisals.",
    icon: Banknote,
    tint: "bg-[#F3E8FF] text-purple-600",
  },
]

const STAFF_ON_LEAVE: LeaveEntry[] = [
  { name: "Chidi Okoro", type: "Annual Leave" },
  { name: "Amina Bello", type: "Sick Leave" },
  { name: "Yinka Adeyemi", type: "Study Leave" },
]

const STAFF_STATUS: StaffRow[] = [
  { name: "Johnathan Doe", role: "Accountant", dept: "Finance", status: "ACTIVE" },
  { name: "Fatima Yusuf", role: "Front Desk", dept: "Admin", status: "ACTIVE" },
  { name: "Ikechukwu Nwosu", role: "Maintenance", dept: "Operations", status: "ON LEAVE" },
]

const RECENT_ACTIVITY: Activity[] = [
  {
    text: "Added Tunde Bakare to the Security Department.",
    time: "2 hours ago",
    icon: UserPlus,
    tint: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  {
    text: "Approved 5 days leave for Sarah Musa.",
    time: "4 hours ago",
    icon: CheckCircle2,
    tint: "bg-[#ECFDF5] text-emerald-600",
  },
  {
    text: "Initiated loan appraisal for Daniel Okon.",
    time: "Yesterday, 4:30 PM",
    icon: Banknote,
    tint: "bg-[#F3E8FF] text-purple-600",
  },
  {
    text: "Flagged Late Attendance for 4 staff members.",
    time: "Yesterday, 9:15 AM",
    icon: Flag,
    tint: "bg-[#FEF2F2] text-rose-600",
  },
]

const STATUS_BADGE: Record<StaffStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  "ON LEAVE": "bg-amber-100 text-amber-700",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const cardCls =
  "rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

export default function Page() {
  const [search, setSearch] = useState("")

  // 92% donut geometry
  const donut = useMemo(() => {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const pct = 92
    return {
      radius,
      circumference,
      offset: circumference * (1 - pct / 100),
    }
  }, [])

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
            <button className="flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white">
              <Clock className="h-4 w-4" />
              Clock-In · Clock-Out
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Page header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="text-[26px] font-bold text-[#111827]">Maryland Lagos Dashboard</h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Operational home for Branch Administration • Tuesday, Oct 24
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50">
                <Calendar className="h-4 w-4" />
                Schedule Shift
              </button>
              <button className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white">
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
                <button key={action.title} className={cn(cardCls, "text-left")}>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      action.tint
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
                  <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold text-[#6B7280]">
                    Maryland Branch
                  </span>
                </div>

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
                          <span className="text-[22px] font-bold text-[#111827]">92%</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 flex items-center justify-center gap-1 text-[12px] font-semibold text-emerald-600">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +4% from yesterday
                    </p>
                  </div>

                  {/* Staff on Leave */}
                  <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                    <p className="text-[13px] font-semibold text-[#6B7280]">Staff on Leave (3)</p>
                    <div className="mt-3 flex flex-col gap-3">
                      {STAFF_ON_LEAVE.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                            {initials(entry.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#111827] truncate">
                              {entry.name}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF]">{entry.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Training */}
                  <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                    <p className="text-[13px] font-semibold text-[#6B7280]">Next Training</p>
                    <div className="mt-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-purple-600">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <p className="mt-3 text-[15px] font-bold text-[#111827]">
                        Security Awareness
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                        <Clock className="h-3.5 w-3.5" />
                        Starts at 2:00 PM
                      </p>
                    </div>
                  </div>
                </div>
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
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Role
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Dept
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {STAFF_STATUS.map((row) => (
                        <tr key={row.name}>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                                {initials(row.name)}
                              </span>
                              <span className="font-semibold text-[#111827]">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#6B7280]">{row.role}</td>
                          <td className="px-4 py-4 text-[13px] text-[#6B7280]">{row.dept}</td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                STATUS_BADGE[row.status]
                              )}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1">
              <div className={cardCls}>
                <h2 className="text-[16px] font-bold text-[#111827]">Recent Activity</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">Your actions in the last 24h</p>

                <div className="mt-5 flex flex-col">
                  {RECENT_ACTIVITY.map((activity, idx) => {
                    const Icon = activity.icon
                    const last = idx === RECENT_ACTIVITY.length - 1
                    return (
                      <div key={activity.text} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              activity.tint
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          {!last && <span className="w-px flex-1 bg-[#F3F4F6]" />}
                        </div>
                        <div className={cn("min-w-0", last ? "pb-0" : "pb-5")}>
                          <p className="text-[13px] font-medium text-[#111827]">{activity.text}</p>
                          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
