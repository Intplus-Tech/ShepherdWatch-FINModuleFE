"use client"

import { useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  Search,
  UserPlus,
  Download,
  Users,
  UserCheck,
  UserMinus,
  TrendingDown,
  Wallet,
  CalendarCheck,
} from "lucide-react"

type StatCard = {
  label: string
  value: string
  note: string
  tone: "blue" | "red" | "grey"
  icon: React.ComponentType<{ className?: string }>
  iconTone: "blue" | "grey"
}

type BranchHeadcount = {
  name: string
  count: number
}

type ActivityAction = "NEW HIRE" | "RESIGNATION" | "CONTRACT END"

type Activity = {
  name: string
  action: ActivityAction
  branch: string
  date: string
}

const STAT_CARDS: StatCard[] = [
  {
    label: "Total Headcount",
    value: "524",
    note: "+2% vs last mo",
    tone: "blue",
    icon: Users,
    iconTone: "blue",
  },
  {
    label: "New Hires (MDT)",
    value: "12",
    note: "Month-to-Date",
    tone: "grey",
    icon: UserCheck,
    iconTone: "blue",
  },
  {
    label: "Exits (MDT)",
    value: "4",
    note: "Alert: High in West",
    tone: "red",
    icon: UserMinus,
    iconTone: "grey",
  },
  {
    label: "Turnover Rate",
    value: "6.2%",
    note: "Sustainable",
    tone: "grey",
    icon: TrendingDown,
    iconTone: "grey",
  },
  {
    label: "Total Payroll Cost",
    value: "₦38.5M",
    note: "Real-time Est.",
    tone: "grey",
    icon: Wallet,
    iconTone: "blue",
  },
  {
    label: "Attendance Rate",
    value: "94%",
    note: "",
    tone: "grey",
    icon: CalendarCheck,
    iconTone: "blue",
  },
]

const BRANCH_HEADCOUNT: BranchHeadcount[] = [
  { name: "Lagos Main", count: 214 },
  { name: "HQ", count: 142 },
  { name: "Port Harcourt", count: 98 },
  { name: "Kano Branch", count: 45 },
  { name: "Enugu Branch", count: 25 },
]

const RECENT_ACTIVITY: Activity[] = [
  { name: "Chiamaka Okafor", action: "NEW HIRE", branch: "Lagos Main", date: "Oct 24, 2023" },
  { name: "Babajide Sanwo", action: "NEW HIRE", branch: "Abuja HQ", date: "Oct 22, 2023" },
  { name: "Ibrahim Yusuf", action: "RESIGNATION", branch: "Kano South", date: "Oct 21, 2023" },
  { name: "Emeka Daniel", action: "NEW HIRE", branch: "Port Harcourt", date: "Oct 20, 2023" },
  { name: "Sarah Philips", action: "NEW HIRE", branch: "Lagos Main", date: "Oct 19, 2023" },
  { name: "Victor Onyekachi", action: "CONTRACT END", branch: "Enugu East", date: "Oct 18, 2023" },
]

const NOTE_TONE: Record<StatCard["tone"], string> = {
  blue: "text-[#3B5BDB]",
  red: "text-[#EF4444]",
  grey: "text-[#9CA3AF]",
}

const ICON_TONE: Record<StatCard["iconTone"], string> = {
  blue: "bg-[#EEF2FF] text-[#3B5BDB]",
  grey: "bg-[#F3F4F6] text-[#6B7280]",
}

const ACTION_BADGE: Record<ActivityAction, string> = {
  "NEW HIRE": "bg-blue-100 text-blue-700",
  RESIGNATION: "bg-rose-100 text-rose-700",
  "CONTRACT END": "bg-rose-100 text-rose-700",
}

export default function Page() {
  const [search, setSearch] = useState("")

  const maxCount = useMemo(
    () => Math.max(...BRANCH_HEADCOUNT.map((b) => b.count)),
    []
  )

  const filteredActivity = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return RECENT_ACTIVITY
    return RECENT_ACTIVITY.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.branch.toLowerCase().includes(term) ||
        row.action.toLowerCase().includes(term)
    )
  }, [search])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/dashboard"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                HR Executive Dashboard
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Global Workforce Overview • 142 Branches
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees, IDs..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] sm:w-[260px]"
                />
              </div>
              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#6B7280]">{card.label}</p>
                      <p className="text-[26px] font-bold text-[#111827] tracking-tight mt-2">
                        {card.value}
                      </p>
                    </div>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_TONE[card.iconTone]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  {card.note ? (
                    <p className={`text-[11px] font-semibold mt-2 ${NOTE_TONE[card.tone]}`}>
                      {card.note}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Headcount by Branch */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white p-6">
              <h2 className="text-[16px] font-bold text-[#111827]">Headcount by Branch</h2>
              <div className="mt-5 flex flex-col gap-4">
                {BRANCH_HEADCOUNT.map((branch) => {
                  const pct = Math.round((branch.count / maxCount) * 100)
                  const isSmall = branch.count < 50
                  return (
                    <div key={branch.name} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-[#111827]">
                          {branch.name}
                        </span>
                        <span className="text-[13px] font-bold text-[#111827]">
                          {branch.count}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                        <div
                          className={`h-full rounded-full ${isSmall ? "bg-[#93A5F0]" : "bg-[#3B5BDB]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent HR Activity */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white">
              <div className="p-6 pb-4">
                <h2 className="text-[16px] font-bold text-[#111827]">Recent HR Activity</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Employee Name
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Action
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Effective Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {filteredActivity.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]"
                        >
                          No matching activity.
                        </td>
                      </tr>
                    ) : (
                      filteredActivity.map((row) => (
                        <tr key={row.name}>
                          <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-[13px]">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${ACTION_BADGE[row.action]}`}
                            >
                              {row.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">{row.branch}</td>
                          <td className="px-4 py-3 text-[13px] text-[#6B7280]">{row.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
