"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useDirectorOverrideLoan } from "@/components/hooks/hr/useHrLoans"
import { employeeName } from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"

/**
 * Director override for a loan that breaches the debt-service policy.
 *
 * The backend refuses the call unless `acknowledgedPolicyViolation` is `true`,
 * so the waiver is an explicit checkbox rather than an implicit side effect.
 */
export default function ApproveLoanOverrideModal({
  open,
  onClose,
  loan,
}: {
  open: boolean
  onClose: () => void
  loan: EmployeeLoan | null
}) {
  const override = useDirectorOverrideLoan()
  const [reason, setReason] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReason("")
    setAcknowledged(false)
    setFormError(null)
    override.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loan?._id])

  async function handleSubmit() {
    if (!loan) return
    setFormError(null)

    if (reason.trim().length < 5) {
      setFormError("Give an override reason of at least five characters.")
      return
    }
    if (!acknowledged) {
      setFormError("You must acknowledge the policy waiver to override.")
      return
    }

    try {
      await override.mutateAsync({
        id: loan._id,
        reason: reason.trim(),
        acknowledgedPolicyViolation: true,
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (override.error ? hrErrorMessage(override.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">Director Override</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Approve this facility despite the debt-service policy.
            </p>
          </div>
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
              <span className="font-semibold text-rose-600">
                {Math.round(loan.debtServiceRatio * 100) / 100}%
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Override Reason
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={override.isPending}
            placeholder="Record the justification for waiving the policy…"
            className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3B5BDB]"
          />
        </div>

        <label className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3 text-[12px] text-[#4B5563]">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            disabled={override.isPending}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] accent-amber-600"
          />
          <span>
            I acknowledge this approval breaches the debt-service policy and accept
            responsibility for the waiver. This is recorded against my account.
          </span>
        </label>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={override.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={override.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {override.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Override &amp; Approve
        </button>
      </div>
    </ModalShell>
  )
}
