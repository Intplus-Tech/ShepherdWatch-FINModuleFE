"use client"

import { useMemo, useState } from "react"
import { Bell, Search, SlidersHorizontal, Plus } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadNewRoleRequisitionModal from "@/components/hr/BranchLeadNewRoleRequisitionModal"
import { cn } from "@/lib/utils"

type Urgency = "High Priority" | "Normal" | "Medium"

type Requisition = {
  id: string
  role: string
  ref: string
  department: string
  dateRequested: string
  urgency: Urgency
}

const AWAITING_REQUISITIONS: Requisition[] = [
  {
    id: "req-001",
    role: "Senior Youth Pastor",
    ref: "#REQ-2024-001",
    department: "Youth Ministry",
    dateRequested: "Oct 12, 2023",
    urgency: "High Priority",
  },
  {
    id: "req-004",
    role: "Financial Comptroller",
    ref: "#REQ-2024-004",
    department: "Operations & Finance",
    dateRequested: "Oct 14, 2023",
    urgency: "Normal",
  },
  {
    id: "req-007",
    role: "Head of Hospitality",
    ref: "#REQ-2024-007",
    department: "Facility Management",
    dateRequested: "Oct 15, 2023",
    urgency: "Medium",
  },
]

const URGENCY_PILL: Record<Urgency, string> = {
  "High Priority": "bg-rose-100 text-rose-700",
  Normal: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
}

const cardCls =
  "rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

type TabKey = "awaiting" | "past"

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("awaiting")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [priorityFilter, setPriorityFilter] = useState("All Priorities")

  const roleOptions = useMemo(
    () => Array.from(new Set(AWAITING_REQUISITIONS.map((r) => r.role))),
    []
  )

  const filtered = useMemo(() => {
    return AWAITING_REQUISITIONS.filter((row) => {
      const matchesRole = roleFilter === "All Roles" || row.role === roleFilter
      const matchesPriority =
        priorityFilter === "All Priorities" || row.urgency === priorityFilter
      return matchesRole && matchesPriority
    })
  }, [roleFilter, priorityFilter])

  const resetAll = () => {
    setRoleFilter("All Roles")
    setPriorityFilter("All Priorities")
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
          {/* Header row */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-[24px] font-bold text-[#111827]">
              Job Requisition
            </h1>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              New Role Requisition
            </button>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-2xl">
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
                  <option>All Priorities</option>
                  <option>High Priority</option>
                  <option>Normal</option>
                  <option>Medium</option>
                </select>
              </div>

              <button
                type="button"
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]"
                        >
                          No requisitions match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="font-semibold text-[#111827]">
                              {row.role}
                            </div>
                            <div className="text-[11px] text-[#9CA3AF]">
                              Ref: {row.ref}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                            {row.department}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#6B7280]">
                            {row.dateRequested}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                URGENCY_PILL[row.urgency]
                              )}
                            >
                              {row.urgency}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex items-center gap-2 text-[#6B7280]">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              Awaiting Director Sign-off
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-[13px] font-semibold text-[#111827]">
                  No past requests yet
                </p>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Completed requisitions will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BranchLeadNewRoleRequisitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
