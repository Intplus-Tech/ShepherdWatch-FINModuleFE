"use client"

import { X, Printer, FileText, Check, Clock, Circle } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { StatusBadge, SectionLabel, btnDark, btnRoseOutline } from "./shared"

const WORKFLOW = [
  {
    role: "Department Head",
    name: "Pastor Ezekiel Ojo",
    status: "VERIFIED",
    time: "Oct 13",
    state: "done",
  },
  {
    role: "HR Manager",
    name: "Deacon Moses Ade",
    status: "CURRENTLY REVIEWING",
    time: "",
    state: "active",
  },
  {
    role: "Finance Director",
    name: "Rev. Victor Adeyemi",
    status: "UPCOMING",
    time: "",
    state: "todo",
  },
]

export default function LoanApplicationDetailModal({
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
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">
            Loan Application Detail
          </h2>
          <div className="text-[12px] text-[#6B7280]">
            Application ID: #LN-2023-0892 · Submitted on Oct 12, 2023
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3B5BDB] hover:underline">
            <Printer className="h-4 w-4" />
            Print Application Summary
          </button>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-5">
        {/* Left */}
        <div className="flex flex-col gap-5 lg:col-span-3">
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[16px] font-bold text-[#111827]">
                Medical Emergency Grant
              </div>
              <StatusBadge status="PENDING APPROVAL" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Loan Amount
                </div>
                <div className="mt-1 text-[16px] font-bold text-[#111827]">
                  ₦350,000
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Applicant
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  Deaconess Sarah Peters
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Role
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#111827]">
                  Senior Welfare Officer
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Purpose of Loan</SectionLabel>
            <p className="mt-2 text-[13px] text-[#4B5563]">
              Application for urgent surgical procedure funding for immediate
              family member. The procedure is scheduled for next month and
              requires a significant down payment as per the hospital&rsquo;s
              policy.
            </p>
            <blockquote className="mt-3 border-l-2 border-[#3B5BDB] bg-[#F9FAFB] p-3 text-[13px] italic text-[#6B7280]">
              &ldquo;Requesting support for my mother&rsquo;s cardiac
              intervention. Documentation from General Hospital Lagos is attached
              below.&rdquo;
            </blockquote>
          </div>

          <div>
            <SectionLabel>Repayment Terms</SectionLabel>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Monthly Deduction
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  ₦35,000
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Duration
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  10 Months
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Start Date
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  Nov 2023
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  End Date
                </div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                  Aug 2024
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Supporting Documents (2 Files Uploaded)</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { name: "Hospital_Admission_Inv", meta: "Oct 12 · 1.2 MB" },
                { name: "Welfare_Recommendation", meta: "Oct 12 · 890 KB" },
              ].map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3"
                >
                  <FileText className="h-5 w-5 text-[#3B5BDB]" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {f.name}
                    </div>
                    <div className="text-[12px] text-[#9CA3AF]">{f.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div>
            <SectionLabel>Approval Workflow</SectionLabel>
            <ol className="mt-3 flex flex-col gap-4">
              {WORKFLOW.map((w) => (
                <li key={w.role} className="flex items-start gap-3">
                  <span
                    className={
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                      (w.state === "done"
                        ? "bg-emerald-500 text-white"
                        : w.state === "active"
                          ? "bg-amber-500 text-white"
                          : "bg-[#EEF1F6] text-[#9CA3AF]")
                    }
                  >
                    {w.state === "done" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : w.state === "active" ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      {w.role}
                    </div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {w.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={w.status} />
                      {w.time ? (
                        <span className="text-[11px] text-[#9CA3AF]">
                          {w.time}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-[#111827] p-4 text-white">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Administrative Actions
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button className="rounded-md bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-white hover:bg-emerald-600">
                Approve Application
              </button>
              <button className={btnRoseOutline + " bg-transparent"}>
                Reject Application
              </button>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-white/60">
                Internal Note (Optional)
              </div>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-white/40"
                placeholder="Add an internal note..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnDark} onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  )
}
