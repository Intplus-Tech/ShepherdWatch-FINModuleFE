"use client"

import { useMemo, useState } from "react"
import { X, Banknote, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, btnDark, btnOutline } from "./shared"
import { useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import { formatNaira } from "@/lib/hr/display"

const PURPOSES = ["Housing", "Medical", "Education", "Vehicle", "Other"]
const TENURES = [6, 12, 18, 24]

const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

/** Files a loan for the employee whose profile is open. */
export default function NewLoanApplicationModal({
  open,
  onClose,
  employeeId,
  branchId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  employeeId: string
  branchId: string
  onCreated?: () => void
}) {
  const { applyForLoan } = useLoanMutations()
  const { pushToast } = useToast()

  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [tenureMonths, setTenureMonths] = useState(12)
  const [firstDeductionDate, setFirstDeductionDate] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthlyEstimate = useMemo(() => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !tenureMonths) return 0
    return Math.round(value / tenureMonths)
  }, [amount, tenureMonths])

  const reset = () => {
    setAmount("")
    setPurpose(PURPOSES[0])
    setTenureMonths(12)
    setFirstDeductionDate("")
    setReason("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)
    if (!employeeId) return setError("No employee is selected.")
    if (!branchId) return setError("This employee has no branch, so the loan cannot be filed.")

    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setError("Enter the loan amount.")

    setSaving(true)
    try {
      await applyForLoan({
        employeeId,
        branchId,
        amount: value,
        purpose: reason.trim() ? `${purpose}: ${reason.trim()}` : purpose,
        tenureMonths,
        firstDeductionDate: firstDeductionDate || undefined,
      })
      pushToast("Loan application submitted", "success")
      reset()
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this application.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-lg">
      <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
            <Banknote className="h-4 w-4" />
          </span>
          <h2 className="text-[16px] font-bold text-[#111827]">New Loan Application</h2>
        </div>
        <button
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-4 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <SectionLabel>Loan Amount</SectionLabel>
            <input
              aria-label="Loan amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="500000"
              className={inputCls}
            />
          </div>
          <div>
            <SectionLabel>Purpose</SectionLabel>
            <select
              aria-label="Loan purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className={inputCls}
            >
              {PURPOSES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <SectionLabel>Repayment Duration</SectionLabel>
            <select
              aria-label="Repayment duration"
              value={tenureMonths}
              onChange={(event) => setTenureMonths(Number(event.target.value))}
              className={inputCls}
            >
              {TENURES.map((months) => (
                <option key={months} value={months}>
                  {months} Months
                </option>
              ))}
            </select>
          </div>
          <div>
            <SectionLabel>First Deduction</SectionLabel>
            <input
              aria-label="First deduction date"
              type="date"
              value={firstDeductionDate}
              onChange={(event) => setFirstDeductionDate(event.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {monthlyEstimate > 0 ? (
          <p className="rounded-md bg-[#EEF2FF] px-3 py-2 text-[12px] text-[#3B5BDB]">
            Roughly {formatNaira(monthlyEstimate)} a month over {tenureMonths} months. Finance
            confirms the final deduction on review.
          </p>
        ) : null}

        <div>
          <SectionLabel>Reason</SectionLabel>
          <textarea
            aria-label="Reason for the loan"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Brief explanation for the reviewers…"
            className={inputCls}
          />
        </div>

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={handleClose} disabled={saving}>
          Cancel
        </button>
        <button className={btnDark} onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </ModalShell>
  )
}
