"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
const fieldCls = `${inputCls} h-[42px]`

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Half-Day"] as const
type Status = (typeof STATUS_OPTIONS)[number]

const ABSENCE_REASONS = ["Sick", "Personal", "Emergency", "Other"] as const

export default function BranchAdminAttendanceModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [status, setStatus] = useState<Status>("Present")

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Attendance</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Manually adjust or record staff attendance for compliance and payroll.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[68vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Select employee */}
        <div>
          <label className={labelCls}>Select Employee</label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search for a branch staff member..."
              className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Date + Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Select Date</label>
            <input type="date" defaultValue="2023-10-24" className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Attendance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={fieldCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional absence fields */}
        {status === "Absent" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Reason for Absence *</label>
              <select className={fieldCls} defaultValue="Other">
                {ABSENCE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Others *</label>
              <textarea rows={3} placeholder="Specify..." className={inputCls + " py-2.5"} />
            </div>
          </div>
        )}

        {/* Time details */}
        <div>
          <label className={labelCls}>Time Details (Optional)</label>
          <div className="mt-1.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Clock In
              </label>
              <input type="time" className={fieldCls} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Clock Out
              </label>
              <input type="time" className={fieldCls} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          CANCEL
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
        >
          SAVE Attendance
        </button>
      </div>
    </ModalShell>
  )
}
