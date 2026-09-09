"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import { formatNaira } from "@/lib/hr/display"
import type { HrLoan } from "@/lib/hr/types"

/**
 * The director's override — the only way a loan that breaches the debt-service
 * policy gets approved. Both the written rationale and the acknowledgement are
 * required by the endpoint, so neither is optional here.
 */
export default function ApproveLoanOverrideModal({
  open,
  onClose,
  loan,
  onOverridden,
}: {
  open: boolean
  onClose: () => void
  loan: HrLoan | null
  onOverridden?: () => void
}) {
  const { directorOverride } = useLoanMutations()
  const { pushToast } = useToast()
  const [reason, setReason] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const netPayAfter = loan ? Math.max(loan.netSalary - loan.monthlyDeduction, 0) : 0

  const handleClose = () => {
    if (saving) return
    setReason("")
    setAcknowledged(false)
    setError(null)
    onClose()
  }

  const handleApprove = async () => {
    if (!loan) return
    if (!reason.trim()) {
      setError("Give the rationale for this policy deviation.")
      return
    }
    if (!acknowledged) {
      setError("Confirm you accept responsibility for the exception.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await directorOverride(loan.id, reason.trim(), true)
      pushToast("Loan override approved", "success")
      setReason("")
      setAcknowledged(false)
      onOverridden?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to approve the override.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            Approve Loan Override
          </h2>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            High-Value Transaction Threshold Triggered
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {/* Identity + specs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#F8FAFC] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Employee Identity
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">
              {loan?.employeeName || "Staff member"}
            </div>
            <div className="text-[12px] text-[#6B7280]">{loan?.employeeCode || "—"}</div>
            <div className="my-3 border-t border-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Basic Salary</span>
              <span className="text-[13px] font-semibold text-[#111827]">
                {formatNaira(loan?.basicSalary ?? 0)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Loan Specifications
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">
              {loan?.purpose || "Staff loan"}
            </div>
            <div className="text-[12px] text-[#6B7280]">
              {loan?.tenureMonths ? `${loan.tenureMonths} Months Tenure` : "—"}
            </div>
            <div className="my-3 border-t border-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Principal</span>
              <span className="text-[13px] font-semibold text-[#111827]">
                {formatNaira(loan?.amount ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Financial impact */}
        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Financial Impact Projections
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Monthly Repayment
            </div>
            <div className="mt-2 text-[20px] font-bold text-[#111827]">
              {formatNaira(loan?.monthlyDeduction ?? 0)}
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Net Pay After
            </div>
            <div className="mt-2 text-[20px] font-bold text-emerald-600">
              {formatNaira(netPayAfter)}
            </div>
          </div>
        </div>

        {loan ? (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            Debt service ratio {loan.debtServiceRatio}%
            {loan.exceedsPolicyLimit ? " — above the standard policy limit." : "."}
          </p>
        ) : null}

        {/* Justification */}
        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Employee Justification
        </div>
        <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
          {loan?.purpose || "No justification was recorded on this application."}
        </blockquote>

        {/* Override reason */}
        <div className="mt-5">
          <label
            className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]"
            htmlFor="override-reason"
          >
            Director&rsquo;s Override Reason *
          </label>
          <textarea
            id="override-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide strategic rationale for policy deviation..."
            className="mt-2 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#3B5BDB]"
          />
        </div>

        {/* Acknowledgement */}
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#E5E7EB] accent-[#111827]"
          />
          <span className="text-[13px] text-[#4B5563]">
            I acknowledge that this loan disbursement{" "}
            <span className="font-bold text-[#111827]">
              violates the standard DSR policy
            </span>{" "}
            and I accept institutional responsibility for this exception based on
            the strategic justification provided.
          </span>
        </label>

        {error ? (
          <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50 disabled:opacity-60"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={saving || !loan}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          APPROVE OVERRIDE &amp; CONFIRM
        </button>
      </div>
    </ModalShell>
  )
}
