"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminAddEmployeeModal from "@/components/hr/BranchAdminAddEmployeeModal"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Menu,
  Download,
  Plus,
  SlidersHorizontal,
  Eye,
  Pencil,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type Status = "Active" | "On Leave" | "Exited"

type Employee = {
  name: string
  empId: string
  title: string
  email: string
  status: Status
}

const EMPLOYEES: Employee[] = [
  {
    name: "Dr. Robert Henderson",
    empId: "SW-4029",
    title: "Lead Pastor",
    email: "r.henderson@shepherdwatch.org",
    status: "Active",
  },
  {
    name: "Sarah Mitchell",
    empId: "SW-4031",
    title: "Operations Manager",
    email: "s.mitchell@shepherdwatch.org",
    status: "On Leave",
  },
  {
    name: "James Wilson",
    empId: "SW-3988",
    title: "Chief Accountant",
    email: "j.wilson@shepherdwatch.org",
    status: "Active",
  },
  {
    name: "Aaron Chen",
    empId: "SW-4102",
    title: "IT Administrator",
    email: "a.chen@shepherdwatch.org",
    status: "Exited",
  },
  {
    name: "Eleanor Vance",
    empId: "SW-3877",
    title: "Office Secretary",
    email: "e.vance@shepherdwatch.org",
    status: "Active",
  },
]

const STATUS_STYLES: Record<Status, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Exited: "bg-slate-100 text-slate-600",
}

const JOB_TITLES = Array.from(new Set(EMPLOYEES.map((e) => e.title)))

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"All" | Status>("All")
  const [jobTitle, setJobTitle] = useState<"All Roles" | string>("All Roles")
  const router = useRouter()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EMPLOYEES.filter((e) => {
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q)
      const matchesStatus = status === "All" || e.status === status
      const matchesTitle = jobTitle === "All Roles" || e.title === jobTitle
      return matchesQuery && matchesStatus && matchesTitle
    })
  }, [query, status, jobTitle])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/employee-directory"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827]">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#111827]">
                Employee Directory
              </h1>
              <p className="mt-1 text-[14px] text-[#6B7280]">
                Manage branch staff records, status, and department alignment.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]">
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

          {/* Toolbar */}
          <div className="mt-6 rounded-xl border border-[#EEF1F6] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, or department..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13px] outline-none focus:border-[#2563EB]"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "All" | Status)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Exited">Exited</option>
              </select>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] outline-none focus:border-[#2563EB]"
              >
                <option value="All Roles">Job Title: All Roles</option>
                {JOB_TITLES.map((t) => (
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
          <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-[#EEF2FF]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Email Address
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.map((e) => (
                    <tr key={e.empId} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                            {initials(e.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#111827]">
                              {e.name}
                            </div>
                            <div className="text-[12px] text-[#9CA3AF]">
                              Emp ID: #{e.empId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {e.title}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {e.email}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                            STATUS_STYLES[e.status]
                          )}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push("/branch-admin/hr/employee-profile")
                            }
                            aria-label={`View ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#2563EB]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            aria-label={`Edit ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            aria-label={`Deactivate ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]"
                      >
                        No employees match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[12px] text-[#6B7280]">
                Showing 1 - 5 of 124 records
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {["1", "2", "3"].map((p, i) => (
                  <button
                    key={p}
                    className={cn(
                      "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] font-semibold",
                      i === 0
                        ? "bg-[#111827] text-white"
                        : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F8FAFC]"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <span className="px-1 text-[12px] text-[#9CA3AF]">…</span>
                <button className="flex h-8 min-w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]">
                  25
                </button>
                <button
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BranchAdminAddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </div>
  )
}
