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
  FolderKanban,
  Settings,
  HelpCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Menu
} from "lucide-react"

const assets = [
  {
    name: "Church Sound System (Array)",
    category: "Electronics",
    date: "Oct 12, 2022",
    value: "N4,200,000",
    condition: "EXCELLENT",
    statusColor: "text-emerald-600 bg-emerald-50",
  },
  {
    name: "Industrial Generator 250KVA",
    category: "Power Plant",
    date: "Jan 05, 2021",
    value: "N12,500,000",
    condition: "SERVICE REQ.",
    statusColor: "text-amber-600 bg-amber-50",
  },
]

export default function Page() {
  return (
    <div 
      className="min-h-screen bg-[#F7F9FC] text-sm"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-65 border-r border-[#EEF1F6] bg-white flex-col justify-between hidden lg:flex shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-[#EEF2FF] p-1.5 rounded-lg flex items-center justify-center">
                <Image src="/images/icon-shepherdwatch.svg" alt="Logo" width={22} height={22} className="brightness-100" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-[#111827] leading-none tracking-tight">ShepherdWatch</div>
                <div className="text-[11px] text-[#9CA3AF] font-medium mt-1">Lead Pastor View</div>
              </div>
            </div>

            <nav className="space-y-1.5">
              {[
                { label: "Dashboard", icon: LayoutDashboard },
                { label: "Financial Management", icon: FolderKanban, hasDropdown: true },
                { label: "Assets", icon: Wallet, active: true },
                { label: "Budget", icon: ShieldCheck },
                { label: "Operational Performance", icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-[10px] px-3.5 py-3 text-[13px] font-semibold cursor-pointer transition-colors ${
                      item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#6B7280] hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </div>
                    {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </div>
                )
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-[#EEF1F6]">
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 text-[13px] font-semibold text-[#6B7280] hover:bg-gray-50 cursor-pointer">
                <Settings className="h-4.5 w-4.5" />
                Settings
              </div>
              <div className="flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 text-[13px] font-semibold text-[#6B7280] hover:bg-gray-50 cursor-pointer">
                <HelpCircle className="h-4.5 w-4.5" />
                Help Center
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-3.5">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white">
                <img src="/images/Beared%20Guy02-min%201.jpg" alt="Profile avatar for Ava Morgan, Lead Pastor. Bearded man with a calm and professional demeanor against a neutral background." className="h-full w-full object-cover" />
                </div>
              <div>
                <div className="text-[14px] font-bold text-[#111827]">Ava Morgan</div>
                <div className="text-[12px] text-[#9CA3AF] font-medium">Lead Pastor</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full relative max-w-[100vw]">
          {/* Top Header */}
          <header className="sticky top-0 z-10 bg-[#F7F9FC]/90 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="text-[16px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0">
              <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <span className="hidden sm:inline-block">Dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
              <div className="relative flex-1 sm:flex-none sm:w-[300px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search algorithms..." 
                  className="pl-9 h-10 w-full bg-white border-transparent focus:border-gray-200 rounded-[10px] text-[13px] shadow-sm focus-visible:ring-[#3B5BDB]"
                />
              </div>
              <div className="h-10 w-10 shrink-0 rounded-[10px] bg-white border border-transparent flex items-center justify-center text-gray-500 shadow-sm cursor-pointer hover:bg-gray-50">
                <Bell className="h-5 w-5" />
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-8 pb-10 max-w-350 mx-auto space-y-6">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 mb-6 sm:mb-8">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] tracking-tight leading-none uppercase">ASSET MANAGEMENT</h1>
                <p className="text-[14px] text-gray-500 mt-2 font-medium">Here&apos;s your branch asset overview 2024</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button className="w-full sm:w-auto bg-[#3B5BDB] hover:bg-[#2e4ac0] text-white px-6 h-11 rounded-[10px] font-bold shadow-sm text-[13px]">
                  Asset Register
                </Button>
                <Button className="w-full sm:w-auto bg-[#FF4646] hover:bg-[#e63e3e] text-white px-6 h-11 rounded-[10px] font-bold shadow-sm text-[13px]">
                  Maintenance Schedule
                </Button>
              </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1fr] gap-6">
              {/* Asset Valuation Card */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[#EEF1F6] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[12px] font-bold text-gray-400 tracking-wider">ASSET VALUATION</h3>
                  <div className="text-emerald-500 text-[12px] font-bold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-[14px]" />
                    +4.8%
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-[12px] text-gray-400 font-semibold mb-1">Book Value</div>
                    <div className="text-[24px] sm:text-[26px] font-extrabold text-[#111827]">N28.45M</div>
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] text-gray-400 font-semibold mb-1">Net Book Value (NBV)</div>
                    <div className="text-[24px] sm:text-[26px] font-extrabold text-[#3B5BDB]">N21.75M</div>
                  </div>
                </div>

                {/* Simulated Wave Line Chart */}
                <div className="h-[90px] w-full mt-2 mb-8 relative px-2">
                  <svg viewBox="0 0 400 100" className="w-full h-full preserve-aspect-ratio-none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B5BDB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 70 C 50 70, 70 30, 120 40 S 170 70, 220 50 S 270 20, 320 20 S 370 60, 400 50 L 400 100 L 0 100 Z" fill="url(#chartGradient)" />
                    <path d="M0 70 C 50 70, 70 30, 120 40 S 170 70, 220 50 S 270 20, 320 20 S 370 60, 400 50" fill="none" stroke="#3B5BDB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="text-center mt-6 mb-auto">
                  <div className="text-[12px] text-gray-400 font-semibold mb-3">Category Breakdown</div>
                  <div className="h-2 w-[85%] mx-auto rounded-full flex overflow-hidden">
                    <div className="bg-[#3B5BDB] w-[50%]" />
                    <div className="bg-[#60A5FA] w-[35%]" />
                    <div className="bg-[#FCD34D] w-[15%]" />
                  </div>
                  <div className="flex flex-wrap justify-center items-center mt-3 text-[11px] text-gray-500 font-bold gap-3 sm:gap-5">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#3B5BDB]"/> Land/Bldgs</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#60A5FA]"/> Machinery</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#FCD34D]"/> Furniture</div>
                  </div>
                </div>
              </div>

              {/* Health & Status Card */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[#EEF1F6] flex flex-col justify-between">
                <h3 className="text-[12px] font-bold text-gray-400 tracking-wider mb-6">HEALTH & STATUS</h3>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 mb-6">
                  {/* Donut Chart */}
                  <div className="relative w-27.5 h-27.5 shrink-0">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B5BDB" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="47.7" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[22px] font-extrabold text-[#111827]">81%</span>
                      <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-0.5">HEALTHY</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-bold text-gray-500">Operational</span>
                      <span className="font-extrabold text-[#111827]">412</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-bold text-[#F59E0B]">Maintenance</span>
                      <span className="font-extrabold text-[#F59E0B]">14</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-bold text-[#EF4444]">Offline/Faulty</span>
                      <span className="font-extrabold text-[#EF4444]">5</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 mb-auto bg-[#FFFBEB] rounded-[16px] p-4 flex flex-col items-center justify-center text-center gap-2 border border-[#FEF3C7]">
                  <AlertTriangle className="h-[20px] w-5 text-[#F59E0B] shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-[#B45309] mb-1">Critical alerts</div>
                    <div className="text-[11px] text-[#D97706] font-medium leading-tight">3 pending servicing, 2 insurances expiring.</div>
                  </div>
                </div>
              </div>

              {/* Queue & Activity Card */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[#EEF1F6] flex flex-col justify-between md:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[12px] font-bold text-gray-400 tracking-wider">QUEUE & ACTIVITY</h3>
                  <div className="bg-[#EEF2FF] text-[#3B5BDB] text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest leading-none">2 NEW</div>
                </div>

                <div className="mb-6">
                  <div className="text-[13px] text-gray-500 font-semibold mb-3">Pending Approvals</div>
                  <div className="space-y-3">
                    <div className="bg-[#F8FAFC] rounded-[14px] p-3.5 flex justify-between items-center border border-[#F1F5F9]">
                      <div>
                        <div className="text-[13px] font-bold text-[#111827]">Geyersell Old Generator</div>
                        <div className="text-[11px] text-gray-500 font-medium mt-0.5">submitted by Alice Morgan</div>
                      </div>
                      <button className="text-[12px] font-bold text-[#3B5BDB] hover:underline">Review</button>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-[14px] p-3.5 flex justify-between items-center border border-[#F1F5F9]">
                      <div>
                        <div className="text-[13px] font-bold text-[#111827]">Yamaha SG Chairs</div>
                        <div className="text-[11px] text-gray-500 font-medium mt-0.5">Ps. Sarah, Ikeja</div>
                      </div>
                      <button className="text-[12px] font-bold text-[#3B5BDB] hover:underline">Review</button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[13px] text-gray-500 font-semibold mb-4">Activity log 22 - 23</div>
                  <div className="space-y-4 pl-1">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-[3px] ring-emerald-50" />
                      <div className="absolute left-[3px] top-4 -bottom-5 w-0.5 bg-gray-100" />
                      <div className="text-[13px] font-bold text-[#111827]">New Asset Added</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">Yamaha SG Chairs • Sun 23</div>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-[3px] ring-amber-50" />
                      <div className="absolute left-0.75 top-4 bottom-[-20px] w-0.5 bg-gray-100" />
                      <div className="text-[13px] font-bold text-[#111827]">Maintenance Logged</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">Lawn Mowing Machine (HQ) • Sat 22</div>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#3B5BDB] ring-[3px] ring-[#EEF2FF]" />
                      <div className="text-[13px] font-bold text-[#111827]">Insurance Renewed</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">Church Bus (IKEJA) • Sat 14</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Assets Inventory Table */}
            <div className="bg-white rounded-[24px] shadow-sm border border-[#EEF1F6] overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#EEF1F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-[18px] font-extrabold text-[#111827]">Active Assets Inventory</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="relative flex-1 sm:max-w-none">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search assets..." 
                      className="pl-10 h-10 w-full sm:w-60 bg-[#F9FAFB] border-gray-100 rounded-[10px] text-[13px] focus-visible:ring-[#3B5BDB]"
                    />
                  </div>
                  <button className="text-[14px] font-bold text-[#3B5BDB] hover:underline whitespace-nowrap shrink-0 sm:block">View All</button>
                </div>
              </div>

              <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-[13px] min-w-175">
                  <thead>
                    <tr className="bg-white border-b border-[#EEF1F6]">
                      <th className="py-5 px-4 sm:px-6 text-left text-[11px] font-bold text-gray-400 tracking-wider">ASSET DESCRIPTION</th>
                      <th className="py-5 px-4 sm:px-6 text-left text-[11px] font-bold text-gray-400 tracking-wider">CATEGORY</th>
                      <th className="py-5 px-4 sm:px-6 text-left text-[11px] font-bold text-gray-400 tracking-wider">PURCHASE DATE</th>
                      <th className="py-5 px-4 sm:px-6 text-left text-[11px] font-bold text-gray-400 tracking-wider">BOOK VALUE</th>
                      <th className="py-5 px-4 sm:px-6 text-left text-[11px] font-bold text-gray-400 tracking-wider">CONDITION</th>
                      <th className="py-5 px-4 sm:px-6 text-right text-[11px] font-bold text-gray-400 tracking-wider">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset, i) => (
                      <tr key={i} className="border-b border-[#EEF1F6] hover:bg-gray-50/50 transition-colors last:border-0">
                        <td className="py-5 px-4 sm:px-6 font-bold text-[#111827]">{asset.name}</td>
                        <td className="py-5 px-4 sm:px-6 text-gray-500 font-medium">{asset.category}</td>
                        <td className="py-5 px-4 sm:px-6 text-gray-500 font-medium">{asset.date}</td>
                        <td className="py-5 px-4 sm:px-6 font-extrabold text-[#111827]">{asset.value}</td>
                        <td className="py-5 px-4 sm:px-6">
                          <span className={`${asset.statusColor} text-[10px] font-bold px-3 py-1.5 rounded-[6px] tracking-wide inline-block leading-none break-keep whitespace-nowrap`}>
                            {asset.condition}
                          </span>
                        </td>
                        <td className="py-5 px-4 sm:px-6 text-right text-gray-400">
                          <button className="hover:text-[#111827] transition-colors p-2 flex items-center justify-end w-full">
                            <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EEF1F6] bg-white text-center sm:text-left">
                <div className="text-[13px] text-gray-500 font-medium">Showing 1-10 of 474 results</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-9 px-4 text-[13px] font-bold text-gray-500 border-gray-200 rounded-[8px] hover:bg-gray-50 hover:text-gray-900">
                    Previous
                  </Button>
                  <Button variant="outline" className="h-9 px-4 text-[13px] font-bold text-gray-500 border-gray-200 rounded-[8px] hover:bg-gray-50 hover:text-gray-900">
                    Next
                  </Button>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  )
}
