"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
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
import {
  Search,
  Bell,
  Download,
  Plus,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  Calendar,
  UserMinus,
  Eye,
  Pencil,
  UserX,
} from "lucide-react"

const STATUS_FILTERS = [
  { value: "", label: "Status: All" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Exited" },
  { value: "resigned", label: "Resigned" },
]

const PAGE_SIZE = 20

const CARD =
  "rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

export default function Page() {
  const router = useRouter()

  const { pushToast } = useToast()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [department, setDepartment] = useState("")
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query, 350)
  const { employees, pagination, loading, error, refresh } = useHrEmployees({
    page,
    limit: PAGE_SIZE,
    search,
    employmentStatus: status,
    department,
  })
  const { metrics } = useHrEmployeeMetrics()
  const { updateStatus } = useEmployeeMutations()

  const departments = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department).filter(Boolean))).sort(),
    [employees]
  )

  const stats = useMemo(
    () => [
      { label: "Total Staff", value: metrics.totalStaff, icon: Users, tint: "bg-[#EEF2FF] text-[#2563EB]" },
      { label: "Active", value: metrics.activeStaff, icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600" },
      { label: "On Leave", value: metrics.onLeaveStaff, icon: Calendar, tint: "bg-amber-100 text-amber-600" },
      { label: "Exit Pending", value: metrics.exitPendingStaff, icon: UserMinus, tint: "bg-rose-100 text-rose-600" },
    ],
    [metrics]
  )

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
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px]"
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-6">
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
              <button className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black">
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className={cn(CARD, "relative p-5")}>
                  <div
                    className={cn(
                      "absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-[10px]",
                      s.tint
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    {s.label}
                  </div>
                  <div className="mt-2 text-[28px] font-bold text-[#111827]">
                    {s.value}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Toolbar */}
          <div className={cn(CARD, "mt-5 p-4")}>
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
          <div className={cn(CARD, "mt-5 overflow-hidden")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-[#EFF2FF]">
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
                  {employees.map((e) => (
                    <tr key={e.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                            {initials(e.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#111827]">
                              {e.name || "Unnamed staff"}
                            </div>
                            <div className="text-[12px] text-[#9CA3AF]">
                              Emp ID: #{e.employeeCode || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {e.jobTitle || "—"}
                        {e.department ? (
                          <div className="text-[11px] text-[#9CA3AF]">{e.department}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {e.email || "—"}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                            statusStyle(EMPLOYMENT_STATUS_STYLES, e.employmentStatus)
                          )}
                        >
                          {statusLabel(EMPLOYMENT_STATUS_LABELS, e.employmentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/branchlead-pastor/hr/employee-profile?employeeId=${e.id}`
                              )
                            }
                            aria-label={`View ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/branchlead-pastor/hr/employee-profile?employeeId=${e.id}&edit=1`
                              )
                            }
                            aria-label={`Edit ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(e.id, e.name)}
                            disabled={e.employmentStatus === "terminated"}
                            aria-label={`Deactivate ${e.name}`}
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

            <HrPaginationBar pagination={pagination} onPageChange={setPage} noun="records" />
          </div>
        </div>
      </main>
    </div>
  )
}
