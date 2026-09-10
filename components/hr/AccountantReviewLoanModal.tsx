"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useAccountantReviewLoan } from "@/components/hooks/hr/useHrLoans"
import { employeeName, loanBalance } from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"

/**
 * The accountant's affordability check — the first gate in the loan workflow.
 *
 * The backend requires a comment and records `isVerified`, so both are captured
 * here rather than assumed.
 */
export default function AccountantReviewLoanModal({
  loan,
  onClose,
}: {
  loan: EmployeeLoan | null
  onClose: () => void
}) {
  const review = useAccountantReviewLoan()
  const [comment, setComment] = useState("")
  const [isVerified, setIsVerified] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setComment("")
    setIsVerified(true)
    setFormError(null)
    review.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan?._id])

  async function handleSubmit() {
    if (!loan) return
    setFormError(null)

    if (comment.trim().length < 2) {
      setFormError("A review comment is required.")
      return
    }

    try {
      await review.mutateAsync({ id: loan._id, comment: comment.trim(), isVerified })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (review.error ? hrErrorMessage(review.error) : null)

  return (
    <ModalShell open={loan !== null} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Accountant Review</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Confirm affordability before this goes to the pastor.
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
              <span className="text-[#6B7280]">Amount</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Monthly deduction</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })}
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
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="text-[#6B7280]">Outstanding</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(loanBalance(loan), { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-[13px] font-medium text-[#111827]">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            disabled={review.isPending}
            className="h-4 w-4 rounded border-[#D1D5DB] accent-[#2563EB]"
          />
          Salary and deduction capacity verified
        </label>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Review Comment
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={review.isPending}
            placeholder="Note what you checked and any conditions…"
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
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={review.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {review.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit Review
        </button>
      </div>
    </ModalShell>
  )
}
