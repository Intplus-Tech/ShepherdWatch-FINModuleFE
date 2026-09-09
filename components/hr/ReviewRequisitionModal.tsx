"use client"

import { useState } from "react"
import { Briefcase, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useJobRequisitionMutations } from "@/components/hooks/useHrJobRequisitions"
import { useToast } from "@/components/ui/toast"
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  REQUISITION_STATUS_LABELS,
  REQUISITION_STATUS_STYLES,
  formatDate,
  formatNaira,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import type { HrJobRequisition } from "@/lib/hr/types"

/**
 * Director review of a job requisition. The API requires a comment on both
 * outcomes, so approving without one is blocked here rather than at the server.
 */
export default function ReviewRequisitionModal({
  requisition,
  onClose,
  onReviewed,
  readOnly = false,
}: {
  requisition: HrJobRequisition | null
  onClose: () => void
  onReviewed?: () => void
  readOnly?: boolean
}) {
  const { reviewRequisition } = useJobRequisitionMutations()
  const { pushToast } = useToast()
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState<"approved" | "rejected" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setComment("")
    setError(null)
    onClose()
  }

  const decide = async (action: "approved" | "rejected") => {
    if (!requisition) return
    if (!comment.trim()) {
      setError("Add a review comment — the approval record needs one.")
      return
    }

    setSaving(action)
    setError(null)
    try {
      await reviewRequisition(requisition.id, action, comment.trim())
      pushToast(
        action === "approved" ? "Requisition approved" : "Requisition rejected",
        "success"
      )
      setComment("")
      onReviewed?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record that decision.")
    } finally {
      setSaving(null)
    }
  }

  const decided = requisition ? requisition.status !== "pending_review" : false

  return (
    <ModalShell open={Boolean(requisition)} onClose={handleClose} className="max-w-xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
            <Briefcase className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">
              {requisition?.roleTitle || "Job Requisition"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {requisition?.requisitionNumber || "—"} ·{" "}
              {requisition?.branchName || "Unassigned branch"}
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

      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              statusStyle(REQUISITION_STATUS_STYLES, requisition?.status ?? "")
            )}
          >
            {statusLabel(REQUISITION_STATUS_LABELS, requisition?.status ?? "")}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              statusStyle(PRIORITY_STYLES, requisition?.priority ?? "")
            )}
          >
            {statusLabel(PRIORITY_LABELS, requisition?.priority ?? "")} priority
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#EEF1F6] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Department
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
              {requisition?.department || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Suggested Salary
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
              {formatNaira(requisition?.salarySuggested ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Expected Start
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
              {formatDate(requisition?.expectedStartDate ?? "")}
            </div>
          </div>
        </div>

        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Justification
        </div>
        <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
          {requisition?.justification || "No justification was recorded."}
        </blockquote>

        {requisition?.reviewComment ? (
          <div className="mt-4 rounded-lg bg-[#F8FAFC] p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Review Comment
            </div>
            <p className="mt-1 text-[13px] text-[#4B5563]">{requisition.reviewComment}</p>
          </div>
        ) : null}

        {!readOnly && !decided ? (
          <>
            <label
              className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]"
              htmlFor="requisition-review-comment"
            >
              Review Comment *
            </label>
            <textarea
              id="requisition-review-comment"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="e.g. Approved. Position budgeted under the 2026 personnel plan."
              className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </>
        ) : null}

        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        {readOnly || decided ? (
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
          >
            Close
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => decide("rejected")}
              disabled={Boolean(saving)}
              className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              {saving === "rejected" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Reject
            </button>
            <button
              type="button"
              onClick={() => decide("approved")}
              disabled={Boolean(saving)}
              className="inline-flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving === "approved" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Approve
            </button>
          </>
        )}
      </div>
    </ModalShell>
  )
}
