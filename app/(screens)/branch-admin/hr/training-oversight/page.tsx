"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Bell, Menu, ChevronLeft, Loader2, Users, Wallet } from "lucide-react"
import BranchAdminSidebar from "@/components/navigation/BranchAdminSidebar"
import BranchAdminRegisterStaffModal from "@/components/hr/BranchAdminRegisterStaffModal"
import { HrPanelState, HrTableState, hrErrorMessage } from "@/components/hr/HrDataState"
import {
  useTrainingEvent,
  useUpdateParticipantRecord,
} from "@/components/hooks/hr/useHrTraining"
import {
  TRAINING_PARTICIPANT_STATUS_BADGES,
  TRAINING_PARTICIPANT_STATUS_LABELS,
  badgeFor,
  branchName,
  deref,
  employeeName,
  initials,
  lookup,
} from "@/lib/hr/normalize"
import {
  TRAINING_PARTICIPANT_STATUSES,
  type TrainingParticipantStatus,
} from "@/lib/hr/types"
import { formatCurrency, formatDate } from "@/lib/format"
import { withSuspense } from "@/lib/withSuspense"
import { cn } from "@/lib/utils"

const cardCls = "rounded-xl border border-[#EEF1F6] bg-white p-5"
const tileLabelCls = "text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")

  const [mobileOpen, setMobileOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const detail = useTrainingEvent(eventId)
  const updateRecord = useUpdateParticipantRecord()

  const event = detail.data?.event
  const participants = detail.data?.participants ?? []

  async function changeStatus(recordId: string, status: TrainingParticipantStatus) {
    setActionError(null)
    try {
      await updateRecord.mutateAsync({ recordId, status })
    } catch (error) {
      setActionError(hrErrorMessage(error))
    }
  }

  const tiles = event
    ? [
        { label: "Starts", value: formatDate(event.startDate, "medium") },
        { label: "Ends", value: formatDate(event.endDate, "medium") },
        { label: "Time", value: `${event.startTime} – ${event.endTime}` },
      ]
    : []

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
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#111827]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {!eventId ? (
            <HrPanelState
              isLoading={false}
              error={null}
              isEmpty
              emptyTitle="No training selected"
              emptyDescription="Open a session from the Training Registry."
              className="mt-5"
            />
          ) : detail.isLoading || detail.error || !event ? (
            <HrPanelState
              isLoading={detail.isLoading}
              error={detail.error}
              isEmpty={!event}
              emptyTitle="Training not found"
              onRetry={() => detail.refetch()}
              className="mt-5"
            />
          ) : (
            <>
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT: event detail */}
                <div className={cn(cardCls, "lg:col-span-2")}>
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[16px] font-bold text-[#2563EB]">
                      {initials(event.title)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[24px] font-bold text-[#111827]">{event.title}</h1>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[10px] font-bold",
                            event.isPaid && !event.budgetApproved
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {event.isPaid
                            ? event.budgetApproved
                              ? "BUDGET APPROVED"
                              : "BUDGET PENDING"
                            : "FREE"}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[#6B7280]">
                        {event.trainerName} ({event.trainerType ?? "internal"}) •{" "}
                        {event.isGlobal ? "All branches" : branchName(event.branchId)}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#9CA3AF]">{event.venueOrLink}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tiles.map((tile) => (
                      <div
                        key={tile.label}
                        className="rounded-[12px] border border-[#F3F4F6] bg-[#FAFBFF] p-4"
                      >
                        <p className={tileLabelCls}>{tile.label}</p>
                        <p className="mt-2 text-[16px] font-bold text-[#111827]">{tile.value}</p>
                      </div>
                    ))}
                  </div>

                  {event.description && (
                    <p className="mt-5 text-[13px] leading-relaxed text-[#4B5563]">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* RIGHT: enrolment + budget */}
                <div className="lg:col-span-1 rounded-xl bg-[#111827] p-6 text-white">
                  <h2 className="text-[16px] font-bold">Session Summary</h2>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                          Enrolled
                        </p>
                        <p className="text-[16px] font-bold">
                          {participants.length}
                          {event.maxCapacity ? ` / ${event.maxCapacity}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <Wallet className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                          Budget Requested
                        </p>
                        <p className="text-[16px] font-bold">
                          {formatCurrency(event.budgetRequested ?? 0, {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRegisterOpen(true)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-[12px] font-semibold text-[#111827] hover:bg-white/90"
                  >
                    Register Staff
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div className="mt-5 overflow-hidden rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between p-5">
                  <h2 className="text-[16px] font-bold text-[#111827]">Participants</h2>
                  {updateRecord.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#EEF2FF]">
                      <tr>
                        {["Staff Member", "Score", "Completed", "Status"].map((h) => (
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
                      <HrTableState
                        colSpan={4}
                        isLoading={false}
                        error={null}
                        isEmpty={participants.length === 0}
                        emptyTitle="Nobody enrolled yet"
                        emptyDescription="Use Register Staff to enrol employees."
                      />

                      {participants.map((participant) => {
                        const staff = deref(participant.employeeId)
                        const name = employeeName(participant.employeeId)
                        return (
                          <tr key={participant._id} className="hover:bg-[#FAFBFF]">
                            <td className="px-4 py-3 text-[13px]">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-bold text-[#2563EB]">
                                  {initials(name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-[#111827]">{name}</p>
                                  <p className="truncate text-[11px] text-[#9CA3AF]">
                                    {staff?.jobTitle ?? "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                              {participant.score != null ? `${participant.score}%` : "—"}
                            </td>
                            <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                              {participant.completionDate
                                ? formatDate(participant.completionDate, "medium")
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-[13px]">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                    badgeFor(
                                      TRAINING_PARTICIPANT_STATUS_BADGES,
                                      participant.status,
                                    ),
                                  )}
                                >
                                  {lookup(
                                    TRAINING_PARTICIPANT_STATUS_LABELS,
                                    participant.status,
                                  )}
                                </span>
                                <select
                                  value={participant.status}
                                  disabled={updateRecord.isPending}
                                  onChange={(e) =>
                                    changeStatus(
                                      participant._id,
                                      e.target.value as TrainingParticipantStatus,
                                    )
                                  }
                                  aria-label={`Update status for ${name}`}
                                  className="h-8 rounded-md border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#4B5563] outline-none focus:border-[#2563EB]"
                                >
                                  {TRAINING_PARTICIPANT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {TRAINING_PARTICIPANT_STATUS_LABELS[status]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {actionError && (
                  <p className="border-t border-[#F3F4F6] px-5 py-3 text-[12px] font-medium text-red-600">
                    {actionError}
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <BranchAdminRegisterStaffModal
        open={registerOpen}
        trainingEventId={eventId}
        onClose={() => setRegisterOpen(false)}
      />
    </div>
  )
}

export default withSuspense(Page)
