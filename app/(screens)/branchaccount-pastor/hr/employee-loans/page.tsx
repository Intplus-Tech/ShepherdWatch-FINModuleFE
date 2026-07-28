"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, Eye } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAcctNewLoanModal from "@/components/hr/BranchAcctNewLoanModal"
import { cn } from "@/lib/utils"

type LoanStatus =
  | "ACTIVE"
  | "WITHDRAWN REQUEST"
  | "COMPLETED"
  | "PENDING APPROVAL"
  | "APPROVED"

type LoanRow = {
  id: string
  name: string
  employeeId: string
  jobTitle: string
  totalAmount: number
  monthly: number
  balance: number
  status: LoanStatus
}

const LOANS: LoanRow[] = [
  {
    id: "john-adeyemi-active",
    name: "John Adeyemi",
    employeeId: "EMP-00219",
    jobTitle: "Lead Pastor",
    totalAmount: 2_500_000,
    monthly: 150_000,
    balance: 1_200_000,
    status: "ACTIVE",
  },
  {
    id: "esther-nwachukwu",
    name: "Esther Nwachukwu",
    employeeId: "EMP-00821",
    jobTitle: "Choir Director",
    totalAmount: 500_000,
    monthly: 25_000,
    balance: 325_000,
    status: "WITHDRAWN REQUEST",
  },
  {
    id: "michael-bello-completed",
    name: "Michael Bello",
    employeeId: "EMP-00155",
    jobTitle: "Facilities Manager",
    totalAmount: 1_200_000,
    monthly: 100_000,
    balance: 0,
    status: "COMPLETED",
  },
  {
    id: "kamsi-chidubem-active",
    name: "Kamsi Chidubem",
    employeeId: "EMP-00451",
    jobTitle: "Security Head",
    totalAmount: 1_000_000,
    monthly: 80_000,
    balance: 840_000,
    status: "ACTIVE",
  },
  {
    id: "michael-bello-pending",
    name: "Michael Bello",
    employeeId: "EMP-00155",
    jobTitle: "Facilities Manager",
    totalAmount: 1_200_000,
    monthly: 100_000,
    balance: 0,
    status: "PENDING APPROVAL",
  },
  {
    id: "kamsi-chidubem-approved",
    name: "Kamsi Chidubem",
    employeeId: "EMP-00451",
    jobTitle: "Security Head",
    totalAmount: 1_000_000,
    monthly: 80_000,
    balance: 840_000,
    status: "APPROVED",
  },
]

const STATUS_OPTIONS = [
  "All Status",
  "ACTIVE",
  "WITHDRAWN REQUEST",
  "COMPLETED",
  "PENDING APPROVAL",
  "APPROVED",
]

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

const STATUS_STYLES: Record<LoanStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  "WITHDRAWN REQUEST": "bg-rose-100 text-rose-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  "PENDING APPROVAL": "bg-slate-100 text-slate-600",
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    return LOANS.filter((row) => {
      const matchesName = !query || row.name.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === "All Status" || row.status === statusFilter
      return matchesName && matchesStatus
    })
  }, [nameFilter, statusFilter])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/employee-loans" />

      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-6">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>

          <div className="flex items-center gap-4">
            <div className="relative w-[280px] max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-full border border-transparent bg-white pl-9 pr-3 text-[13px] font-medium text-[#4B5563] placeholder:text-[#9CA3AF] outline-none focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280] transition-colors hover:bg-gray-50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          <h1 className="text-[16px] font-bold text-[#111827]">Employee Loans</h1>

          {/* Toolbar card */}
          <div className="mt-4 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search staff name..."
                    className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB] sm:w-[240px]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-[42px] rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#4B5563] outline-none focus-visible:border-[#3B5BDB]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "All Status"
                        ? "All Status"
                        : option
                            .toLowerCase()
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
              >
                New Loan Application
              </button>
            </div>
          </div>

          {/* Table card */}
          <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EEF2FF]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Employee Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Total Amount (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Monthly (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Balance (₦)
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[13px] text-[#6B7280]"
                      >
                        No loans match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-[#F9FAFB]"
                      >
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[11px] font-bold text-[#3B5BDB]">
                              {initials(row.name)}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">
                                {row.name}
                              </div>
                              <div className="text-[12px] text-[#6B7280]">
                                {row.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                          {row.jobTitle}
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#111827]">
                          {formatNaira(row.totalAmount)}
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">
                          {formatNaira(row.monthly)}
                        </td>
                        <td className="px-4 py-5 text-[13px] font-bold text-[#111827]">
                          {formatNaira(row.balance)}
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              aria-label={`View loan for ${row.name}`}
                              onClick={() =>
                                router.push(
                                  "/branchaccount-pastor/hr/loan-detail"
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]"
                            >
                              <Eye className="h-4 w-4" />
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
            <div className="flex flex-col gap-4 border-t border-[#F3F4F6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  Previous
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-semibold",
                      page === 1
                        ? "bg-[#111827] text-white"
                        : "border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <span className="text-[13px] text-[#6B7280]">Page 1 of 5</span>
            </div>
          </div>
        </div>
      </main>

      <BranchAcctNewLoanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
