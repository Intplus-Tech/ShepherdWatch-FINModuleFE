"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Download,
  ChevronDown,
  Building,
  Eye,
  Plus
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import AssetDetailsModal, { AssetDetails } from "@/components/modals/AssetDetailsModal"
import RecordAssetSaleModal, { AssetSaleDetails } from "@/components/modals/RecordAssetSaleModal"
import AddNewAssetModal from "@/components/modals/AddNewAssetModal"
import { useAssetOverview } from "@/components/hooks/useAssetOverview"
import { useModalParam } from "@/components/hooks/useModalParam"

type RawAsset = Record<string, unknown> & { id?: string; _id?: string }

function ModalContainer({ rawAssets = [] }: { rawAssets?: RawAsset[] }) {
  const searchParams = useSearchParams()
  const { isOpen: isDetailsModalOpen, close: closeDetails } = useModalParam('asset-details')
  const { isOpen: isRecordSaleModalOpen, close: closeRecordSale } = useModalParam('record-sale')
  const { isOpen: isAddAssetModalOpen, close: closeAddAsset } = useModalParam('add-asset')
  const selectedAssetId = searchParams.get('assetId') ?? ''

  const formatNgn = (n: unknown) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(n ?? 0))
  const formatDate = (value: unknown): string => {
    if (!value) return ''
    const d = new Date(String(value))
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const selectedRaw = rawAssets.find((a) => String(a.id ?? a._id ?? '') === selectedAssetId)
  const selectedAsset: AssetDetails | null = selectedRaw
    ? {
        name: String(selectedRaw.name ?? selectedRaw.assetName ?? selectedRaw.description ?? 'Asset'),
        location: String(selectedRaw.location ?? selectedRaw.branchName ?? selectedRaw.branch ?? ''),
        category: String(selectedRaw.category ?? 'General'),
        cost: formatNgn(selectedRaw.cost ?? selectedRaw.purchaseValue ?? selectedRaw.value),
        purchaseDate: formatDate(selectedRaw.purchaseDate ?? selectedRaw.acquisitionDate),
        depreciationMethod: String(selectedRaw.depreciationMethod ?? 'Straight Line'),
        usefulLife: selectedRaw.usefulLife ? `${selectedRaw.usefulLife} years` : '',
        residualValue: selectedRaw.residualValue ? formatNgn(selectedRaw.residualValue) : '',
        accumulatedDepreciation: formatNgn(selectedRaw.accumulatedDepreciation),
        currentNBV: formatNgn(selectedRaw.nbv ?? selectedRaw.currentValue),
        history: Array.isArray(selectedRaw.history)
          ? (selectedRaw.history as Array<Record<string, unknown>>).map((h, i) => ({
              yearNumber: String(h.yearNumber ?? `Year ${i + 1}`),
              year: String(h.year ?? ''),
              amount: formatNgn(h.amount),
              isYTD: Boolean(h.isYTD),
            }))
          : [],
      }
    : null

  // Placeholder mock data fallback used when no asset is selected
  const mockAsset: AssetDetails = {
    name: "Toyota Hiace Bus",
    location: "Maryland, Lagos",
    category: "Motor Vehicle",
    cost: "₦15,000,000",
    purchaseDate: "10 Jan 2022",
    depreciationMethod: "Straight Line (Director Policy)",
    usefulLife: "5 years",
    residualValue: "10% (₦1,500,000)",
    accumulatedDepreciation: "₦6,000,000",
    currentNBV: "₦9,000,000",
    history: [
      { yearNumber: "Year 1", year: "2022", amount: "₦2,700,000" },
      { yearNumber: "Year 2", year: "2023", amount: "₦2,700,000" },
      { yearNumber: "Year 3", year: "2024", amount: "₦600,000", isYTD: true }
    ]
  }

  const mockSale: AssetSaleDetails = {
    branchName: "Agodi, Ibadan",
    location: "Maryland, Lagos",
    assetName: "Projector (Epson) - IT Equipment",
    saleDate: "10 Apr 2025",
    saleAmount: "Projector (Epson) - IT Equipment",
    buyerName: "Light City School",
    buyerContact: "08012345678",
    reasonForSale: "Upgraded to new model",
    proceedsToAccount: "Domiciliary / Naira",
    history: [
      { yearNumber: "Year 1", year: "2022", amount: "₦2,700,000" },
      { yearNumber: "Year 2", year: "2023", amount: "₦2,700,000" },
      { yearNumber: "Year 3", year: "2024", amount: "₦500,000", isYTD: true }
    ]
  }

  return (
    <>
      <AssetDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={closeDetails}
        asset={selectedAsset ?? mockAsset}
      />
      <RecordAssetSaleModal 
        isOpen={isRecordSaleModalOpen} 
        onClose={closeRecordSale}
        saleDetails={mockSale}
      />
      <AddNewAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={closeAddAsset}
      />
    </>
  )
}

function PageInner() {
  const router = useRouter()

  const [assets, setAssets] = useState<any[]>([])
  const [branchFilter, setBranchFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [rawAssets, setRawAssets] = useState<RawAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    items: overviewItems,
    isLoading: overviewLoading,
    error: overviewError,
  } = useAssetOverview()

  useEffect(() => {
    setLoading(overviewLoading)
    setError(overviewError)

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(amount)

    const mapped = (overviewItems ?? []).map((asset: any) => ({
      id: String(asset?.id ?? asset?._id ?? ''),
      branch: asset?.branchName ?? asset?.branch ?? asset?.tenantId ?? "All Branches",
      name: asset?.name ?? asset?.assetName ?? asset?.description ?? "Unnamed Asset",
      category: asset?.category ?? "General",
      cost: formatCurrency(Number(asset?.cost ?? asset?.purchaseValue ?? asset?.value ?? 0)),
      nbv: formatCurrency(Number(asset?.nbv ?? asset?.currentValue ?? asset?.purchaseValue ?? 0)),
      status: asset?.status ?? "Active",
    }))

    setAssets(mapped)
    setRawAssets((overviewItems ?? []) as RawAsset[])
  }, [overviewItems, overviewLoading, overviewError])

  const branchOptions = useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => String(a.branch)).filter(Boolean)))],
    [assets]
  )
  const categoryOptions = useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => String(a.category)).filter(Boolean)))],
    [assets]
  )
  const statusOptions = useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => String(a.status)).filter(Boolean)))],
    [assets]
  )

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase()
    return assets.filter((row) => {
      if (branchFilter !== "All" && String(row.branch).toLowerCase() !== branchFilter.toLowerCase()) return false
      if (categoryFilter !== "All" && String(row.category).toLowerCase() !== categoryFilter.toLowerCase()) return false
      if (statusFilter !== "All" && String(row.status).toLowerCase() !== statusFilter.toLowerCase()) return false
      if (q) {
        const haystack = `${row.branch} ${row.name} ${row.category} ${row.status}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [assets, branchFilter, categoryFilter, statusFilter, search])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">

      <SidebarNav
        activeHref="/director-screen/assets"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] flex flex-col min-w-0 text-[#111827]">

        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center justify-center sm:justify-start gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 w-full sm:w-auto sm:ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <h2 className="text-[14px] font-[800] text-[#344054] tracking-wide uppercase mb-6">
            ASSET & DEPRECIATION MANAGER
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <Link href="/director-screen/assets" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Depreciation Policies</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Global Config)</div>
            </Link>
            <Link href="/director-screen/assets/branch-assets" className="rounded-[10px] border border-[#3B5BDB] bg-[#F0F4FF] p-5 cursor-pointer shadow-sm block">
              <div className="text-[13px] font-[700] text-[#111827]">Branch Assets</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Live Tracking)</div>
            </Link>
            <Link href="/director-screen/assets/sales-log" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Asset Sales Log</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Audit Trail)</div>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Building className="h-[18px] w-[18px] text-[#6B7280]" />
              <h3 className="text-[12px] font-[800] text-[#344054] tracking-wide">
                BRANCH ASSETS REGISTER
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-[180px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
              <div className="relative flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Filter:</span>
                <div className="relative">
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="appearance-none rounded-[6px] border border-[#E5E7EB] bg-white pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                  >
                    {branchOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt === "All" ? "All Branches" : opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                </div>
              </div>
              <div className="relative flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Category:</span>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none rounded-[6px] border border-[#E5E7EB] bg-white pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt === "All" ? "All Categories" : opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                </div>
              </div>
              <div className="relative flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#6B7280]">Status:</span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none rounded-[6px] border border-[#E5E7EB] bg-white pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt === "All" ? "All Statuses" : opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EEF1F6]">
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Branch</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[20%]">Asset Name</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Category</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%] text-right">Cost (₦)</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%] text-right">NBV (₦)</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        Loading branch assets...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-rose-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        No branch assets found.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        onClick={() => row.id && router.push(`/director-screen/assets/branch-assets?modal=asset-details&assetId=${encodeURIComponent(row.id)}`)}
                        className={row.id ? 'cursor-pointer hover:bg-[#F8FAFC] transition-colors' : ''}
                      >
                        <td className="px-6 py-4 font-medium text-[#4B5563]">{row.branch}</td>
                        <td className="px-6 py-4 font-[700] text-[#111827]">{row.name}</td>
                        <td className="px-6 py-4 font-medium text-[#9CA3AF]">{row.category}</td>
                        <td className="px-6 py-4 font-[600] text-[#4B5563] text-right">{row.cost}</td>
                        <td className="px-6 py-4 font-[600] text-[#4B5563] text-right">{row.nbv}</td>
                        <td className="px-6 py-4">
                          {row.status === "Active" || row.status === "ACTIVE" ? (
                            <span className="inline-flex items-center rounded-full bg-[#10B981] px-2.5 py-0.5 text-[11px] font-[600] text-white">
                              Active
                            </span>
                          ) : (
                            <button className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-[600] text-[#6B7280] shadow-sm">
                              {row.status || "Sold"}
                              <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-t border-[#EEF1F6] gap-4">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                  <Download className="h-3.5 w-3.5" />
                  Export Log
                </button>
                <button 
                  onClick={() => router.push('/director-screen/assets/branch-assets?modal=asset-details')}
                  className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/director-screen/assets/branch-assets?modal=record-sale')}
                  className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Record Asset Sale
                </button>
                <button
                  onClick={() => router.push('/director-screen/assets/branch-assets?modal=add-asset')}
                  className="flex items-center gap-2 rounded-[6px] bg-[#3B5BDB] px-4 py-2 text-[12px] font-[600] text-white shadow hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Asset
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Suspense fallback={null}>
        <ModalContainer rawAssets={rawAssets} />
      </Suspense>
    </div>
  )
}


export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  )
}
