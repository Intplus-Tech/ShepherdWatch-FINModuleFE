"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import { HrPanelState, HrTableState } from "@/components/hr/HrDataState"
import { useEmployee } from "@/components/hooks/hr/useHrEmployees"
import { useAttendanceLogs } from "@/components/hooks/hr/useHrAttendance"
import { useLeaveBalances } from "@/components/hooks/hr/useHrLeave"
import { useLoans } from "@/components/hooks/hr/useHrLoans"
import { useTrainingEvents } from "@/components/hooks/hr/useHrTraining"
import {
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_LABELS,
  EMPLOYMENT_STATUS_BADGES,
  EMPLOYMENT_STATUS_LABELS,
  badgeFor,
  branchName,
  clockTime,
  deref,
  initials,
  loanBalance,
  lookup,
  userName,
} from "@/lib/hr/normalize"
import { formatCurrency, formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"
import { Search, Bell, Menu, ChevronLeft, Info, Package, ArrowRight } from "lucide-react"

const LEAVE_BAR_COLORS = ["bg-[#2563EB]", "bg-amber-500", "bg-violet-500", "bg-emerald-500"]

function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("id")

  const employeeQuery = useEmployee(employeeId)
  const employee = employeeQuery.data

  const attendance = useAttendanceLogs({
    employeeId: employeeId ?? undefined,
    limit: 8,
    enabled: Boolean(employeeId),
  })
  const loans = useLoans({
    employeeId: employeeId ?? undefined,
    limit: 50,
    enabled: Boolean(employeeId),
  })
  const balances = useLeaveBalances(employeeId)

  /**
   * There is no "trainings for one employee" endpoint, so this shows the
   * branch's upcoming schedule rather than a per-person enrolment history.
   */
  const trainings = useTrainingEvents({ limit: 3 })

  const outstanding = useMemo(
    () =>
      (loans.data?.items ?? [])
        .filter((loan) => loan.status === "active" || loan.status === "approved")
        .reduce((sum, loan) => sum + loanBalance(loan), 0),
    [loans.data],
  )

  const name = employee ? userName(employee.userId, employee.employeeId) : ""
  const email = employee ? (deref(employee.userId)?.email ?? "—") : "—"

  const coreDetails = employee
    ? [
        { label: "Date Hired", value: formatDate(employee.hireDate, "long") },
        { label: "Work Email", value: email },
        { label: "Phone Number", value: employee.phone || "—" },
        { label: "Branch Assignment", value: branchName(employee.branchId) },
        { label: "Department", value: employee.department || "—" },
        {
          label: "Profile Completeness",
          value:
            employee.profileIntegrityScore != null
              ? `${employee.profileIntegrityScore}%`
              : "—",
        },
      ]
    : []

  const leaveRows = balances.data?.balances ?? []

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full">
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <BranchAdminSidebar
        activeHref="/branch-admin/hr/employee-directory"
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
            <div className="text-[15px] font-bold text-[#111827]">Dashboard</div>
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
          {/* Top actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4B5563] hover:text-[#111827]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            {employee && (
              <button
                onClick={() => router.push(`/branch-admin/hr/exit-clearance?employeeId=${employee._id}`)}
                className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                Start Exit Clearance
              </button>
            )}
          </div>

          {!employeeId ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No employee selected"
              emptyDescription="Open a profile from the Employee Directory."
              className="mt-5"
            />
          ) : employeeQuery.isLoading || employeeQuery.error || !employee ? (
            <HrPanelState
              isLoading={employeeQuery.isLoading}
              error={employeeQuery.error}
              isEmpty={!employee}
              emptyTitle="Employee not found"
              onRetry={() => employeeQuery.refetch()}
              className="mt-5"
            />
          ) : (
            <>
              {/* Header card */}
              <div className="mt-5 rounded-xl border border-[#EEF1F6] bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[20px] font-bold text-[#2563EB]">
                    {initials(name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-[26px] font-bold text-[#111827]">{name}</h1>
                      <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB]">
                        ID: {employee.employeeId}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold",
                          badgeFor(EMPLOYMENT_STATUS_BADGES, employee.employmentStatus),
                        )}
                      >
                        {lookup(EMPLOYMENT_STATUS_LABELS, employee.employmentStatus)}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] text-[#6B7280]">
                      {employee.jobTitle}
                      {employee.department ? ` • ${employee.department}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left column */}
                <div className="flex flex-col gap-5 lg:col-span-2">
                  {/* Core Details */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-[#2563EB]" />
                      <h2 className="text-[16px] font-bold text-[#111827]">Core Details</h2>
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
                  <div className="overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
                    <div className="flex items-center justify-between p-5">
                      <h2 className="text-[16px] font-bold text-[#111827]">
                        Attendance History
                      </h2>
                      <button
                        onClick={() => router.push("/branch-admin/hr/attendance")}
                        className="text-[13px] font-semibold text-[#2563EB]"
                      >
                        View Full Log
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] border-collapse">
                        <thead>
                          <tr className="bg-[#EEF2FF]">
                            {["Date", "Clock In", "Clock Out", "Status"].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3F4F6]">
                          <HrTableState
                            colSpan={4}
                            isLoading={attendance.isLoading}
                            error={attendance.error}
                            isEmpty={(attendance.data?.items.length ?? 0) === 0}
                            emptyTitle="No attendance records"
                            onRetry={() => attendance.refetch()}
                          />

                          {!attendance.isLoading &&
                            !attendance.error &&
                            attendance.data?.items.map((log) => (
                              <tr key={log._id} className="hover:bg-[#F9FAFB]">
                                <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                                  {formatDate(log.date, "medium")}
                                </td>
                                <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                  {clockTime(log.clockIn)}
                                </td>
                                <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                  {clockTime(log.clockOut)}
                                </td>
                                <td className="px-4 py-4 text-[13px]">
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                                      badgeFor(ATTENDANCE_STATUS_BADGES, log.status),
                                    )}
                                  >
                                    {lookup(ATTENDANCE_STATUS_LABELS, log.status)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-5 lg:col-span-1">
                  {/* Active Loans */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Active Loans
                    </h2>
                    <div className="mt-2 text-[24px] font-bold text-[#111827]">
                      {loans.isLoading ? "—" : formatCurrency(outstanding)}
                    </div>
                    <div className="text-[13px] text-[#6B7280]">Outstanding Balance</div>
                    <button
                      onClick={() => router.push("/branch-admin/hr/employee-loans")}
                      className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB]"
                    >
                      View All Loan Schedules
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Assigned Assets */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h2 className="text-[16px] font-bold text-[#111827]">Assigned Assets</h2>
                    {(employee.assets?.length ?? 0) === 0 ? (
                      <HrPanelState
                        isLoading={false}
                        error={null}
                        isEmpty
                        emptyTitle="No assets assigned"
                        className="mt-4 border-0 p-4"
                      />
                    ) : (
                      <div className="mt-4 space-y-3">
                        {employee.assets?.map((asset, index) => (
                          <div key={`${asset.name}-${index}`} className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-[#111827]">
                                {asset.name}
                              </div>
                              <div className="text-[12px] text-[#9CA3AF]">
                                {asset.serialNumber
                                  ? `S/N: ${asset.serialNumber}`
                                  : (asset.status ?? "Assigned")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upcoming Training */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h2 className="text-[16px] font-bold text-[#111827]">Upcoming Training</h2>
                    {trainings.isLoading ||
                    trainings.error ||
                    (trainings.data?.items.length ?? 0) === 0 ? (
                      <HrPanelState
                        isLoading={trainings.isLoading}
                        error={trainings.error}
                        isEmpty={(trainings.data?.items.length ?? 0) === 0}
                        emptyTitle="Nothing scheduled"
                        onRetry={() => trainings.refetch()}
                        className="mt-4 border-0 p-4"
                      />
                    ) : (
                      <div className="mt-4 space-y-3">
                        {trainings.data?.items.map((event) => (
                          <div key={event._id}>
                            <div className="text-[13px] font-semibold text-[#111827]">
                              {event.title}
                            </div>
                            <div className="text-[12px] font-medium text-amber-600">
                              Scheduled: {formatDate(event.startDate, "medium")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Leave */}
                  <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    <h2 className="text-[16px] font-bold text-[#111827]">Leave</h2>
                    {balances.isLoading || balances.error || leaveRows.length === 0 ? (
                      <HrPanelState
                        isLoading={balances.isLoading}
                        error={balances.error}
                        isEmpty={leaveRows.length === 0}
                        emptyTitle="No leave types configured"
                        onRetry={() => balances.refetch()}
                        className="mt-4 border-0 p-4"
                      />
                    ) : (
                      <div className="mt-4 space-y-4">
                        {leaveRows.map((row, index) => (
                          <div key={row.leaveTypeId}>
                            <div className="flex items-center justify-between text-[13px]">
                              <span className="font-semibold text-[#111827]">{row.name}</span>
                              <span className="text-[#6B7280]">
                                {row.used} / {row.entitlement} Days
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 rounded-full bg-[#EEF1F6]">
                              <div
                                className={cn(
                                  "h-2 rounded-full",
                                  LEAVE_BAR_COLORS[index % LEAVE_BAR_COLORS.length],
                                )}
                                style={{
                                  width: `${
                                    row.entitlement > 0
                                      ? Math.min(100, (row.used / row.entitlement) * 100)
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default withSuspense(Page)
