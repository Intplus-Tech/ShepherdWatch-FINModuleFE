"use client"

import { useMemo, useState } from "react"
import { Search, UserPlus, Download, SlidersHorizontal, Eye, X } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ApproveLoanOverrideModal from "@/components/hr/ApproveLoanOverrideModal"
import { cn } from "@/lib/utils"

type LoanStatus = "PENDING" | "FLAGGED"

type LoanRequest = {
  id: string
  name: string
  employeeId: string
  branch: string
  amount: number
  status: LoanStatus
  type: string
  tenure: string
  totalPrincipal: number
  monthlyRepayment: number
  purpose: string
}

const LOAN_REQUESTS: LoanRequest[] = [
  {
    id: "sarah-musa",
    name: "Sarah Musa",
    employeeId: "EMP-0922",
    branch: "Ibadan HQ",
    amount: 750_000,
    status: "PENDING",
    type: "Staff Car Loan",
    tenure: "12 Months",
    totalPrincipal: 750_000,
    monthlyRepayment: 62_500,
    purpose:
      "To purchase a car for official transit following the staff's recent promotion and relocation to the HQ hub. This asset will support field monitoring tasks.",
  },
  {
    id: "john-obi",
    name: "John Obi",
    employeeId: "EMP-0481",
    branch: "Ibadan HQ",
    amount: 1_200_000,
    status: "PENDING",
    type: "Staff Car Loan",
    tenure: "12 Months",
    totalPrincipal: 1_200_000,
    monthlyRepayment: 100_000,
    purpose:
      "To purchase a car for official transit following the staff's recent promotion and relocation to the HQ hub. This asset will support field monitoring tasks.",
  },
  {
    id: "maryam-bello",
    name: "Maryam Bello",
    employeeId: "EMP-1104",
    branch: "Lagos North",
    amount: 600_000,
    status: "FLAGGED",
    type: "Staff Car Loan",
    tenure: "12 Months",
    totalPrincipal: 600_000,
    monthlyRepayment: 50_000,
    purpose:
      "To purchase a car for official transit following the staff's recent promotion and relocation to the HQ hub. This asset will support field monitoring tasks.",
  },
]

const BRANCH_OPTIONS = ["Ibadan HQ", "Lagos North", "Abuja Regional"]
const STATUS_OPTIONS = ["Pending Director", "Pending", "Flagged", "All Statuses"]

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`
}

function formatNairaDecimal(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        status === "PENDING"
          ? "bg-amber-100 text-amber-700"
          : "bg-rose-100 text-rose-700"
      )}
    >
      {status}
    </span>
  )
}

export default function Page() {
  const [branchFilter, setBranchFilter] = useState("Ibadan HQ")
  const [statusFilter, setStatusFilter] = useState("Pending Director")
  const [minAmount, setMinAmount] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>("sarah-musa")
  const [overrideOpen, setOverrideOpen] = useState(false)

  const filtered = useMemo(() => {
    const min = Number(minAmount.replace(/[^0-9]/g, ""))
    return LOAN_REQUESTS.filter((r) => {
      const matchesBranch = branchFilter === "" || r.branch === branchFilter
      const matchesStatus =
        statusFilter === "All Statuses" ||
        statusFilter === "Pending Director" ||
        (statusFilter === "Pending" && r.status === "PENDING") ||
        (statusFilter === "Flagged" && r.status === "FLAGGED")
      const matchesAmount = !min || r.amount >= min
      return matchesBranch && matchesStatus && matchesAmount
    })
  }, [branchFilter, statusFilter, minAmount])

  const selected = useMemo(
    () => LOAN_REQUESTS.find((r) => r.id === selectedId) ?? null,
    [selectedId]
  )

  const clearFilters = () => {
    setBranchFilter("Ibadan HQ")
    setStatusFilter("Pending Director")
    setMinAmount("")
  }

  const openReview = (id: string) => setSelectedId(id)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/employee-loans"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">
                Loans request
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Reviewing requests across all branches
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[240px]"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters card */}
          <div className="mb-6 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#6B7280] lg:mb-3">
                <SlidersHorizontal className="h-4 w-4" />
                Filters:
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                  Min. Amount
                </label>
                <input
                  type="text"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="₦ 500,000"
                  className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[13px] font-semibold text-[#3B5BDB] lg:mb-3"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT: Loan Requests */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] p-5">
                <h2 className="text-[18px] font-bold text-[#111827]">
                  Loan Requests
                </h2>
                <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                  3 Actions Required
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Staff Member
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-[13px] text-[#6B7280]"
                        >
                          No loan requests match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => openReview(r.id)}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-[#F8FAFC]",
                            selectedId === r.id &&
                              "border-l-2 border-[#111827] bg-[#F8FAFC]"
                          )}
                        >
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#111827]">
                                {r.name}
                              </span>
                              <span className="text-[12px] text-[#6B7280]">
                                ID: {r.employeeId}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {r.branch}
                          </td>
                          <td className="px-4 py-4 text-[13px] font-bold text-[#111827]">
                            {formatNaira(r.amount)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                aria-label={`Review ${r.name}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openReview(r.id)
                                }}
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
            </div>

            {/* RIGHT: Loan Details */}
            <div className="rounded-xl border border-[#EEF1F6] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F6] p-5">
                <h2 className="text-[18px] font-bold text-[#111827]">
                  Loan Details
                </h2>
                <button
                  type="button"
                  aria-label="Clear selection"
                  onClick={() => setSelectedId(null)}
                  className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selected ? (
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Type
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {selected.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Tenure
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {selected.tenure}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Financial Breakdown
                  </div>
                  <div className="mt-3 divide-y divide-[#EEF1F6] rounded-lg border border-[#EEF1F6]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">
                        Total Principal
                      </span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatNairaDecimal(selected.totalPrincipal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-[#6B7280]">
                        Monthly Repayment
                      </span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatNairaDecimal(selected.monthlyRepayment)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Purpose Statement
                  </div>
                  <blockquote className="mt-3 border-l-4 border-[#3B5BDB] bg-[#F8FAFC] p-3 text-[13px] italic text-[#4B5563]">
                    &ldquo;{selected.purpose}&rdquo;
                  </blockquote>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-rose-200 px-4 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      REJECT
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideOpen(true)}
                      className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black"
                    >
                      APPROVE LOAN
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-[13px] text-[#6B7280]">
                  Select a loan request to view its details.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ApproveLoanOverrideModal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
      />
    </div>
  )
}
