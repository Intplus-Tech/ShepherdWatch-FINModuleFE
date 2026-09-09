"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAddEmployeeModal from "@/components/hr/BranchAdminAddEmployeeModal"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import { useHrEmployees, useEmployeeMutations } from "@/components/hooks/useHrEmployees"
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

/** Filter values map straight onto the backend's employmentStatus enum. */
const STATUS_FILTERS = [
  { value: "", label: "Status: All" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Exited" },
  { value: "resigned", label: "Resigned" },
]

const PAGE_SIZE = 20

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [department, setDepartment] = useState("")
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { pushToast } = useToast()

  const search = useDebouncedValue(query, 350)
  const { employees, pagination, loading, error, refresh } = useHrEmployees({
    page,
    limit: PAGE_SIZE,
    search,
    employmentStatus: status,
    department,
  })
  const { updateStatus } = useEmployeeMutations()

  // Department options come from whatever the current page returned — the
  // backend has no department lookup endpoint yet.
  const departments = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department).filter(Boolean))).sort(),
    [employees]
  )

  /** Filters reset to page 1 so a narrowed result set is never shown empty. */
  const applyFilter = (apply: () => void) => {
    apply()
    setPage(1)
  }

  const handleDeactivate = async (employeeId: string, name: string) => {
    try {
      await updateStatus(employeeId, "terminated")
      pushToast(`${name} marked as exited`, "success")
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to update employee status", "error")
    }
  }

  const handleExport = () => {
    const exported = exportHrRows(
      "branch-employee-directory",
      employees.map((employee) => ({
        Name: employee.name,
        "Employee ID": employee.employeeCode,
        "Job Title": employee.jobTitle,
        Department: employee.department,
        Email: employee.email,
        Status: statusLabel(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus),
      }))
    )
    if (!exported) pushToast("Nothing to export on this page", "info")
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
              <h1 className="text-[28px] font-bold text-[#111827]">
                Employee Directory
              </h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Manage branch staff records, status, and department alignment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
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
                  onChange={(e) => applyFilter(() => setQuery(e.target.value))}
                  placeholder="Search by name, email, or department..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <select
                value={status}
                onChange={(e) => applyFilter(() => setStatus(e.target.value))}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={department}
                onChange={(e) => applyFilter(() => setDepartment(e.target.value))}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="">Department: All</option>
                {departments.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
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
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                            {initials(employee.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#111827]">
                              {employee.name || "Unnamed staff"}
                            </div>
                            <div className="text-[12px] text-[#9CA3AF]">
                              Emp ID: #{employee.employeeCode || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {employee.jobTitle || "—"}
                        {employee.department ? (
                          <div className="text-[11px] text-[#9CA3AF]">{employee.department}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {employee.email || "—"}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                            statusStyle(EMPLOYMENT_STATUS_STYLES, employee.employmentStatus)
                          )}
                        >
                          {statusLabel(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/branch-admin/hr/employee-profile?employeeId=${employee.id}`)
                            }
                            aria-label={`View ${employee.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/branch-admin/hr/employee-profile?employeeId=${employee.id}&edit=1`)
                            }
                            aria-label={`Edit ${employee.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(employee.id, employee.name)}
                            disabled={employee.employmentStatus === "terminated"}
                            aria-label={`Deactivate ${employee.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <HrTableStateRow
                    colSpan={5}
                    loading={loading}
                    error={error}
                    isEmpty={employees.length === 0}
                    emptyMessage="No employees match your filters."
                    onRetry={refresh}
                  />
                </tbody>
              </table>
            </div>

            <HrPaginationBar
              pagination={pagination}
              onPageChange={setPage}
              noun="records"
            />
          </div>
        </main>
      </div>

      <BranchAdminAddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setPage(1)
          refresh()
        }}
      />
    </div>
  )
}
