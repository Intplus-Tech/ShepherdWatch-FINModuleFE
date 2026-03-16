"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  ShieldCheck,
  Wallet,
} from "lucide-react"

const assets = [
  {
    id: "AST-0021",
    name: "Sound System",
    category: "Equipment",
    location: "Training",
    status: "Serviced",
    value: "?4,200,000",
  },
  {
    id: "AST-0022",
    name: "Public Address",
    category: "Equipment",
    location: "Training",
    status: "In Service",
    value: "?2,100,000",
  },
  {
    id: "AST-0023",
    name: "Air Conditioners",
    category: "Facility",
    location: "Pastor's Office",
    status: "Under Repair",
    value: "?1,850,000",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <aside className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-4 py-5">
            <div className="flex items-center gap-2 pb-5">
              <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
              <div>
                <div className="text-[12px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
                <div className="text-[9px] text-[#9CA3AF]">Lead Pastor View</div>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { label: "Dashboard", icon: LayoutDashboard },
                { label: "Assets", icon: Wallet, active: true },
                { label: "Budget", icon: ShieldCheck },
                { label: "Reports", icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[11px] ${
                      item.active ? "bg-[#E9EEFF] text-[#3B5BDB] font-medium" : "text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                )}
              )}
            </nav>

            <div className="mt-6 space-y-2 text-[10px] text-[#6B7280]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Settings
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Help Center
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-4">
              <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E8EDFF]">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" width={28} height={28} className="h-full w-full object-cover" />
              </div>
              <div className="text-[9px]">
                <div className="font-semibold text-[#111827]">Alex Morgan</div>
                <div className="text-[#9CA3AF]">Lead Pastor</div>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] text-[#9CA3AF]">Dashboard</div>
                <h1 className="text-[14px] font-semibold text-[#111827]">Asset Register</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-rose-500 text-[9px] text-white">
                  New Depreciation
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Add New Asset
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[8px] text-[#3B5BDB]">Register</span>
                  <span className="rounded-full bg-[#F3F5F9] px-2 py-0.5 text-[8px] text-[#6B7280]">Maintenance</span>
                </div>
                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">ASSET ID</th>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">LOCATION</th>
                        <th className="py-2 px-3 text-left">STATUS</th>
                        <th className="py-2 px-3 text-left">CURRENT VALUE</th>
                        <th className="py-2 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-2 px-3 text-[#6B7280]">{asset.id}</td>
                          <td className="py-2 px-3 font-medium">{asset.name}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{asset.location}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[8px] ${
                                asset.status === "Under Repair"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {asset.status}
                            </span>
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
                    <div className="text-[10px] text-[#9CA3AF]">Asset in View</div>
                    <div className="text-[12px] font-semibold text-[#111827]">PA System</div>
                  </div>
                  <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                    <MoreHorizontal className="h-3.5 w-3.5" />
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
                    <span className="text-[#111827]">Training Hall</span>
                  </div>
                </div>

                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
                  <div className="text-[9px] font-semibold text-[#111827]">Asset History</div>
                  <div className="mt-2 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Service Schedule</span>
                      <span className="text-amber-600">Due Soon</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Maintenance</span>
                      <span className="text-[#111827]">Nov 15, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Depreciation</span>
                      <span className="text-[#111827]">Straight Line</span>
                    </div>
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
