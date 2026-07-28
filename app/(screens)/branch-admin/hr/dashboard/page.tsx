"use client"

import { useState } from "react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Menu,
  Download,
  Plus,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  UserPlus,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react"

type StatCard = {
  value: string
  label: string
  icon: typeof Users
  tint: string
  iconColor: string
}

const STAT_CARDS: StatCard[] = [
  { value: "124", label: "TOTAL EMPLOYEES", icon: Users, tint: "bg-blue-50", iconColor: "text-blue-600" },
  { value: "8", label: "ON LEAVE TODAY", icon: Calendar, tint: "bg-amber-50", iconColor: "text-amber-600" },
  { value: "102 / 124", label: "CLOCKED IN TODAY", icon: Clock, tint: "bg-emerald-50", iconColor: "text-emerald-600" },
  { value: "3", label: "ACTIVE TRAINING EVENTS", icon: GraduationCap, tint: "bg-violet-50", iconColor: "text-violet-600" },
]

type PendingAction = {
  name: string
  title: string
  sub: string
  action: string
  variant: "dark" | "outline"
}

const PENDING_ACTIONS: PendingAction[] = [
  { name: "John Doe", title: "Leave Request: John Doe", sub: "Submitted 3 days ago", action: "Process", variant: "dark" },
  { name: "Sarah Smith", title: "Document Verification: Sarah Smith", sub: "Awaiting HR audit", action: "Review", variant: "dark" },
  { name: "Michael Chen", title: "New Employee Setup: Michael Chen", sub: "Onboarding scheduled for Monday", action: "Process", variant: "dark" },
  { name: "Anna Lee", title: "Payroll Discrepancy: Anna Lee", sub: "Mismatch in overtime hours", action: "Investigate", variant: "outline" },
]

type Activity = {
  text: string
  time: string
  dot: string
}

const RECENT_ACTIVITY: Activity[] = [
  { text: "Mary Sue clocked in", time: "08:02 AM Today", dot: "bg-emerald-500" },
  { text: "New leave request submitted", time: "07:45 AM Today", dot: "bg-blue-500" },
  { text: "Admin updated records for Dept A", time: "Yesterday, 04:30 PM", dot: "bg-violet-500" },
  { text: "Training completion: Compliance 101", time: "Yesterday, 02:15 PM", dot: "bg-amber-500" },
  { text: "Payroll cycle finalized", time: "Yesterday, 11:00 AM", dot: "bg-[#6B7280]" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/dashboard"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827]">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-[#111827]">Good morning, Admin</h1>
              <p className="text-[14px] text-[#6B7280]">Wednesday, July 22, 2026</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563]">
                <Download className="h-4 w-4" />
                Export Summary
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[28px] font-bold text-[#111827] leading-none">{card.value}</div>
                      <div className="mt-2 text-[12px] font-semibold text-[#6B7280]">{card.label}</div>
                    </div>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", card.tint)}>
                      <Icon className={cn("h-5 w-5", card.iconColor)} />
                    </div>
                  </div>

                  {card.label === "TOTAL EMPLOYEES" && (
                    <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      +2.4%
                    </div>
                  )}

                  {card.label === "ON LEAVE TODAY" && (
                    <button className="mt-3 text-[12px] font-semibold text-[#2563EB]">View List</button>
                  )}

                  {card.label === "CLOCKED IN TODAY" && (
                    <div className="mt-3">
                      <div className="mb-1.5 text-[12px] font-semibold text-[#6B7280]">82%</div>
                      <div className="h-2 rounded-full bg-[#EEF1F6]">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: "82%" }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Main grid */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Pending Actions */}
            <div className="lg:col-span-2 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Pending Actions</h2>
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                  4 Urgent
                </span>
              </div>

              <div className="divide-y divide-[#EEF1F6] border-t border-[#EEF1F6]">
                {PENDING_ACTIONS.map((item) => (
                  <div key={item.title} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-bold text-[#2563EB]">
                      {initials(item.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold text-[#111827]">{item.title}</div>
                      <div className="truncate text-[13px] text-[#6B7280]">{item.sub}</div>
                    </div>
                    <button
                      className={cn(
                        "shrink-0 rounded-md px-4 py-2 text-[12px]",
                        item.variant === "dark"
                          ? "bg-[#111827] font-semibold text-white"
                          : "border border-[#E5E7EB] bg-white font-medium text-[#4B5563]"
                      )}
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full bg-[#F8FAFC] py-3 text-center text-[13px] font-semibold text-[#2563EB]">
                View All Task Queue (12)
              </button>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Quick Actions */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Quick Actions</h2>
                <div className="mt-4 space-y-3">
                  <button className="flex w-full items-center justify-between rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white">
                    <span className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4" />
                      Clock In/Out
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-medium text-[#4B5563]">
                    <span className="flex items-center gap-2.5">
                      <UserPlus className="h-4 w-4 text-[#6B7280]" />
                      Add Employee
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-medium text-[#4B5563]">
                    <span className="flex items-center gap-2.5">
                      <GraduationCap className="h-4 w-4 text-[#6B7280]" />
                      Create Training
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Recent Activity</h2>
                <div className="mt-4 space-y-4">
                  {RECENT_ACTIVITY.map((activity, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", activity.dot)} />
                        {idx < RECENT_ACTIVITY.length - 1 && <span className="mt-1 w-px flex-1 bg-[#EEF1F6]" />}
                      </div>
                      <div className="pb-1">
                        <div className="text-[13px] font-semibold text-[#111827]">{activity.text}</div>
                        <div className="text-[12px] text-[#9CA3AF]">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
