"use client"

import { AlertTriangle, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { CardHeading, Field, StatusBadge, btnOutline } from "./shared"
import { HrPanelState } from "@/components/hr/HrDataState"
import {
  LEAVE_STATUS_LABELS,
  deref,
  employeeName,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import type { LeaveRequest } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"

/**
 * Read-only view of one leave request.
 *
 * Approve/decline live on the pastor's queue (`BranchLeadLeaveApprovalModal`);
 * this is the record as filed, opened from the employee profile.
 */
export default function LeaveDetailModal({
  request,
  onClose,
}: {
  request: LeaveRequest | null
  onClose: () => void
}) {
  const leaveType = deref(request?.leaveTypeId)
  const supervisorAction = request?.supervisorAction
  const hrAction = request?.hrAction

  return (
    <ModalShell open={request !== null} onClose={onClose} className="max-w-lg">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">Leave Request</h2>
          {request && (
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {employeeName(request.employeeId)}
            </p>
          )}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
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
            <div className="flex items-center justify-between">
              <CardHeading>{leaveType?.name ?? "Leave"}</CardHeading>
              <StatusBadge
                status={lookup(LEAVE_STATUS_LABELS, request.status).toUpperCase()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" value={formatDate(request.startDate, "medium")} />
              <Field label="End Date" value={formatDate(request.endDate, "medium")} />
              <Field
                label="Duration"
                value={`${request.totalDays} ${request.totalDays === 1 ? "day" : "days"}`}
              />
              <Field label="Filed" value={formatDate(request.createdAt, "medium")} />
            </div>

            {(request.conflictCount ?? 0) > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-[12px] text-[#4B5563]">
                  <span className="font-semibold text-amber-700">
                    {request.conflictCount} overlapping request
                    {request.conflictCount === 1 ? "" : "s"}
                  </span>{" "}
                  in the same period.
                </p>
              </div>
            )}

            {request.reason && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Reason
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#4B5563]">
                  {request.reason}
                </p>
              </div>
            )}

            {request.handoverNote && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Handover Note
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[#4B5563]">
                  {request.handoverNote}
                </p>
              </div>
            )}

            {request.appliedOnBehalfBy && (
              <p className="text-[12px] text-[#9CA3AF]">
                Filed on behalf by {userName(request.appliedOnBehalfBy)}
              </p>
            )}

            {(supervisorAction?.action || hrAction?.action) && (
              <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Decisions
                </div>
                {supervisorAction?.action && (
                  <p className="mt-2 text-[12px] text-[#4B5563]">
                    <span className="font-semibold text-[#111827]">Supervisor:</span>{" "}
                    {supervisorAction.action}
                    {supervisorAction.comment ? ` — ${supervisorAction.comment}` : ""}
                    {supervisorAction.timestamp
                      ? ` (${formatDate(supervisorAction.timestamp, "medium")})`
                      : ""}
                  </p>
                )}
                {hrAction?.action && (
                  <p className="mt-1 text-[12px] text-[#4B5563]">
                    <span className="font-semibold text-[#111827]">HR:</span> {hrAction.action}
                    {hrAction.comment ? ` — ${hrAction.comment}` : ""}
                    {hrAction.timestamp
                      ? ` (${formatDate(hrAction.timestamp, "medium")})`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {(request.attachments?.length ?? 0) > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Attachments
                </div>
                <ul className="mt-2 space-y-1.5">
                  {request.attachments?.map((file) => (
                    <li key={file.url}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[13px] font-semibold text-[#3B5BDB] hover:underline"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
