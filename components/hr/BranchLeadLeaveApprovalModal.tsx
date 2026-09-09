"use client"

import { useState } from "react"
import { X, CheckCircle2, Info, AlertTriangle, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useToast } from "@/components/ui/toast"
import {
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_STYLES,
  formatDate,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import type { HrLeave } from "@/lib/hr/types"

/**
 * The pastor's decision on a leave request. Declining needs a comment (the API
 * requires one); approving may carry an optional note.
 */
export default function BranchLeadLeaveApprovalModal({
  open,
  onClose,
  request,
  onDecided,
}: {
  open: boolean
  onClose: () => void
  request: HrLeave | null
  onDecided?: () => void
}) {
  const { approveLeave, rejectLeave } = useLeaveMutations()
  const { pushToast } = useToast()
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState<"approve" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setComment("")
    setError(null)
    onClose()
  }

  const decide = async (action: "approve" | "decline") => {
    if (!request) return
    if (action === "decline" && !comment.trim()) {
      setError("Give a reason for declining.")
      return
    }

    setSaving(action)
    setError(null)
    try {
      if (action === "approve") {
        await approveLeave(request.id, comment.trim() || undefined)
        pushToast(`Leave approved for ${request.employeeName}`, "success")
      } else {
        await rejectLeave(request.id, comment.trim())
        pushToast(`Leave declined for ${request.employeeName}`, "success")
      }
      setComment("")
      onDecided?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record that decision.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Leave Final Approval</h2>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Approval Authorization
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-5">
        {/* LEFT — identity + request */}
        <div className="lg:col-span-3">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[16px] font-bold text-white">
                {initials(request?.employeeName ?? "")}
              </div>
              <div className="min-w-0">
                <div className="text-[16px] font-bold text-[#111827]">
                  {request?.employeeName || "Staff member"}
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  {request?.jobTitle || "—"}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  {request?.employeeCode ? `Staff ID ${request.employeeCode}` : "—"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
                    {request?.leaveTypeName || "LEAVE"}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-semibold",
                      statusStyle(LEAVE_STATUS_STYLES, request?.status ?? "")
                    )}
                  >
                    {statusLabel(LEAVE_STATUS_LABELS, request?.status ?? "")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  From
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  {formatDate(request?.startDate ?? "")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  To
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  {formatDate(request?.endDate ?? "")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Duration
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  {request?.totalDays ?? 0} day{request?.totalDays === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Reason
              </div>
              <blockquote className="mt-2 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
                {request?.reason || "No reason was recorded."}
              </blockquote>
            </div>

            {request?.handoverNote ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EEF2FF] p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5BDB]" />
                <p className="text-[12px] text-[#4B5563]">{request.handoverNote}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT — conflicts + decision note */}
        <div className="lg:col-span-2">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Cover Check
            </div>
            {request?.conflictCount ? (
              <div className="mt-3 flex items-start gap-2 text-[13px] font-semibold text-amber-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {request.conflictCount} overlapping request
                {request.conflictCount === 1 ? "" : "s"} in the same period
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-2 text-[13px] font-semibold text-emerald-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                No overlapping leave requests
              </div>
            )}

            <label
              className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]"
              htmlFor="leave-decision-comment"
            >
              Decision Note
            </label>
            <textarea
              id="leave-decision-comment"
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional when approving, required when declining."
              className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />

            {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={() => decide("decline")}
          disabled={Boolean(saving) || !request}
          className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
        >
          {saving === "decline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Decline Request
        </button>
        <button
          type="button"
          onClick={() => decide("approve")}
          disabled={Boolean(saving) || !request}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Approve Leave Request
        </button>
      </div>
    </ModalShell>
  )
}
