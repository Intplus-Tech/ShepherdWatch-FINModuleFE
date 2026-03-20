"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  PiggyBank,

  Settings,
  ShieldCheck,
  TrendingUp,
  Undo2,
  Users,
  Wallet,
  AlertTriangle,
  BarChart3,
  Check,
  Search,
  Bell,
  Landmark,
  MessageCircle,
  Menu,
  X
} from "lucide-react"

type BudgetChild = {
  id: string
  name: string
  desc: string
  lastYear: string
  proposed: string
  allocated: string
  variance: string
  varianceColor: string
  warning?: boolean
  hasThread?: boolean
  isActive?: boolean
}

type BudgetRow = {
  id: string
  category: string
  itemCount: number
  total: string
  isExpanded: boolean
  children?: BudgetChild[]
}

// Mock Data
const summaryCards = [
  {
    title: "Total Projected Income",
    value: "₦12,500,450,000.00",
    meta: "+5.2% vs Last Year",
    metaColor: "text-emerald-600",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    titleColor: "text-gray-500",
  },
  {
    title: "Total Expenditure",
    value: "₦380,000,215.00",
    meta: "84% of Income",
    metaColor: "text-gray-500",
    icon: Wallet,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    titleColor: "text-gray-500",
  },
  {
    title: "HQ Statutory Deductions",
    value: "₦45,528,000.00",
    meta: "Fixed 10% Tithe",
    metaColor: "text-gray-500",
    icon: Landmark,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    titleColor: "text-purple-600 font-semibold",
  },
  {
    title: "Net Surplus",
    value: "₦25,000,417.00",
    meta: "Healthy buffer",
    metaColor: "text-emerald-600",
    icon: PiggyBank,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
    titleColor: "text-gray-500",
  },
]

const budgetData: BudgetRow[] = [
  {
    id: "facilities",
    category: "Facilities",
    itemCount: 4,
    total: "$24,500",
    isExpanded: true,
    children: [
      {
        id: "rent",
        name: "Building Rent",
        desc: "Fixed monthly contract",
        lastYear: "$12,000",
        proposed: "$14,000",
        allocated: "14000",
        variance: "0%",
        varianceColor: "text-gray-500"
      },
      {
        id: "maintenance",
        name: "Maintenance & Repairs",
        desc: "High Variance",
        warning: true,
        lastYear: "$2,000",
        proposed: "$5,000",
        allocated: "3000",
        variance: "-40%",
        varianceColor: "text-rose-500"
      },
      {
        id: "utilities",
        name: "Utilities (Electric/Water)",
        desc: "",
        lastYear: "$4,500",
        proposed: "$5,000",
        allocated: "5000",
        variance: "0%",
        varianceColor: "text-gray-500"
      }
    ]
  },
  {
    id: "personnel",
    category: "Personnel",
    itemCount: 5,
    total: "$85,000",
    isExpanded: false,
    children: []
  },
  {
    id: "outreach",
    category: "Outreach & Missions",
    itemCount: 3,
    total: "$8,500",
    isExpanded: false,
    children: []
  },
  {
    id: "admin",
    category: "Administration",
    itemCount: 5,
    total: "$7,000",
    isExpanded: false,
    children: []
  }
]

export function BudgetReviewContent({ rightSidebar, activeRowId }: { rightSidebar?: React.ReactNode, activeRowId?: string }) {
  const [data, setData] = useState(budgetData)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleExpand = (id: string) => {
    setData(data.map(row => row.id === id ? { ...row, isExpanded: !row.isExpanded } : row))
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen overflow-hidden bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      
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
              <div className="text-[11px] text-[#9CA3AF] font-bold mt-1 tracking-wide uppercase">Lead Pastor View</div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Financial Management", icon: BarChart3, hasChevron: true },
              { label: "Assets", icon: Building2 },
              { label: "Budget", icon: Wallet, active: true },
              { label: "Compliance & Remittance", icon: ShieldCheck },
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
                  {item.hasChevron && <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />}
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
              <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Alex Morgan</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium">Lead Pastor</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout Wrapping Column */}
      <div className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden bg-[#F8FAFC] relative w-full">
        
        {/* Center Panel Container */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full relative">
          
        {/* Top Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
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
                placeholder="Search requisitions..." 
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
        <main className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto p-4 sm:p-6 xl:p-8">
          
          {/* Header Actions Row */}
          <div className="mb-0 border-none bg-transparent">
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-4 md:mb-3 mt-1 md:mt-0">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <h1 
                    className="text-[#111827]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 900,
                      fontSize: "26.95px",
                      lineHeight: "33.69px",
                      letterSpacing: "-0.67px",
                      verticalAlign: "middle"
                    }}
                  >
                    Annual Budget Proposal 2024
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/20 whitespace-nowrap">
                    Pending Review
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280] mt-2 font-medium">
                  Submitted by: <span className="text-[#374151] font-semibold">Deacon Sarah Jenkins (Accountant)</span> on Oct 12, 2023
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button 
                variant="outline" 
                className="bg-white text-[#374151] shadow-sm hover:bg-gray-50 flex items-center gap-2 justify-center border-[#E5E7EB]"
                style={{
                  width: "125.88px",
                  height: "35.93px",
                  borderRadius: "7.19px",
                  borderWidth: "0.9px",
                  opacity: 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "12.58px",
                  lineHeight: "17.97px",
                  letterSpacing: "0%",
                  textAlign: "center",
                  verticalAlign: "middle"
                }}
              >
                <Undo2 className="h-4 w-4 text-[#6B7280]" />
                Send Back
              </Button>
              <Button 
                className="bg-[#2563EB] text-white shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5 justify-center px-0"
                style={{
                  width: "125.88px",
                  height: "35.93px",
                  borderRadius: "7.19px",
                  borderWidth: "0.9px",
                  borderColor: "transparent",
                  opacity: 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "12.58px",
                  lineHeight: "17.97px",
                  letterSpacing: "0%",
                  textAlign: "center",
                  verticalAlign: "middle"
                }}
              >
                <Check className="h-3.5 w-3.5" />
                Approve Budget
              </Button>
            </div>
          </div>
        </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-6 sm:mb-8">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div key={idx} className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-start justify-between">
                    <div className={`text-[12.5px] font-medium ${card.titleColor}`}>{card.title}</div>
                    <div className={`rounded-lg p-2 ${card.iconBg}`}>
                      <Icon className={`h-4.5 w-4.5 stroke-[2] ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[22px] font-bold text-[#111827] tracking-tight">{card.value}</div>
                    <div className={`mt-1.5 text-[12px] font-medium ${card.metaColor}`}>
                      {card.meta}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E2E8F0] mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1">
            <button className="flex items-center gap-2 pb-3 border-b-2 border-[#2563EB] text-[#2563EB] text-[13.5px] font-semibold transition-colors">
              <FolderOpen className="h-4 w-4" />
              Operational
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#64748B] hover:text-[#334155] text-[13.5px] font-medium transition-colors">
              <Building2 className="h-4 w-4" />
              Capital
            </button>
            <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#64748B] hover:text-[#334155] text-[13.5px] font-medium transition-colors">
              <Users className="h-4 w-4" />
              Program
            </button>
          </div>

          {/* Table Area */}
          <div className="rounded-[16px] border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
            <div className="w-full flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] text-[13px]">
                <thead className="bg-transparent text-[#64748B] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-[35%]">LINE ITEM</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">LAST YEAR</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">PROPOSED</th>
                    <th className="px-6 py-4 font-semibold text-center w-[20%] text-[#2563EB]">ALLOCATED</th>
                    <th className="px-6 py-4 font-semibold text-center w-[15%]">VARIANCE</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] font-medium text-[#111827]">
                  {data.map((row) => (
                    <React.Fragment key={row.id}>
                      {/* Parent Row */}
                      <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/50 hover:bg-[#F1F5F9]/50 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => toggleExpand(row.id)} className="flex items-center gap-2 font-bold text-[#334155] hover:text-[#0F172A] transition-colors focus:outline-none">
                            {row.isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                            )}
                            {row.category}
                            <span className="ml-2 inline-flex items-center rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
                              {row.itemCount} items
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center"></td>
                        <td className="px-6 py-4 text-center"></td>
                        <td className="px-6 py-4 text-center"></td>
                        <td className="px-6 py-4 text-right text-[#475569] pr-8 text-[12.5px]">Total: {row.total}</td>
                      </tr>
                      
                      {/* Children Rows */}
                      {row.isExpanded && row.children?.map((child: BudgetChild) => {
                        const isActive = activeRowId === child.id || child.isActive;
                        return (
                        <tr 
                          key={child.id} 
                          className={`border-b border-[#F1F5F9] group transition-colors ${isActive ? "bg-[#F0F9FF]" : "bg-white hover:bg-[#F8FAFC]"}`}
                        >
                          <td className="px-6 py-4 pl-12 relative">
                            {/* Active Edge Indicator inside TD to prevent layout shift */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#2563EB]"></div>
                            )}
                            <div className="font-semibold text-[#1E293B]">{child.name}</div>
                            {child.desc && (
                              <div className={`mt-1 text-[11.5px] flex items-center gap-1 ${child.warning ? "text-amber-600 font-medium" : "text-[#64748B]"}`}>
                                {child.warning && <AlertTriangle className="h-3 w-3" />}
                                {child.desc}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-[#475569] font-medium">{child.lastYear}</td>
                          <td className="px-6 py-4 text-center font-semibold text-[#1E293B]">{child.proposed}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <div className={`relative transition-shadow rounded-md overflow-hidden border bg-white ${isActive ? "border-amber-400 ring-1 ring-amber-400" : "border-[#E2E8F0] group-hover:shadow-sm"}`}>
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#94A3B8] font-medium text-[13px]">
                                  $
                                </div>
                                <input
                                  type="text"
                                  defaultValue={child.allocated}
                                  className="w-[100px] xl:w-[120px] rounded-md border-0 py-2 pl-7 pr-3 text-[13px] font-semibold text-[#1E293B] ring-0 focus:outline-none"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end pr-4 gap-3 relative">
                              <span className={`font-semibold ${child.varianceColor}`}>
                                {child.variance}
                              </span>
                              {(child.hasThread || isActive) && (
                                <button className={`p-1.5 rounded-[4px] border ${isActive ? "border-[#2563EB]/20 bg-[#EEF2FF] text-[#2563EB]" : "border-transparent text-[#94A3B8] hover:bg-[#F1F5F9]"} transition-colors ml-1`}>
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-white text-[13px] text-[#64748B] font-medium">
              <div>Showing 1 to 5 of 12 entries</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 rounded-[6px] border-[#E2E8F0] px-3 font-medium hover:bg-[#F8FAFC]">Previous</Button>
                <Button variant="outline" className="h-8 rounded-[6px] border-[#E2E8F0] px-3 font-medium hover:bg-[#F8FAFC]">Next</Button>
              </div>
            </div>
          </div>
        </main>
        </div>
        {rightSidebar}
      </div>
    </div>
  )
}

export default function Page() {
  return <BudgetReviewContent />
}
