"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
} from "lucide-react"

const summaryCards = [
  { title: "Total Budget", value: "?12,500,450,000.00", meta: "FY 2024" },
  { title: "Total Expenses", value: "?8,000,215,500.00", meta: "YTD" },
  { title: "Net Budget Remaining", value: "?4,552,800,000.00", meta: "65%" },
  { title: "Next Review", value: "?25,000,417.00", meta: "Jan 15, 2024" },
]

const budgetRows = [
  {
    category: "Operations",
    amount: "?2,000,000",
    ytd: "?640,000",
    variance: "-4%",
  },
  {
    category: "Programs & Events",
    amount: "?1,200,000",
    ytd: "?420,000",
    variance: "+2%",
  },
  {
    category: "Facility Maintenance",
    amount: "?800,000",
    ytd: "?300,000",
    variance: "-1%",
  },
  {
    category: "Administration",
    amount: "?450,000",
    ytd: "?140,000",
    variance: "+1%",
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
                { label: "Budget Review", icon: Wallet, active: true },
                { label: "Compliance", icon: ShieldCheck },
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
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#9CA3AF]">Dashboard</div>
                <h1 className="text-[14px] font-semibold text-[#111827]">Annual Budget Proposal 2024</h1>
                <p className="text-[9px] text-[#9CA3AF]">Updated on Jan 3, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  Send Back
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  Approve Budget
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[12px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white">
              <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                  <button className="rounded-full bg-[#E9EEFF] px-2 py-0.5 text-[#3B5BDB]">Operational</button>
                  <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">Capital</button>
                  <button className="rounded-full bg-[#F3F5F9] px-2 py-0.5">Programs</button>
                </div>
                <div className="text-[9px] text-[#6B7280]">Page 1 of 2</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 px-3 text-left">CATEGORY</th>
                      <th className="py-2 px-3 text-left">AMOUNT</th>
                      <th className="py-2 px-3 text-left">YTD SPEND</th>
                      <th className="py-2 px-3 text-left">VARIANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetRows.map((row) => (
                      <tr key={row.category} className="border-t border-[#EEF1F6]">
                        <td className="py-2 px-3 font-medium text-[#111827]">{row.category}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.amount}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.ytd}</td>
                        <td className={`py-2 px-3 ${row.variance.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>{row.variance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-2 text-[9px] text-[#6B7280]">
                <div>Showing 1-10 of 25 entries</div>
                <div className="flex items-center gap-2">
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1">Previous</button>
                  <button className="rounded-[6px] border border-[#E5E7EB] bg-white px-2 py-1">Next</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
