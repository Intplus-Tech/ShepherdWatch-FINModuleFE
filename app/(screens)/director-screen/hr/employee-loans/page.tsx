"use client"

import { useMemo, useState } from "react"
import { Search, Download, Eye, Loader2 } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ApproveLoanOverrideModal from "@/components/hr/ApproveLoanOverrideModal"
import BranchLeadLoanFinalApprovalModal from "@/components/hr/BranchLeadLoanFinalApprovalModal"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import {
  LOAN_STATUS_BADGES,
  LOAN_STATUS_LABELS,
  badgeFor,
  branchName,
  deref,
  employeeName,
  loanBalance,
  lookup,
} from "@/lib/hr/normalize"
import { LOAN_STATUSES, type EmployeeLoan, type LoanStatus } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const ALL_BRANCHES = "All Branches"

/** Above this ratio the facility needs a director override, not a plain approval. */
const DSR_THRESHOLD = 33

export default function Page() {
  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES)
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("pending_director")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [decisionOpen, setDecisionOpen] = useState<"approved" | "declined" | null>(null)
  const [page, setPage] = useState(1)

  const loans = useLoans({ page, limit: PAGE_SIZE, status: statusFilter })

  const items = useMemo(() => loans.data?.items ?? [], [loans.data])

  const branchOptions = useMemo(
    () => [ALL_BRANCHES, ...Array.from(new Set(items.map((l) => branchName(l.branchId))))],
    [items],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((loan) => {
      if (branchFilter !== ALL_BRANCHES && branchName(loan.branchId) !== branchFilter) {
        return false
      }
      if (query && !employeeName(loan.employeeId).toLowerCase().includes(query)) return false
      return true
    })
  }, [items, branchFilter, search])

  const selected: EmployeeLoan | null =
    filtered.find((loan) => loan._id === selectedId) ?? filtered[0] ?? null

  const needsOverride = selected ? selected.debtServiceRatio > DSR_THRESHOLD : false

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((loan) => {
        const employee = deref(loan.employeeId)
        return {
          Employee: employeeName(loan.employeeId),
          "Employee ID": employee?.employeeId ?? "",
          Branch: branchName(loan.branchId),
          Purpose: loan.purpose,
          Amount: loan.amount,
          Monthly: loan.monthlyDeduction,
          "Debt Service Ratio": loan.debtServiceRatio,
          Status: lookup(LOAN_STATUS_LABELS, loan.status),
        }
      }),
    )
    downloadCsv(`loan-approvals-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-loans"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Employee Loans
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Facilities awaiting director approval
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by employee..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | LoanStatus)
                    setPage(1)
                    setSelectedId(null)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  <option value="all">All Statuses</option>
                  {LOAN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LOAN_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Table */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Employee", "Branch", "Amount", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                        >
                          {h}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Review
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    <HrTableState
                      colSpan={5}
                      isLoading={loans.isLoading}
                      error={loans.error}
                      isEmpty={filtered.length === 0}
                      emptyTitle="Nothing awaiting your approval"
                      emptyDescription="Loans escalate to you after the pastor's decision."
                      onRetry={() => loans.refetch()}
                    />

                    {!loans.isLoading &&
                      !loans.error &&
                      filtered.map((loan) => {
                        const employee = deref(loan.employeeId)
                        return (
                          <tr
                            key={loan._id}
                            onClick={() => setSelectedId(loan._id)}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-[#F8FAFC]",
                              selected?._id === loan._id &&
                                "border-l-2 border-[#111827] bg-[#F8FAFC]",
                            )}
                          >
                            <td className="px-4 py-4 text-[13px]">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#111827]">
                                  {employeeName(loan.employeeId)}
                                </span>
                                <span className="text-[12px] text-[#6B7280]">
                                  ID: {employee?.employeeId ?? "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                              {branchName(loan.branchId)}
                            </td>
                            <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                              {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-4 text-[13px]">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                  badgeFor(LOAN_STATUS_BADGES, loan.status),
                                )}
                              >
                                {lookup(LOAN_STATUS_LABELS, loan.status)}
                              </span>
                              {loan.debtServiceRatio > DSR_THRESHOLD && (
                                <span className="ml-1.5 inline-flex rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
                                  DSR {Math.round(loan.debtServiceRatio)}%
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-[13px]">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  aria-label={`Review ${employeeName(loan.employeeId)}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedId(loan._id)
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              <HrPagination
                pagination={loans.data?.pagination}
                page={page}
                onPageChange={setPage}
                itemCount={items.length}
                noun="loan requests"
              />
            </div>

            {/* Detail panel */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-1">
              <div className="border-b border-[#EEF1F6] p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Request Detail</h2>
              </div>

              {selected ? (
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Purpose
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {selected.purpose}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Tenure
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {selected.tenureMonths} months
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Financial Breakdown
                  </div>
                  <div className="mt-3 divide-y divide-[#EEF1F6] rounded-lg border border-[#EEF1F6]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">Total Principal</span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatCurrency(selected.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">Monthly Repayment</span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatCurrency(selected.monthlyDeduction)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">Debt Service Ratio</span>
                      <span
                        className={cn(
                          "text-[13px] font-bold",
                          needsOverride ? "text-rose-600" : "text-emerald-600",
                        )}
                      >
                        {Math.round(selected.debtServiceRatio * 100) / 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">Outstanding</span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatCurrency(loanBalance(selected))}
                      </span>
                    </div>
                  </div>

                  {selected.accountantReview?.comment && (
                    <>
                      <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Accountant Review
                      </div>
                      <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
                        &ldquo;{selected.accountantReview.comment}&rdquo;
                      </blockquote>
                    </>
                  )}

                  {needsOverride && (
                    <p className="mt-4 rounded-md bg-amber-50 p-3 text-[12px] text-amber-700">
                      This facility exceeds the {DSR_THRESHOLD}% debt-service policy. Approving
                      it requires a recorded override.
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDecisionOpen("declined")}
                      className="rounded-md border border-rose-200 px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      REJECT
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        needsOverride ? setOverrideOpen(true) : setDecisionOpen("approved")
                      }
                      className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
                    >
                      {needsOverride ? "OVERRIDE & APPROVE" : "APPROVE LOAN"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-[13px] text-[#6B7280]">
                  {loans.isLoading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Select a loan request to view its details."
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ApproveLoanOverrideModal
        open={overrideOpen}
        loan={selected}
        onClose={() => setOverrideOpen(false)}
      />
      <BranchLeadLoanFinalApprovalModal
        open={decisionOpen !== null}
        loan={selected}
        intent={decisionOpen ?? "approved"}
        onClose={() => setDecisionOpen(null)}
      />
    </div>
  )
}
