"use client"

import { useMemo, useState } from "react"
import { Search, Bell, CheckCircle2, ArrowUpDown } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadLoanFinalApprovalModal from "@/components/hr/BranchLeadLoanFinalApprovalModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrLoans, useLoanMutations } from "@/components/hooks/useHrLoans"
import { useToast } from "@/components/ui/toast"
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

const PAGE_SIZE = 20

export default function Page() {
  const [nameFilter, setNameFilter] = useState("")
  const [selected, setSelected] = useState<HrLoan | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { pushToast } = useToast()
  // The pastor acts on what Finance has already verified.
  const { loans, pagination, loading, error, refresh } = useHrLoans({
    page,
    limit: PAGE_SIZE,
    status: "pending_pastor",
  })
  const { pastorApproval } = useLoanMutations()

  // No name search on the endpoint, so the filter narrows the loaded page.
  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    if (!query) return loans
    return loans.filter((loan) =>
      `${loan.employeeName} ${loan.employeeCode} ${loan.department}`.toLowerCase().includes(query)
    )
  }, [loans, nameFilter])

  const openApproval = (request: HrLoan) => {
    setSelected(request)
    setModalOpen(true)
  }

  const handleDecline = async (loan: HrLoan) => {
    setDecliningId(loan.id)
    try {
      await pastorApproval(loan.id, "declined", "Declined by the branch pastor")
      pushToast(`Loan declined for ${loan.employeeName}`, "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to decline this request", "error")
    } finally {
      setDecliningId(null)
    }
  }

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
              <h2 className="text-[16px] font-bold text-[#111827]">Requests Needing Attention</h2>

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
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EFF2FF]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Employee Details
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Loan Type
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Principal Amount
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Verification
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-4 py-5 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[12px] font-bold text-[#3B5BDB]">
                            {initials(r.employeeName)}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827]">
                              {r.employeeName || "Unnamed staff"}
                            </div>
                            <div className="text-[12px] text-[#6B7280]">
                              {[r.department, r.jobTitle].filter(Boolean).join(" / ") || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] text-[#4B5563]">{r.purpose || "—"}</td>
                      <td className="px-4 py-5 text-[15px] font-bold text-[#111827]">
                        {formatNaira(r.amount)}
                      </td>
                      <td className="px-4 py-5 text-[13px]">
                        {r.accountantReview?.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accountant Verified
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                              statusStyle(LOAN_STATUS_STYLES, r.status)
                            )}
                          >
                            {statusLabel(LOAN_STATUS_LABELS, r.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-5 text-[13px]">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openApproval(r)}
                            className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
                          >
                            Final Approval
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(r)}
                            disabled={decliningId === r.id}
                            className="rounded-md border border-rose-200 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {decliningId === r.id ? "Declining…" : "Decline"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={5}
                    loading={loading}
                    error={error}
                    isEmpty={filtered.length === 0}
                    emptyMessage="No loan requests are waiting on your approval."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="requests" />
          </div>
        </div>
      </main>

      <BranchLeadLoanFinalApprovalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        request={selected}
        onDecided={refresh}
      />
    </div>
  )
}
