"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Bell, ArrowLeft, Download } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrPanelState } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useCurrentPayrollRun, usePayslip } from "@/components/hooks/hr/useHrPayroll"
import { currentPeriod, initials, periodLabel, refId } from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"

type LineItem = { description: string; amount: number }

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("employeeId")
  const period = searchParams.get("period") ?? currentPeriod()
  const branchId = useBranchId()

  /**
   * A payslip is addressed by run + employee, so the current run for this
   * branch and period is resolved first, then the employee's entry within it.
   */
  const run = useCurrentPayrollRun({ branchId, period })
  const runId = run.data?._id ?? null

  const payslipQuery = usePayslip(runId, employeeId)
  const payslip = payslipQuery.data

  const entry = payslip?.payslip
  const employee = payslip?.employee

  const earnings: LineItem[] = useMemo(() => {
    if (!entry) return []
    return [
      { description: "Basic Salary", amount: entry.basicSalary },
      ...(entry.allowances ?? []).map((allowance) => ({
        description: allowance.title,
        amount: allowance.amount,
      })),
    ]
  }, [entry])

  const deductions: LineItem[] = useMemo(() => {
    if (!entry) return []
    return [
      { description: "PAYE Tax", amount: entry.payeDeduction ?? 0 },
      { description: "Pension Contribution", amount: entry.pensionDeduction ?? 0 },
      { description: "Loan Repayment", amount: entry.loanDeduction ?? 0 },
      { description: "Other Deductions", amount: entry.otherDeductions ?? 0 },
    ].filter((item) => item.amount > 0)
  }, [entry])

  const name = entry?.employeeName ?? "—"

  function handleDownload() {
    if (!entry) return
    const csv = rowsToCsv([
      ...earnings.map((item) => ({
        Section: "Earnings",
        Description: item.description,
        Amount: item.amount,
      })),
      ...deductions.map((item) => ({
        Section: "Deductions",
        Description: item.description,
        Amount: item.amount,
      })),
      { Section: "Summary", Description: "Gross Pay", Amount: entry.grossPay },
      { Section: "Summary", Description: "Total Deductions", Amount: entry.totalDeductions },
      { Section: "Summary", Description: "Net Pay", Amount: entry.netPay },
    ])
    downloadCsv(`payslip-${entry.employeeName.replace(/\s+/g, "-")}-${period}.csv`, csv)
  }

  const isLoading = run.isLoading || payslipQuery.isLoading
  const error = run.error ?? payslipQuery.error

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-directory" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-4 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Back + Download row */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payroll List
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!entry}
            className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Payslip
          </button>
        </div>

        {!employeeId ? (
          <HrPanelState
            isLoading={false}
            error={null}
            isEmpty
            emptyTitle="No employee selected"
            emptyDescription="Open a payslip from the Employee Directory."
          />
        ) : !branchId ? (
          <HrPanelState
            isLoading={false}
            error={null}
            isEmpty
            emptyTitle="No branch assigned"
            emptyDescription="Your account needs a branch before payroll can be looked up."
          />
        ) : isLoading || error || !entry ? (
          <HrPanelState
            isLoading={isLoading}
            error={error}
            isEmpty={!entry}
            emptyTitle={`No payslip for ${periodLabel(period)}`}
            emptyDescription="Generate and process the payroll run for this period first."
            onRetry={() => {
              run.refetch()
              payslipQuery.refetch()
            }}
          />
        ) : (
          <>
            {/* Employee card */}
            <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8EDFF] text-[16px] font-bold text-[#3B5BDB]">
                    {initials(name)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[20px] font-bold text-[#111827]">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-[#6B7280]">{entry.jobTitle}</span>
                      <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                        {employee?.employeeId ?? refId(payslip?.branch) ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Pay Period
                  </div>
                  <div className="mt-1 text-[15px] font-bold text-[#111827]">
                    {periodLabel(payslip?.runPeriod ?? period)}
                  </div>
                </div>
              </div>
            </div>

            {/* Final Net Pay Computation card */}
            <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
              <h2 className="text-[16px] font-bold text-[#111827]">Final Net Pay Computation</h2>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Gross Earnings
                  </div>
                  <div className="mt-2 text-[20px] font-bold text-[#111827]">
                    {formatCurrency(entry.grossPay)}
                  </div>
                </div>
                <div className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Total Deductions
                  </div>
                  <div className="mt-2 text-[20px] font-bold text-rose-600">
                    {formatCurrency(entry.totalDeductions)}
                  </div>
                </div>
                <div className="rounded-[12px] bg-[#111827] p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Net Pay (Take Home)
                  </div>
                  <div className="mt-2 text-[20px] font-bold text-white">
                    {formatCurrency(entry.netPay)}
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings + Deductions tables */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <PayslipTable
                title="Earnings"
                items={earnings}
                total={entry.grossPay}
                totalLabel="Gross Earnings"
              />
              <PayslipTable
                title="Deductions"
                items={deductions}
                total={entry.totalDeductions}
                totalLabel="Total Deductions"
                tone="rose"
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function PayslipTable({
  title,
  items,
  total,
  totalLabel,
  tone = "default",
}: {
  title: string
  items: LineItem[]
  total: number
  totalLabel: string
  tone?: "default" | "rose"
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
      <div className="border-b border-[#EEF1F6] p-5">
        <h2 className="text-[16px] font-bold text-[#111827]">{title}</h2>
      </div>
      <table className="w-full text-left">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Description
            </th>
            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F4F6]">
          {items.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-5 py-6 text-center text-[13px] text-[#9CA3AF]">
                Nothing recorded.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.description}>
                <td className="px-5 py-3.5 text-[13px] text-[#4B5563]">{item.description}</td>
                <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#111827]">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))
          )}
          <tr className="bg-[#FAFBFF]">
            <td className="px-5 py-3.5 text-[13px] font-bold text-[#111827]">{totalLabel}</td>
            <td
              className={
                tone === "rose"
                  ? "px-5 py-3.5 text-right text-[13px] font-bold text-rose-600"
                  : "px-5 py-3.5 text-right text-[13px] font-bold text-[#111827]"
              }
            >
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default withSuspense(Page)
