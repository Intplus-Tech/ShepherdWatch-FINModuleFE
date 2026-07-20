"use client"

import { useState } from "react"
import { X, Search, CalendarClock } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { cn } from "@/lib/utils"

type StaffStatus = "Active" | "On Leave"

type StaffMember = {
  id: string
  name: string
  email: string
  role: string
  status: StaffStatus
}

const STAFF: StaffMember[] = [
  { id: "abigail", name: "Abigail Miller", email: "abigail.m@ecclesia.org", role: "Youth Coordinator", status: "Active" },
  { id: "benjamin", name: "Benjamin Jones", email: "benjamin.j@ecclesia.org", role: "Head Deacon", status: "Active" },
  { id: "catherine", name: "Catherine Hayes", email: "catherine.h@ecclesia.org", role: "Financial Admin", status: "On Leave" },
  { id: "david", name: "David Lawson", email: "david.l@ecclesia.org", role: "Music Director", status: "Active" },
  { id: "evelyn", name: "Evelyn Wright", email: "evelyn.w@ecclesia.org", role: "Outreach Lead", status: "Active" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function StatusPill({ status }: { status: StaffStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold",
        status === "Active"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status}
    </span>
  )
}

export default function BranchLeadRegisterStaffModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState("")

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const selectedCount = Object.values(selected).filter(Boolean).length

  const query = filter.trim().toLowerCase()
  const visible = STAFF.filter(
    (s) =>
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.role.toLowerCase().includes(query) ||
      s.status.toLowerCase().includes(query)
  )

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">
            Register Staff for Training
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Select staff members to enroll in the upcoming certification program.
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
      <div className="flex max-h-[62vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        {/* Active session card */}
        <div className="flex items-start gap-3 rounded-[12px] bg-[#111827] p-4 text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
              Active Session
            </p>
            <p className="mt-0.5 text-[15px] font-bold">
              Advanced Leadership & Financial Stewardship
            </p>
            <p className="mt-0.5 text-[12px] text-white/70">
              Oct 24, 2023 · 09:00 AM - 04:00 PM
            </p>
          </div>
        </div>

        {/* Select staff */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Select Staff Members
            </p>
            <span className="text-[11px] font-bold text-[#2563EB]">
              {selectedCount} Selected
            </span>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, role, or department..."
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none focus:border-[#3B5BDB]"
            />
          </div>

          <div className="mt-3 overflow-hidden rounded-[12px] border border-[#EEF1F6]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 bg-[#F9FAFB] px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Name
              </span>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Role
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Status
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {visible.map((staff) => (
                <label
                  key={staff.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[#FAFBFF]"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[staff.id]}
                    onChange={() => toggle(staff.id)}
                    className="h-4 w-4 shrink-0 rounded border-[#D1D5DB] accent-[#2563EB]"
                  />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#3B5BDB]">
                    {initials(staff.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">
                      {staff.name}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] truncate">{staff.email}</p>
                  </div>
                  <span className="w-[110px] shrink-0 text-[12px] text-[#6B7280]">
                    {staff.role}
                  </span>
                  <StatusPill status={staff.status} />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
        >
          Confirm Registration
        </button>
      </div>
    </ModalShell>
  )
}
