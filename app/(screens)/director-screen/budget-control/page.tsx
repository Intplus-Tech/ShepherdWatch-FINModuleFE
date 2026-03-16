"use client"

import { Fragment } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Calendar,
  Building2,
} from "lucide-react"

const branches = [
  {
    id: "branch-1",
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
    id: "branch-2",
    code: "AE",
    name: "Ado-Ekiti, Ekiti",
    lastYear: "N18,425,500.00",
    proposed: "N18,425,500.00",
    variance: "+3.5%",
    status: "Pending Review",
  },
  {
    id: "branch-3",
    code: "VL",
    name: "Victoria Island, Lagos",
    lastYear: "N46,523,850.00",
    proposed: "N45,800,714.00",
    variance: "-2.1%",
    status: "Pending Review",
  },
  {
    id: "branch-4",
    code: "AE",
    name: "Akala Express, Ibadan",
    lastYear: "N86,312,000.00",
    proposed: "N84,515,000.00",
    variance: "+1.5%",
    status: "Approved",
  },
]

const bigText = "text-[14.36px] leading-[22.33px] font-bold"
const smallText = "text-[11.17px] leading-[15.95px] font-semibold"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-[#EEF1F6] bg-white xl:flex">
        <SidebarNav activeHref="/director-screen/budgeting" className="border-0" />
      </aside>

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
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
                {"NGN USD EUR".split(" ").map((c) => (
                  <span
                    key={c}
                    className={
                      c === "NGN"
                        ? "rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white"
                        : "rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]"
                    }
                  >
                    {c}
                  </span>
                ))}
              </div>

              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          <div className={`mt-6 flex items-center gap-2 ${smallText} text-[#6B7280]`}>
            <ArrowLeft className="h-4 w-4" /> Back
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`${bigText} text-[#111827]`}>Budget Control</h2>
              <p className={`text-[#9CA3AF] ${smallText}`}>
                Review, adjust, and approve proposed annual budgets from regional branches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#4B5563] shadow-sm hover:bg-gray-50`}>
                <Download className="h-4 w-4 text-[#6B7280]" /> Export Report
              </button>

              <button className={`flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 ${smallText} text-white shadow hover:bg-blue-700`}>
                <Check className="h-4 w-4" /> Approve All Pending
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className={`text-[#9CA3AF] ${smallText}`}>Total Church Budget</div>

              <div className={`mt-2 ${bigText} text-[#111827]`}>N70,880,840,250</div>

              <div className={`mt-2 ${smallText} text-emerald-600`}>+4.2% vs last fiscal year</div>
            </div>

            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-[#9CA3AF] ${smallText}`}>Appropriation Progress</div>
                  <div className={`mt-1 ${bigText} text-[#111827]`}>N43,880,840,250</div>
                  <div className={`text-[#9CA3AF] ${smallText}`}>N70.3M Allocated</div>
                </div>

                <div className={`text-[#3B5BDB] ${bigText}`}>65%</div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-[#EEF1F6]">
                <div className="h-2 w-[65%] rounded-full bg-[#3B5BDB]" />
              </div>

              <div className={`mt-2 flex items-center justify-between text-[#9CA3AF] ${smallText}`}>
                <span>12 Branches Pending Review</span>
                <span>N27,000,840,250 Remaining</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] text-[#6B7280] w-full lg:w-[300px]">
              <Search className="h-4 w-4" /> Search by branch name...
            </div>

            <div className="flex items-center gap-2">
              <button className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#6B7280]`}>
                All Regions
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <button className={`flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 ${smallText} text-[#6B7280]`}>
                Status: All
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left"></th>
                    <th className="py-3 px-4 text-left">BRANCH</th>
                    <th className="py-3 px-4 text-left">LAST YEAR (ACTUAL)</th>
                    <th className="py-3 px-4 text-left">PROPOSED (2024)</th>
                    <th className="py-3 px-4 text-left">VARIANCE</th>
                    <th className="py-3 px-4 text-left">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {branches.map((branch) => (
                    <Fragment key={branch.id}>
                      <tr className="border-t border-[#EEF1F6]">
                        <td className="py-3 px-4">
                          <div className="h-4 w-4 rounded border border-[#E5E7EB] flex items-center justify-center">
                            {branch.selected && (
                              <Check className="h-3 w-3 text-[#3B5BDB]" />
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-[#9CA3AF]" />

                            <div className="h-6 w-6 rounded-full bg-[#E9EEFF] flex items-center justify-center text-[10px] text-[#3B5BDB] font-semibold">
                              {branch.code}
                            </div>

                            <div className="text-[#111827]">
                              {branch.name}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#6B7280]">
                          {branch.lastYear}
                        </td>

                        <td className="py-3 px-4 text-[#111827] font-semibold">
                          {branch.proposed}
                        </td>

                        <td
                          className={`py-3 px-4 ${
                            branch.variance.startsWith("-")
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {branch.variance}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] ${
                              branch.status === "Approved"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {branch.status === "Approved" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {branch.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right text-[#9CA3AF]">
                          <div className="flex items-center justify-end gap-2">
                            <X className="h-3 w-3" />
                            <Check className="h-3 w-3 text-[#3B5BDB]" />
                          </div>
                        </td>
                      </tr>

                      {branch.expanded && (
                        <tr className="border-t border-[#EEF1F6] bg-[#FBFCFF]">
                          <td className="py-3 px-4" />

                          <td className={`py-3 px-4 text-[#9CA3AF] ${smallText}`}>
                            SUGGESTED ALLOCATION BREAKDOWN
                          </td>

                          <td colSpan={5} className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {[
                                { label: "Operational", value: "N85,886,000" },
                                { label: "Capital", value: "N15,125,000" },
                                { label: "Program", value: "N4,325,000" },
                                { label: "Monthly Cashflow", value: "" },
                              ].map((item) => (
                                <div key={item.label} className="rounded-[10px] border border-[#EEF1F6] bg-white p-2">
                                  <div className={`text-[#9CA3AF] ${smallText}`}>{item.label}</div>

                                  {item.value ? (
                                    <div className={`mt-1 ${bigText} text-[#111827]`}>{item.value}</div>
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
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`flex items-center justify-between px-4 py-3 text-[#9CA3AF] ${smallText}`}>
              <div>Showing 1-5 of 45 branches</div>

              <div className="flex items-center gap-2">
                <button className={`rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280] ${smallText}`}>
                  Previous
                </button>

                <button className={`rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1 text-[#6B7280] ${smallText}`}>
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className={`flex items-center gap-4 rounded-full bg-[#111827] px-4 py-2 text-white ${smallText}`}>
              <span>2 Items Selected</span>

              <button className="text-[#9CA3AF]">Reject</button>

              <button className="rounded-full bg-[#3B5BDB] px-3 py-1">
                Approve Selected
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
