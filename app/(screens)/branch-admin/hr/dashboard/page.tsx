"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { HrPanelState, HrStatValue } from "@/components/hr/HrDataState"
import { useAdminHrDashboard } from "@/components/hooks/hr/useHrDashboard"
import { useAttendanceLogs } from "@/components/hooks/hr/useHrAttendance"
import { useAuth } from "@/components/auth/AuthProvider"
import { clockTime, employeeName } from "@/lib/hr/normalize"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Menu,
  Download,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  UserPlus,
  ChevronRight,
  ArrowRight,
} from "lucide-react"

/** Where each backend `pendingActions[].type` sends the admin. */
const PENDING_ACTION_ROUTES: Record<string, { href: string; cta: string }> = {
  leave_review: { href: "/branch-admin/hr/leave", cta: "Process" },
  loan_verification: { href: "/branch-admin/hr/employee-loans", cta: "Review" },
}

const ACTIVITY_DOTS: Record<string, string> = {
  present: "bg-emerald-500",
  late: "bg-amber-500",
  absent: "bg-red-500",
  half_day: "bg-blue-500",
  missing: "bg-[#6B7280]",
}

function greeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const dashboard = useAdminHrDashboard()

  /**
   * The admin dashboard endpoint returns counters only, so the activity feed
   * reads the most recent attendance logs instead of inventing entries.
   */
  const activity = useAttendanceLogs({ limit: 5 })

  const kpis = dashboard.data?.kpis

  const statCards = useMemo(
    () => [
      {
        key: "total",
        value: kpis ? String(kpis.totalEmployees) : "—",
        label: "TOTAL EMPLOYEES",
        icon: Users,
        tint: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        key: "onLeave",
        value: kpis ? String(kpis.onLeaveToday) : "—",
        label: "ON LEAVE TODAY",
        icon: Calendar,
        tint: "bg-amber-50",
        iconColor: "text-amber-600",
      },
      {
        key: "clockedIn",
        value: kpis ? `${kpis.clockedInToday} / ${kpis.totalEmployees}` : "—",
        label: "CLOCKED IN TODAY",
        icon: Clock,
        tint: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        key: "trainings",
        value: kpis ? String(kpis.activeTrainings) : "—",
        label: "ACTIVE TRAINING EVENTS",
        icon: GraduationCap,
        tint: "bg-violet-50",
        iconColor: "text-violet-600",
      },
    ],
    [kpis],
  )

  const clockInPercent = `${kpis?.clockInRate ?? 0}%`

  const pendingActions = useMemo(
    () => (dashboard.data?.pendingActions ?? []).filter((action) => action.count > 0),
    [dashboard.data],
  )
  const pendingTotal = pendingActions.reduce((sum, action) => sum + action.count, 0)

  const today = new Date()

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
              <h1 className="text-[26px] font-bold text-[#111827]">
                {greeting(today)}, {user?.firstName ?? user?.name ?? "Admin"}
              </h1>
              <p className="text-[14px] text-[#6B7280]">
                {today.toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
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
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.key} className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[28px] font-bold text-[#111827] leading-none">
                        <HrStatValue
                          isLoading={dashboard.isLoading}
                          error={dashboard.error}
                          value={card.value}
                        />
                      </div>
                      <div className="mt-2 text-[12px] font-semibold text-[#6B7280]">{card.label}</div>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        card.tint,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", card.iconColor)} />
                    </div>
                  </div>

                  {card.key === "onLeave" && (
                    <button
                      onClick={() => router.push("/branch-admin/hr/leave")}
                      className="mt-3 text-[12px] font-semibold text-[#2563EB]"
                    >
                      View List
                    </button>
                  )}

                  {card.key === "clockedIn" && (
                    <div className="mt-3">
                      <div className="mb-1.5 text-[12px] font-semibold text-[#6B7280]">
                        {clockInPercent}
                      </div>
                      <div className="h-2 rounded-full bg-[#EEF1F6]">
                        <div
                          className="h-2 rounded-full bg-emerald-500 transition-all"
                          style={{ width: clockInPercent }}
                        />
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
                {pendingTotal > 0 && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                    {pendingTotal} Pending
                  </span>
                )}
              </div>

              {dashboard.isLoading || dashboard.error || pendingActions.length === 0 ? (
                <div className="border-t border-[#EEF1F6] p-5">
                  <HrPanelState
                    isLoading={dashboard.isLoading}
                    error={dashboard.error}
                    isEmpty={pendingActions.length === 0}
                    emptyTitle="Nothing needs your attention"
                    emptyDescription="Leave and loan requests will appear here as they come in."
                    onRetry={() => dashboard.refetch()}
                    className="border-0 p-4"
                  />
                </div>
              ) : (
                <div className="divide-y divide-[#EEF1F6] border-t border-[#EEF1F6]">
                  {pendingActions.map((item) => {
                    const route = PENDING_ACTION_ROUTES[item.type]
                    return (
                      <div key={item.type} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-bold text-[#2563EB]">
                          {item.count}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-bold text-[#111827]">
                            {item.label}
                          </div>
                          <div className="truncate text-[13px] text-[#6B7280]">
                            {item.count} awaiting action
                          </div>
                        </div>
                        {route && (
                          <button
                            onClick={() => router.push(route.href)}
                            className="shrink-0 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white"
                          >
                            {route.cta}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Quick Actions */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Quick Actions</h2>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => router.push("/branch-admin/hr/attendance")}
                    className="flex w-full items-center justify-between rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4" />
                      Clock In/Out
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => router.push("/branch-admin/hr/employee-directory")}
                    className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-medium text-[#4B5563]"
                  >
                    <span className="flex items-center gap-2.5">
                      <UserPlus className="h-4 w-4 text-[#6B7280]" />
                      Add Employee
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                  </button>

                  <button
                    onClick={() => router.push("/branch-admin/hr/training-management")}
                    className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-medium text-[#4B5563]"
                  >
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
                {activity.isLoading || activity.error || (activity.data?.items.length ?? 0) === 0 ? (
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
                  <div className="mt-4 space-y-4">
                    {activity.data?.items.map((log, idx, all) => (
                      <div key={log._id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                              ACTIVITY_DOTS[log.status] ?? "bg-[#6B7280]",
                            )}
                          />
                          {idx < all.length - 1 && <span className="mt-1 w-px flex-1 bg-[#EEF1F6]" />}
                        </div>
                        <div className="pb-1">
                          <div className="text-[13px] font-semibold text-[#111827]">
                            {employeeName(log.employeeId)}{" "}
                            {log.clockIn ? "clocked in" : `marked ${log.status.replace("_", " ")}`}
                          </div>
                          <div className="text-[12px] text-[#9CA3AF]">
                            {log.clockIn
                              ? clockTime(log.clockIn)
                              : new Date(log.date).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
