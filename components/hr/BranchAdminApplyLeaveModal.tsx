"use client"

import { X, User } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

export default function BranchAdminApplyLeaveModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
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
          <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
            Select Employee
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <select
              defaultValue=""
              className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            >
              <option value="" disabled>
                Search for a branch staff member...
              </option>
              <option value="sarah-jenkins">Dr. Sarah Jenkins</option>
              <option value="james-wilson">James Wilson</option>
              <option value="eleanor-vance">Eleanor Vance</option>
            </select>
          </div>
        </div>

        {/* Leave Type */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
            Leave Type
          </label>
          <select
            defaultValue="Vacation"
            className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
          >
            <option value="Vacation">Vacation</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Maternity">Maternity</option>
            <option value="Casual">Casual</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
              Start Date
            </label>
            <input
              type="date"
              className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
              End Date
            </label>
            <input
              type="date"
              className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Note / Reason */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#374151]">
            Note / Reason
          </label>
          <textarea
            rows={4}
            placeholder="e.g., Staff member called in sick at 8:00 AM. Medical certificate will be provided."
            className="w-full resize-none rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-[#2563EB] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700"
        >
          Submit Request for Approval
        </button>
      </div>
    </ModalShell>
  )
}
