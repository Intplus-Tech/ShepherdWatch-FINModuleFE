"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, Eye } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAcctNewLoanModal from "@/components/hr/BranchAcctNewLoanModal"
import { AccountantReviewModal } from "@/components/hr/LoanActionModals"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import {
  LOAN_STATUS_LABELS,
  LOAN_STATUS_STYLES,
  formatNaira,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import type { HrLoan } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending_accountant", label: "Pending Verification" },
  { value: "pending_pastor", label: "Pending Pastor" },
  { value: "pending_director", label: "Pending Director" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
]

const PAGE_SIZE = 20

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        statusStyle(LOAN_STATUS_STYLES, status)
      )}
    >
      {statusLabel(LOAN_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<HrLoan | null>(null)
  const [page, setPage] = useState(1)

  const { loans, pagination, loading, error, refresh } = useHrLoans({
    page,
    limit: PAGE_SIZE,
    status: statusFilter,
  })

  // The endpoint filters by status only, so the box narrows the loaded page.
  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    if (!query) return loans
    return loans.filter((row) =>
      `${row.employeeName} ${row.employeeCode} ${row.jobTitle}`.toLowerCase().includes(query)
    )
  }, [loans, nameFilter])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-loans" />

      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-6">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>

          <div className="flex items-center gap-4">
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
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#4B5563] outline-none focus-visible:border-[#3B5BDB]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
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
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Total Amount (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Monthly (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Balance (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-4 py-5 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[11px] font-bold text-[#3B5BDB]">
                            {initials(row.employeeName)}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827]">
                              {row.employeeName || "Unnamed staff"}
                            </div>
                            <div className="text-[12px] text-[#6B7280]">
                              {row.employeeCode || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                        {row.jobTitle || row.department || "—"}
                      </td>
                      <td className="px-4 py-5 text-[13px] text-[#111827]">
                        {formatNaira(row.amount)}
                      </td>
                      <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                        {formatNaira(row.monthlyDeduction)}
                      </td>
                      <td className="px-4 py-5 text-[13px] font-bold text-[#111827]">
                        {formatNaira(row.remainingBalance)}
                      </td>
                      <td className="px-4 py-5 text-[13px]">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-5 text-[13px]">
                        <div className="flex items-center justify-end gap-2">
                          {row.status === "pending_accountant" ? (
                            <button
                              type="button"
                              onClick={() => setReviewTarget(row)}
                              className="rounded-md bg-[#111827] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
                            >
                              Verify
                            </button>
                          ) : null}
                          <button
                            type="button"
                            aria-label={`View loan for ${row.employeeName}`}
                            onClick={() =>
                              router.push(
                                `/branchaccount-pastor/hr/loan-detail?loanId=${row.id}`
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={7}
                    loading={loading}
                    error={error}
                    isEmpty={filtered.length === 0}
                    emptyMessage="No loans match your filters."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="loans" />
          </div>
        </div>
      </main>

      <AccountantReviewModal
        loan={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onReviewed={refresh}
      />

      <BranchAcctNewLoanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setPage(1)
          refresh()
        }}
      />
    </div>
  )
}
