"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Menu,
  Search,
  Bell,
  Calendar,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAdminApplyLeaveModal from "@/components/hr/BranchAdminApplyLeaveModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import { useHrLeaves, useHrLeaveCalendar, useLeaveMutations } from "@/components/hooks/useHrLeaves"
import {
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_STYLES,
  formatDate,
  formatShortDate,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import type { HrLeave } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

/** Tab → the status value the leaves endpoint filters on. */
const TAB_STATUS: Record<string, string> = {
  All: "",
  Pending: "pending_supervisor",
  Approved: "approved",
  Declined: "declined",
}

const AVATAR_TINTS = ["bg-[#EEF2FF] text-[#2563EB]", "bg-[#111827] text-white"]

/** Calendar chips cycle these tints per leave type. */
const CHIP_TONE_ORDER = ["vacation", "sick", "casual"] as const

const PAGE_SIZE = 20

const TABS = ["All", "Pending", "Approved", "Declined"] as const
type Tab = (typeof TABS)[number]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type CalendarChip = { label: string; tone: "vacation" | "sick" | "casual" }

const CHIP_TONES: Record<CalendarChip["tone"], string> = {
  vacation: "bg-[#EFF6FF] text-[#2563EB]",
  sick: "bg-rose-50 text-rose-600",
  casual: "bg-amber-50 text-amber-600",
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calendarView, setCalendarView] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("All")
  const [typeFilter, setTypeFilter] = useState("")
  const [selected, setSelected] = useState<HrLeave | null>(null)
  const [page, setPage] = useState(1)

  const { pushToast } = useToast()
  const { leaves, pagination, loading, error, refresh } = useHrLeaves({
    page,
    limit: PAGE_SIZE,
    status: TAB_STATUS[activeTab] ?? "",
  })

  // The endpoint filters by status only, so the type box narrows what came back.
  const filtered = useMemo(() => {
    const term = typeFilter.trim().toLowerCase()
    if (!term) return leaves
    return leaves.filter((leave) =>
      `${leave.leaveTypeName} ${leave.leaveTypeCode}`.toLowerCase().includes(term)
    )
  }, [leaves, typeFilter])

  const handleDecision = () => {
    setSelected(null)
    refresh()
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAccountantSidebar
        activeHref="/branchaccount-pastor/hr/leave"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        {/* Header */}
        <header className="flex h-[64px] items-center justify-between border-b border-[#EEF1F6] bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">Leave Requests</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Review and manage time-off requests for all ministry personnel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarView((v) => !v)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3.5 py-2 text-[12px] font-semibold",
                  calendarView
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                )}
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-[#111827] px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                Apply on Behalf
              </button>
            </div>
          </div>

          {calendarView ? (
            <CalendarView
              onBack={() => setCalendarView(false)}
              onOpenModal={() => setModalOpen(true)}
            />
          ) : (
            <>
              {/* Toolbar */}
              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab)
                          setPage(1)
                        }}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                          activeTab === tab
                            ? "bg-[#111827] text-white"
                            : "text-[#6B7280] hover:text-[#111827]"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    <select
                      defaultValue="oct"
                      className="h-9 appearance-none rounded-md border border-[#E5E7EB] bg-white pl-9 pr-8 text-[12px] font-semibold text-[#4B5563] outline-none focus:border-[#2563EB]"
                    >
                      <option value="oct">This Month (October 2023)</option>
                      <option value="nov">Next Month (November 2023)</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  placeholder="Filter by type..."
                  className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB] lg:w-[220px]"
                />
              </div>

              {/* List table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#EEF2FF]">
                      <tr>
                        {["Employee", "Leave Type", "Duration & Dates", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {filtered.map((req, index) => (
                        <tr
                          key={req.id}
                          onClick={() => setSelected(req)}
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
                            <span className="inline-flex items-center gap-2 text-[#111827]">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  index % 3 === 0
                                    ? "bg-[#2563EB]"
                                    : index % 3 === 1
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                )}
                              />
                              {req.leaveTypeName || "Leave"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#111827]">
                                {req.totalDays} {req.totalDays === 1 ? "Day" : "Days"}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {formatShortDate(req.startDate)} - {formatShortDate(req.endDate)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                statusStyle(LEAVE_STATUS_STYLES, req.status)
                              )}
                            >
                              {statusLabel(LEAVE_STATUS_LABELS, req.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <HrTableStateRow
                        colSpan={4}
                        loading={loading}
                        error={error}
                        isEmpty={filtered.length === 0}
                        emptyMessage="No leave requests match your filters."
                        onRetry={refresh}
                      />
                    </tbody>
                  </table>
                </div>

                <HrPaginationBar
                  pagination={pagination}
                  onPageChange={setPage}
                  noun="requests"
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Slide-over */}
      <LeaveRequestDrawer
        request={selected}
        onClose={() => setSelected(null)}
        onDecided={handleDecision}
        pushToast={pushToast}
      />

      <BranchAdminApplyLeaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplied={() => {
          setPage(1)
          refresh()
        }}
      />
    </div>
  )
}

function CalendarView({
  onBack,
  onOpenModal,
}: {
  onBack: () => void
  onOpenModal: () => void
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

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

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
    <div className="mt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to list
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#111827]">{monthLabel}</h3>
              <div className="flex items-center gap-2">
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
              </div>
            </div>

            {error ? (
              <p className="mb-3 text-[12px] text-rose-600">{error}</p>
            ) : null}
            {loading ? (
              <p className="mb-3 text-[12px] text-[#6B7280]">Loading leave calendar…</p>
            ) : null}

            <div className="overflow-hidden rounded-[10px] border border-[#EEF1F6]">
              <div className="grid grid-cols-7 bg-[#EEF2FF]">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
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
                          {(chipsByDay.get(day) ?? []).slice(0, 3).map((chip, i) => (
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
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-1">
          <button
            type="button"
            onClick={onOpenModal}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Apply on Behalf
          </button>

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#111827]">Upcoming Leave</h3>
              {pendingCount > 0 ? (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  {pendingCount} Pending
                </span>
              ) : null}
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
                        {entry.department || entry.jobTitle || "—"}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        statusStyle(LEAVE_STATUS_STYLES, entry.status)
                      )}
                    >
                      {statusLabel(LEAVE_STATUS_LABELS, entry.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>
                      {formatShortDate(entry.startDate)} - {formatShortDate(entry.endDate)}
                    </span>
                    <span className="font-semibold text-[#4B5563]">
                      {entry.leaveTypeName || "Leave"}
                    </span>
                  </div>
                </div>
              ))}

              {!loading && upcoming.length === 0 ? (
                <p className="text-[12px] text-[#9CA3AF]">No leave scheduled this month.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Request dossier. Leave *balances* have no endpoint yet, so this shows what the
 * API does return — the request itself — and carries the approve/decline actions.
 */
function LeaveRequestDrawer({
  request,
  onClose,
  onDecided,
  pushToast,
}: {
  request: HrLeave | null
  onClose: () => void
  onDecided: () => void
  pushToast: (message: string, type: "success" | "error" | "info") => void
}) {
  const { approveLeave, rejectLeave } = useLeaveMutations()
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!request) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [request, onClose])

  useEffect(() => {
    setComment("")
  }, [request])

  if (!request) return null

  const decided = request.status === "approved" || request.status === "declined"

  const decide = async (action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) {
      pushToast("A reason is required to decline a request", "error")
      return
    }
    setBusy(true)
    try {
      if (action === "approve") {
        await approveLeave(request.id, comment.trim() || undefined)
        pushToast("Leave approved", "success")
      } else {
        await rejectLeave(request.id, comment.trim())
        pushToast("Leave declined", "success")
      }
      onDecided()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to record that decision", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-[#6B7280] hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </button>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold",
              statusStyle(LEAVE_STATUS_STYLES, request.status)
            )}
          >
            {statusLabel(LEAVE_STATUS_LABELS, request.status)}
          </span>
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center px-6 pt-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-[18px] font-bold text-[#2563EB]">
            {initials(request.employeeName)}
          </div>
          <div className="mt-3 text-[18px] font-bold text-[#111827]">
            {request.employeeName || "Unnamed staff"}
          </div>
          <div className="text-[13px] text-[#6B7280]">
            {request.jobTitle || request.employeeCode || "—"}
          </div>
        </div>

        {/* Request detail */}
        <div className="px-6 pt-6">
          <h3 className="text-[16px] font-bold text-[#111827]">Request</h3>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B7280]">Type</dt>
              <dd className="text-right font-semibold text-[#111827]">
                {request.leaveTypeName || "Leave"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B7280]">Dates</dt>
              <dd className="text-right font-semibold text-[#111827]">
                {formatDate(request.startDate)} — {formatDate(request.endDate)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B7280]">Duration</dt>
              <dd className="text-right font-semibold text-[#111827]">
                {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
              </dd>
            </div>
            {request.conflictCount > 0 ? (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[#6B7280]">Clashes</dt>
                <dd className="text-right font-semibold text-rose-600">
                  {request.conflictCount} overlapping
                </dd>
              </div>
            ) : null}
          </dl>

          {request.reason ? (
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Reason
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[#4B5563]">{request.reason}</p>
            </div>
          ) : null}

          {request.handoverNote ? (
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Handover
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[#4B5563]">
                {request.handoverNote}
              </p>
            </div>
          ) : null}
        </div>

        {/* Decision */}
        {!decided ? (
          <div className="mt-auto px-6 py-6">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]"
              htmlFor="leave-comment"
            >
              Comment
            </label>
            <textarea
              id="leave-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Required when declining."
              className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#2563EB]"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => decide("reject")}
                className="flex-1 rounded-md border border-rose-200 px-4 py-3 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => decide("approve")}
                className="flex-1 rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {busy ? "Saving…" : "Approve"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto px-6 py-6">
            <div className="rounded-[10px] bg-[#F8FAFC] p-3 text-[12px] leading-relaxed text-[#6B7280]">
              This request was already {statusLabel(LEAVE_STATUS_LABELS, request.status).toLowerCase()}.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
