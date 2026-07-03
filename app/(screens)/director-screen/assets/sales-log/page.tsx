"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Trash2,
  Check,
  X as XIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import { useModalParam } from "@/components/hooks/useModalParam"
import RecordAssetSaleModal, { AssetSaleDetails, AssetSaleFormValues } from "@/components/modals/RecordAssetSaleModal"
import { useToast } from "@/components/ui/toast"
import { SkeletonTable } from "@/components/ui/skeleton"
import { rowsToCsv, downloadCsv, todayStamp } from "@/lib/export-csv"
import { useAuth } from "@/components/auth/AuthProvider"
import { useAssetOverview } from "@/components/hooks/useAssetOverview"
import {
  useAssetSalesLogs,
  createSaleLog,
  approveSaleLog,
  rejectSaleLog,
  deleteSaleLog,
  AssetSaleLog,
} from "@/components/hooks/useAssetSalesLogs"

function ModalContainer({ onSuccess }: { onSuccess: () => void }) {
  const { isOpen: isModalOpen, close } = useModalParam('record-sale')
  const searchParams = useSearchParams()
  const assetId = searchParams.get('assetId') ?? ""
  const router = useRouter()
  const { pushToast } = useToast()
  const { user } = useAuth()

  // Assets for the "Asset" dropdown in create mode.
  const { items: assetItems } = useAssetOverview({ enabled: isModalOpen })
  const assetOptions = useMemo(
    () =>
      assetItems
        .map((a) => ({
          id: String(a.id ?? a._id ?? ""),
          name: String(a.name ?? a.id ?? a._id ?? "Unnamed asset"),
        }))
        .filter((a) => a.id),
    [assetItems]
  )

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // This modal flow is always "create a sale request" against the new
  // asset-sales-logs endpoint. The assetId is sourced from the URL param.
  const emptyDetails: AssetSaleDetails = {
    branchName: "",
    location: "",
    assetId: assetId || undefined,
    assetName: assetId ? `Asset ${assetId}` : "",
    saleDate: "",
    saleAmount: "",
    buyerName: "",
    buyerContact: "",
    reasonForSale: "",
    proceedsToAccount: "",
    history: [],
  }

  useEffect(() => {
    if (!isModalOpen) {
      setErrorMessage(null)
    }
  }, [isModalOpen])

  const handleSubmit = async (form: AssetSaleFormValues) => {
    try {
      setSubmitting(true)
      setErrorMessage(null)

      // assetId is required by the backend. It comes from the Asset dropdown
      // (form.assetId) or, when the page was opened for a specific asset, the
      // URL param.
      const resolvedAssetId = form.assetId?.trim() || assetId
      if (!resolvedAssetId) {
        throw new Error("Please select an asset for this sale.")
      }

      const body = {
        assetId: resolvedAssetId,
        branchId: user?.branchId || undefined,
        saleDate: form.saleDate,
        saleAmount: form.saleAmount,
        buyerName: form.buyerName,
        buyerContact: form.buyerContact,
        reasonForSale: form.reasonForSale,
        proceedsToAccount: form.proceedsToAccount,
      }

      await createSaleLog(body)
      pushToast("Sale recorded", "success")
      onSuccess()
      close()
      router.replace("/director-screen/assets/sales-log")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to save sale.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RecordAssetSaleModal
      isOpen={isModalOpen}
      onClose={() => {
        close()
        router.replace("/director-screen/assets/sales-log")
      }}
      saleDetails={emptyDetails}
      mode="create"
      assetOptions={assetOptions}
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  )
}

type SaleRow = {
  id: string
  date: string
  branch: string
  asset: string
  amount: string
  buyer: string
  status: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}

function mapLogToRow(log: AssetSaleLog): SaleRow {
  return {
    id: String(log?.id ?? log?._id ?? ""),
    date: formatDate(String(log?.saleDate ?? log?.createdAt ?? "")),
    branch: String(log?.branchName ?? log?.branchId ?? "All Branches"),
    asset: String(log?.assetName ?? log?.assetId ?? "Unnamed Asset"),
    amount: formatCurrency(Number(log?.saleAmount ?? 0)),
    buyer: String(log?.buyerName ?? "N/A"),
    status: String(log?.status ?? "PENDING").toUpperCase(),
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  const styles =
    s === "APPROVED"
      ? "bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]"
      : s === "REJECTED"
        ? "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]"
        : "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]"
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${styles}`}>
      {s.toLowerCase()}
    </span>
  )
}

function PageInner() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [branchFilter, setBranchFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [actingId, setActingId] = useState<string | null>(null)

  const { salesLogs, loading, error, refresh } = useAssetSalesLogs()

  const salesRows = useMemo<SaleRow[]>(
    () => (Array.isArray(salesLogs) ? salesLogs : []).map(mapLogToRow),
    [salesLogs]
  )

  const handleDeleteRow = async (row: SaleRow) => {
    if (!row.id) return
    if (typeof window !== "undefined" && !window.confirm(`Delete sale record for ${row.asset}? This cannot be undone.`)) {
      return
    }
    try {
      setActingId(row.id)
      await deleteSaleLog(row.id)
      pushToast("Sale deleted", "success")
      await refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to delete sale record.", "error")
    } finally {
      setActingId(null)
    }
  }

  const handleApproveRow = async (row: SaleRow) => {
    if (!row.id) return
    try {
      setActingId(row.id)
      await approveSaleLog(row.id)
      pushToast("Sale approved", "success")
      await refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to approve sale.", "error")
    } finally {
      setActingId(null)
    }
  }

  const handleRejectRow = async (row: SaleRow) => {
    if (!row.id) return
    const reason = typeof window !== "undefined"
      ? window.prompt("Reason for rejecting this sale?")
      : ""
    if (!reason) return
    try {
      setActingId(row.id)
      await rejectSaleLog(row.id, reason)
      pushToast("Sale rejected", "success")
      await refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to reject sale.", "error")
    } finally {
      setActingId(null)
    }
  }

  const branchOptions = useMemo(
    () => ["All", ...Array.from(new Set(salesRows.map((r) => r.branch).filter(Boolean)))],
    [salesRows]
  )

  const statusOptions = useMemo(
    () => ["All", ...Array.from(new Set(salesRows.map((r) => r.status).filter(Boolean)))],
    [salesRows]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return salesRows.filter((row) => {
      if (branchFilter !== "All" && row.branch.toLowerCase() !== branchFilter.toLowerCase()) return false
      if (statusFilter !== "All" && row.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (q) {
        const haystack = `${row.date} ${row.branch} ${row.asset} ${row.amount} ${row.buyer} ${row.status}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [salesRows, branchFilter, statusFilter, search])

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
        Status: r.status,
      })),
      ["Date", "Branch", "Asset", "Sale Amount", "Buyer Info", "Status"]
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-[6px] border border-[#E5E7EB] bg-white pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt === "All" ? "All Statuses" : opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              </div>
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
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[12%]">Date</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[18%]">Branch</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[18%]">Asset</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[14%]">Sale Amount</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[15%]">Buyer Info</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[11%]">Status</th>
                    <th className="px-6 py-4 font-medium text-[#6B7280] w-[12%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4">
                        <SkeletonTable rows={5} columns={7} />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-rose-600">
                        {error}
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">
                        No asset sales found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const isPending = row.status === "PENDING"
                      const busy = actingId === row.id
                      return (
                        <tr
                          key={row.id || `${row.date}-${row.asset}`}
                          className="hover:bg-[#F8FAFC] transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-[#9CA3AF]">{row.date}</td>
                          <td className="px-6 py-4 font-medium text-[#4B5563]">{row.branch}</td>
                          <td className="px-6 py-4 font-[700] text-[#111827]">{row.asset}</td>
                          <td className="px-6 py-4 font-[700] text-[#111827]">{row.amount}</td>
                          <td className="px-6 py-4 font-medium text-[#4B5563]">{row.buyer}</td>
                          <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRow(row)}
                                    disabled={busy || !row.id}
                                    aria-label={`Approve sale ${row.asset}`}
                                    className="inline-flex items-center justify-center rounded-md border border-[#ABEFC6] bg-white p-1.5 text-[#027A48] hover:bg-[#ECFDF3] disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectRow(row)}
                                    disabled={busy || !row.id}
                                    aria-label={`Reject sale ${row.asset}`}
                                    className="inline-flex items-center justify-center rounded-md border border-[#FECDCA] bg-white p-1.5 text-[#B42318] hover:bg-[#FEF3F2] disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row)}
                                disabled={busy || !row.id}
                                aria-label={`Delete sale ${row.asset}`}
                                className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
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
        <ModalContainer onSuccess={refresh} />
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
