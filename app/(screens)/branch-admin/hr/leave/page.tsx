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
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminApplyLeaveModal from "@/components/hr/BranchAdminApplyLeaveModal"
import { cn } from "@/lib/utils"

type LeaveType = "Vacation" | "Sick Leave" | "Maternity" | "Casual"
type Status = "Approved" | "Pending" | "Declined"

type LeaveRequest = {
  id: string
  name: string
  role: string
  initials: string
  avatarColor: string
  type: LeaveType
  duration: string
  dates: string
  status: Status
}

const REQUESTS: LeaveRequest[] = [
  {
    id: "sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Senior Pastor",
    initials: "SJ",
    avatarColor: "bg-[#2563EB] text-white",
    type: "Vacation",
    duration: "14 Days",
    dates: "Dec 15 - Dec 29, 2023",
    status: "Approved",
  },
  {
    id: "james-wilson",
    name: "James Wilson",
    role: "Youth Coordinator",
    initials: "JW",
    avatarColor: "bg-[#111827] text-white",
    type: "Sick Leave",
    duration: "3 Days",
    dates: "Oct 24 - Oct 26, 2023",
    status: "Pending",
  },
  {
    id: "eleanor-vance",
    name: "Eleanor Vance",
    role: "Financial Secretary",
    initials: "EV",
    avatarColor: "bg-purple-600 text-white",
    type: "Maternity",
    duration: "90 Days",
    dates: "Nov 01 - Jan 30, 2024",
    status: "Declined",
  },
]

const TYPE_DOT: Record<LeaveType, string> = {
  Vacation: "bg-[#2563EB]",
  "Sick Leave": "bg-rose-500",
  Maternity: "bg-purple-500",
  Casual: "bg-amber-500",
}

const STATUS_PILL: Record<Status, string> = {
  Approved: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Declined: "bg-rose-50 text-rose-600",
}

const TABS = ["All", "Pending", "Approved", "Declined"] as const
type Tab = (typeof TABS)[number]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type CalendarChip = { label: string; tone: "vacation" | "sick" | "casual" }

const CALENDAR_CHIPS: Record<number, CalendarChip[]> = {
  1: [{ label: "Rev. Samuel (V)", tone: "vacation" }],
  2: [{ label: "Rev. Samuel (V)", tone: "vacation" }],
  3: [{ label: "Rev. Samuel (V)", tone: "vacation" }],
  4: [{ label: "Jane D. (S)", tone: "sick" }],
  8: [
    { label: "Mark A. (C)", tone: "casual" },
    { label: "Sarah W. (S)", tone: "sick" },
  ],
  9: [
    { label: "Mark A. (C)", tone: "casual" },
    { label: "Sarah W. (S)", tone: "sick" },
  ],
  16: [{ label: "David K. (V)", tone: "vacation" }],
}

const CHIP_TONES: Record<CalendarChip["tone"], string> = {
  vacation: "bg-[#EFF6FF] text-[#2563EB]",
  sick: "bg-rose-50 text-rose-600",
  casual: "bg-amber-50 text-amber-600",
}

type Upcoming = {
  name: string
  dept: string
  status: "PENDING" | "APPROVED"
  dates: string
  type: string
}

const UPCOMING: Upcoming[] = [
  {
    name: "Sarah Williams",
    dept: "IT Department",
    status: "PENDING",
    dates: "Oct 14 - Oct 20",
    type: "Sick Leave",
  },
  {
    name: "Peter Jenkins",
    dept: "Finance",
    status: "APPROVED",
    dates: "Nov 02 - Nov 05",
    type: "Vacation",
  },
  {
    name: "Grace Adesuwa",
    dept: "Hospitality",
    status: "PENDING",
    dates: "Oct 25 - Oct 25",
    type: "Casual",
  },
]

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calendarView, setCalendarView] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("All")
  const [typeFilter, setTypeFilter] = useState("")
  const [selected, setSelected] = useState<LeaveRequest | null>(null)

  const filtered = useMemo(() => {
    return REQUESTS.filter((r) => {
      const tabMatch = activeTab === "All" || r.status === activeTab
      const typeMatch =
        typeFilter.trim() === "" ||
        r.type.toLowerCase().includes(typeFilter.trim().toLowerCase())
      return tabMatch && typeMatch
    })
  }, [activeTab, typeFilter])

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
                        onClick={() => setActiveTab(tab)}
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
                      {filtered.map((req) => (
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
                                  {req.role}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span className="inline-flex items-center gap-2 text-[#111827]">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  TYPE_DOT[req.type]
                                )}
                              />
                              {req.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#111827]">
                                {req.duration}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                {req.dates}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                STATUS_PILL[req.status]
                              )}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]"
                          >
                            No leave requests match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
                  <span className="text-[12px] text-[#6B7280]">
                    Showing 1 to 3 of 124 requests
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Slide-over */}
      <LeaveBalanceDrawer request={selected} onClose={() => setSelected(null)} />

      <BranchAdminApplyLeaveModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
  // October 2024 starts on a Tuesday; 31 days.
  const firstWeekday = 2
  const daysInMonth = 31
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

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
              <h3 className="text-[16px] font-bold text-[#111827]">October 2024</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  Today
                </button>
                <button
                  type="button"
                  aria-label="Previous month"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

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
                          {(CALENDAR_CHIPS[day] ?? []).map((chip, i) => (
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
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                6 Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {UPCOMING.map((u) => (
                <div key={u.name} className="rounded-[10px] border border-[#EEF1F6] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#111827]">
                        {u.name}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {u.dept}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        u.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {u.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                    <span>{u.dates}</span>
                    <span className="font-semibold text-[#4B5563]">{u.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaveBalanceDrawer({
  request,
  onClose,
}: {
  request: LeaveRequest | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!request) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [request, onClose])

  if (!request) return null

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
          <button
            type="button"
            className="text-[12px] font-semibold text-[#2563EB] hover:underline"
          >
            History
          </button>
        </div>

        {/* Identity */}
        <div className="flex flex-col items-center px-6 pt-4 text-center">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-[18px] font-bold",
              request.avatarColor
            )}
          >
            {request.initials}
          </div>
          <div className="mt-3 text-[18px] font-bold text-[#111827]">
            {request.name}
          </div>
          <div className="text-[13px] text-[#6B7280]">Senior Branch Administrator</div>
        </div>

        {/* Leave Balance */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">Leave Balance</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              FY 2024
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[10px] border border-[#EEF1F6] bg-white p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Accrued
              </div>
              <div className="mt-1 text-[18px] font-bold text-[#111827]">20 Days</div>
            </div>
            <div className="rounded-[10px] border border-[#EEF1F6] bg-white p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Taken
              </div>
              <div className="mt-1 text-[18px] font-bold text-[#111827]">12 Days</div>
            </div>
            <div className="rounded-[10px] bg-[#111827] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Left
              </div>
              <div className="mt-1 text-[18px] font-bold text-white">08 Days</div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-2 rounded-full bg-[#F3F4F6]">
              <div
                className="h-2 rounded-full bg-[#2563EB]"
                style={{ width: "60%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>12 days taken</span>
              <span>20 days total allowance</span>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="px-6 pt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Category Breakdown
          </div>
          <div className="mt-4 space-y-4">
            <CategoryBar
              label="Vacation Leave"
              value="5 / 12 Days"
              pct={42}
              barClass="bg-[#2563EB]"
            />
            <CategoryBar
              label="Sick Leave"
              value="4 / 5 Days"
              pct={80}
              barClass="bg-amber-500"
            />
            <CategoryBar
              label="Maternity / Parental"
              value="3 / 3 Days"
              pct={100}
              barClass="bg-emerald-500"
            />
          </div>
        </div>

        {/* Info note */}
        <div className="px-6 pt-6">
          <div className="rounded-[10px] bg-[#EFF6FF] p-3 text-[12px] leading-relaxed text-[#2563EB]">
            Remaining days from the previous fiscal year (FY23) have been rolled over and
            included in the current &lsquo;Accrued&rsquo; total.
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white hover:bg-black"
          >
            Edit Allotment
          </button>
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
        <div className={cn("h-2 rounded-full", barClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
