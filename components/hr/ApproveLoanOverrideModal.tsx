"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

export default function ApproveLoanOverrideModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [reason, setReason] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
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
          onClick={onClose}
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
              John Obi
            </div>
            <div className="text-[12px] text-[#6B7280]">EMP-00421</div>
            <div className="my-3 border-t border-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Basic Salary</span>
              <span className="text-[13px] font-semibold text-[#111827]">
                ₦300,000
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-[#F8FAFC] p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Loan Specifications
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">
              Staff Car Loan
            </div>
            <div className="text-[12px] text-[#6B7280]">12 Months Tenure</div>
            <div className="my-3 border-t border-[#E5E7EB]" />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Principal</span>
              <span className="text-[13px] font-semibold text-[#111827]">
                ₦1,200,000
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
              ₦100,000
            </div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Net Pay After
            </div>
            <div className="mt-2 text-[20px] font-bold text-emerald-600">
              ₦200,000
            </div>
          </div>
        </div>

        {/* Justification */}
        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Employee Justification
        </div>
        <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
          &ldquo;I am requesting this car loan to facilitate travel to regional
          ministry hubs. The slight DSR breach is offset by my upcoming annual
          step increment due in 2 months, which will bring the ratio back within
          the 30% limit.&rdquo;
        </blockquote>

        {/* Override reason */}
        <div className="mt-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Director&rsquo;s Override Reason *
          </label>
          <textarea
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
        >
          APPROVE OVERRIDE &amp; CONFIRM
        </button>
      </div>
    </ModalShell>
  )
}
