"use client"

import { useMemo, useState } from "react"
import { Search, X, Banknote, UploadCloud, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useLoanMutations } from "@/components/hooks/useHrLoans"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"
import { formatNaira } from "@/lib/hr/display"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

const PURPOSES = ["Housing", "Medical", "Education", "Vehicle", "Other"]
const TENURES = [6, 12, 18, 24]

/**
 * Files a loan application. The backend derives the monthly deduction and the
 * debt-service ratio from amount and tenure, so this form only sends the terms
 * and the case for the loan; the running figure below is an on-screen estimate.
 */
export default function BranchAdminNewLoanModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const scope = useHrScope()
  const { pushToast } = useToast()
  const { applyForLoan } = useLoanMutations()

  const [employeeId, setEmployeeId] = useState("")
  const [employeeQuery, setEmployeeQuery] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [tenureMonths, setTenureMonths] = useState(12)
  const [firstDeductionDate, setFirstDeductionDate] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useDebouncedValue(employeeQuery, 300)
  const { employees, loading: employeesLoading } = useHrEmployees({ limit: 50, search })

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeId) ?? null,
    [employees, employeeId]
  )

  const monthlyEstimate = useMemo(() => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !tenureMonths) return 0
    return Math.round(value / tenureMonths)
  }, [amount, tenureMonths])

  const reset = () => {
    setEmployeeId("")
    setEmployeeQuery("")
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

    if (!employeeId) {
      setError("Choose the staff member applying.")
      return
    }
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter the loan amount.")
      return
    }

    const branchId = selectedEmployee?.branchId || scope.branchId || scope.ownBranchId
    if (!branchId) {
      setError("No branch is attached to this application, so it cannot be filed.")
      return
    }

    setSaving(true)
    try {
      await applyForLoan({
        employeeId,
        branchId,
        amount: value,
        // The API takes one free-text purpose; the category leads, the note explains.
        purpose: reason.trim() ? `${purpose}: ${reason.trim()}` : purpose,
        tenureMonths,
        firstDeductionDate: firstDeductionDate || undefined,
      })
      pushToast("Loan application submitted", "success")
      reset()
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit the loan application.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#111827] text-white">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">
              Create New Loan Application
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Initiate a formal financial assistance request
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

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-4 overflow-y-auto px-6 py-5">
        {/* Employee Selection */}
        <div>
          <label className={labelCls} htmlFor="loan-employee-search">
            Employee Selection
          </label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="loan-employee-search"
              type="text"
              value={employeeQuery}
              onChange={(event) => setEmployeeQuery(event.target.value)}
              placeholder="Search staff by name..."
              className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
          <select
            aria-label="Applicant"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className={inputCls}
          >
            <option value="">
              {employeesLoading ? "Loading staff…" : "Select the applicant"}
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name || "Unnamed staff"}
                {employee.employeeCode ? ` — ${employee.employeeCode}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Amount + Purpose */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="loan-amount">
              Loan Amount
            </label>
            <input
              id="loan-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              placeholder="500000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="loan-purpose">
              Loan Purpose
            </label>
            <select
              id="loan-purpose"
              className={inputCls}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration + First Deduction Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="loan-tenure">
              Repayment Duration
            </label>
            <select
              id="loan-tenure"
              className={inputCls}
              value={tenureMonths}
              onChange={(event) => setTenureMonths(Number(event.target.value))}
            >
              {TENURES.map((months) => (
                <option key={months} value={months}>
                  {months} Months
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="loan-first-deduction">
              First Deduction Date
            </label>
            <input
              id="loan-first-deduction"
              type="date"
              className={inputCls}
              value={firstDeductionDate}
              onChange={(event) => setFirstDeductionDate(event.target.value)}
            />
          </div>
        </div>

        {monthlyEstimate > 0 ? (
          <p className="rounded-md bg-[#EEF2FF] px-3 py-2 text-[12px] text-[#3B5BDB]">
            Roughly {formatNaira(monthlyEstimate)} a month over {tenureMonths} months. Finance
            confirms the final deduction when they review it.
          </p>
        ) : null}

        {/* Reason for Loan */}
        <div>
          <label className={labelCls} htmlFor="loan-reason">
            Reason for Loan
          </label>
          <textarea
            id="loan-reason"
            rows={3}
            className={inputCls}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Provide a brief explanation for the director's review..."
          />
        </div>

        {/* Supporting Documents */}
        <div>
          <label className={labelCls}>Supporting Documents (optional)</label>
          <div className="mt-1.5 flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
            <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
            <div className="mt-3 text-[14px] font-semibold text-[#111827]">
              Attach documents after submitting
            </div>
            <div className="text-[12px] text-[#6B7280]">
              Upload them from the loan record once it is filed
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </ModalShell>
  )
}
