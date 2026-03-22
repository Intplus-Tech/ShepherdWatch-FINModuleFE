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
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Check,
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

const tableData = [
  {
    id: 1,
    taskTitle: "Generator Facility",
    subtitle: "REQ-2023-085 (30% paid)",
    category: "Utilities",
    priority: "High",
    cost: "₦85,000.00",
    status: "- Pending",
    selected: true,
  },
  {
    id: 2,
    taskTitle: "Office AC Repair",
    subtitle: "AC-23-442 (Not paid)",
    category: "Repairs",
    priority: "Medium",
    cost: "₦35,500.00",
    status: "- Pending",
    selected: true,
  },
  {
    id: 3,
    taskTitle: "Printer Toner Restock",
    subtitle: "PR-2023-102 (Paid)",
    category: "Supplies",
    priority: "Low",
    cost: "₦25,400.00",
    status: "- Pending",
    selected: true,
  },
  {
    id: 4,
    taskTitle: "Vehicle Servicing (Toyota Hilux)",
    subtitle: "VH-2023-094 (Not paid)",
    category: "Transport",
    priority: "Medium",
    cost: "₦150,000.00",
    status: "Authorizing",
    selected: false,
  }
]

export default function LogisticsRepairsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sub-component for priority badges
  const PriorityBadge = ({ priority }: { priority: string }) => {
    let colorClasses = ""
    switch (priority) {
      case "High":
        colorClasses = "bg-[#FEF2F2] text-[#EF4444]" // Red
        break
      case "Medium":
        colorClasses = "bg-[#FFF7ED] text-[#F97316]" // Orange
        break
      case "Low":
        colorClasses = "bg-[#ECFDF5] text-[#10B981]" // Green
        break
      default:
        colorClasses = "bg-[#F3F4F6] text-[#6B7280]" // Gray
    }
    return (
      <span className={`text-[10px] font-[800] uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${colorClasses}`}>
        {priority}
      </span>
    )
  }

  // Determine selection status
  const selectedCount = tableData.filter(item => item.selected).length
  const totalSelectedCost = tableData.filter(item => item.selected).reduce((acc, curr) => acc + parseFloat(curr.cost.replace(/[₦,]/g, "")), 0)

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
              { label: "Requisitions", href: "#", icon: List },
              { label: "Logistics & Repairs", href: "#", icon: Wrench, active: true },
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
        <main className="flex-1 px-4 sm:px-6 lg:px-[40px] pt-3 sm:pt-4 pb-10 sm:pb-12 overflow-y-auto w-full">
          <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-6 lg:gap-8">

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[650px]">
                <h1 
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: "23.49px",
                    lineHeight: "28.19px",
                    letterSpacing: "-0.59px",
                    verticalAlign: "middle"
                  }}
                >
                  Logistics & Repairs
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] font-[500] leading-relaxed">
                  Manage ongoing maintenance tasks and recurring expenses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-end w-full sm:w-auto md:ml-auto md:justify-end">
                <button className="h-[40px] sm:h-[44px] px-4 sm:px-5 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center gap-2 text-[12.5px] sm:text-[14px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm shrink-0 w-full sm:w-[210px]">
                  <Download className="h-4 w-4 text-[#6B7280]" strokeWidth={2.5} />
                  Export Report
                </button>
                <button className="h-[40px] sm:h-[44px] px-4 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center gap-2 text-[12.5px] sm:text-[14px] font-[800] text-white transition-colors shadow-sm shrink-0 w-full sm:w-[210px]">
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  New Maintenance Request
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Pending Repairs</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#FFF7ED] flex items-center justify-center">
                    <Wrench className="h-3.5 w-3.5 text-[#F97316]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  12
                </div>
                <div className="text-[12px] font-[700] text-[#EF4444] flex items-center gap-1 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                  +2% for this week
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Total Estimated Cost</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-[#2563EB]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  ₦25,550,000.00
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF] mt-1">Across 18 pending tasks</div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[16px] p-5 sm:p-6 border border-[#EEF1F6] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-[700] text-[#6B7280]">Upcoming Bills</span>
                  <div className="h-7 w-7 rounded-[6px] bg-[#F3E8FF] flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-[#A855F7]" strokeWidth={2.5}/>
                  </div>
                </div>
                <div
                  className="text-[#111827] mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "18.79px",
                    lineHeight: "25.06px",
                    letterSpacing: "0%",
                    verticalAlign: "middle"
                  }}
                >
                  5
                </div>
                <div className="text-[12px] font-[600] text-[#9CA3AF] mt-1">Due in next 30 days</div>
              </div>
            </div>

            {/* Split Main Area */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              
              {/* Left Column (Table) */}
              <div className="w-full lg:flex-[2] min-w-0">
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm flex flex-col relative overflow-hidden pb-[70px]">
                  
                  {/* Table Header / Toolbar */}
                  <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EEF1F6]">
                    <h2 className="text-[16px] font-[900] text-[#111827] tracking-tight self-start sm:self-auto">Pending Maintenance Tasks</h2>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-auto group">
                      <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={2.5} />
                        <input
                          type="search"
                          placeholder="Search tasks..."
                          className="h-[38px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] pl-10 pr-4 text-[13px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all"
                        />
                      </div>
                      <button className="h-[38px] w-[38px] rounded-[8px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors shrink-0">
                        <Filter className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Cards (xs only) */}
                  <div className="sm:hidden divide-y divide-[#EEF1F6]">
                    {tableData.map((task) => (
                      <div key={task.id} className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[13.5px] font-[800] text-[#111827]">{task.taskTitle}</div>
                            <div className="text-[12px] font-[500] text-[#9CA3AF]">{task.subtitle}</div>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[12px] font-[600] text-[#4B5563]">{task.category}</div>
                          <div className="text-[13px] font-[800] text-[#111827]">{task.cost}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          {task.status === "Authorizing" ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFF7ED] rounded-[4px]">
                              <span className="text-[10px] font-[800] uppercase tracking-wider text-[#F97316]">Authorizing</span>
                            </div>
                          ) : (
                            <div className="text-[12px] font-[600] text-[#9CA3AF]">{task.status}</div>
                          )}
                          <button className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100">
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table (sm and up) */}
                  <div className="hidden sm:block w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead>
                        <tr className="border-b border-[#EEF1F6] bg-[#F9FAFB]/50">
                          <th className="py-4 px-6 w-[5%]">
                            <div className="h-4 w-4 rounded-[4px] border-2 border-[#D1D5DB] flex items-center justify-center cursor-pointer">
                            </div>
                          </th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[35%]">TASK DETAILS</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">CATEGORY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">PRIORITY</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[15%]">EST. COST</th>
                          <th className="py-4 px-2 text-[10px] uppercase tracking-wider font-[800] text-[#9CA3AF] w-[10%]">STATUS</th>
                          <th className="py-4 px-6 w-[5%]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1F6]">
                        {tableData.map((task) => (
                          <tr key={task.id} className={`group transition-colors ${task.selected ? 'bg-[#EFF6FF]/40' : 'hover:bg-[#F8FAFC]'}`}>
                            <td className="py-4 px-6">
                              <div className={`h-4 w-4 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-colors ${task.selected ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#D1D5DB] bg-white'}`}>
                                {task.selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex flex-col gap-0.5">
                                <div className="text-[13.5px] font-[800] text-[#111827]">{task.taskTitle}</div>
                                <div className="text-[12px] font-[500] text-[#9CA3AF]">{task.subtitle}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13px] font-[600] text-[#4B5563]">{task.category}</div>
                            </td>
                            <td className="py-4 px-2">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-[13.5px] font-[800] text-[#111827]">{task.cost}</div>
                            </td>
                            <td className="py-4 px-2">
                              {task.status === "Authorizing" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFF7ED] rounded-[4px]">
                                  <span className="text-[10px] font-[800] uppercase tracking-wider text-[#F97316]">Authorizing</span>
                                </div>
                              ) : (
                                <div className="text-[13px] font-[600] text-[#9CA3AF]">{task.status}</div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1 rounded-md hover:bg-gray-100">
                                <MoreVertical className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Floating Action Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#EEF1F6] flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[12px] font-[800] flex items-center justify-center">
                        {selectedCount}
                      </div>
                      <div className="text-[13px] font-[600] text-[#4B5563]">
                        Items Selected <span className="mx-1 text-[#D1D5DB]">|</span> Total: <span className="font-[900] text-[#111827]">₦{totalSelectedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="h-[36px] px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[13px] font-[700] hover:bg-gray-50 transition-colors">
                        Reject
                      </button>
                      <button className="h-[36px] px-5 rounded-[6px] bg-[#2563EB] text-white text-[13px] font-[800] flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors shadow-sm">
                        Create Batch Requisition
                        <ChevronRight className="h-4 w-4 -mr-1" strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column (Calendar/Expenses) */}
              <div className="w-full lg:flex-[1] min-w-0">
                <div className="bg-white rounded-[16px] border border-[#EEF1F6] shadow-sm p-5 md:p-6 flex flex-col w-full h-full">
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[15px] font-[900] text-[#111827]">Recurring Expenses</h2>
                    <div className="flex items-center gap-3 text-[13px] font-[700] text-[#4B5563]">
                      <ChevronLeft className="h-4 w-4 text-[#9CA3AF] cursor-pointer hover:text-[#4B5563]" strokeWidth={2.5} />
                      October 2023
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] cursor-pointer hover:text-[#4B5563]" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="w-full">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 mb-2">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                        <div key={day} className="text-center text-[10px] font-[800] uppercase text-[#9CA3AF] py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Dates */}
                    <div className="grid grid-cols-7 gap-y-2">
                      {/* Empty spaces for start of month */}
                      <div className="aspect-square flex flex-col items-center justify-center relative"></div>
                      
                      {/* Generative Dates Array (simplistic representation for UI) */}
                      {[...Array(31)].map((_, i) => {
                        const date = i + 1;
                        const isSelected = date === 18;
                        const hasDot = date === 13 || date === 20;

                        return (
                          <div key={date} className="aspect-square flex flex-col items-center justify-center relative p-0.5">
                            <div className={`h-full w-full rounded-[8px] flex items-center justify-center text-[12px] font-[700] cursor-pointer transition-colors ${isSelected ? 'bg-[#2563EB] text-white shadow-md' : 'text-[#4B5563] hover:bg-gray-50'}`}>
                              {date}
                            </div>
                            {hasDot && !isSelected && (
                              <div className="absolute bottom-1 h-1 w-1 rounded-full bg-[#10B981]"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-[#EEF1F6] my-6"></div>

                  <h3 className="text-[11px] font-[800] uppercase text-[#9CA3AF] tracking-wider mb-4">Upcoming This Week</h3>
                  
                  {/* Upcoming Item 1 */}
                  <div className="flex justify-between items-start mb-5 pb-5 border-b border-[#F3F4F6]">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center h-10 w-10 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] shrink-0">
                        <span className="text-[10px] font-[800] uppercase text-[#EF4444] leading-none mb-0.5">Oct</span>
                        <span className="text-[14px] font-[900] text-[#EF4444] leading-none">24</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-[13.5px] font-[800] text-[#111827]">Office Leases</div>
                        <div className="text-[12px] font-[600] text-[#6B7280]">₦1,200,000 / Mo</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-[800] uppercase tracking-wider text-[#EF4444] px-2 py-0.5 rounded-[4px] bg-[#FEF2F2] mt-1 shrink-0">
                      Due
                    </span>
                  </div>

                  {/* Upcoming Item 2 */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center h-10 w-10 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] shrink-0 text-[#6B7280]">
                        <span className="text-[10px] font-[800] uppercase leading-none mb-0.5">Oct</span>
                        <span className="text-[14px] font-[900] leading-none">28</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="text-[13.5px] font-[800] text-[#111827]">Internet Bill</div>
                        <div className="text-[12px] font-[600] text-[#6B7280]">₦85,000 / Mo</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-[800] uppercase tracking-wider text-[#2563EB] px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] mt-1 shrink-0">
                      Upcoming
                    </span>
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
