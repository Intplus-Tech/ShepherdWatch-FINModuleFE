"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Menu,
  GraduationCap,
  Users,
  CalendarClock,
  Calendar,
  Plus,
  ArrowUpRight,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminCreateTrainingModal from "@/components/hr/BranchAdminCreateTrainingModal"
import BranchAdminRegisterStaffModal from "@/components/hr/BranchAdminRegisterStaffModal"
import BranchAdminTrainingCalendarModal from "@/components/hr/BranchAdminTrainingCalendarModal"
import { HrPanelState, HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { useTrainingEvents, useTrainingMetrics } from "@/components/hooks/hr/useHrTraining"
import { branchName } from "@/lib/hr/normalize"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const cardCls = "rounded-xl border border-[#EEF1F6] bg-white p-5"
const statLabelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

export default function Page() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [registerFor, setRegisterFor] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const metrics = useTrainingMetrics()
  const events = useTrainingEvents({ limit: 20 })

  /**
   * The registry lists scheduled events. There is no cross-event participant
   * endpoint — enrolments live under `GET /trainings/:id`, which the oversight
   * screen opens per event.
   */
  const rows = useMemo(() => events.data?.items ?? [], [events.data])

  // Captured once per mount so the render stays pure and stable.
  const [now] = useState(() => Date.now())

  const upcoming = useMemo(
    () => rows.filter((event) => new Date(event.startDate).getTime() >= now).slice(0, 2),
    [rows, now],
  )

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/training-management"
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
            <div className="text-[15px] font-bold text-[#111827]">Training</div>
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Total Sessions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.totalSessions ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Staff Enrolled</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.staffEnrolled ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Pending Completions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.pendingCompletions ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CalendarClock className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Training Registry */}
            <div className={cn(cardCls, "lg:col-span-2 p-0 overflow-hidden")}>
              <div className="flex items-center justify-between p-5 pb-4">
                <h2 className="text-[16px] font-bold text-[#111827]">Training Registry</h2>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2563EB] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Training
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#EEF2FF]">
                    <tr>
                      {["Training Title", "Trainer", "Scope", "Dates"].map((h) => (
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
                      colSpan={4}
                      isLoading={events.isLoading}
                      error={events.error}
                      isEmpty={rows.length === 0}
                      emptyTitle="No training scheduled"
                      emptyDescription="Create a training event to start enrolling staff."
                      onRetry={() => events.refetch()}
                    />

                    {!events.isLoading &&
                      !events.error &&
                      rows.map((event) => (
                        <tr
                          key={event._id}
                          onClick={() =>
                            router.push(`/branch-admin/hr/training-oversight?id=${event._id}`)
                          }
                          className="cursor-pointer hover:bg-[#FAFBFF]"
                        >
                          <td className="px-4 py-3 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">{event.title}</span>
                              <span className="text-[12px] text-[#9CA3AF]">
                                {event.venueOrLink}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                            {event.trainerName}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                            {event.isGlobal ? "All branches" : branchName(event.branchId)}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                            {formatDate(event.startDate, "medium")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Upcoming Sessions */}
            <div className={cn(cardCls, "lg:col-span-1")}>
              <div className="flex items-center gap-2">
                <Calendar className="h-[18px] w-[18px] text-[#2563EB]" />
                <h2 className="text-[16px] font-bold text-[#111827]">Upcoming Sessions</h2>
              </div>

              {events.isLoading || events.error || upcoming.length === 0 ? (
                <HrPanelState
                  isLoading={events.isLoading}
                  error={events.error}
                  isEmpty={upcoming.length === 0}
                  emptyTitle="Nothing upcoming"
                  emptyDescription="Future sessions will show here."
                  onRetry={() => events.refetch()}
                  className="mt-5 border-0 p-4"
                />
              ) : (
                <div className="mt-5 flex flex-col gap-4">
                  {upcoming.map((session, index) => (
                    <div
                      key={session._id}
                      className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        <span>{formatDate(session.startDate, "medium")}</span>
                        <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                        <span>{session.startTime}</span>
                      </div>
                      <p className="mt-2 text-[15px] font-bold text-[#111827]">{session.title}</p>
                      <button
                        type="button"
                        onClick={() => setRegisterFor(session._id)}
                        className={cn(
                          "mt-3 w-full rounded-md px-4 py-2 text-[12px] font-semibold",
                          index === 0
                            ? "bg-[#111827] text-white"
                            : "border border-[#E5E7EB] bg-white text-[#4B5563]",
                        )}
                      >
                        REGISTER STAFF
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                VIEW FULL CALENDAR
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      <BranchAdminCreateTrainingModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BranchAdminRegisterStaffModal
        open={registerFor !== null}
        trainingEventId={registerFor}
        onClose={() => setRegisterFor(null)}
      />
      <BranchAdminTrainingCalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />
    </div>
  )
}
