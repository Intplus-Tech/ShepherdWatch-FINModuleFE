"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Bell,
  Download,
  Timer,
  Power,
  SlidersHorizontal,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { cn } from "@/lib/utils"

type AttendanceStatus = "On Time" | "Late" | null

type AttendanceRow = {
  id: string
  name: string
  title: string
  initials: string
  avatarColor: string
  branch: string
  date: string
  timeIn: string
  status: AttendanceStatus
  timeOut: string | null
  duration: string
  alert?: boolean
}

const ROWS: AttendanceRow[] = [
  {
    id: "amaka-nwachukwu",
    name: "Amaka Nwachukwu",
    title: "Senior Administrator",
    initials: "AN",
    avatarColor: "bg-[#3B5BDB] text-white",
    branch: "Ibadan HQ",
    date: "Oct 19, 2023",
    timeIn: "07:52 AM",
    status: "On Time",
    timeOut: "05:05 PM",
    duration: "9h 13m",
  },
  {
    id: "tunde-bakare",
    name: "Tunde Bakare",
    title: "Finance Officer",
    initials: "TB",
    avatarColor: "bg-[#0EA5A4] text-white",
    branch: "Maryland Lagos",
    date: "Oct 19, 2023",
    timeIn: "08:15 AM",
    status: "Late",
    timeOut: "05:30 PM",
    duration: "9h 15m",
  },
  {
    id: "chidi-okechukwu",
    name: "Chidi Okechukwu",
    title: "Logistics Coordinator",
    initials: "CO",
    avatarColor: "bg-[#111827] text-white",
    branch: "Ibadan HQ",
    date: "Oct 19, 2023",
    timeIn: "08:02 AM",
    status: null,
    timeOut: null,
    duration: "--",
    alert: true,
  },
]

const BRANCHES = ["All Branches", "Ibadan HQ", "Maryland Lagos"]
const STATUSES = ["All Status", "On Time", "Late", "Missing"]

export default function Page() {
  const [branch, setBranch] = useState("All Branches")
  const [status, setStatus] = useState("All Status")

  const rows = useMemo(() => {
    return ROWS.filter((row) => {
      if (branch !== "All Branches" && row.branch !== branch) return false
      if (status === "All Status") return true
      if (status === "Missing") return row.timeOut === null
      return row.status === status
    })
  }, [branch, status])

  const resetAll = () => {
    setBranch("All Branches")
    setStatus("All Status")
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/attendance" />
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

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827]">Attendance Log</h1>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Review and manage branch-level staff check-ins for the current period.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Summary card */}
        <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[12px] font-semibold text-[#6B7280]">
                Avg. Clock-in Time
              </div>
              <div className="mt-1 text-[32px] font-bold text-[#111827]">
                07:54 AM
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Standard starts at 08:00 AM
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                On track
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                <Timer className="h-4 w-4" />
                <Power className="h-4 w-4" />
                Manual Clock-In/Out
              </button>
            </div>
          </div>
        </div>

        {/* Filters card */}
        <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
          <div className="flex items-center gap-2 text-[#111827]">
            <SlidersHorizontal className="h-4 w-4 text-[#6B7280]" />
            <span className="text-[13px] font-bold">Filters</span>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                Date Range
              </label>
              <div className="flex h-[42px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827]">
                <span>Oct 12, 2023 - Oct 19, 2023</span>
                <Calendar className="h-4 w-4 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-2.5"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Time In
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Time Out
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(row.alert && "border-l-2 border-rose-500")}
                  >
                    <td className="px-4 py-4 text-[13px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                            row.avatarColor
                          )}
                        >
                          {row.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#111827]">
                            {row.name}
                          </span>
                          <span className="text-[12px] text-[#6B7280]">
                            {row.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      {row.branch}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      {row.date}
                    </td>
                    <td className="px-4 py-4 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#111827]">
                          {row.timeIn}
                        </span>
                        {row.status === "On Time" && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            On Time
                          </span>
                        )}
                        {row.status === "Late" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Late
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]">
                      {row.timeOut === null ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Missing
                        </span>
                      ) : (
                        <span className="text-[#4B5563]">{row.timeOut}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      {row.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
