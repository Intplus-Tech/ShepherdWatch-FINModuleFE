"use client"

import { X, Download, Printer, Lock, Minus, Plus, Maximize } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { StatusBadge, SectionLabel, btnDark, btnOutline } from "./shared"

export default function DocumentPreviewModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[#111827]">
            Document Preview: Employment Contract 2020
          </h2>
          <StatusBadge status="VERIFIED" />
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
      <div className="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-3">
        {/* Preview area */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#EEF1F6] bg-[#F9FAFB] p-6">
            <div className="mx-auto flex max-w-md flex-col gap-3 rounded-md bg-white p-6 shadow-sm">
              <div className="h-3 w-1/2 rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-full rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-full rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-4/5 rounded bg-[#EEF1F6]" />
              <div className="mt-2 h-2.5 w-full rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-full rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-2/3 rounded bg-[#EEF1F6]" />
              <div className="mt-2 h-2.5 w-3/4 rounded bg-[#EEF1F6]" />
              <div className="h-2.5 w-1/2 rounded bg-[#EEF1F6]" />
            </div>
          </div>
          {/* Zoom control bar */}
          <div className="mt-3 flex items-center justify-center gap-4 rounded-md border border-[#EEF1F6] bg-white py-2 text-[#4B5563]">
            <span className="text-[13px] font-semibold">100%</span>
            <button aria-label="Zoom out" className="hover:text-[#3B5BDB]">
              <Minus className="h-4 w-4" />
            </button>
            <button aria-label="Zoom in" className="hover:text-[#3B5BDB]">
              <Plus className="h-4 w-4" />
            </button>
            <button aria-label="Fullscreen" className="hover:text-[#3B5BDB]">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <SectionLabel>Document Details</SectionLabel>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Uploaded By
                </div>
                <div className="text-[13px] font-semibold text-[#111827]">
                  Rev. Victor Adeyemi
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Date Uploaded
                </div>
                <div className="text-[13px] font-semibold text-[#111827]">
                  Jan 02, 2020
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  File Size
                </div>
                <div className="text-[13px] font-semibold text-[#111827]">
                  1.2 MB
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Category
                </div>
                <div className="text-[13px] font-semibold text-[#111827]">
                  Employment Contract
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Verification Logs
            </div>
            <p className="mt-1 text-[12px] text-[#4B5563]">
              Verified by Administrative Council on Jan 05, 2020
            </p>
            <button className="mt-1 text-[12px] font-semibold text-[#3B5BDB] hover:underline">
              View History
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button className="text-left text-[13px] font-semibold text-[#3B5BDB] hover:underline">
              Share Access
            </button>
            <button className="text-left text-[13px] font-semibold text-rose-600 hover:underline">
              Flag Discrepancy
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
          <Lock className="h-3.5 w-3.5" />
          Document Locked
        </div>
        <div className="flex items-center gap-3">
          <button className={btnOutline}>
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button className={btnDark}>
            <Download className="h-4 w-4" />
            Download Document
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
