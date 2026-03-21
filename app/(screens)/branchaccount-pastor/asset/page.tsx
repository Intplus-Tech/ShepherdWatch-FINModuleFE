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
  Bell,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })

const assetsData = [
  {
    id: 1,
    name: "Church Sound System (Array)",
    category: "Electronics",
    date: "Oct 12, 2022",
    value: "₦4,200,000",
    status: "EXCELLENT",
    statusColor: "text-[#10B981] bg-[#ECFDF5]"
  },
  {
    id: 2,
    name: "Industrial Generator 250kVA",
    category: "Power Plant",
    date: "Jan 05, 2021",
    value: "₦12,500,000",
    status: "SERVICING REQ.",
    statusColor: "text-[#F59E0B] bg-[#FEF3C7]"
  }
]

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Circular progress math (87%)
  const size = 110
  const stroke = 8
  const radius = size / 2
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = 87
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`flex flex-col xl:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
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
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div>
              <div className="text-[15px] font-bold text-[#3B5BDB] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-1 tracking-wide">Accountant&apos;s View</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1 mt-2">
            {[
              { label: "Dashboard", href: "/branchaccount-pastor/dashboard", icon: LayoutDashboard },
              { label: "Transaction", href: "/branchaccount-pastor/transaction", icon: ArrowRightLeft },
              { label: "Budget", href: "/branchaccount-pastor/budget", icon: Wallet },
              { label: "Assets", href: "/branchaccount-pastor/asset", icon: Database, active: true },
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
            <div className="space-y-1 border-t border-[#EEF1F6] pt-6 text-[13px] font-semibold text-[#4B5563]">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative h-[100dvh] overflow-hidden">

        {/* Top Header */}
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[15px] font-bold text-[#111827] tracking-tight">
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end max-w-[320px] sm:max-w-none">
            <div className="relative flex-1 w-full sm:max-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[10px] border border-transparent bg-[#F9FAFB] pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-[#E5E7EB] outline-none transition-all shadow-sm"
              />
            </div>
            <button className="relative flex h-9 w-9 sm:h-[38px] sm:w-[38px] shrink-0 items-center justify-center rounded-[8px] text-[#6B7280] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors shadow-sm">
              <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
          
          <div className="mx-auto w-full max-w-[1400px]">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
              <div>
                <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-[900] text-[#111827] tracking-[-1px] leading-none mb-2 uppercase">ASSET MANAGEMENT</h1>
                <p className="text-[15px] text-[#6B7280] font-medium tracking-tight">Here&apos;s your branch asset overview. <span className="font-bold text-[#111827]">2024</span></p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <button className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-5 sm:px-6 rounded-[8px] bg-[#2563EB] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8] transition-colors whitespace-nowrap tracking-wide">
                  Asset Register
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center h-[42px] px-5 sm:px-6 rounded-[8px] bg-[#EF4444] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:bg-[#DC2626] transition-colors whitespace-nowrap tracking-wide">
                  Maintenance Schedule
                </button>
              </div>
            </header>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1: Asset Valuation */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px] relative">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider">ASSET VALUATION</h3>
                  <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] bg-[#ECFDF5] text-[#10B981] text-[11px] font-bold tracking-wide">
                    +4.2%
                  </div>
                </div>

                <div className="flex justify-between items-start gap-4 mb-auto z-10">
                  <div>
                    <div className="text-[13px] font-semibold text-[#6B7280] tracking-tight mb-1">Book Value</div>
                    <div className="text-[26px] xl:text-[28px] font-bold text-[#111827] tracking-tight leading-none">₦28.45M</div>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#6B7280] tracking-tight mb-1">Net Book Value (NBV)</div>
                    <div className="text-[26px] xl:text-[28px] font-bold text-[#3B5BDB] tracking-tight leading-none">₦21.75M</div>
                  </div>
                </div>
                
                {/* Mock Chart Area */}
                <div className="h-[90px] w-full mt-4 flex items-end relative z-0">
                  <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path d="M0 45 C 10 45, 15 42, 25 40 C 35 38, 40 45, 50 45 C 60 45, 65 30, 75 15 C 80 5, 85 5, 90 20 L 100 20 L 100 50 L 0 50 Z" fill="url(#gradientVal)" opacity="0.3" />
                    <path d="M0 45 C 10 45, 15 42, 25 40 C 35 38, 40 45, 50 45 C 60 45, 65 30, 75 15 C 80 5, 85 5, 90 20 L 100 20" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="gradientVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Category Breakdown */}
                <div className="mt-5 pt-5 border-t border-[#EEF1F6]">
                  <div className="text-[12px] font-semibold text-[#6B7280] mb-2 tracking-tight">Category Breakdown</div>
                  <div className="w-full h-[6px] rounded-full overflow-hidden flex mb-2">
                    <div className="bg-[#2563EB] h-full" style={{ width: '55%' }}></div>
                    <div className="bg-[#38BDF8] h-full" style={{ width: '30%' }}></div>
                    <div className="bg-[#FBBF24] h-full" style={{ width: '15%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#2563EB]"></div>Land/Bldgs</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#38BDF8]"></div>Electronic</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FBBF24]"></div>Furniture</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Health & Status */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px]">
                <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-6">HEALTH & STATUS</h3>
                
                <div className="flex items-center gap-6 xl:gap-8 mb-auto">
                  <div className="relative h-[110px] w-[110px] shrink-0">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                      <circle
                        stroke="#EEF2FF"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                      />
                      <circle
                        stroke="#2563EB"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={`${circumference} ${circumference}`}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                      <span className="text-[26px] font-[900] text-[#111827] leading-none mb-0.5 tracking-tight">{progress}%</span>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">HEALTHY</span>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Operational</span>
                      <span className="text-[14px] font-bold text-[#111827]">412</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Maintenance</span>
                      <span className="text-[14px] font-bold text-[#F59E0B]">54</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-[#6B7280]">Offline/Faulty</span>
                      <span className="text-[14px] font-bold text-[#EF4444]">8</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-[#FFFBEB] border border-[#FEF3C7] rounded-[10px] p-4 flex gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <AlertTriangle className="h-[22px] w-[22px] text-[#F59E0B] shrink-0" strokeWidth={2} />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#D97706] mb-0.5">Critical Alerts</h4>
                    <p className="text-[12px] font-medium text-[#D97706]/80 leading-snug tracking-wide">3 overdue servicing, 2 insurance expiring.</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Queue & Activity */}
              <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-7 shadow-sm flex flex-col h-[420px]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider">QUEUE & ACTIVITY</h3>
                  <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[6px] bg-[#2563EB] text-white text-[10px] font-bold tracking-wide leading-tight">
                    3 NEW
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  {/* Pending Approvals */}
                  <div>
                    <div className="text-[12px] font-semibold text-[#9CA3AF] tracking-tight mb-3">Pending Approvals</div>
                    <div className="space-y-0 text-[13px]">
                      <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3 mb-3">
                        <div>
                          <div className="font-bold text-[#111827] mb-0.5 tracking-tight">Disposal: Old Generator</div>
                          <div className="text-[11px] font-medium text-[#9CA3AF] italic">Initiated by Bro. Segun</div>
                        </div>
                        <button className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Review</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#111827] mb-0.5 tracking-tight">Transfer: 50 Chairs</div>
                          <div className="text-[11px] font-medium text-[#9CA3AF] italic">To Youth Hall</div>
                        </div>
                        <button className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Review</button>
                      </div>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="mt-4 pt-4 border-t border-[#EEF1F6]">
                    <div className="text-[12px] font-semibold text-[#9CA3AF] tracking-tight mb-3">Activity Jan 12 - 22</div>
                    <div className="space-y-3.5 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      <div className="relative flex items-start gap-3">
                        <div className="h-[10px] w-[10px] rounded-full bg-[#10B981] shadow-[0_0_0_2px_#fff] mt-1 shrink-0 z-10" />
                        <div>
                          <div className="text-[12px] font-bold text-[#111827] tracking-tight leading-tight">New Asset Added</div>
                          <div className="text-[10px] font-medium text-[#9CA3AF]">Yamaha Digital Mixer • Jan 22</div>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-3">
                        <div className="h-[10px] w-[10px] rounded-full bg-[#F59E0B] shadow-[0_0_0_2px_#fff] mt-1 shrink-0 z-10" />
                        <div>
                          <div className="text-[12px] font-bold text-[#111827] tracking-tight leading-tight">Maintenance Logged</div>
                          <div className="text-[10px] font-medium text-[#9CA3AF]">HVAC Servicing (Main Sanctuary) • Jan 18</div>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-3">
                        <div className="h-[10px] w-[10px] rounded-full bg-[#38BDF8] shadow-[0_0_0_2px_#fff] mt-1 shrink-0 z-10" />
                        <div>
                          <div className="text-[12px] font-bold text-[#111827] tracking-tight leading-tight">Insurance Renewed</div>
                          <div className="text-[10px] font-medium text-[#9CA3AF]">Church Bus (AG 342 LKJ) • Jan 14</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Active Assets Inventory Table */}
            <div className="rounded-[16px] bg-white border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col flex-1 overflow-hidden min-h-[400px]">
              
              {/* Header */}
              <div className="p-5 sm:p-7 border-b border-[#EEF1F6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-[18px] font-[900] text-[#111827] tracking-tight">Active Assets Inventory</h2>
                
                <div className="flex items-center gap-4">
                  <div className="relative w-full sm:w-[280px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="Search assets..." 
                      className="w-full h-[40px] pl-10 pr-4 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    />
                  </div>
                  
                  <button className="flex items-center justify-center text-[14px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors whitespace-nowrap">
                    View All
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6]">
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">ASSET DESCRIPTION</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">CATEGORY</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">PURCHASE DATE</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none">BOOK VALUE</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none text-center">CONDITION</th>
                      <th className="py-4 px-7 text-[10px] font-[900] text-[#9CA3AF] uppercase tracking-widest leading-none text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsData.map((asset, idx) => (
                      <tr key={idx} className="border-b border-[#EEF1F6]/70 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-[800] text-[#111827] tracking-tight">{asset.name}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-semibold text-[#6B7280]">{asset.category}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[14px] font-semibold text-[#6B7280]">{asset.date}</div>
                        </td>
                        <td className="py-5 px-7">
                          <div className="text-[15px] font-[900] text-[#111827] tracking-tight">{asset.value}</div>
                        </td>
                        <td className="py-5 px-7 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[6px] text-[10px] font-[900] uppercase tracking-widest ${asset.statusColor}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-5 px-7 text-right">
                          <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors"><MoreHorizontal className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination / Footer */}
              <div className="p-5 sm:p-7 border-t border-[#EEF1F6] flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[#6B7280]">
                  Showing 1-2 of 474 assets
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-[34px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#6B7280] flex items-center gap-1 hover:bg-gray-50 transition-all shadow-sm">
                    Previous
                  </button>
                  <button className="h-[34px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#111827] flex items-center gap-1 hover:bg-gray-50 transition-all shadow-sm">
                    Next
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
