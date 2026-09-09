"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  SlidersHorizontal,
  Download,
  Eye,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrExitClearances } from "@/components/hooks/useHrExitClearances"
import {
  CLEARANCE_STATUS_LABELS,
  CLEARANCE_STATUS_STYLES,
  formatDate,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
        statusStyle(CLEARANCE_STATUS_STYLES, status)
      )}
    >
      {statusLabel(CLEARANCE_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const [page, setPage] = useState(1)

  // Every clearance on this branch, whatever stage it is at.
  const { clearances, pagination, loading, error, refresh } = useHrExitClearances({
    page,
    limit: PAGE_SIZE,
  })

  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Training</span>
          <div className="flex items-center gap-3">
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
          {/* Page title */}
          <h1 className="text-[28px] font-bold text-[#111827]">Exit Clearance Oversight</h1>

          {/* Stat card */}
          <div className="mt-6 max-w-xs rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Total Exits (Active)
            </div>
            <div className="mt-2 text-[32px] font-bold text-[#111827]">12</div>
            <div className="mt-1 text-[12px] font-semibold text-emerald-600">
              &uarr; +2 this year
            </div>
          </div>

          {/* Clearance Registry card */}
          <div className="mt-6 rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 border-b border-[#F3F4F6] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">Clearance Registry</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EFF2FF]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Exit Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Clearance Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {clearances.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[12px] font-bold text-[#3B5BDB]">
                            {initials(record.employeeName)}
                          </div>
                          <div>
                            <div className="font-bold text-[#111827]">
                              {record.employeeName || "Unnamed staff"}
                            </div>
                            <div className="text-[12px] text-[#6B7280]">
                              {record.department || record.jobTitle || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatDate(record.lastWorkingDate)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusPill status={record.status} />
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center justify-end gap-2">
                          {/* The pastor's release is the last step, so it only
                              opens once finance has settled the account. */}
                          {record.status === "pending_pastor" ? (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/branchlead-pastor/hr/final-release?clearanceId=${record.id}`
                                )
                              }
                              className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
                            >
                              Review &amp; Sign-off
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label="View details"
                              onClick={() =>
                                router.push(
                                  `/branchlead-pastor/hr/final-release?clearanceId=${record.id}`
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={4}
                    loading={loading}
                    error={error}
                    isEmpty={clearances.length === 0}
                    emptyMessage="No exit clearances in progress."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="employees" />
          </div>
        </div>
      </main>
    </div>
  )
}
