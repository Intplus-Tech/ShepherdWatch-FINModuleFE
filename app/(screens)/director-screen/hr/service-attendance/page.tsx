"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Globe,
  Users,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  ATTENDANCE_REGIONS,
  BRANCH_ATTENDANCE,
  SERVICE_TYPES,
  TOTAL_REPORTING_BRANCHES,
  branchTotal,
} from "@/components/attendance/attendance-data"
import { downloadCsv, sectionsToCsv } from "@/lib/export-csv"

const MONTHS = ["Oct 2024", "Sep 2024", "Aug 2024", "Jul 2024"]

export default function Page() {
  const [month, setMonth] = useState(MONTHS[0])
  const [region, setRegion] = useState("All Regions")
  const [service, setService] = useState("All Services")

  const rows = useMemo(() => {
    const filtered =
      region === "All Regions"
        ? BRANCH_ATTENDANCE
        : BRANCH_ATTENDANCE.filter((row) => row.region === region)
    return [...filtered].sort((a, b) => branchTotal(b) - branchTotal(a))
  }, [region])

  // The listed branches are one page of the organisation; the MTD figure is the
  // consolidated total across every reporting branch.
  const totalAttendance = 42850
  const averagePerBranch = Math.round(totalAttendance / TOTAL_REPORTING_BRANCHES)

  const handleExport = () => {
    const csv = sectionsToCsv([
      {
        title: `Service Attendance — ${month} (${region})`,
        rows: rows.map((row) => ({
          Branch: row.branch,
          Region: row.region,
          Services: row.services,
          "Last Service": row.lastService,
          Male: row.male,
          Female: row.female,
          Teens: row.teens,
          Children: row.children,
          Total: branchTotal(row),
        })),
      },
    ])
    downloadCsv(`service-attendance_${month.replace(/\s+/g, "-").toLowerCase()}.csv`, csv)
  }

  const stats = [
    {
      label: "Total Attendance (MTD)",
      value: totalAttendance.toLocaleString(),
      icon: Users,
      iconClass: "bg-[#EEF2FF] text-[#3B5BDB]",
      valueClass: "text-[#111827]",
    },
    {
      label: "Avg. Per Branch (MTD)",
      value: averagePerBranch.toLocaleString(),
      icon: BarChart3,
      iconClass: "bg-[#F1F5F9] text-[#475569]",
      valueClass: "text-[#111827]",
    },
    {
      label: "Growth vs Last Month",
      value: "↑ 8.2%",
      icon: ArrowUpRight,
      iconClass: "bg-emerald-100 text-emerald-600",
      valueClass: "text-emerald-600",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/service-attendance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none border-r border-[#EEF1F6] bg-[#FAFBFF]"
      />

      <main className="flex-1 text-[#111827] xl:ml-[260px]">
        <div className="mx-auto w-full max-w-7xl px-6 pt-6 pb-8 lg:px-8 lg:pt-8">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#EEF1F6] pb-6 md:flex-row md:items-start">
            <div>
              <h1 className="text-[24px] font-bold leading-none text-[#111827]">Financial Overview</h1>
              <p className="mt-2 text-[13px] font-medium text-[#3B5BDB]">Global financial health monitoring</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <select
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  aria-label="Filter by region"
                  className="h-[38px] appearance-none rounded-md border border-[#E5E7EB] bg-white pl-9 pr-9 text-[12px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"
                >
                  {ATTENDANCE_REGIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Global overview filter card */}
          <div className="rounded-[14px] border border-[#E0E7FF] bg-[#F5F7FF] p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Global Overview
                </div>
                <h2 className="mt-2 text-[24px] font-extrabold leading-tight text-[#111827]">
                  Service Attendance
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <select
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    aria-label="Filter by month"
                    className="h-[40px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-9 pr-9 text-[13px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"
                  >
                    {MONTHS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>

                <div className="relative">
                  <select
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    aria-label="Filter by service"
                    className="h-[40px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-3.5 pr-9 text-[13px] font-medium text-[#4B5563] outline-none focus:border-[#2563EB]"
                  >
                    <option>All Services</option>
                    {SERVICE_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>

                <button
                  type="button"
                  className="inline-flex h-[40px] items-center gap-2 rounded-[8px] bg-[#111827] px-4 text-[13px] font-semibold text-white hover:bg-[#1F2937]"
                >
                  <Filter className="h-4 w-4" />
                  Filter Records
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="flex items-start justify-between gap-4 rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"
                  >
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        {stat.label}
                      </div>
                      <div className={`mt-3 text-[28px] font-extrabold leading-none ${stat.valueClass}`}>
                        {stat.value}
                      </div>
                    </div>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Attendance by branch */}
          <div className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-[16px] font-bold text-[#111827]">Attendance by Branch</h3>
                <p className="mt-1 text-[12px] text-[#6B7280]">Sorted by Total Attendance (Descending)</p>
              </div>
              <button
                type="button"
                className="inline-flex h-[34px] items-center gap-2 self-start rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50 sm:self-auto"
              >
                <Filter className="h-3.5 w-3.5" />
                Sort Settings
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#EEF1F6] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <th className="px-5 py-3">Branch</th>
                    <th className="px-5 py-3">No of Services</th>
                    <th className="px-5 py-3">Last Service</th>
                    <th className="px-5 py-3">Main (M/F)</th>
                    <th className="px-5 py-3 text-center">Teens</th>
                    <th className="px-5 py-3 text-center">Children</th>
                    <th className="px-5 py-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#F3F4F6] text-[13px] last:border-b-0">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#111827]">{row.branch}</div>
                        <div className="mt-0.5 text-[11px] font-medium text-[#9CA3AF]">{row.region}</div>
                      </td>
                      <td className="px-5 py-4 text-[#4B5563]">
                        {row.services} {row.services === 1 ? "Service" : "Services"}
                      </td>
                      <td className="px-5 py-4 text-[#4B5563]">{row.lastService}</td>
                      <td className="px-5 py-4 text-[#4B5563]">
                        <span className="font-semibold text-[#111827]">{row.male + row.female}</span>{" "}
                        <span className="text-[#9CA3AF]">
                          ({row.male}/{row.female})
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-[#4B5563]">{row.teens}</td>
                      <td className="px-5 py-4 text-center text-[#4B5563]">{row.children}</td>
                      <td className="px-5 py-4 text-center font-extrabold text-[#111827]">
                        {branchTotal(row)}
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
                        No branches reported attendance for this filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] font-medium text-[#6B7280]">
                Showing <span className="font-bold text-[#111827]">{rows.length}</span> of{" "}
                <span className="font-bold text-[#111827]">{TOTAL_REPORTING_BRANCHES}</span> reporting branches
              </p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={
                      pageNumber === 1
                        ? "flex h-8 w-8 items-center justify-center rounded-md bg-[#111827] text-[12px] font-semibold text-white"
                        : "flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                    }
                  >
                    {pageNumber}
                  </button>
                ))}
                <span className="px-1 text-[12px] text-[#9CA3AF]">…</span>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                >
                  7
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
