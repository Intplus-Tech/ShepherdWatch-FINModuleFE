"use client"

import { X, CheckCircle2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

type LoanRequest = {
  name: string
  dept: string
  loanType: string
  principal: string
  monthly?: string
}

const FALLBACK_REQUEST: LoanRequest = {
  name: "Sister Amaka Uzor",
  dept: "Youth Dept / 5 Years",
  loanType: "Staff Car Loan",
  principal: "₦750,000",
  monthly: "₦62,500",
}

function parseNaira(value: string): number {
  return Number(value.replace(/[^0-9.]/g, "")) || 0
}

function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

export default function BranchLeadLoanFinalApprovalModal({
  open,
  onClose,
  request,
}: {
  open: boolean
  onClose: () => void
  request: LoanRequest | null
}) {
  const data = request ?? FALLBACK_REQUEST
  const monthly = data.monthly ?? formatNaira(parseNaira(data.principal) / 12)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Loan Final Approval</h2>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Disbursement Authorization
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
        {/* Applicant identity card */}
        <div className="flex items-start justify-between gap-4 rounded-[12px] border border-[#EEF1F6] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[14px] font-bold text-[#3B5BDB]">
              {initials(data.name)}
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#111827]">{data.name}</div>
              <div className="text-[12px] text-[#6B7280]">{data.dept}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#EFF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                  Permanent Staff
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Active Status
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Request ID
            </div>
            <div className="mt-1 text-[13px] font-bold text-[#111827]">#LR-2023-094</div>
          </div>
        </div>

        {/* Fields row */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Loan Type
            </div>
            <div className="mt-2 text-[14px] font-semibold text-[#111827]">{data.loanType}</div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Principal Amount
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">{data.principal}</div>
          </div>
          <div className="rounded-lg border border-[#EEF1F6] bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Monthly Repayment
            </div>
            <div className="mt-2 text-[15px] font-bold text-[#111827]">{monthly}</div>
          </div>
        </div>

        {/* Purpose statement */}
        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          Purpose Statement
        </div>
        <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
          &ldquo;To purchase a car for official transit following the staff&rsquo;s recent
          promotion. This asset will support field monitoring tasks.&rdquo;
        </blockquote>

        {/* Accountant verified confirmation */}
        <div className="mt-5 flex items-center gap-2.5 rounded-lg bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          Verified by Branch Accountant on Oct 10, 2023.
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-rose-200 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
        >
          Decline Request
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
        >
          Approve Disbursement
        </button>
      </div>
    </ModalShell>
  )
}
