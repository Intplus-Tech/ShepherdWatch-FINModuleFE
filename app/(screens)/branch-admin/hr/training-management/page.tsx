"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  Menu,
  GraduationCap,
  Users,
  CalendarClock,
  Calendar,
  Plus,
  ArrowUpRight,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminCreateTrainingModal from "@/components/hr/BranchAdminCreateTrainingModal"
import BranchAdminRegisterStaffModal from "@/components/hr/BranchAdminRegisterStaffModal"
import BranchAdminTrainingCalendarModal from "@/components/hr/BranchAdminTrainingCalendarModal"
import { cn } from "@/lib/utils"

type TrainingStatus = "Certified" | "Pending"

type RegistryRow = {
  name: string
  title: string
  status: TrainingStatus
  date: string
}

type UpcomingSession = {
  date: string
  time: string
  title: string
  variant: "dark" | "outline"
}

const REGISTRY: RegistryRow[] = [
  { name: "Sarah Jenkins", title: "Child Safety Protocol", status: "Certified", date: "Oct 12, 2023" },
  { name: "Marcus Chen", title: "Financial Ethics", status: "Certified", date: "Nov 04, 2023" },
  { name: "Elizabeth Thorne", title: "Pastoral Care Fundamentals", status: "Pending", date: "Dec 20, 2023" },
  { name: "David Miller", title: "Crisis Management", status: "Certified", date: "Sep 28, 2023" },
]

const UPCOMING: UpcomingSession[] = [
  { date: "NOV 15, 2023", time: "09:00 AM", title: "Stewardship Leadership", variant: "dark" },
  { date: "NOV 18, 2023", time: "02:30 PM", title: "Cybersecurity & PII", variant: "outline" },
]

const cardCls = "rounded-xl border border-[#EEF1F6] bg-white p-5"
const statLabelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function StatusBadge({ status }: { status: TrainingStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold",
        status === "Certified"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {status}
    </span>
  )
}

export default function Page() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/training-management"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[15px] font-bold text-[#111827]">Training</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Total Sessions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">24</p>
                  <p className="mt-1 text-[12px] font-semibold text-emerald-600">
                    ↗ +12% vs last month
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#2563EB]">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Staff Enrolled</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">142</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#6B7280]">
                    94% active participation
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={statLabelCls}>Pending Completions</p>
                  <p className="mt-2 text-[28px] font-bold text-[#111827]">18</p>
                  <p className="mt-1 text-[12px] font-semibold text-rose-600">
                    5 expiring this week
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CalendarClock className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Training Registry */}
            <div className={cn(cardCls, "lg:col-span-2 p-0 overflow-hidden")}>
              <div className="flex items-center justify-between p-5 pb-4">
                <h2 className="text-[16px] font-bold text-[#111827]">Training Registry</h2>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2563EB] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Training
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#EEF2FF]">
                    <tr>
                      {["Staff Member", "Training Title", "Status", "Date"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {REGISTRY.map((row) => (
                      <tr
                        key={row.name}
                        onClick={() => router.push("/branch-admin/hr/training-oversight")}
                        className="cursor-pointer hover:bg-[#FAFBFF]"
                      >
                        <td className="px-4 py-3 text-[13px]">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#2563EB]">
                              {initials(row.name)}
                            </span>
                            <span className="font-semibold text-[#111827]">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">{row.title}</td>
                        <td className="px-4 py-3 text-[13px]">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#6B7280]">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Upcoming Sessions */}
            <div className={cn(cardCls, "lg:col-span-1")}>
              <div className="flex items-center gap-2">
                <Calendar className="h-[18px] w-[18px] text-[#2563EB]" />
                <h2 className="text-[16px] font-bold text-[#111827]">Upcoming Sessions</h2>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {UPCOMING.map((session) => (
                  <div
                    key={session.title}
                    className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      <span>{session.date}</span>
                      <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                      <span>{session.time}</span>
                    </div>
                    <p className="mt-2 text-[15px] font-bold text-[#111827]">{session.title}</p>
                    <button
                      type="button"
                      onClick={() => setRegisterOpen(true)}
                      className={cn(
                        "mt-3 w-full rounded-md px-4 py-2 text-[12px] font-semibold",
                        session.variant === "dark"
                          ? "bg-[#111827] text-white"
                          : "border border-[#E5E7EB] bg-white text-[#4B5563]"
                      )}
                    >
                      REGISTER STAFF
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                VIEW FULL CALENDAR
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      <BranchAdminCreateTrainingModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BranchAdminRegisterStaffModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <BranchAdminTrainingCalendarModal open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </div>
  )
}
