"use client"

import BudgetPage from "../budget/page"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  X,
  TrendingDown,
} from "lucide-react"

const cards = [
  {
    title: "TOTAL ANNUAL BUDGET",
    value: "$1,250,000.00",
    meta: "FY 2024",
  },
  {
    title: "YTD ACTUAL SPENT",
    value: "$412,305.50",
    meta: "5% below target",
  },
  {
    title: "OVERALL VARIANCE",
    value: "+12.4%",
    meta: "Healthy Surplus",
  },
]

const rows = [
  {
    type: "parent",
    category: "Operational Expenses",
    budget: "$850,000.00",
    monthly: "$70,833.33",
    actual: "$280,500.00",
    variance: "+5.2%",
    status: "On Track",
  },
  {
    type: "child",
    category: "Facilities & Maintenance",
    budget: "$120,000.00",
    monthly: "$10,000.00",
    actual: "$32,500.00",
    variance: "-8.3%",
    status: "Warning",
  },
  {
    type: "child",
    category: "Staff Salaries & Benefits",
    budget: "$600,000.00",
    monthly: "$50,000.00",
    actual: "$195,000.00",
    variance: "+2.5%",
    status: "On Track",
  },
  {
    type: "child",
    category: "Office Supplies & Tech",
    budget: "$130,000.00",
    monthly: "$10,833.33",
    actual: "$53,000.00",
    variance: "+15.0%",
    status: "On Track",
  },
  {
    type: "parent",
    category: "Program Expenses",
    budget: "$300,000.00",
    monthly: "$25,000.00",
    actual: "$112,000.00",
    variance: "-12.0%",
    status: "Exceeded",
  },
  {
    type: "child",
    category: "Youth Ministry",
    budget: "$100,000.00",
    monthly: "$8,333.33",
    actual: "$45,000.00",
    variance: "-35.0%",
    status: "Exceeded",
  },
  {
    type: "child",
    category: "Worship & Media",
    budget: "$150,000.00",
    monthly: "$12,500.00",
    actual: "$55,000.00",
    variance: "+10.0%",
    status: "On Track",
  },
  {
    type: "child",
    category: "Community Outreach",
    budget: "$50,000.00",
    monthly: "$4,166.67",
    actual: "$12,000.00",
    variance: "+4.0%",
    status: "On Track",
  },
  {
    type: "parent",
    category: "Capital Projects",
    budget: "$100,000.00",
    monthly: "$8,333.33",
    actual: "$19,805.50",
    variance: "+40.0%",
    status: "On Track",
  },
]

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0F1115] font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 scale-[1.06] origin-top-left blur-[8px]">
          <BudgetPage />
        </div>
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-[1000px] max-h-[90vh] overflow-y-auto rounded-[18px] bg-white p-6 md:p-10 shadow-[0_25px_60px_rgba(15,23,42,0.35)] flex flex-col">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Budget Performance</h2>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">Detailed Budget vs. Actual (BVA) analysis across all streams.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="h-[38px] flex-1 sm:flex-none justify-center rounded-[10px] border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#374151]">
                <Printer className="mr-2 h-4 w-4 text-[#6B7280]" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button size="sm" className="h-[38px] flex-1 sm:flex-none justify-center rounded-[10px] bg-[#3B5BDB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4 hidden sm:inline-block" />
                <span>Export PDF</span>
              </Button>
              <button
                className="ml-2 flex items-center justify-center text-[#111827] opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close"
              >
                <X className="h-6 w-6 stroke-[2]" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="rounded-[14px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[11px] font-semibold text-[#94A3B8] tracking-wide">{card.title}</div>
                <div
                  className={`mt-2 text-[16px] font-semibold ${
                    card.title === "OVERALL VARIANCE" ? "text-emerald-600" : "text-[#111827]"
                  }`}
                >
                  {card.value}
                </div>
                {card.title === "YTD ACTUAL SPENT" ? (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <TrendingDown className="h-3.5 w-3.5 rotate-180 text-emerald-600" />
                    {card.meta}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#6B7280]">{card.meta}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-semibold text-[#94A3B8] mb-2">FISCAL PERIOD</div>
            <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#111827]">
              FY 2024 (Current)
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[14px] border border-[#EEF1F6]">
            <table className="w-full min-w-[900px] text-[12px]">
              <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                <tr>
                  <th className="py-3 px-4 text-left">ACCOUNT NAME</th>
                  <th className="py-3 px-4 text-right">ANNUAL BUDGET</th>
                  <th className="py-3 px-4 text-right">MONTHLY TARGET</th>
                  <th className="py-3 px-4 text-right">ACTUAL SPENT (YTD)</th>
                  <th className="py-3 px-4 text-right">VARIANCE (%)</th>
                  <th className="py-3 px-4 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                    <td className={`py-3 px-4 font-medium ${row.type === "child" ? "pl-9 text-[#475569]" : "text-[#111827]"}`}>
                      <span className="inline-flex items-center gap-2">
                        {row.type === "parent" ? (
                          <ChevronDown className="h-3.5 w-3.5 text-[#3B5BDB]" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
                        )}
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#334155]">{row.budget}</td>
                    <td className="py-3 px-4 text-right text-[#64748B]">{row.monthly}</td>
                    <td className="py-3 px-4 text-right text-[#0F172A]">{row.actual}</td>
                    <td className={`py-3 px-4 text-right ${row.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                      {row.variance}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          row.status === "Warning"
                            ? "bg-amber-50 text-amber-600"
                            : row.status === "Exceeded"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {row.status === "Warning" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : row.status === "Exceeded" ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-[#EEF1F6] bg-[#F8FAFF] font-semibold">
                  <td className="py-3 px-4 text-[#111827]">TOTALS</td>
                  <td className="py-3 px-4 text-right">$1,250,000.00</td>
                  <td className="py-3 px-4 text-right">$104,166.66</td>
                  <td className="py-3 px-4 text-right">$412,305.50</td>
                  <td className="py-3 px-4 text-right text-emerald-600">+12.4%</td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#9CA3AF] text-center sm:text-left">
            <div>Showing 3 Streams, 10 Budget Heads</div>
            <div>Data updated: Oct 24, 2024 at 10:45 AM</div>
          </div>
        </div>
      </div>
    </div>
  )
}
