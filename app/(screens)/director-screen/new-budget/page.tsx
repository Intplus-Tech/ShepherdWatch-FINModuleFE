"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  ChevronDown,
  GripVertical,
  Info,
  PieChart,
  PlusCircle,
  Search,
  Trash2,
  Workflow,
  Save
} from "lucide-react"

const budgetRows = [
  {
    name: "Staff Salaries & Wages",
    type: "Percentage (%)",
    value: "35",
    suffix: "%",
  },
  {
    name: "Facility Maintenance",
    type: "Fixed Amount (₦)",
    value: "1,200,000",
    prefix: "₦",
  },
  {
    name: "Administrative Costs",
    type: "Percentage (%)",
    value: "10",
    suffix: "%",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827] flex flex-col min-h-screen">
        {/* Top Navbar Header */}
        <header className="w-full h-[76px] bg-white border-b border-[#EEF1F6] shadow-sm shadow-[#EEF1F6]/50 flex justify-center relative z-10">
          <div className="w-full h-full max-w-[1400px] mx-auto px-10 lg:px-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[14px] font-medium text-[#9CA3AF]">
              <span>Home</span>
              <span>/</span>
              <span>Configuration</span>
              <span>/</span>
              <span className="text-[#111827] font-bold">Templates</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className="h-[42px] w-[280px] rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] pl-10 text-[13px] placeholder:text-[#9CA3AF]"
                  placeholder="Search templates..."
                />
              </div>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F9FAFB] transition-colors outline-none shrink-0 border-none bg-transparent">
                <Bell className="h-5 w-5" />
                <span className="absolute right-[10px] top-[8px] h-2 w-2 rounded-full border-[1.5px] border-white bg-[#EF4444]" />
              </button>
              <div className="h-8 w-[1px] bg-[#EEF1F6]"></div>
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right">
                  <div className="text-[13px] flex items-center gap-1 font-bold text-[#111827] leading-tight">
                    Rev. Anderson
                    <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
                  </div>
                  <div className="text-[11px] font-medium text-[#6B7280] mt-0.5">Director</div>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-[#111827] ring-1 ring-[#EEF1F6] shrink-0">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 mx-auto w-full px-10 lg:px-16 pt-[37.78px] pb-24 max-w-[910.22px]">
          <section className="w-[910.22px] max-w-full h-[85.33px] flex flex-col md:flex-row md:items-end justify-between">
            <div className="flex flex-col gap-[8.89px]">
              <h1 className="text-[32px] leading-[35.56px] font-black tracking-[-0.8px] text-[#111827]">
                Create New Budget Template
              </h1>
              <p className="w-[594.6px] max-w-full text-[14.22px] leading-[21.33px] font-normal text-[#6B7280]">
                Define standard financial structures for branch implementation. These settings will apply to the FY2025 cycle.
              </p>
            </div>
            <div className="flex items-center gap-[26.82px]">
              <Button
                variant="outline"
                className="w-[98.44px] h-[33.78px] p-0 rounded-[7.11px] border-[0.89px] border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#F9FAFB]"
              >
                Import CSV
              </Button>
              <Button
                variant="outline"
                className="w-[98.44px] h-[33.78px] p-0 rounded-[7.11px] border-[0.89px] border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#F9FAFB]"
              >
                Load Previous
              </Button>
            </div>
          </section>

          <section className="mt-8 space-y-[28px]">
            <div className="rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-6 py-5.5 text-[15px] font-bold text-[#111827]">
                <div className="bg-[#EFF6FF] p-1.5 rounded-full"><Info className="h-4 w-4 text-[#3B5BDB]" /></div>
                General Information
              </div>
              <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-[13px] font-bold text-[#374151]">
                    Template Name <span className="text-[#EF4444]">*</span>
                  </div>
                  <Input className="h-11 rounded-[6px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] placeholder:text-[#9CA3AF] shadow-sm" placeholder="e.g., FY2025 Urban Branch Standard" />
                  <div className="text-[12px] font-medium text-[#9CA3AF]">Must be unique across the organization.</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[13px] font-bold text-[#374151]">Fiscal Year</div>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-between rounded-[6px] border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] font-medium text-[#111827] shadow-sm hover:bg-[#F9FAFB]"
                  >
                    FY 2025
                    <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                  </Button>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-[13px] font-bold text-[#374151]">Description</div>
                  <textarea 
                    className="w-full flex min-h-[96px] rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[14px] font-medium placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] resize-none shadow-sm" 
                    placeholder="Add internal notes about this template structure..." 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="space-y-2">
                <div className="text-[13px] font-bold text-[#374151]">
                  Branch Type <span className="text-[#EF4444]">*</span>
                </div>
                <Button
                  variant="outline"
                  className="h-11 w-full justify-between rounded-[6px] border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] text-[#9CA3AF] font-medium shadow-sm hover:bg-[#F9FAFB]"
                >
                  .e.g. Established
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                </Button>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E7EB] px-6 py-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[16px] font-bold text-[#111827]">
                    <Workflow className="h-5 w-5 text-[#3B5BDB]" />
                    Budget Structure
                  </div>
                  <div className="mt-1 text-[14px] text-[#6B7280]">Configure line items grouped by category.</div>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6B7280]">
                  <button className="rounded-[6px] px-5 py-2.5 bg-[#EFF6FF] text-[#2563EB] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#BFDBFE]">Operational</button>
                  <button className="rounded-[6px] px-5 py-2.5 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] shadow-sm">Program</button>
                  <button className="rounded-[6px] px-5 py-2.5 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] shadow-sm">Capital</button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-center justify-between rounded-[8px] bg-[#EFF6FF] px-4 py-3.5 border border-[#DBEAFE]">
                  <div className="flex items-center gap-2 font-bold text-[#1E40AF] text-[13px]">
                    <PieChart className="h-4 w-4" />
                    Operational Allocation Target:
                  </div>
                  <div className="font-bold text-[#1E40AF] text-[14px]">45% of Total Income</div>
                </div>

                <div className="mt-6">
                  <table className="w-full text-[14px]">
                    <thead className="bg-transparent text-[#6B7280] text-[12px] font-bold tracking-wider">
                      <tr className="border-b-2 border-[#E5E7EB]">
                        <th className="py-3 px-2 text-left w-[40px]">SORT</th>
                        <th className="py-3 px-2 text-left">BUDGET HEAD NAME</th>
                        <th className="py-3 px-2 text-left">ALLOCATION TYPE</th>
                        <th className="py-3 px-2 text-left w-[180px]">DEFAULT VALUE</th>
                        <th className="py-3 px-2 text-center w-[80px]">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetRows.map((row) => (
                        <tr key={row.name} className="border-b border-[#E5E7EB] last:border-0 text-[#111827] hover:bg-[#F9FAFB]">
                          <td className="py-4 px-2 text-[#9CA3AF]">
                            <GripVertical className="h-4 w-4 cursor-grab" />
                          </td>
                          <td className="py-4 px-2 font-bold text-[#111827]">{row.name}</td>
                          <td className="py-4 px-2">
                            <Button
                              variant="outline"
                              className="h-10 w-[200px] justify-between rounded-[6px] border-[#E5E7EB] bg-white text-[13px] text-[#374151] font-medium shadow-sm"
                            >
                              {row.type}
                              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                            </Button>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex h-10 w-[140px] items-center justify-between px-3 rounded-[6px] border border-[#E5E7EB] bg-white shadow-sm">
                              {row.prefix && <span className="text-[#6B7280] font-bold mr-1.5">{row.prefix}</span>}
                              <span className={`text-[#111827] font-bold flex-1 ${!row.prefix ? "text-right" : ""}`}>{row.value}</span>
                              {row.suffix && <span className="text-[#6B7280] font-bold ml-1.5">{row.suffix}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <button className="inline-flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] transition-colors outline-none bg-transparent border-transparent">
                              <Trash2 className="h-[18px] w-[18px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors py-3.5 text-[14px] font-bold text-[#6B7280]">
                  <PlusCircle className="h-4 w-4" />
                  Add Operational Line Item
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Static Edge-to-Edge Footer without max-w constraint */}
        <div className="w-full bg-white mt-auto border-t-[0.89px] border-[#EEF1F6] h-[70.22px] px-6 lg:px-10 flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <div>
              <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">TOTAL ALLOCATION</div>
              <div className="mt-0.5 text-[16px] leading-[24.89px] font-bold text-[#111827] flex items-center">
                45% <span className="text-[#9CA3AF] font-bold mx-1">+</span> ₦1,200,000
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button
                variant="outline"
                className="h-10 px-8 rounded-[8px] border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#374151] shadow-sm hover:bg-[#F9FAFB]"
              >
                Cancel
              </Button>
              <Button className="h-10 px-6 rounded-[8px] bg-[#2E90FA] hover:bg-[#1570EF] text-[13px] font-semibold text-white shadow-sm flex items-center gap-2 transition-colors">
                <Save className="h-4 w-4" />
                Save &amp; Next Branch
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
