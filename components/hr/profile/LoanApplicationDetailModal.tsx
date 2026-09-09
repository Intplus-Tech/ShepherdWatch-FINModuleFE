"use client"

import { X, Banknote, Check, XCircle } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, StatusBadge, btnOutline } from "./shared"
import { LOAN_STATUS_LABELS, formatDate, formatNaira, statusLabel } from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import type { HrLoan } from "@/lib/hr/types"

/** Read-only view of one loan application and where it sits in the chain. */
export default function LoanApplicationDetailModal({
  open,
  onClose,
  loan,
}: {
  open: boolean
  onClose: () => void
  loan: HrLoan | null
}) {
  const steps = [
    { key: "accountant", title: "Finance Verification", review: loan?.accountantReview },
    { key: "pastor", title: "Pastor Authorization", review: loan?.pastorApproval },
    { key: "director", title: "Director Override", review: loan?.directorOverride },
  ].filter((step) => step.review)

  const repaid = loan ? Math.max(loan.amount - loan.remainingBalance, 0) : 0

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">
              {loan?.purpose || "Loan Application"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {loan?.employeeName || "Staff member"} · applied {formatDate(loan?.createdAt ?? "")}
            </p>
          </div>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <StatusBadge status={statusLabel(LOAN_STATUS_LABELS, loan?.status ?? "").toUpperCase()} />

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <SectionLabel>Principal</SectionLabel>
            <p className="mt-1 text-[14px] font-semibold text-[#111827]">
              {formatNaira(loan?.amount ?? 0)}
            </p>
          </div>
          <div>
            <SectionLabel>Monthly</SectionLabel>
            <p className="mt-1 text-[14px] font-semibold text-[#111827]">
              {formatNaira(loan?.monthlyDeduction ?? 0)}
            </p>
          </div>
          <div>
            <SectionLabel>Repaid</SectionLabel>
            <p className="mt-1 text-[14px] font-semibold text-emerald-600">
              {formatNaira(repaid)}
            </p>
          </div>
          <div>
            <SectionLabel>Outstanding</SectionLabel>
            <p className="mt-1 text-[14px] font-semibold text-rose-600">
              {formatNaira(loan?.remainingBalance ?? 0)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <SectionLabel>Tenure</SectionLabel>
            <p className="mt-1 text-[13px] text-[#4B5563]">
              {loan?.tenureMonths ? `${loan.tenureMonths} months` : "—"}
            </p>
          </div>
          <div>
            <SectionLabel>Debt Service Ratio</SectionLabel>
            <p
              className={cn(
                "mt-1 text-[13px] font-semibold",
                loan?.exceedsPolicyLimit ? "text-rose-600" : "text-[#4B5563]"
              )}
            >
              {loan?.debtServiceRatio ?? 0}%
              {loan?.exceedsPolicyLimit ? " — above policy limit" : ""}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SectionLabel>Approval Trail</SectionLabel>
          <ol className="mt-3 space-y-4">
            {steps.map((step) => {
              const review = step.review!
              const declined = review.action === "declined"
              return (
                <li key={step.key} className="flex gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      declined ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                    )}
                  >
                    {declined ? <XCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#111827]">{step.title}</div>
                    {review.comment ? (
                      <div className="text-[12px] text-[#6B7280]">{review.comment}</div>
                    ) : null}
                    {review.at ? (
                      <div className="mt-0.5 text-[12px] text-[#9CA3AF]">
                        {formatDate(review.at)}
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}

            {steps.length === 0 ? (
              <li className="text-[13px] text-[#9CA3AF]">
                Awaiting the first review on this application.
              </li>
            ) : null}
          </ol>
        </div>

        {loan?.repayments.length ? (
          <div className="mt-6">
            <SectionLabel>Repayments</SectionLabel>
            <ul className="mt-3 space-y-2">
              {loan.repayments.map((repayment, index) => (
                <li
                  key={`${repayment.reference}-${index}`}
                  className="flex items-center justify-between rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
                >
                  <span className="text-[#4B5563]">{formatDate(repayment.paidAt)}</span>
                  <span className="font-semibold text-[#111827]">
                    {formatNaira(repayment.amount)}
                  </span>
                  <span className="text-[12px] text-[#9CA3AF]">{repayment.reference || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
