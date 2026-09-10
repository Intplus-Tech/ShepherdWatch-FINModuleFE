"use client"

import { useMemo } from "react"
import { CheckCircle2 } from "lucide-react"
import {
  SectionCard,
  CardHeading,
  StatCard,
  Field,
  ProgressBar,
  StatusBadge,
  Th,
  Td,
} from "./shared"
import { HrPanelState } from "@/components/hr/HrDataState"
import { useEmployee } from "@/components/hooks/hr/useHrEmployees"
import { useLeaveBalances } from "@/components/hooks/hr/useHrLeave"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import { loanBalance, loanProgress } from "@/lib/hr/normalize"
import { formatCurrency, formatDate } from "@/lib/format"

type SalaryRow = { desc: string; amount: number; type: "CREDIT" | "DEBIT" | ""; bold?: boolean }

export default function PayrollTab({ employeeId }: { employeeId: string | null }) {
  const employeeQuery = useEmployee(employeeId)
  const employee = employeeQuery.data

  const loans = useLoans({
    employeeId: employeeId ?? undefined,
    limit: 50,
    enabled: Boolean(employeeId),
  })
  const balances = useLeaveBalances(employeeId)

  const activeLoans = useMemo(
    () =>
      (loans.data?.items ?? []).filter(
        (loan) => loan.status === "active" || loan.status === "approved",
      ),
    [loans.data],
  )

  const outstanding = activeLoans.reduce((sum, loan) => sum + loanBalance(loan), 0)

  const leaveRemaining = (balances.data?.balances ?? []).reduce(
    (sum, row) => sum + row.remaining,
    0,
  )

  /**
   * The salary breakdown comes from the stored profile, not a payroll run —
   * statutory deductions are computed at run time, so only the earnings side
   * can be shown here. The payslip screen carries the full computation.
   */
  const salaryRows = useMemo<SalaryRow[]>(() => {
    if (!employee) return []
    const allowances = employee.allowances ?? []
    const basic = employee.salary ?? 0
    const allowanceTotal = allowances.reduce((sum, item) => sum + (item.amount ?? 0), 0)

    return [
      { desc: "Basic Salary", amount: basic, type: "CREDIT" },
      ...allowances.map(
        (item): SalaryRow => ({ desc: item.title, amount: item.amount, type: "CREDIT" }),
      ),
      { desc: "Gross Pay", amount: basic + allowanceTotal, type: "", bold: true },
      ...activeLoans.map(
        (loan): SalaryRow => ({
          desc: `Loan Deduction — ${loan.purpose}`,
          amount: loan.monthlyDeduction,
          type: "DEBIT",
        }),
      ),
    ]
  }, [employee, activeLoans])

  if (employeeQuery.isLoading || employeeQuery.error || !employee) {
    return (
      <HrPanelState
        isLoading={employeeQuery.isLoading}
        error={employeeQuery.error}
        isEmpty={!employee}
        emptyTitle="No employee selected"
        emptyDescription="Open a profile from the Employee Directory."
        onRetry={() => employeeQuery.refetch()}
      />
    )
  }

  const bank = employee.bankDetails
  const assets = employee.assets ?? []
  const primaryLoan = activeLoans[0]

  const monthlyDeductions = activeLoans.reduce(
    (sum, loan) => sum + (loan.monthlyDeduction ?? 0),
    0,
  )
  const grossPay =
    (employee.salary ?? 0) +
    (employee.allowances ?? []).reduce((sum, item) => sum + (item.amount ?? 0), 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Leave Balance"
          value={balances.isLoading ? "—" : `${leaveRemaining} Days`}
          sub="Across all leave types"
        />
        <StatCard
          label="Gross Monthly Pay"
          value={formatCurrency(grossPay, { maximumFractionDigits: 0 })}
          sub={`Less ${formatCurrency(monthlyDeductions, { maximumFractionDigits: 0 })} loan deductions`}
        />
        <StatCard
          label="Active Loans"
          value={loans.isLoading ? "—" : formatCurrency(outstanding, { maximumFractionDigits: 0 })}
          sub="Outstanding Balance"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Salary breakdown */}
        <SectionCard className="lg:col-span-2">
          <CardHeading>Salary Structure</CardHeading>
          <p className="mt-1 text-[12px] text-[#9CA3AF]">
            Earnings and standing deductions on record. Statutory tax and pension are computed
            when payroll is run.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <Th>Item Description</Th>
                  <Th className="text-right">Amount (₦)</Th>
                  <Th>Type</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {salaryRows.map((row, index) => (
                  <tr key={`${row.desc}-${index}`}>
                    <Td className={row.bold ? "font-bold text-[#111827]" : "text-[#4B5563]"}>
                      {row.desc}
                    </Td>
                    <Td
                      className={
                        row.bold
                          ? "text-right font-bold text-[#111827]"
                          : "text-right text-[#4B5563]"
                      }
                    >
                      {row.type === "DEBIT"
                        ? `(${formatCurrency(row.amount, { maximumFractionDigits: 0 })})`
                        : formatCurrency(row.amount, { maximumFractionDigits: 0 })}
                    </Td>
                    <Td>{row.type ? <StatusBadge status={row.type} /> : null}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Disbursement Info */}
          <SectionCard>
            <CardHeading>Disbursement Info</CardHeading>
            {!bank?.bankName ? (
              <HrPanelState
                isLoading={false}
                error={null}
                isEmpty
                emptyTitle="No bank details"
                emptyDescription="Add them when editing this employee record."
                className="mt-4 border-0 p-4"
              />
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <Field label="Primary Bank" value={bank.bankName} />
                <Field label="Account Name" value={bank.accountName || "—"} />
                <Field label="Account Number" value={bank.accountNumber || "—"} />
                <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Bank details on file
                </div>
              </div>
            )}
          </SectionCard>

          {/* Active Loan */}
          <SectionCard>
            <div className="flex items-center justify-between">
              <CardHeading>Active Loan</CardHeading>
              {primaryLoan && <StatusBadge status="IN PROGRESS" />}
            </div>
            {!primaryLoan ? (
              <HrPanelState
                isLoading={loans.isLoading}
                error={loans.error}
                isEmpty={!loans.isLoading}
                emptyTitle="No active loan"
                emptyDescription="Approved loans appear here."
                onRetry={() => loans.refetch()}
                className="mt-4 border-0 p-4"
              />
            ) : (
              <div className="mt-4">
                <div className="text-[14px] font-semibold text-[#111827]">
                  {primaryLoan.purpose}
                </div>
                {primaryLoan.disbursedAt && (
                  <div className="text-[12px] text-[#6B7280]">
                    Disbursed {formatDate(primaryLoan.disbursedAt, "medium")}
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Field
                    label="Principal"
                    value={formatCurrency(primaryLoan.amount, { maximumFractionDigits: 0 })}
                  />
                  <Field
                    label="Monthly"
                    value={formatCurrency(primaryLoan.monthlyDeduction, {
                      maximumFractionDigits: 0,
                    })}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span>Repayment Progress</span>
                  <span className="font-semibold text-[#111827]">
                    {loanProgress(primaryLoan)}%
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={loanProgress(primaryLoan)} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span>
                    Balance:{" "}
                    {formatCurrency(loanBalance(primaryLoan), { maximumFractionDigits: 0 })}
                  </span>
                  <span>{primaryLoan.tenureMonths} month term</span>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Assets Allocated */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Assets Allocated</CardHeading>
        </div>
        {assets.length === 0 ? (
          <HrPanelState
            isLoading={false}
            error={null}
            isEmpty
            emptyTitle="No assets assigned"
            emptyDescription="Assets issued to this employee will be listed here."
            className="border-0 border-t border-[#EEF1F6] p-6"
          />
        ) : (
          <div className="overflow-x-auto border-t border-[#EEF1F6]">
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <Th>Asset Name</Th>
                  <Th>Serial No.</Th>
                  <Th>Date Issued</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {assets.map((asset, index) => (
                  <tr key={`${asset.name}-${index}`}>
                    <Td className="font-semibold text-[#111827]">{asset.name}</Td>
                    <Td className="text-[#4B5563]">{asset.serialNumber || "—"}</Td>
                    <Td className="text-[#4B5563]">
                      {asset.issuedDate ? formatDate(asset.issuedDate, "medium") : "—"}
                    </Td>
                    <Td>
                      <StatusBadge status={(asset.status ?? "assigned").toUpperCase()} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
