"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Bell,
  PanelLeft,
  Calendar,
  SlidersHorizontal,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Plane,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadLeaveApprovalModal from "@/components/hr/BranchLeadLeaveApprovalModal"
import BranchAdminApplyLeaveModal from "@/components/hr/BranchAdminApplyLeaveModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrLeaves, useHrLeaveCalendar, useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useToast } from "@/components/ui/toast"
import { formatDate, formatShortDate, initials } from "@/lib/hr/display"
import type { HrLeave } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

const AVATAR_TINTS = ["bg-[#EFF2FF] text-[#3B5BDB]", "bg-[#111827] text-white"]

const CHIP_TONE_ORDER = ["vacation", "sick", "casual"] as const

const PAGE_SIZE = 20

type CalendarChip = { label: string; tone: "vacation" | "sick" | "casual" }

const CHIP_TONES: Record<CalendarChip["tone"], string> = {
  vacation: "bg-[#EFF6FF] text-[#2563EB]",
  sick: "bg-rose-50 text-rose-600",
  casual: "bg-amber-50 text-amber-600",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Page() {
  const [calendarView, setCalendarView] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<HrLeave | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { pushToast } = useToast()
  // The pastor works the queue that is waiting on a supervisor decision.
  const { leaves, pagination, loading, error, refresh } = useHrLeaves({
    page,
    limit: PAGE_SIZE,
    status: "pending_supervisor",
  })
  const { rejectLeave } = useLeaveMutations()
  const [decliningId, setDecliningId] = useState<string | null>(null)

  const openRequest = (request: HrLeave) => {
    setSelected(request)
    setModalOpen(true)
  }

  const quickDecline = async (request: HrLeave) => {
    setDecliningId(request.id)
    try {
      await rejectLeave(request.id, "Declined by the branch pastor")
      pushToast(`Leave declined for ${request.employeeName}`, "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to decline this request", "error")
    } finally {
      setDecliningId(null)
    }
  }

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
              <h2 className="text-[16px] font-bold">Requests Needing Attention</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarView((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-[12px] font-semibold",
                    calendarView
                      ? "bg-[#111827] text-white"
                      : "bg-[#2563EB] text-white hover:bg-blue-700"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Calendar
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Date
                </button>
              </div>
            </div>

            {calendarView ? (
              <CalendarView
                onBack={() => setCalendarView(false)}
                onRecordLeave={() => setApplyOpen(true)}
              />
            ) : (
              <ListView
                leaves={leaves}
                pagination={pagination}
                loading={loading}
                error={error}
                decliningId={decliningId}
                onOpenRequest={openRequest}
                onDecline={quickDecline}
                onRetry={refresh}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </main>

      <BranchAdminApplyLeaveModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onApplied={refresh}
      />

      <BranchLeadLeaveApprovalModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        request={selected}
        onDecided={refresh}
      />
    </div>
  )
}

function ListView({
  leaves,
  pagination,
  loading,
  error,
  decliningId,
  onOpenRequest,
  onDecline,
  onRetry,
  onPageChange,
}: {
  leaves: HrLeave[]
  pagination: { total: number; page: number; limit: number; pages: number }
  loading: boolean
  error: string | null
  decliningId: string | null
  onOpenRequest: (request: HrLeave) => void
  onDecline: (request: HrLeave) => void
  onRetry: () => void
  onPageChange: (page: number) => void
}) {
  return (
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
                    i === 4 && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {leaves.map((req, index) => (
              <tr
                key={req.id}
                onClick={() => onOpenRequest(req)}
                className="cursor-pointer hover:bg-[#FAFBFF]"
              >
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
                <td className="px-4 py-4 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                    <Plane className="h-3 w-3" />
                    {req.leaveTypeName || "Leave"}
                  </span>
                </td>
                <td className="px-4 py-4 text-[13px]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111827]">
                      {formatShortDate(req.startDate)} - {formatShortDate(req.endDate)}
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      {req.totalDays} day{req.totalDays === 1 ? "" : "s"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px]">
                  {req.conflictCount ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      {req.conflictCount} Conflict{req.conflictCount === 1 ? "" : "s"} Detected
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
                      disabled={decliningId === req.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDecline(req)
                      }}
                      className="rounded-md border border-rose-200 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {decliningId === req.id ? "Declining…" : "Decline"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenRequest(req)
                      }}
                      className="rounded-md bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
                    >
                      Approve
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
              emptyMessage="No leave requests are waiting on your decision."
              onRetry={onRetry}
            />
          </tbody>
        </table>
      </div>

      <HrPaginationBar
        pagination={pagination}
        onPageChange={onPageChange}
        noun="pending requests"
        className="px-5 py-4"
      />
    </>
  )
}

function CalendarView({
  onBack,
  onRecordLeave,
}: {
  onBack: () => void
  onRecordLeave: () => void
}) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())

  const { entries, loading, error } = useHrLeaveCalendar({ month, year })

  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // A leave spans days, so each entry is stamped onto every day it covers.
  const chipsByDay = useMemo(() => {
    const map = new Map<number, { label: string; tone: (typeof CHIP_TONE_ORDER)[number] }[]>()
    entries.forEach((entry, index) => {
      const start = new Date(entry.startDate)
      const end = new Date(entry.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

      for (let day = 1; day <= daysInMonth; day += 1) {
        const cursor = new Date(year, month - 1, day)
        if (cursor < new Date(start.toDateString())) continue
        if (cursor > new Date(end.toDateString())) continue
        const list = map.get(day) ?? []
        list.push({
          label: `${entry.employeeName || "Staff"} · ${entry.leaveTypeCode || entry.leaveTypeName || "Leave"}`,
          tone: CHIP_TONE_ORDER[index % CHIP_TONE_ORDER.length],
        })
        map.set(day, list)
      }
    })
    return map
  }, [entries, daysInMonth, month, year])

  const upcoming = useMemo(() => {
    const now = new Date()
    return entries
      .filter((entry) => new Date(entry.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }, [entries])

  const pendingCount = entries.filter((entry) => entry.status.startsWith("pending")).length

  const step = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setMonth(next.getMonth() + 1)
    setYear(next.getFullYear())
  }

  return (
    <div className="p-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Month grid */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#111827]">
              {new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => step(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => step(1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </span>
          </div>
          {loading ? (
            <p className="mb-2 text-[12px] text-[#6B7280]">Loading leave calendar…</p>
          ) : null}
          {error ? <p className="mb-2 text-[12px] text-rose-600">{error}</p> : null}
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
                      <div className="mb-1 text-[11px] font-semibold text-[#6B7280]">
                        {day}
                      </div>
                      <div className="space-y-1">
                        {(chipsByDay.get(day) ?? []).slice(0, 3).map((chip, i: number) => (
                          <div
                            key={i}
                            className={cn(
                              "truncate rounded px-1.5 py-0.5 text-[10px] font-semibold",
                              CHIP_TONES[chip.tone]
                            )}
                          >
                            {chip.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
              Vacation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Sick Leave
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Casual / Other
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-1">
          <button
            type="button"
            onClick={onRecordLeave}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-blue-700"
          >
            <CalendarDays className="h-4 w-4" />
            Record Leave on Behalf
          </button>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Upcoming Leave</h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                {pendingCount} Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {upcoming.map((entry) => (
                <div key={entry.id} className="rounded-[10px] border border-[#EEF1F6] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#111827]">
                        {entry.employeeName || "Staff member"}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {entry.jobTitle || entry.employeeCode || "—"}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        entry.status === "approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {entry.status === "approved" ? "APPROVED" : "PENDING"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>
                      {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
                    </span>
                    <span className="font-semibold text-[#4B5563]">
                      {entry.leaveTypeName || "Leave"}
                    </span>
                  </div>
                </div>
              ))}

              {!loading && upcoming.length === 0 ? (
                <p className="text-[12px] text-[#9CA3AF]">No upcoming leave this month.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
