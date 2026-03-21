"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
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
  ArrowLeft,
  AlertTriangle,
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

const urgentAlerts = [
  {
    title: "Diesel Generator 500kVA",
    meta: "Last serviced: 2 weeks ago",
    status: "Action Required"
  },
  {
    title: "Fire Extinguishers (Hall A)",
    meta: "Due in 7 days",
    status: "Action Required"
  }
]

type EventColorType = "blue-light" | "blue-solid" | "yellow" | "green"
type CalendarEvent = { title: string; sub?: string; colorType: EventColorType }

const calendarDays: { label: string; isToday?: boolean; events: CalendarEvent[] }[] = [
  { label: "Mon 15", events: [{ title: "Sound System", sub: "Check (2 Hours)", colorType: "blue-light" }] },
  { label: "Tue 16", events: [{ title: "Backup Test", sub: "Facility Server", colorType: "blue-light" }] },
  { label: "Wed 17", events: [{ title: "HVAC Service", sub: "Tunde Electronics", colorType: "blue-solid" }] },
  { label: "Thu 18", events: [{ title: "Projector Swap", sub: "Main Hall", colorType: "blue-light" }] },
  { label: "Fri 19", isToday: true, events: [{ title: "Filter Replace", sub: "AC 1 (Hall A)", colorType: "blue-solid" }] },
  { label: "Sat 20", events: [{ title: "Landscape Trim", sub: "Front Yard", colorType: "yellow" }] },
  { label: "Sun 21", events: [{ title: "Auto Doors", sub: "Test Sensors", colorType: "green" }] },
]

const completedMaintenance = [
  {
    date: "Jan 10, 2024",
    asset: "Toyota Coaster Bus (LAG-012)",
    type: "Engine Service & Oil Change",
    technician: "Bob Afolayan",
    cost: "₦150,000",
    status: "Verified",
  },
  {
    date: "Jan 11, 2024",
    asset: "Sanctuary Sound Mixer",
    type: "Fader Replacement (Fader 4)",
    technician: "Tunde Electronics",
    cost: "₦50,000",
    status: "Verified",
  },
  {
    date: "Jan 12, 2024",
    asset: "Broadcast Camera",
    type: "Seal & Gasket Replacement",
    technician: "Grace Chapel AV Team",
    cost: "₦25,000",
    status: "Verified",
  },
  {
    date: "Jan 13, 2024",
    asset: "Auditorium AC (Unit 2A)",
    type: "Freon Refill & Coil Wash",
    technician: "Kool Masters Ltd",
    cost: "₦85,000",
    status: "Verified",
  },
]

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getEventStyles = (colorType: EventColorType) => {
    switch (colorType) {
      case "blue-light":
        return "bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]"
      case "blue-solid":
        return "bg-[#2563EB] border border-[#2563EB] text-white"
      case "yellow":
        return "bg-[#FEF9C3] border border-[#FEF08A] text-[#D97706]"
      case "green":
        return "bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              { label: "Assets", href: "/branchaccount-pastor/asset-register", icon: Database, active: true },
              { label: "Compliance & Remittance", href: "/branchaccount-pastor/compliance-remittance", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
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
      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        
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

        {/* Scrollable Main Layout */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">

            {/* Back Button */}
            <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors mb-4 text-[13px] font-semibold tracking-wide">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Header Section */}
            <header className="mb-6 sm:mb-8">
              <h1
                className="text-[26.21px] font-black text-[#111827] tracking-[-0.66px] leading-[32.76px] mb-1.5"
                style={{ fontFamily: "Inter, sans-serif", verticalAlign: "middle" }}
              >
                Maintenance Management Hub
              </h1>
              <p className="text-[14px] text-[#6B7280] font-medium tracking-tight">Oversee asset upkeep and service schedules for the branch.</p>
            </header>

            {/* Top Grid Area */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.85fr] gap-6 mb-8 items-start">
              
              {/* Left Column (Alerts & Tip) */}
              <div className="flex flex-col gap-6 w-full">
                
                {/* Urgent Alerts Card */}
                <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <AlertTriangle className="h-5 w-5 text-[#EF4444]" strokeWidth={2.5} />
                    <h3 className="text-[15px] font-[800] text-[#111827] tracking-tight">Urgent Alerts</h3>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {urgentAlerts.map((alert, idx) => (
                      <div key={idx} className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col items-start gap-1">
                        <div className="text-[13.5px] font-[800] text-[#DC2626] leading-snug">{alert.title}</div>
                        <div className="text-[12px] font-medium text-[#9CA3AF]">{alert.meta}</div>
                        <button className="mt-1 text-[12.5px] font-[800] text-[#DC2626] hover:text-[#B91C1C] transition-colors uppercase tracking-wide">
                          {alert.status}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maintenance Tip Card */}
                <div className="rounded-[16px] bg-[#EFF6FF] border border-[#BFDBFE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Wrench className="h-[18px] w-[18px] text-[#2563EB]" strokeWidth={2.5} />
                    <h3 className="text-[14px] font-[800] text-[#1E3A8A] tracking-tight">Maintenance Tip</h3>
                  </div>
                  <p className="text-[13px] font-medium text-[#1E40AF] leading-relaxed">
                    Proactive maintenance can reduce overhead costs and extend asset life cycles to fulfill broader management programs.
                  </p>
                </div>

              </div>

              {/* Right Column (Schedule Calendar) */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col h-full min-h-[400px]">
                
                {/* Header & Legends */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="h-[18px] w-[18px] rounded-[4px] border-[1.5px] border-[#3B5BDB] flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-sm bg-[#3B5BDB]"></div>
                    </div>
                    <h2 className="text-[16px] font-[800] text-[#111827] tracking-tight">January 2024 Schedule</h2>
                  </div>
                  
                  <div className="flex items-center gap-3.5 sm:gap-5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#EF4444]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Overdue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#F59E0B]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#10B981]"></span>
                      <span className="text-[11px] font-[800] text-[#6B7280] uppercase tracking-wider">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Week Strip */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="text-[13.5px] font-[800] text-[#111827] tracking-tight">Week 3 (Jan 15 - Jan 21)</div>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Schedule List */}
                <div className="lg:hidden space-y-3">
                  {calendarDays.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`rounded-[12px] border border-[#EEF1F6] p-4 ${
                        day.isToday ? "bg-[#EEF2FF] border-[#C7D2FE]" : "bg-white"
                      }`}
                    >
                      <div className={`text-[12px] font-[800] tracking-widest uppercase ${day.isToday ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                        {day.label} {day.isToday && <span className="ml-1">(Today)</span>}
                      </div>
                      <div className="mt-3 space-y-2">
                        {day.events.length === 0 && (
                          <div className="text-[12px] text-[#9CA3AF] font-medium">No scheduled task</div>
                        )}
                        {day.events.map((ev, eIdx) => {
                          const styleClass = getEventStyles(ev.colorType)
                          return (
                            <div key={eIdx} className={`w-full rounded-[8px] p-2.5 flex flex-col justify-center ${styleClass}`}>
                              <div className="text-[12px] font-[800] leading-snug tracking-tight">{ev.title}</div>
                              {ev.sub && <div className="text-[11px] opacity-80 mt-0.5 leading-tight">{ev.sub}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:flex flex-1 w-full overflow-x-auto no-scrollbar">
                  <div className="min-w-[700px] h-full flex items-stretch border-t border-[#EEF1F6] pt-4">
                    {/* Render Columns */}
                    <div className="grid grid-cols-7 w-full h-full gap-0">
                      {calendarDays.map((day, dIdx) => (
                        <div 
                          key={dIdx} 
                          className={`flex flex-col h-full min-h-[200px] px-1.5 lg:px-2 border-r border-[#EEF1F6] last:border-r-0 ${
                            day.isToday ? "bg-[#EEF2FF] border border-[#BFDBFE] -my-2 py-2 rounded-[8px] relative z-10 shadow-sm" : ""
                          }`}
                        >
                          {/* Day Header */}
                          <div className={`text-[11px] font-[800] tracking-widest uppercase mb-4 text-center ${day.isToday ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                            {day.label} {day.isToday && <span className="block mt-0.5">(TODAY)</span>}
                          </div>
                          
                          {/* Day Cell Container */}
                          <div className="flex-1 flex flex-col gap-2 pb-2">
                            {day.events.map((ev, eIdx) => {
                              const styleClass = getEventStyles(ev.colorType)
                              return (
                                <div key={eIdx} className={`w-full rounded-[8px] p-2 sm:p-2.5 flex flex-col justify-center ${styleClass}`}>
                                  <div className="text-[11.5px] font-[800] leading-snug tracking-tight">{ev.title}</div>
                                  {ev.sub && <div className="text-[10px] opacity-80 mt-0.5 leading-tight">{ev.sub}</div>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Table Section */}
            <div className="rounded-[16px] bg-white border border-[#EEF1F6] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <h2 className="text-[17px] font-[800] text-[#111827] tracking-tight">Completed Maintenance (Jan 5 - 20)</h2>
                <button className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors leading-none tracking-tight">
                  View All History
                </button>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-[#EEF1F6]/70">
                {completedMaintenance.map((row, idx) => (
                  <div key={idx} className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-bold text-[#6B7280]">{row.date}</div>
                        <div className="mt-1 text-[14px] font-[800] text-[#111827]">{row.asset}</div>
                        <div className="mt-1 text-[12.5px] font-medium text-[#6B7280]">{row.type}</div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                        {row.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-[#2563EB]">{row.technician}</span>
                      <span className="text-[13px] font-[800] text-[#111827]">{row.cost}</span>
                    </div>
                  </div>
                ))}

                <div className="p-5 sm:p-6 bg-[#F8FAFC]">
                  <div className="text-[12px] font-[800] text-[#111827] tracking-tight">Total Maintenance Cost</div>
                  <div className="mt-2 text-[15px] font-[900] text-[#2563EB]">â‚¦ 305,000.00</div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block w-full overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-[#EEF1F6]">
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[14%]">DATE</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[25%]">ASSET</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest">SERVICE TYPE</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest">TECHNICIAN / PROVIDER</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest text-right">COST (₦)</th>
                      <th className="py-5 px-6 sm:px-8 text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-widest w-[12%] text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]/70">
                    {completedMaintenance.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12px] font-bold text-[#6B7280]">{row.date}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[13px] font-[800] text-[#111827]">{row.asset}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12.5px] font-medium text-[#6B7280]">{row.type}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8">
                          <div className="text-[12.5px] font-medium text-[#2563EB]">{row.technician}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-right">
                          <div className="text-[13px] font-[800] text-[#111827]">{row.cost}</div>
                        </td>
                        <td className="py-5 px-6 sm:px-8 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-[800] uppercase tracking-wider bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Table Footer */}
                    <tr className="bg-[#F8FAFC]">
                      <td colSpan={4} className="py-6 px-6 sm:px-8 text-right">
                        <span className="text-[13px] font-[800] text-[#111827] tracking-tight">Total Maintenance Cost:</span>
                      </td>
                      <td colSpan={2} className="py-6 px-6 sm:px-8">
                        <span className="text-[15px] font-[900] text-[#2563EB]">₦ 305,000.00</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
