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
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react"

import { Inter } from "next/font/google"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { useAssetOverview, type AssetOverviewItem } from "@/components/hooks/useAssetOverview"
import { useAssetMovements, type AssetMovement } from "@/components/hooks/useAssetMovements"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { formatCurrency, formatDate } from "@/lib/format"
const inter = Inter({ subsets: ["latin"] })

type DisplayAsset = {
  id: string
  name: string
  category: string
  date: string
  value: string
  status: string
  statusColor: string
}

const STATUS_STYLES: Record<string, { label: string; classes: string; bucket: "operational" | "maintenance" | "offline" }> = {
  EXCELLENT: { label: "EXCELLENT", classes: "text-[#10B981] bg-[#ECFDF5]", bucket: "operational" },
  GOOD: { label: "GOOD", classes: "text-[#10B981] bg-[#ECFDF5]", bucket: "operational" },
  OPERATIONAL: { label: "OPERATIONAL", classes: "text-[#10B981] bg-[#ECFDF5]", bucket: "operational" },
  ACTIVE: { label: "ACTIVE", classes: "text-[#10B981] bg-[#ECFDF5]", bucket: "operational" },
  MAINTENANCE: { label: "MAINTENANCE", classes: "text-[#F59E0B] bg-[#FEF3C7]", bucket: "maintenance" },
  SERVICING: { label: "SERVICING REQ.", classes: "text-[#F59E0B] bg-[#FEF3C7]", bucket: "maintenance" },
  FAIR: { label: "FAIR", classes: "text-[#F59E0B] bg-[#FEF3C7]", bucket: "maintenance" },
  OFFLINE: { label: "OFFLINE", classes: "text-[#EF4444] bg-[#FEE2E2]", bucket: "offline" },
  FAULTY: { label: "FAULTY", classes: "text-[#EF4444] bg-[#FEE2E2]", bucket: "offline" },
  DISPOSED: { label: "DISPOSED", classes: "text-[#6B7280] bg-[#F3F4F6]", bucket: "offline" },
}

function classifyStatus(raw?: string) {
  const key = (raw ?? "").toUpperCase().replace(/[^A-Z]/g, "")
  for (const k of Object.keys(STATUS_STYLES)) {
    if (key.includes(k)) return STATUS_STYLES[k]
  }
  return { label: raw ?? "—", classes: "text-[#6B7280] bg-[#F3F4F6]", bucket: "operational" as const }
}

function pickNumber(...vals: Array<unknown>): number {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v)
  }
  return 0
}

function pickString(...vals: Array<unknown>): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim() !== "") return v
  }
  return ""
}

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { branchId: contextBranchId } = useBranchContext()
  const branchId = contextBranchId || user?.branchId || user?.tenantId || user?.tenant?.id || ""
  // Real activity for the queue card: movements recorded against this
  // branch's assets, newest first.
  const { items: movements } = useAssetMovements({ enabled: Boolean(branchId) })
  const recentActivity = useMemo(() => {
    const list = (movements ?? []) as AssetMovement[]
    return [...list]
      .sort((a, b) => new Date(b.movedAt ?? b.createdAt ?? 0).getTime() - new Date(a.movedAt ?? a.createdAt ?? 0).getTime())
      .slice(0, 5)
  }, [movements])
  const { items, totals, isLoading } = useAssetOverview({ branchId })

  const {
    bookValue,
    nbv,
    breakdown,
    statusCounts,
    healthPercent,
    displayAssets,
    totalAssets,
  } = useMemo(() => {
    const list = (items ?? []) as AssetOverviewItem[]
    let book = 0
    let net = 0
    const catCounts: Record<string, number> = {}
    const status = { operational: 0, maintenance: 0, offline: 0 }
    const display: DisplayAsset[] = []
    for (const a of list) {
      const cost = pickNumber(a.cost, a.purchaseValue, a.value)
      const currentValue = pickNumber(a.nbv, a.currentValue, cost)
      book += cost
      net += currentValue
      const cat = pickString(a.category, "Uncategorized")
      catCounts[cat] = (catCounts[cat] ?? 0) + 1
      const s = classifyStatus(a.status)
      status[s.bucket] += 1
      const id = pickString(a.id, a._id, `${cat}-${display.length}`)
      const purchaseDateRaw = pickString(a.purchaseDate as string, a.createdAt as string)
      display.push({
        id,
        name: pickString(a.name, a.assetName, a.description, "Asset"),
        category: cat,
        date: purchaseDateRaw ? formatDate(purchaseDateRaw, "medium") : "—",
        value: formatCurrency(cost),
        status: s.label,
        statusColor: s.classes,
      })
    }
    const totalForBreakdown = list.length || 1
    const breakdownEntries = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, pct: Math.round((count / totalForBreakdown) * 100) }))
    const operational = status.operational
    const total = operational + status.maintenance + status.offline
    const health = total === 0 ? 0 : Math.round((operational / total) * 100)

    // Allow API to override aggregates via totals
    const overrideBook = totals && typeof (totals as Record<string, unknown>).bookValue === "number"
      ? ((totals as Record<string, unknown>).bookValue as number)
      : undefined
    const overrideNbv = totals && typeof (totals as Record<string, unknown>).nbv === "number"
      ? ((totals as Record<string, unknown>).nbv as number)
      : undefined

    return {
      bookValue: overrideBook ?? book,
      nbv: overrideNbv ?? net,
      breakdown: breakdownEntries,
      statusCounts: status,
      healthPercent: health,
      displayAssets: display,
      totalAssets: list.length,
    }
  }, [items, totals])

  // Circular progress math
  const size = 110
  const stroke = 8
  const radius = size / 2
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = healthPercent
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const healthLabel = progress >= 85 ? "HEALTHY" : progress >= 60 ? "FAIR" : progress > 0 ? "AT RISK" : "NO DATA"
  const breakdownColors = ["#2563EB", "#38BDF8", "#FBBF24"]

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <BranchLeadPastorSidebar
        activeHref="/branchlead-pastor/asset-register"
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative h-[100dvh] overflow-hidden">

        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[15px] font-bold text-[#111827] tracking-tight">
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[10px] border border-transparent bg-[#F9FAFB] pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-[#E5E7EB] outline-none transition-all shadow-sm"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-[38px] sm:w-[38px] shrink-0 items-center justify-center rounded-[8px] text-[#6B7280] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors shadow-sm">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
          
          <div className="mx-auto w-full max-w-[1400px]">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
              <div>
                <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-[900] text-[#111827] tracking-[-1px] leading-none mb-2 uppercase">ASSET MANAGEMENT</h1>
                <p className="text-[15px] text-[#6B7280] font-medium tracking-tight">Here&apos;s your branch asset overview. <span className="font-bold text-[#111827]">2024</span></p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <button
                  onClick={() => router.push("/branchlead-pastor/asset-register")}
                  className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-5 sm:px-6 rounded-[8px] bg-[#2563EB] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap tracking-wide"
                >
                  Asset Register
                </button>
                <button
                  onClick={() => router.push("/branchlead-pastor/maintenance")}
                  className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-5 sm:px-6 rounded-[8px] bg-[#EF4444] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:bg-[#DC2626] transition-colors whitespace-nowrap tracking-wide"
                >
                  Maintenance Schedule
                </button>
              </div>
            </header>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1: Asset Valuation */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px] relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider">ASSET VALUATION</h3>
                </div>

                <div className="flex justify-between items-start gap-4 mb-auto z-10">
                  <div>
                    <div className="text-[13px] font-semibold text-[#6B7280] tracking-tight mb-1">Book Value</div>
                    <div className="text-[26px] xl:text-[28px] font-bold text-[#111827] tracking-tight leading-none">{isLoading ? "—" : formatCurrency(bookValue)}</div>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#6B7280] tracking-tight mb-1">Net Book Value (NBV)</div>
                    <div className="text-[26px] xl:text-[28px] font-bold text-[#3B5BDB] tracking-tight leading-none">{isLoading ? "—" : formatCurrency(nbv)}</div>
                  </div>
                </div>
                
                {/* Category Breakdown */}
                <div className="mt-5 pt-5 border-t border-[#EEF1F6]">
                  <div className="text-[12px] font-semibold text-[#6B7280] mb-2 tracking-tight">Category Breakdown</div>
                  <div className="w-full h-[6px] rounded-full overflow-hidden flex mb-2 bg-[#F3F4F6]">
                    {breakdown.map((b, idx) => (
                      <div key={b.label} className="h-full" style={{ width: `${b.pct}%`, backgroundColor: breakdownColors[idx] }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] gap-2">
                    {breakdown.length === 0 ? (
                      <span className="italic text-[#9CA3AF]">No category data</span>
                    ) : (
                      breakdown.map((b, idx) => (
                        <div key={b.label} className="flex items-center gap-1.5 truncate">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: breakdownColors[idx] }} />
                          <span className="truncate">{b.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Health & Status */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px]">
                <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-6">HEALTH & STATUS</h3>
                
                <div className="flex items-center gap-6 xl:gap-8 mb-auto">
                  <div className="relative h-[110px] w-[110px] shrink-0">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                      <circle
                        stroke="#EEF2FF"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                      />
                      <circle
                        stroke="#2563EB"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                      <span className="text-[26px] font-[900] text-[#111827] leading-none mb-0.5 tracking-tight">{progress}%</span>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">{healthLabel}</span>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Operational</span>
                      <span className="text-[14px] font-bold text-[#111827]">{statusCounts.operational}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Maintenance</span>
                      <span className="text-[14px] font-bold text-[#F59E0B]">{statusCounts.maintenance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Offline/Faulty</span>
                      <span className="text-[14px] font-bold text-[#EF4444]">{statusCounts.offline}</span>
                    </div>
                  </div>
                </div>

                {statusCounts.maintenance + statusCounts.offline > 0 && (
                  <div className="mt-8 bg-[#FFFBEB] border border-[#FEF3C7] rounded-[10px] p-4 flex gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <AlertTriangle className="h-[22px] w-[22px] text-[#F59E0B] shrink-0" strokeWidth={2} />
                    <div>
                      <h4 className="text-[13px] font-bold text-[#D97706] mb-0.5">Attention needed</h4>
                      <p className="text-[12px] font-medium text-[#D97706]/80 leading-snug tracking-wide">
                        {[
                          statusCounts.maintenance > 0 ? `${statusCounts.maintenance} in maintenance` : null,
                          statusCounts.offline > 0 ? `${statusCounts.offline} offline or faulty` : null,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        .
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Queue & Activity */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider">QUEUE & ACTIVITY</h3>
                  {recentActivity.length > 0 && (
                    <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] bg-[#3B5BDB] text-white text-[10px] font-bold tracking-wide">
                      {recentActivity.length} RECENT
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {recentActivity.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[12px] text-[#9CA3AF] text-center px-4">
                      Movements, transfers and disposals for this branch will appear here.
                    </div>
                  ) : (
                    <div className="space-y-3.5 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {recentActivity.map((m, index) => {
                        const kind = String(m.movementType ?? "movement").replace(/_/g, " ")
                        const when = m.movedAt ?? m.createdAt
                        const date = when ? new Date(when) : null
                        const stamp = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""
                        const route = [m.fromLocation, m.toLocation].filter(Boolean).join(" → ")
                        return (
                          <div key={String(m._id ?? m.id ?? index)} className="relative flex items-start gap-3.5 pl-1">
                            <div className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${index === 0 ? "bg-[#10B981]" : index === 1 ? "bg-[#F59E0B]" : "bg-[#0EA5E9]"}`} />
                            <div className="min-w-0">
                              <div className="text-[12px] font-bold text-[#111827] tracking-tight leading-tight capitalize">{kind}</div>
                              <div className="text-[11px] text-[#6B7280] truncate">
                                {m.assetName ?? "Asset"}
                                {route ? ` · ${route}` : ""}
                                {stamp ? ` • ${stamp}` : ""}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Assets Inventory Table */}
            <div className="rounded-[16px] bg-white border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col flex-1 overflow-hidden min-h-[400px]">
              
              {/* Header */}
              <div className="p-5 sm:p-7 border-b border-[#EEF1F6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-[18px] font-[900] text-[#111827] tracking-tight">Active Assets Inventory</h2>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="Search assets..." 
                      className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  
                  <button className="flex items-center justify-center text-[14px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors whitespace-nowrap">
                    View All
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6]">
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">ASSET DESCRIPTION</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">CATEGORY</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">PURCHASE DATE</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">BOOK VALUE</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none text-center">CONDITION</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && displayAssets.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 px-7 text-center text-[13px] font-semibold text-[#9CA3AF]">Loading assets…</td></tr>
                    ) : displayAssets.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 px-7 text-center text-[13px] font-semibold text-[#9CA3AF]">No assets found for this branch.</td></tr>
                    ) : displayAssets.map((asset) => (
                      <tr key={asset.id} className="border-b border-[#EEF1F6]/70 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-[800] text-[#111827] tracking-tight">{asset.name}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-semibold text-[#6B7280]">{asset.category}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-semibold text-[#6B7280]">{asset.date}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[15px] font-[900] text-[#111827] tracking-tight">{asset.value}</div>
                        </td>
                        <td className="py-5 px-7 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] text-[10px] font-[900] uppercase tracking-widest ${asset.statusColor}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-5 px-7 text-right">
                          <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors"><MoreHorizontal className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination / Footer */}
              <div className="p-5 sm:p-7 border-t border-[#EEF1F6] flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[#6B7280]">
                  Showing {displayAssets.length === 0 ? 0 : 1}-{displayAssets.length} of {totalAssets} assets
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-[34px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#6B7280] flex items-center gap-1 hover:bg-gray-50 transition-all shadow-sm">
                    Previous
                  </button>
                  <button className="h-[34px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#111827] flex items-center gap-1 hover:bg-gray-50 transition-all shadow-sm">
                    Next
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
