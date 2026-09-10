"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrPanelState, HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { useDirectorHrOverview } from "@/components/hooks/hr/useHrDashboard"
import { useEmployeeMetrics, useEmployees } from "@/components/hooks/hr/useHrEmployees"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  branchName,
  lookup,
  periodLabel,
  userName,
} from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  Search,
  UserPlus,
  Download,
  Users,
  UserCheck,
  UserMinus,
  TrendingDown,
  Wallet,
  Building2,
} from "lucide-react"

const ICON_TONE = {
  blue: "bg-[#EEF2FF] text-[#3B5BDB]",
  grey: "bg-[#F3F4F6] text-[#6B7280]",
} as const

/** Compact naira for the KPI tiles. */
function compactNaira(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (Math.abs(value) >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `₦${Math.round(value / 1_000)}K`
  return formatCurrency(value, { maximumFractionDigits: 0 })
}

const HEALTH_TONE: Record<string, string> = {
  GOOD: "text-emerald-600",
  WARNING: "text-amber-600",
  CRITICAL: "text-rose-600",
  UNKNOWN: "text-[#9CA3AF]",
}

export default function Page() {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const overview = useDirectorHrOverview()
  const metrics = useEmployeeMetrics()

  /** Newest profiles stand in for the "recent HR activity" feed. */
  const recent = useEmployees({ limit: 10 })

  const data = overview.data
  const branches = useMemo(() => data?.headcountByBranch ?? [], [data])

  const maxCount = useMemo(
    () => Math.max(1, ...branches.map((b) => b.count)),
    [branches],
  )

  /** Weighted average attendance across branches with staff on the books. */
  const attendanceRate = useMemo(() => {
    const staffed = branches.filter((b) => b.count > 0)
    if (staffed.length === 0) return 0
    const present = staffed.reduce((sum, b) => sum + b.presentToday, 0)
    const total = staffed.reduce((sum, b) => sum + b.count, 0)
    return total > 0 ? Math.round((present / total) * 100) : 0
  }, [branches])

  const statCards = [
    {
      label: "Total Headcount",
      value: data ? String(data.metrics.totalHeadcount) : "—",
      note: `${data?.metrics.totalBranches ?? 0} branches`,
      icon: Users,
      iconTone: "blue" as const,
    },
    {
      label: "Active Staff",
      value: metrics.data ? String(metrics.data.activeStaff) : "—",
      note: `${metrics.data?.onLeaveStaff ?? 0} on leave`,
      icon: UserCheck,
      iconTone: "blue" as const,
    },
    {
      label: "Leavers This Year",
      value: data ? String(data.metrics.turnoverBasis.leaversThisYear) : "—",
      note: data
        ? `since ${formatDate(data.metrics.turnoverBasis.since, "medium")}`
        : "",
      icon: UserMinus,
      iconTone: "grey" as const,
    },
    {
      label: "Turnover Rate",
      value: data ? `${data.metrics.turnoverRate}%` : "—",
      note: "leavers ÷ average headcount",
      icon: TrendingDown,
      iconTone: "grey" as const,
    },
    {
      label: "Total Payroll Cost",
      value: data ? compactNaira(data.metrics.totalPayrollCost) : "—",
      note: data ? periodLabel(data.metrics.payrollPeriod) : "",
      icon: Wallet,
      iconTone: "blue" as const,
    },
    {
      label: "Active Loans",
      value: data ? String(data.metrics.totalActiveLoans) : "—",
      note: "org-wide",
      icon: Building2,
      iconTone: "grey" as const,
    },
  ]

  const filteredActivity = useMemo(() => {
    const items = recent.data?.items ?? []
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter(
      (employee) =>
        userName(employee.userId, employee.employeeId).toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query),
    )
  }, [recent.data, search])

  function handleExport() {
    const csv = rowsToCsv(
      branches.map((branch) => ({
        Branch: branch.branchName,
        State: branch.state ?? "",
        Headcount: branch.count,
        "Present Today": branch.presentToday,
        "Attendance Rate": `${branch.attendanceRate}%`,
        Health: branch.attendanceHealth,
      })),
    )
    downloadCsv(`headcount-by-branch-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/dashboard"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                HR Executive Dashboard
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Global Workforce Overview
                {data ? ` • ${data.metrics.totalBranches} Branches` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees, IDs..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
              <button
                onClick={() => router.push("/director-screen/hr/add-employee")}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                onClick={handleExport}
                disabled={branches.length === 0}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#EEF1F6] bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        {card.label}
                      </div>
                      <div className="mt-2 text-[26px] font-bold text-[#111827]">
                        <HrStatValue
                          isLoading={overview.isLoading || metrics.isLoading}
                          error={overview.error}
                          value={card.value}
                        />
                      </div>
                      {card.note && (
                        <div className="mt-1 text-[12px] text-[#9CA3AF]">{card.note}</div>
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
                        ICON_TONE[card.iconTone],
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Headcount by Branch */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#111827]">Headcount by Branch</h2>
                <span className="text-[11px] font-semibold text-[#9CA3AF]">
                  {attendanceRate}% present
                </span>
              </div>

              {overview.isLoading || overview.error || branches.length === 0 ? (
                <HrPanelState
                  isLoading={overview.isLoading}
                  error={overview.error}
                  isEmpty={branches.length === 0}
                  emptyTitle="No branches yet"
                  emptyDescription="Branch headcounts appear once staff are assigned."
                  onRetry={() => overview.refetch()}
                  className="mt-5 border-0 p-4"
                />
              ) : (
                <div className="mt-5 space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.branchId}>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#111827]">
                          {branch.branchName}
                        </span>
                        <span className="text-[12px] text-[#6B7280]">{branch.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-[#EEF1F6]">
                        <div
                          className="h-2 rounded-full bg-[#3B5BDB]"
                          style={{ width: `${(branch.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-[#9CA3AF]">
                          {branch.presentToday} present today
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            HEALTH_TONE[branch.attendanceHealth] ?? HEALTH_TONE.UNKNOWN,
                          )}
                        >
                          {branch.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent HR Activity */}
            <div className="overflow-hidden rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Recently Added Staff</h2>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">
                  Newest employee records across the organisation.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      {["Employee Name", "Job Title", "Branch", "Hire Date", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    <HrTableState
                      colSpan={5}
                      isLoading={recent.isLoading}
                      error={recent.error}
                      isEmpty={filteredActivity.length === 0}
                      emptyTitle="No staff records"
                      emptyDescription="Employee records will appear here."
                      onRetry={() => recent.refetch()}
                    />

                    {!recent.isLoading &&
                      !recent.error &&
                      filteredActivity.map((employee) => (
                        <tr key={employee._id}>
                          <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                            {userName(employee.userId, employee.employeeId)}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#4B5563]">
                            {employee.jobTitle}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#4B5563]">
                            {branchName(employee.branchId)}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#4B5563]">
                            {formatDate(employee.hireDate, "medium")}
                          </td>
                          <td className="px-4 py-3 text-[13px]">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                badgeFor(EMPLOYMENT_STATUS_BADGES, employee.employmentStatus),
                              )}
                            >
                              {lookup(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
