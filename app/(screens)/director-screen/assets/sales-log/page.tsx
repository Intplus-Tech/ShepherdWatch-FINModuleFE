"use client"

import { API_V1 } from "@/lib/api";

import React, { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Trash2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import { useModalParam } from "@/components/hooks/useModalParam"
import RecordAssetSaleModal, { AssetSaleDetails, AssetSaleFormValues } from "@/components/modals/RecordAssetSaleModal"
import { useToast } from "@/components/ui/toast"
import { SkeletonTable } from "@/components/ui/skeleton"
import { rowsToCsv, downloadCsv, todayStamp } from "@/lib/export-csv"

function getCsrfToken(): string {
  if (typeof document === "undefined") return ""
  const match = document.cookie.split("; ").find((c) => c.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1]) : ""
}

function ModalContainer({ onSuccess }: { onSuccess: () => void }) {
  const { isOpen: isModalOpen, close } = useModalParam('record-sale')
  const searchParams = useSearchParams()
  const assetId = searchParams.get('assetId')
  const router = useRouter()
  const { pushToast } = useToast()

  const [saleDetails, setSaleDetails] = useState<AssetSaleDetails | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mode: "create" | "edit" = assetId ? "edit" : "create"

  useEffect(() => {
    if (!isModalOpen) {
      setSaleDetails(undefined)
      setErrorMessage(null)
      return
    }
    if (!assetId) {
      setSaleDetails({
        branchName: "",
        location: "",
        assetName: "",
        saleDate: "",
        saleAmount: "",
        buyerName: "",
        buyerContact: "",
        reasonForSale: "",
        proceedsToAccount: "",
        history: [],
      })
      return
    }

    let cancelled = false
    const fetchAsset = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)
        const res = await fetch(`${API_V1}/financial/fixed-assets/${assetId}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(payload?.message ?? "Unable to load asset details.")
        }
        const asset = payload?.data ?? payload ?? {}
        if (cancelled) return
        setSaleDetails({
          branchName: asset?.branchName ?? asset?.tenantId ?? "",
          location: asset?.location ?? "",
          assetName: asset?.name ?? asset?.assetName ?? asset?.description ?? "",
          saleDate: asset?.disposalDate ? String(asset.disposalDate).split("T")[0] : "",
          saleAmount: asset?.disposalValue !== undefined && asset?.disposalValue !== null
            ? String(asset.disposalValue)
            : asset?.currentValue !== undefined && asset?.currentValue !== null
              ? String(asset.currentValue)
              : "",
          buyerName: asset?.buyer ?? asset?.disposedTo ?? "",
          buyerContact: asset?.buyerContact ?? "",
          reasonForSale: asset?.reasonForSale ?? asset?.disposalReason ?? "",
          proceedsToAccount: asset?.proceedsToAccount ?? "",
          history: Array.isArray(asset?.depreciationHistory)
            ? asset.depreciationHistory.map((h: { yearNumber?: string; year?: string; amount?: string; isYTD?: boolean }, idx: number) => ({
                yearNumber: h?.yearNumber ?? `Year ${idx + 1}`,
                year: h?.year ?? "",
                amount: h?.amount ?? "",
                isYTD: h?.isYTD,
              }))
            : [],
        })
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Unable to load asset details.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAsset()
    return () => {
      cancelled = true
    }
  }, [assetId, isModalOpen])

  const handleSubmit = async (form: AssetSaleFormValues) => {
    try {
      setSubmitting(true)
      setErrorMessage(null)
      const csrfToken = getCsrfToken()
      const body = {
        saleDate: form.saleDate,
        saleAmount: form.saleAmount,
        buyerName: form.buyerName,
        buyerContact: form.buyerContact,
        reasonForSale: form.reasonForSale,
        proceedsToAccount: form.proceedsToAccount,
      }

      let res: Response
      if (mode === "edit" && assetId) {
        res = await fetch(`${API_V1}/financial/fixed-assets/${assetId}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify(body),
        })
      } else if (assetId) {
        res = await fetch(`${API_V1}/financial/fixed-assets/${assetId}/dispose`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify(body),
        })
      } else {
        throw new Error("Select an asset before recording a sale.")
      }

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to save sale.")
      }
      pushToast(mode === "edit" ? "Sale updated" : "Sale recorded", "success")
      onSuccess()
      close()
      router.replace("/director-screen/assets/sales-log")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to save sale.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!assetId) return
    if (typeof window !== "undefined" && !window.confirm("Delete this asset sale record? This cannot be undone.")) {
      return
    }
    try {
      setDeleting(true)
      setErrorMessage(null)
      const csrfToken = getCsrfToken()
      const res = await fetch(`${API_V1}/financial/fixed-assets/${assetId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to delete sale record.")
      }
      pushToast("Sale deleted", "success")
      onSuccess()
      close()
      router.replace("/director-screen/assets/sales-log")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to delete sale record.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <RecordAssetSaleModal
      isOpen={isModalOpen}
      onClose={() => {
        close()
        router.replace("/director-screen/assets/sales-log")
      }}
      saleDetails={saleDetails}
      mode={mode}
      onSubmit={handleSubmit}
      onDelete={mode === "edit" && assetId ? handleDelete : undefined}
      submitting={submitting || loading}
      deleting={deleting}
      errorMessage={errorMessage}
    />
  )
}

function PageInner() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [branchFilter, setBranchFilter] = useState("All")
  const [search, setSearch] = useState("")

  type SaleRow = {
    id: string
    date: string
    branch: string
    asset: string
    amount: string
    buyer: string
  }

  const [salesRows, setSalesRows] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSales = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_V1}/financial/fixed-assets`, {
        method: "GET",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load sales log.")
      }

      const data =
        payload?.data?.content ??
        payload?.data ??
        payload?.content ??
        []

      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(amount)

      const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ')
      }

      const soldAssets = (Array.isArray(data) ? data : []).filter(
        (asset: { status?: string }) => asset?.status?.toUpperCase() === "SOLD" || asset?.status?.toUpperCase() === "DISPOSED"
      )

      const mapped: SaleRow[] = soldAssets.map((asset: {
        id?: string
        _id?: string
        disposalDate?: string
        updatedAt?: string
        tenantId?: string
        name?: string
        description?: string
        assetName?: string
        disposalValue?: number
        currentValue?: number
        buyer?: string
        disposedTo?: string
      }) => ({
        id: String(asset?.id ?? asset?._id ?? ""),
        date: formatDate(asset?.disposalDate || asset?.updatedAt || ""),
        branch: asset?.tenantId ?? "All Branches",
        asset: asset?.name ?? asset?.description ?? asset?.assetName ?? "Unnamed Asset",
        amount: formatCurrency(Number(asset?.disposalValue || asset?.currentValue || 0)),
        buyer: asset?.buyer || asset?.disposedTo || "N/A",
      }))

      setSalesRows(mapped)
    } catch (err) {
      setSalesRows([])
      setError(err instanceof Error ? err.message : "Unable to load sales log.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleDeleteRow = async (row: SaleRow) => {
    if (!row.id) return
    if (typeof window !== "undefined" && !window.confirm(`Delete sale record for ${row.asset}? This cannot be undone.`)) {
      return
    }
    try {
      setDeletingId(row.id)
      const csrfToken = getCsrfToken()
      const res = await fetch(`${API_V1}/financial/fixed-assets/${row.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRF-Token": csrfToken },
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message ?? "Unable to delete sale record.")
      }
      pushToast("Sale deleted", "success")
      await fetchSales()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to delete sale record.", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const branchOptions = useMemo(
    () => ["All", ...Array.from(new Set(salesRows.map((r) => r.branch).filter(Boolean)))],
    [salesRows]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return salesRows.filter((row) => {
      if (branchFilter !== "All" && row.branch.toLowerCase() !== branchFilter.toLowerCase()) return false
      if (q) {
        const haystack = `${row.date} ${row.branch} ${row.asset} ${row.amount} ${row.buyer}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [salesRows, branchFilter, search])

  const handleExportLog = () => {
    if (filteredRows.length === 0) {
      pushToast("No rows to export.", "info")
      return
    }
    const csv = rowsToCsv(
      filteredRows.map((r) => ({
        Date: r.date,
        Branch: r.branch,
        Asset: r.asset,
        "Sale Amount": r.amount,
        "Buyer Info": r.buyer,
      })),
      ["Date", "Branch", "Asset", "Sale Amount", "Buyer Info"]
    )
    downloadCsv(`asset-sales-log-${todayStamp()}.csv`, csv)
  }

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
            <Link href="/director-screen/assets/branch-assets" className="rounded-[10px] border border-[#EEF1F6] bg-white p-5 cursor-pointer hover:border-gray-300 shadow-sm transition-colors block">
              <div className="text-[13px] font-[700] text-[#111827]">Branch Assets</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Live Tracking)</div>
            </Link>
            <Link href="/director-screen/assets/sales-log" className="rounded-[10px] border border-[#3B5BDB] bg-[#F0F4FF] p-5 cursor-pointer shadow-sm block">
              <div className="text-[13px] font-[700] text-[#111827]">Asset Sales Log</div>
              <div className="text-[12px] font-medium text-[#6B7280] mt-0.5">(Audit Trail)</div>
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-[18px] w-[18px] text-[#6B7280]" />
              <h3 className="text-[12px] font-[800] text-[#344054] tracking-wide uppercase">
                Asset Sales Log <span className="text-[#6B7280] font-normal tracking-normal ml-1 capitalize">(Audit Trail)</span>
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sales..."
                className="w-[180px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
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
              <button
                type="button"
                onClick={() => router.push('/director-screen/assets/sales-log?modal=record-sale')}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-3.5 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Record Sale
              </button>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#EEF1F6]">
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[13%]">Date</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[22%]">Branch</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[22%]">Asset</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Sale Amount</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[18%]">Buyer Info</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[10%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4">
                        <SkeletonTable rows={5} columns={6} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-rose-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        No asset sales found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr 
                        key={row.id || `${row.date}-${row.asset}`} 
                        className="cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                        onClick={() => {
                          if (row.id) {
                            router.push(`/director-screen/assets/sales-log?modal=record-sale&assetId=${encodeURIComponent(row.id)}`)
                          }
                        }}
                      >
                        <td className="px-6 py-4 font-medium text-[#9CA3AF]">{row.date}</td>
                        <td className="px-6 py-4 font-medium text-[#4B5563]">{row.branch}</td>
                        <td className="px-6 py-4 font-[700] text-[#111827]">{row.asset}</td>
                        <td className="px-6 py-4 font-[700] text-[#111827]">{row.amount}</td>
                        <td className="px-6 py-4 font-medium text-[#4B5563]">{row.buyer}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRow(row)
                            }}
                            disabled={deletingId === row.id || !row.id}
                            aria-label={`Delete sale ${row.asset}`}
                            className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 px-6 border-t border-[#EEF1F6]">
              <button
                type="button"
                onClick={handleExportLog}
                className="flex items-center gap-2 text-[12px] font-[600] text-[#4B5563] border border-[#E5E7EB] bg-white rounded-[6px] px-3.5 py-2 hover:bg-gray-50 transition-colors shadow-sm w-max"
              >
                <Download className="h-3.5 w-3.5" />
                Export Log
              </button>
            </div>
          </div>

        </div>
      </main>
      
      <Suspense fallback={null}>
        <ModalContainer onSuccess={fetchSales} />
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
