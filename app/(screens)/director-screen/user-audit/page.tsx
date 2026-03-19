"use client"

import React from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  Filter,
  History,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"

const logs = [
  {
    id: "log-1",
    time: "Apr 12, 10:42 AM",
    user: "Rev. Ladokun",
    role: "Lead Pastor",
    action: "Budget Override",
    actionTone: "bg-amber-50 text-amber-600",
    impactLabel: "Before",
    impactValue: "$11,265,000.00",
    impactAfterLabel: "After",
    impactAfterValue: "$32,112,000.00",
    justification:
      "Emergency sound system repair required before Easter service. Board was notified via email chain but formal approval was delayed.",
  },
  {
    id: "log-2",
    time: "Apr 11, 04:15 PM",
    user: "Sarah Smith",
    role: "Treasurer",
    action: "COA Update",
    actionTone: "bg-blue-50 text-blue-600",
    impactLabel: "Added Category",
    impactValue: "6604 - Global Missions",
    impactAfterLabel: "",
    impactAfterValue: "",
    justification:
      "Board approved new mission initiative for Q3. Account created to track incoming donations.",
  },
  {
    id: "log-3",
    time: "Apr 08, 02:12 PM",
    user: "Michael Chen",
    role: "System Admin",
    action: "Role Modified",
    actionTone: "bg-slate-100 text-slate-600",
    impactLabel: "User",
    impactValue: "J. Peterson",
    impactAfterLabel: "Change",
    impactAfterValue: "Read-Only ? Editor",
    justification:
      "Promoted to Assistant Treasurer upon request of the Finance Committee.",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/users"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <section className="rounded-xl border border-[#EEF1F6] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[22.23px] leading-[26.68px] font-bold tracking-[-0.56px] text-[#111827]">User &amp; Role Management</h2>
                <p className="text-[12.4px] leading-[17.71px] font-normal text-[#6B7280] mt-1">
                  Manage system access, roles, and permissions across all global branches. Invite new
                  <br />
                  directors or configure granular access controls.
                </p>
              </div>
              <Button className="h-8 rounded-md bg-[#3B5BDB] text-[12px] font-medium text-white shadow hover:bg-blue-700">
                <Download className="h-4 w-4" /> Export Log
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-6 border-b border-[#EEF1F6] text-[12px]">
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <Users className="h-4 w-4" /> User Directory
              </button>
              <button className="flex items-center gap-2 pb-2 text-[#6B7280]">
                <ShieldCheck className="h-4 w-4" /> Permissions Matrix
              </button>
              <button className="flex items-center gap-2 border-b-2 border-[#3B5BDB] pb-2 text-[#3B5BDB] font-medium">
                <History className="h-4 w-4" /> Audit Log
              </button>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">SEARCH</div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <Input className="h-9 rounded-md border-[#E5E7EB] bg-[#F9FAFB] pl-9 text-[12px] text-[#6B7280]" placeholder="Search justification..." />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">ACTION TYPE</div>
                  <Button variant="outline" size="sm" className="h-9 w-full justify-between rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                    All Actions
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">USER / ROLE</div>
                  <Button variant="outline" size="sm" className="h-9 w-full justify-between rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                    All Users
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] font-semibold">DATE RANGE</div>
                  <Button variant="outline" size="sm" className="h-9 w-full justify-between rounded-md border-[#E5E7EB] bg-white text-[12px] text-[#6B7280]">
                    <Calendar className="h-4 w-4" /> Apr 1 - Apr 30, 2024
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#EEF1F6]">
              <table className="w-full text-[12px]">
                <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                  <tr>
                    <th className="py-3 px-4 text-left">TIMESTAMP</th>
                    <th className="py-3 px-4 text-left">USER</th>
                    <th className="py-3 px-4 text-left">ACTION TYPE</th>
                    <th className="py-3 px-4 text-left">IMPACT (DIFF)</th>
                    <th className="py-3 px-4 text-left">JUSTIFICATION</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-[#EEF1F6] align-top">
                      <td className="py-4 px-4 text-[#6B7280]">{log.time}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#EEF2FF]" />
                          <div>
                            <div className="text-[12px] font-semibold text-[#111827]">{log.user}</div>
                            <div className="text-[11px] text-[#9CA3AF]">{log.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] ${log.actionTone}`}>{log.action}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-[10px] text-[#9CA3AF]">{log.impactLabel}</div>
                        <div className="text-[12px] text-rose-600">{log.impactValue}</div>
                        {log.impactAfterLabel ? (
                          <div className="mt-1 space-y-1">
                            <div className="text-[10px] text-[#9CA3AF]">{log.impactAfterLabel}</div>
                            <div className="text-[12px] text-emerald-600">{log.impactAfterValue}</div>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4 px-4 text-[#6B7280]">“{log.justification}”</td>
                      <td className="py-4 px-4 text-right text-[#9CA3AF]">
                        <Eye className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[11px] text-[#9CA3AF]">
                <div>Showing 1-5 of 45 branches</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]">Previous</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-md border-[#E5E7EB] bg-white text-[10px] text-[#6B7280]">Next</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
