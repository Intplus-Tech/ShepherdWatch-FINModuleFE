"use client"

import { X, CheckCircle2, Info } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

export default function BranchLeadLeaveApprovalModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            Leave Final Approval
          </h2>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Approval Authorization
          </div>
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
      <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-5">
        {/* LEFT — identity */}
        <div className="lg:col-span-3">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[16px] font-bold text-white">
                SM
              </div>
              <div className="min-w-0">
                <div className="text-[16px] font-bold text-[#111827]">
                  Sarah Musa
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Children&apos;s Ministry Department
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Request ID #LR-2023-094
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#4B5563]">
                    PERMANENT STAFF
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    ACTIVE STATUS
                  </span>
                </div>
              </div>
            </div>

            {/* Three specs */}
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#F3F4F6] pt-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Leave Type
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  Vacation
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Duration
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  Oct 28 - 31, 2023
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Total Days
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  4 Working Days
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mt-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Reason for Leave
              </div>
              <div className="mt-2 rounded-[10px] bg-[#F9FAFB] p-4 text-[13px] italic leading-relaxed text-[#4B5563]">
                &ldquo;I would like to request my annual vacation leave to attend a
                family reunion and rest before the upcoming Christmas program
                cycle. I have updated all my curriculum notes for the next four
                weeks.&rdquo;
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — balances + availability */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Leave Balance */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="text-[16px] font-bold text-[#111827]">
              Leave Balance
            </div>

            <div className="mt-4 space-y-4">
              <BalanceBar
                label="Annual Vacation"
                value="12 / 20 Days Left"
                pct={60}
                barClass="bg-[#2563EB]"
              />
              <BalanceBar
                label="Sick Leave"
                value="5 / 7 Days Left"
                pct={71}
                barClass="bg-amber-500"
              />
            </div>
          </div>

          {/* Dept. Availability */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="text-[16px] font-bold text-[#111827]">
              Dept. Availability
            </div>
            <div className="mt-2 text-[12px] text-[#6B7280]">
              Conflict check for Oct 28 - Oct 31:
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-[10px] bg-emerald-50 px-3 py-2.5 text-[12px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                No overlapping leave requests
              </div>
              <div className="flex items-center gap-2 rounded-[10px] bg-[#EFF6FF] px-3 py-2.5 text-[12px] font-semibold text-[#2563EB]">
                <Info className="h-4 w-4 shrink-0" />
                9/10 staff available in Children&apos;s Min.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-rose-200 px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
        >
          Decline Request
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
        >
          Approve Leave Request
        </button>
      </div>
    </ModalShell>
  )
}

function BalanceBar({
  label,
  value,
  pct,
  barClass,
}: {
  label: string
  value: string
  pct: number
  barClass: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
          {label}
        </span>
        <span className="text-[12px] font-semibold text-[#111827]">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#F3F4F6]">
        <div
          className={cn("h-2 rounded-full", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
