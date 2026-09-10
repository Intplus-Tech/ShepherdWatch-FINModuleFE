"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useApproveLeave,
  useLeaveBalances,
  useRejectLeave,
} from "@/components/hooks/hr/useHrLeave"
import { deref, employeeName, initials } from "@/lib/hr/normalize"
import type { LeaveRequest } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"

/**
 * The pastor's decision on a leave request.
 *
 * Approve and decline hit different endpoints but share this dialog; a comment
 * is mandatory when declining, which is what the backend enforces.
 */
export default function BranchLeadLeaveApprovalModal({
  open,
  onClose,
  request,
  intent = "approve",
}: {
  open: boolean
  onClose: () => void
  request: LeaveRequest | null
  intent?: "approve" | "reject"
}) {
  const approve = useApproveLeave()
  const reject = useRejectLeave()

  const employee = deref(request?.employeeId)
  const balances = useLeaveBalances(open ? employee?._id : null)

  const [comment, setComment] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setComment("")
    setFormError(null)
    approve.reset()
    reject.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request?._id, intent])

  const pending = approve.isPending || reject.isPending
  const declining = intent === "reject"

  async function handleSubmit() {
    if (!request) return
    setFormError(null)

    if (declining && comment.trim().length < 2) {
      setFormError("A reason is required to decline a request.")
      return
    }

    try {
      const mutation = declining ? reject : approve
      await mutation.mutateAsync({ id: request._id, comment: comment.trim() || undefined })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const leaveType = deref(request?.leaveTypeId)
  const balanceRow = balances.data?.balances.find(
    (row) => row.leaveTypeId === leaveType?._id,
  )

  const error =
    formError ??
    (approve.error || reject.error ? hrErrorMessage(approve.error ?? reject.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            {declining ? "Decline Leave Request" : "Approve Leave Request"}
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {declining
              ? "Record why this request is being turned down."
              : "Confirm the time off and any handover conditions."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {!request ? (
          <HrPanelState
            isLoading={false}
            error={null}
            isEmpty
            emptyTitle="No request selected"
            className="border-0 p-4"
          />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[14px] font-bold text-[#3B5BDB]">
                {initials(employeeName(request.employeeId))}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#111827]">
                  {employeeName(request.employeeId)}
                </p>
                <p className="text-[12px] text-[#6B7280]">
                  {employee?.department ?? employee?.jobTitle ?? "—"}
                </p>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#EEF1F6] p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Leave type</span>
                <span className="font-semibold text-[#111827]">
                  {leaveType?.name ?? "Leave"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Dates</span>
                <span className="font-semibold text-[#111827]">
                  {formatDate(request.startDate, "medium")} –{" "}
                  {formatDate(request.endDate, "medium")}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Duration</span>
                <span className="font-semibold text-[#111827]">
                  {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                </span>
              </div>
              {balanceRow && (
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <span className="text-[#6B7280]">Balance after approval</span>
                  <span className="font-semibold text-[#111827]">
                    {Math.max(0, balanceRow.remaining - request.totalDays)} of{" "}
                    {balanceRow.entitlement} days
                  </span>
                </div>
              )}
              {request.reason && (
                <p className="mt-3 border-t border-[#F3F4F6] pt-3 text-[12px] leading-relaxed text-[#4B5563]">
                  {request.reason}
                </p>
              )}
              {request.handoverNote && (
                <p className="mt-2 text-[12px] leading-relaxed text-[#4B5563]">
                  <span className="font-semibold">Handover: </span>
                  {request.handoverNote}
                </p>
              )}
            </div>

            {(request.conflictCount ?? 0) > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-[12px] text-[#4B5563]">
                  <span className="font-semibold text-amber-700">
                    {request.conflictCount} overlapping request
                    {request.conflictCount === 1 ? "" : "s"}
                  </span>{" "}
                  in the same period. Check cover before approving.
                </p>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                Comment {declining ? "(required)" : "(optional)"}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={pending}
                placeholder={
                  declining
                    ? "Explain the decision for the applicant's record…"
                    : "Any conditions attached to this approval…"
                }
                className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>

            {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !request}
          className={
            declining
              ? "inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
          }
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {declining ? "Decline Request" : "Approve Leave"}
        </button>
      </div>
    </ModalShell>
  )
}
