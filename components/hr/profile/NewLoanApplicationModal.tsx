"use client"

import { ArrowLeft, UploadCloud, FileText, Wallet, AlertCircle, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { btnOutline, btnDark } from "./shared"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

const FILES = [
  { name: "Medical_License_2024.pdf", meta: "1.2 MB" },
  { name: "Recent_Payslip_Dec.pdf", meta: "850 KB" },
]

export default function NewLoanApplicationModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="px-6 pt-5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-[13px] font-bold text-white">
              SJ
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#111827]">New Loan Application</h2>
              <div className="text-[12px] text-[#6B7280]">
                Dr. Sarah Jenkins &nbsp;•&nbsp; Senior Pediatrician (ID: #SJ-8842)
              </div>
            </div>
          </div>
          <span className="rounded-md bg-[#EEF2FF] px-3 py-1.5 text-[10px] font-bold text-[#3B5BDB]">
            APPLICATION ID: DRAFT-402
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Loan Details + Repayment side by side */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Loan Details */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-[#EEF1F6] pb-3 text-[15px] font-bold text-[#111827]">
              <FileText className="h-4 w-4 text-[#3B5BDB]" /> Loan Details
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Loan Type</label>
                <select className={`${inputCls} mt-1.5`}>
                  <option>Select Loan Category</option>
                  <option>Emergency Personal Loan</option>
                  <option>Staff Housing Loan</option>
                  <option>Vehicle Asset Advance</option>
                  <option>Professional Development Grant</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Requested Amount</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#9CA3AF]">
                    $
                  </span>
                  <input className={`${inputCls} pl-7`} placeholder="0.00" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Purpose of Loan</label>
                <textarea
                  rows={3}
                  className={`${inputCls} mt-1.5`}
                  placeholder="Briefly describe why this loan is needed..."
                />
              </div>
            </div>
          </div>

          {/* Repayment (dark) */}
          <div className="flex flex-col rounded-xl bg-[#111827] p-5 text-white lg:col-span-1">
            <div className="flex items-center gap-2 text-[15px] font-bold">
              <Wallet className="h-4 w-4" /> Repayment
            </div>
            <label className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
              Repayment Period
            </label>
            <select className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/40">
              <option className="text-black">24 Months</option>
              <option className="text-black">12 Months</option>
              <option className="text-black">36 Months</option>
              <option className="text-black">48 Months</option>
            </select>
            <div className="mt-5 rounded-lg bg-white/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Monthly Deduction
              </div>
              <div className="mt-1 text-[28px] font-bold leading-none">₦0.00</div>
              <div className="mt-2 text-[11px] text-white/50">
                Automatic payroll deduction starting next billing cycle.
              </div>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center gap-2 border-b border-[#EEF1F6] pb-3 text-[15px] font-bold text-[#111827]">
            <FileText className="h-4 w-4 text-[#3B5BDB]" /> Documentation
          </div>
          <div className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
            <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
            <div className="mt-3 text-[14px] font-semibold text-[#111827]">
              Drop supporting documents here
            </div>
            <div className="text-[12px] text-[#6B7280]">
              Upload ID, proof of need, or asset invoice (PDF, JPG, up to 10MB)
            </div>
            <button className={`${btnOutline} mt-4`}>Browse Files</button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FILES.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2 rounded-md border border-[#EEF1F6] bg-white px-3 py-2 text-[12px]"
              >
                <FileText className="h-4 w-4 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[#111827]">{f.name}</div>
                  <div className="text-[11px] text-[#9CA3AF]">{f.meta}</div>
                </div>
                <button aria-label={`Remove ${f.name}`} className="text-[#9CA3AF] hover:text-rose-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[12px] text-[#9CA3AF] sm:max-w-md">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          By submitting, you authorize the Finance Department to review your credit history and
          verify employment status within Ecclesia Direct.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button className={btnOutline} onClick={onClose}>
            Cancel
          </button>
          <button className={btnDark}>Submit Application</button>
        </div>
      </div>
    </ModalShell>
  )
}
