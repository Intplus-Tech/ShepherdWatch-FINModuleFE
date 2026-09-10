"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useReviewJobRequisition } from "@/components/hooks/hr/useHrJobRequisitions"
import {
  JOB_REQUISITION_PRIORITY_LABELS,
  branchName,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import type { JobRequisition } from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"

/**
 * The director's decision on a hiring requisition.
 *
 * `reviewComment` is required by the backend for both approve and reject, so
 * the dialog blocks submission until one is written.
 */
export default function ReviewRequisitionModal({
  requisition,
  intent,
  onClose,
}: {
  requisition: JobRequisition | null
  intent: "approved" | "rejected"
  onClose: () => void
}) {
  const review = useReviewJobRequisition()
  const [comment, setComment] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setComment("")
    setFormError(null)
    review.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requisition?._id, intent])

  async function handleSubmit() {
    if (!requisition) return
    setFormError(null)

    if (comment.trim().length < 2) {
      setFormError("A review comment is required.")
      return
    }

    try {
      await review.mutateAsync({
        id: requisition._id,
        action: intent,
        reviewComment: comment.trim(),
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const rejecting = intent === "rejected"
  const error = formError ?? (review.error ? hrErrorMessage(review.error) : null)

  return (
    <ModalShell open={requisition !== null} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            {rejecting ? "Reject Requisition" : "Approve Requisition"}
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {rejecting
              ? "Record why this role is not being approved."
              : "Confirm this hire and its salary commitment."}
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
        {requisition && (
          <div className="rounded-[10px] border border-[#EEF1F6] p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Role</span>
              <span className="font-semibold text-[#111827]">{requisition.roleTitle}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Reference</span>
              <span className="font-semibold text-[#111827]">#{requisition.refNumber}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Branch / Department</span>
              <span className="font-semibold text-[#111827]">
                {branchName(requisition.branchId)} · {requisition.department}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Suggested salary</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(requisition.salarySuggested, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Priority</span>
              <span className="font-semibold text-[#111827]">
                {lookup(JOB_REQUISITION_PRIORITY_LABELS, requisition.priority)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Expected start</span>
              <span className="font-semibold text-[#111827]">
                {formatDate(requisition.expectedStartDate, "medium")}
              </span>
            </div>
            {requisition.submittedBy && (
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Raised by</span>
                <span className="font-semibold text-[#111827]">
                  {userName(requisition.submittedBy)}
                </span>
              </div>
            )}
            <p className="mt-3 border-t border-[#F3F4F6] pt-3 text-[12px] leading-relaxed text-[#4B5563]">
              {requisition.justification}
            </p>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Review Comment (required)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={review.isPending}
            placeholder={
              rejecting
                ? "Explain the decision for the branch's record…"
                : "Note any conditions on this approval…"
            }
            className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"
          />
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={review.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={review.isPending}
          className={
            rejecting
              ? "inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
          }
        >
          {review.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {rejecting ? "Reject" : "Approve"}
        </button>
      </div>
    </ModalShell>
  )
}
