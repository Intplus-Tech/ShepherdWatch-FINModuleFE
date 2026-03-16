"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Dot,
  FileText,
  FolderKanban,
  LayoutDashboard,
  PiggyBank,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react"

const stats = [
  {
    title: "Monthly Income",
    value: "?2.45M",
    meta: "+12% vs LM",
    badge: "?3M Target",
    accent: "text-emerald-600",
    icon: Wallet,
  },
  {
    title: "Budget Utilization",
    value: "Operational",
    meta: "78%",
    badge: "Caution",
    accent: "text-amber-600",
    icon: PiggyBank,
  },
  {
    title: "Approval Queue",
    value: "?320k",
    meta: "3 High Priority",
    badge: "Review Items",
    accent: "text-violet-600",
    icon: FileText,
  },
  {
    title: "Main (Z-Bank)",
    value: "?4.25M",
    meta: "Petty Cash",
    badge: "?45k",
    accent: "text-rose-600",
    icon: Building2,
  },
]

const approvals = [
  {
    id: "REQ-2301",
    title: "Audio Upgrade",
    meta: "Submitted by Dcn. Samuel • 2 hours ago",
    amount: "?150,000",
    tag: "OVER-BUDGET",
    tagTone: "bg-rose-50 text-rose-600",
  },
  {
    id: "REQ-2302",
    title: "Youth Camp Logistics",
    meta: "Submitted by Admin Dept • 5 hours ago",
    amount: "?75,000",
    tag: "PENDING",
    tagTone: "bg-amber-50 text-amber-600",
  },
  {
    id: "REQ-2303",
    title: "Staff Emergency Loan",
    meta: "Submitted by Admin Dept • 1 day ago",
    amount: "?95,000",
    tag: "STANDARD",
    tagTone: "bg-emerald-50 text-emerald-600",
  },
]

const transactions = [
  {
    date: "Jan 22, 2024",
    desc: "Sunday Tithes & Offerings",
    category: "Income",
    amount: "+?642,500.00",
    status: "VERIFIED",
    statusTone: "bg-emerald-50 text-emerald-600",
  },
  {
    date: "Jan 21, 2024",
    desc: "NEPA/Utility Bill",
    category: "Operational",
    amount: "-?42,000.00",
    status: "PAID",
    statusTone: "bg-blue-50 text-blue-600",
  },
  {
    date: "Jan 20, 2024",
    desc: "Diesel Purchase (Gen set)",
    category: "Operational",
    amount: "-?85,000.00",
    status: "UNVERIFIED",
    statusTone: "bg-amber-50 text-amber-600",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <aside className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r border-[#EEF1F6] bg-white px-4 py-5">
            <div className="flex items-center gap-2 pb-5">
              <Image src="/images/icon-shepherdwatch.svg" alt="ShepherdWatch" width={22} height={22} />
              <div>
                <div className="text-[12px] font-semibold text-[#1F2937] leading-none">ShepherdWatch</div>
                <div className="text-[9px] text-[#9CA3AF]">Lead Pastor View</div>
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
                    className={`flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[11px] ${
                      item.active ? "bg-[#E9EEFF] text-[#3B5BDB] font-medium" : "text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                )
              })}
            </nav>

            <div className="mt-6 space-y-2 text-[10px] text-[#6B7280]">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Help Center
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-4">
              <div className="h-7 w-7 rounded-full overflow-hidden bg-[#E8EDFF]">
                <Image src="/images/Beared%20Guy02-min%201.jpg" alt="Alex" width={28} height={28} className="h-full w-full object-cover" />
              </div>
              <div className="text-[9px]">
                <div className="font-semibold text-[#111827]">Alex Morgan</div>
                <div className="text-[#9CA3AF]">Lead Pastor</div>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[14px] font-semibold text-[#111827]">Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input className="h-7 w-[200px] rounded-[10px] border-[#E5E7EB] bg-white pl-8 text-[9px]" placeholder="Search requisition..." />
                </div>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111827]">Welcome back, Pastor Emmanuel</h2>
                <p className="text-[9px] text-[#9CA3AF]">Command Centre: Real-time branch financial health and approvals</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  January 2024
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  + New Request
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-full px-2 py-0.5 text-[8px] ${card.accent}`}>{card.meta}</div>
                      <div className="h-7 w-7 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-[#3B5BDB]" />
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#6B7280]">{card.title}</div>
                    <div className="text-[14px] font-semibold text-[#111827]">{card.value}</div>
                    <div className="mt-2 text-[9px] text-[#9CA3AF]">{card.badge}</div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-[#111827]">Income Trend</div>
                    <div className="text-[9px] text-[#9CA3AF]">Trailing 6 Months Analysis</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#6B7280]">
                    <span className="flex items-center gap-1"><Dot className="h-4 w-4 text-[#3B5BDB]" />Tithes</span>
                    <span className="flex items-center gap-1"><Dot className="h-4 w-4 text-[#93C5FD]" />Offerings</span>
                    <span className="flex items-center gap-1"><Dot className="h-4 w-4 text-[#CBD5E1]" />Other</span>
                  </div>
                </div>
                <div className="mt-4 h-[160px] rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB]" />
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[11px] font-semibold text-[#111827]">Expense Distribution</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-[130px] w-[130px] rounded-full border-[10px] border-[#3B5BDB] relative">
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#111827]">
                      ?1.8M
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Operational</span>
                    <span>78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Programs</span>
                    <span>15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capital</span>
                    <span>7%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-[#111827]">Approval Inbox</div>
                  <button className="text-[9px] text-[#3B5BDB]">View All</button>
                </div>
                <div className="mt-3 space-y-3">
                  {approvals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[10px] border border-[#EEF1F6] px-3 py-2">
                      <div>
                        <div className="text-[10px] font-semibold text-[#111827]">#{item.id}: {item.title}</div>
                        <div className="text-[8px] text-[#9CA3AF]">{item.meta}</div>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[8px] ${item.tagTone}`}>{item.tag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px]">
                        <div className="text-[#111827] font-semibold">{item.amount}</div>
                        <Button variant="outline" size="sm" className="h-6 rounded-[8px] border-[#E5E7EB] bg-white text-[8px] text-[#6B7280]">Details</Button>
                        <Button size="sm" className="h-6 rounded-[8px] bg-[#3B5BDB] text-[8px] text-white">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-[#111827]">Financial Calendar</div>
                  <Calendar className="h-3.5 w-3.5 text-[#6B7280]" />
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    { date: "JAN 25", title: "Monthly Staff Payroll", meta: "Estimated ?1.2M" },
                    { date: "JAN 28", title: "Facility Rent Renewal", meta: "Budgeted (Rent)" },
                    { date: "FEB 05", title: "Annual Audit Review", meta: "Pre-Audit Meeting" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-[8px] bg-[#E9EEFF] flex items-center justify-center text-[9px] font-semibold text-[#3B5BDB]">
                        {item.date}
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-[#111827]">{item.title}</div>
                        <div className="text-[8px] text-[#9CA3AF]">{item.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[#111827]">Recent Transactions</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-6 rounded-[8px] border-[#E5E7EB] bg-white text-[8px] text-[#6B7280]">Filter</Button>
                  <Button variant="outline" size="sm" className="h-6 rounded-[8px] border-[#E5E7EB] bg-white text-[8px] text-[#6B7280]">Export</Button>
                </div>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">DATE</th>
                      <th className="py-2 text-left">DESCRIPTION</th>
                      <th className="py-2 text-left">CATEGORY</th>
                      <th className="py-2 text-left">AMOUNT</th>
                      <th className="py-2 text-left">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.desc} className="border-t border-[#EEF1F6]">
                        <td className="py-2 text-[#6B7280]">{tx.date}</td>
                        <td className="py-2 font-medium text-[#111827]">{tx.desc}</td>
                        <td className="py-2 text-[#6B7280]">{tx.category}</td>
                        <td className="py-2 text-[#111827]">{tx.amount}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] ${tx.statusTone}`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
