"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import {
  ChevronDown,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw as UpdateIcon,
  Building2,
  Calendar,
} from "lucide-react"

const summary = [
  {
    label: "Total Annual Budget",
    value: "₦70,880,840,250",
    note: "FY 2024",
  },
  {
    label: "YTD Actual Spent",
    value: "₦70,880,840,250",
    note: "5% below target",
  },
  {
    label: "Overall Variance",
    value: "+12.4%",
    note: "Healthy Surplus",
  },
]

const rows = [
  { group: true, name: "Operational Expenses", budget: "₦850,000.00", target: "₦70,833.33", spent: "₦280,500.00", variance: "+5.2%", status: "On Track" },
  { name: "Facilities & Maintenance", budget: "₦120,000.00", target: "₦10,000.00", spent: "₦32,500.00", variance: "-8.3%", status: "Warning" },
  { name: "Staff Salaries & Benefits", budget: "₦600,000.00", target: "₦50,000.00", spent: "₦195,000.00", variance: "+2.5%", status: "On Track" },
  { name: "Office Supplies & Tech", budget: "₦130,000.00", target: "₦10,833.33", spent: "₦53,000.00", variance: "+15.0%", status: "On Track" },
  { group: true, name: "Program Expenses", budget: "₦300,000.00", target: "₦25,000.00", spent: "₦112,000.00", variance: "-12.0%", status: "Exceeded" },
  { name: "Youth Ministry", budget: "₦100,000.00", target: "₦8,333.33", spent: "₦45,000.00", variance: "-35.0%", status: "Exceeded" },
  { name: "Worship & Media", budget: "₦150,000.00", target: "₦12,500.00", spent: "₦55,000.00", variance: "+10.0%", status: "On Track" },
  { name: "Community Outreach", budget: "₦50,000.00", target: "₦4,166.67", spent: "₦12,000.00", variance: "+4.0%", status: "On Track" },
  { group: true, name: "Capital Projects", budget: "₦100,000.00", target: "₦8,333.33", spent: "₦19,805.50", variance: "+40.0%", status: "On Track" },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-[#EEF1F6] bg-white xl:flex">
        <SidebarNav activeHref="/director-screen/budgeting" className="border-0" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Building2 className="h-4 w-4 text-[#6B7280]" />
                All Branches
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>
              
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
             {/* Main Budgeting Panel */}
             <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden flex-1">
                
                <div className="p-6 pb-4">
                  {/* Internal Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#111827]">Budget Performance</h2>
                      <p className="text-[13px] text-[#9CA3AF] mt-1">Detailed Budget vs. Actual (BVA) analysis across all streams.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                      <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
                        Budget Control
                      </button>
                      <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 ml-1 transition-colors">
                        <RefreshCw className="h-4 w-4" strokeWidth={2.5} /> Sync Feed
                      </button>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {summary.map((card, i) => (
                      <div key={i} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2 uppercase">{card.label}</p>
                        <div className="flex items-end gap-3 mt-2">
                          <h3 className="text-[28px] leading-tight font-bold text-[#111827]">{card.value}</h3>
                        </div>
                        <p className={`text-[12px] font-bold mt-1.5 ${card.label == "Overall Variance" ? "text-emerald-500" : "text-[#9CA3AF]"}`}>{card.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Filters Block */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-[#FAFBFF] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 text-[13px] text-[#4B5563] font-medium">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">FISCAL PERIOD</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          FY 2024 (Current)
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">BRANCH</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          Maryland, Lagos
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">CURRENCY</span>
                        <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2.5 shadow-sm cursor-pointer">
                          USD ($)
                          <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                      </div>
                      <button className="mt-5 md:mt-auto flex h-[42px] items-center justify-center gap-2 rounded-md bg-[#EEF2FF] px-4 font-bold text-[12px] text-[#3B5BDB] hover:bg-blue-50 transition-colors">
                        <UpdateIcon className="h-4 w-4" /> Update Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-white border-b border-[#EEF1F6]">
                      <tr>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ACCOUNT NAME</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ANNUAL BUDGET</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">MONTHLY TARGET</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">ACTUAL SPENT (YTD)</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">VARIANCE (%)</th>
                        <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {rows.map((row, idx) => (
                        <tr key={row.name + idx} className={`bg-white hover:bg-gray-50/50 transition-colors`}>
                          <td className={`px-6 py-5 text-[12px] flex items-center ${row.group ? "font-bold text-[#111827]" : "font-semibold text-[#6B7280] ml-6"} uppercase tracking-wide`}>
                            {row.group && row.name !== "Capital Projects" ? (
                              <ChevronDown className="h-4 w-4 mr-2" strokeWidth={3} />
                            ) : row.group ? (
                              <ChevronDown className="h-4 w-4 mr-2 -rotate-90" strokeWidth={3} />
                            ) : null}
                            {row.name}
                          </td>
                          <td className={`px-6 py-5 text-[13px] ${row.group ? "font-bold text-[#111827]" : "font-bold text-[#6B7280]"}`}>{row.budget}</td>
                          <td className="px-6 py-5 text-[13px] font-bold text-[#9CA3AF]">{row.target}</td>
                          <td className={`px-6 py-5 text-[13px] ${row.group ? "font-bold text-[#111827]" : "font-bold text-[#6B7280]"}`}>{row.spent}</td>
                          <td className={`px-6 py-5 text-[13px] font-bold ${row.variance.startsWith("-") ? "text-rose-500" : "text-emerald-500"}`}>
                            {row.variance}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                row.status == "On Track"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.status == "Warning"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {row.status == "On Track" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : row.status == "Warning" ? (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-[#FAFBFF] border-t-2 border-[#E5E7EB]">
                        <td className="px-6 py-5 text-[12px] font-bold text-[#111827] uppercase tracking-wide">TOTALS</td>
                        <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">₦1,250,000.00</td>
                        <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">₦104,166.66</td>
                        <td className="px-6 py-5 text-[13px] font-bold text-[#111827]">₦412,305.50</td>
                        <td className="px-6 py-5 text-[13px] font-bold text-emerald-600">+12.4%</td>
                        <td className="px-6 py-5"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between border-t border-[#EEF1F6] p-5">
                  <span className="text-[13px] font-medium text-[#6B7280]">
                    Showing 1-5 of 45 categories
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#9CA3AF] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Previous</button>
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Next</button>
                  </div>
                </div>

             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
