"use client"

import { useMemo, useState } from "react"
import { X, Search, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useAttendanceMutations } from "@/components/hooks/useHrAttendance"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
const fieldCls = `${inputCls} h-[42px]`

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "half_day", label: "Half-Day" },
] as const

const ABSENCE_REASONS = ["Sick", "Personal", "Emergency", "Other"] as const

function todayIso(): string {
  return new Date().toISOString().split("T")[0]
}

/** Combines the picked date with a "HH:mm" input into an ISO timestamp. */
function toIsoDateTime(date: string, time: string): string | undefined {
  if (!date || !time) return undefined
  const composed = new Date(`${date}T${time}`)
  return Number.isNaN(composed.getTime()) ? undefined : composed.toISOString()
}

export default function BranchAdminAttendanceModal({
  open,
  onClose,
  onRecorded,
}: {
  open: boolean
  onClose: () => void
  onRecorded?: () => void
}) {
  const scope = useHrScope()
  const { pushToast } = useToast()
  const { recordAttendance, recordAbsence } = useAttendanceMutations()

  const [status, setStatus] = useState<string>("present")
  const [employeeId, setEmployeeId] = useState("")
  const [employeeQuery, setEmployeeQuery] = useState("")
  const [date, setDate] = useState(todayIso())
  const [clockIn, setClockIn] = useState("")
  const [clockOut, setClockOut] = useState("")
  const [absenceReason, setAbsenceReason] = useState("Sick")
  const [absenceNote, setAbsenceNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useDebouncedValue(employeeQuery, 300)
  const { employees, loading: employeesLoading } = useHrEmployees({ limit: 25, search })

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeId) ?? null,
    [employees, employeeId]
  )

  const reset = () => {
    setStatus("present")
    setEmployeeId("")
    setEmployeeQuery("")
    setDate(todayIso())
    setClockIn("")
    setClockOut("")
    setAbsenceReason("Sick")
    setAbsenceNote("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSave = async () => {
    setError(null)

    if (!employeeId) {
      setError("Pick the staff member this record belongs to.")
      return
    }

    const branchId = selectedEmployee?.branchId || scope.branchId || scope.ownBranchId
    if (!branchId) {
      setError("No branch is attached to this record, so it cannot be filed.")
      return
    }

    setSaving(true)
    try {
      if (status === "absent") {
        // Absences go to their own endpoint so they are categorised, not timed.
        const reason = absenceReason === "Other" ? absenceNote.trim() : absenceReason
        if (!reason) {
          setError("Give a reason for the absence.")
          setSaving(false)
          return
        }
        await recordAbsence({ employeeId, branchId, date, reason })
      } else {
        await recordAttendance({
          employeeId,
          branchId,
          date,
          status,
          clockIn: toIsoDateTime(date, clockIn),
          clockOut: toIsoDateTime(date, clockOut),
          isManualEntry: true,
          reason: absenceNote.trim() || undefined,
        })
      }

      pushToast("Attendance recorded", "success")
      reset()
      onRecorded?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record attendance.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Attendance</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Manually adjust or record staff attendance for compliance and payroll.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Select employee */}
        <div>
          <label className={labelCls} htmlFor="attendance-employee-search">
            Select Employee
          </label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="attendance-employee-search"
              type="text"
              value={employeeQuery}
              onChange={(event) => setEmployeeQuery(event.target.value)}
              placeholder="Search for a branch staff member..."
              className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="mt-2 max-h-[168px] overflow-y-auto rounded-[8px] border border-[#EEF1F6]">
            {employeesLoading ? (
              <p className="px-3.5 py-3 text-[12px] text-[#6B7280]">Loading staff…</p>
            ) : employees.length === 0 ? (
              <p className="px-3.5 py-3 text-[12px] text-[#9CA3AF]">No staff match that search.</p>
            ) : (
              employees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setEmployeeId(employee.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] hover:bg-[#F8FAFC]",
                    employee.id === employeeId && "bg-[#EEF2FF]"
                  )}
                >
                  <span className="font-medium text-[#111827]">
                    {employee.name || "Unnamed staff"}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    {employee.employeeCode || employee.jobTitle}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Date + Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="attendance-date-field">
              Select Date
            </label>
            <input
              id="attendance-date-field"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="attendance-status-field">
              Attendance Status
            </label>
            <select
              id="attendance-status-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={fieldCls}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional absence fields */}
        {status === "absent" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls} htmlFor="attendance-absence-reason">
                Reason for Absence *
              </label>
              <select
                id="attendance-absence-reason"
                className={fieldCls}
                value={absenceReason}
                onChange={(event) => setAbsenceReason(event.target.value)}
              >
                {ABSENCE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {absenceReason === "Other" ? (
              <div>
                <label className={labelCls} htmlFor="attendance-absence-note">
                  Others *
                </label>
                <textarea
                  id="attendance-absence-note"
                  rows={3}
                  value={absenceNote}
                  onChange={(event) => setAbsenceNote(event.target.value)}
                  placeholder="Specify..."
                  className={inputCls + " py-2.5"}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Time details */}
        {status !== "absent" ? (
          <div>
            <label className={labelCls}>Time Details (Optional)</label>
            <div className="mt-1.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
                  htmlFor="attendance-clock-in"
                >
                  Clock In
                </label>
                <input
                  id="attendance-clock-in"
                  type="time"
                  value={clockIn}
                  onChange={(event) => setClockIn(event.target.value)}
                  className={fieldCls}
                />
              </div>
              <div>
                <label
                  className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
                  htmlFor="attendance-clock-out"
                >
                  Clock Out
                </label>
                <input
                  id="attendance-clock-out"
                  type="time"
                  value={clockOut}
                  onChange={(event) => setClockOut(event.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "SAVING…" : "SAVE Attendance"}
        </button>
      </div>
    </ModalShell>
  )
}
