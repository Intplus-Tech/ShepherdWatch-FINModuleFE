"use client"

import { useMemo, useState } from "react"
import {
  Search,
  UserPlus,
  Download,
  AlertTriangle,
  Users,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { cn } from "@/lib/utils"

type BranchRow = {
  id: string
  branch: string
  staffCount: number
  grossPay: number
  deductions: number
  netPayable: number
}

const BRANCH_ROWS: BranchRow[] = [
  {
    id: "maryland-lagos",
    branch: "Maryland Lagos",
    staffCount: 84,
    grossPay: 7_100_000,
    deductions: 900_000,
    netPayable: 6_200_000,
  },
  {
    id: "ibadan-hq",
    branch: "Ibadan HQ",
    staffCount: 62,
    grossPay: 5_300_000,
    deductions: 500_000,
    netPayable: 4_800_000,
  },
  {
    id: "abuja-regional",
    branch: "Abuja Regional",
    staffCount: 45,
    grossPay: 4_100_000,
    deductions: 300_000,
    netPayable: 3_800_000,
  },
  {
    id: "port-harcourt",
    branch: "Port Harcourt",
    staffCount: 38,
    grossPay: 3_950_000,
    deductions: 250_000,
    netPayable: 3_700_000,
  },
]

const NAIRA = "₦"

function formatNaira(amount: number): string {
  return `${NAIRA}${amount.toLocaleString("en-NG")}`
}

export default function Page() {
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [titleFilter, setTitleFilter] = useState("")

  const filtered = useMemo(() => {
    const q = titleFilter.trim().toLowerCase()
    return BRANCH_ROWS.filter((row) => {
      const matchesBranch =
        branchFilter === "All Branches" || row.branch === branchFilter
      const matchesTitle = !q || row.branch.toLowerCase().includes(q)
      return matchesBranch && matchesTitle
    })
  }, [branchFilter, titleFilter])

  const clearFilters = () => {
    setBranchFilter("All Branches")
    setTitleFilter("")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/payroll-approval"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Payroll Overview
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Review and authorize Payrolls across all branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
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
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters card */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">
                  Filter by Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  <option value="All Branches">All Branches</option>
                  {BRANCH_ROWS.map((row) => (
                    <option key={row.id} value={row.branch}>
                      {row.branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">
                  Job Title
                </label>
                <input
                  type="text"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  placeholder="Title search..."
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-3"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Notice banner */}
          <div className="mb-6 flex items-center gap-3 rounded bg-amber-50 border-l-4 border-amber-400 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <span className="text-[13px] font-bold text-[#111827]">
              Payroll Summary for October 2024
            </span>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Employees */}
            <div className="relative overflow-hidden rounded-xl border border-[#EEF1F6] bg-white p-5">
              <Users className="pointer-events-none absolute right-4 top-4 h-10 w-10 text-[#F1F3F9]" />
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Employees
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">524</div>
              <div className="mt-1 text-[12px] text-emerald-600">
                {"↗"} +12 since last month
              </div>
            </div>

            {/* Total Gross Pay */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Gross Pay
              </div>
              <div className="mt-2 text-[28px] font-bold text-[#111827]">
                {formatNaira(42_000_000)}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div className="h-full w-[82%] rounded-full bg-[#3B5BDB]" />
              </div>
            </div>

            {/* Total Deductions */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Total Deductions
              </div>
              <div className="mt-2 text-[28px] font-bold text-rose-600">
                {formatNaira(3_500_000)}
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">8.3% of Gross</div>
            </div>

            {/* Net Pay Payable (dark) */}
            <div className="rounded-xl border border-[#111827] bg-[#111827] p-5 text-white">
              <div className="text-[12px] font-semibold text-white/70">
                Net Pay Payable
              </div>
              <div className="mt-2 text-[28px] font-bold text-white">
                {formatNaira(38_500_000)}
              </div>
              <div className="mt-1 text-[12px] text-white/60">
                Ready for Disbursement
              </div>
            </div>
          </div>

          {/* Payroll Breakdown by Branch */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[18px] font-bold text-[#111827]">
                Payroll Breakdown by Branch
              </h2>
              <button
                type="button"
                className="flex items-center gap-2 text-[13px] font-semibold text-[#111827] hover:text-[#3B5BDB]"
              >
                <Download className="h-4 w-4" />
                Export Detailed CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Branch/Unit
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Staff Count
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Gross Pay
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Deductions
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Net Payable
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-[13px] text-[#6B7280]"
                      >
                        No branches match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                          {row.branch}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {row.staffCount}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatNaira(row.grossPay)}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatNaira(row.deductions)}
                        </td>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                          {formatNaira(row.netPayable)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="w-full rounded-b-xl bg-[#F8FAFC] px-4 py-3 text-center text-[13px] font-semibold text-[#3B5BDB] hover:bg-[#EEF2FF]"
            >
              View 12 Other Branches
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
