"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Bell, ChevronDown, Download } from "lucide-react"

const summary = [
  { title: "Total Depreciation", value: "?1.45M", meta: "+8% this month" },
  { title: "Active Assets", value: "?120k", meta: "-5% from Feb" },
  { title: "Asset Value to Date", value: "?6.7M", meta: "+12% from last year" },
]

const rows = [
  {
    category: "Equipment",
    method: "Straight Line",
    cost: "?1.2M",
    cy: "?120k",
    lcy: "?95k",
  },
  {
    category: "Facilities",
    method: "Straight Line",
    cost: "?2.1M",
    cy: "?210k",
    lcy: "?190k",
  },
  {
    category: "Vehicles",
    method: "Reducing Balance",
    cost: "?1.9M",
    cy: "?180k",
    lcy: "?160k",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/depreciation" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Depreciation Schedule & Analysis"
              subtitle="Review depreciation schedules and asset management."
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

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summary.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-[#111827]">Category-wise Depreciation</div>
                <button className="text-[9px] text-[#3B5BDB]">View All Categories</button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">CATEGORY</th>
                      <th className="py-2 text-left">METHOD</th>
                      <th className="py-2 text-left">COST</th>
                      <th className="py-2 text-left">CY</th>
                      <th className="py-2 text-left">LCY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.category} className="border-t border-[#EEF1F6]">
                        <td className="py-2 font-medium text-[#111827]">{row.category}</td>
                        <td className="py-2 text-[#6B7280]">{row.method}</td>
                        <td className="py-2 text-[#111827]">{row.cost}</td>
                        <td className="py-2 text-rose-600">{row.cy}</td>
                        <td className="py-2 text-rose-600">{row.lcy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3 text-[9px] text-[#6B7280]">
                2024 Monthly Distribution
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-[36px] rounded-[6px] bg-[#EEF2FF]" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
