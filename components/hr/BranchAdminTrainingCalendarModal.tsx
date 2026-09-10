"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { HrPanelState } from "@/components/hr/HrDataState"
import { useTrainingEvents } from "@/components/hooks/hr/useHrTraining"
import { branchName } from "@/lib/hr/normalize"
import type { TrainingEvent } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const selectCls =
  "rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"

/** Stable chip colour per event so a session looks the same on every day it spans. */
const TONES = [
  "bg-emerald-50 text-emerald-700",
  "bg-[#EEF2FF] text-[#2563EB]",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
]

function toneFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997
  return TONES[hash % TONES.length]
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default function BranchAdminTrainingCalendarModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [view, setView] = useState<"Calendar" | "Agenda">("Calendar")
  const [instructor, setInstructor] = useState("All Instructors")
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  /**
   * The list endpoint has no date-range filter, so a generous page is fetched
   * and the month grid is built client-side.
   */
  const events = useTrainingEvents({ limit: 100, enabled: open })

  const instructors = useMemo(
    () => [
      "All Instructors",
      ...Array.from(new Set((events.data?.items ?? []).map((e) => e.trainerName))),
    ],
    [events.data],
  )

  const filtered = useMemo(
    () =>
      (events.data?.items ?? []).filter(
        (event) => instructor === "All Instructors" || event.trainerName === instructor,
      ),
    [events.data, instructor],
  )

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const leadingBlanks = new Date(cursor.year, cursor.month, 1).getDay()
  const totalCells = leadingBlanks + daysInMonth
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array.from({ length: (7 - (totalCells % 7)) % 7 }, () => null),
  ]

  const byDay = useMemo(() => {
    const map = new Map<number, TrainingEvent[]>()
    for (const event of filtered) {
      const start = startOfDay(new Date(event.startDate))
      const end = startOfDay(new Date(event.endDate))
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(cursor.year, cursor.month, day)
        if (date >= start && date <= end) {
          const list = map.get(day) ?? []
          list.push(event)
          map.set(day, list)
        }
      }
    }
    return map
  }, [filtered, cursor, daysInMonth])

  const agenda = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [filtered],
  )

  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === cursor.year && today.getMonth() === cursor.month

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  })

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#111827]">
          Training Calendar
          {events.isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9CA3AF]" />}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
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
                    : "text-[#6B7280] hover:text-[#111827]",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <select
            className={selectCls}
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          >
            {instructors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {view === "Calendar" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[110px] text-center text-[14px] font-bold text-[#111827]">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCursor({ year: today.getFullYear(), month: today.getMonth() })
              }
              className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
            >
              Today
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[62vh] overflow-y-auto px-6 py-5">
        {events.isLoading || events.error ? (
          <HrPanelState
            isLoading={events.isLoading}
            error={events.error}
            onRetry={() => events.refetch()}
          />
        ) : view === "Agenda" ? (
          agenda.length === 0 ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No training scheduled"
              emptyDescription="Create a training event to populate the calendar."
            />
          ) : (
            <ul className="divide-y divide-[#F3F4F6] overflow-hidden rounded-[12px] border border-[#EEF1F6]">
              {agenda.map((event) => (
                <li key={event._id} className="flex items-center gap-4 px-4 py-3">
                  <span
                    className={cn(
                      "shrink-0 rounded px-2 py-1 text-[10px] font-bold",
                      toneFor(event._id),
                    )}
                  >
                    {formatDate(event.startDate, "short")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#111827]">
                      {event.title}
                    </p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">
                      {event.startTime} – {event.endTime} · {event.trainerName} ·{" "}
                      {event.isGlobal ? "All branches" : branchName(event.branchId)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[12px] border border-[#EEF1F6] bg-[#EEF1F6]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-[#F9FAFB] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
              >
                {day}
              </div>
            ))}

            {cells.map((day, idx) => {
              const isToday = isCurrentMonth && day === today.getDate()
              const chips = day ? byDay.get(day) : undefined
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[84px] bg-white p-1.5",
                    !day && "bg-[#FAFBFF]",
                    isToday && "bg-[#EFF6FF]",
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                          isToday ? "bg-[#2563EB] text-white" : "text-[#6B7280]",
                        )}
                      >
                        {day}
                      </span>
                      {chips && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {chips.slice(0, 3).map((event) => (
                            <span
                              key={event._id}
                              title={event.title}
                              className={cn(
                                "truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight",
                                toneFor(event._id),
                              )}
                            >
                              {event.startTime} {event.title}
                            </span>
                          ))}
                          {chips.length > 3 && (
                            <span className="px-1.5 text-[10px] font-semibold text-[#9CA3AF]">
                              +{chips.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModalShell>
  )
}
