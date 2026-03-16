"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react"

const assets = [
  {
    name: "Church Auditorium Roof",
    type: "Building",
    status: "Active",
    value: "?24,000,000",
    updated: "Dec 11, 2023",
  },
  {
    name: "Technical Sound System",
    type: "Equipment",
    status: "Under Review",
    value: "?18,500,000",
    updated: "Jan 05, 2024",
  },
  {
    name: "Security Cameras",
    type: "Equipment",
    status: "Active",
    value: "?6,500,000",
    updated: "Jan 12, 2024",
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
                )
              })}
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
                <h1 className="text-[14px] font-semibold text-[#111827]">ASSET MANAGEMENT</h1>
                <p className="text-[9px] text-[#9CA3AF]">Track asset lifecycle, usage, and depreciation.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  <Calendar className="h-3.5 w-3.5" />
                  Add Asset
                </Button>
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#FCA5A5] bg-rose-50 text-[9px] text-rose-600">
                  Send Maintenance Alert
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[9px] text-[#9CA3AF]">TOTAL ASSET VALUE</div>
                <div className="mt-1 text-[14px] font-semibold text-[#111827]">?28.45M</div>
                <div className="mt-2 h-[90px] rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB]" />
                <div className="mt-2 flex items-center justify-between text-[8px] text-[#9CA3AF]">
                  <span>Current Valuation</span>
                  <span>Depreciation</span>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-[#111827]">Assets in Review</div>
                    <div className="text-[9px] text-[#9CA3AF]">02 Assets awaiting approval</div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#3B5BDB]">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 rounded-[10px] border border-[#EEF1F6] p-3 text-[9px] text-[#6B7280]">
                  Church Auditorium Roof
                  <div className="text-[8px] text-[#9CA3AF]">Next review: Jan 15, 2024</div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Asset Checklist</div>
                <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Insurance Renewals</span>
                    <span className="text-emerald-600">Pass</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maintenance Schedule</span>
                    <span className="text-amber-600">Due</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Review</span>
                    <span className="text-rose-600">Overdue</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[#111827]">Assets Inventory</div>
                <button className="text-[9px] text-[#3B5BDB]">View all</button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">ASSET NAME</th>
                      <th className="py-2 text-left">TYPE</th>
                      <th className="py-2 text-left">STATUS</th>
                      <th className="py-2 text-left">VALUE</th>
                      <th className="py-2 text-left">LAST UPDATED</th>
                      <th className="py-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.name} className="border-t border-[#EEF1F6]">
                        <td className="py-2 font-medium text-[#111827]">{asset.name}</td>
                        <td className="py-2 text-[#6B7280]">{asset.type}</td>
                        <td className="py-2 text-[#6B7280]">{asset.status}</td>
                        <td className="py-2 text-[#111827]">{asset.value}</td>
                        <td className="py-2 text-[#6B7280]">{asset.updated}</td>
                        <td className="py-2 text-right text-[#9CA3AF]">...</td>
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
