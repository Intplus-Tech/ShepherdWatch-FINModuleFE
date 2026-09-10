"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Loader2, Search, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useEmployees } from "@/components/hooks/hr/useHrEmployees"
import { useEnrollParticipants, useTrainingEvent } from "@/components/hooks/hr/useHrTraining"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  employeeEmail,
  initials,
  lookup,
  refId,
  userName,
} from "@/lib/hr/normalize"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function BranchLeadRegisterStaffModal({
  open,
  onClose,
  trainingEventId,
}: {
  open: boolean
  onClose: () => void
  trainingEventId: string | null
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const debouncedFilter = useDebouncedValue(filter)

  const eventQuery = useTrainingEvent(open ? trainingEventId : null)
  const employees = useEmployees({
    limit: 50,
    search: debouncedFilter || undefined,
    employmentStatus: "all",
    enabled: open,
  })
  const enroll = useEnrollParticipants()

  useEffect(() => {
    if (!open) return
    setSelected({})
    setFilter("")
    setFormError(null)
    enroll.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trainingEventId])

  const event = eventQuery.data?.event

  /** Anyone already enrolled is shown as such rather than offered again. */
  const enrolledIds = useMemo(
    () => new Set((eventQuery.data?.participants ?? []).map((p) => refId(p.employeeId))),
    [eventQuery.data],
  )

  const visible = employees.data?.items ?? []
  const selectedCount = Object.values(selected).filter(Boolean).length

  function toggle(id: string) {
    setSelected((current) => ({ ...current, [id]: !current[id] }))
  }

  async function handleConfirm() {
    setFormError(null)

    const employeeIds = Object.entries(selected)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id)

    if (!trainingEventId) {
      setFormError("No training session selected.")
      return
    }
    if (employeeIds.length === 0) {
      setFormError("Select at least one staff member.")
      return
    }

    try {
      await enroll.mutateAsync({ id: trainingEventId, employeeIds })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (enroll.error ? hrErrorMessage(enroll.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <h2 className="text-[20px] font-bold text-[#111827]">Register Staff</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Active session */}
        {eventQuery.isLoading || eventQuery.error || !event ? (
          <HrPanelState
            isLoading={eventQuery.isLoading}
            error={eventQuery.error}
            isEmpty={!event}
            emptyTitle="No session selected"
            emptyDescription="Pick a training session to register staff for."
            onRetry={() => eventQuery.refetch()}
            className="p-6"
          />
        ) : (
          <div className="flex items-start gap-3 rounded-[12px] bg-[#EEF2FF] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Active Session
              </p>
              <p className="mt-0.5 text-[15px] font-bold text-[#111827]">{event.title}</p>
              <p className="mt-0.5 text-[12px] text-[#6B7280]">
                {formatDate(event.startDate, "medium")} · {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>
        )}

        {/* Select staff */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Select Staff Members
            </p>
            <span className="text-[11px] font-bold text-[#2563EB]">
              {selectedCount} Selected
            </span>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, role, or department..."
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="mt-3 overflow-hidden rounded-[12px] border border-[#EEF1F6]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-[#EEF2FF] px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Name
              </span>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Role
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Status
                </span>
              </div>
            </div>

            {employees.isLoading || employees.error || visible.length === 0 ? (
              <HrPanelState
                isLoading={employees.isLoading}
                error={employees.error}
                isEmpty={visible.length === 0}
                emptyTitle="No staff found"
                emptyDescription="Adjust the filter or add employees to this branch."
                onRetry={() => employees.refetch()}
                className="border-0 p-6"
              />
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {visible.map((staff) => {
                  const name = userName(staff.userId, staff.employeeId)
                  const alreadyEnrolled = enrolledIds.has(staff._id)
                  return (
                    <label
                      key={staff._id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3",
                        alreadyEnrolled
                          ? "cursor-default opacity-60"
                          : "cursor-pointer hover:bg-[#FAFBFF]",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={alreadyEnrolled || Boolean(selected[staff._id])}
                        disabled={alreadyEnrolled || enroll.isPending}
                        onChange={() => toggle(staff._id)}
                        className="h-4 w-4 shrink-0 rounded border-[#D1D5DB] accent-[#2563EB]"
                      />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#2563EB]">
                        {initials(name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#111827]">
                          {name}
                        </p>
                        <p className="truncate text-[11px] text-[#9CA3AF]">
                          {employeeEmail(staff) || `#${staff.employeeId}`}
                        </p>
                      </div>
                      <span className="w-[110px] shrink-0 text-[12px] text-[#6B7280]">
                        {staff.jobTitle}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold",
                          alreadyEnrolled
                            ? "bg-[#F3F4F6] text-[#4B5563]"
                            : badgeFor(EMPLOYMENT_STATUS_BADGES, staff.employmentStatus),
                        )}
                      >
                        {alreadyEnrolled
                          ? "Enrolled"
                          : lookup(EMPLOYMENT_STATUS_LABELS, staff.employmentStatus)}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={enroll.isPending}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={enroll.isPending || !trainingEventId}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {enroll.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Confirm Registration
        </button>
      </div>
    </ModalShell>
  )
}
