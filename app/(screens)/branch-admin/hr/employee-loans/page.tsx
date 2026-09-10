"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Search, Bell, Eye } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminNewLoanModal from "@/components/hr/BranchAdminNewLoanModal"
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
import { LOAN_STATUSES, type LoanStatus } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function Page() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  const loans = useLoans({ page, limit: PAGE_SIZE, status: statusFilter })

  const rows = useMemo(
    () =>
      (loans.data?.items ?? []).map((loan) => {
        const employee = deref(loan.employeeId)
        return {
          id: loan._id,
          name: employeeName(loan.employeeId),
          employeeCode: employee?.employeeId ?? "—",
          jobTitle: employee?.jobTitle ?? "—",
          totalAmount: loan.amount,
          monthly: loan.monthlyDeduction,
          balance: loanBalance(loan),
          status: loan.status,
        }
      }),
    [loans.data],
  )

  /** The loans list endpoint has no free-text search, so the name filter is local. */
  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(query))
  }, [rows, nameFilter])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/employee-loans"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        {/* Header */}
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
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
                    className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] sm:w-[240px]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | LoanStatus)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#4B5563] outline-none focus-visible:border-[#2563EB]"
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
                    filtered.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-[#F9FAFB]">
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#2563EB]">
                              {initials(row.name)}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">{row.name}</div>
                              <div className="text-[12px] text-[#6B7280]">
                                {row.employeeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">{row.jobTitle}</td>
                        <td className="px-4 py-5 text-[13px] text-[#111827]">
                          {formatCurrency(row.totalAmount, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                          {formatCurrency(row.monthly, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-5 text-[13px] font-bold text-[#111827]">
                          {formatCurrency(row.balance, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                              badgeFor(LOAN_STATUS_BADGES, row.status),
                            )}
                          >
                            {lookup(LOAN_STATUS_LABELS, row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              aria-label={`View loan for ${row.name}`}
                              onClick={() =>
                                router.push(`/branch-admin/hr/loan-detail?id=${row.id}`)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={loans.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={rows.length}
              noun="loans"
            />
          </div>
        </main>
      </div>

      <BranchAdminNewLoanModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
