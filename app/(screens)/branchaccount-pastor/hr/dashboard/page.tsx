"use client"

import { useMemo } from "react"
import {
  Search,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  BarChart3,
  Activity,
  type LucideIcon,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrPanelState, HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { useAccountantHrDashboard } from "@/components/hooks/hr/useHrDashboard"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  value: string
  note?: string
  icon: LucideIcon
  iconClass: string
}

/** Compact naira for the KPI tiles (₦2.8M rather than ₦2,800,000.00). */
function compactNaira(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (Math.abs(value) >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `₦${Math.round(value / 1_000)}K`
  return formatCurrency(value, { maximumFractionDigits: 0 })
}

export default function Page() {
  const dashboard = useAccountantHrDashboard()
  const data = dashboard.data

  const stats: Stat[] = useMemo(
    () => [
      {
        label: "Total Employees",
        value: data ? String(data.kpis.totalEmployees) : "—",
        icon: Building2,
        iconClass: "text-[#3B5BDB]",
      },
      {
        label: "Payroll (MTD)",
        value: data ? compactNaira(data.kpis.payrollMtd) : "—",
        icon: CalendarDays,
        iconClass: "text-amber-500",
      },
      {
        label: "Active Loans",
        value: data ? String(data.kpis.activeLoans) : "—",
        icon: FileText,
        iconClass: "text-[#6B7280]",
      },
      {
        label: "Loan Balance",
        value: data ? formatCurrency(data.kpis.loanBalance, { maximumFractionDigits: 0 }) : "—",
        icon: BarChart3,
        iconClass: "text-emerald-500",
      },
    ],
    [data],
  )

  const trend = useMemo(() => data?.workforceCostTrend ?? [], [data])

  /** Bars are scaled against the tallest payroll month in the series. */
  const maxCost = useMemo(
    () => Math.max(1, ...trend.map((point) => Math.max(point.payroll, point.deductions))),
    [trend],
  )

  const portfolio = data?.loanPortfolioHealth ?? []
  const actions = data?.recentActions ?? []

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
                  className={cn("absolute right-5 top-5 h-8 w-8 opacity-20", stat.iconClass)}
                />
                <div className="text-[12px] text-[#6B7280]">{stat.label}</div>
                <div className="mt-2 text-[24px] font-bold text-[#111827]">
                  <HrStatValue
                    isLoading={dashboard.isLoading}
                    error={dashboard.error}
                    value={stat.value}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Workforce Cost Trend */}
        <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[#111827]">Workforce Cost Trend</h2>
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Net payroll
              </span>
              <span className="flex items-center gap-1.5 text-[#6B7280]">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                Deductions
              </span>
            </div>
          </div>

          {dashboard.isLoading || dashboard.error || trend.length === 0 ? (
            <HrPanelState
              isLoading={dashboard.isLoading}
              error={dashboard.error}
              isEmpty={trend.length === 0}
              emptyTitle="No payroll history"
              emptyDescription="Cost trends appear once payroll runs are recorded."
              onRetry={() => dashboard.refetch()}
              className="mt-6 border-0"
            />
          ) : (
            <div className="mt-8 flex items-end justify-between gap-4 overflow-x-auto sm:gap-8">
              {trend.map((point) => (
                <div
                  key={point.period}
                  className="flex min-w-[48px] flex-1 flex-col items-center gap-2"
                >
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col items-center justify-end">
                      <span className="mb-1 text-[10px] font-bold text-emerald-600">
                        {compactNaira(point.payroll)}
                      </span>
                      <div
                        className="w-6 rounded-t-md bg-emerald-500"
                        style={{ height: `${Math.max(4, (point.payroll / maxCost) * 160)}px` }}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-end">
                      <span className="mb-1 text-[10px] font-bold text-red-500">
                        {compactNaira(point.deductions)}
                      </span>
                      <div
                        className="w-6 rounded-t-md bg-red-500"
                        style={{
                          height: `${Math.max(4, (point.deductions / maxCost) * 160)}px`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase text-[#6B7280]">
                    {point.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loan Portfolio + Recent Actions */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: Loan Portfolio Health */}
          <div className="lg:col-span-2 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">Loan Portfolio Health</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    {["Purpose", "Active", "Total Principal"].map((h) => (
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
                    colSpan={3}
                    isLoading={dashboard.isLoading}
                    error={dashboard.error}
                    isEmpty={portfolio.length === 0}
                    emptyTitle="No active loans"
                    emptyDescription="Approved loans are grouped here by purpose."
                    onRetry={() => dashboard.refetch()}
                  />

                  {!dashboard.isLoading &&
                    !dashboard.error &&
                    portfolio.map((row) => (
                      <tr key={row.category}>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                          {row.category}
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{row.count}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {formatCurrency(row.principal, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Recent Financial Actions */}
          <div className="lg:col-span-1 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">Recent Financial Actions</h2>

            {dashboard.isLoading || dashboard.error || actions.length === 0 ? (
              <HrPanelState
                isLoading={dashboard.isLoading}
                error={dashboard.error}
                isEmpty={actions.length === 0}
                emptyTitle="No recent activity"
                emptyDescription="Audited HR actions appear here."
                onRetry={() => dashboard.refetch()}
                className="mt-5 border-0 p-4"
              />
            ) : (
              <ol className="mt-5 space-y-6">
                {actions.map((item, i) => {
                  const isLast = i === actions.length - 1
                  return (
                    <li key={`${item.action}-${item.timestamp}`} className="relative flex gap-3">
                      {!isLast && (
                        <span className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-[#F3F4F6]" />
                      )}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
                        <Activity className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-[#111827]">{item.action}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          {formatDate(item.timestamp, "datetime")}
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
                          by {item.user}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
