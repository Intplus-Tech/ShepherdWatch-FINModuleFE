"use client"

import { useMemo, useState } from "react"
import { Download, Eye, Check, X } from "lucide-react"
import { SectionCard, CardHeading, StatusBadge, Th, Td } from "./shared"
import { useHrLeaves, useLeaveMutations } from "@/components/hooks/useHrLeaves"
import { useToast } from "@/components/ui/toast"
import { LEAVE_STATUS_LABELS, formatDate, statusLabel } from "@/lib/hr/display"
import { exportHrRows } from "@/lib/hr/export"
import type { HrLeave } from "@/lib/hr/types"

const TONES = ["#3B5BDB", "#F59E0B", "#10B981", "#8B5CF6"]

function Ring({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: number
  sub: string
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
          {value}
        </div>
        <div className="text-[12px] text-[#6B7280]">{sub}</div>
      </div>
      <div
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: tone }}
      >
        {value} Days Taken
      </div>
    </div>
  )
}

export default function LeaveTab({
  employeeId,
  onViewLeave,
}: {
  employeeId: string
  onViewLeave: (leave: HrLeave) => void
}) {
  const { pushToast } = useToast()
  const { leaves, loading, error, refresh } = useHrLeaves({ employeeId, limit: 50 })
  const { approveLeave, rejectLeave } = useLeaveMutations()
  const [decidingId, setDecidingId] = useState<string | null>(null)

  // Entitlements are not served by the API, so the rings show days actually
  // taken per leave type rather than a balance against an allowance.
  const takenByType = useMemo(() => {
    const totals = new Map<string, number>()
    for (const leave of leaves) {
      if (leave.status !== "approved") continue
      const key = leave.leaveTypeName || "Leave"
      totals.set(key, (totals.get(key) ?? 0) + leave.totalDays)
    }
    return Array.from(totals.entries()).slice(0, 4)
  }, [leaves])

  const decide = async (leave: HrLeave, action: "approve" | "reject") => {
    setDecidingId(leave.id)
    try {
      if (action === "approve") {
        await approveLeave(leave.id)
        pushToast("Leave approved", "success")
      } else {
        await rejectLeave(leave.id, "Declined from the employee profile")
        pushToast("Leave declined", "success")
      }
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to record that decision", "error")
    } finally {
      setDecidingId(null)
    }
  }

  const handleExport = () => {
    const exported = exportHrRows(
      "employee-leave-history",
      leaves.map((leave) => ({
        Type: leave.leaveTypeName,
        Start: formatDate(leave.startDate),
        End: formatDate(leave.endDate),
        Days: leave.totalDays,
        Status: statusLabel(LEAVE_STATUS_LABELS, leave.status),
        Reason: leave.reason,
      }))
    )
    if (!exported) pushToast("No leave history to export", "info")
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Ring cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {takenByType.map(([label, days], index) => (
          <Ring
            key={label}
            label={label}
            value={days}
            sub="Approved days this record"
            tone={TONES[index % TONES.length]}
          />
        ))}

        {takenByType.length === 0 ? (
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5 sm:col-span-2 lg:col-span-4">
            <p className="text-[13px] text-[#9CA3AF]">
              {loading ? "Loading leave…" : "No approved leave on record for this staff member."}
            </p>
          </div>
        ) : null}
      </div>

      {/* Leave History */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Leave History</CardHeading>
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <button aria-label="Download" onClick={handleExport} className="hover:text-[#3B5BDB]">
              <Download className="h-4 w-4" />
            </button>
          </div>
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
              {leaves.map((row) => {
                const pending = String(row.status).startsWith("pending")
                return (
                  <tr key={row.id}>
                    <Td className="font-semibold text-[#111827]">
                      {row.leaveTypeName || "Leave"}
                    </Td>
                    <Td className="text-[#4B5563]">{formatDate(row.startDate)}</Td>
                    <Td className="text-[#4B5563]">{formatDate(row.endDate)}</Td>
                    <Td className="text-[#4B5563]">
                      {row.totalDays} Day{row.totalDays === 1 ? "" : "s"}
                    </Td>
                    <Td>
                      <StatusBadge status={statusLabel(LEAVE_STATUS_LABELS, row.status)} />
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <button
                          aria-label="View leave"
                          onClick={() => onViewLeave(row)}
                          className="hover:text-[#3B5BDB]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {pending && (
                          <>
                            <button
                              aria-label="Approve"
                              disabled={decidingId === row.id}
                              onClick={() => decide(row, "approve")}
                              className="hover:text-emerald-600 disabled:opacity-40"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              aria-label="Reject"
                              disabled={decidingId === row.id}
                              onClick={() => decide(row, "reject")}
                              className="hover:text-rose-600 disabled:opacity-40"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                )
              })}

              {!loading && leaves.length === 0 ? (
                <tr>
                  <Td className="text-[#9CA3AF]">{error || "No leave requests on record."}</Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                  <Td> </Td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3">
          <span className="text-[12px] text-[#6B7280]">
            Showing {leaves.length} request{leaves.length === 1 ? "" : "s"}
          </span>
        </div>
      </SectionCard>
    </div>
  )
}
