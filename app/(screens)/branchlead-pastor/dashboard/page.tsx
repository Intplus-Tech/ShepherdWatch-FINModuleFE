"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  Dot,
  FileText,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Package,
  PieChart,
  PiggyBank,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  TriangleAlert,
  Wallet,
  Zap,
} from "lucide-react"

const approvals = [
  {
    id: "REQ-2301",
    title: "Audio Upgrade",
    meta: "Submitted by Dcn. Samuel • 2 hours ago",
    amount: "₦150,000",
    tag: "OVER-BUDGET",
    tagTone: "bg-rose-50 text-rose-600",
    iconTone: "bg-rose-50 text-rose-600",
    iconPath: "/images/microphone.svg",
  },
  {
    id: "REQ-2302",
    title: "Youth Camp Logistics",
    meta: "Submitted by Admin Dept • 5 hours ago",
    amount: "₦75,000",
    tag: "",
    tagTone: "bg-amber-50 text-amber-600",
    iconTone: "bg-amber-50 text-amber-600",
    iconPath: "/images/humon.svg",
  },
  {
    id: "REQ-2303",
    title: "Staff Emergency Loan",
    meta: "Submitted by Admin Dept • 1 day ago",
    amount: "₦95,000",
    tagTone: "bg-emerald-50 text-emerald-600",
    iconTone: "bg-emerald-50 text-emerald-600",
    iconPath: "/images/user.svg",
  },
]

const transactions = [
  {
    date: "Jan 22, 2024",
    desc: "Sunday Tithes & Offerings",
    category: "Income",
    amount: "+₦642,500.00",
    status: "VERIFIED",
    statusTone: "bg-emerald-50 text-emerald-600",
    icon: ShieldCheck,
  },
  {
    date: "Jan 21, 2024",
    desc: "NEPA/Utility Bill",
    category: "Operational",
    amount: "-₦42,000.00",
    status: "PAID",
    statusTone: "bg-blue-50 text-blue-600",
    icon: BadgeCheck,
  },
  {
    date: "Jan 20, 2024",
    desc: "Diesel Purchase (Gen set)",
    category: "Operational",
    amount: "-₦85,000.00",
    status: "UNVERIFIED",
    statusTone: "bg-amber-50 text-amber-600",
    icon: ShieldAlert,
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC] font-sans">
      <aside
        className="bg-white px-5 py-6"
        style={{
          width: "170.6666717529297px",
          height: "1358px",
          borderRightWidth: "0.67px",
          borderRightStyle: "solid",
          borderRightColor: "#EEF1F6",
          opacity: 1
        }}
      >
        <div className="flex items-center gap-2 pb-6">
          <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={24} height={24} />
          <div>
            <div className="text-[14px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
            <div className="text-[10px] text-[#9CA3AF]">Lead Pastor View</div>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { label: "Dashboard", icon: LayoutDashboard, active: true },
            { label: "Financial Management", icon: FolderKanban },
            { label: "Assets", icon: Building2 },
            { label: "Budget", icon: Wallet },
            { label: "Compliance & Remittance", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] ${item.active ? "bg-[#EEF2FF] text-[#3B5BDB] font-semibold" : "text-[#6B7280]"
                  }`}
              >
                <Icon
                  style={{ width: "12.266709327697754px", height: "11.62109375px", opacity: 1 }}
                  className="shrink-0"
                />
                {item.label}
              </div>
            )
          })}
        </nav>

        <div className="mt-8 space-y-3 text-[12px] text-[#6B7280]">
          <div className="flex items-center gap-2">
            <Settings style={{ width: "12.266709327697754px", height: "11.62109375px", opacity: 1 }} className="shrink-0" />
            Settings
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle style={{ width: "12.266709327697754px", height: "11.62109375px", opacity: 1 }} className="shrink-0" />
            Help Center
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 pt-4">
          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E8EDFF]">
            <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" width={32} height={32} className="h-full w-full object-cover" />
          </div>
          <div className="text-[11px]">
            <div className="font-semibold text-[#111827]">Alex Morgan</div>
            <div className="text-[#9CA3AF]">Lead Pastor</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F6] border-b-[0.67px] h-[42.67px]">
          <h1 className="text-[20px] font-semibold text-[#111827]">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <Input className="h-9 w-[260px] rounded-[12px] border-[#E5E7EB] bg-white pl-9 text-[13px]" placeholder="Search requisition..." />
            </div>
            <div className="h-9 w-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
              <Bell className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827]">Welcome back, Pastor Emmanuel</h2>
            <p className="text-[12px] text-[#9CA3AF]">Command Centre: Real-time branch financial health and approvals</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-[10px] border-[#E5E7EB] bg-white px-3 text-[12px] text-[#6B7280]">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              January 2024
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-9 rounded-[10px] bg-[#3B5BDB] px-4 text-[12px] text-white">
              + New Request
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Monthly Income */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#3B5BDB]" />
              </div>
              <div className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                +12% vs LM
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">Monthly Income</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[20px] font-bold text-[#111827]">₦2.45M</span>
              <span className="text-[11px] font-medium text-[#9CA3AF]">/ ₦3M Target</span>
            </div>

            <div className="mt-auto pt-4 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-[#9CA3AF]">
                <span>PROGRESS</span>
                <span className="text-[#3B5BDB]">81%</span>
              </div>
              <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#EEF2FF]">
                <div className="h-full w-[81%] rounded-full bg-[#3B5BDB]" />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-[10px] text-[#6B7280]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#3B5BDB]" />Tithes 43%</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#93C5FD]" />Offerings 35%</span>
                <span className="flex items-center gap-1.5 col-span-2"><span className="h-1.5 w-1.5 rounded-full bg-[#E2E8F0]" />Other 18%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Budget Utilization */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B]">
                <PiggyBank className="h-4 w-4" />
              </div>
              <div className="rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 text-[10px] font-semibold text-[#F59E0B]">
                Caution
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">Budget Utilization</div>

            <div className="mt-auto pt-3 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1.5">
                  <span className="text-[#111827]">Operational</span>
                  <span className="text-[#111827]">78%</span>
                </div>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div className="h-full w-[78%] rounded-full bg-[#3B5BDB]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#111827]">
                    <TriangleAlert className="h-3 w-3 text-[#EF4444]" /> Transport Alert
                  </span>
                  <span className="text-[#EF4444]">82%</span>
                </div>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#FEE2E2]">
                  <div className="h-full w-[82%] rounded-full bg-[#EF4444]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#111827]">
                    <Zap className="h-3 w-3 text-[#F59E0B]" /> Utilities
                  </span>
                  <span className="text-[#F59E0B]">65%</span>
                </div>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#FEF3C7]">
                  <div className="h-full w-[65%] rounded-full bg-[#F59E0B]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Approval Queue */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#8B5CF6]" />
              </div>
              <div className="rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#8B5CF6]">
                3 High Priority
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">Approval Queue</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[20px] font-bold text-[#111827]">₦320k</span>
              <span className="text-[11px] font-medium text-[#9CA3AF]">6 Total</span>
            </div>
            <div className="mt-2 text-[11px] text-[#6B7280]">
              Items for 2nd Approval/Review
            </div>
            <div className="mt-auto pt-4">
              <Button className="w-full h-9 rounded-[8px] bg-[#111827] hover:bg-[#1F2937] text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                Review Items <span className="text-[14px] leading-none mb-0.5">→</span>
              </Button>
            </div>
          </div>

          {/* Card 4: Bank Balances */}
          <div className="flex flex-col rounded-[14px] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] border border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 rounded-full bg-[#ECFDF3] flex items-center justify-center">
                <Building2 className="h-4 w-4 text-[#10B981]" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[9px] font-semibold text-[#EF4444]">
                  Petty Low
                </div>
                <div className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[9px] font-semibold text-[#F59E0B]">
                  ! Needs Refill
                </div>
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">Main (Z-Bank)</div>
            <div className="mt-1 text-[20px] font-bold text-[#111827]">₦4.25M</div>

            <div className="mt-auto pt-2 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">Domiciliary</span>
                <span className="font-semibold text-[#111827]">$8,500</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-dashed border-[#E5E7EB]">
                <span className="font-medium text-[#EF4444]">Petty Cash</span>
                <span className="font-bold text-[#EF4444]">₦45k</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#111827]">Income Trend</div>
                <div className="text-[12px] text-[#9CA3AF]">Trailing 6 Months Analysis</div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3B5BDB]" />Tithes</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#93C5FD]" />Offerings</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#CBD5E1]" />Other</span>
              </div>
            </div>
            <div className="mt-4 h-[220px] rounded-[12px] bg-white px-4 py-6">
              <div className="grid h-full grid-cols-6 items-end gap-6 text-[10px] text-[#9CA3AF]">
                {[
                  { month: "AUG", value: 68 },
                  { month: "SEP", value: 52 },
                  { month: "OCT", value: 76 },
                  { month: "NOV", value: 60 },
                  { month: "DEC", value: 82 },
                  { month: "JAN", value: 100 },
                ].map((item) => (
                  <div key={item.month} className="flex flex-col items-center gap-3">
                    <div className="h-[140px] w-1.5 rounded-full bg-transparent relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 w-full rounded-full bg-[#3B5BDB]"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="text-[14px] font-semibold text-[#111827]">Expense Distribution</div>
            <div className="mt-4 flex items-center justify-center flex-1">
              <div className="relative h-[160px] w-[160px] rounded-full">
                <div className="absolute inset-0 rounded-full rotate-[-210deg] bg-[conic-gradient(#3B5BDB_0_78%,#60A5FA_78%_100%)]" />
                <div className="absolute inset-[18px] rounded-full bg-white" />
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center">
                  <div className="text-[20px] font-bold text-[#111827]">₦1.8M</div>
                  <div className="text-[10px] font-medium text-[#9CA3AF] mt-0.5">SPENT</div>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-[12px] text-[#6B7280]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="shrink-0 bg-[#3B5BDB]" style={{ width: "7.51px", height: "7.51px", borderRadius: "9382.81px", opacity: 1 }} /> Operational
                </span>
                <span className="font-medium text-[#111827]">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="shrink-0 bg-[#60A5FA]" style={{ width: "7.51px", height: "7.51px", borderRadius: "9382.81px", opacity: 1 }} /> Programs
                </span>
                <span className="font-medium text-[#111827]">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="shrink-0 bg-[#CBD5E1]" style={{ width: "7.51px", height: "7.51px", borderRadius: "9382.81px", opacity: 1 }} /> Capital
                </span>
                <span className="font-medium text-[#111827]">7%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#111827]">Approval Inbox</div>
              <button className="text-[12px] font-medium text-[#3B5BDB]">View All</button>
            </div>
            <div className="mt-4 space-y-3">
              {approvals.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[12px] border border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex items-center justify-center shrink-0 ${item.iconTone}`}
                      style={{
                        width: "37.54px",
                        height: "37.54px",
                        borderRadius: "7.51px",
                        opacity: 1
                      }}
                    >
                      <Image src={item.iconPath} alt={item.title} width={18} height={18} className="w-[18px] h-[18px] object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] font-semibold text-[#111827]">#{item.id}: {item.title}</div>
                        {item.tag && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.tagTone}`}>
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-0.5">{item.meta}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    <div className="text-[#111827] font-semibold">{item.amount}</div>
                    <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Details</Button>
                    <Button size="sm" className="h-7 rounded-[10px] bg-[#3B5BDB] text-[11px] text-white">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#111827]">Financial Calendar</div>
              <Calendar className="h-4 w-4 text-[#6B7280]" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { month: "JAN", day: "25", title: "Monthly Staff Payroll", meta: "Estimated ₦1.2M", active: true },
                { month: "JAN", day: "28", title: "Facility Rent Renewal", meta: "Budgeted (Rent)" },
                { month: "FEB", day: "05", title: "Annual Audit Review", meta: "Pre-Audit Meeting" },
              ].map((item, idx, arr) => (
                <div key={item.title} className={`flex items-start gap-3 ${idx < arr.length - 1 ? "border-b border-[#F3F4F6] pb-3" : ""}`}>
                  <div
                    className={`h-[45.04px] w-[45.04px] rounded-[7.51px] flex flex-col items-center justify-center text-[10px] font-semibold leading-tight ${item.active
                      ? "bg-[rgba(23,84,207,1)] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                  >
                    <span>{item.month}</span>
                    <span className={item.active ? "text-[14px]" : "text-[14px] text-[#111827]"}>{item.day}</span>
                  </div>
                  <div>
                    <div className="text-[#111827] font-bold text-[13.14px] leading-[18.77px]">
                      {item.title}
                    </div>
                    <div className="text-[11.26px] leading-[15.01px] font-normal text-[#9CA3AF]">
                      {item.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0px_4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold text-[#111827]">Recent Transactions</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Filter</Button>
              <Button variant="outline" size="sm" className="h-7 rounded-[10px] border-[#E5E7EB] bg-white text-[11px] text-[#6B7280]">Export</Button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="text-[#9CA3AF]">
                <tr>
                  <th className="py-2 text-left font-medium">DATE</th>
                  <th className="py-2 text-left font-medium">DESCRIPTION</th>
                  <th className="py-2 text-left font-medium">CATEGORY</th>
                  <th className="py-2 text-left font-medium">AMOUNT</th>
                  <th className="py-2 text-left font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const Icon = tx.icon
                  return (
                    <tr key={tx.desc} className="border-t border-[#EEF1F6]">
                      <td className="py-3 text-[#6B7280]">{tx.date}</td>
                      <td className="py-3 font-medium text-[#111827]">{tx.desc}</td>
                      <td className="py-3 text-[#6B7280]">{tx.category}</td>
                      <td className="py-3 font-semibold text-[#111827]">{tx.amount}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tx.statusTone}`}>
                          <Icon className="h-3 w-3" />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
