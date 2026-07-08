"use client"

import { X, UploadCloud, FileText } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, btnOutline, btnDark } from "./shared"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

export default function UploadDocumentModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
            <UploadCloud className="h-4 w-4" />
          </span>
          <h2 className="text-[16px] font-bold text-[#111827]">
            Upload New Document
          </h2>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Dropzone */}
        <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center">
          <FileText className="h-9 w-9 text-[#9CA3AF]" />
          <div className="mt-3 text-[14px] font-semibold text-[#111827]">
            Drag and drop your file here
          </div>
          <div className="text-[12px] text-[#6B7280]">
            or click to browse from your computer
          </div>
          <button className={`${btnDark} mt-4`}>Browse Files</button>
          <div className="mt-3 text-[11px] text-[#9CA3AF]">
            PDF, JPG, PNG · Up to 10MB
          </div>
        </div>

        {/* Details */}
        <div>
          <SectionLabel>Document Details</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Document Type</label>
              <select className={inputCls}>
                <option>Employment Contract</option>
                <option>Educational Certificate</option>
                <option>Identification & KYC</option>
                <option>Professional Certification</option>
                <option>Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Document Title</label>
              <input
                className={inputCls}
                placeholder="e.g. Contract_Amendment_2024"
              />
            </div>
            <div>
              <label className={labelCls}>Effective Date</label>
              <input type="date" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Expiry Date (Optional)</label>
              <input type="date" className={inputCls} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose}>
          Cancel
        </button>
        <button className={btnDark}>Upload Document</button>
      </div>
    </ModalShell>
  )
}
