"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminNewRoleRequisitionModal from "@/components/hr/BranchAdminNewRoleRequisitionModal"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useJobRequisitionMetrics,
  useJobRequisitions,
} from "@/components/hooks/hr/useHrJobRequisitions"
import {
  JOB_REQUISITION_PRIORITY_BADGES,
  JOB_REQUISITION_PRIORITY_LABELS,
  JOB_REQUISITION_STATUS_LABELS,
  badgeFor,
  lookup,
} from "@/lib/hr/normalize"
import {
  JOB_REQUISITION_PRIORITIES,
  type JobRequisitionPriority,
  type JobRequisitionStatus,
} from "@/lib/hr/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type Tab = "awaiting" | "past"

/** Awaiting is the single open status; past covers every settled one. */
const PAST_STATUSES: JobRequisitionStatus[] = ["approved", "rejected", "cancelled"]

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("awaiting")
  const [role, setRole] = useState("All Roles")
  const [priority, setPriority] = useState<"all" | JobRequisitionPriority>("all")
  const [page, setPage] = useState(1)

  const metrics = useJobRequisitionMetrics()

  const requisitions = useJobRequisitions({
    page,
    limit: PAGE_SIZE,
    priority,
    // The list endpoint takes one status, so the "past" tab is filtered locally.
    status: tab === "awaiting" ? "awaiting_director" : "all",
  })

  const items = useMemo(() => {
    const all = requisitions.data?.items ?? []
    const byTab = tab === "past" ? all.filter((r) => PAST_STATUSES.includes(r.status)) : all
    return role === "All Roles" ? byTab : byTab.filter((r) => r.roleTitle === role)
  }, [requisitions.data, tab, role])

  /** Role options come from the loaded page — there is no roles endpoint. */
  const roles = useMemo(
    () => [
      "All Roles",
      ...Array.from(new Set((requisitions.data?.items ?? []).map((r) => r.roleTitle))),
    ],
    [requisitions.data],
  )

  const resetFilters = () => {
    setRole("All Roles")
    setPriority("all")
    setPage(1)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/job-requisition"
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
            <span className="text-[15px] font-bold text-[#111827]">Job Requisition</span>
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Active Requests
              </p>
              <p className="mt-2 text-[32px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.activeRequests ?? 0}
                />
              </p>
              <p className="mt-1 text-[13px] text-[#6B7280]">Currently awaiting approval</p>
            </div>
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Approved This Month
              </p>
              <p className="mt-2 text-[32px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.approvedThisMonth ?? 0}
                />
              </p>
            </div>
          </div>

          {/* New requisition button */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              New Requisition
            </button>
          </div>

          {/* Filters card */}
          <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as "all" | JobRequisitionPriority)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="all">All Priorities</option>
                  {JOB_REQUISITION_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {JOB_REQUISITION_PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Tabs + table */}
          <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex items-center gap-6 border-b border-[#EEF1F6] px-5">
              <button
                type="button"
                onClick={() => {
                  setTab("awaiting")
                  setPage(1)
                }}
                className={cn(
                  "-mb-px border-b-2 py-4 text-[13px]",
                  tab === "awaiting"
                    ? "border-[#2563EB] text-[#111827] font-bold"
                    : "border-transparent text-[#6B7280]",
                )}
              >
                Awaiting Approval
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("past")
                  setPage(1)
                }}
                className={cn(
                  "-mb-px border-b-2 py-4 text-[13px]",
                  tab === "past"
                    ? "border-[#2563EB] text-[#111827] font-bold"
                    : "border-transparent text-[#6B7280]",
                )}
              >
                Past Requests
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {[
                      "Role Title",
                      "Department",
                      "Date Requested",
                      "Urgency",
                      tab === "awaiting" ? "Clearance Status" : "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={5}
                    isLoading={requisitions.isLoading}
                    error={requisitions.error}
                    isEmpty={items.length === 0}
                    emptyTitle={
                      tab === "awaiting" ? "Nothing awaiting approval" : "No past requests"
                    }
                    emptyDescription="Raise a requisition to start the hiring approval flow."
                    onRetry={() => requisitions.refetch()}
                  />

                  {!requisitions.isLoading &&
                    !requisitions.error &&
                    items.map((row) => (
                      <tr key={row._id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.roleTitle}</span>
                            <span className="text-[12px] text-[#6B7280]">
                              Ref: #{row.refNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {row.department}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(row.createdAt, "medium")}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(JOB_REQUISITION_PRIORITY_BADGES, row.priority),
                            )}
                          >
                            {lookup(JOB_REQUISITION_PRIORITY_LABELS, row.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          {row.status === "awaiting_director" ? (
                            <span className="inline-flex items-center gap-2 text-[#6B7280]">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Awaiting Director Sign-off
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "font-semibold",
                                row.status === "approved"
                                  ? "text-emerald-600"
                                  : "text-rose-600",
                              )}
                            >
                              {lookup(JOB_REQUISITION_STATUS_LABELS, row.status)}
                            </span>
                          )}
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
              itemCount={requisitions.data?.items.length ?? 0}
              noun="requisitions"
            />
          </div>
        </main>
      </div>

      <BranchAdminNewRoleRequisitionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
