"use client"

import { useMemo, useState } from "react"
import { Search, Bell } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useJobRequisitionMetrics,
  useJobRequisitions,
} from "@/components/hooks/hr/useHrJobRequisitions"
import {
  JOB_REQUISITION_PRIORITY_BADGES,
  JOB_REQUISITION_PRIORITY_LABELS,
  JOB_REQUISITION_STATUS_BADGES,
  JOB_REQUISITION_STATUS_LABELS,
  badgeFor,
  lookup,
} from "@/lib/hr/normalize"
import {
  JOB_REQUISITION_STATUSES,
  type JobRequisitionStatus,
} from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

/**
 * Finance's view of hiring requests.
 *
 * Approval is the director's call, so this screen focuses on the payroll
 * commitment each open requisition represents.
 */
export default function Page() {
  const [status, setStatus] = useState<"all" | JobRequisitionStatus>("all")
  const [page, setPage] = useState(1)

  const requisitions = useJobRequisitions({ page, limit: PAGE_SIZE, status })
  const metrics = useJobRequisitionMetrics()

  const rows = useMemo(() => requisitions.data?.items ?? [], [requisitions.data])

  /** Monthly salary commitment of the requisitions currently listed. */
  const committedMonthly = useMemo(
    () =>
      rows
        .filter((r) => r.status === "approved" || r.status === "awaiting_director")
        .reduce((sum, r) => sum + (r.salarySuggested ?? 0), 0),
    [rows],
  )

  function handleExport() {
    const csv = rowsToCsv(
      rows.map((r) => ({
        Ref: r.refNumber,
        Role: r.roleTitle,
        Department: r.department,
        "Suggested Salary": r.salarySuggested,
        Priority: lookup(JOB_REQUISITION_PRIORITY_LABELS, r.priority),
        "Expected Start": formatDate(r.expectedStartDate, "iso"),
        Status: lookup(JOB_REQUISITION_STATUS_LABELS, r.status),
      })),
    )
    downloadCsv(`job-requisitions-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/job-requisition" />
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
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
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
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827]">Job Requisitions</h1>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Hiring requests and the payroll commitment they carry. Approval sits with the
              director.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Active Requests
            </div>
            <div className="mt-2 text-[24px] font-bold text-[#111827]">
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
            <div className="mt-2 text-[24px] font-bold text-[#111827]">
              <HrStatValue
                isLoading={metrics.isLoading}
                error={metrics.error}
                value={metrics.data?.approvedThisMonth ?? 0}
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Monthly Commitment (This Page)
            </div>
            <div className="mt-2 text-[24px] font-bold text-[#111827]">
              {requisitions.isLoading
                ? "—"
                : formatCurrency(committedMonthly, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#6B7280]">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "all" | JobRequisitionStatus)
                setPage(1)
              }}
              className="h-[42px] w-full max-w-[260px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
            >
              <option value="all">All Statuses</option>
              {JOB_REQUISITION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_REQUISITION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF2FF]">
                <tr>
                  {[
                    "Role",
                    "Department",
                    "Suggested Salary",
                    "Expected Start",
                    "Priority",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                <HrTableState
                  colSpan={6}
                  isLoading={requisitions.isLoading}
                  error={requisitions.error}
                  isEmpty={rows.length === 0}
                  emptyTitle="No requisitions"
                  emptyDescription="Hiring requests raised by the branch appear here."
                  onRetry={() => requisitions.refetch()}
                />

                {!requisitions.isLoading &&
                  !requisitions.error &&
                  rows.map((row) => (
                    <tr key={row._id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827]">{row.roleTitle}</span>
                          <span className="text-[12px] text-[#9CA3AF]">
                            Ref: #{row.refNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.department}</td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                        {formatCurrency(row.salarySuggested, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatDate(row.expectedStartDate, "medium")}
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
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                            badgeFor(JOB_REQUISITION_STATUS_BADGES, row.status),
                          )}
                        >
                          {lookup(JOB_REQUISITION_STATUS_LABELS, row.status)}
                        </span>
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
            itemCount={rows.length}
            noun="requisitions"
          />
        </div>
      </main>
    </div>
  )
}
