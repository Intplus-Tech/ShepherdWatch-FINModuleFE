"use client"

import { useMemo, useState } from "react"
import { Menu, Search, Bell, Plus, SlidersHorizontal } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminNewRoleRequisitionModal from "@/components/hr/BranchAdminNewRoleRequisitionModal"
import { cn } from "@/lib/utils"

type Urgency = "High Priority" | "Normal" | "Medium"
type PastStatus = "Approved" | "Rejected"

type Requisition = {
  id: string
  role: string
  ref: string
  department: string
  date: string
  urgency: Urgency
}

const AWAITING: Requisition[] = [
  {
    id: "req-001",
    role: "Senior Youth Pastor",
    ref: "Ref: #REQ-2024-001",
    department: "Youth Ministry",
    date: "Oct 12, 2023",
    urgency: "High Priority",
  },
  {
    id: "req-004",
    role: "Financial Comptroller",
    ref: "Ref: #REQ-2024-004",
    department: "Operations & Finance",
    date: "Oct 14, 2023",
    urgency: "Normal",
  },
  {
    id: "req-007",
    role: "Head of Hospitality",
    ref: "Ref: #REQ-2024-007",
    department: "Facility Management",
    date: "Oct 15, 2023",
    urgency: "Medium",
  },
]

const PAST: (Requisition & { status: PastStatus })[] = [
  {
    id: "past-001",
    role: "Senior Youth Pastor",
    ref: "Ref: #REQ-2024-001",
    department: "Youth Ministry",
    date: "Oct 12, 2023",
    urgency: "High Priority",
    status: "Approved",
  },
  {
    id: "past-004",
    role: "Financial Comptroller",
    ref: "Ref: #REQ-2024-004",
    department: "Operations & Finance",
    date: "Oct 14, 2023",
    urgency: "Normal",
    status: "Rejected",
  },
  {
    id: "past-007",
    role: "Head of Hospitality",
    ref: "Ref: #REQ-2024-007",
    department: "Facility Management",
    date: "Oct 15, 2023",
    urgency: "Medium",
    status: "Approved",
  },
  {
    id: "past-009",
    role: "Worship Coordinator",
    ref: "Ref: #REQ-2024-009",
    department: "Creative Arts",
    date: "Oct 16, 2023",
    urgency: "High Priority",
    status: "Approved",
  },
]

const ROLES = [
  "All Roles",
  "Senior Youth Pastor",
  "Financial Comptroller",
  "Head of Hospitality",
  "Worship Coordinator",
]

const PRIORITIES: (Urgency | "All Priorities")[] = [
  "All Priorities",
  "High Priority",
  "Normal",
  "Medium",
]

const URGENCY_STYLES: Record<Urgency, string> = {
  "High Priority": "bg-rose-100 text-rose-700",
  Normal: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
}

function UrgencyPill({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
        URGENCY_STYLES[urgency]
      )}
    >
      {urgency}
    </span>
  )
}

type Tab = "awaiting" | "past"

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("awaiting")
  const [role, setRole] = useState("All Roles")
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("All Priorities")

  const awaitingRows = useMemo(() => {
    return AWAITING.filter((r) => {
      if (role !== "All Roles" && r.role !== role) return false
      if (priority !== "All Priorities" && r.urgency !== priority) return false
      return true
    })
  }, [role, priority])

  const pastRows = useMemo(() => {
    return PAST.filter((r) => {
      if (role !== "All Roles" && r.role !== role) return false
      if (priority !== "All Priorities" && r.urgency !== priority) return false
      return true
    })
  }, [role, priority])

  const resetFilters = () => {
    setRole("All Roles")
    setPriority("All Priorities")
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
                  {ROLES.map((r) => (
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
                  onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
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
                      <tr key={row.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.role}</span>
                            <span className="text-[12px] text-[#6B7280]">{row.ref}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.department}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.date}</td>
                        <td className="px-4 py-4 text-[13px]">
                          <UrgencyPill urgency={row.urgency} />
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span className="inline-flex items-center gap-2 text-[#6B7280]">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Awaiting Director Sign-off
                          </span>
                        </td>
                      </tr>
                    ))}
                    {awaitingRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]"
                        >
                          No requisitions match your filters.
                        </td>
                      </tr>
                    )}
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
                      <tr key={row.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{row.role}</span>
                            <span className="text-[12px] text-[#6B7280]">{row.ref}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.department}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.date}</td>
                        <td className="px-4 py-4 text-[13px]">
                          <UrgencyPill urgency={row.urgency} />
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "font-semibold",
                              row.status === "Approved"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pastRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]"
                        >
                          No requisitions match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <BranchAdminNewRoleRequisitionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
