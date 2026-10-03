"use client"

import React, { Suspense, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, FileSpreadsheet, Plus, Trash2 } from "lucide-react"
import FinanceControllerSidebar from "@/components/navigation/FinanceControllerSidebar"
import RecordAssetSaleContainer from "@/components/assets/RecordAssetSaleContainer"
import { useToast } from "@/components/ui/toast"
import { SkeletonTable } from "@/components/ui/skeleton"
import { rowsToCsv, downloadCsv, todayStamp } from "@/lib/export-csv"
import {
  useAssetSalesLogs,
  deleteSaleLog,
  AssetSaleLog,
} from "@/components/hooks/useAssetSalesLogs"

const RETURN_PATH = "/finance-controller/assets/sales-log"

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
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
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

  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [actingId, setActingId] = useState<string | null>(null)

  const { salesLogs, loading, error, refresh } = useAssetSalesLogs()

  const salesRows = useMemo<SaleRow[]>(
    () => (Array.isArray(salesLogs) ? salesLogs : []).map(mapLogToRow),
    [salesLogs]
  )

  const statusOptions = useMemo(
    () => ["All", ...Array.from(new Set(salesRows.map((r) => r.status).filter(Boolean)))],
    [salesRows]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return salesRows.filter((row) => {
      if (statusFilter !== "All" && row.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      if (q) {
        const haystack = `${row.date} ${row.branch} ${row.asset} ${row.amount} ${row.buyer} ${row.status}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [salesRows, statusFilter, search])

  // A sale the branch pastor has not ruled on yet can still be withdrawn.
  const handleDeleteRow = async (row: SaleRow) => {
    if (!row.id) return
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete sale record for ${row.asset}? This cannot be undone.`)
    ) {
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
      <FinanceControllerSidebar activeHref="/finance-controller/assets/sales-log" />

      <main className="flex-1 flex flex-col min-w-0 text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Asset Sales</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Record a disposal and track it through approval
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportLog}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </button>
              <button
                type="button"
                onClick={() => router.push(`${RETURN_PATH}?modal=record-sale`)}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-3.5 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Record Sale
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-[18px] w-[18px] text-[#6B7280]" />
              <h3 className="text-[12px] font-[800] text-[#344054] tracking-wide uppercase">
                Asset Sales Log
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
                  aria-label="Filter by status"
                  className="appearance-none rounded-[6px] border border-[#E5E7EB] bg-white pl-3 pr-8 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50 focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "All" ? "All Statuses" : opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
              {error}
            </div>
          ) : null}

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
                        <SkeletonTable rows={4} columns={7} />
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-[12.5px] text-[#9CA3AF]">
                        {salesRows.length === 0
                          ? "No asset sales recorded yet. Use “Record Sale” to raise one."
                          : "No sales match this search."}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id || `${row.date}-${row.asset}`}>
                        <td className="px-6 py-4 text-[#6B7280]">{row.date}</td>
                        <td className="px-6 py-4">{row.branch}</td>
                        <td className="px-6 py-4 font-medium">{row.asset}</td>
                        <td className="px-6 py-4 font-semibold">{row.amount}</td>
                        <td className="px-6 py-4 text-[#6B7280]">{row.buyer}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {row.status === "PENDING" ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row)}
                              disabled={actingId === row.id}
                              className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-600 hover:underline disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {actingId === row.id ? "Deleting..." : "Delete"}
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#9CA3AF]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <RecordAssetSaleContainer returnPath={RETURN_PATH} onSuccess={refresh} />
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
