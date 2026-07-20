"use client"

import { useMemo, useState } from "react"
import {
  Search,
  UserPlus,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import { cn } from "@/lib/utils"

type ClearanceStatus = "Stuck" | "Pending"

type Clearance = {
  id: string
  name: string
  branch: string
  date: string
  step: string
  status: ClearanceStatus
}

const CLEARANCES: Clearance[] = [
  {
    id: "sarah-musa",
    name: "Sarah Musa",
    branch: "Ibadan HQ",
    date: "31 Oct, 2023",
    step: "Finance Step",
    status: "Stuck",
  },
  {
    id: "john-obi",
    name: "John Obi",
    branch: "Lagos Central",
    date: "28 Oct, 2023",
    step: "Asset Step",
    status: "Stuck",
  },
  {
    id: "maryam-bello",
    name: "Maryam Bello",
    branch: "Abuja North",
    date: "30 Oct, 2023",
    step: "Finance Step",
    status: "Pending",
  },
]

const BRANCH_OPTIONS = [
  "Ibadan HQ",
  "Lagos Central",
  "Abuja North",
] as const

const STATUS_OPTIONS = [
  "Pending Director",
  "Stuck",
  "Pending",
] as const

const CHECKLIST: {
  label: string
  status: string
  variant: "complete" | "stuck" | "locked"
}[] = [
  { label: "IT Step", status: "Complete", variant: "complete" },
  { label: "Admin Step", status: "Complete", variant: "complete" },
  { label: "Finance Step", status: "Stuck", variant: "stuck" },
  { label: "HR Final Step", status: "LOCKED", variant: "locked" },
]

function StatusText({ status }: { status: ClearanceStatus }) {
  const isStuck = status === "Stuck"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-semibold",
        isStuck ? "text-rose-600" : "text-amber-600"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isStuck ? "bg-rose-500" : "bg-amber-500"
        )}
      />
      {status}
    </span>
  )
}

function ChecklistRow({
  label,
  status,
  variant,
}: {
  label: string
  status: string
  variant: "complete" | "stuck" | "locked"
}) {
  const Icon =
    variant === "complete"
      ? CheckCircle2
      : variant === "stuck"
      ? AlertCircle
      : Lock
  const iconColor =
    variant === "complete"
      ? "text-emerald-500"
      : variant === "stuck"
      ? "text-rose-500"
      : "text-[#9CA3AF]"
  const textColor =
    variant === "complete"
      ? "text-emerald-600"
      : variant === "stuck"
      ? "text-rose-600"
      : "text-[#9CA3AF]"

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={cn("h-4.5 w-4.5", iconColor)} />
        <span className="text-[13px] font-medium text-[#111827]">{label}</span>
      </div>
      <span className={cn("text-[12px] font-semibold", textColor)}>
        {status}
      </span>
    </div>
  )
}

export default function Page() {
  const [branch, setBranch] = useState<string>("Ibadan HQ")
  const [status, setStatus] = useState<string>("Pending Director")
  const [selectedId, setSelectedId] = useState<string>("sarah-musa")

  const filtered = useMemo(() => {
    return CLEARANCES.filter((c) => {
      const matchesBranch = c.branch === branch
      const matchesStatus =
        status === "Pending Director" || c.status === status
      return matchesBranch && matchesStatus
    })
  }, [branch, status])

  const selected =
    CLEARANCES.find((c) => c.id === selectedId) ?? CLEARANCES[0]

  const clearFilters = () => {
    setBranch("Ibadan HQ")
    setStatus("Pending Director")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/hr/exit-clearance"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          {/* Header + action bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-[24px] font-bold text-[#111827]">
                Exit Clearance
              </h1>
              <p className="text-[13px] text-[#6B7280] mt-1">
                View and track exit clearance across all branches
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-[42px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] sm:w-[220px]"
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

          {/* Filters card */}
          <div className="mb-5 rounded-xl border border-[#EEF1F6] bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#6B7280]">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="self-start text-[13px] font-semibold text-[#3B5BDB] hover:underline md:self-auto"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: Exit Clearances table */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] p-5">
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    Exit Clearances
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold text-[#3B5BDB]">
                    3 Flagged Cases
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Branch
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Step
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-[13px] text-[#6B7280]"
                          >
                            No clearances match your filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((c) => {
                          const isSelected = c.id === selectedId
                          return (
                            <tr
                              key={c.id}
                              onClick={() => setSelectedId(c.id)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-[#EEF2FF]"
                                  : "hover:bg-[#F8FAFC]"
                              )}
                            >
                              <td className="px-4 py-4 text-[13px] font-semibold text-[#111827]">
                                {c.name}
                              </td>
                              <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                {c.branch}
                              </td>
                              <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                {c.date}
                              </td>
                              <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                                {c.step}
                              </td>
                              <td className="px-4 py-4 text-[13px]">
                                <StatusText status={c.status} />
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT: Detailed View panel */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] p-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#111827]">
                      Detailed View
                    </h2>
                    <p className="text-[13px] text-[#6B7280] mt-1">
                      Selected: {selected.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close detailed view"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  {/* Warning box */}
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                          Reason for Delay
                        </div>
                        <div className="mt-1 text-[14px] font-bold text-[#111827]">
                          Outstanding Loan Detected
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan balance */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">
                      Loan Balance
                    </span>
                    <span className="text-[14px] font-bold text-rose-600">
                      ₦45,000
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] text-[#4B5563]">
                    Recommended Action:{" "}
                    <span className="font-bold text-[#111827]">
                      Recover loan from final pay
                    </span>
                  </p>

                  {/* Computation box */}
                  <div className="mt-4 rounded-lg bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Final Pay (Before)
                      </span>
                      <span className="text-[13px] font-semibold text-[#111827]">
                        ₦550,000
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-[#6B7280]">
                        Loan Deduction
                      </span>
                      <span className="text-[13px] font-semibold text-rose-600">
                        -₦45,000
                      </span>
                    </div>
                    <div className="my-3 border-t border-[#E5E7EB]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#111827]">
                        Net Final Pay
                      </span>
                      <span className="text-[15px] font-bold text-emerald-600">
                        ₦505,000
                      </span>
                    </div>
                  </div>

                  {/* Progress checklist */}
                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      Progress Checklist
                    </div>
                    <div className="mt-2 divide-y divide-[#EEF1F6]">
                      {CHECKLIST.map((item) => (
                        <ChecklistRow
                          key={item.label}
                          label={item.label}
                          status={item.status}
                          variant={item.variant}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer button */}
                  <button
                    type="button"
                    className="mt-5 w-full rounded-md bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black"
                  >
                    APPROVE ADJUSTMENT & MOVE FORWARD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
