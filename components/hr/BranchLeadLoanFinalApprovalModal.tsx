"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { usePastorApproveLoan } from "@/components/hooks/hr/useHrLoans"
import { deref, employeeName } from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"

/**
 * The pastor's decision on a loan the accountant has already reviewed.
 *
 * Both outcomes go through the same endpoint with an `action`, so approve and
 * decline share this dialog and the comment is carried either way.
 */
export default function BranchLeadLoanFinalApprovalModal({
  open,
  onClose,
  loan,
  intent = "approved",
}: {
  open: boolean
  onClose: () => void
  loan: EmployeeLoan | null
  intent?: "approved" | "declined"
}) {
  const decide = usePastorApproveLoan()
  const [comment, setComment] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setComment("")
    setFormError(null)
    decide.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loan?._id, intent])

  async function handleSubmit() {
    if (!loan) return
    setFormError(null)

    if (intent === "declined" && comment.trim().length < 2) {
      setFormError("A reason is required to decline.")
      return
    }

    try {
      await decide.mutateAsync({
        id: loan._id,
        action: intent,
        comment: comment.trim() || undefined,
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const employee = deref(loan?.employeeId)
  const review = loan?.accountantReview
  const error = formError ?? (decide.error ? hrErrorMessage(decide.error) : null)
  const declining = intent === "declined"

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            {declining ? "Decline Loan Request" : "Final Approval"}
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {declining
              ? "Record why this request is being turned down."
              : "Confirm the branch pastor's approval for this staff loan."}
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
        {loan && (
          <div className="rounded-[10px] border border-[#EEF1F6] p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Applicant</span>
              <span className="font-semibold text-[#111827]">
                {employeeName(loan.employeeId)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Department</span>
              <span className="font-semibold text-[#111827]">
                {employee?.department ?? employee?.jobTitle ?? "—"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Purpose</span>
              <span className="font-semibold text-[#111827]">{loan.purpose}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Principal</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Monthly / Tenure</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })} ·{" "}
                {loan.tenureMonths} mo
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Debt service ratio</span>
              <span
                className={
                  loan.debtServiceRatio > 33
                    ? "font-semibold text-rose-600"
                    : "font-semibold text-emerald-600"
                }
              >
                {Math.round(loan.debtServiceRatio * 100) / 100}%
              </span>
            </div>
          </div>
        )}

        {review?.isVerified && (
          <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div className="text-[12px] text-[#4B5563]">
              <p className="font-semibold text-emerald-700">Accountant verified</p>
              {review.comment && <p className="mt-0.5">{review.comment}</p>}
              {review.timestamp && (
                <p className="mt-0.5 text-[#9CA3AF]">
                  {formatDate(review.timestamp, "medium")}
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Comment {declining ? "(required)" : "(optional)"}
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={decide.isPending}
            placeholder={
              declining
                ? "Explain the decision for the applicant's record…"
                : "Any conditions attached to this approval…"
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
          disabled={decide.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={decide.isPending}
          className={
            declining
              ? "inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
          }
        >
          {decide.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {declining ? "Decline Request" : "Approve Loan"}
        </button>
      </div>
    </ModalShell>
  )
}
