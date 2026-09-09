"use client"

import { useEffect, useMemo, useState } from "react"
import { HrTableStateRow } from "@/components/hr/HrTableState"
import { useToast } from "@/components/ui/toast"
import {
  useHrExitClearances,
  useHrExitClearanceMetrics,
  useExitClearanceMutations,
} from "@/components/hooks/useHrExitClearances"
import {
  CLEARANCE_STATUS_LABELS,
  formatDate,
  formatNaira,
  statusLabel,
} from "@/lib/hr/display"
import {
  Search,
  UserPlus,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "pending_pastor", label: "Pending Pastor" },
  { value: "pending_finance", label: "Pending Finance" },
  { value: "pending_admin", label: "Pending Admin" },
  { value: "completed", label: "Completed" },
  { value: "", label: "All Statuses" },
]

function StatusText({ status }: { status: string }) {
  const isBlocked = status === "pending_finance" || status === "cancelled"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-semibold",
        isBlocked ? "text-rose-600" : status === "completed" ? "text-emerald-600" : "text-amber-600"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isBlocked ? "bg-rose-500" : status === "completed" ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      {statusLabel(CLEARANCE_STATUS_LABELS, status)}
    </span>
  )
}

function ChecklistRow({
  label,
  status,
  variant,
}: {
  label: string
  status: string
  variant: "complete" | "stuck" | "locked"
}) {
  const Icon =
    variant === "complete"
      ? CheckCircle2
      : variant === "stuck"
      ? AlertCircle
      : Lock
  const iconColor =
    variant === "complete"
      ? "text-emerald-500"
      : variant === "stuck"
      ? "text-rose-500"
      : "text-[#9CA3AF]"
  const textColor =
    variant === "complete"
      ? "text-emerald-600"
      : variant === "stuck"
      ? "text-rose-600"
      : "text-[#9CA3AF]"

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={cn("h-4.5 w-4.5", iconColor)} />
        <span className="text-[13px] font-medium text-[#111827]">{label}</span>
      </div>
      <span className={cn("text-[12px] font-semibold", textColor)}>
        {status}
      </span>
    </div>
  )
}

export default function Page() {
  const [branch, setBranch] = useState<string>("")
  const [status, setStatus] = useState<string>("pending_pastor")
  const [selectedId, setSelectedId] = useState<string>("")
  const [adjusting, setAdjusting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { pushToast } = useToast()
  const { clearances, loading, error, refresh } = useHrExitClearances({
    status,
    branchId: branch || undefined,
    limit: 50,
  })
  const { metrics } = useHrExitClearanceMetrics()
  const { directorAdjustment } = useExitClearanceMutations()

  const filtered = clearances

  const selected = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  )

  useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const branchOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const row of clearances) {
      if (row.branchId && !seen.has(row.branchId)) seen.set(row.branchId, row.branchName)
    }
    return Array.from(seen.entries())
  }, [clearances])

  // The settlement finance proposed; the director can wave the loan recovery.
  const finance = selected?.financeSignOff
  const loanBalance = finance?.outstandingLoanBalance ?? 0
  const netFinalPay = finance?.netFinalPay ?? 0
  const payBeforeDeduction = netFinalPay + (finance?.loanDeductionApproved ? loanBalance : 0)

  const checklist = useMemo(() => {
    if (!selected) return []
    return [
      {
        label: "Admin Step",
        status: selected.adminSignOff.isCompleted ? "Complete" : "Pending",
        variant: (selected.adminSignOff.isCompleted ? "complete" : "stuck") as
          | "complete"
          | "stuck"
          | "locked",
      },
      {
        label: "Finance Step",
        status: selected.financeSignOff.isCompleted ? "Complete" : "Pending",
        variant: (selected.financeSignOff.isCompleted ? "complete" : "stuck") as
          | "complete"
          | "stuck"
          | "locked",
      },
      {
        label: "Pastor Final Step",
        status: selected.pastorRelease.isCompleted
          ? "Complete"
          : selected.status === "pending_pastor"
            ? "Pending"
            : "LOCKED",
        variant: (selected.pastorRelease.isCompleted
          ? "complete"
          : selected.status === "pending_pastor"
            ? "stuck"
            : "locked") as "complete" | "stuck" | "locked",
      },
    ]
  }, [selected])

  const handleAdjustment = async () => {
    setFormError(null)
    if (!selected) {
      setFormError("Select a clearance to adjust.")
      return
    }

    setAdjusting(true)
    try {
      await directorAdjustment(selected.id, {
        loanDeductionApproved: true,
        netFinalPay,
        note: "Severance adjustment approved at director review.",
      })
      pushToast("Severance adjustment approved", "success")
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to approve the adjustment.")
    } finally {
      setAdjusting(false)
    }
  }

  const clearFilters = () => {
    setBranch("")
    setStatus("pending_pastor")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/exit-clearance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header + action bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827]">
                Exit Clearance
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                View and track exit clearance across all branches
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[220px]"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters card */}
          <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                  >
                    <option value="">All Branches</option>
                    {branchOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name || "Unnamed branch"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="self-start text-[13px] font-semibold text-[#3B5BDB] hover:underline md:self-auto"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Exit Clearances table */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] p-5">
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    Exit Clearances
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold text-[#3B5BDB]">
                    3 Flagged Cases
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Branch
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Step
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {filtered.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedId(c.id)}
                          className={cn(
                            "cursor-pointer transition-colors",
                            c.id === selected?.id ? "bg-[#EEF2FF]" : "hover:bg-[#F8FAFC]"
                          )}
                        >
                          <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                            {c.employeeName || "Unnamed staff"}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {c.branchName || "—"}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatDate(c.lastWorkingDate)}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {statusLabel(CLEARANCE_STATUS_LABELS, c.status)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <StatusText status={c.status} />
                          </td>
                        </tr>
                      ))}
                      <HrTableStateRow
                        colSpan={5}
                        loading={loading}
                        error={error}
                        isEmpty={filtered.length === 0}
                        emptyMessage="No clearances match your filters."
                        onRetry={refresh}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT: Detailed View panel */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] p-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#111827]">
                      Detailed View
                    </h2>
                    <p className="text-[13px] text-[#6B7280] mt-1">
                      Selected: {selected?.employeeName || "none"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close detailed view"
                    onClick={() => setSelectedId("")}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  {/* Warning box */}
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                          Reason for Delay
                        </div>
                        <div className="mt-1 text-[14px] font-bold text-[#111827]">
                          {loanBalance > 0
                            ? "Outstanding Loan Detected"
                            : selected?.status === "pending_finance"
                              ? "Awaiting Finance Settlement"
                              : "No Outstanding Liabilities"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan balance */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">
                      Loan Balance
                    </span>
                    <span className="text-[14px] font-bold text-rose-600">
                      {formatNaira(loanBalance)}
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] text-[#4B5563]">
                    Recommended Action:{" "}
                    <span className="font-bold text-[#111827]">
                      Recover loan from final pay
                    </span>
                  </p>

                  {/* Computation box */}
                  <div className="mt-4 rounded-lg bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Final Pay (Before)
                      </span>
                      <span className="text-[13px] font-semibold text-[#111827]">
                        {formatNaira(payBeforeDeduction)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Loan Deduction
                      </span>
                      <span className="text-[13px] font-semibold text-rose-600">
                        -{formatNaira(finance?.loanDeductionApproved ? loanBalance : 0)}
                      </span>
                    </div>
                    <div className="my-3 border-t border-[#E5E7EB]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#111827]">
                        Net Final Pay
                      </span>
                      <span className="text-[15px] font-bold text-emerald-600">
                        {formatNaira(netFinalPay)}
                      </span>
                    </div>
                  </div>

                  {/* Progress checklist */}
                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Progress Checklist
                    </div>
                    <div className="mt-2 divide-y divide-[#EEF1F6]">
                      {checklist.map((item) => (
                        <ChecklistRow
                          key={item.label}
                          label={item.label}
                          status={item.status}
                          variant={item.variant}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer button */}
                  {formError ? (
                    <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleAdjustment}
                    disabled={adjusting || !selected || !finance?.isCompleted}
                    title={
                      finance?.isCompleted
                        ? undefined
                        : "Finance has to settle the account before it can be adjusted."
                    }
                    className="mt-5 w-full rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {adjusting ? "APPROVING…" : "APPROVE ADJUSTMENT & MOVE FORWARD"}
                  </button>

                  <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">
                    {metrics.inProgressCount} clearance
                    {metrics.inProgressCount === 1 ? "" : "s"} in progress across branches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
