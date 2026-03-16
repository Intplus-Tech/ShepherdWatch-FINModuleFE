"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react"

const summaryCards = [
  { title: "Total Depreciation", value: "?1.45M", meta: "+8%", tone: "text-emerald-600" },
  { title: "Critical Assets", value: "?120k", meta: "-3%", tone: "text-rose-600" },
  { title: "Net Book Value", value: "?6.7M", meta: "+5%", tone: "text-emerald-600" },
]

const depreciationRows = [
  {
    category: "Equipment",
    method: "Straight Line",
    rate: "10%",
    value: "?1.2M",
    change: "-?120k",
  },
  {
    category: "Vehicles",
    method: "Reducing Balance",
    rate: "15%",
    value: "?2.4M",
    change: "-?210k",
  },
  {
    category: "Facilities",
    method: "Straight Line",
    rate: "5%",
    value: "?3.1M",
    change: "-?85k",
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
                { label: "Depreciation", icon: TrendingDown, active: true },
                { label: "Assets", icon: Wallet },
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
                <h1 className="text-[14px] font-semibold text-[#111827]">Depreciation Schedule &amp; Analysis</h1>
                <p className="text-[9px] text-[#9CA3AF]">Track depreciation timelines and asset value changes.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  <Calendar className="h-3.5 w-3.5" />
                  Export
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                    <div className={`text-[8px] ${card.tone}`}>{card.meta}</div>
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Category-wise Depreciation</div>
                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">METHOD</th>
                        <th className="py-2 px-3 text-left">RATE</th>
                        <th className="py-2 px-3 text-left">CURRENT VALUE</th>
                        <th className="py-2 px-3 text-left">MONTHLY CHANGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depreciationRows.map((row) => (
                        <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-2 px-3 font-medium">{row.category}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.method}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.rate}</td>
                          <td className="py-2 px-3 text-[#111827]">{row.value}</td>
                          <td className="py-2 px-3 text-rose-600">{row.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Depreciation Trend</div>
                  <div className="mt-3 h-[160px] rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB]" />
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">2024 Monthly Distribution</div>
                  <div className="mt-3 grid grid-cols-6 gap-2 text-[8px] text-[#9CA3AF]">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-[40px] rounded-[6px] bg-[#EEF2FF]" />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[8px] text-[#9CA3AF]">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
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
