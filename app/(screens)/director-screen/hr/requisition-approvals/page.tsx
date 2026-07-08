"use client"

import { useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  Search,
  UserPlus,
  Download,
  ChevronDown,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type Requisition = {
  id: string
  branch: string
  role: string
  salary: string
}

const INITIAL_REQUISITIONS: Requisition[] = [
  { id: "req-1", branch: "Ikeja Branch", role: "Pastor", salary: "₦850,000.00" },
  { id: "req-2", branch: "Agodi Branch", role: "Admin Officer", salary: "₦620,000.00" },
  {
    id: "req-3",
    branch: "Port Harcourt Branch",
    role: "Security Officer",
    salary: "₦450,000.00",
  },
]

export default function Page() {
  const [search, setSearch] = useState("")
  const [branchFilter, setBranchFilter] = useState("All Branches")
  const [titleFilter, setTitleFilter] = useState("")
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS)

  const branchOptions = useMemo(
    () => Array.from(new Set(INITIAL_REQUISITIONS.map((r) => r.branch))),
    []
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const title = titleFilter.trim().toLowerCase()
    return requisitions.filter((row) => {
      const matchesBranch = branchFilter === "All Branches" || row.branch === branchFilter
      const matchesTitle = !title || row.role.toLowerCase().includes(title)
      const matchesSearch =
        !term ||
        row.branch.toLowerCase().includes(term) ||
        row.role.toLowerCase().includes(term) ||
        row.salary.toLowerCase().includes(term)
      return matchesBranch && matchesTitle && matchesSearch
    })
  }, [requisitions, branchFilter, titleFilter, search])

  const clearFilters = () => {
    setBranchFilter("All Branches")
    setTitleFilter("")
  }

  const resolveRequisition = (id: string) =>
    setRequisitions((prev) => prev.filter((row) => row.id !== id))

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-directory"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Job Requisition Approvals
              </h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Review and authorize outstanding hiring requests across all branches.
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

          {/* Filters Row */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Filter by Branch</label>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] md:w-[220px]"
                >
                  <option value="All Branches">All Branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Job Title</label>
              <input
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Title search..."
                className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB] md:w-[220px]"
              />
            </div>

            <button
              onClick={clearFilters}
              className="text-[13px] font-semibold text-[#3B5BDB] md:mb-3"
            >
              Clear all filters
            </button>
          </div>

          {/* Pending Requisitions Section */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">Pending Requisitions</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Role
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Salary (Monthly)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]"
                      >
                        No pending requisitions match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                          {row.branch}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">{row.role}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">
                          {row.salary}
                        </td>
                        <td className="px-4 py-3 text-[13px]">
                          <div className="flex items-center gap-2">
                            <button
                              aria-label="View requisition"
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => resolveRequisition(row.id)}
                              className="rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => resolveRequisition(row.id)}
                              className="rounded-md border border-rose-200 bg-white px-4 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-[#EEF1F6] p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-medium text-[#6B7280]">
                Showing {filtered.length} of 14 pending requests
              </span>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md bg-[#3B5BDB] text-[12px] font-bold text-white">
                  1
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#4B5563] hover:bg-gray-50">
                  2
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#4B5563] hover:bg-gray-50">
                  3
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-gray-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
