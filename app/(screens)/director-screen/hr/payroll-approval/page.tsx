"use client"

import { useMemo, useState } from "react"
import { Search, Download, AlertTriangle, Users, Loader2 } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrPanelState, HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useAuthorizePayrollRun,
  usePayrollOverview,
} from "@/components/hooks/hr/useHrPayroll"
import {
  PAYROLL_RUN_STATUS_BADGES,
  PAYROLL_RUN_STATUS_LABELS,
  badgeFor,
  branchName,
  currentPeriod,
  lookup,
  periodLabel,
} from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Last twelve periods, newest first, for the period picker. */
function recentPeriods(count = 12): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return currentPeriod(date)
  })
}

export default function Page() {
  const [period, setPeriod] = useState(currentPeriod())
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [actionError, setActionError] = useState<string | null>(null)
  const [authorizingId, setAuthorizingId] = useState<string | null>(null)

  const overview = usePayrollOverview({ period })
  const authorize = useAuthorizePayrollRun()

  const runs = useMemo(() => overview.data?.branchRuns ?? [], [overview.data])
  const summary = overview.data?.summary

  const branchOptions = useMemo(
    () => ["All Branches", ...Array.from(new Set(runs.map((run) => branchName(run.branchId))))],
    [runs],
  )

  const filtered = useMemo(
    () =>
      branchFilter === "All Branches"
        ? runs
        : runs.filter((run) => branchName(run.branchId) === branchFilter),
    [runs, branchFilter],
  )

  const deductionShare =
    summary && summary.totalGross > 0
      ? Math.round((summary.totalDeductions / summary.totalGross) * 1000) / 10
      : 0

  async function handleAuthorize(id: string) {
    setActionError(null)
    setAuthorizingId(id)
    try {
      await authorize.mutateAsync({ id })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    } finally {
      setAuthorizingId(null)
    }
  }

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((run) => ({
        Branch: branchName(run.branchId),
        Period: run.period,
        Status: lookup(PAYROLL_RUN_STATUS_LABELS, run.status),
        "Staff Count": run.totalEmployees ?? 0,
        "Gross Pay": run.totalGross ?? 0,
        Deductions: run.totalDeductions ?? 0,
        "Net Payable": run.totalNet ?? 0,
      })),
    )
    downloadCsv(`payroll-${period}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/payroll-approval"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Payroll Approval
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Authorize branch payroll runs for disbursement
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  {recentPeriods().map((value) => (
                    <option key={value} value={value}>
                      {periodLabel(value)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  {branchOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative lg:ml-auto">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search employees, IDs..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
            </div>
          </div>

          {/* Notice banner */}
          <div className="mb-6 flex items-center gap-3 rounded bg-amber-50 border-l-4 border-amber-400 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="text-[13px] font-bold text-[#111827]">
              Payroll Summary for {periodLabel(period)}
            </span>
          </div>

          {overview.isLoading || overview.error || !summary ? (
            <HrPanelState
              isLoading={overview.isLoading}
              error={overview.error}
              isEmpty={!summary}
              emptyTitle={`No payroll for ${periodLabel(period)}`}
              emptyDescription="Branch accountants generate runs before they reach you."
              onRetry={() => overview.refetch()}
            />
          ) : (
            <>
              {/* Stat cards */}
              <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <Users className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-[#F1F3F9]" />
                  <div className="text-[12px] font-semibold text-[#6B7280]">
                    Total Employees
                  </div>
                  <div className="mt-2 text-[28px] font-bold text-[#111827]">
                    {summary.totalEmployees}
                  </div>
                  <div className="mt-1 text-[12px] text-[#9CA3AF]">
                    across {summary.totalBranches} branch
                    {summary.totalBranches === 1 ? "" : "es"}
                  </div>
                </div>

                <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <div className="text-[12px] font-semibold text-[#6B7280]">Total Gross Pay</div>
                  <div className="mt-2 text-[28px] font-bold text-[#111827]">
                    {formatCurrency(summary.totalGross, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                    <div
                      className="h-full rounded-full bg-[#3B5BDB]"
                      style={{
                        width: `${
                          summary.totalGross > 0
                            ? Math.min(100, (summary.totalNet / summary.totalGross) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <div className="text-[12px] font-semibold text-[#6B7280]">
                    Total Deductions
                  </div>
                  <div className="mt-2 text-[28px] font-bold text-rose-600">
                    {formatCurrency(summary.totalDeductions, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">
                    {deductionShare}% of Gross
                  </div>
                </div>

                <div className="rounded-xl border border-[#111827] bg-[#111827] p-5 text-white">
                  <div className="text-[12px] font-semibold text-white/70">Net Pay Payable</div>
                  <div className="mt-2 text-[28px] font-bold text-white">
                    {formatCurrency(summary.totalNet, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-1 text-[12px] text-white/60">
                    {runs.filter((r) => r.status === "submitted").length} run(s) awaiting
                    authorization
                  </div>
                </div>
              </div>

              {/* Payroll Breakdown by Branch */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    Payroll Breakdown by Branch
                  </h2>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={filtered.length === 0}
                    className="flex items-center gap-2 text-[13px] font-semibold text-[#111827] hover:text-[#3B5BDB] disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Export Detailed CSV
                  </button>
                </div>

                {actionError && (
                  <p className="border-b border-[#EEF1F6] px-5 py-3 text-[12px] font-medium text-red-600">
                    {actionError}
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        {[
                          "Branch/Unit",
                          "Status",
                          "Staff Count",
                          "Gross Pay",
                          "Deductions",
                          "Net Payable",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                          >
                            {h}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      <HrTableState
                        colSpan={7}
                        isLoading={false}
                        error={null}
                        isEmpty={filtered.length === 0}
                        emptyTitle="No runs for this period"
                        emptyDescription="Branch accountants generate runs before they reach you."
                      />

                      {filtered.map((run) => (
                        <tr key={run._id}>
                          <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                            {branchName(run.branchId)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                badgeFor(PAYROLL_RUN_STATUS_BADGES, run.status),
                              )}
                            >
                              {lookup(PAYROLL_RUN_STATUS_LABELS, run.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {run.totalEmployees ?? 0}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatCurrency(run.totalGross ?? 0, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatCurrency(run.totalDeductions ?? 0, {
                              maximumFractionDigits: 0,
                            })}
                          </td>
                          <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                            {formatCurrency(run.totalNet ?? 0, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex justify-end">
                              {run.status === "submitted" ? (
                                <button
                                  type="button"
                                  onClick={() => handleAuthorize(run._id)}
                                  disabled={authorize.isPending}
                                  className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
                                >
                                  {authorizingId === run._id && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  )}
                                  Authorize
                                </button>
                              ) : (
                                <span className="text-[12px] text-[#9CA3AF]">
                                  {run.status === "disbursed" ? "Disbursed" : "Not submitted"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
