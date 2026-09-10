"use client"

import { useMemo, useState } from "react"
import { Search, Bell, CheckCircle2 } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadLoanFinalApprovalModal from "@/components/hr/BranchLeadLoanFinalApprovalModal"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import { deref, employeeName, initials } from "@/lib/hr/normalize"
import type { EmployeeLoan } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 10

export default function Page() {
  const [nameFilter, setNameFilter] = useState("")
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<{
    loan: EmployeeLoan
    intent: "approved" | "declined"
  } | null>(null)

  /**
   * The pastor is the second gate: `pending_pastor` is exactly the queue this
   * screen exists to clear.
   */
  const loans = useLoans({ page, limit: PAGE_SIZE, status: "pending_pastor" })

  /** The loans list endpoint has no free-text search, so this filters locally. */
  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    const items = loans.data?.items ?? []
    if (!query) return items
    return items.filter((loan) => employeeName(loan.employeeId).toLowerCase().includes(query))
  }, [loans.data, nameFilter])

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex h-[56px] items-center justify-between gap-6">
          <span className="text-[13px] font-bold">Dashboard</span>

          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
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
          {/* Requests Needing Attention card */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 border-b border-[#F3F4F6] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Requests Needing Attention
              </h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Filter by name..."
                    className="h-[38px] w-[220px] rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EFF2FF]">
                  <tr>
                    {["Employee Details", "Loan Purpose", "Principal", "Review Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={5}
                    isLoading={loans.isLoading}
                    error={loans.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="Nothing awaiting your approval"
                    emptyDescription="Loan requests reach you after the accountant's review."
                    onRetry={() => loans.refetch()}
                  />

                  {!loans.isLoading &&
                    !loans.error &&
                    filtered.map((loan) => {
                      const name = employeeName(loan.employeeId)
                      const employee = deref(loan.employeeId)
                      const verified = loan.accountantReview?.isVerified
                      return (
                        <tr key={loan._id} className="transition-colors hover:bg-[#F9FAFB]">
                          <td className="px-4 py-5 text-[13px]">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[12px] font-bold text-[#3B5BDB]">
                                {initials(name)}
                              </div>
                              <div>
                                <div className="font-bold text-[#111827]">{name}</div>
                                <div className="text-[12px] text-[#6B7280]">
                                  {employee?.department ?? employee?.jobTitle ?? "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-[13px] text-[#4B5563]">{loan.purpose}</td>
                          <td className="px-4 py-5 text-[15px] font-bold text-[#111827]">
                            {formatCurrency(loan.amount, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-5 text-[13px]">
                            {verified ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Accountant Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                                Awaiting Accountant
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-5 text-[13px]">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDecision({ loan, intent: "approved" })}
                                className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
                              >
                                Final Approval
                              </button>
                              <button
                                type="button"
                                onClick={() => setDecision({ loan, intent: "declined" })}
                                className="rounded-md border border-rose-200 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Decline
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
              noun="requests"
            />
          </div>
        </div>
      </main>

      <BranchLeadLoanFinalApprovalModal
        open={decision !== null}
        loan={decision?.loan ?? null}
        intent={decision?.intent ?? "approved"}
        onClose={() => setDecision(null)}
      />
    </div>
  )
}
