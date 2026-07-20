"use client"

import { useState } from "react"
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
import { cn } from "@/lib/utils"

type LeaveRequest = {
  id: string
  name: string
  department: string
  initials: string
  avatarColor: string
  type: string
  dateRange: string
  duration: string
  conflict: boolean
}

const REQUESTS: LeaveRequest[] = [
  {
    id: "elizabeth-okoro",
    name: "Elizabeth Okoro",
    department: "Admin & Finance",
    initials: "EO",
    avatarColor: "bg-[#2563EB] text-white",
    type: "Vacation",
    dateRange: "Oct 25 — Oct 30, 2023",
    duration: "5 Business Days",
    conflict: false,
  },
  {
    id: "samuel-adeyemi",
    name: "Samuel Adeyemi",
    department: "Operations",
    initials: "SA",
    avatarColor: "bg-[#111827] text-white",
    type: "Sick Leave",
    dateRange: "Oct 18 — Oct 19, 2023",
    duration: "2 Business Days",
    conflict: true,
  },
  {
    id: "grace-mensah",
    name: "Grace Mensah",
    department: "Music & Worship",
    initials: "GM",
    avatarColor: "bg-emerald-600 text-white",
    type: "Casual",
    dateRange: "Nov 02 — Nov 02, 2023",
    duration: "1 Business Day",
    conflict: false,
  },
  {
    id: "david-chen",
    name: "David Chen",
    department: "Stewardship",
    initials: "DC",
    avatarColor: "bg-amber-500 text-white",
    type: "Vacation",
    dateRange: "Dec 15 — Dec 28, 2023",
    duration: "10 Business Days",
    conflict: false,
  },
]

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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Page() {
  const [calendarView, setCalendarView] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

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
              <CalendarView onBack={() => setCalendarView(false)} />
            ) : (
              <ListView
                onOpenModal={() => setModalOpen(true)}
              />
            )}
          </div>
        </div>
      </main>

      <BranchLeadLeaveApprovalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function ListView({ onOpenModal }: { onOpenModal: () => void }) {
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
            {REQUESTS.map((req) => (
              <tr
                key={req.id}
                onClick={onOpenModal}
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
                        {req.department}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                    <Plane className="h-3 w-3" />
                    {req.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-[13px]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111827]">
                      {req.dateRange}
                    </span>
                    <span className="text-[12px] text-[#6B7280]">
                      {req.duration}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px]">
                  {req.conflict ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      1 Conflict Detected
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
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md border border-rose-200 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenModal()
                      }}
                      className="rounded-md bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
                    >
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
        <span className="text-[12px] text-[#6B7280]">
          Showing 4 of 12 pending requests
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  )
}

function CalendarView({ onBack }: { onBack: () => void }) {
  // October 2024 starts on a Tuesday; 31 days.
  const firstWeekday = 2
  const daysInMonth = 31
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

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
            <h3 className="text-[16px] font-bold">October 2024</h3>
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
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2563EB] px-3.5 py-2.5 text-[12px] font-semibold text-white hover:bg-blue-700"
          >
            <CalendarDays className="h-4 w-4" />
            Record Leave on Behalf
          </button>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Upcoming Leave</h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                6 Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {UPCOMING.map((u) => (
                <div
                  key={u.name}
                  className="rounded-[10px] border border-[#EEF1F6] p-3"
                >
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
