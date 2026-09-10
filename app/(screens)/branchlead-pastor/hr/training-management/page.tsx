"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  GraduationCap,
  Users,
  CalendarClock,
  Download,
  Calendar,
  ArrowUpRight,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadRegisterStaffModal from "@/components/hr/BranchLeadRegisterStaffModal"
import BranchLeadTrainingCalendarModal from "@/components/hr/BranchLeadTrainingCalendarModal"
import { HrPanelState, HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { useTrainingEvents, useTrainingMetrics } from "@/components/hooks/hr/useHrTraining"
import { branchName } from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const cardCls =
  "rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

export default function Page() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [registerFor, setRegisterFor] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const metrics = useTrainingMetrics()
  const events = useTrainingEvents({ limit: 20 })

  /** The list endpoint has no search parameter, so this narrows the loaded page. */
  const rows = useMemo(() => {
    const all = events.data?.items ?? []
    const query = search.trim().toLowerCase()
    if (!query) return all
    return all.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.trainerName.toLowerCase().includes(query),
    )
  }, [events.data, search])

  // Captured once per mount so the render stays pure and stable.
  const [now] = useState(() => Date.now())

  const upcoming = useMemo(
    () => rows.filter((event) => new Date(event.startDate).getTime() >= now).slice(0, 2),
    [rows, now],
  )

  function handleExport() {
    const csv = rowsToCsv(
      rows.map((event) => ({
        Title: event.title,
        Trainer: event.trainerName,
        Scope: event.isGlobal ? "All branches" : branchName(event.branchId),
        Start: formatDate(event.startDate, "iso"),
        End: formatDate(event.endDate, "iso"),
        Time: `${event.startTime} - ${event.endTime}`,
      })),
    )
    downloadCsv(`training-schedule-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Training</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search training..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#3B5BDB]"
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={labelCls}>Total Sessions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.totalSessions ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#3B5BDB]">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={labelCls}>Staff Enrolled</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.staffEnrolled ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-emerald-600">
                  <Users className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={labelCls}>Pending Completions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={metrics.data?.pendingCompletions ?? 0}
                    />
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2] text-rose-600">
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
                  onClick={handleExport}
                  disabled={rows.length === 0}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3B5BDB] hover:underline disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      {["Training Title", "Trainer", "Scope", "Date"].map((h) => (
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
                      isLoading={events.isLoading}
                      error={events.error}
                      isEmpty={rows.length === 0}
                      emptyTitle="No training scheduled"
                      emptyDescription="Sessions for this branch will appear here."
                      onRetry={() => events.refetch()}
                    />

                    {!events.isLoading &&
                      !events.error &&
                      rows.map((event) => (
                        <tr
                          key={event._id}
                          onClick={() =>
                            router.push(`/branchlead-pastor/hr/training-management`)
                          }
                          className="hover:bg-[#FAFBFF]"
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
                <Calendar className="h-[18px] w-[18px] text-[#3B5BDB]" />
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
                className="mt-5 flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#3B5BDB] hover:underline"
              >
                VIEW FULL CALENDAR
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <BranchLeadRegisterStaffModal
        open={registerFor !== null}
        trainingEventId={registerFor}
        onClose={() => setRegisterFor(null)}
      />
      <BranchLeadTrainingCalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
      />
    </div>
  )
}
