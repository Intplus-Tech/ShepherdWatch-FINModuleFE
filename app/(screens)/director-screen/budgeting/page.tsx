"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  ChevronDown,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw as UpdateIcon,
  Building2,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { BudgetUpdateModal } from "@/components/budgets/BudgetUpdateModal"
import { BudgetApprovalModal } from "@/components/budgets/BudgetApprovalModal"
import { Edit3, ShieldCheck } from "lucide-react"



export default function Page() {
  const router = useRouter()
  const { user } = useAuth()
  const [bva, setBva] = useState<{ totalBudgeted: number; totalActual: number; categories: Array<Record<string, any>> } | null>(null)
  const [bvaLoading, setBvaLoading] = useState(false)
  const [bvaError, setBvaError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  
  const [selectedBudget, setSelectedBudget] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  



  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

  useEffect(() => {
    let isMounted = true

    const fetchBva = async () => {
      if (!tenantId) {
        setBvaError("Tenant is required to load BVA report.")
        return
      }
      try {
        setBvaLoading(true)
        setBvaError(null)
        const now = new Date()
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
        const params = new URLSearchParams({
          tenantId,
          periodStart,
          periodEnd,
        })
        const response = await fetch(`${API_V1}/financial/reports/bva?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load BVA report.")
        }
        const data = payload?.data ?? payload
        if (isMounted) {
          setBva({
            totalBudgeted: Number(data?.totalBudgeted ?? 0),
            totalActual: Number(data?.totalActual ?? 0),
            categories: Array.isArray(data?.categories) ? data.categories : [],
          })
        }
      } catch (error) {
        if (isMounted) {
          setBva(null)
          setBvaError(error instanceof Error ? error.message : "Unable to load BVA report.")
        }
      } finally {
        if (isMounted) {
          setBvaLoading(false)
        }
      }
    }

    fetchBva()

    return () => {
      isMounted = false
    }
  }, [tenantId])

  const summary = useMemo(() => {
    const yearly = bva?.totalBudgeted ?? 0
    const ytdSpent = bva?.totalActual ?? 0
    const variancePct = yearly ? ((yearly - ytdSpent) / yearly) * 100 : 0

    return [
      {
        label: "Total Annual Budget",
        value: formatCurrency(yearly),
        note: "FY 2024",
      },
      {
        label: "YTD Actual Spent",
        value: formatCurrency(ytdSpent),
        note: yearly ? "5% below target" : "Awaiting entries",
      },
      {
        label: "Overall Variance",
        value: `${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%`,
        note: variancePct >= 0 ? "Healthy Surplus" : "Over Target",
      },
    ]
  }, [bva])

  const rows = useMemo(() => {
    const categories = bva?.categories ?? []
    const result: Array<{
      group?: boolean
      name: string
      budget: string
      target: string
      spent: string
      variance: string
      status: string
    }> = []
    categories.forEach((category) => {
      const budget = Number(category?.budgeted ?? category?.totalBudgeted ?? category?.budget ?? 0)
      const actual = Number(category?.actual ?? category?.totalActual ?? category?.spent ?? 0)
      const variancePct = budget ? ((budget - actual) / budget) * 100 : 0
      const status = variancePct < -5 ? "Exceeded" : variancePct < 0 ? "Warning" : "On Track"
      result.push({
        group: true,
        name: category?.name ?? category?.category ?? "Category",
        budget: formatCurrency(budget),
        target: formatCurrency(budget / 12),
        spent: formatCurrency(actual),
        variance: `${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%`,
        status,
      })
    })

    return result
  }, [bva])

  const totals = useMemo(() => {
    const totalBudget = bva?.totalBudgeted ?? 0
    const totalTarget = totalBudget / 12
    const totalSpent = bva?.totalActual ?? 0
    const variancePct = totalBudget ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0
    return { totalBudget, totalTarget, totalSpent, variancePct }
  }, [bva])

  const handleExport = async () => {
    if (!tenantId) {
      setExportError("Tenant is required to export budget entries.")
      return
    }
    setExporting(true)
    setExportError(null)

    try {
      const params = new URLSearchParams({ tenantId })
      const response = await fetch(`${API_V1}/export/budget-entries?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(async () => ({
          message: await response.text().catch(() => ""),
        }))
        throw new Error(payload?.message ?? "Unable to export budget entries.")
      }

      const blob = await response.blob()
      const disposition = response.headers.get("Content-Disposition") ?? ""
      const filenameMatch =
        disposition.match(/filename\\*=UTF-8''([^;]+)/i) ??
        disposition.match(/filename=\"?([^\";]+)\"?/i)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "budget-entries.csv"

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Unable to export budget entries.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-[#EEF1F6] bg-white xl:flex">
        <SidebarNav activeHref="/director-screen/budgeting" className="border-0" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 ml-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
          {exportError && (
            <div className="mb-4 text-[12px] font-semibold text-rose-500">
              {exportError}
            </div>
          )}

          <div className="flex flex-col gap-6">
             {/* Main Budgeting Panel */}
             <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden flex-1">
                
                <div className="p-6 pb-4">
                  {/* Internal Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#111827]">Budget Performance</h2>
                      <p className="text-[13px] text-[#9CA3AF] mt-1">Detailed Budget vs. Actual (BVA) analysis across all streams.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                      <button
                        onClick={() => router.push("/director-screen/new-budget")}
                        className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        New Budget Template
                      </button>
                      <button
                        onClick={() => router.push("/director-screen/budget-control")}
                        className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Budget Control
                      </button>
                      <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 ml-1 transition-colors">
                        <RefreshCw className="h-4 w-4" strokeWidth={2.5} /> Sync Feed
                      </button>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {bvaLoading && (
                      <div className="md:col-span-3 text-[12px] font-medium text-[#6B7280]">
                        Loading BVA report?
                      </div>
                    )}
                    {bvaError && (
                      <div className="md:col-span-3 text-[12px] font-medium text-rose-500">
                        {bvaError}
                      </div>
                    )}
                    {summary.map((card, i) => (
                      <div key={i} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2 uppercase">{card.label}</p>
                        <div className="flex items-end gap-3 mt-2">
                          <h3 className="text-[28px] leading-tight font-bold text-[#111827]">{card.value}</h3>
                        </div>
                        <p className={`text-[12px] font-bold mt-1.5 ${card.label == "Overall Variance" ? "text-emerald-500" : "text-[#9CA3AF]"}`}>{card.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Filters Block */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-[#FAFBFF] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 text-[13px] text-[#4B5563] font-medium">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">FISCAL PERIOD</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          FY 2024 (Current)
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">BRANCH</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          Maryland, Lagos
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">CURRENCY</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          USD ($)
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <button className="mt-5 md:mt-auto flex h-[42px] items-center justify-center gap-2 rounded-md bg-[#EEF2FF] px-4 font-bold text-[12px] text-[#3B5BDB] hover:bg-blue-50 transition-colors">
                        <UpdateIcon className="h-4 w-4" /> Update Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-white border-b border-[#EEF1F6]">
                      <tr>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ACCOUNT NAME</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ANNUAL BUDGET</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">MONTHLY TARGET</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ACTUAL SPENT (YTD)</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">VARIANCE (%)</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {bvaLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                            Loading budget entries…
                          </td>
                        </tr>
                      ) : bvaError ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-rose-500">
                            {bvaError}
                          </td>
                        </tr>
                      ) : rows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                            No BVA report data available for this period.
                          </td>
                        </tr>
                      ) : (



                        rows.map((row, idx) => (
                          <tr key={row.name + idx} className={`bg-white hover:bg-gray-50/50 transition-colors`}>
                            <td className={`px-6 py-5 text-[12px] flex items-center ${row.group ? "font-bold text-[#111827]" : "font-semibold text-[#6B7280] ml-6"} uppercase tracking-wide`}>
                              {row.group ? <ChevronDown className="h-4 w-4 mr-2" strokeWidth={3} /> : null}
                              {row.name}
                            </td>
                            <td className={`px-6 py-5 text-[13px] ${row.group ? "font-bold text-[#111827]" : "font-bold text-[#6B7280]"}`}>{row.budget}</td>
                            <td className="px-6 py-5 text-[13px] font-bold text-[#9CA3AF]">{row.target}</td>
                            <td className={`px-6 py-5 text-[13px] ${row.group ? "font-bold text-[#111827]" : "font-bold text-[#6B7280]"}`}>{row.spent}</td>
                            <td className={`px-6 py-5 text-[13px] font-bold ${row.variance.startsWith("-") ? "text-rose-500" : "text-emerald-500"}`}>
                              {row.variance}
                            </td>
                            <td className="px-6 py-5 flex items-center justify-between">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                  row.status == "On Track"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : row.status == "Warning"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {row.status == "On Track" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : row.status == "Warning" ? (
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                {row.status}
                              </span>
                              {!row.group && (
                                <div className="flex items-center gap-1 ml-3">
                                  <button
                                    onClick={() => {
                                      setSelectedBudget({
                                        id: row.name.toLowerCase().replace(/ /g, '-'),
                                        title: row.name,
                                        amount: parseFloat(row.budget.replace(/[^0-9.]/g, '')),
                                        category: "operational"
                                      })
                                      setEditModalOpen(true)
                                    }}
                                    className="p-1.5 text-[#9CA3AF] hover:text-[#3B5BDB] bg-white hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-md transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBudget({
                                        id: row.name.toLowerCase().replace(/ /g, '-'),
                                        title: row.name
                                      })
                                      setApprovalModalOpen(true)
                                    }}
                                    className="p-1.5 text-[#9CA3AF] hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-md transition-colors"
                                    title="Director Approval"
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                      {!bvaLoading && !bvaError && rows.length > 0 && (
                        <tr className="bg-gray-50/50 border-t-2 border-[#111827]">
                          <td className="px-6 py-5 text-[13px] font-bold text-[#111827] uppercase tracking-wide">
                            Total
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">{formatCurrency(totals.totalBudget)}</td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">{formatCurrency(totals.totalTarget)}</td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">{formatCurrency(totals.totalSpent)}</td>
                          <td className={`px-6 py-5 text-[13px] font-bold ${totals.variancePct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {`${totals.variancePct >= 0 ? "+" : ""}${totals.variancePct.toFixed(1)}%`}
                          </td>
                          <td className="px-6 py-5"></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between border-t border-[#EEF1F6] p-5">
                  <span className="text-[13px] font-medium text-[#6B7280]">
                    Showing 1-5 of 45 categories
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#9CA3AF] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Previous</button>
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Next</button>
                  </div>
                </div>

             </div>
          </div>
        </div>
      </main>
    </div>
  )
}


