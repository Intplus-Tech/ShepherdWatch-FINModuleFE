"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Bell,
  ChevronLeft,
  Check,
  X as XIcon,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"

type ScheduleStatus = "Paid" | "UPCOMING"

type ScheduleRow = {
  id: string
  date: string
  installment: string
  amount: string
  status: ScheduleStatus
  reference: "muted" | "actions"
}

const SCHEDULE: ScheduleRow[] = [
  {
    id: "s1",
    date: "Oct 28, 2024",
    installment: "#09 of 17",
    amount: "₦150,000",
    status: "Paid",
    reference: "muted",
  },
  {
    id: "s2",
    date: "Sep 28, 2024",
    installment: "#08 of 17",
    amount: "₦150,000",
    status: "Paid",
    reference: "muted",
  },
  {
    id: "s3",
    date: "Nov 28, 2024",
    installment: "#10 of 17",
    amount: "₦150,000",
    status: "UPCOMING",
    reference: "actions",
  },
  {
    id: "s4",
    date: "Sep 28, 2024",
    installment: "#11 of 17",
    amount: "₦150,000",
    status: "UPCOMING",
    reference: "actions",
  },
  {
    id: "s5",
    date: "Nov 28, 2024",
    installment: "#10 of 17",
    amount: "₦150,000",
    status: "UPCOMING",
    reference: "actions",
  },
]

type PastLoan = {
  id: string
  title: string
  outcome: string
  amount: string
  date?: string
  approved: boolean
}

const PAST_LOANS: PastLoan[] = [
  {
    id: "p1",
    title: "Car Loan",
    outcome: "Approved by Pastor Caleb",
    amount: "₦2,500,000",
    date: "Oct 12, 2023",
    approved: true,
  },
  {
    id: "p2",
    title: "House Rent",
    outcome: "Rejected by Pastor Caleb",
    amount: "₦2,500,000",
    approved: false,
  },
  {
    id: "p3",
    title: "Car Loan",
    outcome: "Approved by Pastor Caleb",
    amount: "₦2,500,000",
    date: "Oct 12, 2023",
    approved: true,
  },
]

function ScheduleBadge({ status }: { status: ScheduleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        status === "Paid"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status}
    </span>
  )
}

function StatCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-[#EEF1F6] bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </div>
      <div
        className={cn("mt-2 text-[20px] font-bold text-[#111827]", valueClass)}
      >
        {value}
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/employee-loans"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        {/* Header */}
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
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
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Header card */}
          <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[14px] font-bold text-[#2563EB]">
                  JA
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px] font-bold text-[#111827]">
                      John Adeyemi
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] text-[#6B7280]">
                    ID: EMP-00219 • Lead Pastor
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="rounded-md bg-rose-600 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-rose-700"
              >
                Withdraw Request
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Loan Amount" value="₦2,500,000" />
            <StatCard
              label="Amount Repaid"
              value="₦1,300,000"
              valueClass="text-emerald-600"
            />
            <StatCard
              label="Outstanding"
              value="₦1,200,000"
              valueClass="text-rose-600"
            />
            <StatCard label="Monthly Deduction" value="₦150,000" />
          </div>

          {/* Two-column row */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT: Repayment Schedule */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white lg:col-span-2">
              <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-5 py-4">
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Repayment Schedule
                </h2>
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#2563EB] hover:underline"
                >
                  New Payment
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#EEF2FF]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Installment
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {SCHEDULE.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-5 text-[13px] text-[#111827]">
                          {row.date}
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                          {row.installment}
                        </td>
                        <td className="px-4 py-5 text-[13px] font-semibold text-[#111827]">
                          {row.amount}
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <ScheduleBadge status={row.status} />
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          {row.reference === "muted" ? (
                            <span className="text-[#9CA3AF]">Paid | Missed</span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                className="font-semibold text-emerald-600 hover:underline"
                              >
                                Paid
                              </button>
                              <span className="text-[#D1D5DB]">|</span>
                              <button
                                type="button"
                                className="font-semibold text-rose-600 hover:underline"
                              >
                                Missed
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#F3F4F6] px-5 py-4">
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#2563EB] hover:underline"
                >
                  View Full History
                </button>
              </div>
            </div>

            {/* RIGHT: On-going + Past loans */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* On-going Loan */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[16px] font-bold text-[#111827]">
                  On-going Loan
                </h3>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Purpose
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    Housing (Staff Mortgage Support)
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Amount
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                      ₦2,500,000
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Approved Date
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                      Apr 2025
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Loan */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[16px] font-bold text-[#111827]">Past Loan</h3>

                <ol className="mt-4 space-y-5">
                  {PAST_LOANS.map((loan) => (
                    <li key={loan.id} className="flex gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          loan.approved
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        )}
                      >
                        {loan.approved ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <XIcon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-[#111827]">
                          {loan.title}
                        </div>
                        <div className="text-[12px] text-[#6B7280]">
                          {loan.outcome}
                        </div>
                        <div className="mt-1 text-[12px] text-[#4B5563]">
                          Amount: {loan.amount}
                        </div>
                        {loan.date && (
                          <div className="text-[12px] text-[#9CA3AF]">
                            Approved date • {loan.date}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
