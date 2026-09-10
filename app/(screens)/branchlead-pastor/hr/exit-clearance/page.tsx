"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, Eye } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useExitClearanceMetrics,
  useExitClearances,
} from "@/components/hooks/hr/useHrExitClearance"
import {
  CLEARANCE_STATUS_BADGES,
  CLEARANCE_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  lookup,
} from "@/lib/hr/normalize"
import type { ExitClearance } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

/**
 * How far along a clearance is, from the per-step records.
 *
 * The pastoral release is the last gate, so a clearance is only "ready" once
 * both admin and finance have signed off.
 */
function stageOf(clearance: ExitClearance): {
  label: string
  ready: boolean
  tone: string
} {
  const step = (name: string) =>
    clearance.steps?.find((s) => s.step === name)?.status === "completed"

  const admin = step("admin")
  const finance = step("finance")

  if (clearance.status === "completed") {
    return { label: "Released", ready: false, tone: "bg-[#F3F4F6] text-[#4B5563]" }
  }
  if (admin && finance) {
    return { label: "Ready for Release", ready: true, tone: "bg-emerald-100 text-emerald-700" }
  }
  if (admin) {
    return { label: "Awaiting Finance", ready: false, tone: "bg-blue-50 text-blue-700" }
  }
  return { label: "Awaiting Admin", ready: false, tone: "bg-amber-100 text-amber-700" }
}

export default function Page() {
  const router = useRouter()
  const [page, setPage] = useState(1)

  const clearances = useExitClearances({ page, limit: PAGE_SIZE })
  const metrics = useExitClearanceMetrics()

  const rows = useMemo(() => clearances.data?.items ?? [], [clearances.data])

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Exit Clearance</span>
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

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:max-w-3xl">
            <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Total Exits
              </div>
              <div className="mt-2 text-[32px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.total ?? 0}
                />
              </div>
            </div>
            <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                In Progress
              </div>
              <div className="mt-2 text-[32px] font-bold text-amber-600">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.inProgress ?? 0}
                />
              </div>
            </div>
            <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Completed
              </div>
              <div className="mt-2 text-[32px] font-bold text-emerald-600">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.completed ?? 0}
                />
              </div>
            </div>
          </div>

          {/* Clearance Registry card */}
          <div className="mt-6 rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 border-b border-[#F3F4F6] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">Clearance Registry</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EFF2FF]">
                  <tr>
                    {["Employee", "Exit Date", "Stage", "Status"].map((h) => (
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
                    colSpan={5}
                    isLoading={clearances.isLoading}
                    error={clearances.error}
                    isEmpty={rows.length === 0}
                    emptyTitle="No exit clearances"
                    emptyDescription="Separations started by the branch admin appear here."
                    onRetry={() => clearances.refetch()}
                  />

                  {!clearances.isLoading &&
                    !clearances.error &&
                    rows.map((record) => {
                      const name = employeeName(record.employeeId)
                      const employee = deref(record.employeeId)
                      const stage = stageOf(record)
                      return (
                        <tr key={record._id} className="transition-colors hover:bg-[#F9FAFB]">
                          <td className="px-4 py-4 text-[13px]">
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
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatDate(record.lastWorkingDate, "medium")}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                stage.tone,
                              )}
                            >
                              {stage.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                                badgeFor(CLEARANCE_STATUS_BADGES, record.status),
                              )}
                            >
                              {lookup(CLEARANCE_STATUS_LABELS, record.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center justify-end gap-2">
                              {stage.ready ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/branchlead-pastor/hr/final-release?id=${record._id}`,
                                    )
                                  }
                                  className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
                                >
                                  Review &amp; Sign-off
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  aria-label={`View ${name}`}
                                  onClick={() =>
                                    router.push(
                                      `/branchlead-pastor/hr/final-release?id=${record._id}`,
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
                      )
                    })}
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={clearances.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={rows.length}
              noun="employees"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
