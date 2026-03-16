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

const rows = [
  {
    category: "PAYE Tax",
    dueDate: "Jan 15, 2024",
    amount: "?317,500",
    status: "Paid",
  },
  {
    category: "Payroll Stamp",
    dueDate: "Jan 20, 2024",
    amount: "?41,200",
    status: "Pending",
  },
  {
    category: "National Housing",
    dueDate: "Jan 24, 2024",
    amount: "?84,000",
    status: "Overdue",
  },
  {
    category: "Pension Statutory",
    dueDate: "Jan 30, 2024",
    amount: "?80,300",
    status: "Paid",
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
                { label: "Compliance & Remittance", icon: ShieldCheck, active: true },
                { label: "Budget", icon: Wallet },
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
                <h1 className="text-[14px] font-semibold text-[#111827]">STATUTORY COMPLIANCE</h1>
                <p className="text-[9px] text-[#9CA3AF]">Monitoring compliance and remittance obligations for January 2024.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  January 2024
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                { title: "Remittance Due", value: "?317,500", meta: "Monthly Due" },
                { title: "Total Remitted", value: "?4.25M", meta: "Jan Remittance" },
                { title: "Compliance Rate", value: "13.4%", meta: "Vs last month" },
              ].map((card) => (
                <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                  <div className="text-[9px] text-[#9CA3AF]">{card.title}</div>
                  <div className="mt-2 text-[14px] font-semibold text-[#111827]">{card.value}</div>
                  <div className="text-[8px] text-[#6B7280]">{card.meta}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[10px] font-semibold text-[#111827]">Remittance Schedule</div>
                <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                  <table className="w-full text-[9px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-2 px-3 text-left">CATEGORY</th>
                        <th className="py-2 px-3 text-left">DUE DATE</th>
                        <th className="py-2 px-3 text-left">AMOUNT</th>
                        <th className="py-2 px-3 text-left">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.category} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-2 px-3 font-medium">{row.category}</td>
                          <td className="py-2 px-3 text-[#6B7280]">{row.dueDate}</td>
                          <td className="py-2 px-3 text-[#111827]">{row.amount}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[8px] ${
                                row.status === "Paid"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.status === "Pending"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-[#1D4ED8] p-4 text-white">
                  <div className="text-[10px] font-semibold">Compliance Rate</div>
                  <div className="mt-2 text-[12px] font-semibold">?1,650,000</div>
                  <div className="mt-3 text-[8px] text-white/80">Monthly Total</div>
                  <div className="mt-2 text-[9px]">Total Remitted: ?4,250,000</div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Risk Breakdown</div>
                  <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>High Priority</span>
                      <span className="text-rose-600">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medium Priority</span>
                      <span className="text-amber-600">4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Low Priority</span>
                      <span className="text-emerald-600">6</span>
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
