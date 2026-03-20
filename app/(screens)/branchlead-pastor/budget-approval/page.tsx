"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Settings,
  HelpCircle,
  PiggyBank,
  ArrowUpRight,
  Search,
  PieChart,
  FolderMinus,
  CheckSquare,
  Building2,
} from "lucide-react"

const SidebarContent = () => (
  <div className="p-6 flex flex-col h-full">
    <div className="flex items-center gap-3 pb-8">
      <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch logo" width={28} height={28} className="shrink-0" />
      <div>
        <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
        <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Lead Pastor View</div>
      </div>
    </div>

    <nav className="space-y-1.5 flex-1">
      {[
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Financial Management", icon: BarChart3 },
        { label: "Assets", icon: Building2 },
        { label: "Budget", icon: PiggyBank, active: true },
        { label: "Compliance & Remittance", icon: ShieldCheck },
      ].map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className={`flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 text-[13px] font-bold cursor-pointer transition-colors ${
              item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#4B5563] hover:bg-gray-50"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 stroke-[2] ${item.active ? "text-[#3B5BDB]" : "text-[#6B7280]"}`} />
            {item.label}
          </div>
        )
      })}
    </nav>

    <div className="mt-auto">
      <div className="space-y-1.5 border-t border-[#EEF1F6] pt-6 text-[13px] font-bold text-[#4B5563]">
        <div className="flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
          <Settings className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
          Settings
        </div>
        <div className="flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
          <HelpCircle className="h-4.5 w-4.5 stroke-[2] text-[#6B7280]" />
          Help Guide
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3.5 px-3.5 pb-2">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm">
          <img src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-[14px] font-extrabold text-[#111827]">Alex Morgan</div>
          <div className="text-[11px] text-[#9CA3AF] font-bold tracking-wide">Lead Pastor</div>
        </div>
      </div>
    </div>
  </div>
)

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [budgetHierarchy, setBudgetHierarchy] = useState([
    {
      category: "Operational",
      isExpanded: true,
      annual: "₦12,500,000",
      ytd: "₦8,125,000",
      remaining: "₦4,375,000",
      usage: 65,
      usageColor: "bg-[#3B5BDB]",
      usageText: "text-[#3B5BDB]",
      children: [
        {
          category: "Utilities",
          annual: "₦2,000,000",
          ytd: "₦1,800,000",
          remaining: "₦200,000",
          usage: 90,
          usageColor: "bg-[#DC2626]",
          usageText: "text-[#DC2626]",
        },
        {
          category: "Transport",
          annual: "₦1,500,000",
          ytd: "₦900,000",
          remaining: "₦600,000",
          usage: 60,
          usageColor: "bg-[#3B5BDB]",
          usageText: "text-[#3B5BDB]",
        },
      ]
    },
    {
      category: "Salaries & Benefits",
      isExpanded: true,
      annual: "₦24,000,000",
      ytd: "₦12,000,000",
      remaining: "₦12,000,000",
      usage: 50,
      usageColor: "bg-[#3B5BDB]",
      usageText: "text-[#3B5BDB]",
      children: null,
    },
    {
      category: "Programs & Outreach",
      isExpanded: true,
      annual: "₦8,000,000",
      ytd: "₦6,800,000",
      remaining: "₦1,200,000",
      usage: 85,
      usageColor: "bg-[#F97316]",
      usageText: "text-[#F97316]",
      children: null,
    },
    {
      category: "Capital Projects",
      isExpanded: true,
      annual: "₦15,000,000",
      ytd: "₦2,500,000",
      remaining: "₦12,500,000",
      usage: 17,
      usageColor: "bg-[#16A34A]",
      usageText: "text-[#16A34A]",
      children: null,
    },
  ])

  const toggleRow = (idx: number) => {
    setBudgetHierarchy(prev => prev.map((row, i) => (i === idx ? { ...row, isExpanded: !row.isExpanded } : row)))
  }

  const collapseAll = () => {
    setBudgetHierarchy(prev => prev.map(row => ({ ...row, isExpanded: false })))
  }
  const expandAll = () => {
    setBudgetHierarchy(prev => prev.map(row => ({ ...row, isExpanded: true })))
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FAFBFF] font-sans" style={{ fontFamily: '"Public Sans", sans-serif' }}>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 xl:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <SidebarContent />
        </aside>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="w-[260px] border-r border-[#EEF1F6] bg-white hidden xl:flex flex-col shrink-0 h-screen sticky top-0 z-20 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <SidebarContent />
      </aside>

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#FAFBFF]">
        
        {/* Top Header / Navbar */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-10 w-full">
          <div className="flex items-center gap-4">
            <button
              className="xl:hidden flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#6B7280]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827] flex items-center gap-2">Dashboard</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search anywhere..."
                className="h-[34px] sm:h-[38px] w-[150px] sm:w-[220px] lg:w-[280px] rounded-[10px] border-none bg-[#F3F4F6] pl-9 text-[12px] sm:text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]"
              />
            </div>
            <div className="h-6 w-px bg-[#EEF1F6] hidden sm:block" />
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 pt-2 px-6 pb-6 lg:pt-3 lg:px-10 lg:pb-10 w-full max-w-[1400px] mx-auto">
          
          {/* Header Actions Row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-5">
            <div>
              <h1 className="text-[26.67px] leading-[33.33px] font-extrabold text-[#111827] uppercase tracking-[-0.67px]">BUDGET CONTROL</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="text-[13px] text-[#6B7280] font-medium tracking-wide">Annual 2024 Comparison <span className="mx-2 text-[#D1D5DB] font-normal">|</span> Scenario: Base Case</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="outline" className="h-[38px] rounded-[10px] border-[#E5E7EB] bg-white px-4 text-[13px] font-bold text-[#374151] shadow-sm hover:bg-gray-50">
                <Calendar className="mr-2 h-4 w-4 text-[#6B7280]" />
                FY 2024
                <ChevronDown className="ml-2 h-4 w-4 text-[#9CA3AF]" />
              </Button>
              <Button className="h-[38px] rounded-[10px] bg-[#EF4444] px-4 text-[13px] font-bold text-white shadow hover:bg-red-600 transition-colors">
                <CheckSquare className="mr-2 h-4 w-4" />
                Approve New Budget
              </Button>
              <Button className="h-[38px] rounded-[10px] bg-[#3B5BDB] px-4 text-[13px] font-bold text-white shadow hover:bg-blue-700 transition-colors">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <div style={{ fontFamily: "inherit" }}>
            {/* Performance Cards Row */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-extrabold text-[#111827] tracking-tight">January 2024 Performance</h2>
                <span className="rounded-[6px] bg-[#ECFDF3] px-2.5 py-1 text-[10px] font-bold text-[#16A34A] tracking-[0.05em] uppercase border border-[#D1FADF]">ACTIVE PERIOD</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Allocated */}
                <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#4B5563]">Allocated</div>
                    <div className="rounded-[8px] bg-[#EEF2FF] p-2 border border-[#E0E7FF]">
                      <FileText className="h-4 w-4 text-[#3B5BDB] stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[24px] font-extrabold text-[#111827] tracking-tight">₦3,000,000</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-emerald-600">
                      <TrendingUp className="h-3.5 w-3.5 stroke-[3]" /> +5% vs last month
                    </div>
                  </div>
                </div>

                {/* Committed */}
                <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#4B5563]">Committed</div>
                    <div className="rounded-[8px] bg-[#FFF7ED] p-2 border border-[#FFEDD5]">
                      <FolderMinus className="h-4 w-4 text-[#F97316] stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[24px] font-extrabold text-[#111827] tracking-tight">80%</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-rose-600">
                      <TrendingDown className="h-3.5 w-3.5 stroke-[3]" /> -2% vs projection
                    </div>
                  </div>
                </div>

                {/* Spent */}
                <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#4B5563]">Spent</div>
                    <div className="rounded-[8px] bg-[#EEF2FF] p-2 border border-[#E0E7FF]">
                      <PieChart className="h-4 w-4 text-[#3B5BDB] stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[24px] font-extrabold text-[#111827] tracking-tight">65%</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-emerald-600">
                      <TrendingUp className="h-3.5 w-3.5 stroke-[3]" /> +10% usage rate
                    </div>
                  </div>
                </div>

                {/* Available */}
                <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-bold text-[#4B5563]">Available</div>
                    <div className="rounded-[8px] bg-[#ECFDF3] p-2 border border-[#D1FADF]">
                      <CheckCircle2 className="h-4 w-4 text-[#16A34A] stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[24px] font-extrabold text-[#111827] tracking-tight">15%</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-rose-600">
                      <TrendingDown className="h-3.5 w-3.5 stroke-[3]" /> -8% buffer left
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Hierarchical View & Forecast Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[2.4fr_1fr] gap-6 items-stretch">
              
              {/* Left Column - Table */}
              <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex items-center justify-between mb-5 px-1">
                  <h3 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Hierarchical Budget View</h3>
                  <div className="flex items-center gap-3.5 text-[13px] font-bold text-[#3B5BDB] select-none">
                    <button onClick={expandAll} className="hover:text-blue-700 transition-colors">Expand All</button>
                    <button onClick={collapseAll} className="text-[#6B7280] hover:text-gray-900 transition-colors">Collapse All</button>
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#EEF1F6] bg-white overflow-hidden shadow-sm w-full h-[560px] flex flex-col">
                  <div className="w-full flex-1 overflow-x-auto">
                    <table className="w-full h-full text-left border-collapse table-fixed min-w-[760px] text-[11px] sm:text-[15.57px]">
                      <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#EEF1F6] align-middle">
                        <th className="px-2 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#6B7280] tracking-wide w-[30%] text-left">Budget Category</th>
                        <th className="px-2 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#6B7280] tracking-wide w-[17%] text-right">Annual Budget</th>
                        <th className="px-2 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#6B7280] tracking-wide w-[17%] text-right">YTD Spent</th>
                        <th className="px-2 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#6B7280] tracking-wide w-[17%] text-right">Remaining</th>
                        <th className="px-2 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-[#6B7280] tracking-wide w-[19%] text-right pr-6">Usage (%)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] sm:text-[15.57px] leading-[16px] sm:leading-[23.36px] font-bold align-middle h-full">
                      {budgetHierarchy.map((row, idx) => (
                        <React.Fragment key={idx}>
                          {/* Parent Row */}
                          <tr className={`border-b border-[#F3F4F6] ${row.isExpanded ? "bg-[#FAFBFF]" : "hover:bg-gray-50"} transition-colors align-middle`}>
                            <td className="px-4 py-3">
                              <div onClick={() => toggleRow(idx)} className="flex items-center gap-2 cursor-pointer font-extrabold text-[#374151] select-none w-max">
                                <ChevronDown className={`h-4.5 w-4.5 text-[#9CA3AF] transition-transform duration-200 stroke-[2.5] ${!row.isExpanded && "-rotate-90"}`} />
                                {row.category}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#4B5563] text-right">{row.annual}</td>
                            <td className="px-4 py-3 font-extrabold text-[#111827] text-right">{row.ytd}</td>
                            <td className="px-4 py-3 font-extrabold text-[#111827] text-right">{row.remaining}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-2 w-[30px] sm:w-[55px] rounded-full bg-gray-100 overflow-hidden shrink-0">
                                  <div className={`h-full rounded-full ${row.usageColor}`} style={{ width: `${row.usage}%` }} />
                                </div>
                                <span className="w-[44px] text-right font-extrabold text-[11px] sm:text-[14px] text-[#111827]">{row.usage}%</span>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Children Rows (If expanded) */}
                          {row.isExpanded && row.children && row.children.map((child, cIdx) => (
                            <tr key={`${idx}-${cIdx}`} className="border-b border-[#EEF1F6] bg-white hover:bg-gray-50 transition-colors align-middle">
                              <td className="px-4 py-3 pl-[44px]">
                                <div className="flex items-center gap-2 relative">
                                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
                                  <span className="font-bold text-[#6B7280] text-[13px]">{child.category}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[13px] font-semibold text-[#6B7280] text-right">{child.annual}</td>
                              <td className="px-4 py-3 text-[13px] font-extrabold text-[#111827] text-right">{child.ytd}</td>
                              <td className="px-4 py-3 text-[13px] font-extrabold text-[#111827] text-right">{child.remaining}</td>
                              <td className="px-4 py-3 items-center whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="h-1.5 w-[30px] sm:w-[55px] rounded-full bg-gray-100 overflow-hidden shrink-0">
                                    <div className={`h-full rounded-full ${child.usageColor}`} style={{ width: `${child.usage}%` }} />
                                  </div>
                                  <span className="w-[40px] text-right font-bold text-[11px] sm:text-[12px] text-[#111827]">{child.usage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column - Overview Widgets */}
              <div className="flex flex-col gap-6 w-full">
                {/* Donut Chart Widget */}
                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[16px] font-extrabold text-[#111827]">Monthly Utilization</h3>
                    <div className="p-1.5 rounded-[8px] hover:bg-gray-100 cursor-pointer text-[#9CA3AF] transition-colors">
                      <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5]" />
                    </div>
                  </div>
                  
                  {/* SVG Donut Illustration */}
                  <div className="relative flex justify-center items-center py-6">
                    <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
                      <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="#EEF1F6" strokeWidth="22" strokeLinecap="round" />
                      <path d="M 15 100 A 85 85 0 0 1 161.4 41" fill="none" stroke="#3B5BDB" strokeWidth="22" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="0" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-3 flex flex-col items-center">
                      <span className="text-[34px] font-black text-[#3B5BDB] tracking-tighter">65%</span>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mt-0.5">Utilized</span>
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#3B5BDB] ring-4 ring-[#EEF2FF]" />
                        <span className="text-[13px] font-bold text-[#4B5563]">Expended</span>
                      </div>
                      <span className="text-[13px] font-extrabold text-[#111827]">₦1,550,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#F97316] ring-4 ring-[#FFF7ED]" />
                        <span className="text-[13px] font-bold text-[#4B5563]">Committed</span>
                      </div>
                      <span className="text-[13px] font-extrabold text-[#111827]">₦450,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#D1D5DB] ring-4 ring-gray-100" />
                        <span className="text-[13px] font-bold text-[#9CA3AF]">Remaining</span>
                      </div>
                      <span className="text-[13px] font-extrabold text-[#6B7280]">₦1,000,000</span>
                    </div>
                  </div>
                </div>

                {/* Forecast Warning Box */}
                <div className="relative overflow-hidden rounded-[16px] bg-[#1E3A8A] p-6 shadow-md text-left border border-[#1E40AF]">
                  <div className="absolute -right-6 -top-10 text-white/5 pointer-events-none">
                    <TrendingUp className="h-40 w-40 stroke-[2.5] transform -rotate-12" />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-white tracking-wide flex items-center gap-2"><ArrowUpRight className="h-4 w-4 stroke-[3]" /> Quick Forecast</h3>
                  <p className="mt-2.5 text-[12px] leading-[1.5] text-white/80 pr-6 font-medium">
                    Based on current trajectory, you will exceed your Q1 budget by:
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="text-[28px] font-black tracking-tight text-white drop-shadow-sm">₦1,240,000</div>
                    <span className="rounded-[6px] bg-white/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#93C5FD] border border-white/20 backdrop-blur-md">Critical</span>
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
