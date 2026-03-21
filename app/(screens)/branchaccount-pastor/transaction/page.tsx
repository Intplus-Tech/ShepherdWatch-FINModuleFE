"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Database,
  ShieldCheck,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  Upload,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle,
  Building2,
  ArrowUp
} from "lucide-react"

const transactions = [
  {
    checked: true,
    date: "Oct 24, 2023",
    description: "TRF FRM PAUL George TITHES",
    amount: "+₦1,250,723.00",
    isPositive: true,
    tag: "Income: Tithes",
    tagColor: "bg-[#F3E8FF] text-[#9333EA]",
    hasSparkle: true,
    status: "Unverified",
    statusColor: "bg-[#FEF3C7] text-[#D97706]",
  },
  {
    checked: false,
    date: "Oct 23, 2023",
    description: "AMZN Mktp NG*1X2Y3Z",
    amount: "-₦45,452.99",
    isPositive: false,
    tag: "Office Supplies",
    tagColor: "bg-[#F3F4F6] text-[#4B5563]",
    hasSparkle: false,
    status: "Unverified",
    statusColor: "bg-[#FEF3C7] text-[#D97706]",
  },
  {
    checked: false,
    date: "Oct 22, 2023",
    description: "ACH DEBIT: UTILITY POWER CO",
    amount: "-₦443,312.50",
    isPositive: false,
    tag: "Utilities",
    tagColor: "bg-[#EEF2FF] text-[#4F46E5]",
    hasSparkle: false,
    status: "Verified",
    statusColor: "bg-transparent text-[#10B981]",
    isVerified: true,
  },
  {
    checked: false,
    date: "Oct 21, 2023",
    description: "CHECK DEPOSIT #4402 - YOUTH FUNDRAISER",
    amount: "+₦950,723.00",
    isPositive: true,
    tag: "Fundraising",
    tagColor: "bg-[#F3E8FF] text-[#9333EA]",
    hasSparkle: true,
    status: "Unverified",
    statusColor: "bg-[#FEF3C7] text-[#D97706]",
  },
  {
    checked: false,
    date: "Oct 20, 2023",
    description: "SOFTWARE SUBSCRIPTION: ZOOM",
    amount: "-₦62,452.99",
    isPositive: false,
    tag: "Uncategorized",
    tagColor: "bg-white text-[#9CA3AF] border border-dashed border-[#D1D5DB]",
    hasSparkle: false,
    status: "Unverified",
    statusColor: "bg-[#FEF3C7] text-[#D97706]",
  },
]

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
          <div className="flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      
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
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft, active: true },
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
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent px-4 sm:px-6 xl:px-8 w-full gap-4 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-white hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-[#111827] tracking-tight">Financial Overview</h1>
              <p className="text-[12px] text-[#3B5BDB] font-medium mt-0.5">Global financial health monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            <button className="flex items-center h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] text-[#4B5563] font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Building2 className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
              All Branches
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#9CA3AF]" />
            </button>
            <button className="flex items-center h-[36px] px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] text-[#4B5563] font-bold shadow-sm hover:bg-gray-50 transition-all">
              <Calendar className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
              This Month
              <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#9CA3AF]" />
            </button>
            
            <div className="hidden md:flex items-center h-[36px] rounded-[8px] border border-[#E5E7EB] bg-white p-1 shadow-sm">
              <button className="px-3 h-full rounded-[6px] bg-[#3B5BDB] text-white text-[11px] font-bold transition-all">NGN</button>
              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">USD</button>
              <button className="px-3 h-full rounded-[6px] text-[#6B7280] text-[11px] font-bold hover:bg-gray-50 transition-all">EUR</button>
            </div>

            <button className="flex items-center h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-sm hover:bg-[#3451b2] transition-all">
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 xl:px-8 pb-8 pt-4">
          
          <div className="flex flex-col xl:flex-row gap-6 h-full mt-1">
            
            {/* LEFT COLUMN: Main Headers, Metrics, and Table */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* Bank Transactions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-t border-[#EEF1F6]/70 pt-5">
                <div>
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Bank Transactions</h2>
                  <p className="mt-1 text-[13px] text-[#9CA3AF] font-medium">Reconcile imported bank feeds with your chart of accounts.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center h-[33.33px] w-[140px] sm:w-[160px] justify-center rounded-[5.33px] border-[0.67px] border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] font-bold shadow-sm hover:bg-gray-50 transition-all">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </button>
                  <button className="flex items-center h-[33.33px] w-[140px] sm:w-[160px] justify-center rounded-[5.33px] border-[0.67px] border-transparent bg-[#3AA5F3] px-4 text-[12px] text-white font-bold shadow-[0_4px_14px_rgba(58,165,243,0.39)] hover:bg-[#2b8cd1] transition-all">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Feed
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Unverified</div>
                    <AlertTriangle className="h-8 w-8 text-[#FEF3C7]" strokeWidth={2} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">14</span>
                    <span className="text-[12px] font-bold text-[#D97706]">Action Needed</span>
                  </div>
                </div>
                
                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Inflow (Month)</div>
                    <TrendingUp className="h-8 w-8 text-[#E6F4EA]" strokeWidth={2} />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">₦8,840,250</span>
                    <span className="flex items-center text-[12px] font-bold text-[#10B981]">
                      <ArrowUp className="mr-0.5 h-3.5 w-3.5" strokeWidth={3} />
                      12%
                    </span>
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Pending Review</div>
                    <div className="h-8 w-8 rounded-full border border-[#E5E7EB] flex items-center justify-center gap-[3px]">
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                      <div className="h-[4px] w-[4px] bg-[#E5E7EB] rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-['Inter'] font-bold text-[20px] leading-[24px] tracking-normal align-middle text-[#111827]">5</span>
                  </div>
                </div>
              </div>

              {/* Main Table Area */}
              <div className="flex-1 rounded-[16px] border border-[#EEF1F6] bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-h-[500px]">
                     {/* Table Toolbar */}
              <div className="p-4 sm:p-5 border-b border-[#EEF1F6] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Tabs */}
                <div className="flex items-center gap-6">
                  <button className="py-2 text-[14px] font-bold text-[#9CA3AF] hover:text-[#111827] transition-colors">All</button>
                  <button className="relative py-2 text-[14px] font-bold text-[#3B5BDB]">
                    Unverified
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3B5BDB]"></div>
                  </button>
                  <button className="py-2 text-[14px] font-bold text-[#9CA3AF] hover:text-[#111827] transition-colors">Verified</button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto ml-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-[360px]">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <input 
                      type="search" 
                      placeholder="Search by description or amount..." 
                      className="h-[40px] w-full rounded-[8px] border border-[#EEF1F6] bg-white pl-10 pr-4 text-[13px] text-[#111827] font-medium placeholder:text-[#9CA3AF] focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all shadow-sm"
                    />
                  </div>
                  {/* Date */}
                  <button className="flex items-center justify-center h-[40px] px-4 rounded-[8px] border border-[#EEF1F6] bg-white text-[13px] text-[#111827] font-bold hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
                    <Calendar className="mr-2 h-4 w-4 text-[#9CA3AF]" />
                    Oct 2023
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full min-w-[900px] table-fixed text-left text-[12px] sm:text-[13px]">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] text-center">
                      <th className="pl-6 pr-4 py-5 w-[56px] text-left">
                        <input type="checkbox" className="rounded-[4px] border-[#D1D5DB] text-[#3B5BDB] focus:ring-[#3B5BDB]" />
                      </th>
                      <th className="py-5 font-bold w-[140px]">DATE</th>
                      <th className="py-5 font-bold text-[#3B5BDB] w-[360px]">DESCRIPTION</th>
                      <th className="py-5 font-bold w-[150px]">AMOUNT</th>
                      <th className="py-5 font-bold w-[180px]">SUGGESTED TAG</th>
                      <th className="py-5 font-bold w-[120px]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${tx.checked ? "bg-[#F8FAFF]" : "bg-white"}`}>
                        <td className="pl-6 pr-4 py-4 sm:py-6 w-[56px] relative text-left">
                          {tx.checked && <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3B5BDB]" />}
                          <input type="checkbox" checked={tx.checked} readOnly className="rounded-[4px] border-[#D1D5DB] text-[#3B5BDB] shadow-sm focus:ring-[#3B5BDB]" />
                        </td>
                        <td className="py-4 sm:py-6 text-center font-medium text-[#6B7280] whitespace-nowrap">{tx.date}</td>
                        <td className="py-4 sm:py-6 text-center text-[12px] font-medium leading-[16px] text-[#111827]">{tx.description}</td>
                        <td className={`py-4 sm:py-6 text-center font-bold tracking-tight ${tx.isPositive ? "text-[#10B981]" : "text-[#111827]"}`}>{tx.amount}</td>
                        <td className="py-4 sm:py-6 text-center">
                          <span className={`inline-flex h-[20px] min-w-[81.94px] w-auto items-center justify-center rounded-[6666px] px-2 text-[10px] font-bold tracking-wide ${tx.tagColor}`}>
                            {tx.tag}
                            {tx.hasSparkle && <Sparkles className="ml-1.5 h-3.5 w-3.5" />}
                          </span>
                        </td>
                          <td className="py-4 sm:py-6 text-center">
                            {tx.isVerified ? (
                              <span className={`inline-flex items-center text-[11.5px] font-bold tracking-wide ${tx.statusColor}`}>
                                <CheckCircle className="mr-1.5 h-4 w-4 text-[#10B981]" strokeWidth={2.5} />
                                {tx.status}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center rounded-[6px] px-3 py-1.5 text-[11px] font-bold tracking-wide ${tx.statusColor}`}>
                                {tx.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
              <div className="p-5 border-t border-[#EEF1F6] flex items-center justify-between text-[13px] text-[#9CA3AF] font-medium bg-white">
                <div>Showing 1-5 of 45 branches</div>
                <div className="flex gap-2">
                  <button className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">Previous</button>
                  <button className="px-5 py-2 rounded-[6px] border border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors font-bold text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">Next</button>
                </div>
              </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Verification Sidebar Widget */}
            <div className="w-full xl:w-[350px] shrink-0 flex flex-col pt-5">
              <div className="rounded-[16px] border border-[#EEF1F6] border-b-2 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col sticky top-[100px]">
                
                <div className="flex items-start justify-between p-6 border-b border-[#EEF1F6]">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">Verification</h3>
                    <p className="text-[12px] font-bold text-[#9CA3AF] mt-1 tracking-wide">Transaction #TXN-8842</p>
                  </div>
                  <button className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#9CA3AF] transition-colors border border-transparent hover:border-[#E5E7EB]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 flex-1 space-y-5">
                  <div className="rounded-[10px] bg-[#F4F6FF] p-4 text-[#111827] border border-[#EEF2FF]">
                    <div className="text-[9px] font-bold text-[#3B5BDB] uppercase tracking-wider mb-2.5">Incoming Transfer</div>
                    <div className="text-[13px] font-bold mb-3.5 uppercase tracking-tight text-[#111827]">TRF FRM ST. PAUL PARISH TITHES</div>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-bold text-[#9CA3AF]">Oct 24, 2023</div>
                      <div className="text-[15px] font-bold text-[#10B981]">+₦1,250,723.00</div>
                    </div>
                  </div>

                  <div className="rounded-[10px] bg-[#FAF5FF] p-4 border border-[#F3E8FF] shadow-[0_2px_10px_0_rgba(147,51,234,0.03)]">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0 bg-[#F3E8FF] h-6 w-6 rounded-full flex items-center justify-center border border-[#E9D5FF]">
                        <Sparkles className="h-3 w-3 text-[#9333EA]" />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#9333EA]">Suggestion: Tithes & Offerings</div>
                        <div className="text-[11px] font-bold text-[#A855F7] mt-1.5 leading-snug">Based on &quot;TITHES&quot; in description (85% confidence)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 pt-2">
                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Chart of Accounts</label>
                      <div className="relative">
                        <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#EEF1F6] bg-white pl-3.5 pr-10 text-[13px] font-bold text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                          <option>4001 - Tithes Income</option>
                          <option>4002 - Offerings</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Budget Head <span className="text-[#3AA5F3] font-medium ml-1">[Optional]</span></label>
                      <div className="relative">
                        <select className="h-[42px] w-full appearance-none rounded-[8px] border border-[#EEF1F6] bg-white pl-3.5 pr-10 text-[13px] font-medium text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                          <option>Select a budget...</option>
                          <option>Missions</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2.5 block text-[12px] font-bold text-[#111827]">Notes</label>
                      <textarea 
                        className="w-full rounded-[8px] border border-[#EEF1F6] bg-white p-3.5 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]/20 transition-all min-h-[70px] resize-none shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
                        placeholder="Add a note about this transaction..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#EEF1F6] bg-gray-50/30">
                  <button className="flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#3B5BDB] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(59,91,219,0.25)] hover:bg-[#3451b2] transition-colors mb-4">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify & Save
                  </button>
                  <div className="flex items-center gap-3">
                    <button className="flex-1 h-[40px] items-center justify-center rounded-[8px] border border-[#EEF1F6] bg-white text-[12px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
                      Split
                    </button>
                    <button className="flex-1 h-[40px] items-center justify-center rounded-[8px] border border-[#FEE2E2] bg-[#FFF5F5] text-[12px] font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shadow-sm">
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
