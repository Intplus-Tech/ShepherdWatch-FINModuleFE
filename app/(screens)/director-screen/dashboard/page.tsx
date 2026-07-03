"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Download,
  CheckCircle2,
  Flag,
  Eye,
  Banknote,
  Boxes,
  CreditCard,
  Building as BuildingIcon,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import SidebarNav from "@/components/navigation/SidebarNav"
import { useDashboardOverview } from "@/components/hooks/useDashboardOverview"
import { SkeletonStatGrid } from "@/components/ui/skeleton"
import { useIncomeExpenseTrend } from "@/components/hooks/useIncomeExpenseTrend"
import { useIncomeDistribution } from "@/components/hooks/useIncomeDistribution"
import { useBudgetVsActuals } from "@/components/hooks/useBudgetVsActuals"
import { useBranchSummary } from "@/components/hooks/useBranchSummary"
import { useRecentDashboardTransactions } from "@/components/hooks/useRecentDashboardTransactions"
import { useDashboardComplianceSummary } from "@/components/hooks/useDashboardComplianceSummary"
import { useDashboardTransactionsSummary } from "@/components/hooks/useDashboardTransactionsSummary"
import { sectionsToCsv, downloadCsv } from "@/lib/export-csv"

const kpiIcons = [Banknote, CreditCard, BuildingIcon, Boxes, MapPin]
const kpiIconStyles = [
  { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { iconBg: "bg-rose-50", iconColor: "text-rose-500" },
  { iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { iconBg: "bg-purple-50", iconColor: "text-purple-500" },
]

export default function Page() {
  const { user } = useAuth()

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const { overview, loading: analyticsLoading, error: analyticsError, fetchOverview } = useDashboardOverview()
  const { trendData, error: trendsError, fetchTrend } = useIncomeExpenseTrend()
  const { items: incomeItems, loading: incomeLoading } = useIncomeDistribution({ branchId: tenantId })
  const { series: budgetActualsSeries, loading: budgetActualsLoading, error: budgetActualsError } = useBudgetVsActuals({ branchId: tenantId, period: "Q1" })
  const { summary: branchSummary } = useBranchSummary({ branchId: tenantId })
  const activeBranchesCount = branchSummary.activeBranches
  const {
    transactions: rawTransactions,
    loading: txLoading,
    error: txError,
  } = useRecentDashboardTransactions({ branchId: tenantId, limit: 10 })

  // Month-over-month transactions summary — feeds the "vs last month" trend
  // on the Total Income stat card (GET /dashboard/transactions-summary).
  const { summary: txSummary, fetchTransactionsSummary } = useDashboardTransactionsSummary()
  // Compliance summary (deductions / remittances). Fetched here so the data is
  // available; surfaced via the compliance integration point below.
  const { summary: complianceSummary, fetchComplianceSummary } = useDashboardComplianceSummary()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)

  const formatCurrencyAbbrev = (value: number) => {
    const abs = Math.abs(value)
    const sign = value < 0 ? "-" : ""
    if (abs >= 1_000_000_000) return `${sign}\u20A6${(abs / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `${sign}\u20A6${(abs / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `${sign}\u20A6${(abs / 1_000).toFixed(1)}K`
    return formatCurrency(value)
  }

  useEffect(() => {
    if (tenantId) fetchOverview({ branchId: tenantId })
  }, [tenantId, fetchOverview])

  useEffect(() => {
    if (tenantId) fetchTrend({ branchId: tenantId })
  }, [tenantId, fetchTrend])

  useEffect(() => {
    // Defensive: hooks swallow 401/empty into their own error state.
    fetchTransactionsSummary(tenantId ? { branchId: tenantId } : {}).catch(() => {})
  }, [tenantId, fetchTransactionsSummary])

  useEffect(() => {
    fetchComplianceSummary(tenantId ? { branchId: tenantId } : {}).catch(() => {})
  }, [tenantId, fetchComplianceSummary])

  const formatDateLabel = (value?: string) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const categoryPalette = (label: string): { bg: string; color: string } => {
    const key = label.toLowerCase()
    if (key.includes("tithe")) return { bg: "bg-blue-50", color: "text-blue-600" }
    if (key.includes("building") || key.includes("project")) return { bg: "bg-purple-50", color: "text-purple-600" }
    if (key.includes("donation") || key.includes("offering")) return { bg: "bg-emerald-50", color: "text-emerald-600" }
    if (key.includes("missions") || key.includes("welfare")) return { bg: "bg-amber-50", color: "text-amber-600" }
    return { bg: "bg-slate-50", color: "text-slate-600" }
  }

  const transactions = React.useMemo(() => {
    return rawTransactions.map((tx, idx) => {
      const status = (tx.status ?? "PENDING").toUpperCase()
      const isFlagged = status.includes("FLAG")
      const typeLabel = tx.accountName || tx.transactionType || "General"
      const palette = categoryPalette(typeLabel)
      return {
        id: tx.id ?? `tx-${idx}`,
        date: formatDateLabel(tx.transactionDate),
        branch: tx.branchName || "Branch Transaction",
        type: typeLabel,
        typeBg: palette.bg,
        typeColor: palette.color,
        amount: formatCurrency(tx.amount),
        status: isFlagged ? "Flagged" : "Pending",
        statusBg: isFlagged ? "bg-rose-100" : "bg-amber-100",
        statusColor: isFlagged ? "text-rose-700" : "text-amber-700",
        statusDot: isFlagged ? "bg-rose-500" : "bg-amber-500",
        actions: isFlagged ? ["eye"] : ["check", "flag"],
      }
    })
  }, [rawTransactions])

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    try {
      const stamp = new Date().toISOString().split("T")[0]
      const overviewRows = overview
        ? [
            { metric: "Total Income", value: overview.totalIncome ?? 0 },
            { metric: "Total Expenses", value: overview.totalExpenses ?? 0 },
            { metric: "Net Position", value: overview.netPosition ?? 0 },
            { metric: "Active Branches", value: activeBranchesCount ?? 0 },
          ]
        : []

      const incomeRows = incomeItems.map((item) => ({
        category: item.category ?? "",
        accountName: item.accountName ?? "",
        totalAmount: Number(item.totalAmount ?? 0),
        percentage: Number(item.percentage ?? 0),
      }))

      const trendRows = (trendData?.series ?? []).map((entry) => ({
        period: entry.month ?? "",
        income: Number(entry.income ?? 0),
        expense: Number(entry.expenses ?? 0),
      }))

      const transactionRows = rawTransactions.map((tx) => ({
        date: tx.transactionDate ?? "",
        branch: tx.branchName ?? "",
        account: tx.accountName ?? tx.transactionType ?? "",
        amount: Number(tx.amount ?? 0),
        status: tx.status ?? "",
      }))

      // Compliance summary (GET /dashboard/compliance-summary) — included in the
      // export when available. This is also the integration point for any future
      // on-screen compliance card; `complianceSummary` is fetched above.
      const complianceRows = complianceSummary
        ? [
            { metric: "Total Deductions", value: Number(complianceSummary.totalDeductions ?? 0) },
            { metric: "Total Remitted", value: Number(complianceSummary.totalRemitted ?? 0) },
            { metric: "Outstanding", value: Number(complianceSummary.outstanding ?? 0) },
          ]
        : []

      // Transactions month-over-month summary (GET /dashboard/transactions-summary).
      const txSummaryRows = txSummary
        ? [
            { metric: "Current Month Total", value: Number(txSummary.currentMonthTotal ?? 0) },
            { metric: "Previous Month Total", value: Number(txSummary.previousMonthTotal ?? 0) },
            { metric: "Change %", value: Number(txSummary.changePercent ?? 0) },
            { metric: "Transaction Count", value: Number(txSummary.transactionCount ?? 0) },
          ]
        : []

      const sections = [
        { title: "Dashboard Overview", rows: overviewRows },
        { title: "Transactions Summary", rows: txSummaryRows },
        { title: "Compliance Summary", rows: complianceRows },
        { title: "Income Distribution", rows: incomeRows },
        { title: "Income vs Expense Trend", rows: trendRows },
        { title: "Recent Transactions", rows: transactionRows },
      ]
      const csv = sectionsToCsv(sections)
      downloadCsv(`director-dashboard_${stamp}.csv`, csv)
    } finally {
      setIsExporting(false)
    }
  }

  const statCards = useMemo(() => {
    const ov = (overview ?? {}) as {
      totalIncome?: number
      totalExpenses?: number
      netPosition?: number
      totalAssetValue?: number
      assetValue?: number
    }

    // Month-over-month change from the transactions summary endpoint, used to
    // populate the "vs last month" trend on the Total Income card.
    const changePercent = Number(txSummary?.changePercent)
    const hasChange = Number.isFinite(changePercent)
    const incomeTrend = hasChange ? `${Math.abs(changePercent).toFixed(1)}%` : ""
    const incomeIsPositive: boolean | null = hasChange ? changePercent >= 0 : null
    const incomeTrendColor = !hasChange
      ? "text-emerald-500"
      : changePercent >= 0
        ? "text-emerald-500"
        : "text-rose-500"

    return [
      {
        title: "Total Income",
        value: formatCurrency(ov.totalIncome ?? 0),
        trend: incomeTrend, trendText: "vs last month", trendColor: incomeTrendColor, isPositive: incomeIsPositive,
        icon: kpiIcons[0], iconBg: kpiIconStyles[0].iconBg, iconColor: kpiIconStyles[0].iconColor
      },
      {
        title: "Total Expenses",
        value: formatCurrency(ov.totalExpenses ?? 0),
        trend: "", trendText: "vs last month", trendColor: "text-rose-500", isPositive: null,
        icon: kpiIcons[1], iconBg: kpiIconStyles[1].iconBg, iconColor: kpiIconStyles[1].iconColor
      },
      {
        title: "Net Surplus",
        value: formatCurrency(ov.netPosition ?? 0),
        trend: "", trendText: "Healthy Margin", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[2], iconBg: kpiIconStyles[2].iconBg, iconColor: kpiIconStyles[2].iconColor
      },
      {
        title: "Total Asset Value",
        value: formatCurrency(ov.totalAssetValue ?? ov.assetValue ?? 0),
        trend: "", trendText: "Net book value", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[3], iconBg: kpiIconStyles[3].iconBg, iconColor: kpiIconStyles[3].iconColor
      },
      {
        title: "Active Branches",
        value: formatNumber(activeBranchesCount ?? 0),
        trend: "", trendText: "Reporting Live Data", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[4], iconBg: kpiIconStyles[4].iconBg, iconColor: kpiIconStyles[4].iconColor
      }
    ]
  }, [overview, activeBranchesCount, txSummary])

  const incomeChart = useMemo(() => {
    const sorted = [...incomeItems]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    const colorMap: Record<string, string> = {
      tithe: "#3B5BDB",
      tithes: "#3B5BDB",
      offering: "#10B981",
      offerings: "#10B981",
      donation: "#10B981",
      donations: "#10B981",
      special: "#8B5CF6",
      project: "#8B5CF6",
      missions: "#F59E0B",
      welfare: "#F59E0B",
      other: "#94A3B8",
    }
    const labelMap: Record<string, string> = {
      tithe: "Tithes",
      tithes: "Tithes",
      offering: "Offerings",
      offerings: "Offerings",
      donation: "Donations",
      donations: "Donations",
      special: "Special Project",
      project: "Special Project",
      missions: "Missions",
      welfare: "Welfare",
      other: "Other",
    }

    const segments = sorted.map((item) => {
      const categoryKey = String(item.category || "other").toLowerCase()
      return {
        label: item.accountName || labelMap[categoryKey] || "Other",
        percentage: Math.max(0, Number(item.percentage || 0)),
        amount: Math.max(0, Number(item.totalAmount || 0)),
        color: colorMap[categoryKey] || colorMap.other,
      }
    })

    if (segments.length === 0) {
      segments.push(
        { label: "Tithes", percentage: 0, amount: 0, color: colorMap.tithes },
        { label: "Offerings", percentage: 0, amount: 0, color: colorMap.offerings },
        { label: "Special Project", percentage: 0, amount: 0, color: colorMap.special }
      )
    }

    const conicResult = segments.reduce(
      (acc, segment) => {
        const end = Math.min(100, acc.cursor + segment.percentage)
        return {
          cursor: end,
          stops: [...acc.stops, `${segment.color} ${acc.cursor}% ${end}%`],
        }
      },
      { cursor: 0, stops: [] as string[] }
    )

    const stops =
      conicResult.cursor < 100
        ? [...conicResult.stops, `#E5E7EB ${conicResult.cursor}% 100%`]
        : conicResult.stops

    const totalAmount = segments.reduce((sum, segment) => sum + segment.amount, 0)

    return {
      segments,
      totalAmount,
      background: `conic-gradient(${stops.join(",")})`,
    }
  }, [incomeItems])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">

      <SidebarNav
        activeHref="/director-screen/dashboard"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] flex flex-col min-w-0 text-[#111827]">

        {/* Mobile Header Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={130} height={28} className="object-contain" />
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
             <Image src="/images/Beared%20Guy02-min%201.jpg" alt="User" width={32} height={32} className="h-full w-full object-cover" />
          </div>
        </header>

        <div className="mx-auto w-full px-4 sm:px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl overflow-hidden">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center justify-center sm:justify-start gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          {analyticsLoading ? (
            <div className="mb-6">
              <SkeletonStatGrid count={4} />
            </div>
          ) : (
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {analyticsError && (
              <div className="col-span-full text-[12px] font-medium text-[#EF4444]">{analyticsError}</div>
            )}
            {!analyticsError && statCards.length === 0 && (
              <div className="col-span-full text-[12px] font-medium text-[#6B7280]">No analytics data available.</div>
            )}
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] font-medium text-[#6B7280]">{card.title}</span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconBg}`}>
                      <Icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[26px] font-bold text-[#111827] tracking-tight">{card.value}</h3>
                    <p className="mt-1.5 flex items-center text-[12px] flex-wrap gap-y-1">
                      {card.trend && card.isPositive === true && (
                        <span className={`font-semibold flex items-center gap-1 ${card.trendColor}`}>
                           <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {card.trend}
                        </span>
                      )}
                      {card.trend && card.isPositive === false && (
                        <span className={`font-semibold flex items-center gap-1 ${card.trendColor}`}>
                           <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 9H2M9 9V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {card.trend}
                        </span>
                      )}
                      <span className={`ml-1 ${card.trendColor.includes('gray') ? card.trendColor : 'text-[#9CA3AF]'}`}>{card.trendText}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          )}

          {/* Charts Row */}
          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Area Chart placeholder */}
            <div className="col-span-1 flex flex-col rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827]">Budget vs. Actuals (Q1)</h3>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    {trendData?.trendDirection
                      ? `Trend direction: ${trendData.trendDirection}`
                      : "Actual income exceeded budget in March."}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]"></span>
                    <span className="text-[12px] font-semibold text-[#6B7280]">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3B5BDB]"></span>
                    <span className="text-[12px] font-semibold text-[#3B5BDB]">Actual</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative w-full px-2 sm:px-6 pb-2 text-[11px] text-[#9CA3AF] font-medium min-h-[180px] sm:min-h-[220px]">
                {(trendsError || budgetActualsError) && (
                  <div className="text-[12px] font-medium text-[#EF4444]">{budgetActualsError ?? trendsError}</div>
                )}
                {!budgetActualsError && budgetActualsSeries.length ? (
                  (() => {
                    const maxValue = Math.max(
                      1,
                      ...budgetActualsSeries.flatMap((p) => [p.budget, p.actual])
                    )
                    return (
                      <div className="flex items-end justify-between h-full gap-3">
                        {budgetActualsSeries.slice(0, 12).map((point, index) => {
                          const budgetH = Math.round((point.budget / maxValue) * 160)
                          const actualH = Math.round((point.actual / maxValue) * 160)
                          return (
                            <div key={`${point.label}-${index}`} className="flex flex-col items-center gap-2 flex-1">
                              <div className="flex items-end gap-1 h-[160px]">
                                <div
                                  className="w-[10px] rounded-t-full bg-[#D1D5DB]"
                                  style={{ height: `${Math.max(4, budgetH)}px` }}
                                  title={`Budget: ${formatCurrency(point.budget)}`}
                                />
                                <div
                                  className="w-[10px] rounded-t-full bg-[#3B5BDB]"
                                  style={{ height: `${Math.max(4, actualH)}px` }}
                                  title={`Actual: ${formatCurrency(point.actual)}`}
                                />
                              </div>
                              <span>{point.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                ) : budgetActualsLoading ? (
                  <div className="flex items-center justify-center h-full text-[12px] text-[#9CA3AF]">Loading chart...</div>
                ) : !trendsError && trendData?.series?.length ? (
                  <div className="flex items-end justify-between h-full gap-2">
                    {trendData.series.slice(0, 12).map((rawPoint, index: number) => {
                      const point = rawPoint as unknown as Record<string, unknown>
                      const label =
                        (typeof point?.label === "string" && point.label) ||
                        (typeof point?.period === "string" && point.period) ||
                        (typeof point?.month === "string" && point.month) ||
                        `P${index + 1}`
                      return (
                        <div key={label} className="flex flex-col items-center gap-2 flex-1">
                          <div className="h-[80px] w-[6px] rounded-full bg-[#E5E7EB]" />
                          <span>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-end justify-between h-full">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                  </div>
                )}
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="col-span-1 flex flex-col items-center sm:items-start rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
              <div className="w-full text-center sm:text-left">
                <h3 className="text-[16px] font-bold text-[#111827]">Income Distribution</h3>
                <p className="text-[13px] text-[#3B5BDB] mt-1 mb-8">Breakdown by category</p>
              </div>
              
              <div className="relative mx-auto h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] mb-8 shrink-0">
                <div className="h-full w-full rounded-full rotate-[-210deg]" style={{ background: incomeChart.background }} />
                <div className="absolute inset-[12px] rounded-full bg-white" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] text-[#6B7280] font-medium mb-1">Total</span>
                  <span className="text-[18px] font-bold text-[#3B5BDB]">
                    {incomeLoading ? "Loading..." : formatCurrencyAbbrev(incomeChart.totalAmount || overview?.totalIncome || 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {incomeChart.segments.map((segment) => (
                  <div key={segment.label} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                      <span className="text-[#4B5563] font-medium">
                        {segment.label} ({segment.percentage.toFixed(2)}%)
                      </span>
                    </div>
                    <span className="font-bold text-[#111827]">{formatCurrency(segment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between p-4 sm:p-6 pb-4 sm:pb-5">
              <div>
                <h3 className="text-[16px] font-bold text-[#111827]">Recent Transactions</h3>
                <p className="text-[13px] text-[#9CA3AF] mt-1">Transactions awaiting verification</p>
              </div>
              <button className="text-[13px] font-bold text-[#3B5BDB] hover:text-blue-700">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] w-32 border-y border-[#EEF1F6]">DATE</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">CATEGORY</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right border-y border-[#EEF1F6]">AMOUNT</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-center w-32 border-y border-[#EEF1F6]">STATUS</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right w-24 border-y border-[#EEF1F6]">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {txLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                          Loading transactions…
                        </td>
                      </tr>
                    ) : txError ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-rose-500">
                          {txError}
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                          No transactions available.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50 font-semibold text-[#111827] transition-colors">
                          <td className="px-6 py-5">{tx.date}</td>
                          <td className="px-6 py-5 text-[#3B5BDB] font-medium">{tx.branch}</td>
                          <td className="px-6 py-5">
                            <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.typeBg} ${tx.typeColor}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-bold">{tx.amount}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${tx.statusBg} ${tx.statusColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${tx.statusDot}`}></span>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-3.5 text-[#9CA3AF]">
                              {tx.actions.includes("check") && <CheckCircle2 className="h-4 w-4 cursor-pointer hover:text-emerald-500 transition-colors" />}
                              {tx.actions.includes("flag") && <Flag className="h-4 w-4 cursor-pointer hover:text-rose-500 transition-colors" />}
                              {tx.actions.includes("eye") && <Eye className="h-4 w-4 cursor-pointer hover:text-blue-500 transition-colors" />}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#EEF1F6] p-4 px-6">
              <span className="text-[13px] font-medium text-[#6B7280]">
                Showing <span className="text-[#111827] font-bold">{transactions.length ? `1-${transactions.length}` : 0}</span> of <span className="font-bold text-[#111827]">{transactions.length}</span> transactions
              </span>
              <div className="flex items-center gap-2">
                <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Previous</button>
                <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



