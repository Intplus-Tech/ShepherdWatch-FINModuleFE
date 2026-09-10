"use client"

import { useMemo, useState } from "react"
import { Search, Bell, GraduationCap, Users, Wallet } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { HrStatValue, HrTableState } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useTrainingBudgetOverview,
  useTrainingEvents,
  useTrainingMetrics,
} from "@/components/hooks/hr/useHrTraining"
import { branchName } from "@/lib/hr/normalize"
import { downloadCsv, rowsToCsv, todayStamp } from "@/lib/export-csv"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

/**
 * Finance's view of training.
 *
 * Budget approval is the director's action, so this screen reports spend and
 * the pipeline of paid sessions rather than offering an approve button.
 */
export default function Page() {
  const [page, setPage] = useState(1)

  const metrics = useTrainingMetrics()
  const budget = useTrainingBudgetOverview()
  const events = useTrainingEvents({ page, limit: PAGE_SIZE })

  const rows = useMemo(() => events.data?.items ?? [], [events.data])

  const pendingBudget = useMemo(
    () =>
      rows
        .filter((event) => event.isPaid && !event.budgetApproved)
        .reduce((sum, event) => sum + (event.budgetRequested ?? 0), 0),
    [rows],
  )

  function handleExport() {
    const csv = rowsToCsv(
      rows.map((event) => ({
        Title: event.title,
        Trainer: event.trainerName,
        Scope: event.isGlobal ? "All branches" : branchName(event.branchId),
        Start: formatDate(event.startDate, "iso"),
        End: formatDate(event.endDate, "iso"),
        Paid: event.isPaid ? "Yes" : "No",
        "Budget Requested": event.budgetRequested ?? 0,
        "Budget Approved": event.budgetApproved ? "Yes" : "No",
      })),
    )
    downloadCsv(`training-budget-${todayStamp()}.csv`, csv)
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/hr/training-management" />
      <main className="flex-1 p-6 lg:p-8 bg-[#F8FAFC] min-w-0">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#111827]">Dashboard</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[34px] w-[220px] rounded-full border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px]"
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
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827]">Training Budget</h1>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              Training spend and the sessions awaiting budget approval.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="rounded-md bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export
          </button>
        </div>

        {/* Budget cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Annual Allocation
                </p>
                <p className="mt-2 text-[24px] font-bold text-[#111827]">
                  {budget.isLoading
                    ? "—"
                    : formatCurrency(budget.data?.annualAllocation ?? 0, {
                        maximumFractionDigits: 0,
                      })}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Approved Spend
            </p>
            <p className="mt-2 text-[24px] font-bold text-rose-600">
              {budget.isLoading
                ? "—"
                : formatCurrency(budget.data?.totalSpent ?? 0, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Available Balance
            </p>
            <p className="mt-2 text-[24px] font-bold text-emerald-600">
              {budget.isLoading
                ? "—"
                : formatCurrency(budget.data?.availableBalance ?? 0, {
                    maximumFractionDigits: 0,
                  })}
            </p>
          </div>
        </div>

        {/* Session stats */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Total Sessions
                </p>
                <p className="mt-2 text-[24px] font-bold text-[#111827]">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={metrics.data?.totalSessions ?? 0}
                  />
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#3B5BDB]">
                <GraduationCap className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Staff Enrolled
                </p>
                <p className="mt-2 text-[24px] font-bold text-[#111827]">
                  <HrStatValue
                    isLoading={metrics.isLoading}
                    error={metrics.error}
                    value={metrics.data?.staffEnrolled ?? 0}
                  />
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Awaiting Budget Approval (This Page)
            </p>
            <p className="mt-2 text-[24px] font-bold text-amber-600">
              {events.isLoading
                ? "—"
                : formatCurrency(pendingBudget, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#EEF2FF]">
                <tr>
                  {["Training", "Trainer", "Dates", "Budget Requested", "Budget Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                <HrTableState
                  colSpan={5}
                  isLoading={events.isLoading}
                  error={events.error}
                  isEmpty={rows.length === 0}
                  emptyTitle="No training scheduled"
                  emptyDescription="Sessions created by the branch appear here."
                  onRetry={() => events.refetch()}
                />

                {!events.isLoading &&
                  !events.error &&
                  rows.map((event) => (
                    <tr key={event._id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-4 text-[13px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111827]">{event.title}</span>
                          <span className="text-[12px] text-[#9CA3AF]">
                            {event.isGlobal ? "All branches" : branchName(event.branchId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {event.trainerName}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {formatDate(event.startDate, "medium")}
                      </td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                        {formatCurrency(event.budgetRequested ?? 0, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="px-4 py-4 text-[13px]">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold",
                            !event.isPaid
                              ? "bg-[#F3F4F6] text-[#4B5563]"
                              : event.budgetApproved
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700",
                          )}
                        >
                          {!event.isPaid
                            ? "Free"
                            : event.budgetApproved
                              ? "Approved"
                              : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <HrPagination
            pagination={events.data?.pagination}
            page={page}
            onPageChange={setPage}
            itemCount={rows.length}
            noun="sessions"
          />
        </div>
      </main>
    </div>
  )
}
