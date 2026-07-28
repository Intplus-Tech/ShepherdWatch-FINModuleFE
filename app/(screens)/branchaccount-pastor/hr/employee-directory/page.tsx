"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

type EmployeeStatus = "ACTIVE" | "ON LEAVE" | "PROBATION"

type Employee = {
  id: string
  name: string
  employeeId: string
  jobTitle: string
  department: string
  basicSalary: number
  monthlyAllowance: number
  loanBalance: number
  monthlyDeduction: number
  status: EmployeeStatus
}

const EMPLOYEES: Employee[] = [
  {
    id: "emmanuel-okeke",
    name: "Emmanuel Okeke",
    employeeId: "EMP-2023-001",
    jobTitle: "Senior Pastor",
    department: "Pastoral",
    basicSalary: 850_000,
    monthlyAllowance: 120_000,
    loanBalance: 0,
    monthlyDeduction: 45_500,
    status: "ACTIVE",
  },
  {
    id: "mary-adebayo",
    name: "Mary Adebayo",
    employeeId: "EMP-2023-042",
    jobTitle: "Admin Manager",
    department: "Administration",
    basicSalary: 450_000,
    monthlyAllowance: 65_000,
    loanBalance: 240_000,
    monthlyDeduction: 32_000,
    status: "ACTIVE",
  },
  {
    id: "chidi-ike",
    name: "Chidi Ike",
    employeeId: "EMP-2024-012",
    jobTitle: "Youth Coordinator",
    department: "Ministry",
    basicSalary: 320_000,
    monthlyAllowance: 40_000,
    loanBalance: 0,
    monthlyDeduction: 18_400,
    status: "ACTIVE",
  },
  {
    id: "sarah-tunde",
    name: "Sarah Tunde",
    employeeId: "EMP-2022-088",
    jobTitle: "Facility Head",
    department: "Facilities",
    basicSalary: 280_000,
    monthlyAllowance: 35_000,
    loanBalance: 0,
    monthlyDeduction: 12_500,
    status: "ON LEAVE",
  },
  {
    id: "james-nwachukwu",
    name: "James Nwachukwu",
    employeeId: "EMP-2023-115",
    jobTitle: "Choir Director",
    department: "Ministry",
    basicSalary: 400_000,
    monthlyAllowance: 50_000,
    loanBalance: 105_000,
    monthlyDeduction: 24_000,
    status: "ACTIVE",
  },
  {
    id: "rose-akintola",
    name: "Rose Akintola",
    employeeId: "EMP-2024-081",
    jobTitle: "Front Desk Officer",
    department: "Administration",
    basicSalary: 150_000,
    monthlyAllowance: 20_000,
    loanBalance: 0,
    monthlyDeduction: 8_200,
    status: "PROBATION",
  },
  {
    id: "peter-musa",
    name: "Peter Musa",
    employeeId: "EMP-2022-019",
    jobTitle: "Chief Security Officer",
    department: "Facilities",
    basicSalary: 250_000,
    monthlyAllowance: 30_000,
    loanBalance: 0,
    monthlyDeduction: 14_000,
    status: "ACTIVE",
  },
  {
    id: "lydia-udoh",
    name: "Lydia Udoh",
    employeeId: "EMP-2023-204",
    jobTitle: "Accountant II",
    department: "Finance",
    basicSalary: 380_000,
    monthlyAllowance: 45_000,
    loanBalance: 0,
    monthlyDeduction: 21_500,
    status: "ACTIVE",
  },
]

const DEPARTMENTS = [
  "All Departments",
  "Pastoral",
  "Administration",
  "Ministry",
  "Facilities",
  "Finance",
]

const STATUSES = ["All Statuses", "ACTIVE", "ON LEAVE", "PROBATION"]

const AVATAR_TINTS = [
  "bg-[#E8EDFF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-sky-50 text-sky-700",
]

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        status === "ACTIVE"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status}
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [statusFilter, setStatusFilter] = useState("All Statuses")

  const filtered = useMemo(() => {
    return EMPLOYEES.filter((e) => {
      const matchesDepartment =
        departmentFilter === "All Departments" || e.department === departmentFilter
      const matchesStatus =
        statusFilter === "All Statuses" || e.status === statusFilter
      return matchesDepartment && matchesStatus
    })
  }, [departmentFilter, statusFilter])

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
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {DEPARTMENTS.map((d) => (
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Average Total Monthly Payroll
              </div>
              <div className="mt-1 text-[22px] font-bold text-[#111827]">₦14,850,000.00</div>
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
                    Monthly Allowance
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-[13px] text-[#6B7280]"
                    >
                      No staff records match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr
                      key={e.id}
                      onClick={() => router.push("/branchaccount-pastor/hr/payslip")}
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                              AVATAR_TINTS[i % AVATAR_TINTS.length]
                            )}
                          >
                            {initials(e.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">{e.name}</span>
                            <span className="text-[12px] text-[#9CA3AF]">{e.employeeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">{e.jobTitle}</td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                        {formatNaira(e.basicSalary)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatNaira(e.monthlyAllowance)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-4 text-[13px] font-semibold",
                          e.loanBalance > 0 ? "text-rose-600" : "text-[#9CA3AF]"
                        )}
                      >
                        {formatNaira(e.loanBalance)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatNaira(e.monthlyDeduction)}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer + pagination */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#EEF1F6] p-5 sm:flex-row">
            <span className="text-[13px] text-[#6B7280]">
              Showing 1 to 8 of 84 staff records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {["1", "2", "3"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] font-semibold",
                    p === "1"
                      ? "bg-[#111827] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                  )}
                >
                  {p}
                </button>
              ))}
              <span className="px-1 text-[12px] text-[#9CA3AF]">…</span>
              <button
                type="button"
                className="flex h-8 min-w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
              >
                11
              </button>
              <button
                type="button"
                aria-label="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
