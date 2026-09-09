"use client"

import { useState } from "react"
import { Banknote, Loader2, ShieldCheck, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import { formatNaira } from "@/lib/hr/display"
import type { HrLoan } from "@/lib/hr/types"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
          {icon}
        </span>
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">{title}</h2>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}

/** Posts one repayment installment against a loan (Finance only). */
export function RecordRepaymentModal({
  loan,
  onClose,
  onRecorded,
}: {
  loan: HrLoan | null
  onClose: () => void
  onRecorded?: () => void
}) {
  const { recordRepayment } = useLoanMutations()
  const { pushToast } = useToast()
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setAmount("")
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!loan) return
    const value = Number(amount || loan.monthlyDeduction)
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter the amount received.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await recordRepayment(loan.id, value)
      pushToast("Repayment recorded", "success")
      setAmount("")
      onRecorded?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record the repayment.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={Boolean(loan)} onClose={handleClose} className="max-w-md">
      <ModalHeader
        icon={<Banknote className="h-5 w-5" />}
        title="Record Repayment"
        subtitle={`${loan?.employeeName || "Staff"} · ${formatNaira(loan?.remainingBalance ?? 0)} outstanding`}
        onClose={handleClose}
      />

      <div className="px-6 py-5">
        <label className={labelCls} htmlFor="repayment-amount">
          Amount Received
        </label>
        <input
          id="repayment-amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder={String(loan?.monthlyDeduction ?? "")}
          className={inputCls}
        />
        <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
          Leave blank to post the standard monthly deduction of{" "}
          {formatNaira(loan?.monthlyDeduction ?? 0)}.
        </p>
        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Recording…" : "Record Repayment"}
        </button>
      </div>
    </ModalShell>
  )
}

/**
 * Finance's verification step. Confirming moves the loan on to the pastor;
 * declining sends it back with the comment as the reason.
 */
export function AccountantReviewModal({
  loan,
  onClose,
  onReviewed,
}: {
  loan: HrLoan | null
  onClose: () => void
  onReviewed?: () => void
}) {
  const { accountantReview } = useLoanMutations()
  const { pushToast } = useToast()
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState<"verify" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (saving) return
    setComment("")
    setError(null)
    onClose()
  }

  const submit = async (isVerified: boolean) => {
    if (!loan) return
    if (!comment.trim()) {
      setError("Add a note explaining the verification.")
      return
    }

    setSaving(isVerified ? "verify" : "decline")
    setError(null)
    try {
      await accountantReview(loan.id, comment.trim(), isVerified)
      pushToast(isVerified ? "Loan verified for approval" : "Verification declined", "success")
      setComment("")
      onReviewed?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record the verification.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <ModalShell open={Boolean(loan)} onClose={handleClose} className="max-w-md">
      <ModalHeader
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Finance Verification"
        subtitle={`${loan?.employeeName || "Staff"} · ${formatNaira(loan?.amount ?? 0)} requested`}
        onClose={handleClose}
      />

      <div className="px-6 py-5">
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-[#F8FAFC] p-3 text-[12px]">
          <div>
            <div className="text-[#9CA3AF]">Monthly deduction</div>
            <div className="font-semibold text-[#111827]">
              {formatNaira(loan?.monthlyDeduction ?? 0)}
            </div>
          </div>
          <div>
            <div className="text-[#9CA3AF]">Debt service ratio</div>
            <div
              className={
                (loan?.debtServiceRatio ?? 0) > 33
                  ? "font-semibold text-rose-600"
                  : "font-semibold text-[#111827]"
              }
            >
              {loan?.debtServiceRatio ?? 0}%
            </div>
          </div>
        </div>

        {loan?.exceedsPolicyLimit ? (
          <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            This request breaches the lending policy limit — it will need a director override.
          </p>
        ) : null}

        <label className={labelCls} htmlFor="verification-comment">
          Verification Note *
        </label>
        <textarea
          id="verification-comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="e.g. Salary confirmed. Net pay supports the monthly repayment."
          className={inputCls}
        />
        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={Boolean(saving)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
        >
          {saving === "decline" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Decline
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={Boolean(saving)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving === "verify" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Verify for Approval
        </button>
      </div>
    </ModalShell>
  )
}
