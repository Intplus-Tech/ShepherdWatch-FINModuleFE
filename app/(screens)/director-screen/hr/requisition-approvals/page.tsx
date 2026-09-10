"use client"

import { useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ReviewRequisitionModal from "@/components/hr/ReviewRequisitionModal"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useJobRequisitionMetrics,
  useJobRequisitions,
} from "@/components/hooks/hr/useHrJobRequisitions"
import {
  JOB_REQUISITION_PRIORITY_BADGES,
  JOB_REQUISITION_PRIORITY_LABELS,
  badgeFor,
  branchName,
  lookup,
} from "@/lib/hr/normalize"
import {
  JOB_REQUISITION_PRIORITIES,
  type JobRequisition,
  type JobRequisitionPriority,
} from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Search, Download } from "lucide-react"

const PAGE_SIZE = 10
const ALL_BRANCHES = "All Branches"

export default function Page() {
  const [search, setSearch] = useState("")
  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES)
  const [priority, setPriority] = useState<"all" | JobRequisitionPriority>("all")
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<{
    requisition: JobRequisition
    intent: "approved" | "rejected"
  } | null>(null)

  /** The director's queue is exactly the requisitions awaiting their sign-off. */
  const requisitions = useJobRequisitions({
    page,
    limit: PAGE_SIZE,
    status: "awaiting_director",
    priority,
  })
  const metrics = useJobRequisitionMetrics()

  const items = useMemo(() => requisitions.data?.items ?? [], [requisitions.data])

  /** Branch options come from the loaded page — the list has no branch lookup. */
  const branchOptions = useMemo(
    () => [ALL_BRANCHES, ...Array.from(new Set(items.map((r) => branchName(r.branchId))))],
    [items],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((row) => {
      if (branchFilter !== ALL_BRANCHES && branchName(row.branchId) !== branchFilter) {
        return false
      }
      if (
        query &&
        !row.roleTitle.toLowerCase().includes(query) &&
        !row.refNumber.toLowerCase().includes(query)
      ) {
        return false
      }
      return true
    })
  }, [items, branchFilter, search])

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((row) => ({
        Ref: row.refNumber,
        Branch: branchName(row.branchId),
        Role: row.roleTitle,
        Department: row.department,
        "Suggested Salary": row.salarySuggested,
        Priority: lookup(JOB_REQUISITION_PRIORITY_LABELS, row.priority),
        "Expected Start": formatDate(row.expectedStartDate, "iso"),
      })),
    )
    downloadCsv(`requisition-approvals-${todayStamp()}.csv`, csv)
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
                Requisition Approvals
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Hiring requests awaiting director sign-off
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search role or reference..."
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

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-2xl">
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Awaiting Your Approval
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.activeRequests ?? 0}
                />
              </div>
            </div>
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Approved This Month
              </div>
              <div className="mt-2 text-[28px] font-bold text-emerald-600">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.approvedThisMonth ?? 0}
                />
              </div>
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
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as "all" | JobRequisitionPriority)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  <option value="all">All Priorities</option>
                  {JOB_REQUISITION_PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                      {JOB_REQUISITION_PRIORITY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBranchFilter(ALL_BRANCHES)
                  setPriority("all")
                  setSearch("")
                  setPage(1)
                }}
                className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-3"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    {["Branch", "Role", "Suggested Salary", "Priority", "Expected Start"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  <HrTableState
                    colSpan={6}
                    isLoading={requisitions.isLoading}
                    error={requisitions.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="Nothing awaiting approval"
                    emptyDescription="Branch requisitions arrive here for your decision."
                    onRetry={() => requisitions.refetch()}
                  />

                  {!requisitions.isLoading &&
                    !requisitions.error &&
                    filtered.map((row) => (
                      <tr key={row._id}>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                          {branchName(row.branchId)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#111827]">
                              {row.roleTitle}
                            </span>
                            <span className="text-[12px] text-[#9CA3AF]">
                              #{row.refNumber} · {row.department}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                          {formatCurrency(row.salarySuggested, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(JOB_REQUISITION_PRIORITY_BADGES, row.priority),
                            )}
                          >
                            {lookup(JOB_REQUISITION_PRIORITY_LABELS, row.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(row.expectedStartDate, "medium")}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDecision({ requisition: row, intent: "approved" })
                              }
                              className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDecision({ requisition: row, intent: "rejected" })
                              }
                              className="rounded-md border border-rose-200 px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={requisitions.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={items.length}
              noun="requisitions"
            />
          </div>
        </div>
      </main>

      <ReviewRequisitionModal
        requisition={decision?.requisition ?? null}
        intent={decision?.intent ?? "approved"}
        onClose={() => setDecision(null)}
      />
    </div>
  )
}
