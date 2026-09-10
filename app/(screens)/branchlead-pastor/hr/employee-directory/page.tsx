"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadAddEmployeeModal from "@/components/hr/BranchLeadAddEmployeeModal"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue"
import { useEmployeeMetrics, useEmployees } from "@/components/hooks/hr/useHrEmployees"
import {
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  employeeEmail,
  initials,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { EMPLOYMENT_STATUSES, type EmploymentStatus } from "@/lib/hr/types"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Download,
  Plus,
  SlidersHorizontal,
  Eye,
  Users,
  CheckCircle2,
  Calendar,
  UserMinus,
} from "lucide-react"

const PAGE_SIZE = 10

const CARD =
  "rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

export default function Page() {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | EmploymentStatus>("all")
  const [jobTitle, setJobTitle] = useState("All Roles")
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebouncedValue(query)

  const employees = useEmployees({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    employmentStatus: status,
  })
  const metrics = useEmployeeMetrics()

  const rows = useMemo(
    () =>
      (employees.data?.items ?? []).map((employee) => ({
        id: employee._id,
        name: userName(employee.userId, employee.employeeId),
        empId: employee.employeeId,
        title: employee.jobTitle,
        email: employeeEmail(employee),
        status: employee.employmentStatus,
      })),
    [employees.data],
  )

  /** Job titles come from the loaded page — the backend filters by department. */
  const jobTitles = useMemo(() => Array.from(new Set(rows.map((r) => r.title))), [rows])

  const filtered = useMemo(
    () => (jobTitle === "All Roles" ? rows : rows.filter((r) => r.title === jobTitle)),
    [rows, jobTitle],
  )

  const stats = [
    {
      label: "Total Staff",
      value: metrics.data?.totalStaff ?? 0,
      icon: Users,
      tint: "bg-[#EEF2FF] text-[#2563EB]",
    },
    {
      label: "Active",
      value: metrics.data?.activeStaff ?? 0,
      icon: CheckCircle2,
      tint: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "On Leave",
      value: metrics.data?.onLeaveStaff ?? 0,
      icon: Calendar,
      tint: "bg-amber-100 text-amber-600",
    },
    {
      label: "Exit Pending",
      value: metrics.data?.exitPendingStaff ?? 0,
      icon: UserMinus,
      tint: "bg-rose-100 text-rose-600",
    },
  ]

  function handleExport() {
    const csv = rowsToCsv(
      filtered.map((row) => ({
        Name: row.name,
        "Employee ID": row.empId,
        "Job Title": row.title,
        Email: row.email,
        Status: lookup(EMPLOYMENT_STATUS_LABELS, row.status),
      })),
    )
    downloadCsv(`employee-directory-${todayStamp()}.csv`, csv)
  }

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
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">Employee Directory</h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Manage branch staff records, status, and department alignment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className={cn(CARD, "relative p-5")}>
                  <div
                    className={cn(
                      "absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-[10px]",
                      s.tint,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                    {s.label}
                  </div>
                  <div className="mt-2 text-[28px] font-bold text-[#111827]">
                    <HrStatValue
                      isLoading={metrics.isLoading}
                      error={metrics.error}
                      value={s.value}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Toolbar */}
          <div className={cn(CARD, "mt-5 p-4")}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search by name, email, or department..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as "all" | EmploymentStatus)
                  setPage(1)
                }}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="all">Status: All</option>
                {EMPLOYMENT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {EMPLOYMENT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="All Roles">Job Title: All Roles</option>
                {jobTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC]">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={cn(CARD, "mt-5 overflow-hidden")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-[#EFF2FF]">
                    {["Name", "Job Title", "Email Address", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  <HrTableState
                    colSpan={5}
                    isLoading={employees.isLoading}
                    error={employees.error}
                    isEmpty={filtered.length === 0}
                    emptyTitle="No employees found"
                    emptyDescription="Add an employee or adjust your filters."
                    onRetry={() => employees.refetch()}
                  />

                  {!employees.isLoading &&
                    !employees.error &&
                    filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                              {initials(e.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#111827]">{e.name}</div>
                              <div className="text-[12px] text-[#9CA3AF]">
                                Emp ID: #{e.empId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">{e.title}</td>
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {e.email || "—"}
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                              badgeFor(EMPLOYMENT_STATUS_BADGES, e.status),
                            )}
                          >
                            {lookup(EMPLOYMENT_STATUS_LABELS, e.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[13px]">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                router.push(
                                  `/branchlead-pastor/hr/employee-profile?id=${e.id}`,
                                )
                              }
                              aria-label={`View ${e.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <HrPagination
              pagination={employees.data?.pagination}
              page={page}
              onPageChange={setPage}
              itemCount={rows.length}
              noun="employees"
            />
          </div>
        </div>
      </main>

      <BranchLeadAddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
