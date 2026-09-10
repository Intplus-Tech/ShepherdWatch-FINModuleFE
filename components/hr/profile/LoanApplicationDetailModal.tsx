"use client"

import { X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import {
  CardHeading,
  Field,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
  btnOutline,
} from "./shared"
import { HrPanelState } from "@/components/hr/HrDataState"
import {
  LOAN_STATUS_LABELS,
  employeeName,
  loanBalance,
  loanProgress,
  lookup,
  titleCase,
  userName,
} from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"

/** Read-only view of one loan facility and its repayment ledger. */
export default function LoanApplicationDetailModal({
  loan,
  onClose,
}: {
  loan: EmployeeLoan | null
  onClose: () => void
}) {
  const repayments = [...(loan?.repayments ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <ModalShell open={loan !== null} onClose={onClose} className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">Loan Application</h2>
          {loan && (
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {employeeName(loan.employeeId)}
            </p>
          )}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {!loan ? (
          <HrPanelState
            isLoading={false}
            error={null}
            isEmpty
            emptyTitle="No loan selected"
            className="border-0 p-4"
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <CardHeading>{loan.purpose}</CardHeading>
              <StatusBadge status={lookup(LOAN_STATUS_LABELS, loan.status).toUpperCase()} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field
                label="Principal"
                value={formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
              />
              <Field
                label="Monthly"
                value={formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })}
              />
              <Field label="Tenure" value={`${loan.tenureMonths} months`} />
              <Field
                label="DSR"
                value={`${Math.round(loan.debtServiceRatio * 100) / 100}%`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>Repayment Progress</span>
                <span className="font-semibold text-[#111827]">{loanProgress(loan)}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar percent={loanProgress(loan)} tone="emerald" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>
                  Repaid:{" "}
                  {formatCurrency(loan.totalRepaid ?? 0, { maximumFractionDigits: 0 })}
                </span>
                <span>
                  Balance: {formatCurrency(loanBalance(loan), { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {loan.accountantReview?.comment && (
              <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Accountant Review
                </div>
                <p className="mt-1 text-[12px] text-[#4B5563]">
                  {loan.accountantReview.comment}
                  {loan.accountantReview.timestamp
                    ? ` (${formatDate(loan.accountantReview.timestamp, "medium")})`
                    : ""}
                </p>
              </div>
            )}

            {(loan.approvals?.length ?? 0) > 0 && (
              <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Approvals
                </div>
                <ul className="mt-2 space-y-1.5">
                  {loan.approvals?.map((approval, index) => (
                    <li key={index} className="text-[12px] text-[#4B5563]">
                      <span className="font-semibold text-[#111827]">
                        {titleCase(approval.role)}:
                      </span>{" "}
                      {approval.action}
                      {approval.userId ? ` by ${userName(approval.userId)}` : ""}
                      {approval.comment ? ` — ${approval.comment}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {loan.declineReason && (
              <p className="rounded-md bg-rose-50 p-3 text-[12px] text-rose-700">
                {loan.declineReason}
              </p>
            )}

            {/* Repayment ledger */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Repayments
              </div>
              {repayments.length === 0 ? (
                <p className="mt-2 text-[12px] text-[#9CA3AF]">
                  No repayments recorded yet.
                </p>
              ) : (
                <div className="mt-2 overflow-hidden rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <Th>Date</Th>
                        <Th className="text-right">Amount</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {repayments.map((repayment, index) => (
                        <tr key={`${repayment.date}-${index}`}>
                          <Td className="text-[#4B5563]">
                            {formatDate(repayment.date, "medium")}
                          </Td>
                          <Td className="text-right font-semibold text-[#111827]">
                            {formatCurrency(repayment.amount, { maximumFractionDigits: 0 })}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {(loan.supportingDocumentUrls?.length ?? 0) > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Supporting Documents
                </div>
                <ul className="mt-2 space-y-1.5">
                  {loan.supportingDocumentUrls?.map((url, index) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] font-semibold text-[#3B5BDB] hover:underline"
                      >
                        Document {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
