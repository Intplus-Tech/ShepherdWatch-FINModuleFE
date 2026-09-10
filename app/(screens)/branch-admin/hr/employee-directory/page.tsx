"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAddEmployeeModal from "@/components/hr/BranchAdminAddEmployeeModal"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useEmployees, useUpdateEmployeeStatus } from "@/components/hooks/hr/useHrEmployees"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  employeeEmail,
  initials,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { EMPLOYMENT_STATUSES, type EmploymentStatus } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Menu,
  Download,
  Plus,
  SlidersHorizontal,
  Eye,
  Pencil,
  UserX,
} from "lucide-react"

const PAGE_SIZE = 10

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | EmploymentStatus>("all")
  const [jobTitle, setJobTitle] = useState("All Roles")
  const [page, setPage] = useState(1)

  const router = useRouter()
  const debouncedQuery = useDebouncedValue(query)

  const employees = useEmployees({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    employmentStatus: status,
  })

  const updateStatus = useUpdateEmployeeStatus()

  const rows = useMemo(
    () =>
      (employees.data?.items ?? []).map((employee) => ({
        id: employee._id,
        name: userName(employee.userId, employee.employeeId),
        empId: employee.employeeId,
        title: employee.jobTitle,
        email: employeeEmail(employee),
        status: employee.employmentStatus,
      })),
    [employees.data],
  )

  /**
   * Job titles come from the loaded page rather than a dedicated endpoint —
   * the backend filters by `department`, not job title, so this stays a
   * client-side narrowing of what is already on screen.
   */
  const jobTitles = useMemo(() => Array.from(new Set(rows.map((row) => row.title))), [rows])

  const filtered = useMemo(
    () => (jobTitle === "All Roles" ? rows : rows.filter((row) => row.title === jobTitle)),
    [rows, jobTitle],
  )

  function changeStatus(id: string, next: EmploymentStatus) {
    updateStatus.mutate({ id, status: next })
  }

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((row) => ({
        Name: row.name,
        "Employee ID": row.empId,
        "Job Title": row.title,
        Email: row.email,
        Status: lookup(EMPLOYMENT_STATUS_LABELS, row.status),
      })),
    )
    downloadCsv(`employee-directory-${todayStamp()}.csv`, csv)
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
        activeHref="/branch-admin/hr/employee-directory"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827]">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">Employee Directory</h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Manage branch staff records, status, and department alignment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search by name, email, or department..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as "all" | EmploymentStatus)
                  setPage(1)
                }}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="all">Status: All</option>
                {EMPLOYMENT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {EMPLOYMENT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="All Roles">Job Title: All Roles</option>
                {jobTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC]">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-[#EEF2FF]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Email Address
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={5}
                    isLoading={employees.isLoading}
                    error={employees.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="No employees found"
                    emptyDescription="Add an employee or adjust your filters."
                    onRetry={() => employees.refetch()}
                  />

                  {!employees.isLoading &&
                    !employees.error &&
                    filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                              {initials(e.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#111827]">{e.name}</div>
                              <div className="text-[12px] text-[#9CA3AF]">Emp ID: #{e.empId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{e.title}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{e.email || "—"}</td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(EMPLOYMENT_STATUS_BADGES, e.status),
                            )}
                          >
                            {lookup(EMPLOYMENT_STATUS_LABELS, e.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                router.push(`/branch-admin/hr/employee-profile?id=${e.id}`)
                              }
                              aria-label={`View ${e.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/branch-admin/hr/employee-profile?id=${e.id}&edit=1`)
                              }
                              aria-label={`Edit ${e.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                changeStatus(e.id, e.status === "suspended" ? "active" : "suspended")
                              }
                              disabled={updateStatus.isPending}
                              aria-label={
                                e.status === "suspended"
                                  ? `Reactivate ${e.name}`
                                  : `Suspend ${e.name}`
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:opacity-40"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
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
              noun="employees"
            />
          </div>

          {updateStatus.error ? (
            <p className="mt-3 text-[12px] text-red-600">
              {updateStatus.error instanceof Error
                ? updateStatus.error.message
                : "Couldn't update that employee."}
            </p>
          ) : null}
        </main>
      </div>

      <BranchAdminAddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
