"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  X,
} from "lucide-react"

const branches = [
  {
    code: "ML",
    name: "Maryland, Lagos",
    lastYear: "N43,125,000.00",
    proposed: "N43,125,000.00",
    variance: "-5.6%",
    status: "Pending Review",
    selected: true,
    expanded: true,
  },
  {
    code: "AE",
    name: "Ado-Ekiti, Ekiti",
    lastYear: "N18,425,500.00",
    proposed: "N18,425,500.00",
    variance: "+3.5%",
    status: "Pending Review",
  },
  {
    code: "VL",
    name: "Victoria Island, Lagos",
    lastYear: "N46,523,850.00",
    proposed: "N45,800,714.00",
    variance: "-2.1%",
    status: "Pending Review",
  },
  {
    code: "AE",
    name: "Akala Express, Ibadan",
    lastYear: "N86,312,000.00",
    proposed: "N84,515,000.00",
    variance: "+1.5%",
    status: "Approved",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/budgeting" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

            <div className="mt-4 flex items-center gap-2 text-[10px] text-[#6B7280]">
              <ArrowLeft className="h-3 w-3" /> Back
            </div>

            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#111827]">Budget Control</h2>
                <p className="text-[10px] text-[#9CA3AF]">
                  Review, adjust, and approve proposed annual budgets from regional branches.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                  <Download className="h-3 w-3" /> Export Report
                </button>
                <button className="flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-2.5 py-1.5 text-[10px] text-white">
                  <Check className="h-3 w-3" /> Approve All Pending
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] text-[#9CA3AF]">Total Church Budget</div>
                <div className="mt-2 text-[16px] font-semibold text-[#111827]">N70,880,840,250</div>
                <div className="mt-2 text-[9px] text-emerald-600">+4.2% vs last fiscal year</div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#9CA3AF]">Appropriation Progress</div>
                    <div className="mt-1 text-[14px] font-semibold text-[#111827]">N43,880,840,250</div>
                    <div className="text-[9px] text-[#9CA3AF]">N70.3M Allocated</div>
                  </div>
                  <div className="text-right text-[10px] text-[#3B5BDB] font-semibold">65%</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#EEF1F6]">
                  <div className="h-2 w-[65%] rounded-full bg-[#3B5BDB]" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-[#9CA3AF]">
                  <span>12 Branches Pending Review</span>
                  <span>N27,000,840,250 Remaining</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-[10px] text-[#6B7280] w-full lg:w-[260px]">
                <Search className="h-3.5 w-3.5" /> Search by branch name...
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                  All Regions
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                  Status: All
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                    <tr>
                      <th className="py-3 px-4 text-left"> </th>
                      <th className="py-3 px-4 text-left">BRANCH</th>
                      <th className="py-3 px-4 text-left">LAST YEAR (ACTUAL)</th>
                      <th className="py-3 px-4 text-left">PROPOSED (2024)</th>
                      <th className="py-3 px-4 text-left">VARIANCE</th>
                      <th className="py-3 px-4 text-left">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b) => (
                      <>
                        <tr key={b.name} className="border-t border-[#EEF1F6]">
                          <td className="py-3 px-4">
                            <div className="h-4 w-4 rounded border border-[#E5E7EB] flex items-center justify-center">
                              {b.selected ? <Check className="h-3 w-3 text-[#3B5BDB]" /> : null}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-[#9CA3AF]" />
                              <div className="h-6 w-6 rounded-full bg-[#E9EEFF] flex items-center justify-center text-[10px] text-[#3B5BDB] font-semibold">
                                {b.code}
                              </div>
                              <div className="text-[#111827]">{b.name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#6B7280]">{b.lastYear}</td>
                          <td className="py-3 px-4 text-[#111827] font-semibold">{b.proposed}</td>
                          <td className={`py-3 px-4 ${b.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                            {b.variance}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-1 text-[9px] ${
                                b.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-[#9CA3AF]">
                            <div className="flex items-center justify-end gap-2">
                              <X className="h-3 w-3" />
                              <Check className="h-3 w-3 text-[#3B5BDB]" />
                            </div>
                          </td>
                        </tr>
                        {b.expanded ? (
                          <tr className="border-t border-[#EEF1F6] bg-[#FBFCFF]">
                            <td className="py-3 px-4" />
                            <td className="py-3 px-4 text-[9px] text-[#9CA3AF]">SUGGESTED ALLOCATION BREAKDOWN</td>
                            <td className="py-3 px-4" colSpan={5}>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {[
                                  { label: "Operational", value: "N85,886,000" },
                                  { label: "Capital", value: "N15,125,000" },
                                  { label: "Program", value: "N4,325,000" },
                                  { label: "Monthly Cashflow", value: "" },
                                ].map((item) => (
                                  <div key={item.label} className="rounded-[10px] border border-[#EEF1F6] bg-white p-2">
                                    <div className="text-[9px] text-[#9CA3AF]">{item.label}</div>
                                    {item.value ? (
                                      <div className="mt-1 text-[11px] font-semibold text-[#111827]">{item.value}</div>
                                    ) : (
                                      <div className="mt-2 h-8 rounded bg-[#E9EEFF]" />
                                    )}
                                    <div className="mt-2 h-1 rounded-full bg-[#EEF1F6]">
                                      <div className="h-1 w-3/5 rounded-full bg-[#3B5BDB]" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[9px] text-[#9CA3AF]">
                <div>Showing 1-5 of 45 branches</div>
                <div className="flex items-center gap-2">
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Previous</button>
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280]">Next</button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-4 rounded-full bg-[#111827] px-4 py-2 text-[10px] text-white">
                <span>2 Items Selected</span>
                <button className="text-[#9CA3AF]">Reject</button>
                <button className="rounded-full bg-[#3B5BDB] px-3 py-1">Approve Selected</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
