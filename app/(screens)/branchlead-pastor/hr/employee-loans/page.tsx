"use client"

import { useMemo, useState } from "react"
import { Search, Bell, CheckCircle2, ArrowUpDown } from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import BranchLeadLoanFinalApprovalModal from "@/components/hr/BranchLeadLoanFinalApprovalModal"
import { cn } from "@/lib/utils"

type LoanRequest = {
  id: string
  name: string
  dept: string
  loanType: string
  principal: string
  monthly?: string
}

const LOAN_REQUESTS: LoanRequest[] = [
  {
    id: "amaka-uzor",
    name: "Sister Amaka Uzor",
    dept: "Youth Dept / 5 Years",
    loanType: "Staff Car Loan",
    principal: "₦750,000",
  },
  {
    id: "emmanuel-okafor",
    name: "Brother Emmanuel Okafor",
    dept: "Music Ministry / 3 Years",
    loanType: "Housing Advance",
    principal: "₦1,200,000",
  },
  {
    id: "joshua-mensah",
    name: "Elder Joshua Mensah",
    dept: "Admin / 12 Years",
    loanType: "Medical Emergency Loan",
    principal: "₦450,000",
  },
  {
    id: "samuel-adebayor",
    name: "Pastor Samuel Adebayor",
    dept: "Evangelism / 4 Years",
    loanType: "Educational Grant Loan",
    principal: "₦2,500,000",
  },
]

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

export default function Page() {
  const [nameFilter, setNameFilter] = useState("")
  const [selected, setSelected] = useState<LoanRequest | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = nameFilter.trim().toLowerCase()
    if (!query) return LOAN_REQUESTS
    return LOAN_REQUESTS.filter((r) => r.name.toLowerCase().includes(query))
  }, [nameFilter])

  const openApproval = (request: LoanRequest) => {
    setSelected(request)
    setModalOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />

      <main className="flex-1 px-8 pt-3 pb-6">
        {/* Top bar */}
        <div className="flex h-[56px] items-center justify-between gap-6">
          <span className="text-[13px] font-bold">Dashboard</span>

          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
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
          {/* Requests Needing Attention card */}
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 border-b border-[#F3F4F6] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[16px] font-bold text-[#111827]">Requests Needing Attention</h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Filter by name..."
                    className="h-[38px] w-[220px] rounded-md border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB]"
                  />
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-gray-50"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EFF2FF]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Employee Details
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Loan Type
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Principal Amount
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Verification
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#6B7280]">
                        No requests match your filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-[#F9FAFB]">
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[12px] font-bold text-[#3B5BDB]">
                              {initials(r.name)}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">{r.name}</div>
                              <div className="text-[12px] text-[#6B7280]">{r.dept}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[13px] text-[#4B5563]">{r.loanType}</td>
                        <td className="px-4 py-5 text-[15px] font-bold text-[#111827]">
                          {r.principal}
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accountant Verified
                          </span>
                        </td>
                        <td className="px-4 py-5 text-[13px]">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openApproval(r)}
                              className="rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
                            >
                              Final Approval
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-rose-200 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Decline
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
              <span className="text-[13px] text-[#6B7280]">Showing 1 to 4 of 14 requests</span>
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
            </div>
          </div>
        </div>
      </main>

      <BranchLeadLoanFinalApprovalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        request={selected}
      />
    </div>
  )
}
