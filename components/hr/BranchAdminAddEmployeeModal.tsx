"use client"

import { UserPlus, X, Info } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-[#2563EB]" />
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#111827]">
        {children}
      </h3>
    </div>
  )
}

export default function BranchAdminAddEmployeeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
            <UserPlus className="h-5 w-5" />
          </span>
          <h2 className="text-[20px] font-bold text-[#111827]">Add New Employee</h2>
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
      <div className="flex max-h-[68vh] flex-col gap-6 overflow-y-auto px-6 py-5">
        {/* Personal Details */}
        <section>
          <SectionHeading>Personal Details</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} placeholder="e.g. John Emmanuel Doe" />
            </div>
            <div>
              <label className={labelCls}>Job Title</label>
              <input className={inputCls} placeholder="e.g. Senior Administrator" />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input className={inputCls} placeholder="john.doe@ecclesia.org" />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input className={inputCls} placeholder="+234 000-000-0000" />
            </div>
            <div>
              <label className={labelCls}>Date Hired</label>
              <input type="date" className={inputCls} />
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section>
          <SectionHeading>Employment Details</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Branch</label>
              <input className={inputCls} defaultValue="Maryland LAG" />
            </div>
            <div>
              <label className={labelCls}>Basic Monthly Salary</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
                  ₦
                </span>
                <input
                  className="w-full rounded-md border border-[#E5E7EB] bg-white py-2.5 pl-7 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#2563EB]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-lg bg-[#EEF2FF] p-4 text-[#4B5563]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <p className="text-[12px] leading-relaxed">
            Saving this entry will automatically generate a ShepherdWatch ID and
            trigger a secure onboarding email to the provided address. Please
            ensure all legal names match government ID.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
        >
          Save &amp; Send Welcome Email
        </button>
      </div>
    </ModalShell>
  )
}
