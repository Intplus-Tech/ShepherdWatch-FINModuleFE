"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"

const statCards = [
  { title: "Total Income", value: "?1.25M", meta: "+8%" },
  { title: "Total Expenses", value: "?620k", meta: "+2%" },
  { title: "Net Balance", value: "?630k", meta: "+4%" },
  { title: "Compliance", value: "92%", meta: "Good" },
]

const rows = [
  {
    date: "Jan 12, 2024",
    desc: "Sunday Tithes",
    category: "Income",
    amount: "?420,000",
    status: "Verified",
  },
  {
    date: "Jan 11, 2024",
    desc: "Generator Fuel",
    category: "Operational",
    amount: "?85,000",
    status: "Pending",
  },
  {
    date: "Jan 10, 2024",
    desc: "Office Supplies",
    category: "Admin",
    amount: "?35,000",
    status: "Verified",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/dashboard" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader title="Dashboard" />

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Recent Transactions</div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead className="text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 text-left">DATE</th>
                        <th className="py-2 text-left">DESCRIPTION</th>
                        <th className="py-2 text-left">CATEGORY</th>
                        <th className="py-2 text-left">AMOUNT</th>
                        <th className="py-2 text-left">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.date} className="border-t border-[#EEF1F6]">
                          <td className="py-2 text-[#6B7280]">{row.date}</td>
                          <td className="py-2 font-medium text-[#111827]">{row.desc}</td>
                          <td className="py-2 text-[#6B7280]">{row.category}</td>
                          <td className="py-2 text-[#111827]">{row.amount}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] ${
                              row.status === "Verified" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Quick Insights</div>
                <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Income vs Expense</span>
                    <span className="text-emerald-600">+18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Reconciliation</span>
                    <span className="text-amber-600">2 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue Approvals</span>
                    <span className="text-rose-600">1</span>
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
