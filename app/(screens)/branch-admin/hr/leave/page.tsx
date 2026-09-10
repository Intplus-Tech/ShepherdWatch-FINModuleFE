"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminApplyLeaveModal from "@/components/hr/BranchAdminApplyLeaveModal"
import { HrPanelState, HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useApproveLeave,
  useLeaveBalances,
  useLeaveCalendar,
  useLeaveMetrics,
  useLeaveRequests,
  useRejectLeave,
} from "@/components/hooks/hr/useHrLeave"
import {
  LEAVE_STATUS_BADGES,
  LEAVE_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  isLeavePending,
  lookup,
} from "@/lib/hr/normalize"
import type { LeaveRequest, LeaveStatus } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Tab label -> the backend statuses it covers. */
const TABS: { label: string; statuses: LeaveStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Pending", statuses: ["pending_supervisor", "pending_hr"] },
  { label: "Approved", statuses: ["approved"] },
  { label: "Declined", statuses: ["declined"] },
]

/** Stable colour per leave type code so the dot and calendar chip agree. */
const TYPE_TONES = [
  { dot: "bg-[#2563EB]", chip: "bg-[#EFF6FF] text-[#2563EB]" },
  { dot: "bg-rose-500", chip: "bg-rose-50 text-rose-600" },
  { dot: "bg-purple-500", chip: "bg-purple-50 text-purple-600" },
  { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-600" },
  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
]

function toneFor(code: string) {
  let hash = 0
  for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) % 997
  return TYPE_TONES[hash % TYPE_TONES.length]
}

function leaveTypeName(request: LeaveRequest): string {
  return deref(request.leaveTypeId)?.name ?? "Leave"
}

function leaveTypeCode(request: LeaveRequest): string {
  const type = deref(request.leaveTypeId)
  return type?.code ?? type?.name ?? "GEN"
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calendarView, setCalendarView] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("All")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<LeaveRequest | null>(null)

  const tab = TABS.find((t) => t.label === activeTab) ?? TABS[0]

  /**
   * "Pending" spans two backend statuses, so it is fetched unfiltered and
   * narrowed here; the single-status tabs filter server-side.
   */
  const serverStatus = tab.statuses?.length === 1 ? tab.statuses[0] : "all"

  const leaves = useLeaveRequests({ page, limit: PAGE_SIZE, status: serverStatus })
  const metrics = useLeaveMetrics()

  const rows = useMemo(() => {
    const items = leaves.data?.items ?? []
    const byTab =
      tab.statuses && tab.statuses.length > 1
        ? items.filter((item) => tab.statuses?.includes(item.status))
        : items

    const q = typeFilter.trim().toLowerCase()
    if (!q) return byTab
    return byTab.filter((item) => leaveTypeName(item).toLowerCase().includes(q))
  }, [leaves.data, tab, typeFilter])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/leave"
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
                    : "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50",
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
              pendingCount={metrics.data?.pending ?? 0}
            />
          ) : (
            <>
              {/* Toolbar */}
              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
                    {TABS.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => {
                          setActiveTab(t.label)
                          setPage(1)
                        }}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                          activeTab === t.label
                            ? "bg-[#111827] text-white"
                            : "text-[#6B7280] hover:text-[#111827]",
                        )}
                      >
                        {t.label}
                        {t.label === "Pending" && (metrics.data?.pending ?? 0) > 0
                          ? ` (${metrics.data?.pending})`
                          : ""}
                      </button>
                    ))}
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
                        {["Employee", "Leave Type", "Duration & Dates", "Status"].map((h) => (
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
                        isLoading={leaves.isLoading}
                        error={leaves.error}
                        isEmpty={rows.length === 0}
                        emptyTitle="No leave requests"
                        emptyDescription="Requests appear here once staff apply for time off."
                        onRetry={() => leaves.refetch()}
                      />

                      {!leaves.isLoading &&
                        !leaves.error &&
                        rows.map((req) => {
                          const name = employeeName(req.employeeId)
                          const employee = deref(req.employeeId)
                          return (
                            <tr
                              key={req._id}
                              onClick={() => setSelected(req)}
                              className="cursor-pointer hover:bg-[#FAFBFF]"
                            >
                              <td className="px-4 py-4 text-[13px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[12px] font-bold text-white">
                                    {initials(name)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[#111827]">{name}</span>
                                    <span className="text-[12px] text-[#6B7280]">
                                      {employee?.jobTitle ?? "—"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <span className="inline-flex items-center gap-2 text-[#111827]">
                                  <span
                                    className={cn(
                                      "h-2.5 w-2.5 rounded-full",
                                      toneFor(leaveTypeCode(req)).dot,
                                    )}
                                  />
                                  {leaveTypeName(req)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#111827]">
                                    {req.totalDays} {req.totalDays === 1 ? "Day" : "Days"}
                                  </span>
                                  <span className="text-[12px] text-[#6B7280]">
                                    {formatDate(req.startDate, "medium")} –{" "}
                                    {formatDate(req.endDate, "medium")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                    badgeFor(LEAVE_STATUS_BADGES, req.status),
                                  )}
                                >
                                  {lookup(LEAVE_STATUS_LABELS, req.status)}
                                </span>
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
                  noun="requests"
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Slide-over */}
      <LeaveDetailDrawer request={selected} onClose={() => setSelected(null)} />

      <BranchAdminApplyLeaveModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function CalendarView({
  onBack,
  onOpenModal,
  pendingCount,
}: {
  onBack: () => void
  onOpenModal: () => void
  pendingCount: number
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const calendar = useLeaveCalendar({ month: cursor.month, year: cursor.year })

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  })

  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  /** Spread each approved request across every day it covers in this month. */
  const chipsByDay = useMemo(() => {
    const map = new Map<number, { label: string; chip: string }[]>()
    for (const request of calendar.data ?? []) {
      const start = new Date(request.startDate)
      const end = new Date(request.endDate)
      const code = leaveTypeCode(request)
      const label = `${employeeName(request.employeeId).split(" ")[0]} (${code
        .slice(0, 1)
        .toUpperCase()})`
      const tone = toneFor(code).chip

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(cursor.year, cursor.month, day)
        if (date >= startOfDay(start) && date <= startOfDay(end)) {
          const list = map.get(day) ?? []
          list.push({ label, chip: tone })
          map.set(day, list)
        }
      }
    }
    return map
  }, [calendar.data, cursor, daysInMonth])

  const upcoming = useMemo(() => {
    const now = startOfDay(new Date())
    return (calendar.data ?? [])
      .filter((request) => new Date(request.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }, [calendar.data])

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  return (
    <div className="mt-6">
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
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[16px] font-bold text-[#111827]">
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
                                  chip.chip,
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
              {pendingCount > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  {pendingCount} Pending
                </span>
              )}
            </div>

            {calendar.isLoading || upcoming.length === 0 ? (
              <HrPanelState
                isLoading={calendar.isLoading}
                error={null}
                isEmpty={upcoming.length === 0}
                emptyTitle="Nothing scheduled"
                emptyDescription="Approved leave for this month will show here."
                className="mt-4 border-0 p-4"
              />
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map((request) => {
                  const employee = deref(request.employeeId)
                  return (
                    <div
                      key={request._id}
                      className="rounded-[10px] border border-[#EEF1F6] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#111827]">
                            {employeeName(request.employeeId)}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                            {employee?.department ?? employee?.jobTitle ?? "—"}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                            badgeFor(LEAVE_STATUS_BADGES, request.status),
                          )}
                        >
                          {lookup(LEAVE_STATUS_LABELS, request.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                        <span>
                          {formatDate(request.startDate, "short")} –{" "}
                          {formatDate(request.endDate, "short")}
                        </span>
                        <span className="font-semibold text-[#4B5563]">
                          {leaveTypeName(request)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function LeaveDetailDrawer({
  request,
  onClose,
}: {
  request: LeaveRequest | null
  onClose: () => void
}) {
  const employee = deref(request?.employeeId)
  const balances = useLeaveBalances(employee?._id)
  const approve = useApproveLeave()
  const reject = useRejectLeave()

  const [comment, setComment] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  /** Clear the decision form whenever a different request is opened. */
  const [formFor, setFormFor] = useState<string | null>(null)
  if (request && formFor !== request._id) {
    setFormFor(request._id)
    setComment("")
    setActionError(null)
  }

  useEffect(() => {
    if (!request) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [request, onClose])

  if (!request) return null

  const name = employeeName(request.employeeId)
  const rows = balances.data?.balances ?? []
  const totals = rows.reduce(
    (acc, row) => ({
      entitlement: acc.entitlement + row.entitlement,
      used: acc.used + row.used,
      remaining: acc.remaining + row.remaining,
    }),
    { entitlement: 0, used: 0, remaining: 0 },
  )
  const usedPct =
    totals.entitlement > 0 ? Math.round((totals.used / totals.entitlement) * 100) : 0

  const pending = approve.isPending || reject.isPending

  async function decide(kind: "approve" | "reject") {
    if (!request) return
    setActionError(null)

    if (kind === "reject" && comment.trim().length < 2) {
      setActionError("A reason is required to decline a request.")
      return
    }

    try {
      const mutation = kind === "approve" ? approve : reject
      await mutation.mutateAsync({ id: request._id, comment: comment.trim() || undefined })
      onClose()
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col overflow-y-auto bg-white shadow-2xl">
        {/* Top */}
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
              badgeFor(LEAVE_STATUS_BADGES, request.status),
            )}
          >
            {lookup(LEAVE_STATUS_LABELS, request.status)}
          </span>
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center px-6 pt-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-[18px] font-bold text-white">
            {initials(name)}
          </div>
          <div className="mt-3 text-[18px] font-bold text-[#111827]">{name}</div>
          <div className="text-[13px] text-[#6B7280]">{employee?.jobTitle ?? "—"}</div>
        </div>

        {/* Request summary */}
        <div className="px-6 pt-6">
          <div className="rounded-[10px] border border-[#EEF1F6] p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Type</span>
              <span className="font-semibold text-[#111827]">{leaveTypeName(request)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Duration</span>
              <span className="font-semibold text-[#111827]">
                {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Dates</span>
              <span className="font-semibold text-[#111827]">
                {formatDate(request.startDate, "short")} – {formatDate(request.endDate, "short")}
              </span>
            </div>
            {request.conflictCount ? (
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Overlaps</span>
                <span className="font-semibold text-amber-600">
                  {request.conflictCount} other request{request.conflictCount === 1 ? "" : "s"}
                </span>
              </div>
            ) : null}
            {request.reason ? (
              <p className="mt-3 border-t border-[#F3F4F6] pt-3 text-[12px] leading-relaxed text-[#4B5563]">
                {request.reason}
              </p>
            ) : null}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">Leave Balance</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              FY {balances.data?.year ?? new Date().getFullYear()}
            </span>
          </div>

          {balances.isLoading || balances.error || rows.length === 0 ? (
            <HrPanelState
              isLoading={balances.isLoading}
              error={balances.error}
              isEmpty={rows.length === 0}
              emptyTitle="No leave types configured"
              emptyDescription="Set up leave types to track entitlements."
              onRetry={() => balances.refetch()}
              className="mt-4 border-0 p-4"
            />
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-[10px] border border-[#EEF1F6] bg-white p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Accrued
                  </div>
                  <div className="mt-1 text-[18px] font-bold text-[#111827]">
                    {totals.entitlement}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[#EEF1F6] bg-white p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Taken
                  </div>
                  <div className="mt-1 text-[18px] font-bold text-[#111827]">{totals.used}</div>
                </div>
                <div className="rounded-[10px] bg-[#111827] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Left
                  </div>
                  <div className="mt-1 text-[18px] font-bold text-white">{totals.remaining}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-2 rounded-full bg-[#2563EB]"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>{totals.used} days taken</span>
                  <span>{totals.entitlement} days total allowance</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Category Breakdown
                </div>
                <div className="mt-4 space-y-4">
                  {rows.map((row) => (
                    <CategoryBar
                      key={row.leaveTypeId}
                      label={row.name}
                      value={`${row.used} / ${row.entitlement} Days`}
                      pct={row.entitlement > 0 ? (row.used / row.entitlement) * 100 : 0}
                      barClass={toneFor(row.code).dot}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Decision */}
        <div className="mt-auto px-6 py-6">
          {isLeavePending(request) ? (
            <>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Comment
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Required when declining…"
                className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563EB]"
              />
              {actionError && (
                <p className="mt-2 text-[12px] font-medium text-red-600">{actionError}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decide("reject")}
                  disabled={pending}
                  className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => decide("approve")}
                  disabled={pending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
                >
                  {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Approve
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white hover:bg-black"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryBar({
  label,
  value,
  pct,
  barClass,
}: {
  label: string
  value: string
  pct: number
  barClass: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#111827]">{label}</span>
        <span className="text-[12px] font-semibold text-[#6B7280]">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
        <div
          className={cn("h-2 rounded-full", barClass)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}
