"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useHrExitClearance, useExitClearanceMutations } from "@/components/hooks/useHrExitClearances"
import { useToast } from "@/components/ui/toast"
import {
  CLEARANCE_STATUS_LABELS,
  formatDate,
  formatNaira,
  initials,
  statusLabel,
} from "@/lib/hr/display"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  ChevronLeft,
  CheckCircle2,
  Check,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { ModalShell } from "@/components/ui/modal-shell"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FinalReleaseScreen />
    </Suspense>
  )
}

function FinalReleaseScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearanceId = searchParams.get("clearanceId") ?? ""

  const [modalOpen, setModalOpen] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { pushToast } = useToast()
  const { clearance, loading, error, refresh } = useHrExitClearance(clearanceId)
  const { pastorRelease } = useExitClearanceMutations()

  // The two sign-offs already on the dossier, in the order they happen.
  const steps = useMemo(() => {
    if (!clearance) return []
    const rows: { id: string; title: string; description: string; timestamp: string; done: boolean }[] = []

    rows.push({
      id: "admin",
      title: "Administration",
      description:
        clearance.adminSignOff.notes ||
        clearance.adminSignOff.checklist
          .map((item) => `${item.label}: ${item.isReturned ? "returned" : "outstanding"}`)
          .join(", ") ||
        "Assets and access reviewed.",
      timestamp: formatDate(clearance.adminSignOff.signedOffAt),
      done: clearance.adminSignOff.isCompleted,
    })

    rows.push({
      id: "finance",
      title: "Finance & Accounts",
      description: clearance.financeSignOff.isCompleted
        ? `Loan balance ${formatNaira(clearance.financeSignOff.outstandingLoanBalance)} · net final pay ${formatNaira(clearance.financeSignOff.netFinalPay)}.${clearance.financeSignOff.note ? ` ${clearance.financeSignOff.note}` : ""}`
        : "Awaiting settlement of loans and final pay.",
      timestamp: formatDate(clearance.financeSignOff.signedOffAt),
      done: clearance.financeSignOff.isCompleted,
    })

    return rows
  }, [clearance])

  const readyForRelease = clearance?.status === "pending_pastor"
  const alreadyReleased = clearance?.pastorRelease.isCompleted ?? false

  const handleRelease = async () => {
    if (!clearance) {
      setFormError("Open this from the exit clearance list so the record is known.")
      return
    }

    setReleasing(true)
    setFormError(null)
    try {
      await pastorRelease(clearance.id)
      pushToast("Final release confirmed", "success")
      refresh()
      setModalOpen(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to confirm the release.")
    } finally {
      setReleasing(false)
    }
  }

  const closeAndReturn = () => {
    setModalOpen(false)
    router.push("/branchlead-pastor/hr/exit-clearance")
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Training</span>
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
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {clearance
                ? statusLabel(CLEARANCE_STATUS_LABELS, clearance.status)
                : loading
                  ? "Loading…"
                  : "No clearance selected"}
            </span>
          </div>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT — employee card */}
            <div className="lg:col-span-1 rounded-[14px] border border-[#EEF1F6] bg-white p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF2FF] text-[18px] font-bold text-[#3B5BDB]">
                  {initials(clearance?.employeeName ?? "")}
                </div>
                <div className="mt-4 text-[20px] font-bold text-[#111827]">
                  {clearance?.employeeName || "—"}
                </div>
                <div className="mt-1 text-[13px] text-[#6B7280]">
                  {clearance?.jobTitle || clearance?.department || error || "—"}
                </div>
              </div>

              <div className="mt-6 space-y-5 border-t border-[#F3F4F6] pt-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Exit Date
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {formatDate(clearance?.lastWorkingDate ?? "")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Reason
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {clearance?.reason || "—"}
                  </div>
                </div>
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
                {steps.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Timeline node + connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={
                          item.done
                            ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                            : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-[#6B7280]"
                        }
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-[#E5E7EB]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="text-[14px] font-bold text-[#111827]">{item.title}</div>
                        <div className="text-right">
                          <div className="text-[12px] text-[#6B7280]">{item.timestamp}</div>
                          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                            {item.done ? "SIGNED OFF" : "PENDING"}
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-[13px] text-[#6B7280]">{item.description}</p>
                    </div>
                  </div>
                ))}

                {!loading && steps.length === 0 ? (
                  <p className="text-[13px] text-[#9CA3AF]">
                    Open a clearance from the exit list to see its sign-offs.
                  </p>
                ) : null}
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
                Ready for Release
              </div>
              <p className="mt-2 text-[13px] text-[#6B7280]">
                {alreadyReleased
                  ? `Released on ${formatDate(clearance?.pastorRelease.releasedAt ?? "")}. The clearance is closed.`
                  : readyForRelease
                    ? `As Branch Pastor, your confirmation formally concludes ${clearance?.employeeName || "this staff member"}'s tenure.`
                    : "Admin and Finance have to sign off before the release can be confirmed."}
              </p>

              {formError ? (
                <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
                  {formError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleRelease}
                disabled={releasing || !readyForRelease || alreadyReleased}
                className="mt-6 rounded-md bg-[#111827] px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {releasing ? "Confirming…" : alreadyReleased ? "Released" : "Confirm Release"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation modal */}
      <ModalShell open={modalOpen} onClose={closeAndReturn} className="max-w-sm">
        <div className="flex flex-col items-center px-8 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="mt-5 text-[20px] font-bold text-[#111827]">Release Confirmed</div>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Exit clearance for {clearance?.employeeName || "this staff member"} is now
            complete.
          </p>
          <button
            type="button"
            onClick={closeAndReturn}
            className="mt-6 w-full rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
          >
            Return to Dashboard
          </button>
        </div>
      </ModalShell>
    </div>
  )
}
