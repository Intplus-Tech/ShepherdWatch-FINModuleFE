"use client"

import { Search, X, Banknote, UploadCloud } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

export default function BranchAdminNewLoanModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
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
          onClick={onClose}
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
          <label className={labelCls}>Employee Selection</label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <select
              className="w-full appearance-none rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
              defaultValue="Dr. Sarah Jenkins - ID: EL-8802"
            >
              <option>Dr. Sarah Jenkins - ID: EL-8802</option>
            </select>
          </div>
        </div>

        {/* Amount + Purpose */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Loan Amount</label>
            <input className={inputCls} defaultValue="₦ 500,000" />
          </div>
          <div>
            <label className={labelCls}>Loan Purpose</label>
            <select className={inputCls} defaultValue="Housing">
              <option>Housing</option>
              <option>Medical</option>
              <option>Education</option>
              <option>Vehicle</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Duration + First Deduction Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Repayment Duration</label>
            <select className={inputCls} defaultValue="12 Months">
              <option>6 Months</option>
              <option>12 Months</option>
              <option>18 Months</option>
              <option>24 Months</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>First Deduction Date</label>
            <input type="date" className={inputCls} defaultValue="2023-11-28" />
          </div>
        </div>

        {/* Reason for Loan */}
        <div>
          <label className={labelCls}>Reason for Loan</label>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Provide a brief explanation for the director's review..."
          />
        </div>

        {/* Supporting Documents */}
        <div>
          <label className={labelCls}>Supporting Documents (optional)</label>
          <div className="mt-1.5 flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
            <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
            <div className="mt-3 text-[14px] font-semibold text-[#111827]">
              Drag &amp; drop files or browse
            </div>
            <div className="text-[12px] text-[#6B7280]">
              PDF, PNG, or JPG (Max 5MB)
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
        >
          Submit Application
        </button>
      </div>
    </ModalShell>
  )
}
