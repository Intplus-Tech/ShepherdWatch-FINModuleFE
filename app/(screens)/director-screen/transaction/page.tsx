"use client"

import Image from "next/image"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Coins,
  Scale,
  Wallet,
  Building2,
  Users,
  Settings,
  Search,
  ChevronDown,
  Download,
  AlertTriangle,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Flag,
  Upload,
  RefreshCw,
  X,
  Calendar,
  Eye,
  Check,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", icon: ArrowLeftRight, active: true },
  { label: "Budgeting", icon: Coins },
  { label: "Compliance", icon: Scale },
  { label: "Asset", icon: Wallet },
  { label: "Branch Management", icon: Building2 },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
]

const stats = [
  {
    title: "UNVERIFIED",
    value: "14",
    trend: "Action Needed",
    trendColor: "text-amber-500",
    icon: AlertTriangle,
    iconBaseColor: "text-amber-100",
    iconColor: "text-amber-500",
  },
  {
    title: "INFLOW (MONTH)",
    value: "₦8,840,250",
    trend: "↑12%",
    trendColor: "text-emerald-500",
    icon: ArrowUpRight,
    iconBaseColor: "text-emerald-100",
    iconColor: "text-emerald-500",
  },
  {
    title: "PENDING REVIEW",
    value: "5",
    trend: "",
    trendColor: "",
    icon: MoreHorizontal,
    iconBaseColor: "text-gray-100",
    iconColor: "text-gray-400",
  },
]

const transactions = [
  { id: 1, date: "Oct 24, 2023", description: "TRF FRM PAUL George TITHES", amount: "+₦1,250,723.00", amountColor: "text-emerald-600", tag: "Income: Tithes", tagBg: "bg-purple-50", tagColor: "text-purple-600", status: "Unverified", statusBg: "bg-amber-100/50", statusColor: "text-amber-600", checked: true },
  { id: 2, date: "Oct 23, 2023", description: "AMZN Mktp NG*1X2Y3Z", amount: "-₦45,452.99", amountColor: "text-gray-600", tag: "Office Supplies", tagBg: "bg-gray-100", tagColor: "text-gray-500", status: "Unverified", statusBg: "bg-amber-100/50", statusColor: "text-amber-600", checked: false },
  { id: 3, date: "Oct 22, 2023", description: "ACH DEBIT: UTILITY POWER CO", amount: "-₦443,312.50", amountColor: "text-gray-600", tag: "Utilities", tagBg: "bg-blue-50", tagColor: "text-blue-500", status: "Verified", statusBg: "bg-transparent", statusColor: "text-emerald-500", checked: false },
  { id: 4, date: "Oct 21, 2023", description: "CHECK DEPOSIT #4402 - YOUTH FUNDRAISER", amount: "+₦950,723.00", amountColor: "text-emerald-600", tag: "Fundraising", tagBg: "bg-fuchsia-50", tagColor: "text-fuchsia-600", status: "Unverified", statusBg: "bg-amber-100/50", statusColor: "text-amber-600", checked: false },
  { id: 5, date: "Oct 20, 2023", description: "SOFTWARE SUBSCRIPTION: ZOOM", amount: "-₦62,452.99", amountColor: "text-gray-600", tag: "Uncategorized", tagBg: "bg-gray-50", tagColor: "text-gray-400 border border-gray-200 border-dashed", status: "Unverified", statusBg: "bg-amber-100/50", statusColor: "text-amber-600", checked: false },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col border-r border-[#EEF1F6] bg-[#FAFBFF] xl:flex">
        <div className="flex flex-col gap-1 px-6 pt-6 lg:pt-8 pb-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="ShepherdWatch" width={160} height={36} className="object-contain" />
          </div>
          <span className="text-[10px] font-medium text-[#3B5BDB] ml-9 -mt-1">Super Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 mt-2">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={`flex cursor-pointer items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-medium transition-colors ${
                    item.active
                      ? "bg-[#3B5BDB] text-white shadow-sm"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#EEF1F6] p-5 mt-auto">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm shrink-0">
              <Image
                src="/images/Beared%20Guy02-min%201.jpg"
                alt="User avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#111827]">Rev. Thomas M.</span>
              <span className="text-[11px] font-medium text-[#6B7280]">Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start border-b border-[#EEF1F6] pb-6">
            <div className="pt-1">
              <h1 className="text-[24px] leading-none font-bold text-[#111827]">Financial Overview</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">Global financial health monitoring</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Building2 className="h-4 w-4 text-[#6B7280]" />
                All Branches
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>
              
              <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-medium text-[#4B5563] shadow-sm hover:bg-gray-50">
                <Calendar className="h-4 w-4 text-[#6B7280]" />
                This Month
                <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] ml-1" />
              </button>

              <div className="flex items-center rounded-md border border-[#E5E7EB] bg-white p-0.5 shadow-sm">
                <button className="rounded px-3 py-1.5 text-[11px] font-bold bg-[#3B5BDB] text-white">NGN</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">USD</button>
                <button className="rounded px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] hover:text-[#4B5563]">EUR</button>
              </div>

              <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700 ml-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Left Main Pane (Bank Transactions) */}
            <div className="flex-1 flex flex-col">
              
              {/* Internal Header for Bank Transactions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#111827]">Bank Transactions</h2>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">Reconcile imported bank feeds with your chart of accounts.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                  <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm hover:bg-gray-50 transition-colors">
                    <Upload className="h-4 w-4 text-[#4B5563]" strokeWidth={2.5} /> Upload CSV
                  </button>
                  <button className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-blue-700 ml-1 transition-colors">
                    <RefreshCw className="h-4 w-4" strokeWidth={2.5} /> Sync Feed
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="relative rounded-xl border border-[#EEF1F6] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                      <p className="text-[11px] font-bold text-[#6B7280] tracking-wider mb-2">{stat.title}</p>
                      <div className="flex items-end gap-3 mt-2">
                        <h3 className="text-[28px] leading-tight font-bold text-[#111827]">{stat.value}</h3>
                        {stat.trend && (
                          <span className={`text-[12px] font-bold mb-1.5 ${stat.trendColor}`}>{stat.trend}</span>
                        )}
                      </div>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 opacity-30 ${stat.iconColor}`}>
                         <Icon className="w-full h-full" strokeWidth={1} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* White Box for Table */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-sm overflow-hidden flex-1">
                {/* Filters */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EEF1F6]">
                  <div className="flex items-center gap-2 p-1 rounded-lg bg-[#F3F4F6] self-start md:self-auto">
                    <button className="rounded-md bg-white px-5 py-1.5 text-[12px] font-bold text-[#4B5563] shadow-sm">All</button>
                    <button className="rounded-md px-4 py-1.5 text-[12px] font-bold text-[#3B5BDB]">Unverified</button>
                    <button className="rounded-md px-4 py-1.5 text-[12px] font-bold text-[#6B7280]">Verified</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-between gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 w-full md:w-[320px] shadow-sm">
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <Search className="h-4 w-4" />
                        <span className="text-[12px]">Search by description or amount...</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-bold text-[#4B5563] shadow-sm">
                      <Calendar className="h-4 w-4 text-[#6B7280]" /> Oct 2023
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 w-12 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">
                          <div className="h-4 w-4 rounded-[4px] border-2 border-[#D1D5DB] border-dashed"></div>
                        </th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">DATE</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6]">DESCRIPTION</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-center w-32">AMOUNT</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-center">SUGGESTED TAG</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] border-b border-[#EEF1F6] text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className={`hover:bg-gray-50 font-medium ${tx.checked ? 'bg-[#EEF2FF]' : ''}`}>
                          <td className="px-6 py-5">
                            {tx.checked ? (
                              <div className="h-4 w-4 rounded-[4px] bg-[#3B5BDB] flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded-[4px] border-2 border-[#D1D5DB]"></div>
                            )}
                          </td>
                          <td className="px-4 py-5 text-[12px] font-bold text-[#6B7280]">{tx.date}</td>
                          <td className="px-4 py-5 text-[12px] font-bold text-[#4B5563] uppercase tracking-wide">{tx.description}</td>
                          <td className={`px-4 py-5 text-[12px] font-bold text-center ${tx.amountColor}`}>{tx.amount}</td>
                          <td className="px-4 py-5 text-center">
                            <span className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.tagBg} ${tx.tagColor}`}>
                              {tx.tag} {tx.id === 1 || tx.id === 4 ? '✧' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {tx.status === "Verified" ? (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500`}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> {tx.status}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold ${tx.statusBg} ${tx.statusColor}`}>
                                {tx.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between border-t border-[#EEF1F6] p-5">
                  <span className="text-[13px] font-medium text-[#6B7280]">
                    Showing 1-5 of 45 branches
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#9CA3AF] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Previous</button>
                    <button className="rounded px-4 py-2 text-[12px] font-bold text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-50 focus:outline-none transition-colors">Next</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Pane (Verification) */}
            <div className="xl:w-[350px]">
              <div className="rounded-xl border border-[#EEF1F6] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8 pb-5 border-b border-[#EEF1F6]">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">Verification</h3>
                      <p className="text-[11px] font-medium text-[#9CA3AF] mt-1">Transaction #TXN-8842</p>
                    </div>
                    <button className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Transfer details block */}
                  <div className="flex flex-col gap-1 rounded-xl bg-[#F8FAFF] border border-[#EEF2FC] p-4 pb-5 mb-4 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-[#3B5BDB] tracking-wider mb-2">INCOMING TRANSFER</p>
                    <p className="text-[12px] font-semibold text-[#111827] uppercase leading-snug">TRF FRM ST. PAUL PARISH TITHES</p>
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-[11px] font-semibold text-[#9CA3AF]">Oct 24, 2023</p>
                      <p className="text-[18px] font-bold text-emerald-600 tracking-tight">+₦1,250,723.00</p>
                    </div>
                  </div>

                  {/* Suggestion block */}
                  <div className="flex items-start gap-3 rounded-xl bg-[#FCF8FF] border border-[#F3E8FF] p-4 mb-8">
                     <span className="text-[#A855F7] mt-0.5 font-bold">✧</span>
                     <div>
                       <p className="text-[12px] font-bold text-[#a442f5] mb-1">Suggestion: Tithes & Offerings</p>
                       <p className="text-[10px] text-[#C084FC] font-medium leading-relaxed">Based on "TITHES" in description (85% confidence)</p>
                     </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-5 mb-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827]">Chart of Accounts</label>
                       <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 text-[13px] font-medium text-[#4B5563] shadow-sm cursor-pointer">
                         4001 - Tithes Income
                         <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827] flex items-center gap-1">Budget Head <span className="text-[#9CA3AF] font-medium text-[11px]">(Optional)</span></label>
                       <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 text-[13px] font-medium text-[#9CA3AF] shadow-sm cursor-pointer">
                         Select a budget...
                         <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] font-bold text-[#111827]">Notes</label>
                       <textarea 
                          placeholder="Add a note about this transaction..."
                          className="w-full rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 text-[13px] font-medium text-[#4B5563] shadow-sm resize-none h-[80px] outline-none"
                       />
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col gap-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B5BDB] py-3 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors">
                      <Check className="h-4 w-4" strokeWidth={3} /> Verify & Save
                    </button>
                    <div className="flex items-center gap-3">
                      <button className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-[14px] font-bold text-[#4B5563] hover:bg-gray-50 transition-colors">Split</button>
                      <button className="flex-1 rounded-lg border border-rose-100 bg-white py-3 text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-colors">Ignore</button>
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
