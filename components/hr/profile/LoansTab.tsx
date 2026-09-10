"use client"

import { useMemo } from "react"
import { Plus, Eye } from "lucide-react"
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
import { HrPanelState, HrTableState } from "@/components/hr/HrDataState"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import {
  LOAN_STATUS_LABELS,
  loanBalance,
  loanProgress,
  lookup,
} from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"

export default function LoansTab({
  employeeId,
  onNewLoan,
  onViewLoan,
}: {
  employeeId: string | null
  onNewLoan: () => void
  onViewLoan: (loan: EmployeeLoan) => void
}) {
  const loans = useLoans({
    employeeId: employeeId ?? undefined,
    limit: 50,
    enabled: Boolean(employeeId),
  })

  const items = useMemo(() => loans.data?.items ?? [], [loans.data])

  /** The two most recent live facilities get the summary cards. */
  const active = useMemo(
    () =>
      items
        .filter((loan) => loan.status === "active" || loan.status === "approved")
        .sort(
          (a, b) =>
            new Date(b.disbursedAt ?? b.createdAt ?? 0).getTime() -
            new Date(a.disbursedAt ?? a.createdAt ?? 0).getTime(),
        ),
    [items],
  )

  const [primary, secondary] = active

  return (
    <div className="flex flex-col gap-5">
      {/* Active Loan Summary */}
      {active.length === 0 ? (
        <HrPanelState
          isLoading={loans.isLoading}
          error={loans.error}
          isEmpty={!loans.isLoading && !loans.error}
          emptyTitle="No active loans"
          emptyDescription="Approved facilities appear here with their repayment progress."
          onRetry={() => loans.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* White card — primary facility */}
          <SectionCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardHeading>{primary.purpose}</CardHeading>
                <div className="mt-0.5 text-[12px] text-[#6B7280]">
                  {primary.tenureMonths} month term
                </div>
              </div>
              <StatusBadge status={lookup(LOAN_STATUS_LABELS, primary.status).toUpperCase()} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <Field
                label="Principal"
                value={formatCurrency(primary.amount, { maximumFractionDigits: 0 })}
              />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Outstanding
                </div>
                <div className="mt-1 text-[14px] font-semibold text-rose-600">
                  {formatCurrency(loanBalance(primary), { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Repaid
                </div>
                <div className="mt-1 text-[14px] font-semibold text-emerald-600">
                  {loanProgress(primary)}%
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar percent={loanProgress(primary)} tone="emerald" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-[#6B7280]">
              <span>
                {primary.disbursedAt
                  ? `Disbursed: ${formatDate(primary.disbursedAt, "medium")}`
                  : "Not yet disbursed"}
              </span>
              <span>
                {formatCurrency(primary.monthlyDeduction, { maximumFractionDigits: 0 })} / month
              </span>
            </div>
          </SectionCard>

          {/* Dark card — second facility, when there is one */}
          {secondary ? (
            <div className="rounded-xl bg-[#111827] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[16px] font-bold">{secondary.purpose}</div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  {lookup(LOAN_STATUS_LABELS, secondary.status).toUpperCase()}
                </span>
              </div>
              <div className="mt-6">
                <div className="text-[11px] text-white/60">Monthly Deduction</div>
                <div className="text-[18px] font-bold">
                  {formatCurrency(secondary.monthlyDeduction, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-white/60">Debt Service Ratio</div>
                  <div className="text-[14px] font-semibold">
                    {Math.round(secondary.debtServiceRatio * 100) / 100}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-white/60">Outstanding</div>
                  <div className="text-[14px] font-semibold">
                    {formatCurrency(loanBalance(secondary), { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#111827] p-5 text-white">
              <div className="text-[16px] font-bold">Repayment Summary</div>
              <div className="mt-6">
                <div className="text-[11px] text-white/60">Total Monthly Deduction</div>
                <div className="text-[18px] font-bold">
                  {formatCurrency(
                    active.reduce((sum, loan) => sum + loan.monthlyDeduction, 0),
                    { maximumFractionDigits: 0 },
                  )}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-white/60">Active Facilities</div>
                  <div className="text-[14px] font-semibold">{active.length}</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/60">Total Outstanding</div>
                  <div className="text-[14px] font-semibold">
                    {formatCurrency(
                      active.reduce((sum, loan) => sum + loanBalance(loan), 0),
                      { maximumFractionDigits: 0 },
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Purpose</Th>
                <Th>Amount</Th>
                <Th>Monthly</Th>
                <Th>Applied</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              <HrTableState
                colSpan={6}
                isLoading={loans.isLoading}
                error={loans.error}
                isEmpty={items.length === 0}
                emptyTitle="No loan applications"
                emptyDescription="Applications filed for this employee appear here."
                onRetry={() => loans.refetch()}
              />

              {!loans.isLoading &&
                !loans.error &&
                items.map((loan) => (
                  <tr key={loan._id}>
                    <Td className="font-semibold text-[#111827]">{loan.purpose}</Td>
                    <Td className="text-[#4B5563]">
                      {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                    </Td>
                    <Td className="text-[#4B5563]">
                      {formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })}
                    </Td>
                    <Td className="text-[#4B5563]">{formatDate(loan.createdAt, "medium")}</Td>
                    <Td>
                      <StatusBadge
                        status={lookup(LOAN_STATUS_LABELS, loan.status).toUpperCase()}
                      />
                    </Td>
                    <Td>
                      <button
                        onClick={() => onViewLoan(loan)}
                        aria-label={`View ${loan.purpose}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#3B5BDB]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
