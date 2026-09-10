"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useEmployees } from "@/components/hooks/hr/useHrEmployees"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  initials,
  loanBalance,
  lookup,
  refId,
  userName,
} from "@/lib/hr/normalize"
import { EMPLOYMENT_STATUSES, type EmploymentStatus } from "@/lib/hr/types"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const ALL_DEPARTMENTS = "All Departments"

const AVATAR_TINTS = [
  "bg-[#E8EDFF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-sky-50 text-sky-700",
]

export default function Page() {
  const router = useRouter()
  const [departmentFilter, setDepartmentFilter] = useState(ALL_DEPARTMENTS)
  const [statusFilter, setStatusFilter] = useState<"all" | EmploymentStatus>("all")
  const [page, setPage] = useState(1)

  const employees = useEmployees({
    page,
    limit: PAGE_SIZE,
    employmentStatus: statusFilter,
    department: departmentFilter === ALL_DEPARTMENTS ? undefined : departmentFilter,
  })

  /**
   * Loan balances are per-employee but there is no combined endpoint, so the
   * branch's active loans are fetched once and summed per employee here.
   */
  const loans = useLoans({ status: "active", limit: 100 })

  const loanByEmployee = useMemo(() => {
    const map = new Map<string, { balance: number; monthly: number }>()
    for (const loan of loans.data?.items ?? []) {
      const id = refId(loan.employeeId)
      if (!id) continue
      const current = map.get(id) ?? { balance: 0, monthly: 0 }
      map.set(id, {
        balance: current.balance + loanBalance(loan),
        monthly: current.monthly + (loan.monthlyDeduction ?? 0),
      })
    }
    return map
  }, [loans.data])

  const rows = useMemo(
    () =>
      (employees.data?.items ?? []).map((employee) => {
        const loanInfo = loanByEmployee.get(employee._id)
        const allowances = (employee.allowances ?? []).reduce(
          (sum, item) => sum + (item.amount ?? 0),
          0,
        )
        return {
          id: employee._id,
          name: userName(employee.userId, employee.employeeId),
          employeeCode: employee.employeeId,
          jobTitle: employee.jobTitle,
          basicSalary: employee.salary ?? 0,
          monthlyAllowance: allowances,
          loanBalance: loanInfo?.balance ?? 0,
          monthlyDeduction: loanInfo?.monthly ?? 0,
          status: employee.employmentStatus,
        }
      }),
    [employees.data, loanByEmployee],
  )

  /** Department options come from the loaded page — there is no departments endpoint. */
  const departments = useMemo(
    () => [
      ALL_DEPARTMENTS,
      ...Array.from(
        new Set(
          (employees.data?.items ?? [])
            .map((employee) => employee.department)
            .filter((d): d is string => Boolean(d)),
        ),
      ),
    ],
    [employees.data],
  )

  /** Monthly cost of the staff currently listed. */
  const payrollTotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.basicSalary + row.monthlyAllowance, 0),
    [rows],
  )

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
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px]"
              />
            </div>
            <button className="text-[#6B7280]">
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
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | EmploymentStatus)
                    setPage(1)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="all">All Statuses</option>
                  {EMPLOYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {EMPLOYMENT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Monthly Payroll (This Page)
              </div>
              <div className="mt-1 text-[22px] font-bold text-[#111827]">
                {employees.isLoading ? "—" : formatCurrency(payrollTotal)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF2FF]">
                <tr>
                  {[
                    "Employee Name",
                    "Job Title",
                    "Basic Salary",
                    "Monthly Allowance",
                    "Loan Balance",
                    "Monthly Deduction",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                <HrTableState
                  colSpan={7}
                  isLoading={employees.isLoading}
                  error={employees.error}
                  isEmpty={rows.length === 0}
                  emptyTitle="No staff records"
                  emptyDescription="Employees added to this branch will appear here."
                  onRetry={() => employees.refetch()}
                />

                {!employees.isLoading &&
                  !employees.error &&
                  rows.map((e, i) => (
                    <tr
                      key={e.id}
                      onClick={() =>
                        router.push(`/branchaccount-pastor/hr/payslip?employeeId=${e.id}`)
                      }
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                              AVATAR_TINTS[i % AVATAR_TINTS.length],
                            )}
                          >
                            {initials(e.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{e.name}</span>
                            <span className="text-[12px] text-[#9CA3AF]">{e.employeeCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{e.jobTitle}</td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                        {formatCurrency(e.basicSalary)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatCurrency(e.monthlyAllowance)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-4 text-[13px] font-semibold",
                          e.loanBalance > 0 ? "text-rose-600" : "text-[#9CA3AF]",
                        )}
                      >
                        {formatCurrency(e.loanBalance)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatCurrency(e.monthlyDeduction)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            badgeFor(EMPLOYMENT_STATUS_BADGES, e.status),
                          )}
                        >
                          {lookup(EMPLOYMENT_STATUS_LABELS, e.status)}
                        </span>
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
            noun="staff records"
          />
        </div>
      </main>
    </div>
  )
}
