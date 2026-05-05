import { API_V1 } from "@/lib/api";
"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  PiggyBank,

  Settings,
  ShieldCheck,
  TrendingUp,
  Undo2,
  Users,
  Wallet,
  AlertTriangle,
  BarChart3,
  Check,
  Search,
  Bell,
  Landmark,
  MessageCircle,
  Menu,
  X
} from "lucide-react"
import { useBudgetEntries } from "@/components/hooks/useBudgetEntries"

type BudgetChild = {
  id: string
  name: string
  desc: string
  lastYear: string
  proposed: string
  allocated: string
  variance: string
  varianceColor: string
  warning?: boolean
  hasThread?: boolean
  isActive?: boolean
}

type BudgetRow = {
  id: string
  category: string
  itemCount: number
  total: string
  isExpanded: boolean
  children?: BudgetChild[]
}

export function BudgetReviewContent({ rightSidebar, activeRowId }: { rightSidebar?: React.ReactNode, activeRowId?: string }) {
  const { user } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const { entries, loading, error } = useBudgetEntries()
  const [data, setData] = useState<BudgetRow[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approvingAll, setApprovingAll] = useState(false)

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const approveEntry = async (entryId: string) => {
    if (!entryId) return
    setApprovingId(entryId)
    setApproveError(null)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`${API_V1}/financial/budget-entries/${entryId}/approve`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to approve budget entry.")
      }

      setApprovedIds((prev) => new Set(prev).add(entryId))
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Unable to approve budget entry.")
    } finally {
      setApprovingId(null)
    }
  }

  const approveAllEntries = async () => {
    const entryIds = entries.map((entry) => entry.id).filter(Boolean)
    if (entryIds.length === 0) return
    setApprovingAll(true)
    setApproveError(null)

    try {
      const csrfToken = getCsrfToken()
      await Promise.all(
        entryIds.map(async (entryId) => {
          const response = await fetch(`${API_V1}/financial/budget-entries/${entryId}/approve`, {
            method: "POST",
            headers: { "x-csrf-token": csrfToken },
            credentials: "include",
          })
          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            throw new Error(payload?.message ?? "Unable to approve budget entry.")
          }
          setApprovedIds((prev) => new Set(prev).add(entryId))
        })
      )
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Unable to approve budget entry.")
    } finally {
      setApprovingAll(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

  const totals = useMemo(() => {
    const income = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "INCOME")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const expense = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "EXPENSE")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const overall = entries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)
    const resolvedIncome = income || overall
    const resolvedExpense = expense || overall
    const deduction = resolvedIncome * 0.1
    const surplus = resolvedIncome - resolvedExpense - deduction

    return { income: resolvedIncome, expense: resolvedExpense, deduction, surplus }
  }, [entries])

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Projected Income",
        value: formatCurrency(totals.income),
        meta: totals.income ? "+5.2% vs Last Year" : "Awaiting entries",
        metaColor: "text-emerald-600",
        icon: TrendingUp,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        titleColor: "text-gray-500",
      },
      {
        title: "Total Expenditure",
        value: formatCurrency(totals.expense),
        meta: totals.income ? "84% of Income" : "Awaiting entries",
        metaColor: "text-gray-500",
        icon: Wallet,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        titleColor: "text-gray-500",
      },
      {
        title: "HQ Statutory Deductions",
        value: formatCurrency(totals.deduction),
        meta: "Fixed 10% Tithe",
        metaColor: "text-gray-500",
        icon: Landmark,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        titleColor: "text-purple-600 font-semibold",
      },
      {
        title: "Net Surplus",
        value: formatCurrency(totals.surplus),
        meta: totals.surplus > 0 ? "Healthy buffer" : "Monitor spend",
        metaColor: totals.surplus > 0 ? "text-emerald-600" : "text-rose-500",
        icon: PiggyBank,
        iconBg: "bg-gray-100",
        iconColor: "text-gray-700",
        titleColor: "text-gray-500",
      },
    ],
    [totals]
  )

  const groupedRows = useMemo(() => {
    const map = new Map<string, { id: string; total: number; children: BudgetChild[] }>()

    entries.forEach((entry, index) => {
      const category = entry.category ?? entry.stream ?? "Budget Entries"
      const amount = Number(entry.amount ?? 0)
      const child: BudgetChild = {
        id: entry.id ?? `entry-${index}`,
        name: entry.coaName ?? entry.name ?? "Line Item",
        desc: entry.period ?? "",
        lastYear: "—",
        proposed: formatCurrency(amount),
        allocated: formatCurrency(amount),
        variance: "0%",
        varianceColor: "text-gray-500",
      }

      if (!map.has(category)) {
        map.set(category, {
          id: category.toLowerCase().replace(/\s+/g, "-"),
          total: 0,
          children: [],
        })
      }

      const group = map.get(category)!
      group.total += amount
      group.children.push(child)
    })

    return Array.from(map.entries()).map(([category, group]) => ({
      id: group.id,
      category,
      itemCount: group.children.length,
      total: formatCurrency(group.total),
      isExpanded: true,
      children: group.children,
    }))
  }, [entries])

  useEffect(() => {
    setData(groupedRows)
  }, [groupedRows])

  const toggleExpand = (id: string) => {
    setData(data.map(row => row.id === id ? { ...row, isExpanded: !row.isExpanded } : row))
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen overflow-hidden bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      
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
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3 pb-8">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={28} height={28} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Lead Pastor View</div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Financial Management", icon: BarChart3, hasChevron: true },
              { label: "Assets", icon: Building2 },
              { label: "Budget", icon: Wallet, active: true },
              { label: "Compliance & Remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                  {item.hasChevron && <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />}
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1.5 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
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
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">{displayName}</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium">{roleLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden bg-[#F8FAFC] relative w-full">
        
        {/* Center Panel Container */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full relative">
          
        {/* Top Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <button 
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
                placeholder="Search requisitions..." 
                className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto p-4 sm:p-6 xl:p-8">
          
          {/* Header Actions Row */}
          <div className="mb-0 border-none bg-transparent">
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-4 md:mb-3 mt-1 md:mt-0">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <h1 
                    className="text-[#111827]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 900,
                      fontSize: "26.95px",
                      lineHeight: "33.69px",
                      letterSpacing: "-0.67px",
                      verticalAlign: "middle"
                    }}
                  >
                    Annual Budget Proposal 2024
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/20 whitespace-nowrap">
                    Pending Review
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280] mt-2 font-medium">
                  Submitted by: <span className="text-[#374151] font-semibold">Deacon Sarah Jenkins (Accountant)</span> on Oct 12, 2023
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button 
                variant="outline" 
                className="bg-white text-[#374151] shadow-sm hover:bg-gray-50 flex items-center gap-2 justify-center border-[#E5E7EB]"
                style={{
                  width: "125.88px",
                  height: "35.93px",
                  borderRadius: "7.19px",
                  borderWidth: "0.9px",
                  opacity: 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "12.58px",
                  lineHeight: "17.97px",
                  letterSpacing: "0%",
                  textAlign: "center",
                  verticalAlign: "middle"
                }}
              >
                <Undo2 className="h-4 w-4 text-[#6B7280]" />
                Send Back
              </Button>
              <Button 
                onClick={approveAllEntries}
                disabled={approvingAll || entries.length === 0}
                className="bg-[#2563EB] text-white shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5 justify-center px-0 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  width: "125.88px",
                  height: "35.93px",
                  borderRadius: "7.19px",
                  borderWidth: "0.9px",
                  borderColor: "transparent",
                  opacity: 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "12.58px",
                  lineHeight: "17.97px",
                  letterSpacing: "0%",
                  textAlign: "center",
                  verticalAlign: "middle"
                }}
              >
                <Check className="h-3.5 w-3.5" />
                {approvingAll ? "Approving..." : "Approve Budget"}
              </Button>
            </div>
            {approveError && (
              <div className="mt-2 text-[12px] font-semibold text-rose-500">
                {approveError}
              </div>
            )}
          </div>
        </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-6 sm:mb-8">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div key={idx} className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-start justify-between">
                    <div className={`text-[12.5px] font-medium ${card.titleColor}`}>{card.title}</div>
                    <div className={`rounded-lg p-2 ${card.iconBg}`}>
                      <Icon className={`h-4.5 w-4.5 stroke-[2] ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[22px] font-bold text-[#111827] tracking-tight">{card.value}</div>
                    <div className={`mt-1.5 text-[12px] font-medium ${card.metaColor}`}>
                      {card.meta}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E2E8F0] mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1">
            <button className="flex items-center gap-2 pb-3 border-b-2 border-[#2563EB] text-[#2563EB] text-[13.5px] font-semibold transition-colors">
              <FolderOpen className="h-4 w-4" />
              Operational
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#64748B] hover:text-[#334155] text-[13.5px] font-medium transition-colors">
              <Building2 className="h-4 w-4" />
              Capital
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#64748B] hover:text-[#334155] text-[13.5px] font-medium transition-colors">
              <Users className="h-4 w-4" />
              Program
            </button>
          </div>

          {/* Table Area */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="w-full flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] text-[13px]">
                <thead className="bg-transparent text-[#64748B] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-[35%]">LINE ITEM</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">LAST YEAR</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">PROPOSED</th>
                    <th className="px-6 py-4 font-semibold text-center w-[20%] text-[#2563EB]">ALLOCATED</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">VARIANCE</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] font-medium text-[#111827]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                        Loading budget entries?
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-rose-500">
                        {error}
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                        No budget entries available for this period.
                      </td>
                    </tr>
                  ) : (
                    data.map((row) => (
                      <React.Fragment key={row.id}>
                        {/* Parent Row */}
                        <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50 hover:bg-[#F1F5F9]/50 transition-colors">
                          <td className="px-6 py-4">
                            <button onClick={() => toggleExpand(row.id)} className="flex items-center gap-2 font-bold text-[#334155] hover:text-[#0F172A] transition-colors focus:outline-none">
                              {row.isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                              )}
                              {row.category}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-[#64748B]">{row.itemCount}</td>
                          <td className="px-6 py-4 text-right font-bold">{row.total}</td>
                          <td className="px-6 py-4 text-right text-[#64748B]">?</td>
                          <td className="px-6 py-4 text-right text-[#64748B]">?</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-semibold text-[#3B5BDB]">Active</span>
                          </td>
                        </tr>

                        {row.isExpanded && row.children?.map((child) => (
                          <tr key={child.id} className="border-b border-[#F1F5F9] bg-white">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#0F172A]">{child.name}</span>
                                <span className="text-[12px] text-[#94A3B8]">{child.desc || "—"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#64748B]">?</td>
                            <td className="px-6 py-4 text-right text-[#0F172A] font-semibold">{child.proposed}</td>
                            <td className="px-6 py-4 text-right text-[#64748B]">{child.allocated}</td>
                            <td className="px-6 py-4 text-right text-[#64748B]">{child.variance}</td>
                            <td className="px-6 py-4 text-right">
                              {approvedIds.has(child.id) ? (
                                <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                                  <Check className="h-3.5 w-3.5" />
                                  Approved
                                </div>
                              ) : (
                                <button
                                  onClick={() => approveEntry(child.id)}
                                  disabled={approvingId === child.id}
                                  className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] font-semibold text-[#374151] hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {approvingId === child.id ? "Approving..." : "Approve"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-white text-[13px] text-[#64748B] font-medium">
              <div>Showing 1 to 5 of 12 entries</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 rounded-[6px] border-[#E2E8F0] px-3 font-medium hover:bg-[#F8FAFC]">Previous</Button>
                <Button variant="outline" className="h-8 rounded-[6px] border-[#E2E8F0] px-3 font-medium hover:bg-[#F8FAFC]">Next</Button>
              </div>
            </div>
          </div>
        </main>
        </div>
        {rightSidebar}
      </div>
    </div>
  )
}

export default function Page() {
  return <BudgetReviewContent />
}
