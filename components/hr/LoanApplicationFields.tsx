"use client"

import { useEffect, useState } from "react"

import { EmployeePicker } from "@/components/hr/EmployeePicker"
import { HrFileDrop, type UploadedFile } from "@/components/hr/HrFileDrop"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useApplyLoan } from "@/components/hooks/hr/useHrLoans"

/**
 * The body shared by every "new loan application" modal.
 *
 * `monthlyDeduction` and `debtServiceRatio` are deliberately absent: the
 * backend derives both from the employee's salary and rejects a payload that
 * tries to set them.
 */

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

const PURPOSES = ["Housing", "Medical", "Education", "Vehicle", "Other"]
const TENURES = [6, 12, 18, 24]

export type LoanFormState = {
  employeeId: string
  amount: string
  purpose: string
  tenureMonths: number
  firstDeductionDate: string
  reason: string
  documents: UploadedFile[]
}

function initialState(): LoanFormState {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  return {
    employeeId: "",
    amount: "",
    purpose: "Housing",
    tenureMonths: 12,
    firstDeductionDate: nextMonth.toISOString().slice(0, 10),
    reason: "",
    documents: [],
  }
}

/** Owns the loan form state and the submit call; the modal supplies the chrome. */
export function useLoanApplicationForm({ open, onDone }: { open: boolean; onDone: () => void }) {
  const branchId = useBranchId()
  const applyLoan = useApplyLoan()
  const [state, setState] = useState<LoanFormState>(initialState)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setState(initialState())
    setFormError(null)
    applyLoan.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function patch(next: Partial<LoanFormState>) {
    setState((current) => ({ ...current, ...next }))
  }

  async function submit() {
    setFormError(null)

    const amount = Number(state.amount.replace(/[^0-9.]/g, ""))

    if (!state.employeeId) {
      setFormError("Select the employee applying for this loan.")
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter a loan amount greater than zero.")
      return
    }
    if (!branchId) {
      setFormError("Your account has no branch assigned, so this can't be submitted.")
      return
    }

    try {
      await applyLoan.mutateAsync({
        employeeId: state.employeeId,
        branchId,
        amount,
        // The backend stores a single free-text purpose; the note refines it.
        purpose: state.reason.trim()
          ? `${state.purpose} — ${state.reason.trim()}`
          : state.purpose,
        tenureMonths: state.tenureMonths,
        firstDeductionDate: state.firstDeductionDate
          ? new Date(state.firstDeductionDate).toISOString()
          : undefined,
        supportingDocumentUrls: state.documents.map((file) => file.url),
      })
      onDone()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  return {
    state,
    patch,
    submit,
    branchId,
    pending: applyLoan.isPending,
    error: formError ?? (applyLoan.error ? hrErrorMessage(applyLoan.error) : null),
  }
}

export function LoanApplicationFields({
  state,
  patch,
  branchId,
  pending,
}: {
  state: LoanFormState
  patch: (next: Partial<LoanFormState>) => void
  branchId: string
  pending: boolean
}) {
  return (
    <>
      {/* Employee Selection */}
      <div>
        <label className={labelCls}>Employee Selection</label>
        <EmployeePicker
          value={state.employeeId}
          onChange={(employeeId) => patch({ employeeId })}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Loan Amount</label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
              ₦
            </span>
            <input
              className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-7 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
              value={state.amount}
              onChange={(e) => patch({ amount: e.target.value })}
              inputMode="decimal"
              placeholder="500,000"
              disabled={pending}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Loan Purpose</label>
          <select
            className={inputCls}
            value={state.purpose}
            onChange={(e) => patch({ purpose: e.target.value })}
            disabled={pending}
          >
            {PURPOSES.map((purpose) => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Repayment Duration</label>
          <select
            className={inputCls}
            value={state.tenureMonths}
            onChange={(e) => patch({ tenureMonths: Number(e.target.value) })}
            disabled={pending}
          >
            {TENURES.map((months) => (
              <option key={months} value={months}>
                {months} Months
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>First Deduction Date</label>
          <input
            type="date"
            className={inputCls}
            value={state.firstDeductionDate}
            onChange={(e) => patch({ firstDeductionDate: e.target.value })}
            disabled={pending}
          />
        </div>
      </div>

      {/* Reason for Loan */}
      <div>
        <label className={labelCls}>Reason for Loan</label>
        <textarea
          rows={3}
          className={inputCls}
          value={state.reason}
          onChange={(e) => patch({ reason: e.target.value })}
          placeholder="Provide a brief explanation for the director's review..."
          disabled={pending}
        />
      </div>

      {/* Supporting Documents */}
      <div>
        <label className={labelCls}>Supporting Documents (optional)</label>
        <HrFileDrop
          files={state.documents}
          onChange={(documents) => patch({ documents })}
          folder="hr/loans"
          branchId={branchId || undefined}
          disabled={pending}
        />
      </div>
    </>
  )
}
