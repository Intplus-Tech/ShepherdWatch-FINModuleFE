"use client"

import { useRouter } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  ChevronLeft,
  UserPlus,
  Info,
  Laptop,
  KeyRound,
  IdCard,
  ArrowRight,
} from "lucide-react"

type Attendance = {
  date: string
  clockIn: string
  clockOut: string
  status: "On Time" | "Late"
}

const ATTENDANCE: Attendance[] = [
  { date: "Oct 24, 2023", clockIn: "08:02 AM", clockOut: "05:15 PM", status: "On Time" },
  { date: "Oct 23, 2023", clockIn: "08:15 AM", clockOut: "05:30 PM", status: "Late" },
  { date: "Oct 20, 2023", clockIn: "07:58 AM", clockOut: "05:10 PM", status: "On Time" },
  { date: "Oct 19, 2023", clockIn: "08:01 AM", clockOut: "05:20 PM", status: "On Time" },
  { date: "Oct 18, 2023", clockIn: "07:55 AM", clockOut: "05:12 PM", status: "On Time" },
  { date: "Oct 17, 2023", clockIn: "08:04 AM", clockOut: "05:18 PM", status: "On Time" },
  { date: "Oct 16, 2023", clockIn: "07:59 AM", clockOut: "05:22 PM", status: "On Time" },
  { date: "Oct 13, 2023", clockIn: "08:03 AM", clockOut: "05:14 PM", status: "On Time" },
]

const CORE_DETAILS = [
  { label: "Date Hired", value: "March 12, 2018" },
  { label: "Work Email", value: "s.jenkins@shepherdwatch.org" },
  { label: "Phone Number", value: "+234 (0) 802 555 0192" },
  { label: "Branch Assignment", value: "Maryland LAG" },
]

const ASSETS = [
  { icon: Laptop, name: "MacBook Pro", meta: "S/N: 8821-M3P" },
  { icon: KeyRound, name: "Security Keycard", meta: "Access: Level 3 (Admin)" },
  { icon: IdCard, name: "Corporate ID Card", meta: "Expiry: Dec 2025" },
]

const TRAINING = [
  { name: "Leadership in Ministry", meta: "Scheduled: Dec 12, 2024", tone: "text-amber-600" },
  { name: "Data Privacy Compliance", meta: "Completed: Jan 05, 2025", tone: "text-emerald-600" },
]

const LEAVE = [
  { label: "Vacation Leave", used: 5, total: 12, color: "bg-[#2563EB]" },
  { label: "Sick Leave", used: 4, total: 5, color: "bg-amber-500" },
  { label: "Maternity / Parental", used: 4, total: 5, color: "bg-violet-500" },
]

const CARD =
  "rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

export default function Page() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px]"
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Top actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-rose-700">
              <UserPlus className="h-4 w-4" />
              Initiate Onboarding
            </button>
          </div>

          {/* Header card */}
          <div className={cn(CARD, "mt-5 p-6")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[20px] font-bold text-[#2563EB]">
                SJ
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[26px] font-bold text-[#111827]">
                    Dr. Sarah Jenkins
                  </h1>
                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB]">
                    ID: EL-1024
                  </span>
                </div>
                <p className="mt-1 text-[14px] text-[#6B7280]">
                  Executive Pastor • Medical Services
                </p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* Core Details */}
              <div className={cn(CARD, "p-5")}>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#2563EB]" />
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Core Details
                  </h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CORE_DETAILS.map((d) => (
                    <div key={d.label}>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        {d.label}
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance History */}
              <div className={cn(CARD, "overflow-hidden")}>
                <div className="flex items-center justify-between p-5">
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Attendance History
                  </h2>
                  <button className="text-[13px] font-semibold text-[#2563EB]">
                    View Full Log
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                      <tr className="bg-[#EFF2FF]">
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Clock In
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Clock Out
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {ATTENDANCE.map((a, i) => (
                        <tr key={i} className="hover:bg-[#F9FAFB]">
                          <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                            {a.date}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {a.clockIn}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {a.clockOut}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                a.status === "On Time"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Active Loans */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Active Loans
                </h2>
                <div className="mt-2 text-[24px] font-bold text-[#111827]">
                  ₦250,000.00
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Outstanding Balance
                </div>
                <button className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB]">
                  View All Loan Schedules
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Assigned Assets */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Assigned Assets
                </h2>
                <div className="mt-4 space-y-3">
                  {ASSETS.map((asset) => {
                    const Icon = asset.icon
                    return (
                      <div key={asset.name} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#111827]">
                            {asset.name}
                          </div>
                          <div className="text-[12px] text-[#9CA3AF]">
                            {asset.meta}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Training */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Recent Training
                </h2>
                <div className="mt-4 space-y-3">
                  {TRAINING.map((t) => (
                    <div key={t.name}>
                      <div className="text-[13px] font-semibold text-[#111827]">
                        {t.name}
                      </div>
                      <div className={cn("text-[12px] font-medium", t.tone)}>
                        {t.meta}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">Leave</h2>
                <div className="mt-4 space-y-4">
                  {LEAVE.map((l) => (
                    <div key={l.label}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-[#111827]">
                          {l.label}
                        </span>
                        <span className="text-[#6B7280]">
                          {l.used} / {l.total} Days
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-[#EEF1F6]">
                        <div
                          className={cn("h-2 rounded-full", l.color)}
                          style={{ width: `${(l.used / l.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
