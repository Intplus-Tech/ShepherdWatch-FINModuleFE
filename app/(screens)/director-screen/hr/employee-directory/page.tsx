"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  UserPlus,
  Download,
  ArrowLeft,
  Users,
  CheckCircle2,
  CalendarClock,
  SlidersHorizontal,
  MoreVertical,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import { useHrEmployees, useHrEmployeeMetrics, useEmployeeMutations } from "@/components/hooks/useHrEmployees"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUS_STYLES,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import { cn } from "@/lib/utils"

const ROLE_TABS = ["All Roles", "Pastors", "Admin"] as const
type RoleTab = (typeof ROLE_TABS)[number]

const PAGE_SIZE = 20

/** Staff avatars alternate the two brand tints. */
const AVATAR_TINTS = ["bg-[#3B5BDB] text-white", "bg-[#111827] text-white"]

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
        statusStyle(EMPLOYMENT_STATUS_STYLES, status)
      )}
    >
      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {statusLabel(EMPLOYMENT_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const router = useRouter()

  const { pushToast } = useToast()
  const [tableSearch, setTableSearch] = useState("")
  const [roleTab, setRoleTab] = useState<RoleTab>("All Roles")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const search = useDebouncedValue(tableSearch, 350)
  // The director sees every branch, so no branchId is sent.
  const { employees, pagination, loading, error, refresh } = useHrEmployees({
    page,
    limit: PAGE_SIZE,
    search,
  })
  const { metrics } = useHrEmployeeMetrics()
  const { updateStatus } = useEmployeeMutations()

  // Role tabs narrow the page that came back — the API filters by department,
  // not by the pastoral/admin split these tabs describe.
  const filtered = useMemo(() => {
    if (roleTab === "All Roles") return employees
    const pattern = roleTab === "Pastors" ? /pastor/i : /admin/i
    return employees.filter((employee) => pattern.test(`${employee.jobTitle} ${employee.role}`))
  }, [employees, roleTab])

  const activeRate = metrics.totalStaff
    ? Math.round((metrics.activeStaff / metrics.totalStaff) * 1000) / 10
    : 0

  const handleExport = () => {
    const exported = exportHrRows(
      "global-employee-directory",
      employees.map((employee) => ({
        Name: employee.name,
        "Employee ID": employee.employeeCode,
        "Job Title": employee.jobTitle,
        Department: employee.department,
        Branch: employee.branchName,
        Email: employee.email,
        Status: statusLabel(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus),
      }))
    )
    if (!exported) pushToast("Nothing to export on this page", "info")
  }

  const handleDeactivate = async (employeeId: string, name: string) => {
    setOpenMenuId(null)
    try {
      await updateStatus(employeeId, "terminated")
      pushToast(`${name} deactivated`, "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to update employee status", "error")
    }
  }

  useEffect(() => {
    if (!openMenuId) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null)
    }
    document.addEventListener("mousedown", onClick)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [openMenuId])

  const goToProfile = (employeeId: string) => {
    setOpenMenuId(null)
    router.push(`/director-screen/hr/employee-profile?employeeId=${employeeId}`)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-directory"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Top bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Global Employee Directory
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Managing 524 staff members • 142 Branches
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search employees, IDs..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[240px]"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Page sub-header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-[18px] font-bold text-[#111827]">
                  All Branch Members
                </h2>
                <p className="text-[13px] text-[#6B7280] mt-0.5">
                  Managing {metrics.totalStaff} staff across every branch
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export List
              </button>
              <button
                type="button"
                onClick={() => router.push("/director-screen/hr/add-employee")}
                className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-medium text-white hover:bg-black"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Total Staff
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">{metrics.totalStaff}</div>
              <div className="mt-1 text-[12px] font-medium text-[#6B7280]">
                {metrics.suspendedStaff} suspended · {metrics.exitPendingStaff} exit pending
              </div>
            </div>

            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Active
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">{metrics.activeStaff}</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                {activeRate}% of headcount active
              </div>
            </div>

            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <CalendarClock className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                On Leave
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">{metrics.onLeaveStaff}</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Currently away from duty
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b border-[#EEF1F6] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search by name, role or ID..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-[#F8FAFC] p-1">
                  {ROLE_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setRoleTab(tab)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                        roleTab === tab
                          ? "bg-[#3B5BDB] text-white"
                          : "text-[#6B7280] hover:bg-gray-100"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Role
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {filtered.map((m, index) => (
                    <tr key={m.id}>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                              AVATAR_TINTS[index % AVATAR_TINTS.length]
                            )}
                          >
                            {initials(m.name)}
                          </div>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => goToProfile(m.id)}
                              className="text-left font-semibold text-[#111827] hover:text-[#3B5BDB] hover:underline"
                            >
                              {m.name || "Unnamed staff"}
                            </button>
                            <span className="text-[12px] text-[#6B7280]">
                              {m.email || m.branchName || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {m.jobTitle || "—"}
                        {m.branchName ? (
                          <div className="text-[11px] text-[#9CA3AF]">{m.branchName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-medium text-[#4B5563]">
                        {m.employeeCode || "—"}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusBadge status={m.employmentStatus} />
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex justify-end">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((prev) => (prev === m.id ? null : m.id))
                              }
                              aria-label="Row actions"
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === m.id}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openMenuId === m.id && (
                              <div
                                ref={menuRef}
                                role="menu"
                                className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-lg border border-[#EEF1F6] bg-white py-1 shadow-lg"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => goToProfile(m.id)}
                                  className="block w-full px-4 py-2 text-left text-[13px] text-[#111827] hover:bg-gray-50"
                                >
                                  View Full Profile
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    router.push(
                                      `/director-screen/hr/employee-profile?employeeId=${m.id}&edit=1`
                                    )
                                  }
                                  className="block w-full px-4 py-2 text-left text-[13px] text-[#111827] hover:bg-gray-50"
                                >
                                  Edit Employment Details
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() =>
                                    router.push(
                                      `/director-screen/hr/leave-attendance?employeeId=${m.id}`
                                    )
                                  }
                                  className="block w-full px-4 py-2 text-left text-[13px] text-[#111827] hover:bg-gray-50"
                                >
                                  Review Leave
                                </button>
                                <div className="my-1 border-t border-[#EEF1F6]" />
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleDeactivate(m.id, m.name)}
                                  className="block w-full px-4 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50"
                                >
                                  Deactivate Member
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={5}
                    loading={loading}
                    error={error}
                    isEmpty={filtered.length === 0}
                    emptyMessage="No members match your search."
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
