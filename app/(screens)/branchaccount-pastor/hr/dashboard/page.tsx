"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccountantHrDashboard } from "@/components/hooks/useHrDashboard"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { LOAN_STATUS_LABELS, LOAN_STATUS_STYLES, formatDate, formatNaira, statusLabel, statusStyle } from "@/lib/hr/display"
import {
  Search,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  BarChart3,
  Banknote,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

/** Bars are drawn relative to the tallest month in the series. */
const MAX_BAR_PX = 160

export default function Page() {
  const [chartRange, setChartRange] = useState<"6 Months" | "1 Year">("6 Months")
  const router = useRouter()

  const { dashboard, loading, error } = useAccountantHrDashboard()
  // No financial-activity feed exists yet, so the newest loan cases stand in.
  const { loans: recentLoans } = useHrLoans({ limit: 3 })

  const stats = useMemo(
    () => [
      {
        label: "Total Employees",
        value: String(dashboard.totalEmployees),
        icon: Building2,
        iconClass: "text-[#3B5BDB]",
      },
      {
        label: "Payroll (MTD)",
        value: formatNaira(dashboard.payrollMtd, { compact: true }),
        note: formatNaira(dashboard.payrollMtd),
        icon: CalendarDays,
        iconClass: "text-amber-500",
      },
      {
        label: "Active Loans",
        value: String(dashboard.activeLoans),
        icon: FileText,
        iconClass: "text-[#6B7280]",
      },
      {
        label: "Loan Balance",
        value: formatNaira(dashboard.loanBalance),
        icon: BarChart3,
        iconClass: "text-emerald-500",
      },
    ],
    [dashboard]
  )

  const trend = useMemo(() => {
    const series = chartRange === "6 Months"
      ? dashboard.workforceCostTrend.slice(-6)
      : dashboard.workforceCostTrend.slice(-12)
    const peak = series.reduce((max, entry) => Math.max(max, entry.payroll, entry.deductions), 0)
    return series.map((entry) => ({
      ...entry,
      payrollHeight: peak ? Math.max((entry.payroll / peak) * MAX_BAR_PX, 4) : 4,
      deductionHeight: peak ? Math.max((entry.deductions / peak) * MAX_BAR_PX, 4) : 4,
    }))
  }, [dashboard.workforceCostTrend, chartRange])

  const portfolioTotal = dashboard.loanPortfolioHealth.reduce(
    (sum, entry) => sum + entry.principal,
    0
  )

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/dashboard" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
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

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative rounded-xl border border-[#EEF1F6] bg-white p-5"
              >
                <Icon
                  className={cn(
                    "absolute right-5 top-5 h-8 w-8 opacity-20",
                    stat.iconClass
                  )}
                />
                <div className="text-[12px] text-[#6B7280]">{stat.label}</div>
                <div className="mt-2 text-[24px] font-bold text-[#111827]">
                  {stat.value}
                </div>
                {stat.note ? (
                  <div className="mt-1 text-[12px] text-[#6B7280]">{stat.note}</div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Workforce Cost Trend */}
        <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Workforce Cost Trend
            </h2>
            <div className="flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
              {(["6 Months", "1 Year"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                    chartRange === range
                      ? "bg-[#EEF2FF] text-[#3B5BDB]"
                      : "text-[#6B7280]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-8 flex items-end justify-between gap-4 sm:gap-8 overflow-x-auto">
            {trend.map((entry) => (
              <div
                key={entry.month}
                className="flex flex-1 flex-col items-center gap-2 min-w-[48px]"
              >
                <div className="flex items-end gap-2">
                  <div className="flex flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold text-emerald-600">
                      {formatNaira(entry.payroll, { compact: true })}
                    </span>
                    <div
                      className="w-6 rounded-t-md bg-emerald-500"
                      style={{ height: `${entry.payrollHeight}px` }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold text-red-500">
                      {formatNaira(entry.deductions, { compact: true })}
                    </span>
                    <div
                      className="w-6 rounded-t-md bg-red-500"
                      style={{ height: `${entry.deductionHeight}px` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#6B7280]">
                  {entry.month.toUpperCase()}
                </span>
              </div>
            ))}

            {!loading && trend.length === 0 ? (
              <p className="w-full py-10 text-center text-[13px] text-[#9CA3AF]">
                No payroll history for this branch yet.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-4 text-[11px] text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Payroll
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
              Deductions
            </span>
            {error ? <span className="text-rose-600">{error}</span> : null}
          </div>
        </div>

        {/* Loan Portfolio + Recent Actions */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: Loan Portfolio Health */}
          <div className="lg:col-span-2 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Loan Portfolio Health
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Category
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Active
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Total Principal
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Share of Book
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {dashboard.loanPortfolioHealth.map((c) => {
                    const share = portfolioTotal
                      ? Math.round((c.principal / portfolioTotal) * 100)
                      : 0
                    return (
                      <tr key={c.category}>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                          {c.category}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{c.count}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatNaira(c.principal)}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-[#F3F4F6]">
                              <div
                                className="h-2 rounded-full bg-[#3B5BDB]"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-semibold text-[#4B5563]">
                              {share}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {!loading && dashboard.loanPortfolioHealth.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]">
                        No loans on the book for this branch.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Recent Financial Actions */}
          <div className="lg:col-span-1 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Recent Financial Actions
            </h2>
            <ol className="mt-5 space-y-6">
              {recentLoans.map((loan, i) => {
                const isLast = i === recentLoans.length - 1
                return (
                  <li key={loan.id} className="relative flex gap-3">
                    {!isLast && (
                      <span className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-[#F3F4F6]" />
                    )}
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
                      <Banknote className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/branchaccount-pastor/hr/loan-detail?loanId=${loan.id}`)
                        }
                        className="text-left text-[13px] font-bold text-[#111827] hover:text-[#3B5BDB]"
                      >
                        Loan: {loan.employeeName || "Staff member"}
                      </button>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {formatDate(loan.createdAt)}
                      </div>
                      {loan.purpose ? (
                        <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
                          {loan.purpose}
                        </p>
                      ) : null}
                      <span
                        className={cn(
                          "mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                          statusStyle(LOAN_STATUS_STYLES, loan.status)
                        )}
                      >
                        {formatNaira(loan.amount)} · {statusLabel(LOAN_STATUS_LABELS, loan.status)}
                      </span>
                    </div>
                  </li>
                )
              })}

              {recentLoans.length === 0 ? (
                <li className="text-[13px] text-[#9CA3AF]">No recent loan activity.</li>
              ) : null}
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
