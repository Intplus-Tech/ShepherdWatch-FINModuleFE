"use client"

import { Banknote, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import {
  LoanApplicationFields,
  useLoanApplicationForm,
} from "@/components/hr/LoanApplicationFields"

export default function BranchAcctNewLoanModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const form = useLoanApplicationForm({ open, onDone: onClose })

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
        <LoanApplicationFields
          state={form.state}
          patch={form.patch}
          branchId={form.branchId}
          pending={form.pending}
        />

        {form.error && <p className="text-[12px] font-medium text-red-600">{form.error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={form.pending}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={form.submit}
          disabled={form.pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {form.pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit Application
        </button>
      </div>
    </ModalShell>
  )
}
