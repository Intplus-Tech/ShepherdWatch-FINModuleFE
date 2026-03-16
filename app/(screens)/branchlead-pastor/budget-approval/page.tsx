"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
} from "lucide-react"

const budgetCards = [
  { title: "Total Budget", value: "?3,000,000", meta: "+2% vs last month", tone: "text-emerald-600" },
  { title: "Committed", value: "80%", meta: "?2.4M committed", tone: "text-amber-600" },
  { title: "Spent", value: "65%", meta: "?1.95M spent", tone: "text-rose-600" },
  { title: "Available", value: "19%", meta: "?570,000 left", tone: "text-emerald-600" },
]

const budgetRows = [
  {
    category: "Operational",
    annual: "?1,500,000",
    ytd: "?1,025,000",
    remaining: "?475,000",
    status: "On track",
  },
  {
    category: "Program",
    annual: "?800,000",
    ytd: "?520,000",
    remaining: "?280,000",
    status: "Caution",
  },
  {
    category: "Capital",
    annual: "?700,000",
    ytd: "?410,000",
    remaining: "?290,000",
    status: "On track",
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
                { label: "Budget Control", icon: Wallet, active: true },
                { label: "Compliance", icon: ShieldCheck },
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
                <h1 className="text-[14px] font-semibold text-[#111827]">BUDGET CONTROL</h1>
                <p className="text-[9px] text-[#9CA3AF]">Hierarchical budget performance for January 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  FY 2024
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-rose-500 text-[9px] text-white">
                  Approve New Budget
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Export Report
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {budgetCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                  <div className={`mt-1 text-[8px] ${card.tone}`}>{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-[#111827]">Hierarchical Budget View</div>
                  <div className="flex items-center gap-2 text-[8px] text-[#6B7280]">
                    <button className="rounded-full bg-[#E9EEFF] px-2 py-0.5 text-[#3B5BDB]">By Category</button>
                    <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">By Department</button>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">ANNUAL BUDGET</th>
                        <th className="py-2 px-3 text-left">YTD SPEND</th>
                        <th className="py-2 px-3 text-left">REMAINING</th>
                        <th className="py-2 px-3 text-left">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetRows.map((row) => (
                        <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-2 px-3 font-medium">{row.category}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.annual}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.ytd}</td>
                          <td className="py-2 px-3 text-[#111827]">{row.remaining}</td>
                          <td className={`py-2 px-3 ${row.status === "Caution" ? "text-amber-600" : "text-emerald-600"}`}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Monthly Utilization</div>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="h-[140px] w-[140px] rounded-full border-[10px] border-[#3B5BDB] relative">
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#111827]">65%</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Operational</span>
                      <span>?1,020,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Program</span>
                      <span>?620,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Capital</span>
                      <span>?310,000</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-[#3B5BDB] p-4 text-white">
                  <div className="text-[10px] font-semibold">Quick Forecast</div>
                  <div className="mt-1 text-[8px] text-white/80">
                    Estimated total spend for Q1 based on current burn rate.
                  </div>
                  <div className="mt-3 text-[14px] font-semibold">?1,240,000</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
