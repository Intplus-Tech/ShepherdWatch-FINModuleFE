"use client"

import { useState } from "react"
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
  Pencil,
  Trash2,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import CreateTrainingEventModal from "@/components/hr/CreateTrainingEventModal"
import { cn } from "@/lib/utils"

type TrainingStatus = "PENDING APPROVAL" | "COMPLETED"

type TrainingEvent = {
  id: string
  month: string
  day: string
  title: string
  location: string
  locationIcon: "map" | "monitor"
  amount: string
  status: TrainingStatus
  showActions: boolean
}

const EVENTS: TrainingEvent[] = [
  {
    id: "financial-literacy",
    month: "OCT",
    day: "28",
    title: "Financial Literacy Workshop",
    location: "Ibadan HQ",
    locationIcon: "map",
    amount: "₦250,000",
    status: "PENDING APPROVAL",
    showActions: true,
  },
  {
    id: "leadership-development",
    month: "OCT",
    day: "30",
    title: "Leadership Development",
    location: "Virtual Session",
    locationIcon: "monitor",
    amount: "₦50,000",
    status: "COMPLETED",
    showActions: false,
  },
]

const AVATARS = ["bg-[#3B5BDB]", "bg-[#111827]", "bg-emerald-500", "bg-amber-500"]

const BRANCH_SPEND = [
  { label: "Lagos Region", amount: "₦1.2M", percent: 100 },
  { label: "Ibadan Region", amount: "₦0.8M", percent: 67 },
  { label: "Virtual / Global", amount: "₦0.5M", percent: 42 },
]

function StatusBadge({ status }: { status: TrainingStatus }) {
  const isPending = status === "PENDING APPROVAL"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
        isPending
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      )}
    >
      {isPending && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {status}
    </span>
  )
}

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)

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
              {EVENTS.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-[#EEF1F6] bg-white p-5"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-[#EEF2FF] px-3 py-1.5 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B5BDB]">
                          {ev.month}
                        </div>
                        <div className="text-[20px] font-bold leading-none text-[#111827]">
                          {ev.day}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#111827]">
                          {ev.title}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6B7280]">
                          <span className="flex items-center gap-1.5">
                            {ev.locationIcon === "map" ? (
                              <MapPin className="h-3.5 w-3.5" />
                            ) : (
                              <Monitor className="h-3.5 w-3.5" />
                            )}
                            {ev.location}
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-[#111827]">
                            {ev.status === "PENDING APPROVAL" ? (
                              <Banknote className="h-3.5 w-3.5 text-[#6B7280]" />
                            ) : (
                              <Wallet className="h-3.5 w-3.5 text-[#6B7280]" />
                            )}
                            {ev.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={ev.status} />
                  </div>

                  {/* Second row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {AVATARS.map((color, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-7 w-7 rounded-full border-2 border-white",
                              color
                            )}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-[12px] font-semibold text-[#6B7280]">
                        +12
                      </span>
                    </div>

                    {ev.showActions && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-[12px] font-semibold text-[#3B5BDB] hover:underline"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-600"
                        >
                          Approve Budget
                        </button>
                        <button
                          type="button"
                          aria-label="Edit event"
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete event"
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                    ₦2,500,000
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#EEF1F6]">
                  <div
                    className="h-2 rounded-full bg-[#3B5BDB]"
                    style={{ width: "78%" }}
                  />
                </div>
                <div className="mt-4 rounded-lg bg-[#EEF2FF] p-4">
                  <div className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Available Now
                  </div>
                  <div className="mt-1 text-[22px] font-bold text-[#111827]">
                    ₦180,000
                  </div>
                </div>
              </div>

              {/* Branch Expenditure */}
              <div className="rounded-xl border border-[#EEF1F6] bg-white p-5">
                <h3 className="text-[18px] font-bold text-[#111827]">
                  Branch Expenditure
                </h3>
                <div className="mt-4 flex flex-col gap-4">
                  {BRANCH_SPEND.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[#4B5563]">
                          {b.label}
                        </span>
                        <span className="text-[12px] font-bold text-[#111827]">
                          {b.amount}
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateTrainingEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
