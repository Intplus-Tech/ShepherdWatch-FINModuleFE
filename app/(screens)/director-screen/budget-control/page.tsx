"use client"

import { API_V1 } from "@/lib/api";

import { Fragment, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { useBudgetControlDashboard } from "@/components/hooks/useBudgetControlDashboard"
import { useBudgetApproval } from "@/components/hooks/useBudgetApproval"
import { useAuth } from "@/components/auth/AuthProvider"

const bigText = "text-[14.36px] leading-[22.33px] font-bold"
const smallText = "text-[11.17px] leading-[15.95px] font-semibold"

export default function Page() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: controlData, loading, error } = useBudgetControlDashboard()
  const { approving, approveError, processApprovalAction } = useBudgetApproval()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<{ processed: number; total: number; failed: number } | null>(null)
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null)
  const [rowActioningId, setRowActioningId] = useState<string | null>(null)

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

  const totals = useMemo(() => {
    return {
      totalBudget: Number(controlData.kpis.totalAllocated ?? 0),
      appropriated: Number(controlData.kpis.totalCommitted ?? 0),
      remaining: Number(controlData.kpis.totalAvailable ?? 0),
      utilizedRate: Number(controlData.kpis.utilizationRate ?? 0),
      spent: Number(controlData.kpis.totalSpent ?? 0),
    }
  }, [controlData])

  const branches = useMemo(
    () => controlData.items.map((item, index) => {
        const id = String(item.id ?? `item-${index}`)
        const name = item.name ?? `Budget Item ${index + 1}`
        const allocated = Number(item.allocated ?? 0)
        const spent = Number(item.spent ?? 0)
        const utilization = Number(item.usagePercent ?? 0)
        const approved = String(item.status ?? "").toUpperCase() === "APPROVED"

        return {
          id,
          code: name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "BE",
          name,
          lastYear: formatCurrency(spent),
          proposed: formatCurrency(allocated),
          variance: `${utilization.toFixed(1)}%`,
          status: approved ? "Approved" : "Submitted",
          selected: selectedIds.has(id),
          expanded: false,
        }
      }),
    [controlData.items, selectedIds]
  )

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const runBatch = async (
    budgetIds: string[],
    status: "approved" | "rejected",
    label: string,
  ) => {
    if (budgetIds.length === 0) return
    setBatchSuccess(null)
    setBatchProgress({ processed: 0, total: budgetIds.length, failed: 0 })
    let failed = 0
    for (let i = 0; i < budgetIds.length; i++) {
      const ok = await processApprovalAction(budgetIds[i], status)
      if (!ok) failed++
      setBatchProgress({ processed: i + 1, total: budgetIds.length, failed })
    }
    const succeeded = budgetIds.length - failed
    if (failed === 0) {
      setBatchSuccess(`${label}: ${succeeded} of ${budgetIds.length} budget(s) processed successfully.`)
    } else {
      setBatchSuccess(`${label}: ${succeeded} succeeded, ${failed} failed.`)
    }
    setSelectedIds(new Set())
  }

  const approveAllBudgets = async () => {
    const budgetIds = controlData.items
      .map((item) => String(item.id ?? ""))
      .filter(Boolean)
    await runBatch(budgetIds, "approved", "Approve All")
  }

  const approveSelectedBudgets = async () => {
    await runBatch(Array.from(selectedIds), "approved", "Approve Selected")
  }

  const rejectSelectedBudgets = async () => {
    await runBatch(Array.from(selectedIds), "rejected", "Reject Selected")
  }

  const handleRowAction = async (id: string, status: "approved" | "rejected") => {
    if (!id) return
    setRowActioningId(id)
    setBatchSuccess(null)
    const ok = await processApprovalAction(id, status)
    if (ok) {
      setBatchSuccess(`Budget ${status === "approved" ? "approved" : "rejected"} successfully.`)
    }
    setRowActioningId(null)
  }

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

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" /> {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>

          <button 
            onClick={() => router.push("/director-screen/budgeting")}
            className={`mt-6 flex items-center gap-2 ${smallText} text-[#6B7280] hover:text-[#111827] transition-colors`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`${bigText} text-[#111827]`}>Budget Control</h2>
              <p className={`text-[#9CA3AF] ${smallText}`}>
                Review, adjust, and approve proposed annual budgets from regional branches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#4B5563] shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <Download className="h-4 w-4 text-[#6B7280]" /> {exporting ? "Exporting..." : "Export Report"}
              </button>

              <button
                onClick={approveAllBudgets}
                disabled={approving || branches.length === 0}
                className={`flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 ${smallText} text-white shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <Check className="h-4 w-4" /> {approving ? "Approving..." : "Approve All Pending"}
              </button>
            </div>
          </div>
          {approveError && (
            <div className="mt-3 text-[12px] font-semibold text-rose-500">
              {approveError}
            </div>
          )}
          {exportError && (
            <div className="mt-3 text-[12px] font-semibold text-rose-500">
              {exportError}
            </div>
          )}
          {batchSuccess && (
            <div className="mt-3 text-[12px] font-semibold text-emerald-600">
              {batchSuccess}
            </div>
          )}
          {batchProgress && batchProgress.processed < batchProgress.total && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#4B5563] mb-1">
                <span>Processing batch...</span>
                <span>
                  {batchProgress.processed} of {batchProgress.total}
                  {batchProgress.failed > 0 ? ` (${batchProgress.failed} failed)` : ""}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#EEF1F6]">
                <div
                  className="h-2 rounded-full bg-[#3B5BDB] transition-all"
                  style={{ width: `${(batchProgress.processed / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className={`text-[#9CA3AF] ${smallText}`}>Total Church Budget</div>

              <div className={`mt-2 ${bigText} text-[#111827]`}>{formatCurrency(totals.totalBudget)}</div>

              <div className={`mt-2 ${smallText} text-emerald-600`}>{controlData.fiscalYear} Fiscal Year</div>
            </div>

            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-[#9CA3AF] ${smallText}`}>Appropriation Progress</div>
                  <div className={`mt-1 ${bigText} text-[#111827]`}>{formatCurrency(totals.appropriated)}</div>
                  <div className={`text-[#9CA3AF] ${smallText}`}>{formatCurrency(totals.totalBudget)} Allocated</div>
                </div>

                <div className={`text-[#3B5BDB] ${bigText}`}>{totals.utilizedRate.toFixed(0)}%</div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-[#EEF1F6]">
                <div className="h-2 rounded-full bg-[#3B5BDB]" style={{ width: `${Math.min(100, Math.max(0, totals.utilizedRate))}%` }} />
              </div>

              <div className={`mt-2 flex items-center justify-between text-[#9CA3AF] ${smallText}`}>
                <span>{controlData.budgetCount} Budgets in Scope</span>
                <span>{formatCurrency(totals.remaining)} Remaining</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] text-[#6B7280] w-full lg:w-[300px]">
              <Search className="h-4 w-4" /> Search by branch name...
            </div>

            <div className="flex items-center gap-2">
              <button className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#6B7280]`}>
                All Regions
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <button className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#6B7280]`}>
                Status: All
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left"></th>
                    <th className="py-3 px-4 text-left">BRANCH</th>
                    <th className="py-3 px-4 text-left">LAST YEAR (ACTUAL)</th>
                    <th className="py-3 px-4 text-left">{`PROPOSED (${controlData.fiscalYear || new Date().getFullYear()})`}</th>
                    <th className="py-3 px-4 text-left">VARIANCE</th>
                    <th className="py-3 px-4 text-left">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-[#6B7280]">
                        Loading budget control dashboard...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-rose-500">
                        {error}
                      </td>
                    </tr>
                  ) : branches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-[#6B7280]">
                        No budget control records available for this period.
                      </td>
                    </tr>
                  ) : (
                    branches.map((branch) => (
                    <Fragment key={branch.id}>
                      <tr className="border-t border-[#EEF1F6]">
                        <td className="py-3 px-4">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              setSelectedIds((prev) => {
                                const next = new Set(prev)
                                if (next.has(branch.id)) {
                                  next.delete(branch.id)
                                } else {
                                  next.add(branch.id)
                                }
                                return next
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setSelectedIds((prev) => {
                                  const next = new Set(prev)
                                  if (next.has(branch.id)) {
                                    next.delete(branch.id)
                                  } else {
                                    next.add(branch.id)
                                  }
                                  return next
                                })
                              }
                            }}
                            className="h-4 w-4 rounded border border-[#E5E7EB] flex items-center justify-center cursor-pointer"
                          >
                            {branch.selected && (
                              <Check className="h-3 w-3 text-[#3B5BDB]" />
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-[#9CA3AF]" />

                            <div className="h-6 w-6 rounded-full bg-[#E9EEFF] flex items-center justify-center text-[10px] text-[#3B5BDB] font-semibold">
                              {branch.code}
                            </div>

                            <div className="text-[#111827]">
                              {branch.name}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#6B7280]">
                          {branch.lastYear}
                        </td>

                        <td className="py-3 px-4 text-[#111827] font-semibold">
                          {branch.proposed}
                        </td>

                        <td
                          className={`py-3 px-4 ${
                            branch.variance.startsWith("-")
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {branch.variance}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] ${
                              branch.status === "Approved"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {branch.status === "Approved" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {branch.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right text-[#9CA3AF]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRowAction(branch.id, "rejected")}
                              disabled={approving || rowActioningId === branch.id}
                              aria-label={`Reject ${branch.name}`}
                              className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRowAction(branch.id, "approved")}
                              disabled={approving || rowActioningId === branch.id}
                              aria-label={`Approve ${branch.name}`}
                              className="rounded p-1 text-[#3B5BDB] hover:bg-[#E9EEFF] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {branch.expanded && (
                        <tr className="border-t border-[#EEF1F6] bg-[#FBFCFF]">
                          <td className="py-3 px-4" />

                          <td className={`py-3 px-4 text-[#9CA3AF] ${smallText}`}>
                            SUGGESTED ALLOCATION BREAKDOWN
                          </td>

                          <td colSpan={5} className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {[
                                { label: "Operational", value: "" },
                                { label: "Capital", value: "" },
                                { label: "Program", value: "" },
                                { label: "Monthly Cashflow", value: "" },
                              ].map((item) => (
                                <div key={item.label} className="rounded-[10px] border border-[#EEF1F6] bg-white p-2">
                                  <div className={`text-[#9CA3AF] ${smallText}`}>{item.label}</div>

                                  {item.value ? (
                                    <div className={`mt-1 ${bigText} text-[#111827]`}>{item.value}</div>
                                  ) : (
                                    <div className="mt-2 h-8 rounded bg-[#E9EEFF]" />
                                  )}

                                  <div className="mt-2 h-1 rounded-full bg-[#EEF1F6]">
                                    <div className="h-1 w-3/5 rounded-full bg-[#3B5BDB]" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={`flex items-center justify-between px-4 py-3 text-[#9CA3AF] ${smallText}`}>
              <div>
                Showing {branches.length ? `1-${branches.length}` : 0} of {branches.length} branches
              </div>

              <div className="flex items-center gap-2">
                <button className={`rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280] ${smallText}`}>
                  Previous
                </button>

                <button className={`rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280] ${smallText}`}>
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className={`flex items-center gap-4 rounded-full bg-[#111827] px-4 py-2 text-white ${smallText}`}>
              <span>{selectedCount} Items Selected</span>

              <button
                type="button"
                onClick={rejectSelectedBudgets}
                disabled={approving || selectedIds.size === 0}
                className="text-[#9CA3AF] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? "Working..." : "Reject"}
              </button>

              <button
                onClick={approveSelectedBudgets}
                disabled={approving || selectedIds.size === 0}
                className="rounded-full bg-[#3B5BDB] px-3 py-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {approving ? "Approving..." : "Approve Selected"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



