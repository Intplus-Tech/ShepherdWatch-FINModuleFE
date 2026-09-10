"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { EmployeePicker } from "@/components/hr/EmployeePicker"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useBranchId } from "@/components/hooks/hr/useBranchId"
import { useApplyLeaveOnBehalf, useLeaveTypes } from "@/components/hooks/hr/useHrLeave"

const labelCls = "mb-1.5 block text-[13px] font-semibold text-[#374151]"
const fieldCls =
  "h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function BranchAdminApplyLeaveModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const branchId = useBranchId()
  const leaveTypes = useLeaveTypes({ enabled: open })
  const applyOnBehalf = useApplyLeaveOnBehalf()

  const [employeeId, setEmployeeId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState(todayIso())
  const [reason, setReason] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setEmployeeId("")
    setLeaveTypeId("")
    setStartDate(todayIso())
    setEndDate(todayIso())
    setReason("")
    setFormError(null)
    applyOnBehalf.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit() {
    setFormError(null)

    if (!employeeId) {
      setFormError("Select the employee this request is for.")
      return
    }
    if (!leaveTypeId) {
      setFormError("Choose a leave type.")
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError("The end date can't be before the start date.")
      return
    }
    if (!branchId) {
      setFormError("Your account has no branch assigned, so this can't be submitted.")
      return
    }

    try {
      await applyOnBehalf.mutateAsync({
        employeeId,
        branchId,
        leaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim() || undefined,
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const types = leaveTypes.data?.items ?? []
  const error = formError ?? (applyOnBehalf.error ? hrErrorMessage(applyOnBehalf.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Apply for Leave</h2>
          <div className="mt-0.5 text-[12px] text-[#6B7280]">(On Behalf of Others)</div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5 px-6 py-5">
        {/* Select Employee */}
        <div>
          <label className={labelCls}>Select Employee</label>
          <EmployeePicker
            value={employeeId}
            onChange={setEmployeeId}
            disabled={applyOnBehalf.isPending}
            className="!mt-0"
          />
        </div>

        {/* Leave type */}
        <div>
          <label className={labelCls}>Leave Type</label>
          <select
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            disabled={leaveTypes.isLoading || types.length === 0}
            className={fieldCls}
          >
            <option value="" disabled>
              {leaveTypes.isLoading
                ? "Loading leave types…"
                : types.length === 0
                  ? "No leave types configured"
                  : "Select a leave type"}
            </option>
            {types.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name} ({type.maxDaysPerYear} days/yr)
              </option>
            ))}
          </select>
          {leaveTypes.error && (
            <p className="mt-1.5 text-[12px] text-red-600">
              {hrErrorMessage(leaveTypes.error)}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={fieldCls}
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className={labelCls}>Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Staff member called in sick at 8:00 AM. Medical certificate will be provided."
            className="w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
          />
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={applyOnBehalf.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={applyOnBehalf.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {applyOnBehalf.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Submit Request for Approval
        </button>
      </div>
    </ModalShell>
  )
}
