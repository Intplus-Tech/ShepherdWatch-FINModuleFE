"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useAttendanceMutations } from "@/components/hooks/useHrAttendance"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/hr/display"
import type { HrAttendanceLog } from "@/lib/hr/types"

/**
 * "Fix Now" on an attendance anomaly — a missing clock-out, an unexplained
 * absence. The note is mandatory: it is what the resolution is audited against.
 */
export default function ResolveAttendanceModal({
  log,
  onClose,
  onResolved,
}: {
  log: HrAttendanceLog | null
  onClose: () => void
  onResolved?: () => void
}) {
  const { resolveAnomaly } = useAttendanceMutations()
  const { pushToast } = useToast()
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setNote("")
    setError(null)
    onClose()
  }

  const handleResolve = async () => {
    if (!log) return
    if (!note.trim()) {
      setError("Explain how this record was resolved.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await resolveAnomaly(log.id, note.trim())
      pushToast("Attendance anomaly resolved", "success")
      setNote("")
      onResolved?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resolve this record.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={Boolean(log)} onClose={handleClose} className="max-w-md">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Resolve Attendance</h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {log?.employeeName || "Staff member"} · {formatDate(log?.date ?? "")}
            </p>
          </div>
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

      <div className="px-6 py-5">
        <label
          className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
          htmlFor="resolution-note"
        >
          Resolution Note *
        </label>
        <textarea
          id="resolution-note"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Staff was conducting the dawn prayer service; verified by the Head of Ushering."
          className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
        />
        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleResolve}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Resolving…" : "Mark Resolved"}
        </button>
      </div>
    </ModalShell>
  )
}
