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
  Calendar,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Menu
} from "lucide-react"

const categoryData = [
  {
    category: "Vehicles",
    method: "Straight-line",
    methodColor: "text-[#3B5BDB] bg-[#EEF2FF]",
    cost: "₦15.0M",
    openingNbv: "₦8.5M",
    currentDepr: "₦1.5M",
    closingNbv: "₦7.0M",
  },
  {
    category: "Equipment",
    method: "Reducing Balance",
    methodColor: "text-[#D97706] bg-[#FEF3C7]",
    cost: "₦5.2M",
    openingNbv: "₦3.1M",
    currentDepr: "₦450k",
    closingNbv: "₦2.65M",
  },
  {
    category: "Furniture",
    method: "Straight-line",
    methodColor: "text-[#3B5BDB] bg-[#EEF2FF]",
    cost: "₦2.5M",
    openingNbv: "₦1.8M",
    currentDepr: "₦250k",
    closingNbv: "₦1.55M",
  },
  {
    category: "Buildings",
    method: "Straight-line",
    methodColor: "text-[#3B5BDB] bg-[#EEF2FF]",
    cost: "₦45.0M",
    openingNbv: "₦40.5M",
    currentDepr: "₦900k",
    closingNbv: "₦39.6M",
  },
]

const months = [
  { name: "JAN", value: "₦121k", active: true },
  { name: "FEB", value: "₦121k", active: true },
  { name: "MAR", value: "₦121k", active: true },
  { name: "APR", value: "₦120k", active: true },
  { name: "MAY", value: "₦120k", active: true },
  { name: "JUN", value: "₦120k", active: true, bold: true },
  { name: "JUL", value: "₦120k", active: false },
  { name: "AUG", value: "₦120k", active: false },
  { name: "SEP", value: "₦120k", active: false },
  { name: "OCT", value: "₦120k", active: false },
  { name: "NOV", value: "₦120k", active: false },
  { name: "DEC", value: "₦120k", active: false },
]

export default function DepreciationPage() {
  return (
    <div 
      className="min-h-screen bg-[#F7F9FC] text-sm flex overflow-hidden lg:flex-row flex-col"
      style={{ fontFamily: '"Public Sans", sans-serif' }}
    >
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-[#EEF1F6] bg-white flex-col justify-between hidden lg:flex flex-shrink-0 z-20">
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
              { label: "Compliance & Remittance", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-[8px] px-3.5 py-3 text-[13px] font-bold cursor-pointer transition-colors ${
                    item.active ? "bg-[#EEF2FF] text-[#3B5BDB]" : "text-[#475569] hover:bg-gray-50 hover:text-[#111827]"
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
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-50 cursor-pointer transition-colors">
              <Settings className="h-[18px] w-[18px] stroke-[2]" />
              Settings
            </div>
            <div className="flex items-center gap-3.5 rounded-[8px] px-3.5 py-3 text-[13px] font-bold text-[#475569] hover:bg-gray-50 cursor-pointer transition-colors">
              <HelpCircle className="h-[18px] w-[18px] stroke-[2]" />
              Help Center
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3.5">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shrink-0">
              <img src="/images/Beared%20Guy02-min%201.jpg" alt="Alex Morgan" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-[#111827]">Alex Morgan</div>
              <div className="text-[11px] text-[#94A3B8] font-bold mt-0.5">Lead Pastor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-[#F7F9FC]">
        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 border-b border-[#EEF1F6] z-10 w-full relative">
          <div className="text-[16px] font-extrabold text-[#111827] flex items-center gap-3 shrink-0">
            <button className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            <div className="relative flex-1 sm:flex-none sm:w-[320px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 stroke-[2.5]" />
              <Input 
                placeholder="Search requisitions..." 
                className="pl-9 h-10 w-full bg-[#F8FAFC] border-transparent focus:border-[#EEF1F6] rounded-[8px] text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-[#3B5BDB] placeholder:text-[#94A3B8] placeholder:font-medium"
              />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[8px] bg-white border border-transparent flex items-center justify-center text-[#94A3B8] shadow-sm cursor-pointer hover:bg-gray-50 relative transition-colors">
              <Bell className="h-5 w-5 stroke-[2]" />
              <div className="absolute top-2.5 right-2 w-[7px] h-[7px] bg-[#EF4444] rounded-full border-[1.5px] border-white" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 max-w-[1240px] xl:max-w-[1400px] mx-auto w-full">
            
            {/* Header Titles */}
            <div className="mb-8">
              <button className="flex items-center gap-1 text-[13.5px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors mb-5 w-fit">
                <ArrowLeft className="h-[18px] w-[18px] stroke-[2.5]" />
                Back
              </button>
              <h1 className="text-[#111827] mb-2" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '26.21px', lineHeight: '32.76px', letterSpacing: '-0.66px', verticalAlign: 'middle' }}>Depreciation Schedule & Analysis</h1>
              <p className="text-[14px] text-[#64748B] font-medium">Financial overview for Grace Chapel Ikeja Asset Management</p>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">ANNUAL CHARGE</h3>
                  <Calendar className="h-[18px] w-[18px] text-[#3B5BDB] stroke-[2]" />
                </div>
                <div className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: '26.67px', lineHeight: '33.33px', letterSpacing: '-0.67px', verticalAlign: 'middle' }}>₦1.45M</div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#10B981]">
                  <TrendingUp className="h-[14px] w-[14px] stroke-[2.5]" />
                  <span>+2.4% vs LY</span>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">MONTHLY CHARGE</h3>
                  <Calendar className="h-[18px] w-[18px] text-[#3B5BDB] stroke-[2]" />
                </div>
                <div className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: '26.67px', lineHeight: '33.33px', letterSpacing: '-0.67px', verticalAlign: 'middle' }}>₦120k</div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#F43F5E]">
                  <TrendingDown className="h-[14px] w-[14px] stroke-[2.5]" />
                  <span>-0.5% vs Prev Month</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">ACCUMULATED DEPR</h3>
                  <WalletIcon className="h-[18px] w-[18px] text-[#3B5BDB] stroke-[2]" />
                </div>
                <div className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: '26.67px', lineHeight: '33.33px', letterSpacing: '-0.67px', verticalAlign: 'middle' }}>₦6.7M</div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#10B981]">
                  <TrendingUp className="h-[14px] w-[14px] stroke-[2.5]" />
                  <span>+12.1% total base</span>
                </div>
              </div>
            </div>

            {/* Category-wise Depreciation Table */}
            <div className="bg-white rounded-[16px] shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-[#EEF1F6] overflow-hidden mb-8">
              <div className="p-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight">Category-wise Depreciation</h2>
                <button className="text-[13px] font-bold text-[#3B5BDB] hover:text-[#2e4ac0] transition-colors self-start sm:self-auto">
                  View All Categories
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#F1F5F9]">
                      <th className="py-5 px-6 sm:px-8 text-left text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase w-[220px]">ASSET CATEGORY</th>
                      <th className="py-5 px-4 text-left text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase w-[160px]">METHOD</th>
                      <th className="py-5 px-4 text-right text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">COST</th>
                      <th className="py-5 px-4 text-right text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">OPENING NBV</th>
                      <th className="py-5 px-4 text-right text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">CURRENT DEPR</th>
                      <th className="py-5 px-6 sm:px-8 text-right text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">CLOSING NBV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.map((row, i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC]/50 transition-colors">
                        <td className="py-5 px-6 sm:px-8 align-middle">
                          <span className="font-extrabold text-[#111827] text-[14.5px] tracking-tight">{row.category}</span>
                        </td>
                        <td className="py-5 px-4 align-middle">
                          <span className={`${row.methodColor} text-[10.5px] font-bold px-3 py-1.5 rounded-full inline-block tracking-wide`}>
                            {row.method}
                          </span>
                        </td>
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="text-[#64748B] font-bold text-[13.5px]">{row.cost}</span>
                        </td>
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="text-[#64748B] font-bold text-[13.5px]">{row.openingNbv}</span>
                        </td>
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="text-[#EF4444] font-bold text-[13.5px]">{row.currentDepr}</span>
                        </td>
                        <td className="py-5 px-6 sm:px-8 align-middle text-right">
                          <span className="text-[#111827] font-extrabold text-[14.5px]">{row.closingNbv}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Footer */}
                  <tfoot>
                    <tr className="bg-white border-t-2 border-[#E2E8F0]">
                      <td className="py-6 px-6 sm:px-8 align-middle">
                        <span className="font-extrabold text-[#111827] text-[13px] tracking-widest uppercase">TOTAL ASSET PORTFOLIO</span>
                      </td>
                      <td className="py-6 px-4 align-middle"></td>
                      <td className="py-6 px-4 align-middle text-right">
                        <span className="text-[#111827] font-extrabold text-[15px]">₦67.7M</span>
                      </td>
                      <td className="py-6 px-4 align-middle text-right">
                        <span className="text-[#111827] font-extrabold text-[15px]">₦53.9M</span>
                      </td>
                      <td className="py-6 px-4 align-middle text-right">
                        <span className="text-[#EF4444] font-extrabold text-[15px]">₦3.1M</span>
                      </td>
                      <td className="py-6 px-6 sm:px-8 align-middle text-right">
                        <span className="text-[#3B5BDB] font-extrabold text-[15px]">₦50.8M</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bottom 2024 Monthly Distribution */}
            <div className="bg-white rounded-[16px] p-6 sm:px-8 sm:py-7 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] border border-[#EEF1F6] mb-8">
              <div className="mb-8">
                <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight mb-2">2024 Monthly Distribution</h2>
                <p className="text-[13.5px] text-[#64748B] font-medium">Allocation of depreciation expense across the current calendar year</p>
              </div>
              
              <div className="overflow-x-auto pb-4">
                <div className="flex items-center min-w-max justify-between px-1">
                  {months.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-6 w-[70px] shrink-0">
                      <span className="text-[11px] font-extrabold text-[#94A3B8] tracking-widest uppercase">
                        {m.name}
                      </span>
                      <span className={`text-[13.5px] ${m.bold ? 'font-extrabold text-[#111827]' : m.active ? 'font-bold text-[#475569]' : 'font-semibold text-[#CBD5E1]'}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
