"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Bell,
  ChevronLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { ModalShell } from "@/components/ui/modal-shell"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useExitClearance,
  usePastorReleaseClearance,
} from "@/components/hooks/hr/useHrExitClearance"
import {
  CLEARANCE_STEP_LABELS,
  deref,
  employeeName,
  initials,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { formatCurrency, formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"

/** Whole years and months between two dates, for the tenure line. */
function tenure(from: string | undefined, to: string): string {
  if (!from) return "—"
  const start = new Date(from)
  const end = new Date(to)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—"

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  if (months < 0) return "—"

  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years > 0) parts.push(`${years} Year${years === 1 ? "" : "s"}`)
  if (rest > 0) parts.push(`${rest} Month${rest === 1 ? "" : "s"}`)
  return parts.join(", ") || "Under a month"
}

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearanceId = searchParams.get("id")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const clearanceQuery = useExitClearance(clearanceId)
  const clearance = clearanceQuery.data
  const release = usePastorReleaseClearance()

  const employee = deref(clearance?.employeeId)
  const name = clearance ? employeeName(clearance.employeeId) : ""

  const steps = useMemo(() => clearance?.steps ?? [], [clearance])

  /** The pastoral release is only offered once admin and finance are done. */
  const prerequisitesMet =
    steps.some((s) => s.step === "admin" && s.status === "completed") &&
    steps.some((s) => s.step === "finance" && s.status === "completed")

  const alreadyReleased = Boolean(clearance?.pastoralRelease?.confirmedAt)
  const settlement = clearance?.financeSettlement

  async function handleConfirm() {
    if (!clearance) return
    setActionError(null)
    try {
      await release.mutateAsync({ id: clearance._id })
      setConfirmOpen(true)
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  function closeAndReturn() {
    setConfirmOpen(false)
    router.push("/branchlead-pastor/hr/exit-clearance")
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Final Release</span>
          <div className="flex items-center gap-3">
            <div className="relative w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-full border border-transparent bg-white pl-9 pr-3 text-[13px] font-medium text-[#4B5563] placeholder:text-[#9CA3AF] outline-none focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280] transition-colors hover:bg-gray-50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Back link */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#6B7280] hover:text-[#111827]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {!clearanceId ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No clearance selected"
              emptyDescription="Open one from the Exit Clearance registry."
              className="mt-6"
            />
          ) : clearanceQuery.isLoading || clearanceQuery.error || !clearance ? (
            <HrPanelState
              isLoading={clearanceQuery.isLoading}
              error={clearanceQuery.error}
              isEmpty={!clearance}
              emptyTitle="Clearance not found"
              onRetry={() => clearanceQuery.refetch()}
              className="mt-6"
            />
          ) : (
            <>
              {/* Header */}
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-[28px] font-bold text-[#111827]">
                    Final Release Confirmation
                  </h1>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    Verify the clearance summary to finalize the employee exit process.
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold",
                    prerequisitesMet
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  {prerequisitesMet ? "Clearance Complete" : "Clearance In Progress"}
                </span>
              </div>

              {/* Grid */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT — employee card */}
                <div className="lg:col-span-1 rounded-[14px] border border-[#EEF1F6] bg-white p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF2FF] text-[18px] font-bold text-[#3B5BDB]">
                      {initials(name)}
                    </div>
                    <div className="mt-4 text-[20px] font-bold text-[#111827]">{name}</div>
                    <div className="mt-1 text-[13px] text-[#6B7280]">
                      {employee?.jobTitle ?? "—"}
                    </div>
                  </div>

                  <div className="mt-6 space-y-5 border-t border-[#F3F4F6] pt-5">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Exit Date
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {formatDate(clearance.lastWorkingDate, "medium")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Tenure
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {tenure(employee?.hireDate, clearance.lastWorkingDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Reason
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {clearance.reason}
                      </div>
                    </div>
                    {settlement && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Net Final Pay
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                          {formatCurrency(settlement.netFinalPay ?? 0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT — departmental clearances */}
                <div className="lg:col-span-2 rounded-[14px] border border-[#EEF1F6] bg-white p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-[#3B5BDB]" />
                    <h2 className="text-[16px] font-bold text-[#111827]">
                      Departmental Clearances
                    </h2>
                  </div>

                  <div className="mt-6 space-y-0">
                    {steps.map((item, index) => {
                      const done = item.status === "completed"
                      return (
                        <div key={item.step} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                done
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#F3F4F6] text-[#9CA3AF]",
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            {index < steps.length - 1 && (
                              <div className="mt-1 w-px flex-1 bg-[#E5E7EB]" />
                            )}
                          </div>

                          <div className="flex-1 pb-6">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div className="text-[14px] font-bold text-[#111827]">
                                {lookup(CLEARANCE_STEP_LABELS, item.step)}
                              </div>
                              <div className="text-right">
                                <div className="text-[12px] text-[#6B7280]">
                                  {item.timestamp
                                    ? formatDate(item.timestamp, "medium")
                                    : "Not yet cleared"}
                                </div>
                                {item.clearedBy && (
                                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                                    {userName(item.clearedBy)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="mt-1 text-[13px] text-[#6B7280]">
                              {item.comment ??
                                (done ? "Signed off." : "Awaiting sign-off from this unit.")}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Ready for Release card */}
              <div className="mt-5 rounded-[14px] border border-[#EEF1F6] bg-[#F8FAFC] p-8 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#111827] text-white">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div className="mt-4 text-[20px] font-bold text-[#111827]">
                    {alreadyReleased ? "Release Confirmed" : "Ready for Release"}
                  </div>
                  <p className="mt-2 text-[13px] text-[#6B7280]">
                    {alreadyReleased
                      ? `${name}'s tenure was formally concluded on ${formatDate(
                          clearance.pastoralRelease?.confirmedAt,
                          "medium",
                        )}.`
                      : prerequisitesMet
                        ? `As Branch Pastor, your confirmation will formally conclude ${name}'s tenure and close this clearance.`
                        : "Admin and finance sign-off are still outstanding. The release opens once both are complete."}
                  </p>

                  {actionError && (
                    <p className="mt-3 text-[12px] font-medium text-red-600">{actionError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={alreadyReleased || !prerequisitesMet || release.isPending}
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#111827] px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                  >
                    {release.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {alreadyReleased ? "Released" : "Confirm Release"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Confirmation modal */}
      <ModalShell open={confirmOpen} onClose={closeAndReturn} className="max-w-sm">
        <div className="flex flex-col items-center px-8 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="mt-5 text-[20px] font-bold text-[#111827]">Release Confirmed</div>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Exit clearance for {name} is now complete.
          </p>
          <button
            type="button"
            onClick={closeAndReturn}
            className="mt-6 w-full rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
          >
            Return to Registry
          </button>
        </div>
      </ModalShell>
    </div>
  )
}

export default withSuspense(Page)
