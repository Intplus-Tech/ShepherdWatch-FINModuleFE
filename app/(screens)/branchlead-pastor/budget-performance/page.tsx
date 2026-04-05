"use client"

import BudgetPage from "../budget/page"
import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  X,
  TrendingDown,
} from "lucide-react"

type BvaRow = {
  type: "parent" | "child"
  category: string
  budget: string
  monthly: string
  actual: string
  variance: string
  status: string
}

export default function Page() {
  const { user } = useAuth()
  const [bva, setBva] = useState<{ totalBudgeted: number; totalActual: number; categories: Array<Record<string, any>> } | null>(null)
  const [bvaLoading, setBvaLoading] = useState(false)
  const [bvaError, setBvaError] = useState<string | null>(null)

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
        const response = await fetch(`/api/core/financial/reports/bva?${params.toString()}`, {
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

  const cards = useMemo(() => {
    const totalBudgeted = bva?.totalBudgeted ?? 0
    const totalActual = bva?.totalActual ?? 0
    const variancePct = totalBudgeted ? ((totalBudgeted - totalActual) / totalBudgeted) * 100 : 0
    return [
      {
        title: "TOTAL ANNUAL BUDGET",
        value: formatCurrency(totalBudgeted),
        meta: "FY 2024",
      },
      {
        title: "YTD ACTUAL SPENT",
        value: formatCurrency(totalActual),
        meta: totalBudgeted ? "5% below target" : "Awaiting entries",
      },
      {
        title: "OVERALL VARIANCE",
        value: `${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%`,
        meta: variancePct >= 0 ? "Healthy Surplus" : "Over Target",
      },
    ]
  }, [bva])

  const rows: BvaRow[] = useMemo(() => {
    const categories = bva?.categories ?? []
    return categories.map((category) => {
      const budget = Number(category?.budgeted ?? category?.totalBudgeted ?? category?.budget ?? 0)
      const actual = Number(category?.actual ?? category?.totalActual ?? category?.spent ?? 0)
      const variancePct = budget ? ((budget - actual) / budget) * 100 : 0
      const status = variancePct < -5 ? "Exceeded" : variancePct < 0 ? "Warning" : "On Track"
      return {
        type: "parent",
        category: category?.name ?? category?.category ?? "Category",
        budget: formatCurrency(budget),
        monthly: formatCurrency(budget / 12),
        actual: formatCurrency(actual),
        variance: `${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%`,
        status,
      }
    })
  }, [bva])

  const totals = useMemo(() => {
    const totalBudgeted = bva?.totalBudgeted ?? 0
    const totalActual = bva?.totalActual ?? 0
    const variancePct = totalBudgeted ? ((totalBudgeted - totalActual) / totalBudgeted) * 100 : 0
    return {
      totalBudgeted,
      totalActual,
      variancePct,
    }
  }, [bva])
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0F1115] font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 scale-[1.06] origin-top-left blur-[8px]">
          <BudgetPage />
        </div>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-[1000px] max-h-[90vh] overflow-y-auto rounded-[18px] bg-white p-6 md:p-10 shadow-[0_25px_60px_rgba(15,23,42,0.35)] flex flex-col">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Budget Performance</h2>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">Detailed Budget vs. Actual (BVA) analysis across all streams.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="h-[38px] flex-1 sm:flex-none justify-center rounded-[10px] border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#374151]">
                <Printer className="mr-2 h-4 w-4 text-[#6B7280]" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button size="sm" className="h-[38px] flex-1 sm:flex-none justify-center rounded-[10px] bg-[#3B5BDB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4 hidden sm:inline-block" />
                <span>Export PDF</span>
              </Button>
              <button
                className="ml-2 flex items-center justify-center text-[#111827] opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close"
              >
                <X className="h-6 w-6 stroke-[2]" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {bvaLoading && (
              <div className="md:col-span-3 text-[12px] font-medium text-[#6B7280]">
                Loading BVA report...
              </div>
            )}
            {bvaError && (
              <div className="md:col-span-3 text-[12px] font-medium text-rose-500">
                {bvaError}
              </div>
            )}
            {cards.map((card) => (
              <div key={card.title} className="rounded-[14px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[11px] font-semibold text-[#94A3B8] tracking-wide">{card.title}</div>
                <div
                  className={`mt-2 text-[16px] font-semibold ${
                    card.title === "OVERALL VARIANCE" ? "text-emerald-600" : "text-[#111827]"
                  }`}
                >
                  {card.value}
                </div>
                {card.title === "YTD ACTUAL SPENT" ? (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <TrendingDown className="h-3.5 w-3.5 rotate-180 text-emerald-600" />
                    {card.meta}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#6B7280]">{card.meta}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-semibold text-[#94A3B8] mb-2">FISCAL PERIOD</div>
            <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#111827]">
              FY 2024 (Current)
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[14px] border border-[#EEF1F6]">
            <table className="w-full min-w-[900px] text-[12px]">
              <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                <tr>
                  <th className="py-3 px-4 text-left">ACCOUNT NAME</th>
                  <th className="py-3 px-4 text-right">ANNUAL BUDGET</th>
                  <th className="py-3 px-4 text-right">MONTHLY TARGET</th>
                  <th className="py-3 px-4 text-right">ACTUAL SPENT (YTD)</th>
                  <th className="py-3 px-4 text-right">VARIANCE (%)</th>
                  <th className="py-3 px-4 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bvaLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-[12px] text-[#6B7280]">
                      Loading BVA report…
                    </td>
                  </tr>
                ) : bvaError ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-[12px] text-rose-500">
                      {bvaError}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-[12px] text-[#6B7280]">
                      No BVA report data available for this period.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                  <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                    <td className={`py-3 px-4 font-medium ${row.type === "child" ? "pl-9 text-[#475569]" : "text-[#111827]"}`}>
                      <span className="inline-flex items-center gap-2">
                        {row.type === "parent" ? (
                          <ChevronDown className="h-3.5 w-3.5 text-[#3B5BDB]" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
                        )}
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#334155]">{row.budget}</td>
                    <td className="py-3 px-4 text-right text-[#64748B]">{row.monthly}</td>
                    <td className="py-3 px-4 text-right text-[#0F172A]">{row.actual}</td>
                    <td className={`py-3 px-4 text-right ${row.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                      {row.variance}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          row.status === "Warning"
                            ? "bg-amber-50 text-amber-600"
                            : row.status === "Exceeded"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {row.status === "Warning" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : row.status === "Exceeded" ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
                )}
                <tr className="border-t border-[#EEF1F6] bg-[#F8FAFF] font-semibold">
                  <td className="py-3 px-4 text-[#111827]">TOTALS</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(totals.totalBudgeted)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(totals.totalBudgeted / 12)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(totals.totalActual)}</td>
                  <td className={`py-3 px-4 text-right ${totals.variancePct < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {`${totals.variancePct >= 0 ? "+" : ""}${totals.variancePct.toFixed(1)}%`}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9CA3AF] text-center sm:text-left">
            <div>Showing 3 Streams, 10 Budget Heads</div>
            <div>Data updated: Oct 24, 2024 at 10:45 AM</div>
          </div>
        </div>
      </div>
    </div>
  )
}
