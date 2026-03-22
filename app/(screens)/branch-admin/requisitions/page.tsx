"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  LayoutDashboard,
  List,
  Wrench,
  Database,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  ChevronDown,
  Check,
  X as XIcon,
  Printer,
  FileText,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Send,
  Calendar
} from "lucide-react"

import BranchAdminHeader from "@/components/navigation/BranchAdminHeader"

const inter = Inter({ subsets: ["latin"] })

const tableData = [
  {
    id: "#REQ-2023-089",
    date: "Oct 24, 2023",
    time: "10:30 AM",
    categoryIcon: "purple", // simplified category indicator
    categoryLabel: "Office Supplies",
    amount: "₦ 45,000.00",
    status: "Approved",
    statusColor: "green",
    selected: false,
  },
  {
    id: "#REQ-2023-088",
    date: "Oct 23, 2023",
    time: "02:15 PM",
    categoryIcon: "orange",
    categoryLabel: "Maintenance",
    amount: "₦ 120,500.00",
    status: "Submitted",
    statusColor: "blue",
    selected: false,
  },
  {
    id: "#REQ-2023-087",
    date: "Oct 22, 2023",
    time: "09:45 AM",
    categoryIcon: "blue",
    categoryLabel: "Logistics",
    amount: "₦ 15,000.00",
    status: "Paid",
    statusColor: "purple",
    selected: false,
  },
  {
    id: "#REQ-2023-086",
    date: "Oct 21, 2023",
    time: "11:00 AM",
    categoryIcon: "gray",
    categoryLabel: "IT Equipment",
    amount: "₦ 250,000.00",
    status: "Draft",
    statusColor: "gray",
    selected: false,
  },
  {
    id: "#REQ-2023-085",
    date: "Oct 20, 2023",
    time: "04:45 PM",
    categoryIcon: "cyan",
    categoryLabel: "Utilities",
    amount: "₦ 25,000.00",
    status: "Rejected",
    statusColor: "red",
    selected: true,
  }
]

export default function RequisitionsHub() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sub-components for styling
  const StatusPill = ({ status, color }: { status: string, color: string }) => {
    const maps = {
      green: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", dot: "bg-[#10B981]" },
      blue: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
      purple: { bg: "bg-[#F3E8FF]", text: "text-[#A855F7]", dot: "bg-[#A855F7]" },
      gray: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" },
      red: { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]", dot: "bg-[#EF4444]" }
    }
    const theme = maps[color as keyof typeof maps] || maps.gray

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${theme.bg} rounded-full`}>
        <div className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
        <span className={`text-[10px] font-[800] uppercase tracking-wider ${theme.text}`}>{status}</span>
      </div>
    )
  }

  const CategoryIcon = ({ type }: { type: string }) => {
    const configs = {
      purple: { bg: "bg-[#F3E8FF]", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> },
      orange: { bg: "bg-[#FFF7ED]", icon: <Wrench className="h-3 w-3 text-[#F97316]" strokeWidth={2.5}/> },
      blue: { bg: "bg-[#EFF6FF]", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" focusable="false" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
      gray: { bg: "bg-[#F3F4F6]", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" focusable="false" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
      cyan: { bg: "bg-[#ECFEFF]", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
    }
    const theme = configs[type as keyof typeof configs] || configs.gray
    return (
      <div className={`h-[22px] w-[22px] rounded-[6px] flex items-center justify-center ${theme.bg}`}>
        {theme.icon}
      </div>
    )
  }

  return (
    <div className={`flex flex-col xl:flex-row min-h-[100dvh] bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>
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
        
        <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* Logo Container */}
          <div className="flex items-center gap-3 pb-8 px-6">
            <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={32} height={32} className="shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="text-[17px] font-[800] text-[#2563EB] leading-tight tracking-tight">ShepherdWatch</div>
              <div className="text-[11.5px] text-[#6B7280] font-medium tracking-wide">Admin&apos;s View</div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1.5 mt-2 px-3">
            {[
              { label: "Dashboard", href: "#", icon: LayoutDashboard },
              { label: "Requisitions", href: "#", icon: List, active: true },
              { label: "Logistics & Repairs", href: "#", icon: Wrench },
              { label: "Assets", href: "#", icon: Database },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-[14px] font-[700] cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#2563EB]" : "text-[#4B5563] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-5 w-5 stroke-[2] ${item.active ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                    {item.label}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* System Section */}
          <div className="px-3 mt-4">
            <div className="text-[11px] font-[800] text-[#9CA3AF] tracking-widest uppercase mb-3 px-4">System</div>
            <div className="space-y-1">
              <div className="flex items-center gap-3.5 rounded-[8px] px-4 py-3 cursor-pointer text-[14px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 stroke-[2] text-[#6B7280]" />
                Settings
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-3 mb-2">
            <div className="pt-6 border-t border-[#EEF1F6] flex items-center gap-3.5 px-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-[800] text-[#111827] leading-tight mb-0.5">Alex Morgan</div>
                <div className="text-[12px] font-medium text-[#9CA3AF] leading-tight">Branch Officer</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
        {/* Top Header */}
        <header className="h-[64px] sm:h-[73px] bg-white border-b border-[#EEF1F6] flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#4B5563]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[18px] font-[900] text-[#111827] tracking-tight hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-end">
            <div className="relative w-full max-w-[180px] sm:max-w-[240px] md:max-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="search"
                placeholder="Search requisitions..."
                className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#6B7280] relative">
              <Bell className="h-5 w-5" strokeWidth={2} />
              <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-[40px] pt-5 sm:pt-6 pb-10 sm:pb-12 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-6 lg:gap-8">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[650px]">
                <h1 
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: "30.14px",
                    lineHeight: "33.49px",
                    letterSpacing: "-0.75px",
                    verticalAlign: "middle"
                  }}
                >
                  Requisitions Hub
                </h1>
                <p className="text-[15px] text-[#6B7280] font-medium leading-relaxed">
                  Manage branch expenses, track approvals, and view audit trails for all financial requests.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-end">
                <button className="h-[44px] px-5 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center gap-2 text-[14px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                  <Printer className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
                  Print Voucher
                </button>
                <button className="h-[44px] px-5 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[14px] font-[800] text-white transition-colors shadow-sm shrink-0">
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  Create New Requisition
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-[16px] p-4 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5}/>
                  <span className="text-[13px] font-[700] text-[#6B7280]">Total Requisitions</span>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "20.09px",
                    lineHeight: "26.79px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  128
                </div>
                <div className="text-[12px] font-[700] text-[#10B981] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  +12% from last month
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[16px] p-4 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5}/>
                  <span className="text-[13px] font-[700] text-[#6B7280]">Total Outstanding</span>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "20.09px",
                    lineHeight: "26.79px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  ₦ 450,000
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF]">Across 5 requests</div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[16px] p-4 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5}/>
                  <span className="text-[13px] font-[700] text-[#6B7280]">Pending Approval</span>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "20.09px",
                    lineHeight: "26.79px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  3
                </div>
                <div className="text-[12px] font-[700] text-[#F97316]">Needs attention</div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-[16px] p-4 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-[#9CA3AF]" strokeWidth={2.5}/>
                  <span className="text-[13px] font-[700] text-[#6B7280]">Recently Paid</span>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "20.09px",
                    lineHeight: "26.79px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  ₦ 150,000
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF]">Last 7 days</div>
              </div>
            </div>

            {/* Table & Pagination Area Wrapper */}
            <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col overflow-hidden">
              
              {/* Header inside wrapper */}
              <div className="p-5 flex items-center justify-between border-b border-[#EEF1F6]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <List className="h-4 w-4 text-[#2563EB]" strokeWidth={3}/>
                  </div>
                  <h2 className="text-[16px] font-[900] text-[#2563EB] tracking-tight">All Requisitions</h2>
                </div>
                <button className="text-[13px] font-[700] text-[#6B7280] hover:text-[#111827] flex items-center gap-2 transition-colors">
                  <Download className="h-4 w-4" strokeWidth={2.5}/>
                  Export CSV
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#EEF1F6] bg-[#F8FAFC]/30">
                {/* Search Input */}
                <div className="relative w-full md:max-w-[340px]">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
                  <input
                    type="search"
                    placeholder="Search by ID, Category..."
                    className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-4 text-[13.5px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm"
                  />
                </div>
                {/* Dropdowns */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <button className="h-[42px] px-4 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center gap-2.5 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
                    All Statuses <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={3} />
                  </button>
                  <button className="h-[42px] px-4 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center gap-2.5 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
                    <Calendar className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5}/>
                    This Month
                  </button>
                </div>
              </div>

              {/* Table Body Web View */}
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white">
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[18%]">ID</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[18%]">DATE</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[20%]">CATEGORY</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[18%] text-right">AMOUNT</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[16%]">STATUS</th>
                      <th className="py-4 px-6 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[10%] text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {tableData.map((req, idx) => (
                      <tr key={idx} className={`group transition-colors ${req.selected ? 'bg-[#EFF6FF]/40 border-l-[3px] border-l-[#2563EB]' : 'hover:bg-[#F8FAFC] border-l-[3px] border-l-transparent bg-white'}`}>
                        <td className="py-5 px-6">
                          <div className="text-[13.5px] font-[900] text-[#111827]">{req.id}</div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-[13px] font-[700] text-[#4B5563]">{req.date}</div>
                            <div className="text-[11.5px] font-[500] text-[#9CA3AF]">{req.time}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <CategoryIcon type={req.categoryIcon} />
                            <div className="text-[13px] font-[700] text-[#4B5563]">{req.categoryLabel}</div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="text-[14px] font-[900] text-[#111827]">{req.amount}</div>
                        </td>
                        <td className="py-5 px-6">
                          <StatusPill status={req.status} color={req.statusColor} />
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center justify-center w-full">
                            <button className={`h-8 w-8 rounded-[8px] flex items-center justify-center transition-colors ${req.selected ? 'bg-[#DBEAFE] text-[#2563EB]' : 'text-[#9CA3AF] hover:bg-gray-100 hover:text-[#4B5563]'}`}>
                              <Eye className="h-4.5 w-4.5" strokeWidth={2.5}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="border-t border-[#EEF1F6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <div className="text-[13px] font-[600] text-[#9CA3AF]">
                  Showing <span className="font-[800] text-[#111827]">1-5</span> of <span className="font-[800] text-[#111827]">128</span> items
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-[36px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
                    Previous
                  </button>
                  <button className="h-[36px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
                    Next
                  </button>
                </div>
              </div>

            </div>

            {/* Audit Log Section */}
            <div className="bg-[#EFF6FF]/40 rounded-[16px] border border-[#DBEAFE] p-6 sm:p-8 mt-2 shadow-sm">
              <div className="flex items-center gap-2.5 mb-8">
                <List className="h-5 w-5 text-[#2563EB]" strokeWidth={2.5}/>
                <h2 className="text-[14px] uppercase tracking-wider font-[900] text-[#2563EB]">AUDIT LOG: #REQ-2023-085</h2>
              </div>

              {/* Timeline Items */}
              <div className="flex flex-col relative pl-2">
                {/* Connecting Line */}
                <div className="absolute top-2 bottom-2 left-[18.5px] w-[2px] bg-[#DBEAFE] z-0" />
                
                {/* Item 1 */}
                <div className="flex gap-5 relative z-10 mb-8">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-white border-[2px] border-[#DBEAFE] flex items-center justify-center mt-0.5">
                    <XIcon className="h-3 w-3 text-[#EF4444]" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col gap-1 -mt-0.5">
                    <div className="text-[14px] font-[800] text-[#111827]">Request Rejected</div>
                    <div className="text-[13px] font-[500] text-[#6B7280]">
                      Rejected by <span className="font-[700] text-[#111827]">Sarah Jenkins (Regional Manager)</span>. Reason: &quot;Incorrect budget code selected.&quot;
                    </div>
                    <div className="text-[11.5px] font-[600] text-[#9CA3AF] mt-1 tracking-wide">Oct 21, 2023 • 09:15 AM</div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-5 relative z-10 mb-8">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-white border-[2px] border-[#DBEAFE] flex items-center justify-center mt-0.5">
                    <Send className="h-2.5 w-2.5 text-[#2563EB] -ml-0.5 mt-0.5" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col gap-1 -mt-0.5">
                    <div className="text-[14px] font-[800] text-[#111827]">Request Submitted</div>
                    <div className="text-[13px] font-[500] text-[#6B7280]">
                      Submitted by <span className="font-[700] text-[#111827]">John Doe (Admin Officer)</span> for approval.
                    </div>
                    <div className="text-[11.5px] font-[600] text-[#9CA3AF] mt-1 tracking-wide">Oct 20, 2023 • 04:45 PM</div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-5 relative z-10">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-white border-[2px] border-[#DBEAFE] flex items-center justify-center mt-0.5">
                    <FileText className="h-3 w-3 text-[#9CA3AF]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1 -mt-0.5">
                    <div className="text-[14px] font-[800] text-[#111827]">Draft Created</div>
                    <div className="text-[13px] font-[500] text-[#6B7280]">
                      Initial draft saved.
                    </div>
                    <div className="text-[11.5px] font-[600] text-[#9CA3AF] mt-1 tracking-wide">Oct 20, 2023 • 04:30 PM</div>
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
