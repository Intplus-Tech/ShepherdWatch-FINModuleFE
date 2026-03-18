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
  Upload,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Info,
  Menu,
  X
} from "lucide-react"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-white antialiased text-[#111827] flex overflow-hidden" style={{ fontFamily: "'Public Sans', sans-serif" }}>
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
                <div className="text-[12px] font-bold text-[#2563EB] py-1.5 cursor-pointer">
                  Expense Tracking
                </div>
                <div className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] py-1.5 cursor-pointer transition-colors">
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-[24px] md:text-[32px] font-extrabold text-[#111827] uppercase tracking-tighter leading-none mb-2">EXPENSE TRACKING</h1>
              <p className="text-[13px] md:text-[14px] font-medium text-[#6B7280]">Monitor and verify all financial outflows for the branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-[44px] flex-1 lg:flex-none rounded-[10px] border-[#E5E7EB] bg-white px-5 text-[14px] font-bold text-[#111827] shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <Upload className="h-[18px] w-[18px] text-[#4B5563]" strokeWidth={2.5} /> Import
              </Button>
              <button className="h-[44px] w-[44px] shrink-0 rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
                <Printer className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Top Grid Area (Metrics & Trend) */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] mb-8">
            
            {/* 4 Main Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: TOTAL APPROVED */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">TOTAL APPROVED</div>
                <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+12%</div>
              </div>
              <div className="text-[26.67px] font-black text-[#111827] leading-[32px] tracking-normal">₦1.95M</div>
            </div>

            {/* Card 2: PAID OUT */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">PAID OUT</div>
                <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+5%</div>
              </div>
              <div className="text-[26.67px] font-black text-[#111827] leading-[32px] tracking-normal">₦1.48M</div>
            </div>

            {/* Card 3: PENDING APPROVAL */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">PENDING APPROVAL</div>
                <div className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">-2%</div>
              </div>
              <div className="text-[26.67px] font-black text-[#111827] leading-[32px] tracking-normal">₦240K</div>
            </div>

            {/* Card 4: VS TARGET */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">VS TARGET</div>
                <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-bold text-[#059669]">+8%</div>
              </div>
              <div className="text-[26.67px] font-black text-[#111827] leading-[32px] tracking-normal mb-2">81%</div>
              <div className="h-[6px] w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                <div className="h-full bg-[#2563EB]" style={{ width: '81%' }} />
              </div>
            </div>
            </div>
            
            {/* Card 5: TREND (Expanded) */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col h-full min-h-[140px] w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-bold tracking-widest text-[#6B7280]">TREND</div>
                <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                  <ChevronLeft className="h-[14px] w-[14px] cursor-pointer hover:text-[#4B5563]" strokeWidth={3} />
                  <ChevronRight className="h-[14px] w-[14px] cursor-pointer hover:text-[#4B5563]" strokeWidth={3} />
                </div>
              </div>
              <div className="flex items-end justify-between flex-1 gap-2">
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#DCE4F0] rounded-t-[2px]" style={{ height: '55px' }}></div>
                  <div className="text-[10px] font-bold text-[#9CA3AF] mt-1.5">20 Jan</div>
                </div>
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#DCE4F0] rounded-t-[2px]" style={{ height: '40px' }}></div>
                  <div className="text-[10px] font-bold text-[#9CA3AF] mt-1.5">21 Jan</div>
                </div>
                <div className="flex flex-col items-center flex-1 h-full justify-end w-full">
                  <div className="w-full bg-[#2563EB] rounded-t-[2px]" style={{ height: '70px' }}></div>
                  <div className="text-[10px] font-bold text-[#111827] mt-1.5">22 Jan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-8 border-b border-[#E5E7EB] mb-6 px-1">
            <button className="pb-3 border-b-[3px] border-[#2563EB] text-[14px] font-bold text-[#2563EB]">All Expense</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Operational</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Programs</button>
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Capital</button>
            
            <button className="pb-3 border-b-[3px] border-transparent text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-2">
              Unverified <span className="rounded-[6px] bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-600">₦25k</span>
            </button>
          </div>

          {/* Main Grid View - Reduced Width */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] w-full">
            {/* Data Table (Aligns with VS TARGET by spanning the 1fr section) */}
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">DATE</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">PAYMENT</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">BUDGET HEAD</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">AMOUNT</th>
                      <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">STATUS</th>
                      <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {/* Row 1 */}
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-5 text-[14px] font-semibold text-[#111827]">Jan 22, 2024</td>
                      <td className="px-5 py-5 text-[14px] font-extrabold text-[#111827]">Utility Bill</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center rounded-[6px] bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-bold text-[#4B5563]">Operational</span>
                      </td>
                      <td className="px-5 py-5 text-[15px] font-extrabold text-[#111827] tracking-tight">₦150,000</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex text-[11px] font-bold text-[#059669] uppercase tracking-widest">
                          APPROVED
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-[#3B5BDB] hover:text-[#2563EB] transition-colors"><Eye className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                        </div>
                      </td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-5 text-[14px] font-semibold text-[#111827]">Jan 21, 2024</td>
                      <td className="px-5 py-5 text-[14px] font-extrabold text-[#111827]">Salary Payment</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center rounded-[6px] bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-bold text-[#4B5563]">Operational</span>
                      </td>
                      <td className="px-5 py-5 text-[15px] font-extrabold text-[#111827] tracking-tight">₦25,000</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex text-[11px] font-bold text-[#F97316] uppercase tracking-widest">
                          PENDING
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-[#3B5BDB] hover:text-[#2563EB] transition-colors"><Eye className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                        </div>
                      </td>
                    </tr>
                    {/* Row 3 */}
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-5 text-[14px] font-semibold text-[#111827]">Jan 21, 2024</td>
                      <td className="px-5 py-5 text-[14px] font-extrabold text-[#111827]">Outreach Program</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[12px] font-bold text-[#2563EB]">Programs</span>
                      </td>
                      <td className="px-5 py-5 text-[15px] font-extrabold text-[#111827] tracking-tight">₦500,000</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex text-[11px] font-bold text-[#059669] uppercase tracking-widest">
                          APPROVED
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-[#3B5BDB] hover:text-[#2563EB] transition-colors"><Eye className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                        </div>
                      </td>
                    </tr>
                    {/* Row 4 */}
                    <tr className="hover:bg-[#F9FAFB] transition-colors border-b border-[#E5E7EB]">
                      <td className="px-6 py-5 text-[14px] font-semibold text-[#111827]">Jan 20, 2024</td>
                      <td className="px-5 py-5 text-[14px] font-extrabold text-[#111827]">Office Supply</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex items-center rounded-[6px] bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-bold text-[#4B5563]">Operational</span>
                      </td>
                      <td className="px-5 py-5 text-[15px] font-extrabold text-[#111827] tracking-tight">₦50,000</td>
                      <td className="px-5 py-5">
                        <span className="inline-flex text-[11px] font-bold text-[#059669] uppercase tracking-widest">
                          PAID
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-[#3B5BDB] hover:text-[#2563EB] transition-colors"><Eye className="h-[18px] w-[18px]" strokeWidth={2} /></button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between px-6 py-5 mt-auto">
                <div className="text-[13px] font-bold text-[#6B7280]">Showing 4 of 124 records</div>
                <div className="flex gap-2">
                  <button className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="h-[38px] w-[38px] rounded-[10px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
