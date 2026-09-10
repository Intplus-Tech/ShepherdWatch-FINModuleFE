"use client"

import { useMemo, useState } from "react"
import { Search, Bell, Info, Loader2 } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useExitClearances,
  useFinanceSignOffClearance,
} from "@/components/hooks/hr/useHrExitClearance"
import {
  CLEARANCE_STATUS_BADGES,
  CLEARANCE_STATUS_LABELS,
  badgeFor,
  deref,
  employeeName,
  initials,
  lookup,
} from "@/lib/hr/normalize"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const AVATAR_TINTS = [
  "bg-[#EEF2FF] text-[#3B5BDB]",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-violet-50 text-violet-600",
]

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loanBalanceInput, setLoanBalanceInput] = useState("")
  const [assetCostInput, setAssetCostInput] = useState("")
  const [deductLoan, setDeductLoan] = useState(true)
  const [note, setNote] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  /** Finance acts on clearances that are still moving through the workflow. */
  const clearances = useExitClearances({ status: "in_progress", limit: 50 })
  const signOff = useFinanceSignOffClearance()

  const items = useMemo(() => clearances.data?.items ?? [], [clearances.data])
  const selected = useMemo(
    () => items.find((item) => item._id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  )

  /**
   * Seed the settlement fields from whatever the backend computed at
   * initiation. Adjusted during render (keyed on the clearance) rather than in
   * an effect, so switching rows never shows the previous row's figures.
   */
  const [seededFor, setSeededFor] = useState<string | null>(null)
  if (selected && seededFor !== selected._id) {
    const settlement = selected.financeSettlement
    setSeededFor(selected._id)
    setLoanBalanceInput(String(settlement?.outstandingLoanBalance ?? 0))
    setAssetCostInput(String(settlement?.unreturnedAssetsCost ?? 0))
    setDeductLoan(settlement?.loanDeductionApproved ?? true)
    setNote(settlement?.note ?? "")
    setFormError(null)
  }

  const employee = deref(selected?.employeeId)
  const financeStep = selected?.steps?.find((step) => step.step === "finance")
  const alreadySigned = financeStep?.status === "completed"

  const loanBalanceValue = Number(loanBalanceInput.replace(/[^0-9.-]/g, "")) || 0
  const assetCostValue = Number(assetCostInput.replace(/[^0-9.-]/g, "")) || 0
  const salary = employee?.salary ?? 0

  /** Net final pay = salary less whatever finance decides to recover. */
  const netFinalPay = salary - (deductLoan ? loanBalanceValue : 0) - assetCostValue

  async function handleApprove() {
    if (!selected) return
    setFormError(null)

    try {
      await signOff.mutateAsync({
        id: selected._id,
        outstandingLoanBalance: loanBalanceValue,
        unreturnedAssetsCost: assetCostValue,
        loanDeductionApproved: deductLoan,
        netFinalPay,
        note: note.trim() || undefined,
      })
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/exit-clearance" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* LEFT: Pending Clearances */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="border-b border-[#EEF1F6] p-5">
              <h2 className="text-[16px] font-bold text-[#111827]">Pending Clearances</h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                {clearances.isLoading
                  ? "Loading…"
                  : `${items.length} personnel awaiting financial sign-off`}
              </p>
            </div>

            {clearances.isLoading || clearances.error || items.length === 0 ? (
              <HrPanelState
                isLoading={clearances.isLoading}
                error={clearances.error}
                isEmpty={items.length === 0}
                emptyTitle="Nothing pending"
                emptyDescription="Clearances awaiting finance appear here."
                onRetry={() => clearances.refetch()}
                className="border-0 p-6"
              />
            ) : (
              <div className="p-3">
                {items.map((clearance, index) => {
                  const isSelected = clearance._id === selected?._id
                  const name = employeeName(clearance.employeeId)
                  const staff = deref(clearance.employeeId)
                  return (
                    <button
                      key={clearance._id}
                      type="button"
                      onClick={() => setSelectedId(clearance._id)}
                      className={cn(
                        "mb-2 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors last:mb-0",
                        isSelected ? "bg-[#EEF2FF]" : "hover:bg-[#F8FAFC]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                          AVATAR_TINTS[index % AVATAR_TINTS.length],
                        )}
                      >
                        {initials(name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-bold text-[#111827]">{name}</div>
                        <div className="text-[12px] text-[#6B7280]">
                          {staff?.jobTitle ?? "—"}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(CLEARANCE_STATUS_BADGES, clearance.status),
                            )}
                          >
                            {lookup(CLEARANCE_STATUS_LABELS, clearance.status)}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-[#9CA3AF]">
                          Exit: {formatDate(clearance.lastWorkingDate, "medium")}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Detail */}
          {!selected ? (
            <HrPanelState
              isLoading={clearances.isLoading}
              error={null}
              isEmpty={!clearances.isLoading}
              emptyTitle="No clearance selected"
              emptyDescription="Pick a pending clearance to review its settlement."
            />
          ) : (
            <div className="flex flex-col gap-5">
              {/* Profile card */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
                <div className="flex items-center gap-5">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[26px] font-bold text-[#3B5BDB]">
                    {initials(employeeName(selected.employeeId))}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-[32px] font-bold text-[#111827] leading-tight">
                      {employeeName(selected.employeeId)}
                    </h1>
                    <p className="mt-1 text-[14px] text-[#6B7280]">
                      {employee?.jobTitle ?? "—"}
                      {employee?.department ? ` | ${employee.department}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                        Exit Date: {formatDate(selected.lastWorkingDate, "medium")}
                      </span>
                      <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                        ID: {employee?.employeeId ?? "—"}
                      </span>
                      <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                        Reason: {selected.reason}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* LEFT: Outstanding liabilities */}
                <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Outstanding Liabilities
                  </h3>

                  <div className="mt-4">
                    <label className="text-[12px] font-semibold text-[#6B7280]">
                      Loan Balance
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                        ₦
                      </span>
                      <input
                        value={loanBalanceInput}
                        onChange={(e) => setLoanBalanceInput(e.target.value)}
                        inputMode="decimal"
                        disabled={alreadySigned || signOff.isPending}
                        className="h-[42px] w-full rounded-lg border border-rose-100 bg-rose-50 pl-7 pr-3 text-[15px] font-bold text-rose-600 outline-none focus:border-rose-300 disabled:opacity-70"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[12px] font-semibold text-[#6B7280]">
                      Unreturned Assets (cost)
                    </label>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                        ₦
                      </span>
                      <input
                        value={assetCostInput}
                        onChange={(e) => setAssetCostInput(e.target.value)}
                        inputMode="decimal"
                        disabled={alreadySigned || signOff.isPending}
                        className="h-[42px] w-full rounded-lg border border-rose-100 bg-rose-50 pl-7 pr-3 text-[15px] font-bold text-rose-600 outline-none focus:border-rose-300 disabled:opacity-70"
                      />
                    </div>
                    {(selected.adminChecklist?.filter((item) => !item.isReturned).length ?? 0) >
                      0 && (
                      <p className="mt-2 text-[12px] text-amber-600">
                        {selected.adminChecklist?.filter((item) => !item.isReturned).length} item(s)
                        still outstanding on the admin checklist.
                      </p>
                    )}
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-[13px] font-medium text-[#111827]">
                    <input
                      type="checkbox"
                      checked={deductLoan}
                      onChange={(e) => setDeductLoan(e.target.checked)}
                      disabled={alreadySigned || signOff.isPending}
                      className="h-4 w-4 rounded border-[#D1D5DB] accent-[#3B5BDB]"
                    />
                    Deduct loan balance from final pay
                  </label>

                  <div className="mt-4 rounded-lg bg-[#111827] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Net Final Pay
                    </div>
                    <div className="mt-1 text-[22px] font-bold text-white">
                      {formatCurrency(netFinalPay)}
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">
                      Based on a recorded salary of {formatCurrency(salary)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EEF2FF] p-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5BDB]" />
                    <p className="text-[12px] italic text-[#4B5563]">
                      Sign-off is restricted until asset recovery is confirmed by the IT and Asset
                      Management departments.
                    </p>
                  </div>
                </div>

                {/* RIGHT: Decision note */}
                <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                  <h3 className="text-[16px] font-bold text-[#111827]">
                    Add Decision Note / Reason for Hold
                  </h3>
                  <textarea
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={alreadySigned || signOff.isPending}
                    placeholder="Enter reason for hold or additional clearance notes..."
                    className="mt-4 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[13px] outline-none disabled:opacity-70"
                  />

                  {formError && (
                    <p className="mt-3 text-[12px] font-medium text-red-600">{formError}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[12px] text-[#9CA3AF]">
                      {alreadySigned
                        ? `Finance cleared ${
                            financeStep?.timestamp
                              ? formatDate(financeStep.timestamp, "medium")
                              : ""
                          }`
                        : "This records the finance step on the clearance."}
                    </span>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={alreadySigned || signOff.isPending}
                      className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                    >
                      {signOff.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {alreadySigned ? "Cleared" : "Approve Clearance"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
