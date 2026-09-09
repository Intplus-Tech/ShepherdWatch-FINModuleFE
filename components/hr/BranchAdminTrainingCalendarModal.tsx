"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { formatTime } from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import type { HrTraining } from "@/lib/hr/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * Month view of the training calendar. Events are passed in from the screen
 * that already loaded them rather than re-fetched here.
 */
export default function BranchAdminTrainingCalendarModal({
  open,
  onClose,
  trainings = [],
}: {
  open: boolean
  onClose: () => void
  trainings?: HrTraining[]
}) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  // A session can run across days, so it is stamped onto each day it covers.
  const eventsByDay = useMemo(() => {
    const map = new Map<number, HrTraining[]>()
    for (const training of trainings) {
      const start = new Date(training.startDate)
      const end = new Date(training.endDate || training.startDate)
      if (Number.isNaN(start.getTime())) continue

      for (let day = 1; day <= daysInMonth; day += 1) {
        const cursor = new Date(year, month - 1, day)
        if (cursor < new Date(start.toDateString())) continue
        if (cursor > new Date((Number.isNaN(end.getTime()) ? start : end).toDateString())) continue
        map.set(day, [...(map.get(day) ?? []), training])
      }
    }
    return map
  }, [trainings, daysInMonth, month, year])

  const step = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setMonth(next.getMonth() + 1)
    setYear(next.getFullYear())
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Training Calendar</h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="overflow-hidden rounded-[10px] border border-[#EEF1F6]">
          <div className="grid grid-cols-7 bg-[#EEF2FF]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, index) => (
              <div
                key={index}
                className="min-h-[84px] border-b border-r border-[#F3F4F6] p-1.5 last:border-r-0"
              >
                {day ? (
                  <>
                    <div
                      className={cn(
                        "mb-1 text-[11px] font-semibold",
                        day === today.getDate() &&
                          month === today.getMonth() + 1 &&
                          year === today.getFullYear()
                          ? "text-[#2563EB]"
                          : "text-[#6B7280]"
                      )}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {(eventsByDay.get(day) ?? []).slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          title={event.title}
                          className="truncate rounded bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#2563EB]"
                        >
                          {formatTime(event.startTime)} {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {trainings.length === 0 ? (
          <p className="mt-4 text-center text-[13px] text-[#9CA3AF]">
            No training events scheduled.
          </p>
        ) : null}
      </div>
    </ModalShell>
  )
}
