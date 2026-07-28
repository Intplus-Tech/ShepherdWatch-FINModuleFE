"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Menu,
  Search,
  Bell,
  User,
  ArrowLeftRight,
  Check,
  Wallet,
  Boxes,
  ShieldCheck,
  Eye,
} from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { cn } from "@/lib/utils"

type SeparationStatus = "Awaiting Assets" | "Completed"

type Separation = {
  id: string
  name: string
  staffId: string
  initials: string
  department: string
  exitDate: string
  status: SeparationStatus
}

const SEPARATIONS: Separation[] = [
  {
    id: "robert-mensah",
    name: "Robert Mensah",
    staffId: "SW-8821",
    initials: "RM",
    department: "Protocol",
    exitDate: "Oct 24, 2023",
    status: "Awaiting Assets",
  },
  {
    id: "anita-lowman",
    name: "Anita Lowman",
    staffId: "SW-7239",
    initials: "AL",
    department: "Choir Administration",
    exitDate: "Oct 15, 2023",
    status: "Completed",
  },
]

const EMPLOYEE_OPTIONS = [
  "Robert Mensah",
  "Anita Lowman",
  "Ariel Mwangi",
  "David Wilson",
]

const REASON_OPTIONS = [
  "Resignation",
  "End of Contract",
  "Retirement",
  "Termination",
  "Transfer",
]

const WORKFLOW_ITEMS = [
  {
    icon: Wallet,
    title: "Finance & Payroll",
    desc: "Settlement of final dues and benefits.",
  },
  {
    icon: Boxes,
    title: "Asset Management",
    desc: "Verification of returned property and access keys.",
  },
  {
    icon: ShieldCheck,
    title: "HR Compliance",
    desc: "Update of directory records and exit interview scheduling.",
  },
]

function StatusPill({ status }: { status: SeparationStatus }) {
  const isAwaiting = status === "Awaiting Assets"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        isAwaiting
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isAwaiting ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      {status}
    </span>
  )
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [employee, setEmployee] = useState("")
  const [exitDate, setExitDate] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const router = useRouter()

  const resetForm = () => {
    setEmployee("")
    setExitDate("")
    setReason("")
    setNotes("")
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/exit-clearance"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full relative min-h-[100dvh]">
        {/* Header */}
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-[#4B5563] hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-[15px] font-bold text-[#111827]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[240px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
              />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EEF1F6] bg-white text-[#6B7280] hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-[26px] font-bold text-[#111827]">
              Initiate Exit Clearance
            </h1>
            <p className="mt-1 max-w-3xl text-[13px] text-[#6B7280]">
              Start the multi-departmental clearance process for a departing staff
              member. This action formalizes the separation and triggers internal
              workflows across all relevant operational units.
            </p>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: form card */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
                <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
                <div className="p-6">
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Separation Details
                  </h2>

                  {/* Select employee */}
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Select Employee
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                      <select
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3.5 py-2.5 text-[13px] text-[#111827]"
                      >
                        <option value="">Search from branch directory...</option>
                        {EMPLOYEE_OPTIONS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Exit date + reason */}
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Exit Date (Last Working Day)
                      </label>
                      <input
                        type="date"
                        value={exitDate}
                        onChange={(e) => setExitDate(e.target.value)}
                        className="rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Reason for Exit
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] text-[#111827]"
                      >
                        <option value="">Select reason...</option>
                        {REASON_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Additional Administrative Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Enter any specific instructions or context regarding this clearance process..."
                      className="resize-none rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Initiate Clearance Process
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-md border border-[#E5E7EB] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: black automated workflow card */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-[#111827] p-5 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <ArrowLeftRight className="h-4.5 w-4.5 text-white" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold">Automated Workflow</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                  Initiating this process will automatically trigger real-time
                  notifications and task assignments to the following departments:
                </p>

                <div className="mt-5 space-y-4">
                  {WORKFLOW_ITEMS.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 text-[13px] font-bold text-white">
                            <Icon className="h-4 w-4 text-white/70" />
                            {item.title}
                          </div>
                          <p className="mt-0.5 text-[12px] text-white/50">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Separations */}
          <div className="mt-6 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-5">
              <h2 className="text-[16px] font-bold text-[#111827]">
                Recent Separations
              </h2>
              <button
                type="button"
                className="text-[13px] font-semibold text-[#2563EB] hover:underline"
              >
                View full history →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#EEF2FF]">
                  <tr>
                    {[
                      "Staff Member",
                      "Department",
                      "Exit Date",
                      "Status",
                      "Action",
                    ].map((h) => (
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
                  {SEPARATIONS.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[12px] font-bold text-[#2563EB]">
                            {s.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827]">
                              {s.name}
                            </span>
                            <span className="text-[12px] text-[#9CA3AF]">
                              ID: {s.staffId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {s.department}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {s.exitDate}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <StatusPill status={s.status} />
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <button
                          type="button"
                          aria-label={`View ${s.name}`}
                          onClick={() =>
                            router.push("/branch-admin/hr/admin-clearance")
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
  )
}
