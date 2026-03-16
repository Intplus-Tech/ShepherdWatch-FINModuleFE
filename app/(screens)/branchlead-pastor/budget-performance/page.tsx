"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const cards = [
  {
    title: "Total Budget",
    value: "?1,250,000",
    meta: "FY 2024",
  },
  {
    title: "Total Spent",
    value: "?912,305.50",
    meta: "YTD",
  },
  {
    title: "Overall Variance",
    value: "+12.4%",
    meta: "Vs Budget",
  },
]

const rows = [
  {
    category: "Operational Expenses",
    budget: "?400,000",
    spent: "?320,000",
    remaining: "?80,000",
    variance: "+4.2%",
    status: "On Track",
  },
  {
    category: "Utilities & Rentals",
    budget: "?210,000",
    spent: "?198,000",
    remaining: "?12,000",
    variance: "-2.1%",
    status: "Caution",
  },
  {
    category: "Staff Salaries",
    budget: "?340,000",
    spent: "?286,000",
    remaining: "?54,000",
    variance: "+1.4%",
    status: "On Track",
  },
  {
    category: "Program Expenses",
    budget: "?200,000",
    spent: "?108,000",
    remaining: "?92,000",
    variance: "+7.4%",
    status: "On Track",
  },
  {
    category: "Capital Projects",
    budget: "?100,000",
    spent: "?0",
    remaining: "?100,000",
    variance: "0%",
    status: "On Track",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="relative min-h-[700px] bg-[#F7F8FC]">
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 px-6 py-6">
            <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111827]">Budget Performance</h2>
                  <p className="text-[9px] text-[#9CA3AF]">Detailed analysis for all operational accounts in Q1 2024.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    FY 2024
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Export Report
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <X className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {cards.map((card) => (
                  <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                    <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                    <div className="mt-2 text-[13px] font-semibold text-[#111827]">{card.value}</div>
                    <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[9px] text-[#6B7280]">
                  <div>Report Period</div>
                  <div className="text-[#111827] font-semibold">FY 2024 Q1</div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#EEF1F6]">
                  <div className="h-1.5 w-[65%] rounded-full bg-[#3B5BDB]" />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
                <table className="w-full text-[9px]">
                  <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 px-3 text-left">CATEGORY</th>
                      <th className="py-2 px-3 text-left">ANNUAL BUDGET</th>
                      <th className="py-2 px-3 text-left">YTD SPEND</th>
                      <th className="py-2 px-3 text-left">REMAINING</th>
                      <th className="py-2 px-3 text-left">VARIANCE</th>
                      <th className="py-2 px-3 text-left">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                        <td className="py-2 px-3 font-medium">{row.category}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.budget}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.spent}</td>
                        <td className="py-2 px-3 text-[#111827]">{row.remaining}</td>
                        <td className="py-2 px-3 text-emerald-600">{row.variance}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[8px] ${
                              row.status === "Caution"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between text-[8px] text-[#9CA3AF]">
                <div>Showing 1-5 of 19 categories</div>
                <div>Last updated: Jan 24, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
