"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { useHrExitClearance, useExitClearanceMutations } from "@/components/hooks/useHrExitClearances"
import { formatDate, initials } from "@/lib/hr/display"
import { useRouter } from "next/navigation"
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
  Check,
  X,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"

type ChecklistItem = {
  id: string
  icon: typeof IdCard
  title: string
  desc: string
  pill?: string
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "id-card",
    icon: IdCard,
    title: "ID Card returned",
    desc: "Employee identification badge and lanyard.",
  },
  {
    id: "uniforms",
    icon: Shirt,
    title: "Uniforms returned",
    desc: "Official ShepherdWatch branded attire (3 sets).",
  },
  {
    id: "laptop",
    icon: Laptop,
    title: "Laptop/Equipment returned",
    desc: "Includes charger, carrying case, and external peripheral kit.",
    pill: "MacBook Pro #SW-442",
  },
  {
    id: "keys",
    icon: KeyRound,
    title: "Office Keys/Access Card",
    desc: "Physical keys for office 302 and biometric access card.",
  },
]

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminClearanceScreen />
    </Suspense>
  )
}

function AdminClearanceScreen() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [otherNotes, setOtherNotes] = useState("")
  const [adminName, setAdminName] = useState("")
  const [clearanceDate, setClearanceDate] = useState(() => new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const clearanceId = searchParams.get("clearanceId") ?? ""
  const { pushToast } = useToast()
  const { clearance, loading, error, refresh } = useHrExitClearance(clearanceId)
  const { adminSignOff } = useExitClearanceMutations()

  // A clearance already signed off carries its checklist; a fresh one starts
  // from the standard asset list below.
  const checklist = useMemo(() => {
    if (clearance?.adminSignOff.checklist.length) {
      return clearance.adminSignOff.checklist.map((row) => ({
        id: row.key,
        icon: CHECKLIST.find((item) => item.id === row.key)?.icon ?? IdCard,
        title: row.label || row.key,
        desc: row.itemDetails || "",
        pill: undefined as string | undefined,
      }))
    }
    return CHECKLIST
  }, [clearance])

  // Seed the tick boxes and notes from whatever was already signed off.
  useEffect(() => {
    if (!clearance) return
    const seeded: Record<string, boolean> = {}
    for (const row of clearance.adminSignOff.checklist) seeded[row.key] = row.isReturned
    setChecked(seeded)
    setOtherNotes(clearance.adminSignOff.notes)
  }, [clearance])

  const alreadySigned = clearance?.adminSignOff.isCompleted ?? false

  const handleComplete = async () => {
    setFormError(null)
    if (!clearance) {
      setFormError("Open this from the separations list so the record is known.")
      return
    }
    if (!adminName.trim()) {
      setFormError("Enter the name of the officer signing off.")
      return
    }

    setSaving(true)
    try {
      await adminSignOff(
        clearance.id,
        checklist.map((item) => ({
          key: item.id,
          label: item.title,
          isReturned: Boolean(checked[item.id]),
          itemDetails: item.desc,
        })),
        [otherNotes.trim(), `Signed off by ${adminName.trim()} on ${clearanceDate}`]
          .filter(Boolean)
          .join(" — ")
      )
      pushToast("Admin clearance completed", "success")
      refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to complete this clearance.")
    } finally {
      setSaving(false)
    }
  }
  const router = useRouter()

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

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
        {/* Header */}
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
            <span className="text-[15px] font-bold text-[#111827]">Training</span>
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
          {/* Back link */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
            {/* LEFT: employee card */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-[18px] font-bold text-[#2563EB]">
                  {initials(clearance?.employeeName ?? "")}
                </div>
                <h2 className="mt-3 text-[22px] font-bold text-[#111827]">
                  {clearance?.employeeName || (loading ? "Loading…" : "Exit Clearance")}
                </h2>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  {clearance
                    ? `${clearance.jobTitle || "Staff"} • #${clearance.employeeCode || "—"}`
                    : error || (clearanceId ? "" : "No clearance selected")}
                </p>
              </div>

              {/* Meta grid */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Exit Date",
                    value: formatDate(clearance?.lastWorkingDate ?? ""),
                    rose: true,
                  },
                  { label: "Department", value: clearance?.department || "—" },
                  { label: "Branch", value: clearance?.branchName || "—" },
                  { label: "Reason", value: clearance?.reason || "—" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {m.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-[13px] font-semibold",
                        m.rose ? "text-rose-600" : "text-[#111827]"
                      )}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin instructions */}
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <Info className="h-3.5 w-3.5" />
                  Admin Instructions
                </div>
                <div className="rounded-[8px] bg-[#EEF2FF] p-4 text-[13px] leading-relaxed text-[#4B5563]">
                  Please ensure all physical assets are inspected for damage before
                  signing off. Check serial numbers for all IT equipment against the
                  inventory log.
                </div>
              </div>
            </div>

            {/* RIGHT: admin clearance card */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Admin Clearance
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Final verification of physical company property and system access.
              </p>

              <div className="mt-6 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Physical Assets & Access
              </div>

              {/* Checklist */}
              <div className="mt-3 space-y-3">
                {checklist.map((item) => {
                  const Icon = item.icon
                  const isChecked = !!checked[item.id]
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[8px] border p-4 transition-colors",
                        isChecked
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#2563EB] accent-[#2563EB]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-[#111827]">
                            {item.title}
                          </span>
                          {item.pill && (
                            <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                              {item.pill}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] text-[#6B7280]">
                          {item.desc}
                        </p>
                      </div>
                      <Icon className="h-4.5 w-4.5 shrink-0 text-[#9CA3AF]" />
                    </label>
                  )
                })}
              </div>

              {/* Other items / notes */}
              <div className="mt-5 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Other Items / Notes
                </label>
                <textarea
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  rows={3}
                  placeholder="List any additional items or condition notes here..."
                  className="resize-none rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px]"
                />
              </div>

              {/* Admin name + clearance date */}
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Admin Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 pr-10 text-[13px]"
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

              {formError ? (
                <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
                  {formError}
                </p>
              ) : null}

              {/* Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-5">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                  {alreadySigned ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Signed off {formatDate(clearance?.adminSignOff.signedOffAt ?? "")}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Not yet signed off
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={saving || !clearance || alreadySigned}
                  className="rounded-md bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Submitting…" : "Complete Admin Clearance"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
