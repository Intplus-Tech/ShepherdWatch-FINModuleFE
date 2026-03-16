"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  ChevronDown,
  Filter,
  Search,
} from "lucide-react"

const assets = [
  {
    name: "Church Sound System (V1)",
    category: "Electronics",
    purchase: "Oct 12, 2023",
    value: "?4,200,000",
    status: "Serviced",
  },
  {
    name: "Industrial Generator 250kVA",
    category: "Power Plant",
    purchase: "Jan 15, 2024",
    value: "?6,250,000",
    status: "Under Review",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/asset" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Asset Management"
              subtitle="Asset valuation overview for January 2024"
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#FCA5A5] bg-rose-50 text-[9px] text-rose-600">
                    Maintenance Checklist
                  </Button>
                </div>
              }
            />

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[9px] text-[#9CA3AF]">ASSET VALUATION</div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">?28.45M</div>
                <div className="mt-2 h-[90px] rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB]" />
                <div className="mt-2 flex items-center justify-between text-[8px] text-[#9CA3AF]">
                  <span>Equipment</span>
                  <span>Facilities</span>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[9px] text-[#9CA3AF]">HEALTH STATUS</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full border-[8px] border-[#3B5BDB] flex items-center justify-center text-[11px] font-semibold text-[#111827]">
                    87%
                  </div>
                  <div className="text-[9px] text-[#6B7280]">
                    <div className="font-semibold text-[#111827]">Asset Health</div>
                    <div className="mt-1 text-[#9CA3AF]">Maintenance review pending</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-2 py-1 text-[8px] text-[#B45309]">
                  <AlertTriangle className="h-3 w-3" />
                  System check required
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[9px] text-[#9CA3AF]">CAPITAL ACTIVITY</div>
                <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>New Asset Added</span>
                    <span className="text-[#111827]">Today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Equipment Service</span>
                    <span className="text-[#111827]">This Week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retire Old Asset</span>
                    <span className="text-[#111827]">Pending</span>
                  </div>
                </div>
                <div className="mt-3 rounded-[8px] border border-[#EEF1F6] bg-[#F9FAFB] px-2 py-1 text-[8px] text-[#6B7280]">
                  View full activity
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-[#111827]">Active Assets Inventory</div>
                  <div className="text-[9px] text-[#9CA3AF]">Manage records and depreciation status</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                    <Input className="h-7 w-[180px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[9px]" placeholder="Search assets..." />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    View All
                  </Button>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">ASSET NAME</th>
                      <th className="py-2 text-left">CATEGORY</th>
                      <th className="py-2 text-left">PURCHASE DATE</th>
                      <th className="py-2 text-left">VALUE</th>
                      <th className="py-2 text-left">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.name} className="border-t border-[#EEF1F6]">
                        <td className="py-2 font-medium text-[#111827]">{asset.name}</td>
                        <td className="py-2 text-[#6B7280]">{asset.category}</td>
                        <td className="py-2 text-[#6B7280]">{asset.purchase}</td>
                        <td className="py-2 text-[#111827]">{asset.value}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] ${
                            asset.status === "Serviced" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>{asset.status}</span>
                        </td>
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
