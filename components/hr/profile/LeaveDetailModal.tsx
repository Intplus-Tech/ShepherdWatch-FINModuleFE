"use client"

import { useState } from "react"
import { X, CalendarDays, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, StatusBadge, btnDark, btnOutline } from "./shared"
import { useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useToast } from "@/components/ui/toast"
import { LEAVE_STATUS_LABELS, formatDate, statusLabel } from "@/lib/hr/display"
import type { HrLeave } from "@/lib/hr/types"

export default function LeaveDetailModal({
  open,
  onClose,
  leave,
  onDecided,
}: {
  open: boolean
  onClose: () => void
  leave: HrLeave | null
  onDecided?: () => void
}) {
  const { approveLeave, rejectLeave } = useLeaveMutations()
  const { pushToast } = useToast()
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = String(leave?.status ?? "").startsWith("pending")

  const handleClose = () => {
    if (busy) return
    setComment("")
    setError(null)
    onClose()
  }

  const decide = async (action: "approve" | "decline") => {
    if (!leave) return
    if (action === "decline" && !comment.trim()) {
      setError("Give a reason for declining.")
      return
    }

    setBusy(action)
    setError(null)
    try {
      if (action === "approve") {
        await approveLeave(leave.id, comment.trim() || undefined)
        pushToast("Leave approved", "success")
      } else {
        await rejectLeave(leave.id, comment.trim())
        pushToast("Leave declined", "success")
      }
      setComment("")
      onDecided?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record that decision.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">
              {leave?.leaveTypeName || "Leave Request"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {leave?.employeeName || "Staff member"}
            </p>
          </div>
        </div>
        <button
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <StatusBadge status={statusLabel(LEAVE_STATUS_LABELS, leave?.status ?? "")} />
          {leave?.conflictCount ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              {leave.conflictCount} overlapping request{leave.conflictCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              No overlaps
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <SectionLabel>From</SectionLabel>
            <p className="mt-1 text-[13px] font-semibold text-[#111827]">
              {formatDate(leave?.startDate ?? "")}
            </p>
          </div>
          <div>
            <SectionLabel>To</SectionLabel>
            <p className="mt-1 text-[13px] font-semibold text-[#111827]">
              {formatDate(leave?.endDate ?? "")}
            </p>
          </div>
          <div>
            <SectionLabel>Duration</SectionLabel>
            <p className="mt-1 text-[13px] font-semibold text-[#111827]">
              {leave?.totalDays ?? 0} day{leave?.totalDays === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <SectionLabel>Reason</SectionLabel>
          <blockquote className="mt-2 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
            {leave?.reason || "No reason was recorded."}
          </blockquote>
        </div>

        {leave?.handoverNote ? (
          <div className="mt-4">
            <SectionLabel>Handover</SectionLabel>
            <p className="mt-1 text-[13px] text-[#4B5563]">{leave.handoverNote}</p>
          </div>
        ) : null}

        {pending ? (
          <div className="mt-5">
            <label
              className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
              htmlFor="leave-detail-comment"
            >
              Decision Note
            </label>
            <textarea
              id="leave-detail-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional when approving, required when declining."
              className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#3B5BDB]"
            />
          </div>
        ) : null}

        {error ? <p className="mt-3 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        {pending ? (
          <>
            <button
              type="button"
              onClick={() => decide("decline")}
              disabled={Boolean(busy)}
              className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              {busy === "decline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Decline
            </button>
            <button className={btnDark} onClick={() => decide("approve")} disabled={Boolean(busy)}>
              {busy === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Approve Leave
            </button>
          </>
        ) : (
          <button className={btnOutline} onClick={handleClose}>
            Close
          </button>
        )}
      </div>
    </ModalShell>
  )
}
