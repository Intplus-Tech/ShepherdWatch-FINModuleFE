"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BadgeCheck,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  HelpCircle,
  LayoutDashboard,
  PiggyBank,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Wrench,
  Zap,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { useDashboardOverview } from "@/components/hooks/useDashboardOverview"
import { useEffect } from "react"
import { useExpenseDistribution } from "@/components/hooks/useExpenseDistribution"
import { useFinancialCalendar } from "@/components/hooks/useFinancialCalendar"
import { useRecentDashboardTransactions } from "@/components/hooks/useRecentDashboardTransactions"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { useIncomeDistribution } from "@/components/hooks/useIncomeDistribution"
import { useIncomeExpenseTrend } from "@/components/hooks/useIncomeExpenseTrend"
import { useApprovalQueue } from "@/components/hooks/useApprovalQueue"
import { useBankBalances } from "@/components/hooks/useBankBalances"
import { useBudgetPerformance } from "@/components/hooks/useBudgetPerformance"
import { useDashboardTransactionsSummary } from "@/components/hooks/useDashboardTransactionsSummary"

export default function Page() {
  const { user, logout } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const router = useRouter()
  const pathname = usePathname()
  // The pastor's branch, resolved from the branch record when the session
  // carries none. Every figure on this page is scoped to it.
  const { branchId: contextBranchId } = useBranchContext()
  const branchId = contextBranchId || user?.branchId || user?.tenantId || user?.tenant?.id || ""
  const firstName = user?.firstName || (user?.name ? String(user.name).split(" ")[0] : "") || "Pastor"
  const monthLabel = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const handleLogout = async () => {
    try {
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Logout failed", error)
      router.replace("/login")
    }
  }
  
  const { transactions: rawTransactions, loading: txLoading, error: txError } = useRecentDashboardTransactions({
    branchId,
    limit: 10,
  })
  const { overview, fetchOverview, loading: overviewLoading } = useDashboardOverview()
  const { items: expenseItems, loading: expenseLoading } = useExpenseDistribution({ branchId })
  const { events: financialEvents, loading: calendarLoading, error: calendarError } = useFinancialCalendar({ branchId })

  const { items: incomeItems } = useIncomeDistribution({ branchId })
  const { trendData, fetchTrend } = useIncomeExpenseTrend()
  const { queueData, fetchQueue } = useApprovalQueue()
  const { bankData, fetchBankBalances } = useBankBalances()
  const { performanceData, fetchPerformance } = useBudgetPerformance()
  const { summary: txSummary, fetchTransactionsSummary } = useDashboardTransactionsSummary()

  useEffect(() => {
    if (!branchId) return
    fetchOverview({ branchId })
    fetchTrend({ branchId })
    fetchQueue({ branchId })
    fetchBankBalances({ branchId })
    fetchPerformance({ branchId })
    fetchTransactionsSummary({ branchId })
  }, [branchId, fetchOverview, fetchTrend, fetchQueue, fetchBankBalances, fetchPerformance, fetchTransactionsSummary])

  // Income split for the first card: tithes, offerings, and everything else.
  const incomeSplit = useMemo(() => {
    const total = incomeItems.reduce((sum, i) => sum + Number(i.totalAmount ?? 0), 0)
    const pct = (match: (key: string) => boolean) =>
      total > 0
        ? Math.round(
            (incomeItems.filter((i) => match(String(i.category ?? i.accountName ?? "").toLowerCase())).reduce((sum, i) => sum + Number(i.totalAmount ?? 0), 0) /
              total) *
              100
          )
        : 0
    const tithes = pct((k) => k.includes("tithe"))
    const offerings = pct((k) => k.includes("offering"))
    return { tithes, offerings, other: Math.max(0, 100 - tithes - offerings), hasData: total > 0 }
  }, [incomeItems])

  // Month-over-month change on income, from the transactions summary.
  const monthChange = txSummary?.changePercent
  const changeBadge =
    typeof monthChange === "number" && Number.isFinite(monthChange)
      ? { text: `${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(0)}% vs LM`, tone: monthChange >= 0 ? "bg-[#ECFDF3] text-emerald-600" : "bg-[#FEE2E2] text-[#EF4444]" }
      : null

  // Budgets with the highest utilisation lead the second card.
  const budgetBars = useMemo(() => {
    const rows = (performanceData?.budgets ?? []).map((b) => {
      const approved = Number(b.approved ?? 0)
      const spent = Number(b.spent ?? 0)
      const pctUsed = approved > 0 ? Math.min(100, Math.round((spent / approved) * 100)) : 0
      return { id: b.budgetId, title: b.title || "Budget", pctUsed }
    })
    return rows.sort((a, b) => b.pctUsed - a.pctUsed).slice(0, 3)
  }, [performanceData])
  const budgetTone = (pct: number) => (pct >= 90 ? { text: "text-[#EF4444]", bar: "bg-[#EF4444]", track: "bg-[#FEE2E2]" } : pct >= 75 ? { text: "text-[#F59E0B]", bar: "bg-[#F59E0B]", track: "bg-[#FEF3C7]" } : { text: "text-[#111827]", bar: "bg-[#3B5BDB]", track: "bg-[#F3F4F6]" })
  const worstBudgetPct = budgetBars[0]?.pctUsed ?? 0

  // Approval queue: what is waiting on this pastor specifically.
  const pastorQueue = queueData?.byStatus?.pending_pastor
  const pendingForPastor = Number(pastorQueue?.count ?? 0)
  const pendingTotal = Number(queueData?.totalPending ?? 0)

  // Bank accounts for the fourth card, largest first.
  const bankAccounts = useMemo(
    () => [...(bankData?.accounts ?? [])].sort((a, b) => Number(b.lastClosingBalance ?? 0) - Number(a.lastClosingBalance ?? 0)).slice(0, 3),
    [bankData]
  )
  const lowAccounts = bankAccounts.filter((a) => Number(a.lastClosingBalance ?? 0) < 50000)

  // Trailing six months of income for the trend chart, scaled to the tallest.
  const trendBars = useMemo(() => {
    const series = Array.isArray(trendData) ? trendData : trendData?.series ?? []
    const rows = [...series]
      .filter((r) => r.month)
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))
      .slice(-6)
    const max = Math.max(1, ...rows.map((r) => Number(r.income ?? 0)))
    return rows.map((r) => {
      const [y, m] = String(r.month).split("-")
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()
      return { month: label, value: Math.round((Number(r.income ?? 0) / max) * 100), income: Number(r.income ?? 0) }
    })
  }, [trendData])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value)

  const formatDateLabel = (value?: string) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatCalendarBadge = (value?: string) => {
    if (!value) return { month: "--", day: "--" }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return { month: "--", day: "--" }
    return {
      month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
      day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    }
  }

  const formatCalendarMeta = (amount: number, status?: string) => {
    const state = (status ?? "pending").replace(/_/g, " ")
    return `${formatCurrency(amount || 0)} • ${state}`
  }

  const transactions = useMemo(() => {
    return rawTransactions.map((tx, idx) => {
      const flowType = (tx.flowType ?? tx.transactionType ?? "").toUpperCase()
      const isPositive = flowType === "INFLOW" || flowType === "INCOME" || tx.amount >= 0
      const status = (tx.status ?? "UNVERIFIED").toUpperCase()
      const statusTone = status.includes("VERIFIED")
        ? "bg-emerald-50 text-emerald-600"
        : status.includes("PAID")
          ? "bg-blue-50 text-blue-600"
          : "bg-amber-50 text-amber-600"
      const icon = status.includes("VERIFIED") ? ShieldCheck : status.includes("PAID") ? BadgeCheck : ShieldAlert

      return {
        id: tx.id ?? `tx-${idx}`,
        date: formatDateLabel(tx.transactionDate),
        desc: tx.description || "Transaction",
        category:
          tx.accountName ||
          `${tx.accountCode ? `${tx.accountCode} ` : ""}${tx.transactionType || ""}`.trim() ||
          "General",
        amount: `${isPositive ? "+" : "-"}${formatCurrency(Math.abs(tx.amount))}`,
        status,
        statusTone,
        icon,
      }
    })
  }, [rawTransactions])

  const expenseChart = useMemo(() => {
    const grouped = new Map<string, number>()
    for (const item of expenseItems) {
      const key = String(item.category || "other").toLowerCase()
      grouped.set(key, (grouped.get(key) ?? 0) + Number(item.percentage || 0))
    }
    const sorted = Array.from(grouped.entries())
      .map(([category, percentage]) => ({ category, percentage }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)

    const colorMap: Record<string, string> = {
      operational: "#3B5BDB",
      programs: "#60A5FA",
      capital: "#CBD5E1",
      other: "#94A3B8",
    }
    const defaultNames: Record<string, string> = {
      operational: "Operational",
      programs: "Programs",
      capital: "Capital",
      other: "Other",
    }

    const segments = sorted.map((item) => ({
      label: defaultNames[item.category] ?? item.category,
      color: colorMap[item.category] ?? colorMap.other,
      percentage: Math.max(0, item.percentage),
    }))

    if (segments.length === 0) {
      segments.push(
        { label: "Operational", color: colorMap.operational, percentage: 0 },
        { label: "Programs", color: colorMap.programs, percentage: 0 },
        { label: "Capital", color: colorMap.capital, percentage: 0 }
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
    const conicStops =
      conicResult.cursor < 100
        ? [...conicResult.stops, `#E5E7EB ${conicResult.cursor}% 100%`]
        : conicResult.stops

    return {
      segments,
      background: `conic-gradient(${conicStops.join(",")})`,
    }
  }, [expenseItems])

  const approvalInbox = useMemo(() => {
    return rawTransactions
      .filter((tx) => (tx.status ?? "").toUpperCase() !== "VERIFIED")
      .slice(0, 3)
      .map((tx, idx) => ({
        id: tx.id ?? `TX-${idx + 1}`,
        title: tx.description || "Transaction Approval",
        meta: tx.accountName || tx.transactionType || "Pending review",
        amount: formatCurrency(Math.abs(Number(tx.amount ?? 0))),
        tag: (tx.status ?? "").toUpperCase() === "PENDING" ? "PENDING" : "",
        tagTone: "bg-amber-50 text-amber-600",
        iconTone: "bg-amber-50 text-amber-600",
        iconPath: "/images/user.svg",
      }))
  }, [rawTransactions])
  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F6] border-b-[0.67px] h-[42.67px]">
          <h1 className="text-[20px] font-semibold text-[#111827]">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input className="h-9 w-[260px] rounded-[12px] border-[#E5E7EB] bg-white pl-9 text-[13px]" placeholder="Search requisition..." />
            </div>
            <div className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
              <Bell className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827]">Welcome back, {firstName}</h2>
            <p className="text-[12px] text-[#9CA3AF]">Command Centre: Real-time branch financial health and approvals</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-[10px] border-[#E5E7EB] bg-white px-3 text-[12px] text-[#6B7280]">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              {monthLabel}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Monthly Income */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#3B5BDB]" />
              </div>
              {changeBadge && (
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${changeBadge.tone}`}>
                  {changeBadge.text}
                </div>
              )}
            </div>
            <div className="text-[12px] text-[#6B7280]">Total Monthly Income</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[20px] font-bold text-[#111827]">
                {overviewLoading ? "Loading..." : formatCurrency(overview?.totalIncome ?? 0)}
              </span>
            </div>

            <div className="mt-auto pt-4 space-y-2">
              {incomeSplit.hasData ? (
                <>
                  <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
                    <span>INCOME MIX</span>
                    <span className="text-[#3B5BDB]">{incomeSplit.tithes + incomeSplit.offerings}% tithes &amp; offerings</span>
                  </div>
                  <div className="flex h-[6px] w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div className="h-full bg-[#3B5BDB]" style={{ width: `${incomeSplit.tithes}%` }} />
                    <div className="h-full bg-[#93C5FD]" style={{ width: `${incomeSplit.offerings}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[10px] text-[#6B7280]">
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#3B5BDB]" />Tithes {incomeSplit.tithes}%</span>
                    <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#93C5FD]" />Offerings {incomeSplit.offerings}%</span>
                    <span className="flex items-center gap-1.5 col-span-2"><span className="h-1.5 w-1.5 rounded-full bg-[#E2E8F0]" />Other {incomeSplit.other}%</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-[#9CA3AF]">No income recorded this period.</div>
              )}
            </div>
          </div>

          {/* Card 2: Budget Utilization */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B]">
                <PiggyBank className="h-4 w-4" />
              </div>
              {budgetBars.length > 0 && worstBudgetPct >= 75 && (
                <div className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${worstBudgetPct >= 90 ? "bg-[#FEE2E2] border-[#FECACA] text-[#EF4444]" : "bg-[#FFFBEB] border-[#FDE68A] text-[#F59E0B]"}`}>
                  {worstBudgetPct >= 90 ? "Over limit" : "Caution"}
                </div>
              )}
            </div>
            <div className="text-[12px] text-[#6B7280]">Active Budgets</div>
            <div className="mt-1 text-[20px] font-bold text-[#111827] text-amber-600">
               {overviewLoading ? "Loading..." : (performanceData?.budgets?.length ?? overview?.activeBudgets ?? 0)}
            </div>

            <div className="mt-auto pt-3 space-y-3">
              {budgetBars.length === 0 ? (
                <div className="text-[10px] text-[#9CA3AF]">No approved budgets for this branch yet.</div>
              ) : (
                budgetBars.map((b) => {
                  const tone = budgetTone(b.pctUsed)
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-[11px] font-medium mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#111827] truncate pr-2">
                          {b.pctUsed >= 90 ? <TriangleAlert className="h-3 w-3 shrink-0 text-[#EF4444]" /> : b.pctUsed >= 75 ? <Zap className="h-3 w-3 shrink-0 text-[#F59E0B]" /> : null}
                          <span className="truncate">{b.title}</span>
                        </span>
                        <span className={tone.text}>{b.pctUsed}%</span>
                      </div>
                      <div className={`h-[6px] w-full overflow-hidden rounded-full ${tone.track}`}>
                        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${b.pctUsed}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Card 3: Approval Queue */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#8B5CF6]" />
              </div>
              {pendingForPastor > 0 && (
                <div className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#8B5CF6]">
                  {pendingForPastor} awaiting you
                </div>
              )}
            </div>
            <div className="text-[12px] text-[#6B7280]">Pending Transactions</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[20px] font-bold text-[#111827]">
                 {pendingTotal} Action {pendingTotal === 1 ? "Item" : "Items"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#6B7280]">
              {queueData?.totalAmount ? `${formatCurrency(queueData.totalAmount)} awaiting approval` : "Requisitions awaiting approval"}
            </div>
            <div className="mt-auto pt-4">
              <Button onClick={() => router.push("/branchlead-pastor/requisition-approval")} className="w-full h-9 rounded-[8px] bg-[#111827] hover:bg-[#1F2937] text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                Review Items <span className="text-[14px] leading-none mb-0.5">→</span>
              </Button>
            </div>
          </div>

          {/* Card 4: Bank Balances */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#ECFDF3] flex items-center justify-center">
                <Building2 className="h-4 w-4 text-[#10B981]" />
              </div>
              {lowAccounts.length > 0 && (
                <div className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[9px] font-semibold text-[#EF4444]">
                  {lowAccounts.length} {lowAccounts.length === 1 ? "account" : "accounts"} low
                </div>
              )}
            </div>
            <div className="text-[12px] text-[#6B7280]">Net Position</div>
            <div className="mt-1 text-[20px] font-bold text-[#111827]">
               {overviewLoading ? "Loading..." : formatCurrency(bankData?.totalBalance ?? overview?.netPosition ?? 0)}
            </div>

            <div className="mt-auto pt-2 space-y-2.5">
              {bankAccounts.length === 0 ? (
                <div className="text-[10px] text-[#9CA3AF]">No bank accounts on this branch yet.</div>
              ) : (
                bankAccounts.map((a, i) => {
                  const balance = Number(a.lastClosingBalance ?? 0)
                  const low = balance < 50000
                  return (
                    <div key={`${a.accountNumber}-${i}`} className={`flex items-center justify-between text-[11px] ${i > 0 ? "pt-2.5 border-t border-dashed border-[#E5E7EB]" : ""}`}>
                      <span className={`truncate pr-2 ${low ? "font-medium text-[#EF4444]" : "text-[#6B7280]"}`}>{a.accountName || a.bankName}</span>
                      <span className={`shrink-0 font-semibold ${low ? "text-[#EF4444]" : "text-[#111827]"}`}>
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: a.currency || "NGN", maximumFractionDigits: 0 }).format(balance)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#111827]">Income Trend</div>
                <div className="text-[12px] text-[#9CA3AF]">Trailing 6 Months Analysis</div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3B5BDB]" />Income</span>
              </div>
            </div>
            <div className="mt-4 h-[220px] rounded-[12px] bg-white px-4 py-6">
              <div className="grid h-full grid-cols-6 items-end gap-6 text-[10px] text-[#9CA3AF]">
                {trendBars.map((item) => (
                  <div key={item.month} className="flex flex-col items-center gap-3">
                    <div className="h-[140px] w-1.5 rounded-full bg-transparent relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-full bg-[#3B5BDB]"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">{item.month}</span>
                  </div>
                ))}
                {trendBars.length === 0 && (
                  <div className="col-span-6 self-center text-center text-[12px] text-[#9CA3AF]">No income recorded in the last six months.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="text-[14px] font-semibold text-[#111827]">Expense Distribution</div>
            <div className="mt-4 flex items-center justify-center flex-1">
              <div className="relative h-[160px] w-[160px] rounded-full">
                <div
                  className="absolute inset-0 rounded-full rotate-[-210deg]"
                  style={{ background: expenseChart.background }}
                />
                <div className="absolute inset-[18px] rounded-full bg-white" />
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center">
                  <div className="text-[16px] font-bold text-[#111827]">
                    {overviewLoading ? "Loading..." : formatCurrency(overview?.totalExpenses ?? 0)}
                  </div>
                  <div className="text-[10px] font-medium text-[#9CA3AF] mt-0.5">
                    {expenseLoading ? "Updating..." : "TOTAL EXPENSES"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-[12px] text-[#6B7280]">
              {expenseChart.segments.map((segment) => (
                <div key={segment.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="shrink-0"
                      style={{
                        backgroundColor: segment.color,
                        width: "7.51px",
                        height: "7.51px",
                        borderRadius: "9382.81px",
                        opacity: 1,
                      }}
                    />
                    {segment.label}
                  </span>
                  <span className="font-medium text-[#111827]">{segment.percentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#111827]">Approval Inbox</div>
              <button className="text-[12px] font-medium text-[#3B5BDB]">View All</button>
            </div>
            <div className="mt-4 space-y-3">
              {approvalInbox.length === 0 && (
                <div className="rounded-[12px] border border-[#EEF1F6] px-4 py-6 text-[12px] text-[#6B7280]">
                  No pending approvals.
                </div>
              )}
              {approvalInbox.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[12px] border border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex items-center justify-center shrink-0 ${item.iconTone}`}
                      style={{
                        width: "37.54px",
                        height: "37.54px",
                        borderRadius: "7.51px",
                        opacity: 1
                      }}
                    >
                      <Image src={item.iconPath} alt={item.title} width={18} height={18} className="w-[18px] h-[18px] object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] font-semibold text-[#111827]">#{item.id}: {item.title}</div>
                        {item.tag && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.tagTone}`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-0.5">{item.meta}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    <div className="text-[#111827] font-semibold">{item.amount}</div>
                    <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Details</Button>
                    <Button size="sm" className="h-7 rounded-[10px] bg-[#3B5BDB] text-[11px] text-white">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#111827]">Financial Calendar</div>
              <Calendar className="h-4 w-4 text-[#6B7280]" />
            </div>
            <div className="mt-4 space-y-3">
              {calendarLoading && <div className="text-[12px] text-[#6B7280]">Loading financial events...</div>}
              {!calendarLoading && calendarError && <div className="text-[12px] text-rose-500">{calendarError}</div>}
              {!calendarLoading && !calendarError && financialEvents.length === 0 && (
                <div className="text-[12px] text-[#6B7280]">No upcoming financial events.</div>
              )}
              {!calendarLoading &&
                !calendarError &&
                financialEvents.slice(0, 3).map((item, idx, arr) => {
                  const badge = formatCalendarBadge(item.date)
                  const isPrimary = idx === 0
                  return (
                    <div
                      key={`${item.resourceId || item.title}-${item.date}`}
                      className={`flex items-start gap-3 ${idx < arr.length - 1 ? "border-b border-[#F3F4F6] pb-3" : ""}`}
                    >
                      <div
                        className={`h-[45.04px] w-[45.04px] rounded-[7.51px] flex flex-col items-center justify-center text-[10px] font-semibold leading-tight ${
                          isPrimary ? "bg-[rgba(23,84,207,1)] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        <span>{badge.month}</span>
                        <span className={isPrimary ? "text-[14px]" : "text-[14px] text-[#111827]"}>{badge.day}</span>
                      </div>
                      <div>
                        <div className="text-[#111827] font-bold text-[13.14px] leading-[18.77px]">{item.title}</div>
                        <div className="text-[11.26px] leading-[15.01px] font-normal text-[#9CA3AF]">
                          {formatCalendarMeta(item.amount, item.status)}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
            </div>
          </div>

        <div className="mt-6 rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold text-[#111827]">Recent Transactions</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Filter</Button>
              <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Export</Button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[#9CA3AF]">
                <tr>
                  <th className="py-2 text-left font-medium">DATE</th>
                  <th className="py-2 text-left font-medium">DESCRIPTION</th>
                  <th className="py-2 text-left font-medium">CATEGORY</th>
                  <th className="py-2 text-left font-medium">AMOUNT</th>
                  <th className="py-2 text-left font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[12px] text-[#6B7280]">
                      Loading transactions…
                    </td>
                  </tr>
                ) : txError ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[12px] text-rose-500">
                      {txError}
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[12px] text-[#6B7280]">
                      No transactions available.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const Icon = tx.icon
                    return (
                      <tr key={tx.id} className="border-t border-[#EEF1F6]">
                        <td className="py-3 text-[#6B7280]">{tx.date}</td>
                        <td className="py-3 font-medium text-[#111827]">{tx.desc}</td>
                        <td className="py-3 text-[#6B7280]">{tx.category}</td>
                        <td className="py-3 font-semibold text-[#111827]">{tx.amount}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.statusTone}`}>
                            <Icon className="h-3 w-3" />
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}


