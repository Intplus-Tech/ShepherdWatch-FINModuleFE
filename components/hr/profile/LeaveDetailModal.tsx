"use client"

import { Printer, FileText, Download, Eye, Check } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { StatusBadge, SectionLabel, btnOutline, btnDark } from "./shared"

const TIMELINE = [
  {
    title: "Final Approval",
    body: "Approved by Rev. Victor Adeyemi",
    time: "Dec 12, 2023 • 02:45 PM",
    note: "",
  },
  {
    title: "HR Review",
    body: "Cleared by Michael Scott",
    time: "Dec 10, 2023 • 10:15 AM",
    note: "Handover note verified with John Obi.",
  },
  {
    title: "Submitted",
    body: "By Dr. Sarah Jenkins",
    time: "Dec 08, 2023 • 09:00 AM",
    note: "",
  },
]

export default function LeaveDetailModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-[14px] font-bold text-white">
            SJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-[#111827]">
                Dr. Sarah Jenkins
              </span>
              <StatusBadge status="APPROVED" />
            </div>
            <div className="text-[12px] text-[#6B7280]">
              HR Department • Annual Leave
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={btnOutline}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
          <button className={btnDark} onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-5">
        {/* Left */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div>
            <SectionLabel>Request Details</SectionLabel>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Leave Type
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  Annual Leave
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Duration
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  10 Days
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Start
                </div>
                <div className="text-[14px] font-semibold text-[#111827]">
                  Dec 20, 2023
                </div>
              </div>
              <div className="text-[#9CA3AF]">&rarr;</div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  End
                </div>
                <div className="text-[14px] font-semibold text-[#111827]">
                  Dec 30, 2023
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Justification &amp; Handover</SectionLabel>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Reason for Leave
                </div>
                <div className="mt-1 text-[13px] text-[#4B5563]">
                  Family vacation and rest.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Handover Note
                </div>
                <div className="mt-1 text-[13px] text-[#4B5563]">
                  All pending HR audits have been delegated to John Obi.
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Attachments (2)</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#3B5BDB]" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      Flight_Itinerary_JENKINS.pdf
                    </div>
                    <div className="text-[12px] text-[#9CA3AF]">
                      1.2 MB · PDF
                    </div>
                  </div>
                </div>
                <button
                  aria-label="Download"
                  className="text-[#9CA3AF] hover:text-[#3B5BDB]"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#3B5BDB]" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      Vacation_Request_Form.jpg
                    </div>
                    <div className="text-[12px] text-[#9CA3AF]">
                      450 KB · JPG
                    </div>
                  </div>
                </div>
                <button
                  aria-label="View"
                  className="text-[#9CA3AF] hover:text-[#3B5BDB]"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <SectionLabel>Approval Workflow</SectionLabel>
          <ol className="relative flex flex-col gap-5 border-l border-[#EEF1F6] pl-5">
            {TIMELINE.map((t) => (
              <li key={t.title} className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <div className="text-[13px] font-bold text-[#111827]">
                  {t.title}
                </div>
                <div className="text-[12px] text-[#4B5563]">{t.body}</div>
                <div className="text-[11px] text-[#9CA3AF]">{t.time}</div>
                {t.note ? (
                  <div className="mt-1 rounded-md bg-[#F9FAFB] p-2 text-[12px] italic text-[#6B7280]">
                    {t.note}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="rounded-xl bg-[#111827] p-4 text-white">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Note to Director
            </div>
            <p className="mt-2 text-[13px] text-white/80">
              This request falls within the annual allocation. No overlap
              detected with other HR senior leadership during this window.
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
