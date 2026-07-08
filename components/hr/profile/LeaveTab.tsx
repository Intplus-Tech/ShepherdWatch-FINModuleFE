"use client"

import { SlidersHorizontal, Download, Eye, Check, X } from "lucide-react"
import { SectionCard, CardHeading, StatusBadge, Th, Td } from "./shared"

const RINGS = [
  { label: "Annual Leave", value: 18, sub: "Total entitlement: 25 days", tone: "#3B5BDB" },
  { label: "Sick Leave", value: 4, sub: "Total entitlement: 12 days", tone: "#F59E0B" },
  { label: "Maternity", value: 90, sub: "Special category eligibility", tone: "#10B981" },
  { label: "Compassionate", value: 3, sub: "Total entitlement: 5 days", tone: "#8B5CF6" },
]

const HISTORY = [
  {
    type: "Annual Leave",
    start: "Dec 20, 2023",
    end: "Dec 30, 2023",
    duration: "10 Days",
    status: "Approved",
  },
  {
    type: "Sick Leave",
    start: "Nov 05, 2023",
    end: "Nov 07, 2023",
    duration: "3 Days",
    status: "Approved",
  },
  {
    type: "Annual Leave",
    start: "Jan 15, 2024",
    end: "Jan 22, 2024",
    duration: "7 Days",
    status: "Pending",
  },
  {
    type: "Compassionate",
    start: "Oct 12, 2023",
    end: "Oct 14, 2023",
    duration: "2 Days",
    status: "Approved",
  },
  {
    type: "Sick Leave",
    start: "Aug 22, 2023",
    end: "Aug 23, 2023",
    duration: "1 Day",
    status: "Approved",
  },
]

function Ring({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: number
  sub: string
  tone: string
}) {
  return (
    <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
        {label}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-[13px] font-bold text-[#111827]"
          style={{ border: `4px solid ${tone}` }}
        >
          {value}
        </div>
        <div className="text-[12px] text-[#6B7280]">{sub}</div>
      </div>
      <div
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: tone }}
      >
        {value} Left
      </div>
    </div>
  )
}

export default function LeaveTab({ onViewLeave }: { onViewLeave: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Ring cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {RINGS.map((r) => (
          <Ring key={r.label} {...r} />
        ))}
      </div>

      {/* Leave History */}
      <SectionCard className="p-0">
        <div className="flex items-center justify-between px-5 py-4">
          <CardHeading>Leave History</CardHeading>
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <button aria-label="Filter" className="hover:text-[#3B5BDB]">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button aria-label="Download" className="hover:text-[#3B5BDB]">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-[#EEF1F6]">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <Th>Leave Type</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6]">
              {HISTORY.map((row, i) => (
                <tr key={i}>
                  <Td className="font-semibold text-[#111827]">{row.type}</Td>
                  <Td className="text-[#4B5563]">{row.start}</Td>
                  <Td className="text-[#4B5563]">{row.end}</Td>
                  <Td className="text-[#4B5563]">{row.duration}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <button
                        aria-label="View leave"
                        onClick={onViewLeave}
                        className="hover:text-[#3B5BDB]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {row.status === "Pending" && (
                        <>
                          <button
                            aria-label="Approve"
                            className="hover:text-emerald-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Reject"
                            className="hover:text-rose-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-5 py-3">
          <span className="text-[12px] text-[#6B7280]">
            Showing 5 of 12 requests
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
              Previous
            </button>
            <button className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
              Next
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
