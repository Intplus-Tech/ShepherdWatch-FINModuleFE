"use client"

import { useState } from "react"
import {
  FileSpreadsheet,
  FileText,
  Info,
  Lock,
  MessageSquare,
  Paperclip,
  Scale,
  UploadCloud,
  X,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { REQUEST_TYPES, TRANSACTION_BRANCHES } from "./finance-data"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-semibold text-[#6B7280]"
const fieldCls =
  "mt-1.5 h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB] focus:bg-white"

const PRIORITIES = ["Low", "Medium", "High"] as const
type Priority = (typeof PRIORITIES)[number]

const ATTACHMENTS = [
  {
    id: "budget",
    name: "youth_conference_budget.xlsx",
    meta: "1.2 MB • Excel Spreadsheet",
    icon: FileSpreadsheet,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "proposal",
    name: "conference_proposal.pdf",
    meta: "3.4 MB • PDF Document",
    icon: FileText,
    iconClass: "bg-rose-50 text-rose-600",
  },
]

const MAX_RATIONALE = 500

export default function InitiateSpecialRequestModal({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean
  onClose: () => void
  onSubmitted?: (summary: { type: string; amount: number; branch: string }) => void
}) {
  const [requestType, setRequestType] = useState(REQUEST_TYPES[0])
  const [branch, setBranch] = useState("All Branches")
  const [amount, setAmount] = useState("4,500,000.00")
  const [requiredBy, setRequiredBy] = useState("2026-11-15")
  const [priority, setPriority] = useState<Priority>("Medium")
  const [rationale, setRationale] = useState(
    "This reallocation is required to fund the national youth conference. The funds will be moved from the general savings account to the program budget."
  )
  const [attachments, setAttachments] = useState(ATTACHMENTS)
  const [error, setError] = useState<string | null>(null)

  const numericAmount = Number(amount.replace(/[^0-9.]/g, "")) || 0

  const handleSubmit = () => {
    if (numericAmount <= 0) {
      setError("Enter the amount requested.")
      return
    }
    if (!rationale.trim()) {
      setError("A detailed rationale is required.")
      return
    }
    onSubmitted?.({ type: requestType, amount: numericAmount, branch })
    onClose()
  }

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-5xl">
      <div className="flex items-start justify-between gap-4 px-7 pt-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[24px] font-extrabold text-[#111827]">Initiate Special Request</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Draft Mode
          </span>
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

      <div className="grid max-h-[76vh] grid-cols-1 gap-8 overflow-y-auto px-7 pb-7 pt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Left: form */}
        <div className="flex flex-col gap-7">
          <section>
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] pb-3">
              <h3 className="text-[15px] font-bold text-[#111827]">Request Details</h3>
              <FileText className="h-4 w-4 text-[#9CA3AF]" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="request-type">
                  Request Type
                </label>
                <select
                  id="request-type"
                  value={requestType}
                  onChange={(event) => setRequestType(event.target.value)}
                  className={fieldCls}
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="request-branch">
                  Branch/Region Affected
                </label>
                <select
                  id="request-branch"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  className={fieldCls}
                >
                  {TRANSACTION_BRANCHES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="request-amount">
                  Amount Requested
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#6B7280]">
                    ₦
                  </span>
                  <input
                    id="request-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      if (error) setError(null)
                    }}
                    className={cn(fieldCls, "pl-8")}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="request-required-by">
                  Required By
                </label>
                <input
                  id="request-required-by"
                  type="date"
                  value={requiredBy}
                  onChange={(event) => setRequiredBy(event.target.value)}
                  className={fieldCls}
                />
              </div>
            </div>

            <div className="mt-4">
              <span className={labelCls}>Priority Level</span>
              <div className="mt-1.5 grid grid-cols-3 gap-3">
                {PRIORITIES.map((level) => {
                  const active = priority === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      aria-pressed={active}
                      className={cn(
                        "flex h-[42px] items-center justify-center gap-2 rounded-[8px] border text-[13px] font-semibold transition-colors",
                        active
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                          active ? "border-amber-500" : "border-[#D1D5DB]"
                        )}
                      >
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> : null}
                      </span>
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] pb-3">
              <h3 className="text-[15px] font-bold text-[#111827]">Justification &amp; Context</h3>
              <MessageSquare className="h-4 w-4 text-[#9CA3AF]" />
            </div>

            <div className="mt-4">
              <label className={labelCls} htmlFor="request-rationale">
                Detailed Rationale
              </label>
              <textarea
                id="request-rationale"
                rows={5}
                maxLength={MAX_RATIONALE}
                value={rationale}
                onChange={(event) => {
                  setRationale(event.target.value)
                  if (error) setError(null)
                }}
                className="mt-1.5 w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3 text-[13px] leading-relaxed text-[#4B5563] outline-none focus:border-[#2563EB] focus:bg-white"
              />
              <div className="mt-1.5 text-right text-[11px] font-medium text-[#9CA3AF]">
                {rationale.length}/{MAX_RATIONALE} characters
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] pb-3">
              <h3 className="text-[15px] font-bold text-[#111827]">Supporting Documents</h3>
              <Paperclip className="h-4 w-4 text-[#9CA3AF]" />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {attachments.map((file) => {
                const Icon = file.icon
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-4 py-3"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]",
                        file.iconClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-[#111827]">{file.name}</div>
                      <div className="text-[11px] font-medium text-[#9CA3AF]">{file.meta}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((row) => row.id !== file.id))}
                      aria-label={`Remove ${file.name}`}
                      className="text-[#9CA3AF] hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#D1D5DB] bg-white px-4 py-6 text-center transition-colors hover:border-[#3B5BDB]">
                <UploadCloud className="h-5 w-5 text-[#9CA3AF]" />
                <span className="text-[12px] font-semibold text-[#4B5563]">
                  Click or drag files to upload
                </span>
                <span className="text-[11px] font-medium text-[#9CA3AF]">Maximum file size: 25MB</span>
                <input type="file" className="hidden" multiple />
              </label>
            </div>
          </section>

          {error ? <p className="text-[12px] font-medium text-rose-600">{error}</p> : null}
        </div>

        {/* Right: workflow rail */}
        <div className="flex flex-col gap-5">
          <div className="rounded-[12px] bg-[#111827] p-6 text-white">
            <h3 className="text-[16px] font-bold">Approval Workflow</h3>

            <ol className="mt-5 flex flex-col gap-6">
              <li className="relative flex gap-3">
                <span className="absolute left-[15px] top-9 h-[calc(100%+8px)] w-px bg-white/15" />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <Scale className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Step 1</div>
                  <div className="mt-0.5 text-[13px] font-bold">Director of Finance</div>
                  <div className="text-[11px] font-medium text-white/60">
                    Initial Review &amp; Verification
                  </div>
                  <span className="mt-2 inline-flex rounded-[4px] bg-white/10 px-2 py-1 text-[10px] font-bold text-white/80">
                    Pending Submission
                  </span>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <Lock className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">Step 2</div>
                  <div className="mt-0.5 text-[13px] font-bold">Director of Pastorate</div>
                  <div className="text-[11px] font-medium text-white/60">Final Authorization</div>
                  <span className="mt-2 inline-flex rounded-[4px] bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60">
                    Locked
                  </span>
                </div>
              </li>
            </ol>

            <div className="mt-6 flex gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/60">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                Requests exceeding ₦1,000,000 require this two-tier authorization process. Allow 3–5
                business days for final approval.
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
            By submitting this request, you verify that the information provided is accurate and aligns
            with the strategic financial objectives of the institution. Unauthorized or fraudulent
            submissions are subject to immediate disciplinary action.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-[46px] rounded-[8px] bg-[#111827] text-[14px] font-bold text-white transition-colors hover:bg-[#1F2937]"
            >
              Submit for Approval
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-[46px] rounded-[8px] border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#4B5563] transition-colors hover:bg-gray-50"
            >
              Cancel &amp; Save Draft
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
