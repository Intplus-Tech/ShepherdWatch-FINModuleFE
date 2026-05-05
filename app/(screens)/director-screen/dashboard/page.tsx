"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Scale,
  Wallet,
  Building2,
  Users,
  Settings,
  Calendar,
  Download,
  CheckCircle2,
  Flag,
  Eye,
  Banknote,
  CreditCard,
  Building as BuildingIcon,
  MapPin,
  ChevronDown,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"
import { useDashboardOverview } from "@/components/hooks/useDashboardOverview"
import { useIncomeExpenseTrend } from "@/components/hooks/useIncomeExpenseTrend"
import { useIncomeDistribution } from "@/components/hooks/useIncomeDistribution"
import { useBudgetVsActuals } from "@/components/hooks/useBudgetVsActuals"
import { useBranchSummary } from "@/components/hooks/useBranchSummary"
import { useRecentDashboardTransactions } from "@/components/hooks/useRecentDashboardTransactions"

const kpiIcons = [Banknote, CreditCard, BuildingIcon, MapPin]
const kpiIconStyles = [
  { iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { iconBg: "bg-rose-50", iconColor: "text-rose-500" },
  { iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
  { iconBg: "bg-purple-50", iconColor: "text-purple-500" },
]

const navItems = [
  { label: "Dashboard", href: "/director-screen/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/director-screen/transaction", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/director-screen/budgeting", icon: Coins },
  { label: "Compliance", href: "/director-screen/compliance", icon: Scale },
  { label: "Asset", href: "/director-screen/assets", icon: Wallet },
  { label: "Branch Management", href: "/director-screen/branch-management", icon: Building2 },
  { label: "Users", href: "/director-screen/users", icon: Users },
  { label: "Settings", href: "/director-screen/settings", icon: Settings },
]

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (err) {
      console.error("Logout failed", err)
      router.replace("/login")
    }
  }

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

  const statCards = useMemo(() => {
    if (!overview) return []
    return [
      {
        title: "Total Income",
        value: formatCurrency(overview.totalIncome ?? 0),
        trend: "", trendText: "vs last month", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[0], iconBg: kpiIconStyles[0].iconBg, iconColor: kpiIconStyles[0].iconColor
      },
      {
        title: "Total Expenses",
        value: formatCurrency(overview.totalExpenses ?? 0),
        trend: "", trendText: "vs last month", trendColor: "text-rose-500", isPositive: null,
        icon: kpiIcons[1], iconBg: kpiIconStyles[1].iconBg, iconColor: kpiIconStyles[1].iconColor
      },
      {
        title: "Net Surplus",
        value: formatCurrency(overview.netPosition ?? 0),
        trend: "", trendText: "Healthy Margin", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[2], iconBg: kpiIconStyles[2].iconBg, iconColor: kpiIconStyles[2].iconColor
      },
      {
        title: "Active Branches",
        value: formatNumber(activeBranchesCount ?? 0),
        trend: "", trendText: "Reporting Live Data", trendColor: "text-emerald-500", isPositive: null,
        icon: kpiIcons[3], iconBg: kpiIconStyles[3].iconBg, iconColor: kpiIconStyles[3].iconColor
      }
    ]
  }, [overview, activeBranchesCount])

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
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:flex`}>
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4 relative">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-6 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 p-1 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1 uppercase">
            {user?.role ? String(user.role).replace(/_/g, ' ') : "Director"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/director-screen/dashboard"
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
                <Image
                  src="/images/Beared%20Guy02-min%201.jpg"
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111827]">
                  {user?.name && !['director user', 'super admin', 'admin user'].includes(user.name.toLowerCase()) ? user.name : user?.email || "Super Admin"}
                </span>
                <span className="text-[11px] font-medium text-[#6B7280] capitalize">
                  {user?.role ? String(user.role).replace(/_/g, ' ').toLowerCase() : "Director"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-[8px] py-2.5 px-3 -mx-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors w-[calc(100%+24px)] text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 text-[#111827]">
        
        {/* Mobile Header Top Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EEF1F6] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <Menu className="h-6 w-6" />
            </button>
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
              <BranchesDropdown label="All Branches" className="text-[12px]" />
              
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 flex-1 sm:flex-none justify-center sm:justify-start">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

              <button className="flex items-center justify-center sm:justify-start gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 w-full sm:w-auto sm:ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsLoading && (
              <div className="col-span-full text-[12px] font-medium text-[#6B7280]">Loading analytics...</div>
            )}
            {analyticsError && (
              <div className="col-span-full text-[12px] font-medium text-[#EF4444]">{analyticsError}</div>
            )}
            {!analyticsLoading && !analyticsError && statCards.length === 0 && (
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



