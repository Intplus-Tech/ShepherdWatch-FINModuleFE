"use client"

import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import BranchAccountantHeader from "@/components/navigation/BranchAccountantHeader"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wrench,
} from "lucide-react"

const urgentAlerts = [
  {
    title: "Diesel Generator 500kVA",
    meta: "Last serviced: 2 weeks ago",
    status: "Action Required",
  },
  {
    title: "Fire Extinguishers (Hall A)",
    meta: "Due in 7 days",
    status: "Action Required",
  },
]

const calendarDays = [
  { label: "Mon 15", events: ["Sound Check"] },
  { label: "Tue 16", events: ["Backup Test"] },
  { label: "Wed 17", events: ["Safety Drill"] },
  { label: "Thu 18", events: ["Projector Swap"] },
  { label: "Fri 19", events: ["Lighting Fix"] },
  { label: "Sat 20", events: ["Weekly Cleanup"] },
]

const completed = [
  {
    date: "Jan 10, 2024",
    asset: "Toyota Coaster Bus (LAG-012)",
    type: "Engine Service & Oil Change",
    technician: "Bob Afolayan",
    cost: "?150,000",
    status: "Verified",
  },
  {
    date: "Jan 11, 2024",
    asset: "Sanctuary Sound Mixer",
    type: "Fader Replacement (Fader 4)",
    technician: "Tunde Electronics",
    cost: "?50,000",
    status: "Verified",
  },
  {
    date: "Jan 12, 2024",
    asset: "Broadcast Camera",
    type: "Seal & Gasket Replacement",
    technician: "Grace Chapel AV Team",
    cost: "?25,000",
    status: "Verified",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <BranchAccountantSidebar activeHref="/branchaccount-pastor/maintenance" />

          <main className="flex-1 p-6 lg:p-7 bg-[#F7F8FC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] text-[#9CA3AF]">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-[#6B7280]" />
              </div>
            </div>

            <div className="mt-3">
              <h1 className="text-[14px] font-semibold text-[#111827]">Maintenance Management Hub</h1>
              <p className="text-[9px] text-[#9CA3AF]">Oversee asset upkeep and service schedules for the branch.</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_2fr]">
              <div className="space-y-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    Urgent Alerts
                  </div>
                  <div className="mt-3 space-y-2">
                    {urgentAlerts.map((item) => (
                      <div key={item.title} className="rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-[9px] text-rose-600">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-[8px] text-[#9CA3AF]">{item.meta}</div>
                        <div className="mt-1 text-[8px] font-semibold">{item.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-4 text-[9px] text-[#1E3A8A]">
                  <div className="flex items-center gap-2 font-semibold">
                    <Wrench className="h-4 w-4" />
                    Maintenance Tip
                  </div>
                  <p className="mt-2 text-[#6B7280]">
                    Proactive maintenance can reduce overhead costs and extend asset life cycles.
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-[#111827]">January 2024 Schedule</div>
                  <div className="flex items-center gap-2 text-[8px] text-[#6B7280]">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Overdue</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Scheduled</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[8px] text-[#6B7280]">
                  <button className="h-6 w-6 rounded-full border border-[#E5E7EB] flex items-center justify-center">
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <div className="font-medium">Week 3 (Jan 15 - Jan 21)</div>
                  <button className="h-6 w-6 rounded-full border border-[#E5E7EB] flex items-center justify-center">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-6 gap-2 text-[8px]">
                  {calendarDays.map((day) => (
                    <div key={day.label} className="rounded-[8px] border border-[#EEF1F6] bg-[#F9FAFB] p-2">
                      <div className="text-[#9CA3AF]">{day.label}</div>
                      {day.events.map((event) => (
                        <div key={event} className="mt-2 rounded-[6px] bg-[#E9EEFF] px-1.5 py-1 text-[7px] text-[#3B5BDB]">
                          {event}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[#111827]">Completed Maintenance (Jan 5 - 20)</div>
                <button className="text-[9px] text-[#3B5BDB]">View All History</button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead className="text-[#9CA3AF]">
                    <tr>
                      <th className="py-2 text-left">DATE</th>
                      <th className="py-2 text-left">ASSET</th>
                      <th className="py-2 text-left">SERVICE TYPE</th>
                      <th className="py-2 text-left">TECHNICIAN / PROVIDER</th>
                      <th className="py-2 text-left">COST (?)</th>
                      <th className="py-2 text-left">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((row) => (
                      <tr key={row.asset} className="border-t border-[#EEF1F6]">
                        <td className="py-2 text-[#6B7280]">{row.date}</td>
                        <td className="py-2 font-medium text-[#111827]">{row.asset}</td>
                        <td className="py-2 text-[#6B7280]">{row.type}</td>
                        <td className="py-2 text-[#6B7280]">{row.technician}</td>
                        <td className="py-2 text-[#111827]">{row.cost}</td>
                        <td className="py-2">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] text-emerald-600">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-right text-[9px] text-[#6B7280]">Total Maintenance Cost: <span className="font-semibold text-[#111827]">?100,500.00</span></div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
