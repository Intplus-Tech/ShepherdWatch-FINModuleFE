"use client"

import { useMemo, useState } from "react"
import { Banknote, Loader2, MapPin, Monitor, Plus, Wallet } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import CreateTrainingEventModal from "@/components/hr/CreateTrainingEventModal"
import TrainingAllocationModal from "@/components/hr/TrainingAllocationModal"
import { HrPanelState, hrErrorMessage } from "@/components/hr/HrDataState"
import { HrPagination } from "@/components/hr/HrPagination"
import {
  useApproveTrainingBudget,
  useTrainingBudgetOverview,
  useTrainingEvents,
} from "@/components/hooks/hr/useHrTraining"
import { branchName } from "@/lib/hr/normalize"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [allocationOpen, setAllocationOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const events = useTrainingEvents({ page, limit: PAGE_SIZE })
  const budget = useTrainingBudgetOverview()
  const approveBudget = useApproveTrainingBudget()

  const items = useMemo(() => events.data?.items ?? [], [events.data])

  /** Approved spend grouped by the branch that owns each event. */
  const branchSpend = useMemo(() => {
    const totals = new Map<string, number>()
    for (const event of items) {
      if (!event.budgetApproved) continue
      const label = event.isGlobal ? "Virtual / Global" : branchName(event.branchId)
      totals.set(label, (totals.get(label) ?? 0) + (event.budgetRequested ?? 0))
    }
    const rows = [...totals.entries()].map(([label, amount]) => ({ label, amount }))
    const max = Math.max(1, ...rows.map((row) => row.amount))
    return rows
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({ ...row, percent: Math.round((row.amount / max) * 100) }))
  }, [items])

  const spendShare =
    budget.data && budget.data.annualAllocation > 0
      ? Math.min(100, (budget.data.totalSpent / budget.data.annualAllocation) * 100)
      : 0

  async function handleApprove(id: string) {
    setActionError(null)
    setApprovingId(id)
    try {
      await approveBudget.mutateAsync({ id })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/training-management"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />
      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] font-bold text-[#111827]">Training</h1>
              <p className="text-[13px] text-[#3B5BDB] font-medium mt-2">
                Schedule and budget approvals across the organisation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Training Event
            </button>
          </div>

          {actionError && (
            <p className="mb-4 text-[12px] font-medium text-red-600">{actionError}</p>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT: events list */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {events.isLoading || events.error || items.length === 0 ? (
                <HrPanelState
                  isLoading={events.isLoading}
                  error={events.error}
                  isEmpty={items.length === 0}
                  emptyTitle="No training scheduled"
                  emptyDescription="Create an event or wait for branches to submit theirs."
                  onRetry={() => events.refetch()}
                />
              ) : (
                items.map((ev) => {
                  const start = new Date(ev.startDate)
                  const pendingBudget = ev.isPaid && !ev.budgetApproved
                  return (
                    <div
                      key={ev._id}
                      className="rounded-xl border border-[#EEF1F6] bg-white p-5"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-[#EEF2FF] px-3 py-1.5 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                              {start
                                .toLocaleDateString("en-NG", { month: "short" })
                                .toUpperCase()}
                            </div>
                            <div className="text-[20px] font-bold leading-none text-[#111827]">
                              {start.getDate()}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#111827]">
                              {ev.title}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6B7280]">
                              <span className="flex items-center gap-1.5">
                                {ev.locationType === "virtual" ? (
                                  <Monitor className="h-3.5 w-3.5" />
                                ) : (
                                  <MapPin className="h-3.5 w-3.5" />
                                )}
                                {ev.isGlobal ? "All branches" : branchName(ev.branchId)}
                              </span>
                              <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                                {pendingBudget ? (
                                  <Banknote className="h-3.5 w-3.5 text-[#6B7280]" />
                                ) : (
                                  <Wallet className="h-3.5 w-3.5 text-[#6B7280]" />
                                )}
                                {ev.isPaid
                                  ? formatCurrency(ev.budgetRequested ?? 0, {
                                      maximumFractionDigits: 0,
                                    })
                                  : "Free"}
                              </span>
                              <span>{ev.trainerName}</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                            !ev.isPaid
                              ? "bg-[#F3F4F6] text-[#4B5563]"
                              : ev.budgetApproved
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {!ev.isPaid
                            ? "No Budget"
                            : ev.budgetApproved
                              ? "Approved"
                              : "Pending Approval"}
                        </span>
                      </div>

                      {/* Second row */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                        <span className="text-[12px] text-[#6B7280]">
                          {ev.startTime} – {ev.endTime} · {ev.venueOrLink}
                        </span>

                        {pendingBudget && (
                          <button
                            type="button"
                            onClick={() => handleApprove(ev._id)}
                            disabled={approveBudget.isPending}
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                          >
                            {approvingId === ev._id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Approve Budget
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {items.length > 0 && (
                <div className="rounded-xl border border-[#EEF1F6] bg-white">
                  <HrPagination
                    pagination={events.data?.pagination}
                    page={page}
                    onPageChange={setPage}
                    itemCount={items.length}
                    noun="events"
                  />
                </div>
              )}
            </div>

            {/* RIGHT: side cards */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Budget Overview */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[18px] font-bold text-[#111827]">Budget Overview</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[13px] text-[#6B7280]">Annual Allocation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#111827]">
                      {budget.isLoading
                        ? "—"
                        : formatCurrency(budget.data?.annualAllocation ?? 0, {
                            maximumFractionDigits: 0,
                          })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAllocationOpen(true)}
                      className="text-[12px] font-semibold text-[#3B5BDB] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#EEF1F6]">
                  <div
                    className="h-2 rounded-full bg-[#3B5BDB]"
                    style={{ width: `${spendShare}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-[#9CA3AF]">
                  {budget.isLoading
                    ? ""
                    : `${formatCurrency(budget.data?.totalSpent ?? 0, {
                        maximumFractionDigits: 0,
                      })} approved so far`}
                </div>
                <div className="mt-4 rounded-lg bg-[#EEF2FF] p-4">
                  <div className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Available Now
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-[#111827]">
                    {budget.isLoading
                      ? "—"
                      : formatCurrency(budget.data?.availableBalance ?? 0, {
                          maximumFractionDigits: 0,
                        })}
                  </div>
                </div>
              </div>

              {/* Branch Expenditure */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[18px] font-bold text-[#111827]">Branch Expenditure</h3>
                {branchSpend.length === 0 ? (
                  <HrPanelState
                    isLoading={events.isLoading}
                    error={null}
                    isEmpty={!events.isLoading}
                    emptyTitle="No approved spend"
                    emptyDescription="Approved training budgets are grouped here by branch."
                    className="mt-4 border-0 p-4"
                  />
                ) : (
                  <div className="mt-4 flex flex-col gap-4">
                    {branchSpend.map((b) => (
                      <div key={b.label}>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#4B5563]">
                            {b.label}
                          </span>
                          <span className="text-[12px] font-bold text-[#111827]">
                            {formatCurrency(b.amount, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-[#EEF1F6]">
                          <div
                            className="h-2 rounded-full bg-[#3B5BDB]"
                            style={{ width: `${b.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateTrainingEventModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TrainingAllocationModal
        open={allocationOpen}
        onClose={() => setAllocationOpen(false)}
      />
    </div>
  )
}
