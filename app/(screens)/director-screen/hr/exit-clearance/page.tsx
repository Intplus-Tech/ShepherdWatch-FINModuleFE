"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, Check, Download, Loader2, Search } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useDirectorAdjustClearance,
  useExitClearances,
} from "@/components/hooks/hr/useHrExitClearance"
import {
  CLEARANCE_STATUS_BADGES,
  CLEARANCE_STATUS_LABELS,
  CLEARANCE_STEP_LABELS,
  badgeFor,
  branchName,
  deref,
  employeeName,
  lookup,
} from "@/lib/hr/normalize"
import { CLEARANCE_STATUSES, type ClearanceStatus, type ExitClearance } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency, formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const ALL_BRANCHES = "All Branches"

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-[#4B5563]">{label}</span>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full",
          done ? "bg-emerald-100 text-emerald-600" : "bg-[#F3F4F6] text-[#9CA3AF]",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </div>
  )
}

function Page() {
  const searchParams = useSearchParams()
  const preselectedEmployee = searchParams.get("employeeId")

  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES)
  const [statusFilter, setStatusFilter] = useState<"all" | ClearanceStatus>("in_progress")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [deductLoan, setDeductLoan] = useState(true)
  const [note, setNote] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const clearances = useExitClearances({ page, limit: PAGE_SIZE, status: statusFilter })
  const adjust = useDirectorAdjustClearance()

  const items = useMemo(() => clearances.data?.items ?? [], [clearances.data])

  const branchOptions = useMemo(
    () => [ALL_BRANCHES, ...Array.from(new Set(items.map((c) => branchName(c.branchId))))],
    [items],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((clearance) => {
      if (branchFilter !== ALL_BRANCHES && branchName(clearance.branchId) !== branchFilter) {
        return false
      }
      if (query && !employeeName(clearance.employeeId).toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [items, branchFilter, search])

  /** Honour a preselected employee arriving from the directory or a profile. */
  const selected: ExitClearance | null = useMemo(() => {
    if (selectedId) return filtered.find((c) => c._id === selectedId) ?? null
    if (preselectedEmployee) {
      const match = filtered.find((c) => deref(c.employeeId)?._id === preselectedEmployee)
      if (match) return match
    }
    return filtered[0] ?? null
  }, [filtered, selectedId, preselectedEmployee])

  const settlement = selected?.financeSettlement

  /**
   * Seed the adjustment fields from the finance sign-off. Adjusted during
   * render (keyed on the clearance) rather than in an effect, so switching rows
   * never shows the previous row's figures.
   */
  const [seededFor, setSeededFor] = useState<string | null>(null)
  if (selected && seededFor !== selected._id) {
    setSeededFor(selected._id)
    setDeductLoan(settlement?.loanDeductionApproved ?? true)
    setNote(settlement?.note ?? "")
    setActionError(null)
  }

  const employee = deref(selected?.employeeId)
  const salary = employee?.salary ?? 0
  const loanBalanceValue = settlement?.outstandingLoanBalance ?? 0
  const assetsCost = settlement?.unreturnedAssetsCost ?? 0
  const netFinalPay = salary - (deductLoan ? loanBalanceValue : 0) - assetsCost

  async function handleApprove() {
    if (!selected) return
    setActionError(null)
    try {
      await adjust.mutateAsync({
        id: selected._id,
        loanDeductionApproved: deductLoan,
        netFinalPay,
        note: note.trim() || undefined,
      })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((clearance) => ({
        Employee: employeeName(clearance.employeeId),
        Branch: branchName(clearance.branchId),
        "Exit Date": formatDate(clearance.lastWorkingDate, "iso"),
        Reason: clearance.reason,
        Status: lookup(CLEARANCE_STATUS_LABELS, clearance.status),
        "Outstanding Loan": clearance.financeSettlement?.outstandingLoanBalance ?? 0,
        "Net Final Pay": clearance.financeSettlement?.netFinalPay ?? 0,
      })),
    )
    downloadCsv(`exit-clearances-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/exit-clearance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] font-bold text-[#111827]">Exit Clearance</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Final settlement adjustments across all branches
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by employee..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | ClearanceStatus)
                    setPage(1)
                    setSelectedId(null)
                  }}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] lg:w-[220px]"
                >
                  <option value="all">All Statuses</option>
                  {CLEARANCE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CLEARANCE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Table */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {["Employee", "Branch", "Exit Date", "Outstanding", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    <HrTableState
                      colSpan={5}
                      isLoading={clearances.isLoading}
                      error={clearances.error}
                      isEmpty={filtered.length === 0}
                      emptyTitle="No exit clearances"
                      emptyDescription="Separations started by branches appear here."
                      onRetry={() => clearances.refetch()}
                    />

                    {!clearances.isLoading &&
                      !clearances.error &&
                      filtered.map((clearance) => {
                        const outstanding =
                          clearance.financeSettlement?.outstandingLoanBalance ?? 0
                        return (
                          <tr
                            key={clearance._id}
                            onClick={() => setSelectedId(clearance._id)}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-[#F8FAFC]",
                              selected?._id === clearance._id &&
                                "border-l-2 border-[#111827] bg-[#F8FAFC]",
                            )}
                          >
                            <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                              {employeeName(clearance.employeeId)}
                            </td>
                            <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                              {branchName(clearance.branchId)}
                            </td>
                            <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                              {formatDate(clearance.lastWorkingDate, "medium")}
                            </td>
                            <td
                              className={cn(
                                "px-4 py-4 text-[13px] font-semibold",
                                outstanding > 0 ? "text-rose-600" : "text-[#9CA3AF]",
                              )}
                            >
                              {formatCurrency(outstanding, { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-4 text-[13px]">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                  badgeFor(CLEARANCE_STATUS_BADGES, clearance.status),
                                )}
                              >
                                {lookup(CLEARANCE_STATUS_LABELS, clearance.status)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              <HrPagination
                pagination={clearances.data?.pagination}
                page={page}
                onPageChange={setPage}
                itemCount={items.length}
                noun="clearances"
              />
            </div>

            {/* Detail panel */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-1">
              <div className="border-b border-[#EEF1F6] p-5">
                <h2 className="text-[16px] font-bold text-[#111827]">Settlement Review</h2>
              </div>

              {!selected ? (
                <div className="p-12 text-center text-[13px] text-[#6B7280]">
                  {clearances.isLoading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Select a clearance to review its settlement."
                  )}
                </div>
              ) : (
                <div className="p-5">
                  {loanBalanceValue > 0 && (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                            Outstanding Balance
                          </div>
                          <div className="mt-1 text-[14px] font-bold text-[#111827]">
                            {formatCurrency(loanBalanceValue)} in unpaid loans
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#111827]">
                    <input
                      type="checkbox"
                      checked={deductLoan}
                      onChange={(e) => setDeductLoan(e.target.checked)}
                      disabled={adjust.isPending}
                      className="h-4 w-4 rounded border-[#D1D5DB] accent-[#3B5BDB]"
                    />
                    Recover loan from final pay
                  </label>

                  {/* Computation box */}
                  <div className="mt-4 rounded-lg bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Salary (Before)
                      </span>
                      <span className="text-[13px] font-semibold text-[#111827]">
                        {formatCurrency(salary)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Loan Deduction
                      </span>
                      <span className="text-[13px] font-semibold text-rose-600">
                        {deductLoan ? `-${formatCurrency(loanBalanceValue)}` : "Waived"}
                      </span>
                    </div>
                    {assetsCost > 0 && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                          Unreturned Assets
                        </span>
                        <span className="text-[13px] font-semibold text-rose-600">
                          -{formatCurrency(assetsCost)}
                        </span>
                      </div>
                    )}
                    <div className="my-3 border-t border-[#E5E7EB]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#111827]">Net Final Pay</span>
                      <span className="text-[15px] font-bold text-emerald-600">
                        {formatCurrency(netFinalPay)}
                      </span>
                    </div>
                  </div>

                  {/* Progress checklist */}
                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Progress Checklist
                    </div>
                    <div className="mt-2 divide-y divide-[#EEF1F6]">
                      {selected.steps?.map((step) => (
                        <ChecklistRow
                          key={step.step}
                          label={lookup(CLEARANCE_STEP_LABELS, step.step)}
                          done={step.status === "completed"}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Adjustment Note
                    </label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={adjust.isPending}
                      placeholder="Record the reasoning for this adjustment…"
                      className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#3B5BDB]"
                    />
                  </div>

                  {actionError && (
                    <p className="mt-3 text-[12px] font-medium text-red-600">{actionError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={adjust.isPending}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-60"
                  >
                    {adjust.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    APPROVE ADJUSTMENT &amp; MOVE FORWARD
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default withSuspense(Page)
