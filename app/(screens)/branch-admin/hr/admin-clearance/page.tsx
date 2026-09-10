"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Menu,
  Search,
  Bell,
  ChevronLeft,
  Info,
  IdCard,
  Shirt,
  Laptop,
  KeyRound,
  Package,
  Check,
  Loader2,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  useAdminSignOffClearance,
  useExitClearance,
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
import { formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"

/** Icon per seeded checklist key; anything else falls back to a generic box. */
const CHECKLIST_ICONS: Record<string, typeof IdCard> = {
  id_card: IdCard,
  uniforms: Shirt,
  laptop: Laptop,
  keys: KeyRound,
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearanceId = searchParams.get("id")
  const { user } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [otherNotes, setOtherNotes] = useState("")
  const [clearanceDate, setClearanceDate] = useState(todayIso())
  const [formError, setFormError] = useState<string | null>(null)

  const clearanceQuery = useExitClearance(clearanceId)
  const clearance = clearanceQuery.data
  const signOff = useAdminSignOffClearance()

  const checklist = useMemo(() => clearance?.adminChecklist ?? [], [clearance])

  /**
   * Seed the toggles from whatever the backend already recorded.
   *
   * Adjusted during render (keyed on the clearance) rather than in an effect,
   * so the first paint already shows the stored state instead of flashing
   * every box unchecked.
   */
  const [seededFor, setSeededFor] = useState<string | null>(null)
  if (clearance && checklist.length > 0 && seededFor !== clearance._id) {
    setSeededFor(clearance._id)
    setChecked(
      Object.fromEntries(checklist.map((item) => [item.key, Boolean(item.isReturned)])),
    )
  }

  const employee = deref(clearance?.employeeId)
  const name = clearance ? employeeName(clearance.employeeId) : ""
  const adminStep = clearance?.steps?.find((step) => step.step === "admin")
  const alreadySigned = adminStep?.status === "completed"

  const meta = clearance
    ? [
        {
          label: "Exit Date",
          value: formatDate(clearance.lastWorkingDate, "medium"),
          rose: true,
        },
        { label: "Reason", value: clearance.reason },
        { label: "Department", value: employee?.department ?? "—" },
        {
          label: "Clearance Status",
          value: lookup(CLEARANCE_STATUS_LABELS, clearance.status),
        },
      ]
    : []

  function toggle(key: string) {
    setChecked((current) => ({ ...current, [key]: !current[key] }))
  }

  async function handleComplete() {
    if (!clearance) return
    setFormError(null)
    try {
      await signOff.mutateAsync({
        id: clearance._id,
        checklist: checklist.map((item) => ({
          key: item.key,
          label: item.label,
          isReturned: Boolean(checked[item.key]),
          itemDetails: item.itemDetails,
        })),
        notes: otherNotes.trim() || undefined,
      })
      router.push("/branch-admin/hr/exit-clearance")
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/exit-clearance"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
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
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
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
              emptyDescription="Open one from the Exit Clearance list."
            />
          ) : clearanceQuery.isLoading || clearanceQuery.error || !clearance ? (
            <HrPanelState
              isLoading={clearanceQuery.isLoading}
              error={clearanceQuery.error}
              isEmpty={!clearance}
              emptyTitle="Clearance not found"
              onRetry={() => clearanceQuery.refetch()}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              {/* LEFT: employee card */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-[18px] font-bold text-[#2563EB]">
                    {initials(name)}
                  </div>
                  <h2 className="mt-3 text-[22px] font-bold text-[#111827]">{name}</h2>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    {employee?.jobTitle ?? "—"} • #{employee?.employeeId ?? "—"}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                      badgeFor(CLEARANCE_STATUS_BADGES, clearance.status),
                    )}
                  >
                    {lookup(CLEARANCE_STATUS_LABELS, clearance.status)}
                  </span>
                </div>

                {/* Meta grid */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  {meta.map((m) => (
                    <div key={m.label} className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        {m.label}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] font-semibold",
                          m.rose ? "text-rose-600" : "text-[#111827]",
                        )}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Step progress */}
                <div className="mt-5">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Clearance Steps
                  </div>
                  <ul className="space-y-2">
                    {clearance.steps?.map((step) => (
                      <li key={step.step} className="flex items-center gap-2 text-[12px]">
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            step.status === "completed"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-[#F3F4F6] text-[#9CA3AF]",
                          )}
                        >
                          {step.status === "completed" && (
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          )}
                        </span>
                        <span className="font-semibold capitalize text-[#111827]">
                          {step.step.replace(/_/g, " ")}
                        </span>
                        <span className="ml-auto text-[#9CA3AF]">
                          {lookup(CLEARANCE_STATUS_LABELS, step.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Admin instructions */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <Info className="h-3.5 w-3.5" />
                    Admin Instructions
                  </div>
                  <div className="rounded-[8px] bg-[#EEF2FF] p-4 text-[13px] leading-relaxed text-[#4B5563]">
                    Please ensure all physical assets are inspected for damage before signing
                    off. Check serial numbers for all IT equipment against the inventory log.
                  </div>
                </div>
              </div>

              {/* RIGHT: admin clearance card */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
                <h2 className="text-[16px] font-bold text-[#111827]">Admin Clearance</h2>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  Final verification of physical company property and system access.
                </p>

                <div className="mt-6 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Physical Assets & Access
                </div>

                {/* Checklist */}
                {checklist.length === 0 ? (
                  <HrPanelState
                    isLoading={false}
                    error={null}
                    isEmpty
                    emptyTitle="No checklist items"
                    emptyDescription="This clearance has no asset checklist recorded."
                    className="mt-3"
                  />
                ) : (
                  <div className="mt-3 space-y-3">
                    {checklist.map((item) => {
                      const Icon = CHECKLIST_ICONS[item.key] ?? Package
                      const isChecked = Boolean(checked[item.key])
                      return (
                        <label
                          key={item.key}
                          className={cn(
                            "flex items-start gap-3 rounded-[8px] border p-4 transition-colors",
                            alreadySigned ? "cursor-default" : "cursor-pointer",
                            isChecked
                              ? "border-emerald-300 bg-emerald-50/50"
                              : "border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={alreadySigned || signOff.isPending}
                            onChange={() => toggle(item.key)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#2563EB] accent-[#2563EB]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-[#111827]">
                                {item.label}
                              </span>
                              {item.itemDetails && (
                                <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                  {item.itemDetails}
                                </span>
                              )}
                            </div>
                          </div>
                          <Icon className="h-4.5 w-4.5 shrink-0 text-[#9CA3AF]" />
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Other items / notes */}
                <div className="mt-5 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Other Items / Notes
                  </label>
                  <textarea
                    value={otherNotes}
                    onChange={(e) => setOtherNotes(e.target.value)}
                    disabled={alreadySigned || signOff.isPending}
                    rows={3}
                    placeholder="List any additional items or condition notes here..."
                    className="resize-none rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] disabled:bg-[#F9FAFB]"
                  />
                </div>

                {/* Admin name + clearance date */}
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Signing Off As
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={user?.name ?? user?.email ?? "—"}
                        className="w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 pr-10 text-[13px]"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Clearance Date
                    </label>
                    <input
                      type="date"
                      value={clearanceDate}
                      onChange={(e) => setClearanceDate(e.target.value)}
                      className="rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px]"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="mt-4 text-[12px] font-medium text-red-600">{formError}</p>
                )}

                {/* Footer */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-5">
                  <span className="text-[12px] text-[#9CA3AF]">
                    {alreadySigned
                      ? `Admin step cleared ${
                          adminStep?.timestamp ? formatDate(adminStep.timestamp, "medium") : ""
                        }`
                      : "Sign-off records who cleared each item."}
                  </span>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={alreadySigned || signOff.isPending || checklist.length === 0}
                    className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:opacity-50"
                  >
                    {signOff.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {alreadySigned ? "Admin Clearance Complete" : "Complete Admin Clearance"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default withSuspense(Page)
