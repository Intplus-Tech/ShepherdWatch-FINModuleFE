"use client"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Plus,
} from "lucide-react"

const summaryCards = [
  { label: "Total Transactions", value: "14", delta: "+4%" },
  { label: "Total Amount", value: "N8,840,250", delta: "+2%" },
  { label: "Failed", value: "5", delta: "-1%" },
]

const tableRows = [
  { date: "2024-02-18", name: "Rev. Victor", type: "Inflow", amount: "N45,000", status: "Completed" },
  { date: "2024-02-17", name: "Rev. Thomas", type: "Outflow", amount: "N15,000", status: "Pending" },
  { date: "2024-02-15", name: "Rev. Faith", type: "Inflow", amount: "N85,000", status: "Completed" },
  { date: "2024-02-14", name: "Rev. Joseph", type: "Outflow", amount: "N9,500", status: "Failed" },
]

const transfers = [
  { name: "Account Transfer", amount: "N4,750,000", type: "Inflow" },
  { name: "Vendor Transfer", amount: "N1,200,000", type: "Outflow" },
  { name: "Branch Support", amount: "N850,000", type: "Inflow" },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <SidebarNav activeHref="/director-screen/transaction" className="border-0 border-r border-[#EEF1F6]" />

          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            <ScreenHeader title="Transactions" />

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
              {/* Bank Transactions */}
              <section className="rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#111827]">Bank Transactions</h2>
                    <p className="text-[10px] text-[#9CA3AF]">Total financial overview</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                      All Branches
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[10px] text-[#6B7280]">
                      All Status
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button className="flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-2.5 py-1.5 text-[10px] text-white">
                      <Plus className="h-3 w-3" />
                      New
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFF] p-3">
                      <div className="text-[10px] text-[#9CA3AF]">{card.label}</div>
                      <div className="mt-2 text-[15px] font-semibold text-[#111827]">{card.value}</div>
                      <div className="text-[9px] text-emerald-600">{card.delta} this month</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] text-[#6B7280]">
                  <button className="rounded-full bg-[#E9EEFF] px-3 py-1 text-[#3B5BDB]">All</button>
                  <button className="rounded-full bg-[#F3F5F9] px-3 py-1">Inflow</button>
                  <button className="rounded-full bg-[#F3F5F9] px-3 py-1">Outflow</button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-left text-[#9CA3AF]">
                        <th className="pb-2">DATE</th>
                        <th className="pb-2">NAME</th>
                        <th className="pb-2">TYPE</th>
                        <th className="pb-2">AMOUNT</th>
                        <th className="pb-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row) => (
                        <tr key={row.date + row.name} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-3">{row.date}</td>
                          <td className="py-3">{row.name}</td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-[9px] text-[#3B5BDB]">
                              {row.type === "Inflow" ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {row.type}
                            </span>
                          </td>
                          <td className="py-3 font-medium">{row.amount}</td>
                          <td className="py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-[9px] ${
                                row.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.status === "Failed"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-amber-50 text-amber-600"
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
              </section>

              {/* Transfers Panel */}
              <aside className="rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[#111827]">Transfer Status</h3>
                  <button className="text-[9px] text-[#3B5BDB]">View all</button>
                </div>
                <div className="mt-4 space-y-3">
                  {transfers.map((t) => (
                    <div key={t.name} className="rounded-[12px] border border-[#EEF1F6] p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-[#111827] font-medium">{t.name}</div>
                        <div className={`text-[10px] ${t.type === "Inflow" ? "text-emerald-600" : "text-rose-600"}`}>
                          {t.type}
                        </div>
                      </div>
                      <div className="mt-2 text-[12px] font-semibold text-[#111827]">{t.amount}</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#EEF1F6]">
                        <div className="h-1.5 w-2/3 rounded-full bg-[#3B5BDB]" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full rounded-[8px] bg-[#3B5BDB] py-2 text-[11px] text-white">Send Transfer</button>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
