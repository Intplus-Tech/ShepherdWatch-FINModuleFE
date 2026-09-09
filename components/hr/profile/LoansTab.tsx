"use client"

import { Plus, Download, Eye } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  Field,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
  btnPrimary,
} from "./shared"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
import { LOAN_STATUS_LABELS, formatDate, formatNaira, statusLabel } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import type { HrLoan } from "@/lib/hr/types"

export default function LoansTab({
  employeeId,
  onNewLoan,
  onViewLoan,
}: {
  employeeId: string
  onNewLoan: () => void
  onViewLoan: (loan: HrLoan) => void
}) {
  const { pushToast } = useToast()
  const { loans, loading, error } = useHrLoans({ employeeId, limit: 50 })

  // The two summary cards show the running facilities; everything else is
  // history below.
  const running = loans.filter((loan) => loan.status === "active")
  const primary = running[0] ?? loans[0] ?? null
  const secondary = running[1] ?? null

  const repaidPercent = (loan: HrLoan) =>
    loan.amount ? Math.round(((loan.amount - loan.remainingBalance) / loan.amount) * 1000) / 10 : 0

  const installmentsLeft = (loan: HrLoan) =>
    loan.monthlyDeduction > 0 ? Math.ceil(loan.remainingBalance / loan.monthlyDeduction) : 0

  const handleExport = () => {
    const exported = exportHrRows(
      "employee-loans",
      loans.map((loan) => ({
        Purpose: loan.purpose,
        Amount: loan.amount,
        "Monthly Deduction": loan.monthlyDeduction,
        Outstanding: loan.remainingBalance,
        Applied: formatDate(loan.createdAt),
        Status: statusLabel(LOAN_STATUS_LABELS, loan.status),
      }))
    )
    if (!exported) pushToast("No loans to export", "info")
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Active Loan Summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* White card */}
        <SectionCard>
          {primary ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardHeading>{primary.purpose || "Staff loan"}</CardHeading>
                  <div className="mt-0.5 text-[12px] text-[#6B7280]">
                    Applied {formatDate(primary.createdAt)}
                  </div>
                </div>
                <StatusBadge status={statusLabel(LOAN_STATUS_LABELS, primary.status).toUpperCase()} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <Field label="Principal" value={formatNaira(primary.amount)} />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Outstanding
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-rose-600">
                    {formatNaira(primary.remainingBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Repaid
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-emerald-600">
                    {repaidPercent(primary)}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar percent={repaidPercent(primary)} tone="emerald" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-[#6B7280]">
                <span>Tenure: {primary.tenureMonths} months</span>
                <span>
                  {installmentsLeft(primary)} installment
                  {installmentsLeft(primary) === 1 ? "" : "s"} left
                </span>
              </div>
            </>
          ) : (
            <>
              <CardHeading>No Active Facility</CardHeading>
              <p className="mt-3 text-[13px] text-[#9CA3AF]">
                {loading ? "Loading loans…" : error || "This staff member has no loans on record."}
              </p>
            </>
          )}
        </SectionCard>

        {/* Dark card */}
        <div className="rounded-xl bg-[#111827] p-5 text-white">
          {secondary ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="text-[16px] font-bold">{secondary.purpose || "Staff loan"}</div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  {statusLabel(LOAN_STATUS_LABELS, secondary.status).toUpperCase()}
                </span>
              </div>
              <div className="mt-6">
                <div className="text-[11px] text-white/60">Monthly Deduction</div>
                <div className="text-[18px] font-bold">
                  {formatNaira(secondary.monthlyDeduction)}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-white/60">Debt Service Ratio</div>
                  <div className="text-[14px] font-semibold">{secondary.debtServiceRatio}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/60">Installments Remaining</div>
                  <div className="text-[14px] font-semibold">
                    {installmentsLeft(secondary)} of {secondary.tenureMonths}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-[16px] font-bold">Welfare Exposure</div>
              <div className="mt-6">
                <div className="text-[11px] text-white/60">Total Outstanding</div>
                <div className="text-[18px] font-bold">
                  {formatNaira(running.reduce((sum, loan) => sum + loan.remainingBalance, 0))}
                </div>
              </div>
              <p className="mt-5 text-[13px] text-white/70">
                {running.length
                  ? `${running.length} running facility${running.length === 1 ? "" : "s"}.`
                  : "No running facilities."}
              </p>
            </>
          )}
        </div>
      </div>

      {/* New loan button */}
      <div className="flex justify-end">
        <button className={btnPrimary} onClick={onNewLoan}>
          <Plus className="h-4 w-4" />
          New Loan Application
        </button>
      </div>

      {/* Loan Application History */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Loan Application History</CardHeading>
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <button aria-label="Download" onClick={handleExport} className="hover:text-[#3B5BDB]">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Purpose</Th>
                <Th>Amount</Th>
                <Th>Monthly</Th>
                <Th>Applied Date</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <Td className="font-semibold text-[#111827]">{loan.purpose || "Staff loan"}</Td>
                  <Td className="text-[#4B5563]">{formatNaira(loan.amount)}</Td>
                  <Td className="text-[#4B5563]">{formatNaira(loan.monthlyDeduction)}</Td>
                  <Td className="text-[#4B5563]">{formatDate(loan.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={statusLabel(LOAN_STATUS_LABELS, loan.status).toUpperCase()} />
                  </Td>
                  <Td>
                    <button
                      onClick={() => onViewLoan(loan)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3B5BDB] hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </Td>
                </tr>
              ))}

              {!loading && loans.length === 0 ? (
                <tr>
                  <Td className="text-[#9CA3AF]">No loan applications on record.</Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3">
          <span className="text-[12px] text-[#6B7280]">
            Showing {loans.length} record{loans.length === 1 ? "" : "s"}
          </span>
        </div>
      </SectionCard>
    </div>
  )
}
