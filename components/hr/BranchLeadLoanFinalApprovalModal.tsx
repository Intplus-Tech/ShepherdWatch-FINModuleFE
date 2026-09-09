"use client"

import { useState } from "react"
import { X, CheckCircle2, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import { formatDate, formatNaira, initials } from "@/lib/hr/display"
import type { HrLoan } from "@/lib/hr/types"

/**
 * The pastor's authorization step. Approving disburses the loan; declining
 * closes it. Both carry the comment as the record of the decision.
 */
export default function BranchLeadLoanFinalApprovalModal({
  open,
  onClose,
  request,
  onDecided,
}: {
  open: boolean
  onClose: () => void
  request: HrLoan | null
  onDecided?: () => void
}) {
  const { pastorApproval } = useLoanMutations()
  const { pushToast } = useToast()
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState<"approved" | "declined" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setComment("")
    setError(null)
    onClose()
  }

  const decide = async (action: "approved" | "declined") => {
    if (!request) return
    if (action === "declined" && !comment.trim()) {
      setError("Give a reason for declining.")
      return
    }

    setSaving(action)
    setError(null)
    try {
      await pastorApproval(request.id, action, comment.trim() || undefined)
      pushToast(
        action === "approved" ? "Loan approved for disbursement" : "Loan request declined",
        "success"
      )
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
    <ModalShell open={open} onClose={handleClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Loan Final Approval</h2>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Disbursement Authorization
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

      {/* Body */}
      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[13px] font-bold text-[#3B5BDB]">
            {initials(request?.employeeName ?? "")}
          </span>
          <div>
            <div className="text-[15px] font-bold text-[#111827]">
              {request?.employeeName || "Staff member"}
            </div>
            <div className="text-[12px] text-[#6B7280]">
              {[request?.jobTitle, request?.department].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        </div>

        {/* Fields row */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Tenure
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
              {request?.tenureMonths ? `${request.tenureMonths} months` : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Principal Amount
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">
              {formatNaira(request?.amount ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Monthly Repayment
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">
              {formatNaira(request?.monthlyDeduction ?? 0)}
            </div>
          </div>
        </div>

        {/* Purpose statement */}
        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Purpose Statement
        </div>
        <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
          {request?.purpose || "No purpose was recorded on this application."}
        </blockquote>

        {/* Finance verification */}
        {request?.accountantReview ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            <span>
              Verified by Finance
              {request.accountantReview.at ? ` on ${formatDate(request.accountantReview.at)}` : ""}.
              {request.accountantReview.comment ? (
                <span className="block font-normal">{request.accountantReview.comment}</span>
              ) : null}
            </span>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-700">
            Finance has not verified this application yet.
          </div>
        )}

        {request?.exceedsPolicyLimit ? (
          <div className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">
            Debt service ratio {request.debtServiceRatio}% breaches the lending policy — a director
            override is required.
          </div>
        ) : null}

        <label
          className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]"
          htmlFor="pastor-decision-comment"
        >
          Decision Note
        </label>
        <textarea
          id="pastor-decision-comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Optional when approving, required when declining."
          className="mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
        />

        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={() => decide("declined")}
          disabled={Boolean(saving) || !request}
          className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
        >
          {saving === "declined" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Decline Request
        </button>
        <button
          type="button"
          onClick={() => decide("approved")}
          disabled={Boolean(saving) || !request}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving === "approved" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Approve Disbursement
        </button>
      </div>
    </ModalShell>
  )
}
