"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ClipboardCheck, Eye } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAcctNewLoanModal from "@/components/hr/BranchAcctNewLoanModal"
import AccountantReviewLoanModal from "@/components/hr/AccountantReviewLoanModal"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import {
  LOAN_STATUS_BADGES,
  LOAN_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  loanBalance,
  lookup,
} from "@/lib/hr/normalize"
import { LOAN_STATUSES, type EmployeeLoan, type LoanStatus } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function Page() {
  const router = useRouter()
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [reviewLoan, setReviewLoan] = useState<EmployeeLoan | null>(null)
  const [page, setPage] = useState(1)

  const loans = useLoans({ page, limit: PAGE_SIZE, status: statusFilter })

  /** The loans list endpoint has no free-text search, so this filters locally. */
  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    const items = loans.data?.items ?? []
    if (!query) return items
    return items.filter((loan) => employeeName(loan.employeeId).toLowerCase().includes(query))
  }, [loans.data, nameFilter])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-loans" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative w-[280px] max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-full border border-transparent bg-white pl-9 pr-3 text-[13px] font-medium text-[#4B5563] placeholder:text-[#9CA3AF] outline-none focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280] transition-colors hover:bg-gray-50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          <h1 className="text-[16px] font-bold text-[#111827]">Employee Loans</h1>

          {/* Toolbar card */}
          <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search staff name..."
                    className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB] sm:w-[240px]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | LoanStatus)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#4B5563] outline-none focus-visible:border-[#3B5BDB]"
                >
                  <option value="all">All Status</option>
                  {LOAN_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {LOAN_STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
              >
                New Loan Application
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EEF2FF]">
                  <tr>
                    {[
                      "Employee Name",
                      "Job Title",
                      "Total Amount (₦)",
                      "Monthly (₦)",
                      "Balance (₦)",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={7}
                    isLoading={loans.isLoading}
                    error={loans.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="No loans yet"
                    emptyDescription="Loan applications appear here once staff apply."
                    onRetry={() => loans.refetch()}
                  />

                  {!loans.isLoading &&
                    !loans.error &&
                    filtered.map((loan) => {
                      const employee = deref(loan.employeeId)
                      const name = employeeName(loan.employeeId)
                      // Accountant review is the first gate, before the pastor sees it.
                      const needsReview =
                        loan.status === "pending_pastor" && !loan.accountantReview?.isVerified
                      return (
                        <tr key={loan._id} className="transition-colors hover:bg-[#F9FAFB]">
                          <td className="px-4 py-5 text-[13px]">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                                {initials(name)}
                              </div>
                              <div>
                                <div className="font-bold text-[#111827]">{name}</div>
                                <div className="text-[12px] text-[#6B7280]">
                                  {employee?.employeeId ?? "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                            {employee?.jobTitle ?? "—"}
                          </td>
                          <td className="px-4 py-5 text-[13px] text-[#111827]">
                            {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                            {formatCurrency(loan.monthlyDeduction, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-5 text-[13px] font-bold text-[#111827]">
                            {formatCurrency(loanBalance(loan), { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-5 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                badgeFor(LOAN_STATUS_BADGES, loan.status),
                              )}
                            >
                              {lookup(LOAN_STATUS_LABELS, loan.status)}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-[13px]">
                            <div className="flex items-center justify-end gap-1">
                              {needsReview && (
                                <button
                                  type="button"
                                  aria-label={`Review loan for ${name}`}
                                  onClick={() => setReviewLoan(loan)}
                                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#3B5BDB] hover:bg-[#EEF2FF]"
                                >
                                  <ClipboardCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                aria-label={`View loan for ${name}`}
                                onClick={() =>
                                  router.push(
                                    `/branchaccount-pastor/hr/loan-detail?id=${loan._id}`,
                                  )
                                }
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
              itemCount={loans.data?.items.length ?? 0}
              noun="loans"
            />
          </div>
        </div>
      </main>

      <BranchAcctNewLoanModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <AccountantReviewLoanModal loan={reviewLoan} onClose={() => setReviewLoan(null)} />
    </div>
  )
}
