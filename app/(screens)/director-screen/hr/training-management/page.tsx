"use client"

import { useMemo, useState } from "react"
import {
  Search,
  UserPlus,
  Download,
  Plus,
  SlidersHorizontal,
  MapPin,
  Banknote,
  Wallet,
  Monitor,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import CreateTrainingEventModal from "@/components/hr/CreateTrainingEventModal"
import { useToast } from "@/components/ui/toast"
import {
  useHrTrainings,
  useHrTrainingBudget,
  useTrainingMutations,
} from "@/components/hooks/useHrTrainings"
import { formatNaira } from "@/lib/hr/display"
import { cn } from "@/lib/utils"

const AVATARS = ["bg-[#3B5BDB]", "bg-[#111827]", "bg-emerald-500", "bg-amber-500"]

function StatusBadge({ approved }: { approved: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
        approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      )}
    >
      {!approved && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {approved ? "BUDGET APPROVED" : "PENDING APPROVAL"}
    </span>
  )
}

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const { pushToast } = useToast()
  // Director view is global, so no branchId is sent.
  const { trainings, loading, error, refresh } = useHrTrainings({ limit: 50 })
  const { budget, refresh: refreshBudget } = useHrTrainingBudget()
  const { approveTrainingBudget } = useTrainingMutations()

  const utilisation = Math.min(Math.max(budget.percentageUtilized, 0), 100)

  // Spend per branch is not a served figure; group what the events carry.
  const branchSpend = useMemo(() => {
    const totals = new Map<string, number>()
    for (const training of trainings) {
      const key = training.branchId || "global"
      totals.set(key, (totals.get(key) ?? 0) + training.budgetRequested)
    }
    const peak = Math.max(...Array.from(totals.values()), 0)
    return Array.from(totals.entries()).map(([key, amount]) => ({
      label: key === "global" ? "Global / Virtual" : `Branch ${key.slice(-4)}`,
      amount,
      percent: peak ? Math.round((amount / peak) * 100) : 0,
    }))
  }, [trainings])

  const handleApproveBudget = async (id: string, title: string) => {
    setApprovingId(id)
    try {
      await approveTrainingBudget(id, "Budget approved at director review.")
      pushToast(`Budget approved for ${title}`, "success")
      refresh()
      refreshBudget()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to approve this budget", "error")
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
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#EEF1F6] pb-6 md:flex-row md:items-start">
            <div className="pt-1">
              <h1 className="text-[24px] font-bold text-[#111827]">Training</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Institutional skill development reconciliation across all
                branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search training events..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[240px]"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Events list header row */}
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Training Events List
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#4B5563] hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter: All Branches
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-[#3B5BDB] px-4 py-2 text-[12px] font-medium text-white shadow hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Training Event
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT: events list */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {trainings.map((ev) => {
                const start = ev.startDate ? new Date(ev.startDate) : null
                const month = start
                  ? start.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()
                  : "—"
                const day = start ? String(start.getDate()).padStart(2, "0") : "--"
                const isOnline = ev.locationType === "online"
                return (
                  <div key={ev.id} className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-[#EEF2FF] px-3 py-1.5 text-center">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                            {month}
                          </div>
                          <div className="text-[20px] font-bold leading-none text-[#111827]">
                            {day}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-[#111827]">{ev.title}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6B7280]">
                            <span className="flex items-center gap-1.5">
                              {isOnline ? (
                                <Monitor className="h-3.5 w-3.5" />
                              ) : (
                                <MapPin className="h-3.5 w-3.5" />
                              )}
                              {ev.venueOrLink || (isOnline ? "Online session" : "Venue TBC")}
                            </span>
                            <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                              {ev.budgetApproved ? (
                                <Wallet className="h-3.5 w-3.5 text-[#6B7280]" />
                              ) : (
                                <Banknote className="h-3.5 w-3.5 text-[#6B7280]" />
                              )}
                              {formatNaira(ev.budgetRequested)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge approved={ev.budgetApproved} />
                    </div>

                    {/* Second row */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {AVATARS.slice(0, Math.min(ev.enrolledCount, AVATARS.length)).map(
                            (color, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-7 w-7 rounded-full border-2 border-white",
                                  color
                                )}
                              />
                            )
                          )}
                        </div>
                        <span className="ml-2 text-[12px] font-semibold text-[#6B7280]">
                          {ev.enrolledCount} enrolled
                          {ev.maxCapacity ? ` / ${ev.maxCapacity}` : ""}
                        </span>
                      </div>

                      {!ev.budgetApproved && ev.budgetRequested > 0 ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleApproveBudget(ev.id, ev.title)}
                            disabled={approvingId === ev.id}
                            className="rounded-md bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {approvingId === ev.id ? "Approving…" : "Approve Budget"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}

              {loading ? (
                <p className="rounded-xl border border-[#EEF1F6] bg-white p-8 text-center text-[13px] text-[#6B7280]">
                  Loading training events…
                </p>
              ) : null}

              {error ? (
                <p className="rounded-xl border border-rose-100 bg-white p-8 text-center text-[13px] text-rose-600">
                  {error}
                </p>
              ) : null}

              {!loading && !error && trainings.length === 0 ? (
                <p className="rounded-xl border border-[#EEF1F6] bg-white p-8 text-center text-[13px] text-[#9CA3AF]">
                  No training events scheduled.
                </p>
              ) : null}
            </div>

            {/* RIGHT: side cards */}
            <div className="flex flex-col gap-5 lg:col-span-1">
              {/* Budget Overview */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[18px] font-bold text-[#111827]">
                  Budget Overview
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[13px] text-[#6B7280]">
                    Annual Allocation
                  </span>
                  <span className="text-[15px] font-bold text-[#111827]">
                    {formatNaira(budget.annualAllocation)}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#EEF1F6]">
                  <div
                    className="h-2 rounded-full bg-[#3B5BDB]"
                    style={{ width: `${utilisation}%` }}
                  />
                </div>
                <div className="mt-4 rounded-lg bg-[#EEF2FF] p-4">
                  <div className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Available Now
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-[#111827]">
                    {formatNaira(budget.availableBalance)}
                  </div>
                  <div className="mt-1 text-[11px] text-[#6B7280]">
                    {formatNaira(budget.totalSpent)} spent · {formatNaira(budget.committedPending)}{" "}
                    committed
                  </div>
                </div>
              </div>

              {/* Branch Expenditure */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[18px] font-bold text-[#111827]">
                  Branch Expenditure
                </h3>
                <div className="mt-4 flex flex-col gap-4">
                  {branchSpend.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#4B5563]">{b.label}</span>
                        <span className="text-[12px] font-bold text-[#111827]">
                          {formatNaira(b.amount, { compact: true })}
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

                  {branchSpend.length === 0 ? (
                    <p className="text-[12px] text-[#9CA3AF]">No training spend recorded yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateTrainingEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          refresh()
          refreshBudget()
        }}
      />
    </div>
  )
}
