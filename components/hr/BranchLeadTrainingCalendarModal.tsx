"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

type Chip = { time: string; title: string; tone: "emerald" | "rose" | "amber" | "blue" }

// October 2024 begins on a Tuesday (Sun=0 index → 2 leading blanks).
const LEADING_BLANKS = 2
const DAYS_IN_MONTH = 31
const TODAY = 9

const SESSIONS: Record<number, Chip[]> = {
  1: [{ time: "8:00AM", title: "Ethics & Cond.", tone: "emerald" }],
  3: [{ time: "2:00PM", title: "Liturgy Master.", tone: "rose" }],
  7: [{ time: "10:00AM", title: "Leadership Su.", tone: "amber" }],
  9: [
    { time: "11:30AM", title: "Data Protection", tone: "blue" },
    { time: "4:00PM", title: "Parish Admin", tone: "blue" },
  ],
  12: [{ time: "6:00AM", title: "Strategy Day", tone: "amber" }],
  15: [{ time: "1:00PM", title: "Safety Training", tone: "emerald" }],
  18: [{ time: "10:00AM", title: "Outreach Prep", tone: "blue" }],
  23: [{ time: "9:00AM", title: "Financial Stew", tone: "emerald" }],
}

const TONE: Record<Chip["tone"], string> = {
  emerald: "text-emerald-600",
  rose: "text-rose-600",
  amber: "text-amber-600",
  blue: "text-[#2563EB]",
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const selectCls =
  "rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#4B5563] outline-none focus:border-[#3B5BDB]"

export default function BranchLeadTrainingCalendarModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [view, setView] = useState<"Calendar" | "Agenda">("Calendar")

  const totalCells = LEADING_BLANKS + DAYS_IN_MONTH
  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
    ...Array.from({ length: (7 - (totalCells % 7)) % 7 }, () => null),
  ]

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <h2 className="text-[18px] font-bold text-[#111827]">Training Calendar</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Calendar / Agenda toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] p-1">
            {(["Calendar", "Agenda"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  view === option
                    ? "bg-white text-[#111827] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <select className={selectCls} defaultValue="All Categories">
            <option>All Categories</option>
          </select>
          <select className={selectCls} defaultValue="All Instructors">
            <option>All Instructors</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[110px] text-center text-[14px] font-bold text-[#111827]">
            October 2024
          </span>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      {/* Month grid */}
      <div className="max-h-[62vh] overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[12px] border border-[#EEF1F6] bg-[#EEF1F6]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-[#F9FAFB] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
            >
              {day}
            </div>
          ))}

          {cells.map((day, idx) => {
            const isToday = day === TODAY
            const chips = day ? SESSIONS[day] : undefined
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[84px] bg-white p-1.5",
                  !day && "bg-[#FAFBFF]",
                  isToday && "bg-[#EFF6FF]"
                )}
              >
                {day && (
                  <>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                        isToday
                          ? "bg-[#2563EB] text-white"
                          : "text-[#6B7280]"
                      )}
                    >
                      {day}
                    </span>
                    {chips && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {chips.map((chip) => (
                          <span
                            key={chip.title}
                            className={cn(
                              "truncate text-[10px] font-semibold leading-tight",
                              TONE[chip.tone]
                            )}
                          >
                            {chip.time} {chip.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </ModalShell>
  )
}
