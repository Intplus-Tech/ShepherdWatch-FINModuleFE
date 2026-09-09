"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrPaginationBar, HrTableStateRow } from "@/components/hr/HrTableState"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { useAccountantHrDashboard } from "@/components/hooks/useHrDashboard"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUS_STYLES,
  formatNaira,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Exited" },
]

const PAGE_SIZE = 20

const AVATAR_TINTS = [
  "bg-[#E8EDFF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-sky-50 text-sky-700",
]

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        statusStyle(EMPLOYMENT_STATUS_STYLES, status)
      )}
    >
      {statusLabel(EMPLOYMENT_STATUS_LABELS, status)}
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const search = useDebouncedValue(query, 350)
  const { employees, pagination, loading, error, refresh } = useHrEmployees({
    page,
    limit: PAGE_SIZE,
    search,
    department: departmentFilter,
    employmentStatus: statusFilter,
  })
  const { dashboard } = useAccountantHrDashboard()

  // Loan exposure is a separate resource, so the running loans are pulled once
  // and folded onto the staff rows by employee.
  const { loans } = useHrLoans({ status: "active", limit: 100 })
  const loanByEmployee = useMemo(() => {
    const totals = new Map<string, { balance: number; deduction: number }>()
    for (const loan of loans) {
      const current = totals.get(loan.employeeId) ?? { balance: 0, deduction: 0 }
      totals.set(loan.employeeId, {
        balance: current.balance + loan.remainingBalance,
        deduction: current.deduction + loan.monthlyDeduction,
      })
    }
    return totals
  }, [loans])

  const departments = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department).filter(Boolean))).sort(),
    [employees]
  )

  const applyFilter = (apply: () => void) => {
    apply()
    setPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-directory" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={query}
                onChange={(event) => applyFilter(() => setQuery(event.target.value))}
                placeholder="Search staff by name or email..."
                className="h-[38px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-4 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827]"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white">
          <div className="border-b border-[#EEF1F6] p-5">
            <h1 className="text-[16px] font-bold text-[#111827]">Employee Directory</h1>
          </div>

          {/* Filters row */}
          <div className="flex flex-col gap-4 border-b border-[#EEF1F6] p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => applyFilter(() => setDepartmentFilter(e.target.value))}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#6B7280]">
                  Employment Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => applyFilter(() => setStatusFilter(e.target.value))}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Total Payroll (Month to Date)
              </div>
              <div className="mt-1 text-[22px] font-bold text-[#111827]">
                {formatNaira(dashboard.payrollMtd)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF2FF]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Employee Name
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Basic Salary
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Department
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Loan Balance
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Monthly Deduction
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {employees.map((employee, index) => {
                  const loan = loanByEmployee.get(employee.id)
                  return (
                    <tr
                      key={employee.id}
                      onClick={() =>
                        router.push(`/branchaccount-pastor/hr/payslip?employeeId=${employee.id}`)
                      }
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                              AVATAR_TINTS[index % AVATAR_TINTS.length]
                            )}
                          >
                            {initials(employee.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">
                              {employee.name || "Unnamed staff"}
                            </span>
                            <span className="text-[12px] text-[#9CA3AF]">
                              {employee.employeeCode || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {employee.jobTitle || "—"}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                        {formatNaira(employee.salary)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {employee.department || "—"}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-4 text-[13px] font-semibold",
                          loan?.balance ? "text-rose-600" : "text-[#9CA3AF]"
                        )}
                      >
                        {formatNaira(loan?.balance ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatNaira(loan?.deduction ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusBadge status={employee.employmentStatus} />
                      </td>
                    </tr>
                  )
                })}
                <HrTableStateRow
                  colSpan={7}
                  loading={loading}
                  error={error}
                  isEmpty={employees.length === 0}
                  emptyMessage="No staff records match your filters."
                  onRetry={refresh}
                />
              </tbody>
            </table>
          </div>

          <HrPaginationBar
            pagination={pagination}
            onPageChange={setPage}
            noun="staff records"
            className="p-5"
          />
        </div>
      </main>
    </div>
  )
}
