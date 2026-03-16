"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"

const transactions = [
  {
    date: "Jan 22, 2024",
    description: "Sunday Tithes & Offerings",
    category: "Income",
    amount: "?642,500",
    status: "Verified",
  },
  {
    date: "Jan 21, 2024",
    description: "NEPA/Utility Bill",
    category: "Operational",
    amount: "?42,000",
    status: "Paid",
  },
  {
    date: "Jan 20, 2024",
    description: "Diesel Purchase (Gen set)",
    category: "Operational",
    amount: "?85,000",
    status: "Unverified",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/transaction" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Transactions"
              subtitle="Monitor all branch transactions and approvals."
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    January 2024
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                </div>
              }
            />

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                      <Input
                        className="h-7 w-[200px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[9px]"
                        placeholder="Search transactions..."
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                      <Filter className="h-3.5 w-3.5" />
                      Filters
                    </Button>
                  </div>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    <Plus className="h-3.5 w-3.5" />
                    Add Transaction
                  </Button>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead className="text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 text-left">DATE</th>
                        <th className="py-2 text-left">DESCRIPTION</th>
                        <th className="py-2 text-left">CATEGORY</th>
                        <th className="py-2 text-left">AMOUNT</th>
                        <th className="py-2 text-left">STATUS</th>
                        <th className="py-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.description} className="border-t border-[#EEF1F6]">
                          <td className="py-2 text-[#6B7280]">{tx.date}</td>
                          <td className="py-2 font-medium text-[#111827]">{tx.description}</td>
                          <td className="py-2 text-[#6B7280]">{tx.category}</td>
                          <td className="py-2 text-[#111827]">{tx.amount}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] ${
                              tx.status === "Verified" ? "bg-emerald-50 text-emerald-600"
                                : tx.status === "Paid" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            }`}>{tx.status}</span>
                          </td>
                          <td className="py-2 text-right text-[#9CA3AF]">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Transaction Summary</div>
                <div className="mt-3 space-y-3 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Approved</span>
                    <span className="text-emerald-600">?1,200,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="text-amber-600">?420,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Declined</span>
                    <span className="text-rose-600">?85,000</span>
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                  <div className="text-[9px] font-semibold text-[#111827]">Recent Activity</div>
                  <div className="mt-2 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Invoice #INV-1024</span>
                      <span className="text-emerald-600">Paid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Purchase #PO-309</span>
                      <span className="text-amber-600">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transfer #TR-220</span>
                      <span className="text-rose-600">Declined</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
