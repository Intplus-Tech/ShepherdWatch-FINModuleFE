"use client"

import { useMemo, useState } from "react"
import { Loader2, Search, UserPlus, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useTrainingMutations } from "@/components/hooks/useHrTrainings"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import type { HrTraining } from "@/lib/hr/types"

/**
 * Batch-enrols staff onto a training event. Anyone already on the roster is
 * shown as enrolled and cannot be picked twice.
 */
export default function BranchAdminRegisterStaffModal({
  open,
  onClose,
  training,
  onRegistered,
}: {
  open: boolean
  onClose: () => void
  training: HrTraining | null
  onRegistered?: () => void
}) {
  const { enrollParticipants } = useTrainingMutations()
  const { pushToast } = useToast()

  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useDebouncedValue(query, 300)
  const { employees, loading } = useHrEmployees({ limit: 50, search, employmentStatus: "active" })

  const enrolledIds = useMemo(
    () => new Set((training?.participants ?? []).map((participant) => participant.employeeId)),
    [training]
  )

  const capacityLeft = training?.maxCapacity
    ? Math.max(training.maxCapacity - training.enrolledCount, 0)
    : null

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]))

  const handleClose = () => {
    if (saving) return
    setPicked([])
    setQuery("")
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!training) return
    if (!picked.length) {
      setError("Pick at least one staff member.")
      return
    }
    if (capacityLeft !== null && picked.length > capacityLeft) {
      setError(`Only ${capacityLeft} place${capacityLeft === 1 ? "" : "s"} left on this session.`)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await enrollParticipants(training.id, picked)
      pushToast(
        `${picked.length} staff enrolled in ${training.title}`,
        "success"
      )
      setPicked([])
      onRegistered?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to enrol these staff.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Register Staff</h2>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">
              {training
                ? `${training.title} · ${formatDate(training.startDate)}`
                : "Select a session first"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="px-6 py-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search staff by name..."
            aria-label="Search staff"
            className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#2563EB]"
          />
        </div>

        {capacityLeft !== null ? (
          <p className="mt-2 text-[11px] text-[#9CA3AF]">
            {capacityLeft} place{capacityLeft === 1 ? "" : "s"} left of {training?.maxCapacity}.
          </p>
        ) : null}

        <div className="mt-3 max-h-[280px] overflow-y-auto rounded-[8px] border border-[#EEF1F6]">
          {loading ? (
            <p className="px-3.5 py-3 text-[12px] text-[#6B7280]">Loading staff…</p>
          ) : employees.length === 0 ? (
            <p className="px-3.5 py-3 text-[12px] text-[#9CA3AF]">No staff match that search.</p>
          ) : (
            employees.map((employee) => {
              const already = enrolledIds.has(employee.id)
              return (
                <label
                  key={employee.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3.5 py-2.5 text-[13px] hover:bg-[#F8FAFC]",
                    already && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="checkbox"
                    disabled={already}
                    checked={already || picked.includes(employee.id)}
                    onChange={() => toggle(employee.id)}
                    className="h-4 w-4 shrink-0 rounded border-[#D1D5DB] accent-[#2563EB]"
                  />
                  <span className="flex-1 font-medium text-[#111827]">
                    {employee.name || "Unnamed staff"}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    {already ? "Enrolled" : employee.jobTitle || employee.employeeCode}
                  </span>
                </label>
              )
            })
          )}
        </div>

        {error ? <p className="mt-3 text-[12px] text-rose-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !training}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Enrolling…" : `Enrol ${picked.length || ""}`.trim()}
        </button>
      </div>
    </ModalShell>
  )
}
