"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react"

const requisitions = [
  {
    id: "REQ-2301",
    title: "Audio System Upgrade",
    meta: "Victoria Island Branch",
    amount: "?150,000",
    status: "Over-budget",
    statusTone: "bg-rose-50 text-rose-600",
    image: "/images/login%20page%20picture.jpg",
  },
  {
    id: "REQ-2302",
    title: "Emergency Repairs",
    meta: "Ikeja Main Branch",
    amount: "?75,000",
    status: "Urgent",
    statusTone: "bg-amber-50 text-amber-600",
    image: "/images/login%20page%20picture.jpg",
  },
]

const pendingRows = [
  {
    ref: "REQ-2304",
    title: "Communion Service Supplies",
    status: "Pending",
    amount: "?60,000",
    date: "Jan 12, 2024",
  },
  {
    ref: "REQ-2305",
    title: "Facility Roof Repair",
    status: "Pending",
    amount: "?120,000",
    date: "Jan 11, 2024",
  },
  {
    ref: "REQ-2306",
    title: "Generator Fuel",
    status: "Pending",
    amount: "?40,000",
    date: "Jan 09, 2024",
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
                { label: "Dashboard", icon: LayoutDashboard },
                { label: "Requisition", icon: FolderKanban, active: true },
                { label: "Assets", icon: Wallet },
                { label: "Budget", icon: ShieldCheck },
                { label: "Reports", icon: BarChart3 },
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
                <ShieldCheck className="h-3.5 w-3.5" />
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] text-[#9CA3AF]">Dashboard</div>
                <h1 className="text-[14px] font-semibold text-[#111827]">REQUISITION</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  All Branches
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                  <Plus className="h-3.5 w-3.5" />
                  New Request
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <Bell className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Approved Requisitions</div>
                  <div className="mt-3 space-y-3">
                    {requisitions.map((req) => (
                      <div key={req.id} className="flex flex-col gap-3 rounded-[10px] border border-[#EEF1F6] p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-[10px] font-semibold text-[#111827]">#{req.id}: {req.title}</div>
                          <div className="text-[8px] text-[#9CA3AF]">{req.meta}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[8px] ${req.statusTone}`}>{req.status}</span>
                            <span className="text-[9px] font-semibold text-[#111827]">{req.amount}</span>
                          </div>
                        </div>
                        <div className="relative h-[64px] w-[96px] overflow-hidden rounded-[10px]">
                          <Image src={req.image} alt={req.title} fill className="object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Pending Requisitions</div>
                  <div className="mt-3 overflow-x-auto rounded-[10px] border border-[#EEF1F6]">
                    <table className="w-full text-[9px]">
                      <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                        <tr>
                          <th className="py-2 px-3 text-left">REFERENCE</th>
                          <th className="py-2 px-3 text-left">TITLE</th>
                          <th className="py-2 px-3 text-left">STATUS</th>
                          <th className="py-2 px-3 text-left">AMOUNT</th>
                          <th className="py-2 px-3 text-left">DATE</th>
                          <th className="py-2 px-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRows.map((row) => (
                          <tr key={row.ref} className="border-t border-[#EEF1F6] text-[#111827]">
                            <td className="py-2 px-3 text-[#6B7280]">{row.ref}</td>
                            <td className="py-2 px-3 font-medium">{row.title}</td>
                            <td className="py-2 px-3 text-[#6B7280]">{row.status}</td>
                            <td className="py-2 px-3 text-[#111827]">{row.amount}</td>
                            <td className="py-2 px-3 text-[#6B7280]">{row.date}</td>
                            <td className="py-2 px-3 text-right text-[#9CA3AF]">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Expenditure Status</div>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="h-[140px] w-[140px] rounded-full border-[10px] border-[#22C55E] relative">
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#111827]">
                        68%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-[9px] text-[#6B7280]">
                    <div className="flex items-center justify-between">
                      <span>Approved</span>
                      <span>68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span>21%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rejected</span>
                      <span>11%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="text-[10px] font-semibold text-[#111827]">Recent Activities</div>
                  <div className="mt-3 space-y-3 text-[9px] text-[#6B7280]">
                    {[
                      "Requisition #REQ-2301 approved by Pastor Emmanuel",
                      "Requisition #REQ-2304 flagged for review",
                      "New request from Queens Annex submitted",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-[#3B5BDB]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
