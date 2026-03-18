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
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  User,
  Menu
} from "lucide-react"

const tableData = [
  {
    id: "SW-\nPA-\n001",
    rawId: "SW-PA-001",
    title: "PA System",
    desc: "Digital Mixing\nConsole + 8\nLine Array\nSpeakers",
    category: "Electronics",
    location: "Main\nSanctuary",
    status: "Operational",
    statusColor: "text-emerald-700 bg-emerald-100",
    value: "₦850,000",
    selected: true,
  },
  {
    id: "SW-\nVEH-\n042",
    rawId: "SW-VEH-042",
    title: "Toyota Hiace",
    desc: "2018 Model,\nWhite Bus",
    category: "Vehicle",
    location: "Garage",
    status: "Maintenance",
    statusColor: "text-amber-700 bg-amber-100",
    value: "₦8,500,000",
    selected: false,
  },
  {
    id: "SW-\nFUR-\n110",
    rawId: "SW-FUR-110",
    title: "Office Chair",
    desc: "Ergonomic\nLeather Chair",
    category: "Furniture",
    location: "Pastor's Office",
    status: "Pending Disposal",
    statusColor: "text-rose-700 bg-rose-100",
    value: "₦25,000",
    selected: false,
  },
]

export default function AssetRegisterPage() {
  return (
    <div 
      className="min-h-screen bg-[#F7F9FC] text-sm flex overflow-hidden lg:flex-row flex-col"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[#EEF1F6] bg-white flex-col justify-between hidden lg:flex flex-shrink-0">
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
                    <Icon className="h-[18px] w-[18px]" />
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
              <Settings className="h-[18px] w-[18px]" />
              Settings
            </div>
            <div className="flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 text-[13px] font-semibold text-[#6B7280] hover:bg-gray-50 cursor-pointer">
              <HelpCircle className="h-[18px] w-[18px]" />
              Help Center
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3.5">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white">
              <img src="/images/Beared%20Guy02-min%201.jpg" alt="Ava Morgan" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#111827]">Ava Morgan</div>
              <div className="text-[12px] text-[#9CA3AF] font-medium">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-white lg:bg-[#F7F9FC]">
        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 border-b border-[#EEF1F6] z-20">
          <div className="text-[16px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0">
            <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            <div className="relative flex-1 sm:flex-none sm:w-[320px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search requisitions..." 
                className="pl-9 h-10 w-full bg-[#F8FAFC] border-transparent focus:border-gray-200 rounded-[10px] text-[13px] shadow-none focus-visible:ring-[#3B5BDB]"
              />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[10px] bg-white border border-transparent flex items-center justify-center text-gray-400 shadow-sm cursor-pointer hover:bg-gray-50 relative">
              <Bell className="h-5 w-5" />
              <div className="absolute top-2.5 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
            </div>
          </div>
        </header>
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-[#F7F9FC]">
          <div className="flex flex-col lg:flex-row p-4 sm:p-8 gap-6 xl:gap-8 max-w-[1600px] mx-auto w-full">
            
            {/* Main List Pane */}
            <div className="flex-1 min-w-0 flex flex-col">
              <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors mb-6 w-fit">
                <ArrowLeft className="h-4 w-4 stroke-[2]" />
                Back
              </button>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-[32px] font-extrabold text-[#111827] tracking-tight leading-none">Asset Register</h1>
                  <p className="text-[14px] text-gray-500 mt-2 font-medium">Detailed directory of church properties and equipment.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                  <Button className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 h-11 rounded-[8px] font-bold shadow-sm text-[13px]">
                    Asset Depreciation
                  </Button>
                  <Button className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 h-11 rounded-[8px] font-bold shadow-sm text-[13px]">
                    Asset Depreciation
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex justify-start gap-2.5 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                <button className="shrink-0 bg-[#3B5BDB] text-white px-5 h-[38px] rounded-[10px] text-[13px] font-bold shadow-sm whitespace-nowrap leading-none pt-0.5">
                  All Assets
                </button>
                <button className="shrink-0 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] px-5 h-[38px] rounded-[10px] text-[13px] font-bold transition-colors whitespace-nowrap leading-none pt-0.5">
                  Electronics
                </button>
                <button className="shrink-0 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] px-5 h-[38px] rounded-[10px] text-[13px] font-bold transition-colors whitespace-nowrap leading-none pt-0.5">
                  Vehicles
                </button>
                <button className="shrink-0 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] px-5 h-[38px] rounded-[10px] text-[13px] font-bold transition-colors whitespace-nowrap leading-none pt-0.5">
                  Furniture
                </button>
                <button className="shrink-0 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] px-5 h-[38px] rounded-[10px] text-[13px] font-bold transition-colors whitespace-nowrap leading-none pt-0.5">
                  Musical Equipment
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[16px] border border-[#EEF1F6] overflow-hidden shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[750px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#EEF1F6]">
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest w-[100px] uppercase align-bottom leading-relaxed">ASSET<br/>TAG</th>
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest w-[200px] uppercase align-bottom">DESCRIPTION</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">CATEGORY</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">LOCATION</th>
                        <th className="py-5 px-5 pb-4 text-center text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">STATUS</th>
                        <th className="py-5 px-5 pb-4 text-left text-[11px] font-extrabold text-[#64748B] tracking-widest uppercase align-bottom">CURRENT VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr key={i} className={`border-b border-[#EEF1F6] last:border-0 transition-colors relative cursor-pointer ${row.selected ? 'bg-[#F8FAFC]' : 'hover:bg-gray-50/50'}`}>
                          <td className="py-6 px-5 align-top relative">
                            {row.selected && (
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#3B5BDB]" />
                            )}
                            <span className={`text-[13px] font-bold leading-relaxed whitespace-pre-line tracking-wide ${row.selected ? 'text-[#3B5BDB]' : 'text-[#64748B]'}`}>
                              {row.id}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-top">
                            <div className="text-[#111827] mb-1.5" style={{ fontWeight: 700, fontSize: '18.31px', lineHeight: '25.63px', verticalAlign: 'middle' }}>{row.title}</div>
                            <div className="text-[#64748B] whitespace-pre-line leading-relaxed text-[12px] max-w-[160px]">{row.desc}</div>
                          </td>
                          <td className="py-6 px-5 align-middle text-center w-[140px]">
                            <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-bold px-4 py-1.5 rounded-full inline-block tracking-wide">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-middle text-[#64748B] font-medium whitespace-pre-line leading-relaxed text-[13px] text-center w-[140px]">
                            {row.location}
                          </td>
                          <td className="py-6 px-5 align-middle text-center w-[140px]">
                            <span className={`${row.statusColor} text-[10px] font-bold px-4 py-1.5 rounded-[6px] tracking-wide inline-block leading-none`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-6 px-5 align-middle font-extrabold text-[#111827] text-[14px]">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar Details Pane (Card) */}
            <div className="hidden lg:block w-[360px] xl:w-[400px] shrink-0 mt-[44px]">
              <div className="bg-white rounded-[16px] shadow-[0px_2px_24px_rgba(0,0,0,0.03)] border border-[#EEF1F6] p-7 2xl:p-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="bg-[#EEF2FF] text-[#3B5BDB] text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap">
                    ASSET DETAILS
                  </span>
                  <button className="text-[#64748B] hover:text-[#111827] transition-colors p-1 bg-white hover:bg-gray-100 rounded-lg">
                    <X className="h-[22px] w-[22px]" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mb-8 border-b border-[#EEF1F6] pb-8">
                  <h2 className="text-[28px] xl:text-[32px] font-extrabold text-[#111827] mb-1.5 tracking-tight">PA System</h2>
                  <div className="text-[#64748B] font-medium text-[14px] mb-6">SW-PA-001</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[32px] xl:text-[36px] font-extrabold text-[#3B5BDB] tracking-tight">₦850,000</span>
                    <span className="text-[#10B981] font-bold text-[14px] flex items-center mb-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ↑ 2.4%
                    </span>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="mb-10">
                  <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest mb-5">FINANCIAL INFO</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Depreciation Method</span>
                      <span className="text-[#111827] font-extrabold">Straight Line (10%)</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Purchase Date</span>
                      <span className="text-[#111827] font-extrabold">Mar 12, 2023</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#64748B] font-medium">Book Value</span>
                      <span className="text-[#111827] font-extrabold text-[14px]">₦765,000</span>
                    </div>
                  </div>
                </div>

                {/* Responsibility */}
                <div className="mb-10">
                  <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest mb-5">RESPONSIBILITY</h3>
                  <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-[12px] border border-[#EEF1F6]">
                    <div className="h-[42px] w-[42px] bg-[#E0E7FF] text-[#4F46E5] rounded-full flex items-center justify-center shrink-0">
                      <User className="h-[20px] w-[20px]" />
                    </div>
                    <span className="font-extrabold text-[#111827] text-[14px]">Deacon Adebayo</span>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#64748B] text-[11px] font-extrabold tracking-widest">ATTACHMENTS</h3>
                    <button className="text-[#3B5BDB] font-extrabold text-[12px] hover:text-[#2e4ac0] transition-colors flex items-center gap-1 bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                      + Add
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* File 1 */}
                    <div className="border border-[#EEF1F6] rounded-[12px] p-4 flex items-center justify-between bg-white hover:border-[#3B5BDB]/30 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-[8px] flex items-center justify-center bg-red-50 text-red-500 shrink-0">
                          <FileText className="h-[18px] w-[18px]" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#111827] text-[12px] xl:text-[13px] mb-0.5 group-hover:text-[#3B5BDB] transition-colors line-clamp-1 break-all">Purchase_Receipt.pdf</div>
                          <div className="text-[10px] text-[#9CA3AF] font-medium">Uploaded Mar 14, 2023</div>
                        </div>
                      </div>
                      <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#3B5BDB] hover:bg-[#EEF2FF] transition-colors shrink-0">
                        <Download className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* File 2 */}
                    <div className="border border-[#EEF1F6] rounded-[12px] p-4 flex items-center justify-between bg-white hover:border-[#3B5BDB]/30 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-[8px] flex items-center justify-center bg-blue-50 text-[#3B5BDB] shrink-0">
                          <ImageIcon className="h-[18px] w-[18px]" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="font-extrabold text-[#111827] text-[12px] xl:text-[13px] mb-0.5 group-hover:text-[#3B5BDB] transition-colors line-clamp-1 break-all">Installation_View.jpg</div>
                          <div className="text-[10px] text-[#9CA3AF] font-medium">Uploaded Mar 14, 2023</div>
                        </div>
                      </div>
                      <button className="h-8 w-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#3B5BDB] hover:bg-[#EEF2FF] transition-colors shrink-0">
                        <Download className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
