"use client"

import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { formatCurrency } from "@/lib/format";

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

type AssetRow = {
  id: string
  rawId: string
  name: string
  desc: string
  category: string
  categoryId: string
  location: string
  status: string
  statusColor: string
  value: string
  active: boolean
}

type AssetFormState = {
  name: string
  assetClassId: string
  purchaseCost: string
  purchaseDate: string
  depreciationMethod: "straight_line" | "declining_balance"
  usefulLifeYears: string
  residualValue: string
  serialNumber: string
  description: string
}

const INITIAL_FORM: AssetFormState = {
  name: "",
  assetClassId: "",
  purchaseCost: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  depreciationMethod: "straight_line",
  usefulLifeYears: "",
  residualValue: "",
  serialNumber: "",
  description: "",
}


export default function Page() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const [creatingAsset, setCreatingAsset] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All Assets")
  const [assets, setAssets] = useState<AssetRow[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const filteredAssets = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return assets
    return assets.filter((a) =>
      a.id.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      a.desc.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term) ||
      a.location.toLowerCase().includes(term),
    )
  }, [assets, debouncedSearch])
  const [form, setForm] = useState<AssetFormState>(INITIAL_FORM)
  const [refreshKey, setRefreshKey] = useState(0)
  const { assetClasses, isLoading: assetClassesLoading } = useAssetClasses({ limit: 100 })

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const getCsrfToken = getCsrfTokenFromCookie

  const formatCurrencyLocal = (amount: number) =>
    formatCurrency(amount, { maximumFractionDigits: 0 })

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes("operational") || normalized.includes("active")) {
      return "bg-emerald-50 text-emerald-600"
    }
    if (normalized.includes("maintenance") || normalized.includes("service")) {
      return "bg-amber-50 text-amber-600"
    }
    if (normalized.includes("pending") || normalized.includes("disposal") || normalized.includes("written")) {
      return "bg-rose-50 text-rose-600"
    }
    return "bg-slate-100 text-slate-600"
  }

  // Build a lookup from asset class id => name, so the active category filter
  // (which is a *name* label like "Vehicles") can be mapped to an assetClassId.
  const classNameToId = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of assetClasses ?? []) {
      const id = (c._id ?? c.id ?? "") as string
      const name = (c.name ?? "").toString()
      if (id && name) map[name.toLowerCase()] = id
    }
    return map
  }, [assetClasses])

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
        params.set("branchId", tenantId)
        params.set("limit", "100")
        if (activeCategory && activeCategory !== "All Assets") {
          const id = classNameToId[activeCategory.toLowerCase()]
          if (id) params.set("assetClassId", id)
        }

        const response = await fetch(`${API_V1}/assets?${params.toString()}`, {
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
        const mapped = (Array.isArray(data) ? data : []).map((asset: Record<string, unknown>, index: number) => {
          const rawId = String(asset?._id ?? asset?.id ?? "")
          const id = String(asset?.assetCode ?? asset?.code ?? rawId ?? `ASSET-${index + 1}`)
          const name = String(asset?.name ?? asset?.description ?? "Unnamed Asset")
          const desc = String(asset?.description ?? "")
          const assetClass = asset?.assetClass as Record<string, unknown> | string | null | undefined
          const category =
            typeof assetClass === "object" && assetClass
              ? String((assetClass as Record<string, unknown>).name ?? "General")
              : typeof assetClass === "string"
                ? assetClass
                : String((asset?.category as string) ?? "General")
          const categoryId =
            typeof assetClass === "object" && assetClass
              ? String((assetClass as Record<string, unknown>)._id ?? (assetClass as Record<string, unknown>).id ?? "")
              : ""
          const branch = asset?.branch as Record<string, unknown> | null | undefined
          const location = branch && typeof branch === "object"
            ? String(branch.name ?? "N/A")
            : String((asset?.location as string) ?? "N/A")
          const status = String(asset?.status ?? "active")
          const valueAmount = Number(asset?.currentBookValue ?? asset?.purchaseCost ?? asset?.currentValue ?? 0)

          return {
            id,
            rawId,
            name,
            desc,
            category,
            categoryId,
            location,
            status,
            statusColor: getStatusColor(status),
            value: formatCurrencyLocal(valueAmount || 0),
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
  }, [activeCategory, tenantId, classNameToId, refreshKey])

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setCreateError(null)
    setCreateSuccess(null)
  }

  const updateForm = <K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreateAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tenantId) {
      setCreateError("Tenant is required to create a fixed asset.")
      return
    }

    // Client-side validation
    if (!form.name.trim()) {
      setCreateError("Asset name is required.")
      return
    }
    if (!form.assetClassId) {
      setCreateError("Asset class is required.")
      return
    }
    const purchaseCost = Number(form.purchaseCost)
    if (!Number.isFinite(purchaseCost) || purchaseCost <= 0) {
      setCreateError("Purchase cost must be a positive number.")
      return
    }
    if (!form.purchaseDate) {
      setCreateError("Purchase date is required.")
      return
    }

    setCreatingAsset(true)
    setCreateError(null)
    setCreateSuccess(null)

    try {
      const csrfToken = getCsrfToken()
      const usefulLife = Number(form.usefulLifeYears)
      const residual = Number(form.residualValue)
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        assetClassId: form.assetClassId,
        branchId: tenantId,
        purchaseCost,
        purchaseDate: form.purchaseDate,
        depreciationMethod: form.depreciationMethod,
      }
      if (Number.isFinite(usefulLife) && usefulLife > 0) body.usefulLifeYears = usefulLife
      if (Number.isFinite(residual) && residual >= 0) body.residualValue = residual
      if (form.serialNumber.trim()) body.serialNumber = form.serialNumber.trim()
      if (form.description.trim()) body.description = form.description.trim()

      const response = await fetch(`${API_V1}/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to create fixed asset.")
      }

      const createdName = payload?.data?.name ?? form.name.trim()
      setCreateSuccess(`Fixed asset "${createdName}" created successfully.`)
      setForm(INITIAL_FORM)
      setRefreshKey((k) => k + 1)
      // Auto-close shortly after success so user can see toast briefly
      setTimeout(() => {
        setIsCreateOpen(false)
        setCreateSuccess(null)
      }, 1200)
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

      <BranchAccountantSidebar
        activeHref="/branchaccount-pastor/asset-register"
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search transactions..."
                aria-label="Search assets"
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
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors mb-4 text-[13px] font-semibold">
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

              <div className="flex items-center gap-2.5 pt-1 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setIsCreateOpen(true)
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-6 sm:px-7 rounded-[8px] bg-[#2563EB] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap tracking-wide"
                >
                  + Add Asset
                </button>
                <button
                  type="button"
                  className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-6 sm:px-8 rounded-[8px] bg-[#EF4444] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:bg-[#DC2626] transition-colors whitespace-nowrap tracking-wide"
                  onClick={() => { window.location.href = '/branchaccount-pastor/depreciation' }}
                >
                  Asset Depreciation
                </button>
              </div>
            </header>

            {/* Tabs */}
            <div className="mb-6 flex overflow-x-auto no-scrollbar items-center gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
              {(() => {
                const dynamicLabels = (assetClasses ?? [])
                  .map((c) => (c.name ?? "").toString())
                  .filter((n) => n.length > 0)
                const labels = ["All Assets", ...dynamicLabels]
                return labels.map((label) => (
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
                ))
              })()}
              {assetClassesLoading && (
                <span className="text-[12px] text-[#6B7280] ml-1">Loading classes...</span>
              )}
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
                  {filteredAssets.map((asset, idx) => (
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
                      {filteredAssets.map((asset, idx) => (
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

      {/* Create Asset Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            setCreateError(null)
            setCreateSuccess(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Fixed Asset</DialogTitle>
            <DialogDescription>
              Register a new fixed asset under your branch. Required fields are
              marked with an asterisk.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAsset} className="space-y-4 py-2">
            {createError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
                {createSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Asset Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="e.g. Toyota Hiace Bus"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Asset Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.assetClassId}
                  onChange={(e) => updateForm("assetClassId", e.target.value)}
                  required
                  disabled={assetClassesLoading}
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] bg-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] disabled:bg-gray-50"
                >
                  <option value="">
                    {assetClassesLoading ? "Loading classes..." : "Select asset class"}
                  </option>
                  {(assetClasses ?? []).map((c) => {
                    const id = (c._id ?? c.id ?? "") as string
                    return (
                      <option key={id} value={id}>
                        {c.name}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Purchase Cost (NGN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchaseCost}
                  onChange={(e) => updateForm("purchaseCost", e.target.value)}
                  required
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Purchase Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => updateForm("purchaseDate", e.target.value)}
                  required
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Depreciation Method
                </label>
                <select
                  value={form.depreciationMethod}
                  onChange={(e) =>
                    updateForm(
                      "depreciationMethod",
                      e.target.value as AssetFormState["depreciationMethod"]
                    )
                  }
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] bg-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="straight_line">Straight Line</option>
                  <option value="declining_balance">Declining Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Useful Life (years)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.usefulLifeYears}
                  onChange={(e) => updateForm("usefulLifeYears", e.target.value)}
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="e.g. 10"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Residual Value (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.residualValue}
                  onChange={(e) => updateForm("residualValue", e.target.value)}
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="0.00"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => updateForm("serialNumber", e.target.value)}
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="Optional"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  placeholder="Optional notes about the asset"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={creatingAsset}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingAsset}>
                {creatingAsset ? "Creating..." : "Create Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


