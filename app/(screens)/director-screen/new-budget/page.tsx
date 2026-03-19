"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  ChevronDown,
  Download,
  FolderKanban,
  GripVertical,
  Info,
  Plus,
  Search,
  Settings,
} from "lucide-react"

const budgetRows = [
  {
    name: "Staff Salaries & Wages",
    type: "Percentage (%)",
    value: "35 %",
  },
  {
    name: "Facility Maintenance",
    type: "Fixed Amount (N)",
    value: "N 120,000",
  },
  {
    name: "Administrative Costs",
    type: "Percentage (%)",
    value: "10 %",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <div className="flex items-center justify-between gap-6 border-b border-[#EEF1F6] border-b-[0.89px] h-[56.89px]">
            <div className="flex items-center gap-2 text-[12.44px] leading-[17.78px] font-normal text-[#9CA3AF]">
              <span>Home</span>
              <span>/</span>
              <span>Configuration</span>
              <span>/</span>
              <span className="text-[#6B7280]">Templates</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <Input
                  className="h-8 w-[190px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[10px]"
                  placeholder="Search templates..."
                />
              </div>
              <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280]">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#EF4444]" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] font-medium text-[#111827]">Rev. Anderson</div>
                  <div className="text-[9px] text-[#9CA3AF]">Director</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#111827]" />
              </div>
            </div>
          </div>

          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-[32px] leading-[35.56px] font-black tracking-[-0.8px] text-[#111827]">
                  Create New Budget Template
                </h1>
                <p className="text-[14.22px] leading-[21.33px] font-normal text-[#9CA3AF]">
                  Define standard financial structures for branch implementation. These settings will apply
                  <br />
                  to the FY2025 cycles.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                >
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                >
                  Load Previous
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center gap-2 border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold text-[#111827]">
                  <Info className="h-4 w-4 text-[#3B5BDB]" />
                  General Information
                </div>
                <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Template Name *</div>
                    <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g., FY2025 Urban Branch Standard" />
                    <div className="text-[8px] text-[#9CA3AF]">Must be unique across the organization.</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-medium text-[#6B7280]">Fiscal Year</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                    >
                      FY 2025
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-[9px] font-medium text-[#6B7280]">Description</div>
                    <Input className="h-16 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="Add internal notes about this template structure..." />
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white px-4 py-4">
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Branch Type *</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    e.g., Established
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                      <FolderKanban className="h-4 w-4 text-[#3B5BDB]" />
                      Budget Structure
                    </div>
                    <div className="text-[9px] text-[#9CA3AF]">Configure line items grouped by category.</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#6B7280]">
                    <button className="rounded-[8px] bg-[#EEF2FF] px-3 py-1 text-[#3B5BDB]">Operational</button>
                    <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1">Program</button>
                    <button className="rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1">Capital</button>
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-center justify-between rounded-[10px] border border-[#DBEAFE] bg-[#F0F7FF] px-3 py-2 text-[9px]">
                    <div className="flex items-center gap-2 text-[#1E3A8A]">
                      <Settings className="h-3.5 w-3.5" />
                      Operational Allocation Target
                    </div>
                    <div className="text-[#1E3A8A]">45% of Total Income</div>
                  </div>

                  <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                    <table className="w-full text-[9px]">
                      <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                        <tr>
                          <th className="py-2 px-3 text-left">SORT</th>
                          <th className="py-2 px-3 text-left">BUDGET HEAD NAME</th>
                          <th className="py-2 px-3 text-left">ALLOCATION TYPE</th>
                          <th className="py-2 px-3 text-left">DEFAULT VALUE</th>
                          <th className="py-2 px-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetRows.map((row) => (
                          <tr key={row.name} className="border-t border-[#EEF1F6] text-[#111827]">
                            <td className="py-2 px-3 text-[#9CA3AF]"><GripVertical className="h-3.5 w-3.5" /></td>
                            <td className="py-2 px-3 text-[9px] font-medium text-[#111827]">{row.name}</td>
                            <td className="py-2 px-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                              >
                                {row.type}
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </td>
                            <td className="py-2 px-3 text-[#6B7280]">{row.value}</td>
                            <td className="py-2 px-3 text-right text-[#9CA3AF]">...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#DBEAFE] bg-[#F9FBFF] py-2 text-[9px] text-[#3B5BDB]">
                    <Plus className="h-3.5 w-3.5" />
                    Add Operational Line Item
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[9px] text-[#6B7280]">
              <div>
                <div className="text-[8px] text-[#9CA3AF]">TOTAL ALLOCATION</div>
                <div className="text-[11px] font-semibold text-[#111827]">45%  •  N 1,200,000</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                >
                  Cancel
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Save &amp; Next Branch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
