"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useResolveAttendanceAnomaly } from "@/components/hooks/hr/useHrAttendance"
import { clockTime, employeeName } from "@/lib/hr/normalize"
import type { AttendanceLog } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"

/**
 * Close out a flagged attendance log (a missing clock-out, usually).
 *
 * The backend requires a resolution note and records who resolved it, so the
 * fix leaves an audit trail rather than silently editing the row.
 */
export default function ResolveAttendanceModal({
  log,
  onClose,
}: {
  log: AttendanceLog | null
  onClose: () => void
}) {
  const resolve = useResolveAttendanceAnomaly()
  const [note, setNote] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setNote("")
    setFormError(null)
    resolve.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log?._id])

  async function handleSubmit() {
    if (!log) return
    setFormError(null)

    if (note.trim().length < 3) {
      setFormError("Enter a resolution note of at least three characters.")
      return
    }

    try {
      await resolve.mutateAsync({ id: log._id, resolutionNote: note.trim() })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (resolve.error ? hrErrorMessage(resolve.error) : null)

  return (
    <ModalShell open={log !== null} onClose={onClose} className="max-w-md">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Resolve Attendance</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Record why this entry is incomplete and how it was settled.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        {log && (
          <div className="rounded-[10px] border border-[#EEF1F6] p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Employee</span>
              <span className="font-semibold text-[#111827]">
                {employeeName(log.employeeId)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Date</span>
              <span className="font-semibold text-[#111827]">
                {formatDate(log.date, "medium")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Clock in / out</span>
              <span className="font-semibold text-[#111827]">
                {clockTime(log.clockIn)} – {log.clockOut ? clockTime(log.clockOut) : "missing"}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Resolution Note
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={resolve.isPending}
            placeholder="e.g. Staff confirmed departure at 5:15 PM; forgot to clock out."
            className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"
          />
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={resolve.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={resolve.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {resolve.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Resolve
        </button>
      </div>
    </ModalShell>
  )
}
