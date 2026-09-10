"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  UserPlus,
  Download,
  Users,
  CheckCircle2,
  CalendarClock,
  SlidersHorizontal,
  MoreVertical,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import {
  useEmployeeMetrics,
  useEmployees,
  useUpdateEmployeeStatus,
} from "@/components/hooks/hr/useHrEmployees"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  employeeEmail,
  initials,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const ROLE_TABS = ["All Roles", "Pastors", "Admin"] as const
type RoleTab = (typeof ROLE_TABS)[number]

const AVATAR_TINTS = [
  "bg-[#EEF2FF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
]

export default function Page() {
  const router = useRouter()

  const [tableSearch, setTableSearch] = useState("")
  const [roleTab, setRoleTab] = useState<RoleTab>("All Roles")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const debouncedSearch = useDebouncedValue(tableSearch)

  const employees = useEmployees({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  })
  const metrics = useEmployeeMetrics()
  const updateStatus = useUpdateEmployeeStatus()

  const rows = useMemo(
    () =>
      (employees.data?.items ?? []).map((employee) => ({
        id: employee._id,
        name: userName(employee.userId, employee.employeeId),
        email: employeeEmail(employee),
        role: employee.jobTitle,
        employeeCode: employee.employeeId,
        status: employee.employmentStatus,
      })),
    [employees.data],
  )

  /**
   * The role tabs narrow the loaded page by job title. The backend filters by
   * `department`, which is a different axis, so this stays client-side.
   */
  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (roleTab === "All Roles") return true
        if (roleTab === "Pastors") return /pastor/i.test(row.role)
        return /admin/i.test(row.role)
      }),
    [rows, roleTab],
  )

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

  const goToProfile = (id: string) => {
    setOpenMenuId(null)
    router.push(`/director-screen/hr/employee-profile?id=${id}`)
  }

  const participation =
    metrics.data && metrics.data.totalStaff > 0
      ? Math.round((metrics.data.activeStaff / metrics.data.totalStaff) * 1000) / 10
      : 0

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((row) => ({
        Name: row.name,
        Email: row.email,
        Role: row.role,
        "Employee ID": row.employeeCode,
        Status: lookup(EMPLOYMENT_STATUS_LABELS, row.status),
      })),
    )
    downloadCsv(`employee-directory-${todayStamp()}.csv`, csv)
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
                Employee Directory
              </h1>
              <p className="mt-2 text-[13px] font-medium text-[#3B5BDB]">
                Organisation-wide staff records
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/director-screen/hr/add-employee")}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
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

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Total Staff
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.totalStaff ?? 0}
                />
              </div>
            </div>

            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Active
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.activeStaff ?? 0}
                />
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                {participation}% of headcount
              </div>
            </div>

            <div className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <CalendarClock className="h-4.5 w-4.5" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                On Leave
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                <HrStatValue
                  isLoading={metrics.isLoading}
                  error={metrics.error}
                  value={metrics.data?.onLeaveStaff ?? 0}
                />
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                {metrics.data?.exitPendingStaff ?? 0} exit pending
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
                          : "text-[#6B7280] hover:bg-gray-100",
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    {["Member", "Role", "Employee ID", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  <HrTableState
                    colSpan={5}
                    isLoading={employees.isLoading}
                    error={employees.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="No members found"
                    emptyDescription="Adjust the filters or add an employee."
                    onRetry={() => employees.refetch()}
                  />

                  {!employees.isLoading &&
                    !employees.error &&
                    filtered.map((m, index) => (
                      <tr key={m.id}>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                                AVATAR_TINTS[index % AVATAR_TINTS.length],
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
                                {m.name}
                              </button>
                              <span className="text-[12px] text-[#6B7280]">
                                {m.email || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{m.role}</td>
                        <td className="px-4 py-4 text-[13px] font-medium text-[#4B5563]">
                          {m.employeeCode}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(EMPLOYMENT_STATUS_BADGES, m.status),
                            )}
                          >
                            {lookup(EMPLOYMENT_STATUS_LABELS, m.status)}
                          </span>
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
                                        `/director-screen/hr/exit-clearance?employeeId=${m.id}`,
                                      )
                                    }
                                    className="block w-full px-4 py-2 text-left text-[13px] text-[#111827] hover:bg-gray-50"
                                  >
                                    View Exit Clearance
                                  </button>
                                  <div className="my-1 border-t border-[#EEF1F6]" />
                                  <button
                                    type="button"
                                    role="menuitem"
                                    disabled={updateStatus.isPending}
                                    onClick={() => {
                                      updateStatus.mutate({
                                        id: m.id,
                                        status:
                                          m.status === "suspended" ? "active" : "suspended",
                                      })
                                      setOpenMenuId(null)
                                    }}
                                    className="block w-full px-4 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                  >
                                    {m.status === "suspended"
                                      ? "Reactivate Member"
                                      : "Suspend Member"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={employees.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={rows.length}
              noun="members"
            />
          </div>

          {updateStatus.error ? (
            <p className="mt-3 text-[12px] text-red-600">
              {updateStatus.error instanceof Error
                ? updateStatus.error.message
                : "Couldn't update that member."}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
