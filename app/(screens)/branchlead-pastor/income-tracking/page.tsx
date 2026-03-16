"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  LayoutDashboard,
  Search,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react"

const statCards = [
  { title: "Total Collections", value: "?2.45M", meta: "+12%", tone: "text-emerald-600" },
  { title: "Daily Avg", value: "?111k", meta: "+8%", tone: "text-emerald-600" },
  { title: "Projected", value: "?3.2M", meta: "-4%", tone: "text-rose-600" },
  { title: "YTD Target", value: "81%", meta: "+6%", tone: "text-emerald-600" },
]

const rows = [
  {
    date: "Jan 07, 2024",
    branch: "Queens Annex",
    category: "Offering",
    amount: "?230,000",
    status: "Verified",
  },
  {
    date: "Jan 08, 2024",
    branch: "Chisom Estate",
    category: "Tithes",
    amount: "?320,000",
    status: "Pending",
  },
  {
    date: "Jan 10, 2024",
    branch: "Ikeja Main",
    category: "Tithes",
    amount: "?450,000",
    status: "Verified",
  },
  {
    date: "Jan 12, 2024",
    branch: "Anthony Rivers",
    category: "Special",
    amount: "?680,000",
    status: "Verified",
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
                { label: "Income Tracking", icon: TrendingUp, active: true },
                { label: "Assets", icon: Wallet },
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
                <h1 className="text-[14px] font-semibold text-[#111827]">INCOME TRACKING</h1>
                <p className="text-[9px] text-[#9CA3AF]">Track income, remittances, and branch financial health.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  <Download className="h-3.5 w-3.5" />
                  Import
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                    <div className={`text-[8px] ${card.tone}`}>{card.meta}</div>
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-[#111827]">Income Sources</div>
                  <div className="flex items-center gap-2 text-[8px] text-[#6B7280]">
                    {[
                      "All Transactions",
                      "Tithes",
                      "Offering",
                      "Special Projects",
                      "Promises",
                      "Others",
                    ].map((tab, index) => (
                      <button
                        key={tab}
                        className={`rounded-full px-2 py-0.5 ${
                          index === 0 ? "bg-[#E9EEFF] text-[#3B5BDB]" : "bg-[#F3F5F9] text-[#6B7280]"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">DATE</th>
                        <th className="py-2 px-3 text-left">BRANCH NAME</th>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">AMOUNT</th>
                        <th className="py-2 px-3 text-left">STATUS</th>
                        <th className="py-2 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.date} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-2 px-3 text-[#6B7280]">{row.date}</td>
                          <td className="py-2 px-3 font-medium">{row.branch}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.category}</td>
                          <td className="py-2 px-3 text-[#111827]">{row.amount}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[8px] ${
                                row.status === "Verified"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-[#9CA3AF]">...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">YTD Target</div>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="h-[140px] w-[140px] rounded-full border-[10px] border-[#3B5BDB] relative">
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#111827]">
                        81%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-[#EEF1F6]">
                    <div className="h-2 w-[81%] rounded-full bg-[#3B5BDB]" />
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                    <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                    Summary Insights
                  </div>
                  <p className="mt-2 text-[9px] text-[#6B7280]">
                    We observed a 12% uplift in monthly collections across all
                    branches. The Lagos region leads in tithes and offerings.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
