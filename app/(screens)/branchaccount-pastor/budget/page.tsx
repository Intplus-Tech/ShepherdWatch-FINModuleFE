"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, ChevronDown, Download, Filter, Search } from "lucide-react"

const summary = [
  { title: "Total Budget", value: "?3,500,000", meta: "FY 2024" },
  { title: "Committed", value: "?2,100,000", meta: "60%" },
  { title: "Remaining", value: "?1,400,000", meta: "40%" },
  { title: "Compliance", value: "92%", meta: "Good" },
]

const rows = [
  {
    category: "Operations",
    annual: "?1,200,000",
    spent: "?720,000",
    remaining: "?480,000",
    status: "On Track",
  },
  {
    category: "Programs",
    annual: "?900,000",
    spent: "?510,000",
    remaining: "?390,000",
    status: "Caution",
  },
  {
    category: "Facilities",
    annual: "?800,000",
    spent: "?520,000",
    remaining: "?280,000",
    status: "On Track",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/budget" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Budget"
              subtitle="Track and manage department allocations."
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    FY 2024
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

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summary.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    <Input className="h-7 w-[200px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[9px]" placeholder="Search budget..." />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </Button>
                </div>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Add Allocation
                </Button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">CATEGORY</th>
                      <th className="py-2 text-left">ANNUAL BUDGET</th>
                      <th className="py-2 text-left">SPENT</th>
                      <th className="py-2 text-left">REMAINING</th>
                      <th className="py-2 text-left">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.category} className="border-t border-[#EEF1F6]">
                        <td className="py-2 font-medium text-[#111827]">{row.category}</td>
                        <td className="py-2 text-[#6B7280]">{row.annual}</td>
                        <td className="py-2 text-[#6B7280]">{row.spent}</td>
                        <td className="py-2 text-[#111827]">{row.remaining}</td>
                        <td className={`py-2 ${row.status === "Caution" ? "text-amber-600" : "text-emerald-600"}`}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
