"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus, SlidersHorizontal } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAdminNewRoleRequisitionModal from "@/components/hr/BranchAdminNewRoleRequisitionModal"
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

function UrgencyPill({ urgency }: { urgency: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
        statusStyle(PRIORITY_STYLES, urgency)
      )}
    >
      {statusLabel(PRIORITY_LABELS, urgency)}
    </span>
  )
}

type Tab = "awaiting" | "past"

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("awaiting")
  const [role, setRole] = useState("All Roles")
  const [priority, setPriority] = useState("")
  const [viewing, setViewing] = useState<HrJobRequisition | null>(null)

  // Awaiting = still with the director; past = everything already decided.
  const {
    requisitions: awaiting,
    loading: awaitingLoading,
    error: awaitingError,
    refresh: refreshAwaiting,
  } = useHrJobRequisitions({ status: "pending_review", priority, limit: 50 })

  const {
    requisitions: history,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useHrJobRequisitions({ priority, limit: 50 })

  const roleOptions = useMemo(
    () =>
      Array.from(
        new Set([...awaiting, ...history].map((row) => row.roleTitle).filter(Boolean))
      ).sort(),
    [awaiting, history]
  )

  const awaitingRows = useMemo(
    () => (role === "All Roles" ? awaiting : awaiting.filter((r) => r.roleTitle === role)),
    [awaiting, role]
  )

  // "Past" is the decided set — the list endpoint has no "not pending" filter.
  const pastRows = useMemo(() => {
    const decided = history.filter((r) => r.status !== "pending_review")
    return role === "All Roles" ? decided : decided.filter((r) => r.roleTitle === role)
  }, [history, role])

  const resetFilters = () => {
    setRole("All Roles")
    setPriority("")
  }

  const refreshAll = () => {
    refreshAwaiting()
    refreshHistory()
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAccountantSidebar
        activeHref="/branchaccount-pastor/hr/job-requisition"
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
              <p className="mt-2 text-[32px] font-bold text-[#111827]">12</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">Currently awaiting approval</p>
            </div>
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Approved This Month
              </p>
              <p className="mt-2 text-[32px] font-bold text-[#111827]">08</p>
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
              <div className="flex items-center gap-2 text-[#4B5563] lg:pb-2.5">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[13px] font-semibold">Filters</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="All Roles">All Roles</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
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
                className="h-[42px] rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Search
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[13px] font-semibold text-[#2563EB] hover:underline lg:pb-2.5"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Tabs + table card */}
          <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[#EEF1F6] px-5">
              <button
                type="button"
                onClick={() => setTab("awaiting")}
                className={cn(
                  "-mb-px border-b-2 py-4 text-[13px]",
                  tab === "awaiting"
                    ? "border-[#2563EB] text-[#111827] font-bold"
                    : "border-transparent text-[#6B7280]"
                )}
              >
                Awaiting Approval
              </button>
              <button
                type="button"
                onClick={() => setTab("past")}
                className={cn(
                  "-mb-px border-b-2 py-4 text-[13px]",
                  tab === "past"
                    ? "border-[#2563EB] text-[#111827] font-bold"
                    : "border-transparent text-[#6B7280]"
                )}
              >
                Past Requests
              </button>
            </div>

            <div className="overflow-x-auto">
              {tab === "awaiting" ? (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {[
                        "Role Title",
                        "Department",
                        "Date Requested",
                        "Urgency",
                        "Clearance Status",
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
                    {awaitingRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setViewing(row)}
                        className="cursor-pointer hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.roleTitle}</span>
                            <span className="text-[12px] text-[#6B7280]">
                              {row.requisitionNumber || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {row.department || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <UrgencyPill urgency={row.priority} />
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span className="inline-flex items-center gap-2 text-[#6B7280]">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Awaiting Director Sign-off
                          </span>
                        </td>
                      </tr>
                    ))}
                    <HrTableStateRow
                      colSpan={5}
                      loading={awaitingLoading}
                      error={awaitingError}
                      isEmpty={awaitingRows.length === 0}
                      emptyMessage="No requisitions match your filters."
                      onRetry={refreshAwaiting}
                    />
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {[
                        "Role Title",
                        "Department",
                        "Date Requested",
                        "Urgency",
                        "Status",
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
                    {pastRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setViewing(row)}
                        className="cursor-pointer hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.roleTitle}</span>
                            <span className="text-[12px] text-[#6B7280]">
                              {row.requisitionNumber || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {row.department || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <UrgencyPill urgency={row.priority} />
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
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
                      emptyMessage="No requisitions match your filters."
                      onRetry={refreshHistory}
                    />
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <BranchAdminNewRoleRequisitionModal
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
