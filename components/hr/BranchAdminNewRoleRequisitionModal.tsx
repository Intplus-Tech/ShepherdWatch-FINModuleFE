"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

const labelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
const inputCls =
  "mt-1.5 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
const fieldCls = `${inputCls} h-[42px]`

const DEPARTMENTS = [
  "Select Department",
  "Youth Ministry",
  "Operations & Finance",
  "Facility Management",
  "Creative Arts",
  "Pastoral Care",
  "Administration",
]

const PRIORITY_LEVELS = ["Normal", "Urgent", "Critical"] as const
type Priority = (typeof PRIORITY_LEVELS)[number]

export default function BranchAdminNewRoleRequisitionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [priority, setPriority] = useState<Priority>("Normal")

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">New Role Requisition</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Submit a staffing request for approval by the Regional Director.
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
        {/* Role title */}
        <div>
          <label className={labelCls}>Role Title</label>
          <input
            type="text"
            placeholder="e.g. Associate Pastor for Community Outreach"
            className={fieldCls}
          />
        </div>

        {/* Department + Salary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Department</label>
            <select className={fieldCls} defaultValue="Select Department">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Salary Suggested</label>
            <input type="text" defaultValue="₦500,000" className={fieldCls} />
          </div>
        </div>

        {/* Priority + Expected start */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Priority Level</label>
            <div className="mt-2 flex flex-col gap-2">
              {PRIORITY_LEVELS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="radio"
                    name="priority-level"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="h-4 w-4 accent-[#2563EB]"
                  />
                  <span
                    className={cn(
                      "font-medium",
                      p === "Critical" ? "text-rose-600" : "text-[#111827]"
                    )}
                  >
                    {p}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Expected Start Date</label>
            <input type="date" className={fieldCls} />
          </div>
        </div>

        {/* Justification */}
        <div>
          <label className={labelCls}>Justification / Reason for Hire</label>
          <textarea
            rows={4}
            placeholder="Briefly describe the necessity for this role and its impact on the branch mission..."
            className={inputCls + " py-2.5"}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black"
        >
          Submit to Director
        </button>
      </div>
    </ModalShell>
  )
}
