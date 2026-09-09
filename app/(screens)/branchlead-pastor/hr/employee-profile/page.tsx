"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { useHrEmployee } from "@/components/hooks/useHrEmployees"
import { useHrAttendance } from "@/components/hooks/useHrAttendance"
import { useHrLoans } from "@/components/hooks/useHrLoans"
import { useHrLeaves } from "@/components/hooks/useHrLeaves"
import { useHrTrainings } from "@/components/hooks/useHrTrainings"
import { useHrDocuments } from "@/components/hooks/useHrDocuments"
import {
  DOCUMENT_TYPE_LABELS,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_STYLES,
  formatDate,
  formatNaira,
  formatShortDate,
  formatTime,
  initials,
  statusLabel,
  statusStyle,
} from "@/lib/hr/display"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  ChevronLeft,
  UserPlus,
  Info,
  IdCard,
  ArrowRight,
} from "lucide-react"

const CARD =
  "rounded-[14px] border border-[#EEF1F6] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.02)]"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EmployeeProfileScreen />
    </Suspense>
  )
}

function EmployeeProfileScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("employeeId") ?? ""

  const { employee, loading, error } = useHrEmployee(employeeId)
  const { logs } = useHrAttendance({ employeeId, limit: 8 })
  const { loans } = useHrLoans({ employeeId, status: "active", limit: 20 })
  const { leaves } = useHrLeaves({ employeeId, limit: 10 })
  const { trainings } = useHrTrainings({ limit: 50 })
  const { documents } = useHrDocuments(employeeId)

  const outstandingLoan = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.remainingBalance, 0),
    [loans]
  )

  const employeeTraining = useMemo(
    () =>
      trainings
        .filter((training) =>
          training.participants.some((participant) => participant.employeeId === employeeId)
        )
        .slice(0, 4),
    [trainings, employeeId]
  )

  const coreDetails = [
    { label: "Date Hired", value: formatDate(employee?.hireDate ?? "") },
    { label: "Work Email", value: employee?.email || "—" },
    { label: "Phone Number", value: employee?.phone || "—" },
    { label: "Branch Assignment", value: employee?.branchName || "—" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] font-sans text-[#111827]">
      <BranchLeadPastorSidebar />
      <main className="flex-1 px-8 pt-3 pb-6">
        <div className="flex items-center justify-between border-b border-[#EEF1F6] h-[42.67px]">
          <span className="text-[13px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                placeholder="Search requisitions..."
                className="h-9 w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[12px]"
              />
            </div>
            <button className="text-[#6B7280]">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-6">
          {/* Top actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => router.push("/branchlead-pastor/hr/exit-clearance")}
              className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-rose-700"
            >
              <UserPlus className="h-4 w-4" />
              Initiate Exit Clearance
            </button>
          </div>

          {/* Header card */}
          <div className={cn(CARD, "mt-5 p-6")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[20px] font-bold text-[#3B5BDB]">
                  {initials(employee?.name ?? "")}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[26px] font-bold text-[#111827]">
                      {employee?.name || (loading ? "Loading…" : "Employee Profile")}
                    </h1>
                    {employee?.employeeCode ? (
                      <span className="rounded-full bg-[#EFF2FF] px-2.5 py-1 text-[10px] font-bold text-[#3B5BDB]">
                        ID: {employee.employeeCode}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    {employee
                      ? [employee.jobTitle, employee.department].filter(Boolean).join(" • ") || "—"
                      : error || (employeeId ? "" : "Open a staff member from the directory")}
                  </p>
                </div>
              </div>
            </div>

          {/* Grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* Core Details */}
              <div className={cn(CARD, "p-5")}>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#2563EB]" />
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Core Details
                  </h2>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {coreDetails.map((d) => (
                    <div key={d.label}>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        {d.label}
                      </div>
                      <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance History */}
              <div className={cn(CARD, "overflow-hidden")}>
                <div className="flex items-center justify-between p-5">
                  <h2 className="text-[16px] font-bold text-[#111827]">
                    Attendance History
                  </h2>
                  <button
                    onClick={() =>
                      router.push(`/branchlead-pastor/hr/attendance?employeeId=${employeeId}`)
                    }
                    className="text-[13px] font-semibold text-[#2563EB]"
                  >
                    View Full Log
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                      <tr className="bg-[#EFF2FF]">
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Clock In
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Clock Out
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {logs.map((a) => (
                        <tr key={a.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                            {formatDate(a.date)}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatTime(a.clockIn)}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                            {formatTime(a.clockOut)}
                          </td>
                          <td className="px-4 py-4 text-[13px]">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                a.status === "present"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : a.status === "late"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {a.status === "present" ? "On Time" : a.status === "late" ? "Late" : a.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#9CA3AF]">
                            No attendance recorded for this staff member.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Active Loans */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Active Loans
                </h2>
                <div className="mt-2 text-[24px] font-bold text-[#111827]">
                  {formatNaira(outstandingLoan)}
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Outstanding Balance
                </div>
                <button
                  onClick={() => router.push("/branchlead-pastor/hr/employee-loans")}
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB]"
                >
                  View All Loan Schedules
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Assigned Assets */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Personnel Documents
                </h2>
                <div className="mt-4 space-y-3">
                  {documents.slice(0, 5).map((document) => (
                    <div key={document.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                        <IdCard className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-[#111827]">
                          {document.title}
                        </div>
                        <div className="text-[12px] text-[#9CA3AF]">
                          {statusLabel(DOCUMENT_TYPE_LABELS, document.documentType)} ·{" "}
                          {document.verificationStatus}
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 ? (
                    <p className="text-[12px] text-[#9CA3AF]">
                      No documents have been filed for this staff member.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Recent Training */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Recent Training
                </h2>
                <div className="mt-4 space-y-3">
                  {employeeTraining.map((training) => {
                    const record = training.participants.find(
                      (participant) => participant.employeeId === employeeId
                    )
                    const certified = record?.status === "certified"
                    return (
                      <div key={training.id}>
                        <div className="text-[13px] font-semibold text-[#111827]">
                          {training.title}
                        </div>
                        <div
                          className={cn(
                            "text-[12px] font-medium",
                            certified ? "text-emerald-600" : "text-amber-600"
                          )}
                        >
                          {certified ? "Certified" : "Scheduled"}: {formatDate(training.startDate)}
                        </div>
                      </div>
                    )
                  })}

                  {employeeTraining.length === 0 ? (
                    <p className="text-[12px] text-[#9CA3AF]">No training enrolments yet.</p>
                  ) : null}
                </div>
              </div>

              {/* Leave */}
              <div className={cn(CARD, "p-5")}>
                <h2 className="text-[16px] font-bold text-[#111827]">Leave</h2>
                <div className="mt-4 space-y-4">
                  {leaves.slice(0, 5).map((leave) => (
                    <div key={leave.id}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-[#111827]">
                          {leave.leaveTypeName || "Leave"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold",
                            statusStyle(LEAVE_STATUS_STYLES, leave.status)
                          )}
                        >
                          {statusLabel(LEAVE_STATUS_LABELS, leave.status)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-[#6B7280]">
                        {formatShortDate(leave.startDate)} – {formatShortDate(leave.endDate)} ·{" "}
                        {leave.totalDays} day{leave.totalDays === 1 ? "" : "s"}
                      </div>
                    </div>
                  ))}

                  {leaves.length === 0 ? (
                    <p className="text-[12px] text-[#9CA3AF]">No leave requests on record.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
