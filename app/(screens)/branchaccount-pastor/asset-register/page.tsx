"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
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
  User,
  Download,
  FileText,
  Image as ImageIcon
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

type AssetRow = {
  id: string
  name: string
  desc: string
  category: string
  location: string
  status: string
  statusColor: string
  value: string
  active: boolean
}


export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const [creatingAsset, setCreatingAsset] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All Assets")
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes("operational") || normalized.includes("active")) {
      return "bg-emerald-50 text-emerald-600"
    }
    if (normalized.includes("maintenance") || normalized.includes("service")) {
      return "bg-amber-50 text-amber-600"
    }
    if (normalized.includes("pending") || normalized.includes("disposal")) {
      return "bg-rose-50 text-rose-600"
    }
    return "bg-slate-100 text-slate-600"
  }

  useEffect(() => {
    let isMounted = true

    const fetchAssets = async () => {
      if (!tenantId) {
        setAssets([])
        setAssetsError("Tenant is required to load assets.")
        return
      }

      try {
        setAssetsLoading(true)
        setAssetsError(null)

        const params = new URLSearchParams()
        params.set("tenantId", tenantId)
        const categoryMap: Record<string, string> = {
          "All Assets": "",
          Electronics: "Electronics",
          Vehicles: "Vehicle",
          Furniture: "Furniture",
          "Musical Equipment": "Musical Equipment",
        }
        const categoryParam = categoryMap[activeCategory] ?? activeCategory
        if (categoryParam) {
          params.set("category", categoryParam)
        }

        const response = await fetch(`/api/v1/core/financial/fixed-assets?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load assets.")
        }

        const data =
          payload?.data?.content ??
          payload?.data ??
          payload?.content ??
          []
        const mapped = (Array.isArray(data) ? data : []).map((asset, index) => {
          const id = asset?.assetCode ?? asset?.assetTag ?? asset?.code ?? asset?.id ?? `ASSET-${index + 1}`
          const name = asset?.name ?? asset?.description ?? asset?.assetName ?? "Unnamed Asset"
          const desc = asset?.description ?? asset?.details ?? ""
          const category = asset?.category ?? "General"
          const location = asset?.location ?? "N/A"
          const status = asset?.status ?? "Active"
          const valueAmount = asset?.currentValue ?? asset?.purchaseValue ?? asset?.value ?? 0

          return {
            id,
            name,
            desc,
            category,
            location,
            status,
            statusColor: getStatusColor(String(status)),
            value: formatCurrency(Number(valueAmount) || 0),
            active: index === 0,
          } as AssetRow
        })

        if (isMounted) {
          setAssets(mapped)
        }
      } catch (error) {
        if (isMounted) {
          setAssets([])
          setAssetsError(error instanceof Error ? error.message : "Unable to load assets.")
        }
      } finally {
        if (isMounted) {
          setAssetsLoading(false)
        }
      }
    }

    fetchAssets()

    return () => {
      isMounted = false
    }
  }, [activeCategory, tenantId])

  const handleCreateAsset = async () => {
    if (!tenantId) {
      setCreateError("Tenant is required to create a fixed asset.")
      return
    }

    setCreatingAsset(true)
    setCreateError(null)
    setCreateSuccess(null)

    try {
      const csrfToken = getCsrfToken()
      const assetCode = `GEN-${String(Date.now()).slice(-4)}`
      const response = await fetch("/api/v1/core/financial/fixed-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          assetCode,
          description: "Perkins 150KVA Diesel Generator",
          category: "Machinery",
          location: "Main Church Building",
          status: "ACTIVE",
          purchaseDate: new Date().toISOString(),
          purchaseValue: 8500000,
          currentValue: 8500000,
          depreciationMethod: "STRAIGHT_LINE",
          usefulLifeYears: 10,
          residualValue: 850000,
          tenantId,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to create fixed asset.")
      }

      setCreateSuccess(`Fixed asset ${assetCode} created successfully.`)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to create fixed asset.")
    } finally {
      setCreatingAsset(false)
    }
  }

  return (
    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
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
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 tracking-wide">Accountant&apos;s View</div>
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
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh] overflow-hidden">

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
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 lg:py-5">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Back Button */}
            <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors mb-4 text-[13px] font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6 sm:mb-8">
              <div>
                <h1
                  className="text-[26.21px] font-black text-[#111827] tracking-[-0.66px] leading-[32.76px] mb-1.5"
                  style={{ fontFamily: "Inter, sans-serif", verticalAlign: "middle" }}
                >
                  Asset Register
                </h1>
                <p className="text-[14px] text-[#6B7280] font-medium tracking-tight">Detailed directory of church properties and equipment.</p>
              </div>

              <div className="flex items-center pt-1 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <button className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-6 sm:px-8 rounded-[8px] bg-[#EF4444] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:bg-[#DC2626] transition-colors whitespace-nowrap tracking-wide">
                  Asset Depreciation
                </button>
              </div>
            </header>

            {/* Tabs */}
            <div className="mb-6 flex overflow-x-auto no-scrollbar items-center gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
              {["All Assets", "Electronics", "Vehicles", "Furniture", "Musical Equipment"].map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={`shrink-0 whitespace-nowrap rounded-[20px] px-5 py-2 text-[13px] font-semibold transition-colors tracking-wide ${
                    activeCategory === label
                      ? "bg-[#2563EB] text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Split Content Area: Adjusted proportions here to reduce the table card width relative to right panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.4fr_1fr] gap-6 items-start">

              {/* Left Column: Asset Table Container */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm flex flex-col min-h-0 lg:min-h-[500px] w-full max-w-full">
                {(assetsLoading || assetsError) && (
                  <div className="px-4 sm:px-5 pt-4">
                    {assetsLoading && <p className="text-[12px] font-medium text-[#6B7280]">Loading assets...</p>}
                    {assetsError && <p className="text-[12px] font-medium text-[#EF4444]">{assetsError}</p>}
                  </div>
                )}

                {/* Mobile Card List */}
                <div className="lg:hidden divide-y divide-[#EEF1F6]/60">
                  {assets.map((asset, idx) => (
                    <div key={idx} className={`p-4 sm:p-5 transition-colors ${asset.active ? "bg-[#F8FAFC]" : "bg-white"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`text-[12px] font-bold ${asset.active ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                            {asset.id}
                          </div>
                          {asset.active && <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />}
                        </div>
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider ${asset.statusColor}`}>
                          {asset.status}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div
                          className="text-[#111827]"
                          style={{
                            fontFamily: '"Public Sans", sans-serif',
                            fontWeight: 700,
                            fontSize: '18.31px',
                            lineHeight: '25.63px',
                            letterSpacing: '0%',
                            verticalAlign: 'middle'
                          }}
                        >
                          {asset.name}
                        </div>
                        <div className="text-[12px] font-medium text-[#6B7280] leading-snug mt-0.5">{asset.desc}</div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-[#6B7280]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Category</span>
                          <span className="inline-flex w-fit items-center px-2 py-1 rounded-[20px] bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold tracking-wide border border-[#E5E7EB]/50">
                            {asset.category}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Location</span>
                          <span className="text-[12px] font-medium text-[#6B7280]">{asset.location}</span>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <span className="text-[10px] font-[800] uppercase tracking-widest text-[#9CA3AF]">Current Value</span>
                          <span className="text-[14px] font-[900] text-[#111827]">{asset.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block w-full rounded-[16px] overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="border-b border-[#EEF1F6]">
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest w-[16%]">ASSET TAG</th>
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest w-[28%]">DESCRIPTION</th>
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest">CATEGORY</th>
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest">LOCATION</th>
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest">STATUS</th>
                        <th className="py-4 px-4 text-[10px] font-[800] text-[#6B7280] uppercase tracking-widest">CURRENT VALUE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]/50">
                      {assets.map((asset, idx) => (
                        <tr key={idx} className={`relative hover:bg-[#F8FAFC] transition-colors cursor-pointer ${asset.active ? 'bg-[#F8FAFC]/50' : ''}`}>
                          <td className="py-4 pl-5 pr-4 align-top relative">
                            {/* Active Blue Indicator */}
                            {asset.active && (
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2563EB] rounded-r-full" />
                            )}
                            <div className={`text-[12px] font-bold ${asset.active ? 'text-[#2563EB]' : 'text-[#6B7280]'} tracking-tight`}>{asset.id.split('-').map((part, i) => i === 2 ? <span key={i}><br />{part}</span> : part + (i < 1 ? '-' : ''))}</div>
                          </td>
                          <td className="py-4 px-4 align-top flex items-start flex-col gap-0.5 mt-[-1px]">
                            <div
                              className="text-[#111827]"
                              style={{
                                fontFamily: '"Public Sans", sans-serif',
                                fontWeight: 700,
                                fontSize: '18.31px',
                                lineHeight: '25.63px',
                                letterSpacing: '0%',
                                verticalAlign: 'middle'
                              }}
                            >
                              {asset.name}
                            </div>
                            <div className="text-[11px] font-medium text-[#6B7280] leading-snug w-[130px] sm:w-[150px]">{asset.desc}</div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <span className="inline-flex items-center px-2 py-1 rounded-[20px] bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold tracking-wide border border-[#E5E7EB]/50">
                              {asset.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="text-[11px] font-medium text-[#6B7280] pt-[1px]">{asset.location}</div>
                          </td>
                          <td className="py-4 px-4 align-top pt-[15px]">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider ${asset.statusColor}`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="text-[13px] font-[900] text-[#111827] pt-[1px]">{asset.value}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Asset Details Pane */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-sm p-5 sm:p-7 flex flex-col lg:sticky top-[96px]">

                {/* Pane Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center justify-center px-2 py-1 rounded-[6px] bg-[#EEF2FF] text-[#3B5BDB] text-[10px] font-[900] uppercase tracking-widest mb-3">
                      ASSET DETAILS
                    </div>
                    <div className="text-[24px] font-[800] text-[#111827] tracking-tight mb-0.5 leading-none">PA System</div>
                    <div className="text-[13px] font-semibold text-[#9CA3AF] tracking-wide">SW-PA-001</div>
                  </div>
                  <button className="h-8 w-8 -mr-2 -mt-2 rounded-full flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Big Value Display */}
                <div className="flex items-center gap-2 mb-8">
                  <div
                    className="text-[#2563EB] font-[900] tracking-normal align-middle"
                    style={{
                      fontFamily: '"Public Sans", sans-serif',
                      fontSize: '21.97px',
                      lineHeight: '29.29px'
                    }}
                  >
                    ₦850,000
                  </div>
                  <div className="text-[12px] font-bold text-[#10B981] flex items-center mt-1">
                    <span className="mr-0.5">↑</span>2.4%
                  </div>
                </div>

                {/* Financial Info */}
                <div className="mb-8">
                  <h4 className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-widest mb-4">FINANCIAL INFO</h4>
                  <div className="space-y-4 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6B7280]">Depreciation Method</span>
                      <span className="font-bold text-[#111827]">Straight Line (10%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6B7280]">Purchase Date</span>
                      <span className="font-bold text-[#111827]">Mar 12, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6B7280]">Book Value</span>
                      <span className="font-[800] text-[#111827]">₦765,000</span>
                    </div>
                  </div>
                </div>

                {/* Responsibility */}
                <div className="mb-8">
                  <h4 className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-widest mb-3">RESPONSIBILITY</h4>
                  <div className="flex items-center gap-3 p-3 rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6]">
                    <div className="h-[36px] w-[36px] rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[14px] font-bold text-[#111827]">Deacon Adebayo</span>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-widest">ATTACHMENTS</h4>
                    <button className="text-[12px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1">+ Add</button>
                  </div>

                  <div className="space-y-2">
                    {/* File 1 */}
                    <div className="flex items-center justify-between p-3 rounded-[10px] bg-white border border-[#EEF1F6] hover:border-[#E5E7EB] transition-colors group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-[#EF4444]"><FileText className="h-[18px] w-[18px]" strokeWidth={2.5} /></div>
                        <div>
                          <div className="text-[13px] font-bold text-[#111827] list-none tracking-tight">Purchase_Receipt.pdf</div>
                          <div className="text-[10px] font-medium text-[#9CA3AF]">Uploaded Mar 14, 2023</div>
                        </div>
                      </div>
                      <button className="text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    {/* File 2 */}
                    <div className="flex items-center justify-between p-3 rounded-[10px] bg-white border border-[#EEF1F6] hover:border-[#E5E7EB] transition-colors group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-[#3B82F6]"><ImageIcon className="h-[18px] w-[18px]" strokeWidth={2.5} /></div>
                        <div>
                          <div className="text-[13px] font-bold text-[#111827] list-none tracking-tight">Installation_View.jpg</div>
                          <div className="text-[10px] font-medium text-[#9CA3AF]">Uploaded Mar 14, 2023</div>
                        </div>
                      </div>
                      <button className="text-[#9CA3AF] group-hover:text-[#2563EB] transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


