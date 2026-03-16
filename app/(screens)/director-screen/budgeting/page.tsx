"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { ChevronDown, Plus } from "lucide-react"

const summary = [
  { label: "Total Annual Budget", value: "N70,880,840,250", note: "FY 2024" },
  { label: "YTD Actual Spent", value: "N70,880,840,250", note: "86% target" },
  { label: "Overall Variance", value: "+12.4%", note: "Healthy surplus" },
]

const rows = [
  { group: true, name: "Operational Expenses" },
  { name: "Facilities & Maintenance", budget: "N200,000", target: "N16,000", spent: "N32,500", variance: "+8.3%", status: "Warning" },
  { name: "Staff Salaries & Benefits", budget: "N600,000", target: "N50,000", spent: "N45,000", variance: "+2.5%", status: "On Track" },
  { name: "Office Supplies & Tech", budget: "N100,000", target: "N8,333", spent: "N5,000", variance: "+5.0%", status: "On Track" },
  { group: true, name: "Program Expenses" },
  { name: "Youth Ministry", budget: "N100,000", target: "N8,333", spent: "N4,500", variance: "-3.0%", status: "Exceeded" },
  { name: "Worship & Media", budget: "N300,000", target: "N25,000", spent: "N22,500", variance: "+1.0%", status: "On Track" },
  { name: "Community Outreach", budget: "N150,000", target: "N12,500", spent: "N10,000", variance: "+6.0%", status: "On Track" },
  { group: true, name: "Capital Projects" },
  { name: "Renovation Fund", budget: "N100,000", target: "N8,333", spent: "N9,500", variance: "+4.0%", status: "On Track" },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/budgeting" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader title="Budgeting" subtitle="Global financial health monitoring" />

            <div className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-[#111827]">Budget Performance</h2>
                  <p className="text-[10px] text-[#9CA3AF]">Detailed Budget vs. Actual (YTD) analysis across all streams.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                    Budget Control
                  </button>
                  <button className="flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-2.5 py-1.5 text-[10px] text-white">
                    <Plus className="h-3 w-3" />
                    Sync Feed
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {summary.map((card) => (
                  <div key={card.label} className="rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFF] p-3">
                    <div className="text-[10px] text-[#9CA3AF]">{card.label}</div>
                    <div className="mt-2 text-[15px] font-semibold text-[#111827]">{card.value}</div>
                    <div className="text-[9px] text-[#6B7280]">{card.note}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-[#6B7280]">
                <div className="rounded-[10px] border border-[#EEF1F6] bg-white px-3 py-2 flex items-center justify-between">
                  FY 2024 (Current)
                  <ChevronDown className="h-3 w-3" />
                </div>
                <div className="rounded-[10px] border border-[#EEF1F6] bg-white px-3 py-2 flex items-center justify-between">
                  Maryland, Lagos
                  <ChevronDown className="h-3 w-3" />
                </div>
                <div className="rounded-[10px] border border-[#EEF1F6] bg-white px-3 py-2 flex items-center justify-between">
                  USD ($)
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-left text-[#9CA3AF]">
                      <th className="pb-2">ACCOUNT NAME</th>
                      <th className="pb-2">ANNUAL BUDGET</th>
                      <th className="pb-2">MONTHLY TARGET</th>
                      <th className="pb-2">ACTUAL SPENT (YTD)</th>
                      <th className="pb-2">VARIANCE (%)</th>
                      <th className="pb-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.name + idx} className="border-t border-[#EEF1F6]">
                        <td className={`py-3 ${row.group ? "text-[#111827] font-semibold" : "text-[#111827]"}`}>
                          {row.group ? row.name : ` ${row.name}`}
                        </td>
                        <td className="py-3 text-[#111827]">{row.budget ?? ""}</td>
                        <td className="py-3 text-[#111827]">{row.target ?? ""}</td>
                        <td className="py-3 text-[#111827]">{row.spent ?? ""}</td>
                        <td className={`py-3 ${row.variance?.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                          {row.variance ?? ""}
                        </td>
                        <td className="py-3">
                          {row.status ? (
                            <span
                              className={`rounded-full px-2 py-1 text-[9px] ${
                                row.status === "On Track"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.status === "Warning"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] text-[#9CA3AF]">
                <div>Showing 1-5 of 45 branches</div>
                <div className="flex items-center gap-2">
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Previous</button>
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Next</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
