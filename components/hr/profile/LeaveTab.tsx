"use client"

import { useMemo } from "react"
import { Eye } from "lucide-react"
import { SectionCard, CardHeading, StatusBadge, Th, Td } from "./shared"
import { HrPanelState, HrTableState } from "@/components/hr/HrDataState"
import { useLeaveBalances, useLeaveRequests } from "@/components/hooks/hr/useHrLeave"
import { LEAVE_STATUS_LABELS, deref, lookup } from "@/lib/hr/normalize"
import type { LeaveRequest } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"

const RING_TONES = ["#3B5BDB", "#F59E0B", "#10B981", "#8B5CF6"]

function Ring({
  label,
  remaining,
  entitlement,
  tone,
}: {
  label: string
  remaining: number
  entitlement: number
  tone: string
}) {
  return (
    <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
        {label}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-[13px] font-bold text-[#111827]"
          style={{ border: `4px solid ${tone}` }}
        >
          {remaining}
        </div>
        <div className="text-[12px] text-[#6B7280]">
          Total entitlement: {entitlement} days
        </div>
      </div>
      <div
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: tone }}
      >
        {remaining} Left
      </div>
    </div>
  )
}

export default function LeaveTab({
  employeeId,
  onViewLeave,
}: {
  employeeId: string | null
  onViewLeave: (request: LeaveRequest) => void
}) {
  const balances = useLeaveBalances(employeeId)
  const requests = useLeaveRequests({
    employeeId: employeeId ?? undefined,
    limit: 50,
    enabled: Boolean(employeeId),
  })

  const rings = useMemo(() => balances.data?.balances ?? [], [balances.data])
  const history = useMemo(() => requests.data?.items ?? [], [requests.data])

  return (
    <div className="flex flex-col gap-5">
      {/* Ring cards */}
      {balances.isLoading || balances.error || rings.length === 0 ? (
        <HrPanelState
          isLoading={balances.isLoading}
          error={balances.error}
          isEmpty={rings.length === 0}
          emptyTitle="No leave types configured"
          emptyDescription="Set up leave types to track entitlements."
          onRetry={() => balances.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rings.map((row, index) => (
            <Ring
              key={row.leaveTypeId}
              label={row.name}
              remaining={row.remaining}
              entitlement={row.entitlement}
              tone={RING_TONES[index % RING_TONES.length]}
            />
          ))}
        </div>
      )}

      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Leave History</CardHeading>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Leave Type</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              <HrTableState
                colSpan={6}
                isLoading={requests.isLoading}
                error={requests.error}
                isEmpty={history.length === 0}
                emptyTitle="No leave history"
                emptyDescription="Requests filed by this employee appear here."
                onRetry={() => requests.refetch()}
              />

              {!requests.isLoading &&
                !requests.error &&
                history.map((row) => (
                  <tr key={row._id}>
                    <Td className="font-semibold text-[#111827]">
                      {deref(row.leaveTypeId)?.name ?? "Leave"}
                    </Td>
                    <Td className="text-[#4B5563]">{formatDate(row.startDate, "medium")}</Td>
                    <Td className="text-[#4B5563]">{formatDate(row.endDate, "medium")}</Td>
                    <Td className="text-[#4B5563]">
                      {row.totalDays} {row.totalDays === 1 ? "Day" : "Days"}
                    </Td>
                    <Td>
                      <StatusBadge
                        status={lookup(LEAVE_STATUS_LABELS, row.status).toUpperCase()}
                      />
                    </Td>
                    <Td>
                      <button
                        onClick={() => onViewLeave(row)}
                        aria-label="View leave request"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#3B5BDB]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
