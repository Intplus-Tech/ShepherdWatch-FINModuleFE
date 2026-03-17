"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import {
  Bell,
  ChevronDown,
  MoreHorizontal,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react"

const assets = [
  {
    id: "AST-0021",
    name: "PA System",
    category: "Electronics",
    location: "Main Sanctuary",
    status: "Operational",
    value: "?850,000",
  },
  {
    id: "AST-0022",
    name: "Toyota Coaster",
    category: "Vehicle",
    location: "Garage",
    status: "Maintenance",
    value: "?1,200,000",
  },
  {
    id: "AST-0023",
    name: "Office Chairs",
    category: "Furniture",
    location: "Admin Office",
    status: "Pending Review",
    value: "?350,000",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/asset-register" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <BranchAccountantHeader
              title="Asset Register"
              subtitle="Review asset registers and lifecycle data."
              rightSlot={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    January 2024
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-7 rounded-[8px] bg-rose-500 text-[9px] text-white">
                    Asset Compliance
                  </Button>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                </div>
              }
            />

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[9px] text-[#6B7280]">
                  <button className="rounded-full bg-[#E9EEFF] px-2 py-0.5 text-[#3B5BDB]">All Assets</button>
                  <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">Electronics</button>
                  <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">Vehicles</button>
                  <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">Maintenance</button>
                </div>

                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">ASSET ID</th>
                        <th className="py-2 px-3 text-left">DESCRIPTION</th>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">LOCATION</th>
                        <th className="py-2 px-3 text-left">STATUS</th>
                        <th className="py-2 px-3 text-left">CURRENT VALUE</th>
                        <th className="py-2 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id} className="border-t border-[#EEF1F6]">
                          <td className="py-2 px-3 text-[#6B7280]">{asset.id}</td>
                          <td className="py-2 px-3 font-medium text-[#111827]">{asset.name}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{asset.category}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{asset.location}</td>
                          <td className="py-2 px-3">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] ${
                              asset.status === "Operational"
                                ? "bg-emerald-50 text-emerald-600"
                                : asset.status === "Maintenance"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}>{asset.status}</span>
                          </td>
                          <td className="py-2 px-3 text-[#111827]">{asset.value}</td>
                          <td className="py-2 px-3 text-right text-[#9CA3AF]">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-[#9CA3AF]">Asset in View</div>
                    <div className="text-[12px] font-semibold text-[#111827]">PA System</div>
                  </div>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <X className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] p-3">
                  <div className="flex items-center justify-between text-[9px] text-[#6B7280]">
                    <span>Current Value</span>
                    <span className="font-semibold text-[#111827]">?850,000</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#EEF1F6]">
                    <div className="h-2 w-[65%] rounded-full bg-[#3B5BDB]" />
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Asset Type</span>
                    <span className="text-[#111827]">Equipment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Acquisition Date</span>
                    <span className="text-[#111827]">Dec 12, 2023</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location</span>
                    <span className="text-[#111827]">Main Sanctuary</span>
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                  <div className="text-[9px] font-semibold text-[#111827]">Maintenance Log</div>
                  <div className="mt-2 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Last Service</span>
                      <span className="text-[#111827]">Nov 15, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Next Review</span>
                      <span className="text-amber-600">Due Soon</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Depreciation</span>
                      <span className="text-[#111827]">Straight Line</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] bg-[#EFF6FF] p-3 text-[9px] text-[#1E3A8A]">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5" />
                    Asset is due for review in 5 days.
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
