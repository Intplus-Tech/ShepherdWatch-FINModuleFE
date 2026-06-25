"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useMemo, useState } from "react"
import {
  Filter,
  Landmark,
  PiggyBank,
  WalletMinimal,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react"
import BranchesDropdown from "@/components/navigation/BranchesDropdown"
import { useStatutoryDeductions } from "@/components/hooks/useStatutoryDeductions"
import { useComplianceDashboard } from "@/components/hooks/useComplianceDashboard"
import { useComplianceSummary } from "@/components/hooks/useComplianceSummary"

export default function Page() {
  const { user } = useAuth()
  const {
    fetchDeductions,
    getDeductionById,
    updateDeduction,
    remitDeduction,
    deductions,
    selectedDeduction,
    pagination,
    updating,
    remitting,
    loading: deductionsLoading,
    detailLoading,
    listError,
    detailError,
    setError: setCreateError,
  } = useStatutoryDeductions()
  const {
    data: complianceDashboard,
    loading: complianceLoading,
    error: complianceError,
    fetchDashboard,
  } = useComplianceDashboard()
  const {
    complianceData: complianceSummary,
    loading: summaryLoading,
    error: summaryError,
    fetchSummary,
  } = useComplianceSummary()
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [remitSuccess, setRemitSuccess] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [remittedFilter, setRemittedFilter] = useState<"all" | "pending" | "compliant">("all")
  const [editAmount, setEditAmount] = useState("")
  const [editPeriod, setEditPeriod] = useState("")
  const [remittanceDate, setRemittanceDate] = useState("")
  const [receiptNumber, setReceiptNumber] = useState("")

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  useEffect(() => {
    if (!tenantId) return
    fetchDashboard({ branchId: tenantId, fiscalYear: new Date().getFullYear() }).catch(() => undefined)
  }, [tenantId, fetchDashboard])

  useEffect(() => {
    if (!tenantId) return
    const year = new Date().getFullYear()
    fetchSummary({
      branchId: tenantId,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    }).catch(() => undefined)
  }, [tenantId, fetchSummary])

  useEffect(() => {
    if (!tenantId) return
    const remitted =
      remittedFilter === "all"
        ? undefined
        : remittedFilter === "compliant"
    fetchDeductions({
      page: currentPage,
      limit: 20,
      branchId: tenantId,
      remitted,
    }).catch(() => undefined)
  }, [tenantId, remittedFilter, currentPage, fetchDeductions])


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount)

  const cardData = [
    {
      title: "Total Liability",
      value: complianceDashboard ? formatCurrency(complianceDashboard.totalLiability) : "—",
      meta: complianceDashboard ? `${complianceDashboard.fiscalYear} fiscal year` : "Loading...",
      icon: WalletMinimal,
      bar: "bg-[#3B5BDB]",
    },
    {
      title: "Total Remitted",
      value: complianceSummary ? formatCurrency(complianceSummary.totalRemitted) : "—",
      meta: complianceDashboard ? `${complianceDashboard.complianceRate.toFixed(1)}% compliance rate` : "Loading...",
      icon: PiggyBank,
      bar: "bg-[#7C3AED]",
    },
    {
      title: "Available Funds",
      value: complianceDashboard ? formatCurrency(complianceDashboard.availableFunds) : "—",
      meta: complianceSummary ? `${formatCurrency(complianceSummary.outstanding)} outstanding` : "Loading...",
      icon: Landmark,
      bar: "bg-[#F97316]",
    },
  ]

  const rows = deductions.map((item) => ({
    rawId: item.id,
    name: item.branchId ? "Branch Deduction" : "Compliance Deduction",
    id: item.id.slice(0, 8).toUpperCase(),
    total: formatCurrency(item.amount),
    outstanding: item.remitted ? formatCurrency(0) : formatCurrency(item.amount),
    isOutstanding: !item.remitted,
    last: item.period,
    status: item.remitted ? "Compliant" : "Pending",
  }))

  const handleSelectDeduction = (id: string) => {
    setUpdateSuccess(null)
    setRemitSuccess(null)
    getDeductionById(id)
      .then((deduction) => {
        setEditAmount(deduction.amount ? String(deduction.amount) : "")
        setEditPeriod(deduction.period || "")
        setRemittanceDate(deduction.remittedAt ? deduction.remittedAt.slice(0, 10) : "")
        setReceiptNumber(deduction.receiptNumber || "")
      })
      .catch(() => undefined)
  }

  const handleUpdateDeduction = async () => {
    if (!selectedDeduction) return
    setUpdateSuccess(null)
    setCreateError(null)

    const nextAmount = Number(editAmount)
    if (!editPeriod.trim()) {
      setCreateError("Period is required.")
      return
    }
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setCreateError("Amount must be greater than 0.")
      return
    }

    try {
      await updateDeduction(selectedDeduction.id, {
        amount: nextAmount,
        period: editPeriod.trim(),
      })
      setUpdateSuccess("Deduction updated successfully.")
      await fetchDeductions({
        page: currentPage,
        limit: 20,
        branchId: tenantId,
        remitted: remittedFilter === "all" ? undefined : remittedFilter === "compliant",
      })
    } catch {
      // handled in hook
    }
  }

  const handleRemitDeduction = async () => {
    if (!selectedDeduction || selectedDeduction.remitted) return
    setRemitSuccess(null)
    setCreateError(null)

    try {
      await remitDeduction(selectedDeduction.id, {
        remittanceDate: remittanceDate || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
      })
      setRemitSuccess("Deduction marked as remitted successfully.")
      await fetchDeductions({
        page: currentPage,
        limit: 20,
        branchId: tenantId,
        remitted: remittedFilter === "all" ? undefined : remittedFilter === "compliant",
      })
    } catch {
      // handled in hook
    }
  }

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
                <p className="text-[13px] text-[#6B7280] mt-1">
                  Consolidated view of liabilities and remittances for FY {complianceDashboard?.fiscalYear ?? new Date().getFullYear()}
                </p>
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
                    <div className="mt-3 text-[11px] font-semibold text-emerald-600">{card.meta}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#EEF1F6]">
                      <div className={`h-1.5 w-3/5 rounded-full ${card.bar}`} />
                    </div>
                  </div>
                )}
              )}
            </div>
            {complianceLoading && (
              <div className="mt-4 text-[12px] font-medium text-[#6B7280]">Loading compliance dashboard...</div>
            )}
            {complianceError && (
              <div className="mt-2 text-[12px] font-medium text-[#EF4444]">{complianceError}</div>
            )}
            {summaryLoading && (
              <div className="mt-2 text-[12px] font-medium text-[#6B7280]">Loading compliance summary...</div>
            )}
            {summaryError && (
              <div className="mt-2 text-[12px] font-medium text-[#EF4444]">{summaryError}</div>
            )}

            <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white shadow-sm">
              <div className="relative z-30 flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <BranchesDropdown label="All Branches" className="text-[11px]" />
                  <button
                    onClick={() => {
                      setRemittedFilter("compliant")
                      setCurrentPage(1)
                    }}
                    className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold ${
                      remittedFilter === "compliant"
                        ? "bg-[#E9EEFF] text-[#3B5BDB]"
                        : "bg-[#F3F5F9] text-[#6B7280]"
                    }`}
                  >
                    Compliant
                  </button>
                  <button
                    onClick={() => {
                      setRemittedFilter("pending")
                      setCurrentPage(1)
                    }}
                    className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold ${
                      remittedFilter === "pending"
                        ? "bg-[#FEE2E2] text-[#B91C1C]"
                        : "bg-[#F3F5F9] text-[#6B7280]"
                    }`}
                  >
                    Overdue/Non-Compliant
                  </button>
                  <button
                    onClick={() => {
                      setRemittedFilter("all")
                      setCurrentPage(1)
                    }}
                    className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold ${
                      remittedFilter === "all"
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "bg-[#F3F5F9] text-[#6B7280]"
                    }`}
                  >
                    All
                  </button>
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
                    {deductionsLoading && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                          Loading compliance records...
                        </td>
                      </tr>
                    )}
                    {!deductionsLoading && listError && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 text-center text-[12px] text-rose-600">
                          {listError}
                        </td>
                      </tr>
                    )}
                    {!deductionsLoading && !listError && rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 text-center text-[12px] text-[#6B7280]">
                          No compliance records available for this period.
                        </td>
                      </tr>
                    )}
                    {!deductionsLoading &&
                      !listError &&
                      rows.map((row) => (
                      <tr key={row.rawId} className="hover:bg-gray-50/50 font-semibold text-[#111827] transition-colors">
                        <td className="px-6 py-5">{row.name}</td>
                        <td className="px-6 py-5 text-[#6B7280]">{row.id}</td>
                        <td className="px-6 py-5">{row.total}</td>
                        <td className={`px-6 py-5 ${row.isOutstanding ? "text-rose-600" : "text-[#6B7280]"}`}>
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
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => {
                              handleSelectDeduction(row.rawId)
                            }}
                            className="rounded border border-[#E5E7EB] px-3 py-1.5 text-[11px] font-semibold text-[#4B5563] hover:bg-gray-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(detailLoading || detailError || selectedDeduction) && (
                <div className="border-t border-[#EEF1F6] px-6 py-4">
                  {detailLoading && (
                    <div className="text-[12px] text-[#6B7280]">Loading deduction details...</div>
                  )}
                  {!detailLoading && detailError && (
                    <div className="text-[12px] text-rose-600">{detailError}</div>
                  )}
                  {!detailLoading && !detailError && selectedDeduction && (
                    <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#4B5563]">
                      <div>
                        <span className="font-semibold text-[#111827]">Selected Deduction:</span>{" "}
                        ID {selectedDeduction.id.slice(0, 8).toUpperCase()} • {selectedDeduction.type.toUpperCase()} •{" "}
                        {selectedDeduction.remitted ? "Remitted" : "Pending"}
                      </div>
                      {!selectedDeduction.remitted && (
                        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end">
                          <label className="flex flex-col gap-1 text-[11px]">
                            <span className="font-semibold text-[#6B7280]">Amount</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 text-[12px]"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px]">
                            <span className="font-semibold text-[#6B7280]">Period</span>
                            <input
                              type="month"
                              value={editPeriod}
                              onChange={(e) => setEditPeriod(e.target.value)}
                              className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 text-[12px]"
                            />
                          </label>
                          <button
                            onClick={handleUpdateDeduction}
                            disabled={updating}
                            className="h-8 rounded-[8px] bg-[#3B5BDB] px-3 text-[11px] font-semibold text-white disabled:opacity-60"
                          >
                            {updating ? "Saving..." : "Update"}
                          </button>
                          <label className="flex flex-col gap-1 text-[11px]">
                            <span className="font-semibold text-[#6B7280]">Remit Date</span>
                            <input
                              type="date"
                              value={remittanceDate}
                              onChange={(e) => setRemittanceDate(e.target.value)}
                              onClick={(e) => e.currentTarget.showPicker?.()}
                              className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 text-[12px]"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px]">
                            <span className="font-semibold text-[#6B7280]">Receipt No.</span>
                            <input
                              type="text"
                              value={receiptNumber}
                              onChange={(e) => setReceiptNumber(e.target.value)}
                              placeholder="Optional"
                              className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 text-[12px]"
                            />
                          </label>
                          <button
                            onClick={handleRemitDeduction}
                            disabled={remitting}
                            className="h-8 rounded-[8px] bg-emerald-600 px-3 text-[11px] font-semibold text-white disabled:opacity-60"
                          >
                            {remitting ? "Remitting..." : "Mark Remitted"}
                          </button>
                        </div>
                      )}
                      {selectedDeduction.remitted && (
                        <div className="mt-2 text-[11px] text-amber-700">
                          This deduction is remitted and cannot be edited.
                        </div>
                      )}
                      {updateSuccess && (
                        <div className="mt-2 text-[11px] text-emerald-600">{updateSuccess}</div>
                      )}
                      {remitSuccess && (
                        <div className="mt-2 text-[11px] text-emerald-600">{remitSuccess}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#EEF1F6] p-4 px-6">
                <span className="text-[13px] font-medium text-[#6B7280]">
                  Showing <span className="text-[#111827] font-bold">{rows.length ? `${(currentPage - 1) * (pagination?.limit ?? 20) + 1}-${(currentPage - 1) * (pagination?.limit ?? 20) + rows.length}` : 0}</span> of <span className="font-bold text-[#111827]">{pagination?.total ?? rows.length}</span> records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="rounded px-4 py-2 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => (pagination && prev < pagination.pages ? prev + 1 : prev))}
                    disabled={!pagination || currentPage >= pagination.pages}
                    className="rounded px-4 py-2 text-[12px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


