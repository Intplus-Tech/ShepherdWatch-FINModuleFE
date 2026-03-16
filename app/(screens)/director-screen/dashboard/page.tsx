"use client"

import Image from "next/image"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Scale,
  Wallet,
  Building2,
  Users,
  Settings,
  Building,
  Calendar,
  Download,
  CheckCircle2,
  Flag,
  Eye,
  Banknote,
  CreditCard,
  Building as BuildingIcon,
  MapPin,
  ChevronDown,
} from "lucide-react"

const statCards = [
  {
    title: "Total Income",
    value: "₦2,211,250,400",
    trend: "+12%",
    trendText: " vs last month",
    trendColor: "text-emerald-500",
    isPositive: true,
    icon: Banknote,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    title: "Total Expenses",
    value: "₦840,250,400",
    trend: "-5%",
    trendText: " vs last month",
    trendColor: "text-emerald-500",
    isPositive: false,
    icon: CreditCard,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    title: "Net Surplus",
    value: "₦8,840,250",
    trend: "",
    trendText: "Healthy Margin",
    trendColor: "text-gray-400",
    isPositive: null,
    icon: BuildingIcon,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    title: "Active Branches",
    value: "95",
    trend: "",
    trendText: "Reporting Live Data",
    trendColor: "text-gray-400",
    isPositive: null,
    icon: MapPin,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
]

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transactions", icon: ArrowLeftRight },
  { label: "Budgeting", icon: Coins },
  { label: "Compliance", icon: Scale },
  { label: "Asset", icon: Wallet },
  { label: "Branch Management", icon: Building2 },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
]

const transactions = [
  { id: 1, date: "2023-10-24", branch: "Maryland, Lagos", type: "Weekly Tithe", typeBg: "bg-blue-50", typeColor: "text-blue-600", amount: "$12,400.00", status: "Pending", statusBg: "bg-amber-100", statusColor: "text-amber-700", statusDot: "bg-amber-500", actions: ["check", "flag"] },
  { id: 2, date: "2023-10-23", branch: "HQ, Ibadan", type: "Building Fund", typeBg: "bg-purple-50", typeColor: "text-purple-600", amount: "$5,000.00", status: "Pending", statusBg: "bg-amber-100", statusColor: "text-amber-700", statusDot: "bg-amber-500", actions: ["check", "flag"] },
  { id: 3, date: "2023-10-23", branch: "Victoria Island, Lagos", type: "General Donation", typeBg: "bg-emerald-50", typeColor: "text-emerald-600", amount: "$2,150.00", status: "Pending", statusBg: "bg-amber-100", statusColor: "text-amber-700", statusDot: "bg-amber-500", actions: ["check", "flag"] },
  { id: 4, date: "2023-10-22", branch: "Agodi, Ibadan", type: "Weekly Tithe", typeBg: "bg-blue-50", typeColor: "text-blue-600", amount: "$9,800.00", status: "Flagged", statusBg: "bg-rose-100", statusColor: "text-rose-700", statusDot: "bg-rose-500", actions: ["eye"] },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] xl:flex">
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1">Super Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex cursor-pointer items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    item.active
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
              <Image
                src="/images/Beared%20Guy02-min%201.jpg"
                alt="User avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#111827]">Rev. Thomas M.</span>
              <span className="text-[11px] font-medium text-[#6B7280]">Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Building className="h-4 w-4 text-[#6B7280]" />
                All Branches
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>
              
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] font-medium text-[#6B7280]">{card.title}</span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconBg}`}>
                      <Icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[26px] font-bold text-[#111827] tracking-tight">{card.value}</h3>
                    <p className="mt-1.5 flex items-center text-[12px]">
                      {card.trend && card.isPositive === true && (
                        <span className={`font-semibold flex items-center gap-1 ${card.trendColor}`}>
                           <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {card.trend}
                        </span>
                      )}
                      {card.trend && card.isPositive === false && (
                        <span className={`font-semibold flex items-center gap-1 ${card.trendColor}`}>
                           <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L9 9M9 9H2M9 9V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {card.trend}
                        </span>
                      )}
                      <span className={`ml-1 ${card.trendColor.includes('gray') ? card.trendColor : 'text-[#9CA3AF]'}`}>{card.trendText}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Area Chart placeholder */}
            <div className="col-span-1 flex flex-col rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827]">Budget vs. Actuals (Q1)</h3>
                  <p className="text-[13px] text-[#6B7280] mt-1">Actual income exceeded budget in March.</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB]"></span>
                    <span className="text-[12px] font-semibold text-[#6B7280]">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3B5BDB]"></span>
                    <span className="text-[12px] font-semibold text-[#3B5BDB]">Actual</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative w-full flex items-end justify-between px-6 pb-2 text-[11px] text-[#9CA3AF] font-medium min-h-[220px]">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>

            {/* Doughnut Chart placeholder */}
            <div className="col-span-1 rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#111827]">Income Distribution</h3>
              <p className="text-[13px] text-[#3B5BDB] mt-1 mb-8">Breakdown by category</p>
              
              <div className="relative mx-auto h-[180px] w-[180px] mb-8">
                <div className="h-full w-full rounded-full border-[12px] border-[#3B5BDB] border-b-[#8B5CF6] border-l-[#10B981] border-r-[#8B5CF6]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[12px] text-[#6B7280] font-medium mb-1">Total</span>
                  <span className="text-[18px] font-bold text-[#3B5BDB]">$1.25M</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3B5BDB]"></span>
                    <span className="text-[#4B5563] font-medium">Tithes (60%)</span>
                  </div>
                  <span className="font-bold text-[#111827]">$750k</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]"></span>
                    <span className="text-[#4B5563] font-medium">Offerings (25%)</span>
                  </div>
                  <span className="font-bold text-[#111827]">$312k</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]"></span>
                    <span className="text-[#4B5563] font-medium">Projects (15%)</span>
                  </div>
                  <span className="font-bold text-[#111827]">$188k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between p-6 pb-5">
              <div>
                <h3 className="text-[16px] font-bold text-[#111827]">Recent Transactions</h3>
                <p className="text-[13px] text-[#9CA3AF] mt-1">Transactions awaiting verification</p>
              </div>
              <button className="text-[13px] font-bold text-[#3B5BDB] hover:text-blue-700">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] w-32 border-y border-[#EEF1F6]">DATE</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">BRANCH</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] border-y border-[#EEF1F6]">CATEGORY</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right border-y border-[#EEF1F6]">AMOUNT</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-center w-32 border-y border-[#EEF1F6]">STATUS</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-right w-24 border-y border-[#EEF1F6]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 font-semibold text-[#111827] transition-colors">
                      <td className="px-6 py-5">{tx.date}</td>
                      <td className="px-6 py-5 text-[#3B5BDB] font-medium">{tx.branch}</td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.typeBg} ${tx.typeColor}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold">{tx.amount}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${tx.statusBg} ${tx.statusColor}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tx.statusDot}`}></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3.5 text-[#9CA3AF]">
                          {tx.actions.includes("check") && <CheckCircle2 className="h-4 w-4 cursor-pointer hover:text-emerald-500 transition-colors" />}
                          {tx.actions.includes("flag") && <Flag className="h-4 w-4 cursor-pointer hover:text-rose-500 transition-colors" />}
                          {tx.actions.includes("eye") && <Eye className="h-4 w-4 cursor-pointer hover:text-blue-500 transition-colors" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between border-t border-[#EEF1F6] p-4 px-6">
              <span className="text-[13px] font-medium text-[#6B7280]">
                Showing <span className="text-[#111827] font-bold">1-4</span> of <span className="font-bold text-[#111827]">24</span> transactions
              </span>
              <div className="flex items-center gap-2">
                <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Previous</button>
                <button className="rounded px-4 py-2 text-[12px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
