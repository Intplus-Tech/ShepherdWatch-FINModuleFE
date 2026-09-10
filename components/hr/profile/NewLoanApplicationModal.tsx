"use client"

import { useEffect, useState } from "react"
import { Banknote, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, btnDark, btnOutline } from "./shared"
import { HrFileDrop, type UploadedFile } from "@/components/hr/HrFileDrop"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useEmployee } from "@/components/hooks/hr/useHrEmployees"
import { useApplyLoan } from "@/components/hooks/hr/useHrLoans"
import { refId } from "@/lib/hr/normalize"

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

const PURPOSES = ["Housing", "Medical", "Education", "Vehicle", "Other"]
const TENURES = [6, 12, 18, 24]

/**
 * Files a loan for the employee whose profile is open, so the employee is fixed
 * rather than picked. The branch comes from that employee's own record.
 */
export default function NewLoanApplicationModal({
  open,
  onClose,
  employeeId,
}: {
  open: boolean
  onClose: () => void
  employeeId: string | null
}) {
  const employeeQuery = useEmployee(open ? employeeId : null)
  const applyLoan = useApplyLoan()

  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("Housing")
  const [tenureMonths, setTenureMonths] = useState(12)
  const [firstDeductionDate, setFirstDeductionDate] = useState("")
  const [note, setNote] = useState("")
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1)

    setAmount("")
    setPurpose("Housing")
    setTenureMonths(12)
    setFirstDeductionDate(nextMonth.toISOString().slice(0, 10))
    setNote("")
    setDocuments([])
    setFormError(null)
    applyLoan.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const branchId = refId(employeeQuery.data?.branchId)

  async function handleSubmit() {
    setFormError(null)

    const parsedAmount = Number(amount.replace(/[^0-9.]/g, ""))

    if (!employeeId) {
      setFormError("No employee selected.")
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a loan amount greater than zero.")
      return
    }
    if (!branchId) {
      setFormError("This employee has no branch on record, so a loan can't be filed.")
      return
    }

    try {
      await applyLoan.mutateAsync({
        employeeId,
        branchId,
        amount: parsedAmount,
        purpose: note.trim() ? `${purpose} — ${note.trim()}` : purpose,
        tenureMonths,
        firstDeductionDate: firstDeductionDate
          ? new Date(firstDeductionDate).toISOString()
          : undefined,
        supportingDocumentUrls: documents.map((file) => file.url),
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (applyLoan.error ? hrErrorMessage(applyLoan.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
            <Banknote className="h-4 w-4" />
          </span>
          <h2 className="text-[16px] font-bold text-[#111827]">New Loan Application</h2>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        <div>
          <SectionLabel>Facility Details</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Loan Amount</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                  ₦
                </span>
                <input
                  className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-7 pr-3 text-[13px] outline-none focus:border-[#3B5BDB]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="500,000"
                  disabled={applyLoan.isPending}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Purpose</label>
              <select
                className={inputCls}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={applyLoan.isPending}
              >
                {PURPOSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Repayment Duration</label>
              <select
                className={inputCls}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                disabled={applyLoan.isPending}
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
                value={firstDeductionDate}
                onChange={(e) => setFirstDeductionDate(e.target.value)}
                disabled={applyLoan.isPending}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Reason for Loan</label>
          <textarea
            rows={3}
            className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#3B5BDB]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Brief explanation for the reviewers…"
            disabled={applyLoan.isPending}
          />
        </div>

        <div>
          <label className={labelCls}>Supporting Documents (optional)</label>
          <HrFileDrop
            files={documents}
            onChange={setDocuments}
            folder="hr/loans"
            branchId={branchId || undefined}
            disabled={applyLoan.isPending}
          />
        </div>

        <p className="text-[12px] text-[#9CA3AF]">
          The monthly deduction and debt service ratio are calculated from this employee&apos;s
          salary when the application is filed.
        </p>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose} disabled={applyLoan.isPending}>
          Cancel
        </button>
        <button className={btnDark} onClick={handleSubmit} disabled={applyLoan.isPending}>
          {applyLoan.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit Application
        </button>
      </div>
    </ModalShell>
  )
}
