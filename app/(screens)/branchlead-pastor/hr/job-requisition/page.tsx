"use client"

import { useMemo, useState } from "react"
import { Bell, Search, SlidersHorizontal, Plus } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadNewRoleRequisitionModal from "@/components/hr/BranchLeadNewRoleRequisitionModal"
import ReviewRequisitionModal from "@/components/hr/ReviewRequisitionModal"
import { HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrJobRequisitions } from "@/components/hooks/useHrJobRequisitions"
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  REQUISITION_STATUS_LABELS,
  REQUISITION_STATUS_STYLES,
  formatDate,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import type { HrJobRequisition } from "@/lib/hr/types"
import { cn } from "@/lib/utils"

const PRIORITIES = [
  { value: "", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const cardCls =
  "rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

type TabKey = "awaiting" | "past"

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("awaiting")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [viewing, setViewing] = useState<HrJobRequisition | null>(null)

  // Awaiting = still with the director; the second tab shows decided ones.
  const {
    requisitions: awaiting,
    loading: awaitingLoading,
    error: awaitingError,
    refresh: refreshAwaiting,
  } = useHrJobRequisitions({ status: "pending_review", priority: priorityFilter, limit: 50 })

  const {
    requisitions: history,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useHrJobRequisitions({ priority: priorityFilter, limit: 50 })

  const roleOptions = useMemo(
    () =>
      Array.from(
        new Set([...awaiting, ...history].map((row) => row.roleTitle).filter(Boolean))
      ).sort(),
    [awaiting, history]
  )

  const filtered = useMemo(
    () => (roleFilter === "All Roles" ? awaiting : awaiting.filter((r) => r.roleTitle === roleFilter)),
    [awaiting, roleFilter]
  )

  const pastRows = useMemo(() => {
    const decided = history.filter((r) => r.status !== "pending_review")
    return roleFilter === "All Roles" ? decided : decided.filter((r) => r.roleTitle === roleFilter)
  }, [history, roleFilter])

  const refreshAll = () => {
    refreshAwaiting()
    refreshHistory()
  }

  const resetAll = () => {
    setRoleFilter("All Roles")
    setPriorityFilter("")
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">
            Job Requisition
          </span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                placeholder="Search requisitions..."
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3.5 text-[12px] text-[#111827] outline-none focus:border-[#2563EB]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Stat cards + New Requisition (button right-aligned, matching design) */}
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 max-w-2xl">
              <div className={cardCls}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Active Requests
                </div>
                <div className="mt-2 text-[32px] font-bold text-[#111827]">12</div>
                <div className="mt-1 text-[13px] text-[#6B7280]">
                  Currently awaiting approval
                </div>
              </div>
              <div className={cardCls}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Approved This Month
                </div>
                <div className="mt-2 text-[32px] font-bold text-[#111827]">08</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 self-end rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              New Requisition
            </button>
          </div>

          {/* Filters card */}
          <div className={cn(cardCls, "mb-6")}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <div className="flex items-center gap-2 text-[#6B7280] md:mb-3">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Filters
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB] md:w-[220px]"
                >
                  <option>All Roles</option>
                  <option value="All Roles">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB] md:w-[220px]"
                >
                  {PRIORITIES.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={refreshAll}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 md:mb-0.5"
              >
                Search
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="text-[13px] font-semibold text-[#2563EB] md:mb-3"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Tabs + table card */}
          <div className={cardCls}>
            <div className="mb-2 flex items-center gap-6 border-b border-[#F3F4F6]">
              <button
                type="button"
                onClick={() => setActiveTab("awaiting")}
                className={cn(
                  "-mb-px pb-3 text-[13px]",
                  activeTab === "awaiting"
                    ? "border-b-2 border-[#2563EB] text-[#111827] font-bold"
                    : "text-[#6B7280]"
                )}
              >
                Awaiting Approval
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("past")}
                className={cn(
                  "-mb-px pb-3 text-[13px]",
                  activeTab === "past"
                    ? "border-b-2 border-[#2563EB] text-[#111827] font-bold"
                    : "text-[#6B7280]"
                )}
              >
                Past Requests
              </button>
            </div>

            {activeTab === "awaiting" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-transparent">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Role Title
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Department
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Date Requested
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Urgency
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Clearance Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {filtered.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setViewing(row)}
                        className="cursor-pointer hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-4 text-[13px]">
                          <div className="font-semibold text-[#111827]">{row.roleTitle}</div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            Ref: {row.requisitionNumber || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                          {row.department || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-bold",
                              statusStyle(PRIORITY_STYLES, row.priority)
                            )}
                          >
                            {statusLabel(PRIORITY_LABELS, row.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-2 text-[#6B7280]">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Awaiting Director Sign-off
                          </div>
                        </td>
                      </tr>
                    ))}
                    <HrTableStateRow
                      colSpan={5}
                      loading={awaitingLoading}
                      error={awaitingError}
                      isEmpty={filtered.length === 0}
                      emptyMessage="No requisitions match your filters."
                      onRetry={refreshAwaiting}
                    />
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      {["Role Title", "Department", "Date Requested", "Priority", "Outcome"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {pastRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setViewing(row)}
                        className="cursor-pointer hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-4 text-[13px]">
                          <div className="font-semibold text-[#111827]">{row.roleTitle}</div>
                          <div className="text-[11px] text-[#9CA3AF]">
                            Ref: {row.requisitionNumber || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                          {row.department || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-bold",
                              statusStyle(PRIORITY_STYLES, row.priority)
                            )}
                          >
                            {statusLabel(PRIORITY_LABELS, row.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-bold",
                              statusStyle(REQUISITION_STATUS_STYLES, row.status)
                            )}
                          >
                            {statusLabel(REQUISITION_STATUS_LABELS, row.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <HrTableStateRow
                      colSpan={5}
                      loading={historyLoading}
                      error={historyError}
                      isEmpty={pastRows.length === 0}
                      emptyMessage="Completed requisitions will appear here."
                      onRetry={refreshHistory}
                    />
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <BranchLeadNewRoleRequisitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refreshAll}
      />

      <ReviewRequisitionModal
        requisition={viewing}
        onClose={() => setViewing(null)}
        readOnly
      />
    </div>
  )
}
