"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Landmark,
  PiggyBank,
  WalletMinimal,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"

const cards = [
  {
    title: "Total 10% Tithe Collected",
    value: "$1,240,500",
    meta: "+95%",
    icon: WalletMinimal,
    bar: "bg-[#3B5BDB]",
  },
  {
    title: "Total 20% Capital Savings",
    value: "$2,481,000",
    meta: "+92%",
    icon: PiggyBank,
    bar: "bg-[#7C3AED]",
  },
  {
    title: "Total 1% General Savings",
    value: "$124,050",
    meta: "-88%",
    icon: Landmark,
    bar: "bg-[#F97316]",
  },
]

const rows = [
  // Intentionally empty until compliance records endpoint is wired.
]

export default function Page() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<{ totalDue: number; totalPaid: number; complianceScore: number } | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [complianceScore, setComplianceScore] = useState<number | null>(null)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [statutory, setStatutory] = useState<{ totalTitheInflow: number; hqRemittanceAmount: number } | null>(null)
  const [statutoryError, setStatutoryError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  useEffect(() => {
    let isMounted = true

    const fetchSummary = async () => {
      if (!tenantId) {
        setSummaryError("Tenant is required to load compliance summary.")
        return
      }

      try {
        setSummaryError(null)
        const year = new Date().getFullYear()
        const params = new URLSearchParams({
          tenantId,
          periodStart: `${year}-01-01`,
          periodEnd: `${year}-12-31`,
        })
        const response = await fetch(`/api/core/financial/compliance/summary?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load compliance summary.")
        }

        const data = payload?.data ?? payload
        if (isMounted && data) {
          setSummary({
            totalDue: Number(data.totalDue ?? 0),
            totalPaid: Number(data.totalPaid ?? 0),
            complianceScore: Number(data.complianceScore ?? 0),
          })
        }
      } catch (error) {
        if (isMounted) {
          setSummaryError(error instanceof Error ? error.message : "Unable to load compliance summary.")
        }
      }
    }

    fetchSummary()

    return () => {
      isMounted = false
    }
  }, [tenantId])

  useEffect(() => {
    let isMounted = true

    const fetchStatutory = async () => {
      if (!tenantId) {
        setStatutoryError("Tenant is required to load statutory report.")
        return
      }
      try {
        setStatutoryError(null)
        const now = new Date()
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
        const params = new URLSearchParams({
          tenantId,
          periodStart,
          periodEnd,
          deductionRate: "10",
        })
        const response = await fetch(`/api/core/financial/reports/statutory?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load statutory report.")
        }
        const data = payload?.data ?? payload
        if (isMounted) {
          setStatutory({
            totalTitheInflow: Number(data?.totalTitheInflow ?? 0),
            hqRemittanceAmount: Number(data?.hqRemittanceAmount ?? 0),
          })
        }
      } catch (error) {
        if (isMounted) {
          setStatutory(null)
          setStatutoryError(error instanceof Error ? error.message : "Unable to load statutory report.")
        }
      }
    }

    fetchStatutory()

    return () => {
      isMounted = false
    }
  }, [tenantId])

  useEffect(() => {
    let isMounted = true

    const fetchScore = async () => {
      if (!tenantId) {
        setScoreError("Tenant is required to load compliance score.")
        return
      }
      try {
        setScoreError(null)
        const year = new Date().getFullYear()
        const params = new URLSearchParams({
          tenantId,
          periodStart: `${year}-01-01`,
          periodEnd: `${year}-12-31`,
        })
        const response = await fetch(`/api/core/financial/compliance/score?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load compliance score.")
        }
        const data = payload?.data ?? payload
        if (isMounted) {
          setComplianceScore(Number(data?.complianceScore ?? 0))
        }
      } catch (error) {
        if (isMounted) {
          setScoreError(error instanceof Error ? error.message : "Unable to load compliance score.")
        }
      }
    }

    fetchScore()

    return () => {
      isMounted = false
    }
  }, [tenantId])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)

  const cardData = cards.map((card, index) => {
    if (!summary) return card
    if (index === 0) {
      const value = statutory?.totalTitheInflow ?? summary.totalPaid
      return { ...card, value: formatCurrency(value) }
    }
    if (index === 1) {
      const value = statutory?.hqRemittanceAmount ?? summary.totalDue
      return { ...card, value: formatCurrency(value) }
    }
    if (complianceScore !== null) {
      return { ...card, value: `${complianceScore.toFixed(1)}%` }
    }
    return { ...card, value: `${summary.complianceScore.toFixed(1)}%` }
  })

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/compliance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">Statutory Compliance & Remittance</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">Consolidated view of HQ remittances across all branches for FY 2023-2024</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                  <CalendarDays className="h-4 w-4 text-[#6B7280]" />
                  Oct 2023
                  <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
                </button>
                <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
                  <Download className="h-4 w-4" /> Export for Audit
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cardData.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{card.title}</div>
                        <div className="mt-2 text-[17.79px] leading-[23.72px] font-bold text-[#111827]">{card.value}</div>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF]">
                        <Icon className="h-4 w-4 text-[#3B5BDB]" />
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-600">{card.meta} of target collected</div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#EEF1F6]">
                      <div className={`h-1.5 w-3/5 rounded-full ${card.bar}`} />
                    </div>
                  </div>
                )}
              )}
            </div>
            {summaryError && (
              <div className="mt-4 text-[12px] font-medium text-[#EF4444]">{summaryError}</div>
            )}
            {scoreError && (
              <div className="mt-2 text-[12px] font-medium text-[#EF4444]">{scoreError}</div>
            )}
            {statutoryError && (
              <div className="mt-2 text-[12px] font-medium text-[#EF4444]">{statutoryError}</div>
            )}

            <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <BranchesDropdown label="All Branches" className="text-[11px]" />
                  <button className="rounded-[8px] bg-[#E9EEFF] px-3 py-1.5 text-[11px] font-bold text-[#3B5BDB]">Compliant</button>
                  <button className="rounded-[8px] bg-[#F3F5F9] px-3 py-1.5 text-[11px] font-bold text-[#6B7280]">Overdue/Non-Compliant</button>
                </div>
                <div className="flex items-center gap-2 text-[#9CA3AF]">
                  <Filter className="h-4 w-4" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH NAME</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">TOTAL REMITTED</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">OUTSTANDING</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">LAST REMITTANCE</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">STATUS</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right border-y border-[#EEF1F6]">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                          No compliance records available for this period.
                        </td>
                      </tr>
                    )}
                    {rows.map((row) => (
                      <tr key={row.name} className="hover:bg-gray-50/50 font-semibold text-[#111827] transition-colors">
                        <td className="px-6 py-5">{row.name}</td>
                        <td className="px-6 py-5 text-[#6B7280]">{row.id}</td>
                        <td className="px-6 py-5">{row.total}</td>
                        <td className={`px-6 py-5 ${row.outstanding !== "$0.00" ? "text-rose-600" : "text-[#6B7280]"}`}>
                          {row.outstanding}
                        </td>
                        <td className="px-6 py-5 text-[#6B7280]">{row.last}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              row.status === "Compliant"
                                ? "bg-emerald-50 text-emerald-600"
                                : row.status === "Pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {row.status === "Compliant" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : row.status === "Pending" ? (
                              <Clock3 className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-[#9CA3AF]">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#EEF1F6] p-4 px-6">
                <span className="text-[13px] font-medium text-[#6B7280]">
                  Showing <span className="text-[#111827] font-bold">1-5</span> of <span className="font-bold text-[#111827]">45</span> branches
                </span>
                <div className="flex items-center gap-2">
                  <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50">Previous</button>
                  <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
