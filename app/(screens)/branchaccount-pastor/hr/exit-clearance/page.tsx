"use client"

import { useState } from "react"
import { Search, Bell, Info } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

type Personnel = {
  id: string
  name: string
  role: string
  unit: string
  initials: string
  avatarColor: string
  exitDate: string
  employeeId: string
  loanBalance: string
  unreturnedAssets: string
  assetCount: string
}

const PERSONNEL: Personnel[] = [
  {
    id: "jane-smith",
    name: "Jane Smith",
    role: "Senior Administrator",
    unit: "Global Missions Unit",
    initials: "JS",
    avatarColor: "bg-[#EEF2FF] text-[#3B5BDB]",
    exitDate: "Dec 15, 2024",
    employeeId: "EL-8802",
    loanBalance: "₦45,000.00",
    unreturnedAssets: "MacBook Pro (S/N:4492)",
    assetCount: "1 Item",
  },
  {
    id: "john-doe",
    name: "John Doe",
    role: "Operations Lead",
    unit: "Operations Unit",
    initials: "JD",
    avatarColor: "bg-emerald-50 text-emerald-600",
    exitDate: "Jan 05, 2025",
    employeeId: "EL-8815",
    loanBalance: "₦120,000.00",
    unreturnedAssets: "iPhone 14 (S/N:7781)",
    assetCount: "1 Item",
  },
  {
    id: "robert-brown",
    name: "Robert Brown",
    role: "Logistics Manager",
    unit: "Logistics Unit",
    initials: "RB",
    avatarColor: "bg-amber-50 text-amber-600",
    exitDate: "Jan 12, 2025",
    employeeId: "EL-8827",
    loanBalance: "₦72,500.00",
    unreturnedAssets: "Toyota Hilux Keys (S/N:1120)",
    assetCount: "1 Item",
  },
]

function AwaitingReviewPill() {
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
      AWAITING REVIEW
    </span>
  )
}

export default function Page() {
  const [selectedId, setSelectedId] = useState<string>("jane-smith")

  const selected =
    PERSONNEL.find((p) => p.id === selectedId) ?? PERSONNEL[0]

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/exit-clearance" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* LEFT: Pending Clearances */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="border-b border-[#EEF1F6] p-5">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Pending Clearances
              </h2>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                3 personnel awaiting financial sign-off
              </p>
            </div>

            <div className="p-3">
              {PERSONNEL.map((p) => {
                const isSelected = p.id === selectedId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "mb-2 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors last:mb-0",
                      isSelected ? "bg-[#EEF2FF]" : "hover:bg-[#F8FAFC]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                        p.avatarColor
                      )}
                    >
                      {p.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-bold text-[#111827]">
                        {p.name}
                      </div>
                      <div className="text-[12px] text-[#6B7280]">{p.role}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <AwaitingReviewPill />
                      </div>
                      <div className="mt-2 text-[11px] text-[#9CA3AF]">
                        Exit: {p.exitDate}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Detail */}
          <div className="flex flex-col gap-5">
            {/* Profile card */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <div className="flex items-center gap-5">
                <span
                  className={cn(
                    "flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[26px] font-bold",
                    selected.avatarColor
                  )}
                >
                  {selected.initials}
                </span>
                <div className="min-w-0">
                  <h1 className="text-[32px] font-bold text-[#111827] leading-tight">
                    {selected.name}
                  </h1>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    {selected.role} | {selected.unit}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                      📅 Exit Date: {selected.exitDate}
                    </span>
                    <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#4B5563]">
                      🪪 ID: {selected.employeeId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT: Outstanding liabilities */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Outstanding Liabilities
                </h3>

                {/* Loan balance */}
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <div className="text-[12px] font-semibold text-[#6B7280]">
                    Loan Balance
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-rose-600">
                    {selected.loanBalance}
                  </div>
                </div>

                {/* Unreturned assets */}
                <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[12px] font-semibold text-[#6B7280]">
                      Unreturned Assets
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                      {selected.assetCount}
                    </span>
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-rose-600">
                    {selected.unreturnedAssets}
                  </div>
                </div>

                {/* Info note */}
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EEF2FF] p-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5BDB]" />
                  <p className="text-[12px] italic text-[#4B5563]">
                    Sign-off is restricted until asset recovery is confirmed by
                    the IT and Asset Management departments.
                  </p>
                </div>
              </div>

              {/* RIGHT: Decision note */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[16px] font-bold text-[#111827]">
                  Add Decision Note / Reason for Hold
                </h3>
                <textarea
                  rows={6}
                  placeholder="Enter reason for hold or additional clearance notes..."
                  className="mt-4 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[13px] outline-none"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-md bg-[#9CA3AF] px-5 py-2.5 text-[13px] font-semibold text-white"
                  >
                    Approve Clearance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
