"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Bell,
  PanelLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plane,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadLeaveApprovalModal from "@/components/hr/BranchLeadLeaveApprovalModal"
import { HrPanelState, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useLeaveCalendar,
  useLeaveMetrics,
  useLeaveRequests,
} from "@/components/hooks/hr/useHrLeave"
import { deref, employeeName, initials } from "@/lib/hr/normalize"
import type { LeaveRequest } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CHIP_TONES = [
  "bg-[#EFF6FF] text-[#2563EB]",
  "bg-rose-50 text-rose-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
]

function toneFor(code: string): string {
  let hash = 0
  for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) % 997
  return CHIP_TONES[hash % CHIP_TONES.length]
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default function Page() {
  const [calendarView, setCalendarView] = useState(false)
  const [decision, setDecision] = useState<{
    request: LeaveRequest
    intent: "approve" | "reject"
  } | null>(null)
  const [page, setPage] = useState(1)

  /** The pastor's queue is the requests still awaiting a supervisor decision. */
  const leaves = useLeaveRequests({
    page,
    limit: PAGE_SIZE,
    status: "pending_supervisor",
  })
  const metrics = useLeaveMetrics()

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex h-[42.67px] items-center justify-between border-b border-[#EEF1F6]">
          <span className="text-[13px] font-bold">Leave Approval</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-8 w-[200px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Toggle panel"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Requests card */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            {/* Card header */}
            <div className="flex flex-col gap-3 border-b border-[#F3F4F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[16px] font-bold">
                Requests Needing Attention
                {(metrics.data?.pending ?? 0) > 0 ? ` (${metrics.data?.pending})` : ""}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarView((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-[12px] font-semibold",
                    calendarView
                      ? "bg-[#111827] text-white"
                      : "bg-[#2563EB] text-white hover:bg-blue-700",
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Calendar
                </button>
              </div>
            </div>

            {calendarView ? (
              <CalendarView />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        {[
                          "Staff Member",
                          "Leave Type",
                          "Dates & Duration",
                          "Conflict Status",
                          "Actions",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={cn(
                              "px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]",
                              i === 4 && "text-right",
                            )}
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
                        isEmpty={(leaves.data?.items.length ?? 0) === 0}
                        emptyTitle="Nothing awaiting your approval"
                        emptyDescription="Leave requests appear here as staff apply."
                        onRetry={() => leaves.refetch()}
                      />

                      {!leaves.isLoading &&
                        !leaves.error &&
                        leaves.data?.items.map((req) => {
                          const name = employeeName(req.employeeId)
                          const employee = deref(req.employeeId)
                          const conflicts = req.conflictCount ?? 0
                          return (
                            <tr
                              key={req._id}
                              onClick={() => setDecision({ request: req, intent: "approve" })}
                              className="cursor-pointer hover:bg-[#FAFBFF]"
                            >
                              <td className="px-4 py-4 text-[13px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B5BDB] text-[12px] font-bold text-white">
                                    {initials(name)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[#111827]">{name}</span>
                                    <span className="text-[12px] text-[#6B7280]">
                                      {employee?.department ?? employee?.jobTitle ?? "—"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                                  <Plane className="h-3 w-3" />
                                  {deref(req.leaveTypeId)?.name ?? "Leave"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#111827]">
                                    {formatDate(req.startDate, "medium")} –{" "}
                                    {formatDate(req.endDate, "medium")}
                                  </span>
                                  <span className="text-[12px] text-[#6B7280]">
                                    {req.totalDays} {req.totalDays === 1 ? "day" : "days"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                {conflicts > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    {conflicts} Conflict{conflicts === 1 ? "" : "s"} Detected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    No Overlaps
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDecision({ request: req, intent: "reject" })
                                    }}
                                    className="rounded-md border border-rose-200 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDecision({ request: req, intent: "approve" })
                                    }}
                                    className="rounded-md bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
                                  >
                                    Approve
                                  </button>
                                </div>
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
                  itemCount={leaves.data?.items.length ?? 0}
                  noun="pending requests"
                />
              </>
            )}
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

function CalendarView() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const calendar = useLeaveCalendar({ month: cursor.month, year: cursor.year })

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const chipsByDay = useMemo(() => {
    const map = new Map<number, { label: string; tone: string }[]>()
    for (const request of calendar.data ?? []) {
      const start = startOfDay(new Date(request.startDate))
      const end = startOfDay(new Date(request.endDate))
      const type = deref(request.leaveTypeId)
      const code = type?.code ?? type?.name ?? "GEN"
      const label = `${employeeName(request.employeeId).split(" ")[0]} (${code
        .slice(0, 1)
        .toUpperCase()})`

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(cursor.year, cursor.month, day)
        if (date >= start && date <= end) {
          const list = map.get(day) ?? []
          list.push({ label, tone: toneFor(code) })
          map.set(day, list)
        }
      }
    }
    return map
  }, [calendar.data, cursor, daysInMonth])

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  })

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#111827]">
          {monthLabel}
          {calendar.isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9CA3AF]" />
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const now = new Date()
              setCursor({ year: now.getFullYear(), month: now.getMonth() })
            }}
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {calendar.error ? (
        <HrPanelState
          isLoading={false}
          error={calendar.error}
          onRetry={() => calendar.refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-[#EEF1F6]">
          <div className="grid grid-cols-7 bg-[#F9FAFB]">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => (
              <div
                key={idx}
                className="min-h-[84px] border-b border-r border-[#F3F4F6] p-1.5 last:border-r-0"
              >
                {day && (
                  <>
                    <div className="mb-1 text-[11px] font-semibold text-[#6B7280]">{day}</div>
                    <div className="space-y-1">
                      {(chipsByDay.get(day) ?? []).slice(0, 3).map((chip, i) => (
                        <div
                          key={i}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            chip.tone,
                          )}
                        >
                          {chip.label}
                        </div>
                      ))}
                      {(chipsByDay.get(day)?.length ?? 0) > 3 && (
                        <div className="px-1.5 text-[10px] font-semibold text-[#9CA3AF]">
                          +{(chipsByDay.get(day)?.length ?? 0) - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
