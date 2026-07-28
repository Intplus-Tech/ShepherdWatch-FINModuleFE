"use client"

import { useState } from "react"
import {
  Search,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  BarChart3,
  CheckCircle2,
  Banknote,
  DoorOpen,
  type LucideIcon,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  value: string
  note?: string
  noteEmerald?: boolean
  icon: LucideIcon
  iconClass: string
}

const STATS: Stat[] = [
  {
    label: "Total Employees",
    value: "148",
    note: "↗ +2.4% vs last month",
    noteEmerald: true,
    icon: Building2,
    iconClass: "text-[#3B5BDB]",
  },
  {
    label: "Payroll (MTD)",
    value: "₦2.8M",
    note: "YTD: ₦33.5M",
    icon: CalendarDays,
    iconClass: "text-amber-500",
  },
  {
    label: "Active Loans",
    value: "21",
    icon: FileText,
    iconClass: "text-[#6B7280]",
  },
  {
    label: "Loan Balance",
    value: "₦1,800,000",
    icon: BarChart3,
    iconClass: "text-emerald-500",
  },
]

type ChartMonth = {
  month: string
  greenLabel: string
  greenHeight: string
  redLabel: string
  redHeight: string
}

const CHART_MONTHS: ChartMonth[] = [
  { month: "NOV", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
  { month: "DEC", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
  { month: "JAN", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
  { month: "FEB", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
  { month: "MAR", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
  { month: "APR", greenLabel: "₦2.8M", greenHeight: "h-40", redLabel: "₦500K", redHeight: "h-10" },
]

type RepaymentStatus = "ON TRACK" | "DUE SOON" | "OVERDUE"

type LoanCategory = {
  category: string
  active: number
  totalPrincipal: string
  status: RepaymentStatus
}

const LOAN_CATEGORIES: LoanCategory[] = [
  { category: "Personal Loans", active: 12, totalPrincipal: "₦8.5M", status: "ON TRACK" },
  { category: "Salary Advance", active: 8, totalPrincipal: "₦4.2M", status: "ON TRACK" },
  { category: "Vehicle Finance", active: 3, totalPrincipal: "₦5.0M", status: "DUE SOON" },
  { category: "Education Aid", active: 1, totalPrincipal: "₦500k", status: "OVERDUE" },
]

const STATUS_STYLES: Record<RepaymentStatus, string> = {
  "ON TRACK": "bg-emerald-100 text-emerald-700",
  "DUE SOON": "bg-amber-100 text-amber-700",
  OVERDUE: "bg-rose-100 text-rose-700",
}

type TimelineItem = {
  title: string
  time: string
  description?: string
  pill?: string
  icon: LucideIcon
  iconClass: string
}

const TIMELINE: TimelineItem[] = [
  {
    title: "Payroll Reconciled (Apr 2024)",
    time: "TODAY • 09:14 AM",
    description:
      "Validated disbursement for 148 branch employees. Total sum: ₦42,840,000.",
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Loan Approved: A. Okoro",
    time: "YESTERDAY • 04:30 PM",
    pill: "₦1,200,000 • Personal",
    icon: Banknote,
    iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
  },
  {
    title: "Exit Clearance Processing",
    time: "18 APR • 11:20 AM",
    description: "Final settlement calculation initiated for M. Ibrahim.",
    icon: DoorOpen,
    iconClass: "bg-amber-100 text-amber-600",
  },
]

export default function Page() {
  const [chartRange, setChartRange] = useState<"6 Months" | "1 Year">("6 Months")

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/dashboard" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
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

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative rounded-xl border border-[#EEF1F6] bg-white p-5"
              >
                <Icon
                  className={cn(
                    "absolute right-5 top-5 h-8 w-8 opacity-20",
                    stat.iconClass
                  )}
                />
                <div className="text-[12px] text-[#6B7280]">{stat.label}</div>
                <div className="mt-2 text-[24px] font-bold text-[#111827]">
                  {stat.value}
                </div>
                {stat.note && (
                  <div
                    className={cn(
                      "mt-1 text-[12px]",
                      stat.noteEmerald ? "text-emerald-600" : "text-[#6B7280]"
                    )}
                  >
                    {stat.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Workforce Cost Trend */}
        <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Workforce Cost Trend
            </h2>
            <div className="flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
              {(["6 Months", "1 Year"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors",
                    chartRange === range
                      ? "bg-[#EEF2FF] text-[#3B5BDB]"
                      : "text-[#6B7280]"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-8 flex items-end justify-between gap-4 sm:gap-8 overflow-x-auto">
            {CHART_MONTHS.map((m, i) => (
              <div key={`${m.month}-${i}`} className="flex flex-1 flex-col items-center gap-2 min-w-[48px]">
                <div className="flex items-end gap-2">
                  {/* Green bar */}
                  <div className="flex flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold text-emerald-600">
                      {m.greenLabel}
                    </span>
                    <div className={cn("w-6 rounded-t-md bg-emerald-500", m.greenHeight)} />
                  </div>
                  {/* Red bar */}
                  <div className="flex flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold text-red-500">
                      {m.redLabel}
                    </span>
                    <div className={cn("w-6 rounded-t-md bg-red-500", m.redHeight)} />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#6B7280]">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Loan Portfolio + Recent Actions */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: Loan Portfolio Health */}
          <div className="lg:col-span-2 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Loan Portfolio Health
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Category
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Active
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Total Principal
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Repayment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {LOAN_CATEGORIES.map((c) => (
                    <tr key={c.category}>
                      <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                        {c.category}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {c.active}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {c.totalPrincipal}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold",
                            STATUS_STYLES[c.status]
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Recent Financial Actions */}
          <div className="lg:col-span-1 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Recent Financial Actions
            </h2>
            <ol className="mt-5 space-y-6">
              {TIMELINE.map((item, i) => {
                const Icon = item.icon
                const isLast = i === TIMELINE.length - 1
                return (
                  <li key={item.title} className="relative flex gap-3">
                    {/* Connector line */}
                    {!isLast && (
                      <span className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-[#F3F4F6]" />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        item.iconClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-[#111827]">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {item.time}
                      </div>
                      {item.description && (
                        <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
                          {item.description}
                        </p>
                      )}
                      {item.pill && (
                        <span className="mt-2 inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold text-[#3B5BDB]">
                          {item.pill}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
