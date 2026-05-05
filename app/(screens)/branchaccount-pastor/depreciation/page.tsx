"use client"

import { API_V1 } from "@/lib/api";

import React, { useEffect, useMemo, useState } from "react"
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


const categories = [
  { category: "Vehicles", method: "Straight-line", cost: "₦15.0M", opening: "₦8.5M", current: "₦1.5M", closing: "₦7.0M", methodColor: "bg-[#EFF6FF] text-[#2563EB]" },
  { category: "Equipment", method: "Reducing Balance", cost: "₦5.2M", opening: "₦3.1M", current: "₦450k", closing: "₦2.65M", methodColor: "bg-[#FFFbeb] text-[#D97706]" },
  { category: "Furniture", method: "Straight-line", cost: "₦2.5M", opening: "₦1.8M", current: "₦250k", closing: "₦1.55M", methodColor: "bg-[#EFF6FF] text-[#2563EB]" },
  { category: "Buildings", method: "Straight-line", cost: "₦45.0M", opening: "₦40.5M", current: "₦900k", closing: "₦39.6M", methodColor: "bg-[#EFF6FF] text-[#2563EB]" },
]

type ScheduleItem = {
  label: string
  value: string
  status: "past" | "current" | "future"
}


export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)

  const buildScheduleItems = (schedule: Array<Record<string, unknown>>): ScheduleItem[] => {
    const currentIndex = 0
    return schedule.map((item, index) => {
      const label =
        (typeof item.period === "string" && item.period) ||
        (typeof item.year === "number" && `YR ${item.year}`) ||
        (typeof item.label === "string" && item.label) ||
        `Period ${index + 1}`
      const rawValue =
        (typeof item.depreciationExpense === "number" && item.depreciationExpense) ||
        (typeof item.depreciation === "number" && item.depreciation) ||
        (typeof item.amount === "number" && item.amount) ||
        (typeof item.value === "number" && item.value) ||
        0
      return {
        label,
        value: formatCurrency(rawValue),
        status: index < currentIndex ? "past" : index === currentIndex ? "current" : "future",
      }
    })
  }

  useEffect(() => {
    let isMounted = true

    const fetchSchedule = async () => {
      try {
        setScheduleLoading(true)
        setScheduleError(null)

        const assetsResponse = await fetch(`${API_V1}/financial/fixed-assets`, {
          method: "GET",
          credentials: "include",
        })
        const assetsPayload = await assetsResponse.json().catch(() => null)
        if (!assetsResponse.ok) {
          throw new Error(assetsPayload?.message ?? "Unable to load fixed assets.")
        }

        const assetList =
          assetsPayload?.data?.content ??
          assetsPayload?.data ??
          assetsPayload?.content ??
          []
        const firstAsset = Array.isArray(assetList) ? assetList[0] : null
        const assetId = firstAsset?.id ?? firstAsset?.assetId

        if (!assetId) {
          throw new Error("No fixed asset found to generate depreciation schedule.")
        }

        const scheduleResponse = await fetch(
          `${API_V1}/financial/fixed-assets/${assetId}/depreciation-schedule?granularity=yearly&periods=10`,
          {
            method: "GET",
            credentials: "include",
          }
        )
        const schedulePayload = await scheduleResponse.json().catch(() => null)
        if (!scheduleResponse.ok) {
          throw new Error(schedulePayload?.message ?? "Unable to load depreciation schedule.")
        }

        const schedule = schedulePayload?.data?.schedule ?? schedulePayload?.schedule ?? []
        if (isMounted) {
          setScheduleItems(buildScheduleItems(Array.isArray(schedule) ? schedule : []))
        }
      } catch (error) {
        if (isMounted) {
          setScheduleError(error instanceof Error ? error.message : "Unable to load depreciation schedule.")
          setScheduleItems([])
        }
      } finally {
        if (isMounted) {
          setScheduleLoading(false)
        }
      }
    }

    fetchSchedule()

    return () => {
      isMounted = false
    }
  }, [])

  const monthItems = useMemo(
    () =>
      scheduleItems.length
        ? scheduleItems
        : [
            { label: "N/A", value: scheduleLoading ? "Loading..." : "Unavailable", status: "future" as const },
          ],
    [scheduleItems, scheduleLoading]
  )

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
            <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
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
            <header className="mb-8">
              <h1
                className="text-[26.21px] font-black text-[#111827] tracking-[-0.66px] leading-[32.76px] mb-1.5"
                style={{ fontFamily: "Inter, sans-serif", verticalAlign: "middle" }}
              >
                Depreciation Schedule & Analysis
              </h1>
              <p className="text-[14px] text-[#6B7280] font-medium tracking-tight">
                Financial overview for Grace Chapel Ikeja Asset Management
              </p>
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
                    ₦1.45M
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#10B981] mt-auto">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>+2.4% vs LY</span>
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
                    ₦120k
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#EF4444] mt-auto">
                  <TrendingDown className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>-0.5% vs Prev Month</span>
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
                    ₦6.7M
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#10B981] mt-auto">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={3} />
                  <span>+12.1% total base</span>
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
                {categories.map((row, idx) => (
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

                <div className="p-5 sm:p-6 bg-[#F8FAFC]">
                  <div className="text-[11px] font-[900] text-[#111827] uppercase tracking-wide">Total Asset Portfolio</div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Cost</span>
                      <span className="text-[14px] font-[900] text-[#111827]">â‚¦67.7M</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Opening NBV</span>
                      <span className="text-[14px] font-[900] text-[#111827]">â‚¦53.9M</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Current Depr</span>
                      <span className="text-[14px] font-[900] text-[#EF4444]">â‚¦3.1M</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Closing NBV</span>
                      <span className="text-[14px] font-[900] text-[#2563EB]">â‚¦50.8M</span>
                    </div>
                  </div>
                </div>
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
                    {categories.map((row, idx) => (
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
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={2} className="py-6 px-6 sm:px-8">
                        <div className="text-[13px] font-[900] text-[#111827] uppercase tracking-wide">TOTAL ASSET PORTFOLIO</div>
                      </td>
                      <td className="py-6 px-6 sm:px-8 text-right">
                        <div className="text-[14px] font-[900] text-[#111827]">₦67.7M</div>
                      </td>
                      <td className="py-6 px-6 sm:px-8 text-right">
                        <div className="text-[14px] font-[900] text-[#111827]">₦53.9M</div>
                      </td>
                      <td className="py-6 px-6 sm:px-8 text-right">
                        <div className="text-[14px] font-[900] text-[#EF4444]">₦3.1M</div>
                      </td>
                      <td className="py-6 px-6 sm:px-8 text-right">
                        <div className="text-[14px] font-[900] text-[#2563EB]">₦50.8M</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Distribution Block */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-6 sm:pt-8 overflow-hidden">
              <div className="px-6 sm:px-8 mb-8">
                <h2 className="text-[18px] font-[800] text-[#111827] tracking-tight mb-1">2024 Monthly Distribution</h2>
                <p className="text-[13px] font-medium text-[#6B7280]">Allocation of depreciation expense across the current calendar year</p>
                {scheduleError && (
                  <p className="mt-2 text-[12px] font-medium text-[#EF4444]">{scheduleError}</p>
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
