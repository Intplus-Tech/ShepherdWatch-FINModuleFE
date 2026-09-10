"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { EmployeePicker } from "@/components/hr/EmployeePicker"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useRecordAbsence, useRecordAttendance } from "@/components/hooks/hr/useHrAttendance"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { ATTENDANCE_STATUS_LABELS } from "@/lib/hr/normalize"
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/hr/types"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
const fieldCls = `${inputCls} h-[42px]`

const ABSENCE_REASONS = ["Sick", "Personal", "Emergency", "Other"] as const

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Combine the picked day with a `HH:MM` input into an ISO timestamp. */
function timestamp(date: string, time: string): string | undefined {
  if (!time) return undefined
  const combined = new Date(`${date}T${time}`)
  return Number.isNaN(combined.getTime()) ? undefined : combined.toISOString()
}

export default function BranchAdminAttendanceModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const branchId = useBranchId()

  const [employeeId, setEmployeeId] = useState("")
  const [date, setDate] = useState(todayIso())
  const [status, setStatus] = useState<AttendanceStatus>("present")
  const [absenceReason, setAbsenceReason] = useState<string>("Sick")
  const [absenceDetail, setAbsenceDetail] = useState("")
  const [clockIn, setClockIn] = useState("")
  const [clockOut, setClockOut] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const recordAttendance = useRecordAttendance()
  const recordAbsence = useRecordAbsence()
  const pending = recordAttendance.isPending || recordAbsence.isPending

  // Start from a clean form each time the modal is opened.
  useEffect(() => {
    if (!open) return
    setEmployeeId("")
    setDate(todayIso())
    setStatus("present")
    setAbsenceReason("Sick")
    setAbsenceDetail("")
    setClockIn("")
    setClockOut("")
    setFormError(null)
    recordAttendance.reset()
    recordAbsence.reset()
    // Resetting only when `open` flips is deliberate; the mutations are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSave() {
    setFormError(null)

    if (!employeeId) {
      setFormError("Select an employee first.")
      return
    }
    if (!branchId) {
      setFormError("Your account has no branch assigned, so this can't be recorded.")
      return
    }

    try {
      if (status === "absent") {
        /**
         * Absences go to the dedicated endpoint, which requires a reason and
         * records who marked it — the generic endpoint doesn't enforce either.
         */
        const reason =
          absenceReason === "Other" ? absenceDetail.trim() : absenceReason
        if (!reason) {
          setFormError("Give a reason for the absence.")
          return
        }
        await recordAbsence.mutateAsync({ employeeId, branchId, date, reason })
      } else {
        await recordAttendance.mutateAsync({
          employeeId,
          branchId,
          date,
          status,
          isManualEntry: true,
          clockIn: timestamp(date, clockIn),
          clockOut: timestamp(date, clockOut),
        })
      }
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error =
    formError ??
    (recordAttendance.error || recordAbsence.error
      ? hrErrorMessage(recordAttendance.error ?? recordAbsence.error)
      : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
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
          onClick={onClose}
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
          <label className={labelCls}>Select Employee</label>
          <EmployeePicker value={employeeId} onChange={setEmployeeId} disabled={pending} />
        </div>

        {/* Date + Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>Attendance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className={fieldCls}
            >
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ATTENDANCE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional absence fields */}
        {status === "absent" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Reason for Absence *</label>
              <select
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                className={fieldCls}
              >
                {ABSENCE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {absenceReason === "Other" && (
              <div>
                <label className={labelCls}>Others *</label>
                <textarea
                  rows={3}
                  value={absenceDetail}
                  onChange={(e) => setAbsenceDetail(e.target.value)}
                  placeholder="Specify..."
                  className={inputCls + " py-2.5"}
                />
              </div>
            )}
          </div>
        )}

        {/* Time details */}
        {status !== "absent" && (
          <div>
            <label className={labelCls}>Time Details (Optional)</label>
            <div className="mt-1.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Clock In
                </label>
                <input
                  type="time"
                  value={clockIn}
                  onChange={(e) => setClockIn(e.target.value)}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Clock Out
                </label>
                <input
                  type="time"
                  value={clockOut}
                  onChange={(e) => setClockOut(e.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          SAVE Attendance
        </button>
      </div>
    </ModalShell>
  )
}
