"use client"

import Image from "next/image"
import {
  LayoutDashboard,
  Wallet,
  Coins,
  Scale,
  ArrowLeftRight,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Filter,
  Download,
} from "lucide-react"

const statCards = [
  {
    title: "Total Revenue",
    value: "N2,211,250,400",
    trend: "+12%",
    color: "text-emerald-600",
    icon: Wallet,
  },
  {
    title: "Total Expenses",
    value: "N840,250,400",
    trend: "-4%",
    color: "text-rose-500",
    icon: Coins,
  },
  {
    title: "Net Balance",
    value: "N8,840,250",
    trend: "+8%",
    color: "text-emerald-600",
    icon: Scale,
  },
  {
    title: "Active Branches",
    value: "95",
    trend: "+3",
    color: "text-indigo-600",
    icon: Users,
  },
]

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Assets", icon: Wallet },
  { label: "Budgeting", icon: Coins },
  { label: "Compliance", icon: Scale },
  { label: "Transaction", icon: ArrowLeftRight },
  { label: "Branch Management", icon: Users },
  { label: "Settings", icon: Settings },
]

const transactions = [
  { id: "2023-12-03", name: "Rev. Victor", type: "Salary Pay", amount: "N45,000", status: "Pending" },
  { id: "2023-12-02", name: "Chioma Ugo", type: "Grant Received", amount: "N250,000", status: "Completed" },
  { id: "2023-12-01", name: "Kemi Ajayi", type: "Loan Transfer", amount: "N85,000", status: "Pending" },
  { id: "2023-11-30", name: "Ruth Ebule", type: "Salary Pay", amount: "N45,000", status: "Failed" },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-[240px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] p-5">
            <div className="flex items-center gap-2 pb-6">
              <Image src="/images/logo.svg" alt="ShepherdWatch" width={140} height={32} />
            </div>

            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12px] whitespace-nowrap transition-colors ${
                      item.active
                        ? "bg-[#3B5BDB]/10 text-[#3B5BDB]"
                        : "text-[#6B7280] hover:bg-[#F3F5F9]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 hidden lg:flex items-center gap-3 rounded-[12px] border border-[#EEF1F6] p-3">
              <div className="h-8 w-8 rounded-full bg-[#E8EDFF] flex items-center justify-center text-[#3B5BDB] text-xs font-semibold">RV</div>
              <div className="text-[11px]">
                <div className="font-semibold text-[#111827]">Rev. Victor</div>
                <div className="text-[#9CA3AF]">Director</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 lg:p-8 bg-[#F7F8FC]">
            {/* Top bar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[18px] font-semibold text-[#111827]">Dashboard</h1>
                <p className="text-[11px] text-[#9CA3AF]">Financial overview for this month</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
                  <Search className="h-4 w-4" />
                  Search
                </div>
                <button className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-[11px] text-[#6B7280]">
                  This Month
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-2 rounded-[10px] bg-[#3B5BDB] px-3 py-2 text-[11px] text-white">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <div className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-[#9CA3AF]">{card.title}</div>
                      <div className="h-7 w-7 rounded-full bg-[#EEF1F6] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[#3B5BDB]" />
                      </div>
                    </div>
                    <div className="mt-3 text-[16px] font-semibold text-[#111827]">{card.value}</div>
                    <div className={`mt-1 text-[10px] ${card.color}`}>{card.trend} vs last month</div>
                  </div>
                )
              })}
            </div>

            {/* Charts + Table */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
              {/* Budget vs Actual */}
              <div className="rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[13px] font-semibold text-[#111827]">Budget vs Actual (Q1)</h2>
                    <p className="text-[10px] text-[#9CA3AF]">KPI and branch performance</p>
                  </div>
                  <button className="text-[10px] text-[#6B7280] flex items-center gap-1">
                    By month
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-4 h-[180px] rounded-[12px] bg-gradient-to-br from-[#EFF2FF] via-white to-[#F7F8FC] border border-dashed border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#9CA3AF]">
                  Chart Area
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-[#6B7280]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3B5BDB]" />Budget</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#22C55E]" />Actual</span>
                </div>
              </div>

              {/* Income Distribution */}
              <div className="rounded-[14px] bg-white border border-[#EEF1F6] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-[#111827]">Income Distribution</h2>
                  <button className="text-[10px] text-[#6B7280] flex items-center gap-1">
                    This month
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div
                    className="h-[140px] w-[140px] rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "conic-gradient(#3B5BDB 0 55%, #F59E0B 55% 80%, #10B981 80% 100%)",
                    }}
                  >
                    <div className="h-[90px] w-[90px] rounded-full bg-white flex items-center justify-center text-[12px] font-semibold text-[#111827]">
                      N25.3M
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-[10px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3B5BDB]" />Donations</span>
                    <span>55%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F59E0B]" />Offerings</span>
                    <span>25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#10B981]" />Tithes</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="mt-6 rounded-[14px] bg-white border border-[#EEF1F6] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#111827]">Recent Transactions</h2>
                <button className="text-[10px] text-[#3B5BDB]">View All</button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-left text-[#9CA3AF]">
                      <th className="pb-2">DATE</th>
                      <th className="pb-2">NAME</th>
                      <th className="pb-2">CATEGORY</th>
                      <th className="pb-2">AMOUNT</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-[#EEF1F6] text-[#111827]">
                        <td className="py-3">{tx.id}</td>
                        <td className="py-3">{tx.name}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-[#EEF1FF] px-2 py-1 text-[9px] text-[#3B5BDB]">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-medium">{tx.amount}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] ${
                              tx.status === "Completed"
                                ? "bg-emerald-50 text-emerald-600"
                                : tx.status === "Failed"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#9CA3AF]">...</td>
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

