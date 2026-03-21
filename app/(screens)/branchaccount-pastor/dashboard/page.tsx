"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Building2,
  Clock,
  FileText,
  Activity,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wrench,
  Package,
  Receipt,
  Landmark,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Bell,
  ArrowRightLeft,
  Database,
  Sprout,
  Gift,
  Lightbulb,
} from "lucide-react"

const statCards = [
  { 
    title: "Cash in Bank", 
    value: "₦4.25M", 
    meta: "+2.4% vs last month", 
    metaColor: "text-emerald-500", 
    icon: Building2, 
    iconBg: "bg-blue-50", 
    iconColor: "text-blue-600",
    hasArrowUp: true 
  },
  { 
    title: "Unverified Transactions", 
    value: "12 items", 
    meta: "Requires action shortly", 
    metaColor: "text-gray-500", 
    icon: Clock, 
    iconBg: "bg-amber-50", 
    iconColor: "text-amber-500" 
  },
  { 
    title: "Pending Requisitions", 
    value: "8 requests", 
    meta: "Awaiting Process", 
    metaColor: "text-amber-500", 
    icon: FileText, 
    iconBg: "bg-blue-50", 
    iconColor: "text-blue-600" 
  },
  { 
    title: "Budget Health", 
    value: "78%", 
    meta: "Healthy Utilization", 
    metaColor: "text-gray-500", 
    icon: Activity, 
    iconBg: "bg-emerald-50", 
    iconColor: "text-emerald-500" 
  },
]

const bankAccounts = [
  { 
    name: "Zenith Bank", 
    initials: "ZB", 
    initialsBg: "bg-blue-100 text-blue-600", 
    type: "Main Operations", 
    balance: "₦2,500,000", 
    lastRecon: "2 days ago", 
    reconColor: "bg-emerald-50 text-emerald-600" 
  },
  { 
    name: "Access Bank", 
    initials: "AB", 
    initialsBg: "bg-orange-100 text-orange-600", 
    type: "Savings", 
    balance: "₦1,250,000", 
    lastRecon: "5 days ago", 
    reconColor: "bg-amber-50 text-amber-600" 
  },
  { 
    name: "Enubis MfB", 
    initials: "EF", 
    initialsBg: "bg-indigo-100 text-indigo-600", 
    type: "Domiciliary (£)", 
    balance: "₦500,000", 
    lastRecon: "Today", 
    reconColor: "bg-emerald-50 text-emerald-600" 
  },
]

const incomeFeeds = [
  { 
    title: "Sunday Offering", 
    sub: "Main Hall - 1st Service", 
    amount: "+₦45,000", 
    icon: Receipt,
    iconBg: "bg-gray-100 text-gray-500"
  },
  {
    title: "Building Fund",
    sub: "Main Hall - 2nd Service",
    amount: "+₦25,000",
    icon: Sprout,
    iconBg: "bg-gray-100 text-gray-500",
  },
  {
    title: "Special Donation",
    sub: "Anonymous - For Admin",
    amount: "+₦14,000",
    icon: Gift,
    iconBg: "bg-blue-50 text-blue-500",
  },
]

const pendingExpenses = [
  {
    title: "Diesel Purchase",
    sub: "Overdue 2 days",
    subColor: "text-rose-500",
    amount: "₦100,000",
    action: "Action Required",
    actionColor: "text-rose-500",
    icon: Lightbulb,
    iconBg: "bg-rose-50 text-rose-500",
  },
  { 
    title: "Plumbing Repairs", 
    sub: "Due Tomorrow - 11/2/24", 
    subColor: "text-gray-500", 
    amount: "₦25,000", 
    action: "Review", 
    actionColor: "text-blue-600", 
    icon: Wrench,
    iconBg: "bg-gray-100 text-gray-500"
  },
  { 
    title: "Stationery Supply", 
    sub: "Recurring - Office", 
    subColor: "text-gray-500", 
    amount: "₦10,000", 
    action: "Pay", 
    actionColor: "text-blue-600", 
    icon: Package,
    iconBg: "bg-gray-100 text-gray-500"
  },
]

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: '"Public Sans", sans-serif' }}>
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] border-r border-[#EEF1F6] bg-white flex flex-col shrink-0 h-[100dvh] fixed xl:sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"}`}>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="xl:hidden absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3 pb-8">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={28} height={28} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Accountant View</div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {[
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard, active: true },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="mt-auto">
            <div className="space-y-1.5 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <Settings className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
                Help Center
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Alex Morgan</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium">Accountant</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full">
        
        {/* Center Panel Container */}
        <div className="flex-1 flex flex-col min-h-screen w-full relative">
          
          {/* Top Header */}
          <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block text-[14px] font-semibold text-[#111827]">
                Dashboard
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
              <div className="relative flex-1 w-full sm:max-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input 
                  type="search" 
                  placeholder="Search transactions..." 
                  className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
                />
              </div>
              <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
                <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto p-4 sm:p-6 xl:p-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="text-[12px] sm:text-[13px] font-medium text-gray-500 mb-2">{card.title}</div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.iconBg} ${card.iconColor}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[20px] sm:text-[24px] font-bold text-gray-900">{card.value}</div>
                    <div className={`mt-1 flex items-center text-[11px] sm:text-[12px] font-medium ${card.metaColor}`}>
                      {card.hasArrowUp && <TrendingUp className="mr-1 h-3 w-3" />}
                      {card.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bank Account Summary */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5">
                <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900">Bank Account Summary</h3>
                <button className="text-[12px] sm:text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  + Add account
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-[12px] sm:text-[13px]">
                  <thead className="bg-white">
                    <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-4 font-semibold">BANK ACCOUNT</th>
                      <th className="px-5 py-4 font-semibold">TYPE</th>
                      <th className="px-5 py-4 font-semibold">BALANCE</th>
                      <th className="px-5 py-4 font-semibold">LAST RECONCILIATION</th>
                      <th className="px-5 py-4 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bankAccounts.map((account, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-bold ${account.initialsBg}`}>
                              {account.initials}
                            </div>
                            <span className="font-medium text-gray-900">{account.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-blue-600 font-medium">
                          {account.type}
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {account.balance}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${account.reconColor}`}>
                            {account.lastRecon}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Income & Expenses Row */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Recent Income Feed */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900">Recent Income Feed</h3>
                  </div>
                  <div className="text-[12px] sm:text-[13px] font-medium text-emerald-500">
                    Today's Total: ₦84,000
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 space-y-5">
                  {incomeFeeds.map((feed, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${feed.iconBg}`}>
                          <feed.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{feed.title}</p>
                          <p className="text-[12px] text-gray-500">{feed.sub}</p>
                        </div>
                      </div>
                      <div className="text-[13px] font-semibold text-emerald-600">
                        {feed.amount}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-4 text-center">
                  <button className="text-[12px] sm:text-[13px] font-medium text-blue-600 hover:text-blue-700">
                    View History
                  </button>
                </div>
              </div>

              {/* Pending Expenses */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="h-4 w-4 text-rose-500" />
                    <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900">Pending Expenses</h3>
                  </div>
                  <div className="text-[12px] sm:text-[13px] font-medium text-rose-500">
                    Total: ₦135,000
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 space-y-5">
                  {pendingExpenses.map((expense, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${expense.iconBg}`}>
                          <expense.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{expense.title}</p>
                          <p className={`text-[12px] font-medium ${expense.subColor}`}>{expense.sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-gray-900">{expense.amount}</p>
                        <button className={`text-[12px] font-medium hover:opacity-80 ${expense.actionColor}`}>
                          {expense.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-4 text-center">
                  <button className="text-[12px] sm:text-[13px] font-medium text-blue-600 hover:text-blue-700">
                    Batch Approve (3)
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
