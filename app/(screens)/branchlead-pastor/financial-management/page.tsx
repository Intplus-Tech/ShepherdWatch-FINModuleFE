"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  Search,
  ChevronDown,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  BarChart3,
  Settings,
  HelpCircle,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  Clock,
  FolderKanban
} from "lucide-react"

const historyData = [
  {
    date: "Jan 20, 2024",
    asset: "Toyota Coaster Bus (LAG-123)",
    service: "Engine Service & Oil Change",
    technician: "Ikeja Auto Care",
    cost: "45,000.00",
    status: "Verified",
  },
  {
    date: "Jan 16, 2024",
    asset: "Sanctuary Sound Mixer",
    service: "Fader Replacement (Repair)",
    technician: "Tunde Electronics",
    cost: "15,000.00",
    status: "Verified",
  },
  {
    date: "Jan 12, 2024",
    asset: "Borehole Pump",
    service: "Seal & Gasket Replacement",
    technician: "Grace Chapel FM Team",
    cost: "8,500.00",
    status: "Verified",
  },
  {
    date: "Jan 05, 2024",
    asset: "Children's Church AC (x3)",
    service: "Quarterly Gas Refill",
    technician: "Cool-Way Services",
    cost: "32,000.00",
    status: "Verified",
  },
]

export default function MaintenanceManagementPage() {
  return (
    <div 
      className="min-h-screen bg-[#F4F6F9] text-sm flex overflow-hidden lg:flex-row flex-col"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[#EEF1F6] bg-[#FAFAFC] flex-col justify-between hidden lg:flex flex-shrink-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#EEF2FF] p-1.5 rounded-lg flex items-center justify-center">
              <Image src="/images/icon-shepherdwatch.svg" alt="Logo" width={22} height={22} className="brightness-100" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
              <div className="text-[11px] text-[#3B5BDB] font-bold mt-1 tracking-wide">Lead Pastor&apos;s View</div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Maintenance Management", icon: FolderKanban, hasDropdown: true },
              { label: "Assets", icon: Wallet, active: true },
              { label: "Budget", icon: ShieldCheck },
              { label: "Compliance & Remittance", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-bold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#475569] hover:bg-gray-100 hover:text-[#111827]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="h-[18px] w-[18px] stroke-[2]" />
                    {item.label}
                  </div>
                  {item.hasDropdown && <ChevronDown className="h-4 w-4 stroke-[2]" />}
                </div>
              )
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#EEF1F6]">
          <div className="space-y-1.5 mb-6">
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-100 cursor-pointer transition-colors">
              <Settings className="h-[18px] w-[18px] stroke-[2]" />
              Settings
            </div>
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-100 cursor-pointer transition-colors">
              <HelpCircle className="h-[18px] w-[18px] stroke-[2]" />
              Help Center
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3.5 pt-2">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shrink-0 shadow-sm">
              <img src="/images/Beared%20Guy02-min%201.jpg" alt="Alex Morgan" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-[#111827]">Alex Morgan</div>
              <div className="text-[11px] text-[#94A3B8] font-bold mt-0.5 tracking-wide">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-[#F4F6F9]">
        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between gap-4 border-b border-[#EEF1F6] z-10 w-full relative">
          <div className="text-[17px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0 tracking-tight">
            <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            <div className="relative flex-1 sm:flex-none sm:w-[320px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] stroke-[2.5]" />
              <Input 
                placeholder="Search requisitions..." 
                className="pl-9 h-10 w-full bg-[#FAFAFC] border-transparent focus:border-[#EEF1F6] shadow-sm rounded-[8px] text-[13px] focus-visible:ring-1 focus-visible:ring-[#3B5BDB] placeholder:text-[#94A3B8] placeholder:font-bold"
              />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[8px] bg-white border border-transparent shadow-sm flex items-center justify-center text-[#94A3B8] hover:text-[#111827] cursor-pointer transition-colors relative">
              <Bell className="h-[22px] w-[22px] stroke-[2]" />
              <div className="absolute top-2.5 right-2 w-[8px] h-[8px] bg-[#EF4444] rounded-full border-[1.5px] border-white" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 lg:p-10 max-w-[1440px] mx-auto w-full">
            
            {/* Header Titles */}
            <div className="mb-8">
              <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors mb-5 w-fit">
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                Back
              </button>
              <h1 className="text-[32px] sm:text-[36px] font-extrabold text-[#111827] tracking-tight leading-none mb-2.5" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>Maintenance Management Hub</h1>
              <p className="text-[14.5px] text-[#64748B] font-bold">Oversee asset upkeep and service schedules for the sanctuary and grounds.</p>
            </div>

            {/* Top Multi-Panel Layout */}
            <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 mb-10 w-full">
              
              {/* Left Column: Urgent Alerts */}
              <div className="w-full xl:w-[360px] 2xl:w-[400px] shrink-0 flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="text-[#EF4444] h-[22px] w-[22px] stroke-[2.5]" />
                  <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">Urgent Alerts</h2>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Card 1 */}
                  <div className="bg-white rounded-[16px] p-6 shadow-sm border-2 border-red-100 hover:border-red-200 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-red-50 text-[#DC2626] text-[10.5px] font-extrabold uppercase px-2.5 py-1 rounded-[6px] tracking-widest border border-red-100">OVERDUE</span>
                      <span className="text-[#EF4444] font-extrabold text-[12px]">7 Days</span>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-[#111827] mb-2 tracking-tight">Diesel Generator 500kVA</h3>
                    <p className="text-[#64748B] text-[13px] font-medium leading-relaxed mb-6">Oil & Filter change required for sanctuary backup power.</p>
                    <button className="w-full bg-red-50 hover:bg-red-100 transition-colors text-[#DC2626] font-extrabold text-[13.5px] py-3 rounded-[10px] border border-red-100/50">
                      Action Required
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-[16px] p-6 shadow-sm border-2 border-red-100 hover:border-red-200 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-red-50 text-[#DC2626] text-[10.5px] font-extrabold uppercase px-2.5 py-1 rounded-[6px] tracking-widest border border-red-100">CRITICAL</span>
                      <span className="text-[#EF4444] font-extrabold text-[12px]">23 Days</span>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-[#111827] mb-2 tracking-tight">Fire Extinguishers (Hall A)</h3>
                    <p className="text-[#64748B] text-[13px] font-medium leading-relaxed mb-6">Annual safety inspection and refilling overdue.</p>
                    <button className="w-full bg-red-50 hover:bg-red-100 transition-colors text-[#DC2626] font-extrabold text-[13.5px] py-3 rounded-[10px] border border-red-100/50">
                      Action Required
                    </button>
                  </div>

                  {/* Tip Card */}
                  <div className="bg-[#EFF6FF] rounded-[16px] p-6 border border-[#DBEAFE]/80 shadow-sm mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="text-[#3B5BDB] h-[18px] w-[18px] stroke-[2.5]" />
                      <h4 className="text-[#3B5BDB] font-extrabold text-[14px]">Maintenance Tip</h4>
                    </div>
                    <p className="text-[#1E40AF] text-[13px] italic leading-relaxed font-medium pr-2">
                      Proactive maintenance on cooling systems can reduce energy costs by up to 15% during peak usage months.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Schedule Calendar */}
              <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0px_2px_16px_rgba(0,0,0,0.03)] border border-[#EEF1F6] flex flex-col overflow-hidden relative">
                
                {/* Legend Header Overlay */}
                <div className="absolute top-7 right-8 hidden sm:flex items-center gap-4 text-[12px] font-bold text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                    Overdue
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3B5BDB]"></div>
                    Scheduled
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                    Completed
                  </div>
                </div>

                <div className="p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-[#EEF1F6]">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="text-[#3B5BDB] h-[24px] w-[24px] stroke-[2]" />
                    <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">January 2024 Schedule</h2>
                  </div>
                  <div className="flex items-center border border-[#E2E8F0] rounded-[10px] bg-white shadow-sm overflow-hidden text-[13px] font-extrabold text-[#111827]">
                    <button className="px-3.5 py-2.5 hover:bg-gray-50 text-[#94A3B8] hover:text-[#111827] transition-colors border-r border-[#E2E8F0]">
                      <ChevronLeft className="h-[18px] w-[18px] stroke-[2.5]" />
                    </button>
                    <span className="px-5 py-2.5 tracking-tight">Week 3 (Jan 15 - Jan 21)</span>
                    <button className="px-3.5 py-2.5 hover:bg-gray-50 text-[#94A3B8] hover:text-[#111827] transition-colors border-l border-[#E2E8F0]">
                      <ChevronRight className="h-[18px] w-[18px] stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="flex-1 p-8 overflow-x-auto">
                  <div className="flex gap-4 min-w-[750px] h-full items-stretch">
                    
                    {/* MON 15 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">MON 15</span>
                      </div>
                      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 text-left">
                        <div className="text-[12.5px] font-extrabold text-[#2563EB] mb-1">Sound Console</div>
                        <div className="text-[11px] font-bold text-[#60A5FA]">Firmware Update</div>
                      </div>
                    </div>

                    {/* TUE 16 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">TUE 16</span>
                      </div>
                    </div>

                    {/* WED 17 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">WED 17</span>
                      </div>
                      <div className="bg-[#2563EB] rounded-[10px] p-3 text-left shadow-sm">
                        <div className="text-[12.5px] font-extrabold text-white mb-1">HVAC Unit B</div>
                        <div className="text-[11px] font-medium text-blue-100 tracking-wide">Routine Cleaning</div>
                      </div>
                    </div>

                    {/* THU 18 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">THU 18</span>
                      </div>
                      <div className="bg-white border-2 border-[#E2E8F0] rounded-[10px] p-3 text-left">
                        <div className="text-[12.5px] font-extrabold text-[#475569] mb-1">Projector Bulb</div>
                        <div className="text-[11px] font-bold text-[#94A3B8]">Scheduled Replace</div>
                      </div>
                    </div>

                    {/* FRI 19 (TODAY) - Highlighted Column */}
                    <div className="flex-1 flex flex-col bg-[#EEF2FF] rounded-[12px] p-2 -my-2 -mx-2 border-2 border-[#A5B4FC]">
                      <div className="text-center mb-4 border-b border-[#C7D2FE] pb-2 mt-2">
                        <span className="text-[11.5px] font-extrabold text-[#3B5BDB] tracking-widest uppercase">FRI 19 (TODAY)</span>
                      </div>
                      <div className="bg-[#1D4ED8] rounded-[10px] p-3 text-left shadow-sm">
                        <div className="text-[12.5px] font-extrabold text-white mb-1">Piano Tuning</div>
                        <div className="text-[11px] font-medium text-blue-100 tracking-wide mb-3">Pre-Service Check</div>
                        <div className="text-[10px] font-extrabold text-blue-100 flex items-center gap-1.5 opacity-90">
                          <Clock className="w-3.5 h-3.5" />
                          14:00
                        </div>
                      </div>
                    </div>

                    {/* SAT 20 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">SAT 20</span>
                      </div>
                      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] p-3 text-left">
                        <div className="text-[12.5px] font-extrabold text-[#C2410C] mb-1">Landscape Prep</div>
                        <div className="text-[11px] font-bold text-[#FDBA74]">Post-Rain Clearing</div>
                      </div>
                    </div>

                    {/* SUN 21 */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-center mb-5 border-b border-[#EEF1F6] pb-3">
                        <span className="text-[11.5px] font-extrabold text-[#94A3B8] tracking-widest uppercase">SUN 21</span>
                      </div>
                      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[10px] p-3 text-left">
                        <div className="text-[12.5px] font-extrabold text-[#15803D] mb-1">Audio System</div>
                        <div className="text-[11px] font-bold text-[#86EFAC]">Sunday Soundcheck</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Completed Maintenance Table */}
            <div className="bg-white rounded-[24px] shadow-[0px_2px_16px_rgba(0,0,0,0.02)] border border-[#EEF1F6] overflow-hidden">
              <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-[#10B981] h-[24px] w-[24px] stroke-[2.5]" />
                  <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">Completed Maintenance (Jan 5 - 20)</h2>
                </div>
                <button className="text-[13px] font-extrabold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors tracking-tight">
                  View All History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px] min-w-[950px] border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#F1F5F9]">
                      <th className="py-5 px-8 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Date</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Asset</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Service Type</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Technician / Provider</th>
                      <th className="py-5 px-4 text-right text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Cost (NGN)</th>
                      <th className="py-5 px-8 text-center text-[11px] font-extrabold text-[#475569] tracking-widest uppercase align-middle">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((row, i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC]/60 transition-colors bg-[#FFFFFF]">
                        <td className="py-5 px-8 align-middle">
                          <span className="font-bold text-[#64748B] text-[13.5px]">{row.date}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-extrabold text-[#111827] text-[13.5px]">{row.asset}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-bold text-[#64748B] text-[13.5px]">{row.service}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className="font-extrabold text-[#3B5BDB] text-[13.5px] hover:underline cursor-pointer">{row.technician}</span>
                        </td>
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="font-extrabold text-[#111827] text-[14px]">{row.cost}</span>
                        </td>
                        <td className="py-5 px-8 align-middle text-center">
                          <span className="inline-block bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] font-extrabold text-[10.5px] tracking-wide px-3.5 py-1.5 rounded-full">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Footer */}
                  <tfoot>
                    <tr className="bg-white border-t-2 border-[#EEF1F6]">
                      <td colSpan={4} className="py-7 px-4 align-middle text-right">
                        <span className="font-extrabold text-[#111827] text-[14px] tracking-tight">Total Maintenance Cost:</span>
                      </td>
                      <td className="py-7 px-4 align-middle text-right">
                        <span className="font-extrabold text-[#3B5BDB] text-[16px] tracking-tight">₦ 100,500.00</span>
                      </td>
                      <td className="py-7 px-8"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="h-12 w-full"></div> {/* Bottom scroll padding */}
          </div>
        </div>
      </main>
    </div>
  )
}
