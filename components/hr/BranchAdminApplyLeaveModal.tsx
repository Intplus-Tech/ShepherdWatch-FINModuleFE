"use client"

import { useMemo, useState } from "react"
import { X, User, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { useHrEmployees } from "@/components/hooks/useHrEmployees"
import { useHrLeaveTypes, useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useHrScope } from "@/lib/hr/useHrScope"
import { useToast } from "@/components/ui/toast"

/**
 * Files a leave request for another staff member. Leave types come from the
 * stopgap in `useHrLeaveTypes` — the API needs a `leaveTypeId` and has no
 * endpoint listing them, so the types already used on this branch are offered.
 */
export default function BranchAdminApplyLeaveModal({
  open,
  onClose,
  onApplied,
}: {
  open: boolean
  onClose: () => void
  onApplied?: () => void
}) {
  const scope = useHrScope()
  const { pushToast } = useToast()
  const { applyOnBehalf } = useLeaveMutations()
  const { employees, loading: employeesLoading } = useHrEmployees({ limit: 100 })
  const { types, loading: typesLoading } = useHrLeaveTypes()

  const [employeeId, setEmployeeId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === employeeId) ?? null,
    [employees, employeeId]
  )

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

  const reset = () => {
    setEmployeeId("")
    setLeaveTypeId("")
    setStartDate("")
    setEndDate("")
    setReason("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)

    if (!employeeId) return setError("Choose the staff member this request is for.")
    if (!leaveTypeId) return setError("Choose a leave type.")
    if (!startDate || !endDate) return setError("Set both the start and end date.")
    if (totalDays <= 0) return setError("The end date must fall on or after the start date.")

    const branchId = selectedEmployee?.branchId || scope.branchId || scope.ownBranchId
    if (!branchId) return setError("No branch is attached to this request, so it cannot be filed.")

    setSaving(true)
    try {
      await applyOnBehalf({
        employeeId,
        branchId,
        leaveTypeId,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      })
      pushToast("Leave request submitted", "success")
      reset()
      onApplied?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this leave request.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Apply for Leave</h2>
          <div className="mt-0.5 text-[12px] text-[#6B7280]">(On Behalf of Others)</div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">
        {/* Select Employee */}
        <div>
          <label
            className="mb-1.5 block text-[13px] font-semibold text-[#374151]"
            htmlFor="leave-employee"
          >
            Select Employee
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <select
              id="leave-employee"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            >
              <option value="" disabled>
                {employeesLoading ? "Loading staff…" : "Search for a branch staff member..."}
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name || "Unnamed staff"}
                  {employee.jobTitle ? ` · ${employee.jobTitle}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leave type */}
        <div>
          <label
            className="mb-1.5 block text-[13px] font-semibold text-[#374151]"
            htmlFor="leave-type"
          >
            Leave Type
          </label>
          <select
            id="leave-type"
            value={leaveTypeId}
            onChange={(event) => setLeaveTypeId(event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
          >
            <option value="" disabled>
              {typesLoading ? "Loading leave types…" : "Select a leave type..."}
            </option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
                {type.code ? ` (${type.code})` : ""}
              </option>
            ))}
          </select>
          {!typesLoading && types.length === 0 ? (
            <p className="mt-1.5 text-[11px] text-amber-600">
              No leave types are available yet. One leave request has to exist on this branch
              before types can be offered here.
            </p>
          ) : null}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-1.5 block text-[13px] font-semibold text-[#374151]"
              htmlFor="leave-start"
            >
              Start Date
            </label>
            <input
              id="leave-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-[13px] font-semibold text-[#374151]"
              htmlFor="leave-end"
            >
              End Date
            </label>
            <input
              id="leave-end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {totalDays > 0 ? (
          <p className="text-[12px] text-[#6B7280]">
            {totalDays} {totalDays === 1 ? "day" : "days"} requested.
          </p>
        ) : null}

        {/* Reason */}
        <div>
          <label
            className="mb-1.5 block text-[13px] font-semibold text-[#374151]"
            htmlFor="leave-reason"
          >
            Reason
          </label>
          <textarea
            id="leave-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add any context the approver needs."
            className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
          />
        </div>

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </ModalShell>
  )
}
