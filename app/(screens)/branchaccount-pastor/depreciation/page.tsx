"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Database,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  ArrowLeft,
  Calendar,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useDepreciationAnalysis } from "@/components/hooks/useAssetOverview"
import { formatCurrency } from "@/lib/format"

type CategoryRow = {
  category: string
  method: string
  cost: string
  opening: string
  current: string
  closing: string
  methodColor: string
}

type MonthItem = {
  label: string
  value: string
  status: "past" | "current" | "future"
}

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

const pickNumber = (raw: unknown, ...keys: string[]): number => {
  if (!raw || typeof raw !== "object") return 0
  const obj = raw as Record<string, unknown>
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === "number" && Number.isFinite(v)) return v
  }
  return 0
}

const pickString = (raw: unknown, ...keys: string[]): string => {
  if (!raw || typeof raw !== "object") return ""
  const obj = raw as Record<string, unknown>
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === "string" && v.trim()) return v
  }
  return ""
}

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const [fiscalYear, setFiscalYear] = useState<number>(currentYear)
  const { user } = useAuth()
  const branchId = user?.tenantId ?? user?.tenant?.id ?? ""
  const { data, isLoading, error } = useDepreciationAnalysis({ branchId, fiscalYear })

  const { kpis, categoryRows, monthItems, fiscalYearDisplay } = useMemo(() => {
    const payload = (data && typeof data === "object" ? (data as Record<string, unknown>).data ?? data : null) as
      | Record<string, unknown>
      | null
    const totalAnnual = pickNumber(payload, "totalAnnualDepreciation")
    const monthlyAvg = totalAnnual / 12
    const categoriesRaw = Array.isArray((payload as Record<string, unknown> | null)?.categories)
      ? ((payload as Record<string, unknown>).categories as unknown[])
      : []
    let accumulated = 0
    const rows: CategoryRow[] = categoriesRaw.map((c) => {
      const cost = pickNumber(c, "totalCost", "cost")
      const opening = pickNumber(c, "openingNBV", "openingNbv", "opening")
      const annual = pickNumber(c, "annualDepreciation", "currentDepreciation", "annual")
      const closing = pickNumber(c, "closingNBV", "closingNbv", "closing")
      accumulated += cost - closing
      const method = pickString(c, "depreciationMethod", "method") || "Straight-line"
      const isReducing = /reducing/i.test(method)
      return {
        category: pickString(c, "className", "category", "name") || "Uncategorised",
        method,
        cost: formatCurrency(cost),
        opening: formatCurrency(opening),
        current: formatCurrency(annual),
        closing: formatCurrency(closing),
        methodColor: isReducing
          ? "bg-[#FFFbeb] text-[#D97706]"
          : "bg-[#EFF6FF] text-[#2563EB]",
      }
    })

    const monthlyRaw = Array.isArray((payload as Record<string, unknown> | null)?.monthlyDistribution)
      ? ((payload as Record<string, unknown>).monthlyDistribution as unknown[])
      : []
    const currentMonth = new Date().getMonth() + 1
    const months: MonthItem[] = monthlyRaw.map((m, idx) => {
      const monthNumber = pickNumber(m, "month") || idx + 1
      const dep = pickNumber(m, "depreciation", "amount", "value")
      const status: MonthItem["status"] =
        monthNumber < currentMonth ? "past" : monthNumber === currentMonth ? "current" : "future"
      return {
        label: MONTH_LABELS[(monthNumber - 1) % 12] ?? `M${monthNumber}`,
        value: formatCurrency(dep),
        status,
      }
    })

    return {
      kpis: {
        annual: totalAnnual,
        monthly: monthlyAvg,
        accumulated,
      },
      categoryRows: rows,
      monthItems: months,
      fiscalYearDisplay: pickNumber(payload, "fiscalYear") || fiscalYear,
    }
  }, [data, fiscalYear])

  const totals = useMemo(() => {
    return categoryRows.reduce(
      (acc, row, idx) => {
        const src = (((data as Record<string, unknown> | null)?.data as Record<string, unknown> | undefined)
          ?.categories ?? (data as Record<string, unknown> | null)?.categories ?? []) as unknown[]
        const raw = src[idx] ?? {}
        acc.cost += pickNumber(raw, "totalCost", "cost")
        acc.opening += pickNumber(raw, "openingNBV", "openingNbv", "opening")
        acc.current += pickNumber(raw, "annualDepreciation", "currentDepreciation", "annual")
        acc.closing += pickNumber(raw, "closingNBV", "closingNbv", "closing")
        return acc
      },
      { cost: 0, opening: 0, current: 0, closing: 0 }
    )
  }, [categoryRows, data])

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full font-sans antialiased" style={{ fontFamily: '"Public Sans", sans-serif' }}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3 pb-8">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#3B5BDB] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 tracking-wide">Accountant's View</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1 mt-2">
            {[
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database, active: true },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Help Center
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Alex Morgan</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium">Accountant</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[14px] font-semibold text-[#111827]">
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search transactions..."
                className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
              />
            </div>
            <button type="button" aria-label="Notifications" className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Back Button */}
            <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors mb-4 text-[13px] font-semibold tracking-wide">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Header Section */}
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1
                  className="text-[26.21px] font-black text-[#111827] tracking-[-0.66px] leading-[32.76px] mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif", verticalAlign: "middle" }}
                >
                  Depreciation Schedule & Analysis
                </h1>
                <p className="text-[14px] text-[#6B7280] font-medium tracking-tight">
                  Fiscal year {fiscalYearDisplay} · {isLoading ? "Loading…" : `${categoryRows.length} asset categor${categoryRows.length === 1 ? "y" : "ies"}`}
                </p>
                {error && (
                  <p className="mt-2 text-[12px] font-semibold text-[#EF4444]">{error}</p>
                )}
              </div>
              <label className="flex items-center gap-2 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                <span>Fiscal Year</span>
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(Number(e.target.value))}
                  className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20 outline-none"
                >
                  {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </label>
            </header>

            {/* 3 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1 */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7 relative flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">ANNUAL CHARGE</div>
                  <Calendar className="h-5 w-5 text-[#3B5BDB]" strokeWidth={2.5} />
                </div>
                <div className="mb-2">
                  <div
                    className="text-[#111827]"
                    style={{
                      fontFamily: '"Public Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '26.67px',
                      lineHeight: '33.33px',
                      letterSpacing: '-0.67px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {isLoading ? "—" : formatCurrency(kpis.annual)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#6B7280] mt-auto">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>FY {fiscalYearDisplay} total</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7 relative flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">MONTHLY CHARGE</div>
                  <Calendar className="h-5 w-5 text-[#3B5BDB]" strokeWidth={2.5} />
                </div>
                <div className="mb-2">
                  <div
                    className="text-[#111827]"
                    style={{
                      fontFamily: '"Public Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '26.67px',
                      lineHeight: '33.33px',
                      letterSpacing: '-0.67px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {isLoading ? "—" : formatCurrency(kpis.monthly)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#6B7280] mt-auto">
                  <TrendingDown className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>Annual / 12</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 sm:p-7 relative flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">ACCUMULATED DEPR</div>
                  <WalletIcon className="h-5 w-5 text-[#3B5BDB]" strokeWidth={2.5} />
                </div>
                <div className="mb-2">
                  <div
                    className="text-[#111827]"
                    style={{
                      fontFamily: '"Public Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '26.67px',
                      lineHeight: '33.33px',
                      letterSpacing: '-0.67px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {isLoading ? "—" : formatCurrency(kpis.accumulated)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#6B7280] mt-auto">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>Cost − closing NBV</span>
                </div>
              </div>
            </div>

            {/* Category-wise Depreciation Table Card */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
              
              {/* Header */}
              <div className="p-6 sm:p-8 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <h2 className="text-[18px] font-[800] text-[#111827] tracking-tight">Category-wise Depreciation</h2>
                <button className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors leading-none">
                  View All Categories
                </button>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-[#EEF1F6]/70">
                {isLoading && categoryRows.length === 0 && (
                  <div className="p-6 text-[13px] font-medium text-[#6B7280]">Loading depreciation analysis…</div>
                )}
                {!isLoading && categoryRows.length === 0 && (
                  <div className="p-6 text-[13px] font-medium text-[#6B7280]">No depreciation data available for {fiscalYearDisplay}.</div>
                )}
                {categoryRows.map((row, idx) => (
                  <div key={idx} className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[14px] font-[800] text-[#111827]">{row.category}</div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-[20px] text-[11px] font-[800] tracking-wide ${row.methodColor}`}>
                        {row.method}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Cost</span>
                        <span className="text-[13px] font-bold text-[#111827]">{row.cost}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Opening NBV</span>
                        <span className="text-[13px] font-bold text-[#111827]">{row.opening}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Current Depr</span>
                        <span className="text-[13px] font-[800] text-[#EF4444]">{row.current}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Closing NBV</span>
                        <span className="text-[13px] font-[900] text-[#111827]">{row.closing}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {categoryRows.length > 0 && (
                  <div className="p-5 sm:p-6 bg-[#F8FAFC]">
                    <div className="text-[11px] font-[900] text-[#111827] uppercase tracking-wide">Total Asset Portfolio</div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Cost</span>
                        <span className="text-[14px] font-[900] text-[#111827]">{formatCurrency(totals.cost)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Opening NBV</span>
                        <span className="text-[14px] font-[900] text-[#111827]">{formatCurrency(totals.opening)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Current Depr</span>
                        <span className="text-[14px] font-[900] text-[#EF4444]">{formatCurrency(totals.current)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Closing NBV</span>
                        <span className="text-[14px] font-[900] text-[#2563EB]">{formatCurrency(totals.closing)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[800px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6]">
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[16%]">ASSET CATEGORY</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[20%] text-center">METHOD</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">COST</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">OPENING NBV</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">CURRENT DEPR</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">CLOSING NBV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]/70">
                    {isLoading && categoryRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 sm:px-8 text-center text-[13px] font-medium text-[#6B7280]">Loading depreciation analysis…</td>
                      </tr>
                    )}
                    {!isLoading && categoryRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 sm:px-8 text-center text-[13px] font-medium text-[#6B7280]">No depreciation data available for {fiscalYearDisplay}.</td>
                      </tr>
                    )}
                    {categoryRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[13px] font-[800] text-[#111827]">{row.category}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-[20px] text-[11px] font-[800] tracking-wide ${row.methodColor}`}>
                            {row.method}
                          </span>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-bold text-[#6B7280]">{row.cost}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-bold text-[#6B7280]">{row.opening}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-[800] text-[#EF4444]">{row.current}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-[900] text-[#111827]">{row.closing}</div>
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    {categoryRows.length > 0 && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={2} className="py-6 px-6 sm:px-8">
                          <div className="text-[13px] font-[900] text-[#111827] uppercase tracking-wide">TOTAL ASSET PORTFOLIO</div>
                        </td>
                        <td className="py-6 px-6 sm:px-8 text-right">
                          <div className="text-[14px] font-[900] text-[#111827]">{formatCurrency(totals.cost)}</div>
                        </td>
                        <td className="py-6 px-6 sm:px-8 text-right">
                          <div className="text-[14px] font-[900] text-[#111827]">{formatCurrency(totals.opening)}</div>
                        </td>
                        <td className="py-6 px-6 sm:px-8 text-right">
                          <div className="text-[14px] font-[900] text-[#EF4444]">{formatCurrency(totals.current)}</div>
                        </td>
                        <td className="py-6 px-6 sm:px-8 text-right">
                          <div className="text-[14px] font-[900] text-[#2563EB]">{formatCurrency(totals.closing)}</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Distribution Block */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 sm:pt-8 overflow-hidden">
              <div className="px-6 sm:px-8 mb-8">
                <h2 className="text-[18px] font-[800] text-[#111827] tracking-tight mb-1">{fiscalYearDisplay} Monthly Distribution</h2>
                <p className="text-[13px] font-medium text-[#6B7280]">Allocation of depreciation expense across the current calendar year</p>
                {error && (
                  <p className="mt-2 text-[12px] font-medium text-[#EF4444]">{error}</p>
                )}
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden px-6 sm:px-8 pb-6 sm:pb-8">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {monthItems.map((month, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 rounded-[10px] border border-[#EEF1F6] bg-white py-3">
                      <div className="text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-wider">{month.label}</div>
                      <div
                        className={`text-[12px] ${
                          month.status === 'past'
                            ? 'font-medium text-[#6B7280]'
                            : month.status === 'current'
                            ? 'font-[900] text-[#111827]'
                            : 'font-medium text-[#D1D5DB]'
                        }`}
                      >
                        {month.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Row */}
              <div className="hidden lg:block w-full overflow-x-auto no-scrollbar pb-6 sm:pb-8 px-6 sm:px-8">
                <div className="flex items-center min-w-[750px] justify-between">
                  {monthItems.map((month, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-4">
                      <div className="text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-wider">{month.label}</div>
                      <div 
                        className={`text-[13px] ${
                          month.status === 'past' 
                          ? 'font-medium text-[#6B7280]' 
                          : month.status === 'current' 
                          ? 'font-[900] text-[#111827]' 
                          : 'font-medium text-[#D1D5DB]'
                        }`}
                      >
                        {month.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
