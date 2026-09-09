"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import ReviewRequisitionModal from "@/components/hr/ReviewRequisitionModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import {
  useHrJobRequisitions,
  useHrJobRequisitionMetrics,
  useJobRequisitionMutations,
} from "@/components/hooks/useHrJobRequisitions"
import { formatNaira } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import type { HrJobRequisition } from "@/lib/hr/types"
import {
  Search,
  UserPlus,
  Download,
  ChevronDown,
  Filter,
  Eye,
} from "lucide-react"

const PAGE_SIZE = 20

export default function Page() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [search, setSearch] = useState("")
  const [branchFilter, setBranchFilter] = useState("")
  const [titleFilter, setTitleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [reviewing, setReviewing] = useState<HrJobRequisition | null>(null)
  const [decidingId, setDecidingId] = useState<string | null>(null)

  // The director works the pending queue; branch is a server-side filter.
  const { requisitions, pagination, loading, error, refresh } = useHrJobRequisitions({
    page,
    limit: PAGE_SIZE,
    status: "pending_review",
    branchId: branchFilter || undefined,
  })
  const { metrics } = useHrJobRequisitionMetrics()
  const { reviewRequisition } = useJobRequisitionMutations()

  const branchOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const row of requisitions) {
      if (row.branchId && !seen.has(row.branchId)) seen.set(row.branchId, row.branchName)
    }
    return Array.from(seen.entries())
  }, [requisitions])

  // Role title and free-text search narrow the page that came back.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const title = titleFilter.trim().toLowerCase()
    return requisitions.filter((row) => {
      const matchesTitle = !title || row.roleTitle.toLowerCase().includes(title)
      const matchesSearch =
        !term ||
        `${row.branchName} ${row.roleTitle} ${row.department} ${row.requisitionNumber}`
          .toLowerCase()
          .includes(term)
      return matchesTitle && matchesSearch
    })
  }, [requisitions, titleFilter, search])

  const clearFilters = () => {
    setBranchFilter("")
    setTitleFilter("")
    setPage(1)
  }

  /** Quick approve/reject from the row; the modal is for the full case. */
  const decide = async (row: HrJobRequisition, action: "approved" | "rejected") => {
    setDecidingId(row.id)
    try {
      await reviewRequisition(
        row.id,
        action,
        action === "approved"
          ? "Approved at director review."
          : "Rejected at director review."
      )
      pushToast(
        action === "approved" ? "Requisition approved" : "Requisition rejected",
        "success"
      )
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to record that decision", "error")
    } finally {
      setDecidingId(null)
    }
  }

  const handleExport = () => {
    const exported = exportHrRows(
      "job-requisitions",
      filtered.map((row) => ({
        Reference: row.requisitionNumber,
        Branch: row.branchName,
        Role: row.roleTitle,
        Department: row.department,
        "Suggested Salary": row.salarySuggested,
        Priority: row.priority,
        Status: row.status,
      }))
    )
    if (!exported) pushToast("Nothing to export on this page", "info")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/requisition-approvals"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Job Requisition Approvals
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Review and authorize outstanding hiring requests across all branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees, IDs..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
              <button
                onClick={() => router.push("/director-screen/invite-users")}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Filter by Branch</label>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] md:w-[220px]"
                >
                  <option value="All Branches">All Branches</option>
                  <option value="">All Branches</option>
                  {branchOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name || "Unnamed branch"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Job Title</label>
              <input
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Title search..."
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] md:w-[220px]"
              />
            </div>

            <button
              onClick={clearFilters}
              className="text-[13px] font-semibold text-[#3B5BDB] md:mb-3"
            >
              Clear all filters
            </button>
          </div>

          {/* Pending Requisitions Section */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Pending Requisitions
                {metrics.pendingReviewCount ? (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    {metrics.pendingReviewCount}
                  </span>
                ) : null}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Role
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Salary (Monthly)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                        {row.branchName || "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                        {row.roleTitle || "—"}
                        {row.department ? (
                          <div className="text-[11px] text-[#9CA3AF]">{row.department}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                        {formatNaira(row.salarySuggested)}
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        <div className="flex items-center gap-2">
                          <button
                            aria-label="View requisition"
                            onClick={() => setReviewing(row)}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => decide(row, "approved")}
                            disabled={decidingId === row.id}
                            className="rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => decide(row, "rejected")}
                            disabled={decidingId === row.id}
                            className="rounded-md border border-rose-200 bg-white px-4 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={4}
                    loading={loading}
                    error={error}
                    isEmpty={filtered.length === 0}
                    emptyMessage="No pending requisitions match your filters."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar
              pagination={pagination}
              onPageChange={setPage}
              noun="pending requests"
              className="p-5"
            />
          </div>
        </div>
      </main>

      <ReviewRequisitionModal
        requisition={reviewing}
        onClose={() => setReviewing(null)}
        onReviewed={refresh}
      />
    </div>
  )
}
