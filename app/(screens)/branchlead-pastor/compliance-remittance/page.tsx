"use client"

import React from "react"
import Image from "next/image"
import { 
  Search, Bell, LayoutDashboard, BarChart3, Building2, Wallet, 
  ShieldCheck, ChevronRight, Settings, HelpCircle, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Calculator, Info, Menu, X 
} from "lucide-react"

const rows = [
  { requirement: "HQ Tithe", rate: "10.0%", dueDate: "Jan 25, 2024", amount: "₦150,000", status: "DUE SOON", statusColor: "text-amber-600 bg-amber-50 ring-amber-500/20" },
  { requirement: "General Savings", rate: "1.0%", dueDate: "Jan 28, 2024", amount: "₦15,000", status: "DUE SOON", statusColor: "text-amber-600 bg-amber-50 ring-amber-500/20" },
  { requirement: "Capital Savings", rate: "20.0%", dueDate: "Jan 28, 2024", amount: "₦110,000", status: "PENDING", statusColor: "text-gray-600 bg-gray-50/80 ring-gray-400/20" },
  { requirement: "Pension Contrib.", rate: "Fixed", dueDate: "Jan 30, 2024", amount: "₦42,500", status: "PENDING", statusColor: "text-gray-600 bg-gray-50/80 ring-gray-400/20" },
]

export default function ComplianceRemittancePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex flex-col xl:flex-row min-h-screen overflow-hidden bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: '"Public Sans", sans-serif' }}>
      
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
              { label: "Budget", icon: Wallet },
              { label: "Compliance & Remittance", icon: ShieldCheck, active: true },
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
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm">
                <img src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar" className="h-full w-full object-cover" />
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
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        
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
        <main className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 pt-1 pb-4 sm:px-6 sm:pt-2 sm:pb-6 xl:px-8 xl:pt-3 xl:pb-8">
          
          {/* Header Title Row */}
          <div className="mb-6 sm:mb-8">
            <h1 
              className="text-[#111827]"
              style={{
                fontFamily: '"Public Sans", sans-serif',
                fontWeight: 900,
                fontSize: "26.95px",
                lineHeight: "33.69px",
                letterSpacing: "-0.67px",
                verticalAlign: "middle"
              }}
            >
              STATUTORY COMPLIANCE
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#6B7280] mt-2 font-medium">
              Manage your monthly obligations and branch financial health for <span className="font-bold text-[#111827]">January 2024</span>
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5 mb-6 sm:mb-8">
            {/* Liability Card */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">TOTAL JANUARY LIABILITY</div>
              <div className="mt-3 text-[24px] font-bold text-[#111827]">₦317,500</div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />
                +2.3% from last month
              </div>
            </div>

            {/* Funds Card */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">AVAILABLE FUNDS</div>
              <div className="mt-3 text-[24px] font-bold text-[#111827]">₦4.25M</div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-500">
                <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />
                -1.2% operating expenses
              </div>
            </div>

            {/* Coverage Card */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:col-span-2 lg:col-span-1">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">COVERAGE RATIO</div>
              <div className="mt-3 text-[24px] font-bold text-[#111827]">13.4x</div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                Healthy liquidity status
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Left Column: Table */}
            <div className="flex-1 w-full bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col items-center">
              <div className="w-full flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8F0] gap-4">
                <h2 className="text-[13px] sm:text-[14px] font-bold text-[#111827]">Remittance Schedule</h2>
                <span className="text-[10px] sm:text-[11.5px] font-semibold text-[#3B5BDB] whitespace-nowrap">Next Due: Jan 25, 2024</span>
              </div>
              
              <div className="w-full overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px] text-[13px]">
                  <thead className="bg-[#FBFCFD] text-[#64748B] font-bold text-[10px] uppercase tracking-wider border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-6 py-4">REQUIREMENT</th>
                      <th className="px-6 py-4 text-center">RATE</th>
                      <th className="px-6 py-4">DUE DATE</th>
                      <th className="px-6 py-4 text-right">AMOUNT</th>
                      <th className="px-6 py-4 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] font-semibold text-[#111827]">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4.5">{row.requirement}</td>
                        <td className="px-6 py-4.5 text-[#3B5BDB] text-center font-bold tracking-wide">{row.rate}</td>
                        <td className="px-6 py-4.5 text-[#475569] font-medium">{row.dueDate}</td>
                        <td className="px-6 py-4.5 text-right">{row.amount}</td>
                        <td className="px-6 py-4.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full flex justify-between sm:justify-end p-4 sm:p-5 tracking-wide items-center relative overflow-hidden bg-[#FAFBFF]">
                {/* Subtle gradient matching the top border */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2E8F0] to-[#E2E8F0]"></div>
                <span className="text-[10px] sm:text-[11px] font-black text-[#64748B] tracking-[0.1em] sm:mr-8">TOTAL PAYABLE</span>
                <span className="text-[15px] sm:text-[16px] font-black text-[#2563EB] sm:mr-4">₦317,500</span>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full xl:w-[340px] flex flex-col gap-5 shrink-0">
               
               {/* Calculator Tool */}
               <div className="bg-[#1D4ED8] rounded-[16px] p-6 text-white shadow-lg relative overflow-hidden">
                 
                 {/* Top header */}
                 <div className="flex items-center gap-2.5 mb-6 relative z-10">
                   <Calculator className="h-5 w-5 text-white stroke-[2]" />
                   <h3 className="text-[15px] font-bold tracking-tight">Calculator Tool</h3>
                 </div>

                 {/* Input Simulation Area */}
                 <div className="relative z-10 mb-6">
                   <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2">
                     BRANCH TOTAL INCOME (JAN)
                   </label>
                   <div className="bg-[#1E40AF] border border-[#2563EB]/50 rounded-[10px] py-3.5 px-4 font-bold text-[15px] shadow-inner text-white flex items-center justify-between">
                     ₦1,500,000
                   </div>
                 </div>

                 {/* Breakdown List */}
                 <div className="relative z-10 border-t border-[#3B82F6]/50 pt-5">
                   <h4 className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-4">BREAKDOWN</h4>
                   
                   <div className="space-y-4 text-[12px] font-medium text-blue-50">
                     <div className="flex justify-between items-center">
                       <span>HQ Tithe (10%)</span>
                       <span className="font-bold text-white">₦150,000</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Gen. Savings (1%)</span>
                       <span className="font-bold text-white">₦15,000</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Capital Savings (20%)</span>
                       <span className="font-bold text-white">₦300,000</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span>Welfare Fund (5%)</span>
                       <span className="font-bold text-white">₦75,000</span>
                     </div>
                   </div>
                 </div>

                 {/* Total Remittance */}
                 <div className="relative z-10 mt-6 pt-5 border-t border-white/20 flex justify-between items-center">
                   <span className="text-[13px] font-semibold text-blue-100">Total Remittance</span>
                   <span className="text-[18px] font-black text-white tracking-tight">₦540,000</span>
                 </div>
                 
                 {/* Decorative Background Elements */}
                 <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-[30px]" />
                 <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-400/10 rounded-full blur-[24px]" />
               </div>
               
               {/* Policy Reminder */}
               <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
                 <div className="flex items-center gap-2.5 mb-3 text-[#3B5BDB]">
                   <Info className="h-4.5 w-4.5 stroke-[2.5]" />
                   <h4 className="text-[13px] font-bold text-[#111827]">Policy Reminder</h4>
                 </div>
                 <p className="text-[12px] text-[#4B5563] leading-relaxed mb-4 font-medium">
                   All HQ Remittances must be cleared before the Last Sunday of the current month (to maintain branch compliance standing).
                 </p>
                 <button className="text-[12px] font-bold text-[#2563EB] hover:text-blue-800 transition-colors flex items-center gap-1">
                   View Compliance Guidelines
                   <ArrowRight className="h-3 w-3" />
                 </button>
               </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}
