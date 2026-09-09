"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/toast"
import { useHrExitClearances, useExitClearanceMutations } from "@/components/hooks/useHrExitClearances"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { formatDate, formatNaira, initials } from "@/lib/hr/display"
import { Search, Bell, Info } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

const AVATAR_TINTS = ["bg-[#EEF2FF] text-[#3B5BDB]", "bg-[#111827] text-white"]

function AwaitingReviewPill() {
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
      AWAITING REVIEW
    </span>
  )
}

export default function Page() {
  const [selectedId, setSelectedId] = useState<string>("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { pushToast } = useToast()
  // Finance acts on the clearances the admin has already signed off.
  const { clearances, loading, error, refresh } = useHrExitClearances({
    status: "pending_finance",
    limit: 50,
  })
  const { financeSignOff } = useExitClearanceMutations()

  const selected = useMemo(
    () => clearances.find((row) => row.id === selectedId) ?? clearances[0] ?? null,
    [clearances, selectedId]
  )

  useEffect(() => {
    if (!selectedId && clearances.length) setSelectedId(clearances[0].id)
  }, [clearances, selectedId])

  // The exiting employee's running loans decide what has to be recovered.
  const { loans } = useHrLoans({
    employeeId: selected?.employeeId ?? "",
    status: "active",
    limit: 20,
  })

  const outstandingLoanBalance = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.remainingBalance, 0),
    [loans]
  )

  // Anything the admin ticked as not returned still has to be settled.
  const unreturned = useMemo(
    () => (selected?.adminSignOff.checklist ?? []).filter((item) => !item.isReturned),
    [selected]
  )

  const netFinalPay = Math.max(-outstandingLoanBalance, 0)

  const handleApprove = async () => {
    setFormError(null)
    if (!selected) {
      setFormError("Select a clearance to sign off.")
      return
    }

    setSaving(true)
    try {
      await financeSignOff(selected.id, {
        outstandingLoanBalance,
        unreturnedAssetsCost: 0,
        loanDeductionApproved: outstandingLoanBalance > 0,
        netFinalPay,
        note: note.trim() || undefined,
      })
      pushToast("Finance clearance completed", "success")
      setNote("")
      setSelectedId("")
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to complete the sign-off.")
    } finally {
      setSaving(false)
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
              <h2 className="text-[16px] font-bold text-[#111827]">
                Pending Clearances
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                3 personnel awaiting financial sign-off
              </p>
            </div>

            <div className="p-3">
              {clearances.map((p, index) => {
                const isActive = selected?.id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      isActive
                        ? "border-[#3B5BDB] bg-[#F8FAFF]"
                        : "border-[#EEF1F6] bg-white hover:bg-[#F8FAFC]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                        AVATAR_TINTS[index % AVATAR_TINTS.length]
                      )}
                    >
                      {initials(p.employeeName)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-[#111827]">
                        {p.employeeName || "Unnamed staff"}
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        {p.jobTitle || p.department || "—"}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <AwaitingReviewPill />
                      </div>
                      <div className="mt-2 text-[11px] text-[#9CA3AF]">
                        Exit: {formatDate(p.lastWorkingDate)}
                      </div>
                    </div>
                  </button>
                )
              })}

              {loading ? (
                <p className="px-2 py-6 text-center text-[13px] text-[#6B7280]">Loading…</p>
              ) : null}

              {error ? (
                <p className="px-2 py-6 text-center text-[13px] text-rose-600">{error}</p>
              ) : null}

              {!loading && !error && clearances.length === 0 ? (
                <p className="px-2 py-6 text-center text-[13px] text-[#9CA3AF]">
                  Nothing is waiting on finance sign-off.
                </p>
              ) : null}
            </div>
          </div>

          {/* RIGHT: Detail */}
          <div className="flex flex-col gap-5">
            {/* Profile card */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <div className="flex items-center gap-5">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[26px] font-bold text-[#3B5BDB]">
                  {initials(selected?.employeeName ?? "")}
                </span>
                <div className="min-w-0">
                  <h1 className="text-[32px] font-bold text-[#111827] leading-tight">
                    {selected?.employeeName || "No clearance selected"}
                  </h1>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    {[selected?.jobTitle, selected?.department].filter(Boolean).join(" | ") || "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                      📅 Exit Date: {formatDate(selected?.lastWorkingDate ?? "")}
                    </span>
                    <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                      🪪 ID: {selected?.employeeCode || "—"}
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

                {/* Loan balance */}
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <div className="text-[12px] font-semibold text-[#6B7280]">
                    Loan Balance
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-rose-600">
                    {formatNaira(outstandingLoanBalance)}
                  </div>
                </div>

                {/* Unreturned assets */}
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[12px] font-semibold text-[#6B7280]">
                      Unreturned Assets
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      {unreturned.length} item{unreturned.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-rose-600">
                    {unreturned.length
                      ? unreturned.map((item) => item.label).join(", ")
                      : "All assets returned"}
                  </div>
                </div>

                {/* Info note */}
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EEF2FF] p-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5BDB]" />
                  <p className="text-[12px] italic text-[#4B5563]">
                    Sign-off is restricted until asset recovery is confirmed by
                    the IT and Asset Management departments.
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
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Enter reason for hold or additional clearance notes..."
                  className="mt-4 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[13px] outline-none"
                />

                <div className="mt-4 rounded-lg bg-[#F8FAFC] p-3 text-[12px] text-[#4B5563]">
                  Settlement: {formatNaira(outstandingLoanBalance)} recovered from final pay
                  {outstandingLoanBalance > 0 ? " (loan deduction approved)" : ""}.
                </div>

                {formError ? (
                  <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
                    {formError}
                  </p>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={saving || !selected || unreturned.length > 0}
                    title={
                      unreturned.length > 0
                        ? "Sign-off is blocked until every asset is confirmed returned."
                        : undefined
                    }
                    className="rounded-md bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                  >
                    {saving ? "Submitting…" : "Approve Clearance"}
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
