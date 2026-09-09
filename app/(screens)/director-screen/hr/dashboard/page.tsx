"use client"

import { useMemo, useState } from "react"
import { useDirectorHrDashboard } from "@/components/hooks/useHrDashboard"
import { useHrAttendanceMetrics } from "@/components/hooks/useHrAttendance"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUS_STYLES,
  formatDate,
  formatNaira,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  Search,
  UserPlus,
  Download,
  Users,
  UserCheck,
  UserMinus,
  TrendingDown,
  Wallet,
  CalendarCheck,
} from "lucide-react"

type StatCard = {
  label: string
  value: string
  note: string
  tone: "blue" | "red" | "grey"
  icon: React.ComponentType<{ className?: string }>
  iconTone: "blue" | "grey"
}

/** Branch bars are tinted by the health flag the API returns. */
const HEALTH_BAR: Record<string, string> = {
  GOOD: "bg-[#3B5BDB]",
  WARNING: "bg-[#F59E0B]",
  CRITICAL: "bg-[#EF4444]",
}

const NOTE_TONE: Record<StatCard["tone"], string> = {
  blue: "text-[#3B5BDB]",
  red: "text-[#EF4444]",
  grey: "text-[#9CA3AF]",
}

const ICON_TONE: Record<StatCard["iconTone"], string> = {
  blue: "bg-[#EEF2FF] text-[#3B5BDB]",
  grey: "bg-[#F3F4F6] text-[#6B7280]",
}

export default function Page() {
  const [search, setSearch] = useState("")

  const { dashboard, loading, error } = useDirectorHrDashboard()
  // Attendance health is its own resource; with no branchId it covers everyone.
  const { metrics: attendance } = useHrAttendanceMetrics()
  // There is no HR activity feed, so the newest staff records stand in for one.
  const { employees: recentStaff, loading: staffLoading } = useHrEmployees({ limit: 6 })

  const statCards = useMemo<StatCard[]>(
    () => [
      {
        label: "Total Headcount",
        value: String(dashboard.totalHeadcount),
        note: `Across ${dashboard.totalBranches} branches`,
        tone: "blue",
        icon: Users,
        iconTone: "blue",
      },
      {
        label: "Branches Reporting",
        value: String(dashboard.totalBranches),
        note: "Consolidated view",
        tone: "grey",
        icon: UserCheck,
        iconTone: "blue",
      },
      {
        label: "Active Staff Loans",
        value: String(dashboard.totalActiveLoans),
        note: "Running welfare book",
        tone: "grey",
        icon: UserMinus,
        iconTone: "grey",
      },
      {
        label: "Turnover Rate",
        value: `${dashboard.turnoverRate}%`,
        note: dashboard.turnoverRate > 10 ? "Above target" : "Within target",
        tone: dashboard.turnoverRate > 10 ? "red" : "grey",
        icon: TrendingDown,
        iconTone: "grey",
      },
      {
        label: "Total Payroll Cost",
        value: formatNaira(dashboard.totalPayrollCost, { compact: true }),
        note: formatNaira(dashboard.totalPayrollCost),
        tone: "grey",
        icon: Wallet,
        iconTone: "blue",
      },
      {
        label: "Attendance Rate",
        value: `${attendance.attendanceRate}%`,
        note: `${attendance.clockedInToday} clocked in today`,
        tone: "grey",
        icon: CalendarCheck,
        iconTone: "blue",
      },
    ],
    [dashboard, attendance]
  )

  const maxCount = useMemo(
    () =>
      dashboard.headcountByBranch.reduce((max, branch) => Math.max(max, branch.count), 0) || 1,
    [dashboard.headcountByBranch]
  )

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return recentStaff
    return recentStaff.filter((row) =>
      `${row.name} ${row.branchName} ${row.jobTitle}`.toLowerCase().includes(term)
    )
  }, [recentStaff, search])

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
                Global Workforce Overview • 142 Branches
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
              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#6B7280]">{card.label}</p>
                      <p className="text-[26px] font-bold text-[#111827] tracking-tight mt-2">
                        {card.value}
                      </p>
                    </div>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_TONE[card.iconTone]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  {card.note ? (
                    <p className={`text-[11px] font-semibold mt-2 ${NOTE_TONE[card.tone]}`}>
                      {card.note}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Headcount by Branch */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <h2 className="text-[16px] font-bold text-[#111827]">Headcount by Branch</h2>
              <div className="mt-5 flex flex-col gap-4">
                {dashboard.headcountByBranch.map((branch) => {
                  const pct = Math.round((branch.count / maxCount) * 100)
                  return (
                    <div key={branch.branchId || branch.branchName} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-[#111827]">
                          {branch.branchName || "Unnamed branch"}
                          {branch.state ? (
                            <span className="ml-1.5 text-[11px] text-[#9CA3AF]">{branch.state}</span>
                          ) : null}
                        </span>
                        <span className="text-[13px] font-bold text-[#111827]">{branch.count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                        <div
                          className={`h-full rounded-full ${HEALTH_BAR[branch.attendanceHealth] ?? "bg-[#93A5F0]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

                {loading ? (
                  <p className="text-[13px] text-[#6B7280]">Loading branch headcount…</p>
                ) : null}

                {error ? <p className="text-[13px] text-rose-600">{error}</p> : null}

                {!loading && !error && dashboard.headcountByBranch.length === 0 ? (
                  <p className="text-[13px] text-[#9CA3AF]">No branch headcount reported yet.</p>
                ) : null}
              </div>
            </div>

            {/* Recent HR Activity */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white">
              <div className="p-6 pb-4">
                <h2 className="text-[16px] font-bold text-[#111827]">Recent Staff Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Hire Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {filteredStaff.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                          {row.name || "Unnamed staff"}
                        </td>
                        <td className="px-4 py-3 text-[13px]">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(
                              EMPLOYMENT_STATUS_STYLES,
                              row.employmentStatus
                            )}`}
                          >
                            {statusLabel(EMPLOYMENT_STATUS_LABELS, row.employmentStatus).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                          {row.branchName || "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                          {formatDate(row.hireDate)}
                        </td>
                      </tr>
                    ))}

                    {!staffLoading && filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]">
                          No matching staff records.
                        </td>
                      </tr>
                    ) : null}
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
