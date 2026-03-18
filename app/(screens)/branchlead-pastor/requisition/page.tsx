"use client"
import { useState } from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Printer,
  ShieldCheck,
  TrendingUp,
  Upload,
  Wallet,
  CheckCircle2,
  MinusCircle,
  FileText,
  Pencil,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  Menu,
  X,
  AlertCircle,
  MoreVertical,
  LockKeyhole
} from "lucide-react"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#F9FAFB] font-sans antialiased text-[#111827] flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#EEF1F6] flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-6">
          <div className="flex items-center justify-between gap-3 pb-8">
            <div className="flex items-center gap-3">
              <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={28} height={28} />
              <div>
                <div className="text-[14px] font-bold text-[#111827] tracking-tight">ShepherdWatch</div>
                <div className="text-[11px] font-semibold text-[#6B7280]">Lead Pastor View</div>
              </div>
            </div>
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {/* Dashboard */}
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={2} />
              Dashboard
            </div>

            {/* Financial Management (Expanded Dropdown) */}
            <div className="rounded-[12px] bg-[#EFF6FF] p-2">
              <div className="flex items-center justify-between px-2 py-1.5 mb-2 cursor-pointer">
                <div className="flex items-center gap-3 text-[13px] text-[#2563EB] font-bold">
                  <Wallet className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  Financial Management
                </div>
                <ChevronDown className="h-4 w-4 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col space-y-1 border-l-2 border-[#DDE7EE] ml-[22px] pl-3 py-1">
                <div className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] py-1.5 cursor-pointer transition-colors">
                  Income Tracking
                </div>
                <div className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] py-1.5 cursor-pointer transition-colors">
                  Expense Tracking
                </div>
                <div className="text-[12px] font-bold text-[#2563EB] py-1.5 cursor-pointer">
                  Requisition
                </div>
              </div>
            </div>

            {/* Other Menu Items */}
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors mt-2">
              <Wallet className="h-[18px] w-[18px]" strokeWidth={2} />
              Assets
            </div>
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} />
              Budget
            </div>
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[13px] text-[#6B7280] font-semibold hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2} />
              Compliance & Remittance
            </div>
          </nav>
        </div>

        <div className="mt-auto px-5 pb-6">
          <div className="space-y-1.5 pt-6 border-t border-[#EEF1F6] text-[13px] font-semibold text-[#6B7280]">
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <ShieldCheck className="h-[18px] w-[18px]" />
              Settings
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] hover:bg-[#F9FAFB] hover:text-[#111827] cursor-pointer transition-colors">
              <Info className="h-[18px] w-[18px]" />
              Help Center
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 pt-6 border-t border-[#EEF1F6]">
            <div className="h-10 w-10 rounded-full border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] shrink-0">
              <Image src="/images/login%20page%20picture.jpg" alt="Alex" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#111827] truncate">Alex Morgan</div>
              <div className="text-[11px] font-medium text-[#6B7280] truncate">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-w-0">
        {/* Top Navigation Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-[17px] font-extrabold text-[#111827] tracking-tight">Dashboard</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[260px] rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] pl-[34px] pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF] focus:border-[#2563EB] transition-all"
              />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -top-0.5 right-0 flex h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Area */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
          {/* Top Header */}
          <div className="mb-8">
            <h1 className="text-[24px] md:text-[32px] font-black text-[#111827] uppercase tracking-tighter leading-[32px] mb-2">REQUISITION</h1>
            <p className="text-[13px] font-medium text-[#6B7280]">Manage all requisitions approval.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
            {/* Left Column Area */}
            <div className="flex flex-col gap-8 w-full min-w-0">
              {/* Approval Inbox Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="text-rose-500">
                    <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Approval Inbox <span className="text-[#6B7280] font-semibold">(Priority)</span></h2>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-500 uppercase tracking-widest">
                  ACTION REQUIRED
                </div>
              </div>

              {/* Priority Cards */}
              <div className="flex flex-col gap-6">
                {/* Card 1: Critical Over Budget */}
                <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col md:flex-row overflow-hidden border-l-[4px] border-l-rose-500">
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[11px] font-extrabold tracking-widest text-rose-500 uppercase">CRITICAL - OVER-BUDGET</div>
                      <div className="text-[12px] font-semibold text-[#9CA3AF]">Requested: Today, 09:42 AM</div>
                    </div>
                    <h3 className="text-[22px] font-black text-[#111827] tracking-tight leading-tight mb-3">#REQ-2301 Audio Upgrade</h3>
                    <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-[90%] mb-8">
                      The proposed equipment list for the main hall exceeds the Q1 Capital allocation by $1,200.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">REQUEST AMOUNT</div>
                        <div className="text-[18px] font-extrabold text-[#111827]">₦1,150,000</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">CATEGORY</div>
                        <div className="text-[14px] font-bold text-[#111827]">Capital Expenditure</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <button className="h-[44px] rounded-[8px] bg-[#2563EB] px-6 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4" /> Review & Approve
                      </button>
                      <button className="text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                  {/* Right side image chunk */}
                  <div className="w-full md:w-[220px] md:h-auto h-[200px] shrink-0 p-5 pl-0 hidden md:block">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-black">
                      <Image src="/images/login%20page%20picture.jpg" alt="Audio Mixer" fill className="object-cover opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Urgent Over Budget */}
                <div className="rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col md:flex-row overflow-hidden border-l-[4px] border-l-orange-500">
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[11px] font-extrabold tracking-widest text-orange-500 uppercase">URGENT - OVER-BUDGET</div>
                      <div className="text-[12px] font-semibold text-[#9CA3AF]">Requested: Yesterday, 04:15 PM</div>
                    </div>
                    <h3 className="text-[22px] font-black text-[#111827] tracking-tight leading-tight mb-3">#REQ-2302 Emergency Repairs</h3>
                    <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-[90%] mb-8">
                      Leaking roof in the youth center requires immediate professional repair. Exceeds Maintenance budget by $300.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">REQUEST AMOUNT</div>
                        <div className="text-[18px] font-extrabold text-[#111827]">₦3,150,000</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">CATEGORY</div>
                        <div className="text-[14px] font-bold text-[#111827]">Maintenance</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <button className="h-[44px] rounded-[8px] bg-[#2563EB] px-6 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors flex items-center gap-2">
                        <LockKeyhole className="h-4 w-4" /> Review & Approve
                      </button>
                      <button className="text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                  {/* Right side image chunk */}
                  <div className="w-full md:w-[220px] md:h-auto h-[200px] shrink-0 p-5 pl-0 hidden md:block">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-gray-200">
                      <Image src="/images/login%20page%20picture.jpg" alt="Maintenance" fill className="object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Requisitions Data Table */}
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Pending Requisitions</h2>
                  <button className="text-[13px] font-bold text-[#2563EB] hover:underline">View All (12)</button>
                </div>
                
                <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">ID & DESCRIPTION</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">CATEGORY</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">AMOUNT</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">STATUS</th>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {/* Row 1 */}
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-black text-[#111827]">#REQ-2303 Weekly Cleaning Supplies</div>
                            <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by Admin Dept.</div>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">Operational</td>
                          <td className="px-5 py-4 text-[15px] font-black text-[#111827]">₦250.00</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                              IN REVIEW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-black text-[#111827]">#REQ-2304 Sunday Bulletin Print</div>
                            <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by Media Dept.</div>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">Programs</td>
                          <td className="px-5 py-4 text-[15px] font-black text-[#111827]">₦185.00</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                              IN REVIEW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {/* Row 3 */}
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-black text-[#111827]">#REQ-2305 Guest Speaker Honorarium</div>
                            <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by Pastoral</div>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">Programs</td>
                          <td className="px-5 py-4 text-[15px] font-black text-[#111827]">₦500.00</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                              IN REVIEW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {/* Row 4 */}
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-black text-[#111827]">#REQ-2306 Utility Bill - Water</div>
                            <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by Facility</div>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">Operational</td>
                          <td className="px-5 py-4 text-[15px] font-black text-[#111827]">₦120.00</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                              IN REVIEW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {/* Row 5 */}
                        <tr className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-[14px] font-black text-[#111827]">#REQ-2307 Stationery & Ink</div>
                            <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by Admin Dept.</div>
                          </td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">Operational</td>
                          <td className="px-5 py-4 text-[15px] font-black text-[#111827]">₦85.00</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                              IN REVIEW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Area (340px) */}
            <div className="flex flex-col gap-6">
              
              {/* Expense Distribution */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-8">Expense Distribution</h3>
                
                {/* Visual Chart Area (SVG Rounded Donut) */}
                <div className="relative flex justify-center items-center mb-10 w-full py-4">
                  
                  <svg className="transform -rotate-90 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]" viewBox="0 0 100 100">
                    {/* Green (Capital 7%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#22C55E" strokeWidth="14" strokeLinecap="round" strokeDasharray="12 250" strokeDashoffset="0" className="drop-shadow-sm" />
                    {/* Orange (Operational 76%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="14" strokeLinecap="round" strokeDasharray="172 250" strokeDashoffset="-18" className="drop-shadow-sm" />
                    {/* Blue (Programs 18%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#0EA5E9" strokeWidth="14" strokeLinecap="round" strokeDasharray="36 250" strokeDashoffset="-196" className="drop-shadow-sm" />
                  </svg>

                  {/* Floating Labels */}
                  <div className="absolute top-0 right-0 sm:right-4 xl:right-0 2xl:right-4 flex flex-col items-center">
                     <span className="text-[11px] font-black text-[#F97316] mb-0.5">76%</span>
                     <span className="text-[9px] font-bold text-[#6B7280]">Operational</span>
                  </div>
                  
                  <div className="absolute bottom-0 right-2 sm:right-6 xl:right-2 2xl:right-6 flex flex-col items-center">
                     <span className="text-[11px] font-black text-[#0EA5E9] mb-0.5">18%</span>
                     <span className="text-[9px] font-bold text-[#6B7280]">Programs</span>
                  </div>

                  <div className="absolute top-6 left-0 sm:left-4 xl:left-0 2xl:left-4 flex flex-col items-center">
                     <span className="text-[11px] font-black text-[#22C55E] mb-0.5">7%</span>
                     <span className="text-[9px] font-bold text-[#6B7280]">Capital</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div> Operational
                    </div>
                    <div className="text-[13px] font-bold text-[#6B7280]">76%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                      <div className="h-2 w-2 rounded-full bg-sky-400"></div> Programs
                    </div>
                    <div className="text-[13px] font-bold text-[#6B7280]">18%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div> Capital
                    </div>
                    <div className="text-[13px] font-bold text-[#6B7280]">7%</div>
                  </div>
                </div>
              </div>

              {/* Critical Budget Alerts */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Critical Budget Alerts</h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Transport</div>
                      <div className="text-[11px] font-bold text-rose-500">92% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Utilities</div>
                      <div className="text-[11px] font-bold text-orange-500">86% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-[12px] font-extrabold text-[#111827]">Maintenance</div>
                      <div className="text-[11px] font-bold text-orange-500">85% exhausted</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col h-fit">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Recent Activity (Jan 18-22)</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#F3F4F6]">
                  {/* Item 1 */}
                  <div className="relative flex gap-4">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center z-10 border-2 border-white">
                      <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-[13px] font-extrabold text-[#111827]">#REQ-2306 Paid</div>
                      <div className="text-[12px] font-semibold text-[#6B7280]">Generator Fuel - ₦150,000.00</div>
                      <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">Jan 22, 09AM</div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative flex gap-4">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center z-10 border-2 border-white">
                      <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-[13px] font-extrabold text-[#111827]">#REQ-2295 Approved</div>
                      <div className="text-[12px] font-semibold text-[#6B7280]">Sunday Service Decor - ₦75,000.00</div>
                      <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">Jan 20, 04PM</div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="relative flex gap-4">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center z-10 border-2 border-white">
                      <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-[13px] font-extrabold text-[#111827]">#REQ-2280 Paid</div>
                      <div className="text-[12px] font-semibold text-[#6B7280]">Guest Week Honorarium - ₦2,000,000</div>
                      <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">Jan 18, 10AM</div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="mt-8 w-full h-[44px] rounded-[10px] border-[#E5E7EB] text-[13px] font-bold text-[#111827] shadow-sm hover:bg-gray-50 flex items-center justify-center">
                  Full Transaction Log
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
