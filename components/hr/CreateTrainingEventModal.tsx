"use client"

import { useState } from "react"
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

const LOCATION_TYPES = ["Physical", "Virtual", "Hybrid"] as const
type LocationType = (typeof LOCATION_TYPES)[number]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-[#3B5BDB]" />
      <h3 className="text-[15px] font-bold text-[#111827]">{children}</h3>
    </div>
  )
}

export default function CreateTrainingEventModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [locationType, setLocationType] = useState<LocationType>("Physical")

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[20px] font-bold text-[#111827]">
            Create New Training Event
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Fill in the details to schedule a new ecclesiastical development
            session.
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
      <div className="flex max-h-[68vh] flex-col gap-6 overflow-y-auto px-6 py-5">
        {/* Training Details */}
        <section>
          <SectionHeading>Training Details</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Name of Training</label>
              <input
                className={inputCls}
                placeholder="e.g. Leadership Excellence Seminar"
              />
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <select className={inputCls} defaultValue="All Branches">
                <option>All Branches</option>
                <option>Lagos Region</option>
                <option>Ibadan Region</option>
                <option>Virtual / Global</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Location Type</label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg bg-[#F8FAFC] p-1">
                {LOCATION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocationType(type)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      locationType === type
                        ? "bg-[#111827] text-white"
                        : "text-[#6B7280] hover:bg-gray-100"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Location / Link</label>
              <input className={inputCls} placeholder="Venue or Meeting Link" />
            </div>

            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Trainer Name</label>
              <input
                className={inputCls}
                placeholder="Name of Lead Instructor"
              />
            </div>
            <div>
              <label className={labelCls}>Trainer Type</label>
              <select className={inputCls} defaultValue="Internal">
                <option>Internal</option>
                <option>External</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Max Capacity</label>
              <input className={inputCls} placeholder="50" />
            </div>
          </div>
        </section>

        {/* Attachments */}
        <section>
          <SectionHeading>Attachments</SectionHeading>
          <div className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
            <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
            <div className="mt-3 text-[14px] font-semibold text-[#111827]">
              Drag &amp; drop training proposals or browse files
            </div>
            <div className="text-[12px] text-[#6B7280]">
              PDF, DOCX up to 10MB
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-md border border-[#EEF1F6] bg-white px-3 py-2.5 text-[12px]">
            <FileText className="h-4 w-4 shrink-0 text-[#3B5BDB]" />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-[#111827]">
                training_proposal.pdf
              </span>
              <span className="text-[#9CA3AF]"> · 1.2 MB • Uploaded just now</span>
            </div>
            <button
              type="button"
              aria-label="Remove training_proposal.pdf"
              className="text-[#9CA3AF] hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Budget & Approval */}
        <section>
          <SectionHeading>Budget &amp; Approval</SectionHeading>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <div className="text-[13px] font-bold text-rose-700">
                Budget Cap Warning
              </div>
              <div className="mt-1 text-[12px] font-semibold text-rose-700">
                Remaining Training Budget (YTD): ₦180,000 &nbsp;&nbsp; Deficit:
                ₦70,000
              </div>
              <p className="mt-1 text-[12px] text-rose-600">
                This event exceeds the remaining budget by ₦70,000.
                Justification required for higher-level review.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Total Budget Requested</label>
              <input className={inputCls} defaultValue="₦ 250,000" />
            </div>
            <div>
              <label className={labelCls}>
                Justification for Budget Request
              </label>
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Explain the value proposition and why this exceeds standard allocation..."
              />
            </div>
          </div>
        </section>
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
          CREATE &amp; SUBMIT FOR APPROVAL
        </button>
      </div>
    </ModalShell>
  )
}
