"use client"

import { Fragment, useMemo, useState } from "react"
import {
  ChevronDown,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Plus,
  Quote,
  Scale,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react"
import FinanceControllerShell from "@/components/finance-controller/FinanceControllerShell"
import InitiateSpecialRequestModal from "@/components/finance-controller/InitiateSpecialRequestModal"
import {
  REQUEST_STATUS_STYLES,
  SPECIAL_REQUESTS,
  type SpecialRequest,
} from "@/components/finance-controller/finance-data"
import { downloadCsv, sectionsToCsv } from "@/lib/export-csv"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = ["All", "Pending", "Fully Approved", "Declined"] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function matchesStatus(request: SpecialRequest, filter: StatusFilter): boolean {
  if (filter === "All") return true
  if (filter === "Pending") return request.status.startsWith("PENDING")
  if (filter === "Fully Approved") return request.status === "FULLY APPROVED"
  return request.status.startsWith("DECLINED")
}

export default function Page() {
  const [requests, setRequests] = useState<SpecialRequest[]>(SPECIAL_REQUESTS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(SPECIAL_REQUESTS[0]?.id ?? null)
  const [modalOpen, setModalOpen] = useState(false)

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return requests.filter((request) => {
      if (!matchesStatus(request, statusFilter)) return false
      if (!term) return true
      return (
        request.requestId.toLowerCase().includes(term) ||
        request.type.toLowerCase().includes(term)
      )
    })
  }, [requests, search, statusFilter])

  const activeCount = requests.filter((request) => request.status.startsWith("PENDING")).length
  const pendingVolume = requests
    .filter((request) => request.status.startsWith("PENDING"))
    .reduce((sum, request) => sum + request.amount, 0)

  const handleCancel = (id: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== id))
    setExpandedId((prev) => (prev === id ? null : prev))
  }

  const handleExport = () => {
    const csv = sectionsToCsv([
      {
        title: "My Requests",
        rows: rows.map((request) => ({
          Date: request.date,
          "Request ID": request.requestId,
          Type: request.type,
          Branch: request.branch,
          Amount: request.amount,
          Status: request.status,
        })),
      },
    ])
    downloadCsv("my-requests.csv", csv)
  }

  const handleSubmitted = (summary: { type: string; amount: number; branch: string }) => {
    const nextNumber = requests.length + 1
    const created: SpecialRequest = {
      id: `req-${Date.now()}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
      requestId: `#REQ-${String(nextNumber).padStart(3, "0")}`,
      type: summary.type,
      amount: summary.amount,
      status: "PENDING (FINANCE DIR.)",
      submittedBy: "Control Desk",
      submittedAt: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      branch: summary.branch,
      justification: "Submitted from the Finance Controller console.",
    }
    setRequests((prev) => [created, ...prev])
    setExpandedId(created.id)
  }

  return (
    <FinanceControllerShell activeHref="/finance-controller/requests" topbarTitle="Dashboard">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex gap-3">
            <span className="mt-1 h-9 w-1.5 rounded-full bg-[#111827]" />
            <div>
              <h1 className="text-[32px] font-extrabold leading-none text-[#111827]">My Requests</h1>
              <p className="mt-2 text-[13px] font-medium text-[#6B7280]">Tracking &amp; Status Overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white px-6 py-4 shadow-sm">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                Total Active
              </div>
              <div className="mt-1.5 text-[24px] font-extrabold leading-none text-[#111827]">
                {String(activeCount).padStart(2, "0")}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white px-6 py-4 shadow-sm">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                Pending Vol.
              </div>
              <div className="mt-1.5 text-[24px] font-extrabold leading-none text-[#3B5BDB]">
                ₦{(pendingVolume / 1_000_000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                aria-label="Filter by status"
                className="h-[40px] appearance-none rounded-[8px] border border-[#E5E7EB] bg-white pl-9 pr-9 text-[13px] font-semibold text-[#4B5563] outline-none focus:border-[#2563EB]"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option} value={option}>
                    Status: {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            </div>

            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ID or Type..."
                className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-[40px] items-center gap-2 self-start rounded-[8px] bg-[#3B5BDB] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#2f4cc2] lg:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>

        {/* Requests table */}
        <div className="mt-4 overflow-hidden rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EEF1F6] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Request ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((request, index) => {
                  const expanded = expandedId === request.id
                  return (
                    <Fragment key={request.id}>
                      <tr
                        onClick={() => setExpandedId(expanded ? null : request.id)}
                        className={cn(
                          "cursor-pointer border-b border-[#F3F4F6] text-[13px] transition-colors",
                          expanded ? "bg-[#111827] text-white" : "hover:bg-[#F8FAFC]"
                        )}
                      >
                        <td className={cn("px-5 py-4 font-medium", expanded ? "text-white/60" : "text-[#9CA3AF]")}>
                          {index + 1}
                        </td>
                        <td className={cn("px-5 py-4", expanded ? "text-white/80" : "text-[#4B5563]")}>
                          {request.date}
                        </td>
                        <td className={cn("px-5 py-4 font-bold", expanded ? "text-white" : "text-[#111827]")}>
                          {request.requestId}
                        </td>
                        <td className={cn("px-5 py-4", expanded ? "text-white/80" : "text-[#4B5563]")}>
                          {request.type}
                        </td>
                        <td className={cn("px-5 py-4 text-right font-bold", expanded ? "text-white" : "text-[#111827]")}>
                          {formatCurrency(request.amount, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[11px] font-bold",
                              expanded ? "text-amber-300" : REQUEST_STATUS_STYLES[request.status]
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {request.status}
                          </span>
                        </td>
                      </tr>

                      {expanded ? (
                        <tr className="bg-[#F5F7FF]">
                          <td colSpan={6} className="px-5 py-6">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                              {/* Details */}
                              <div>
                                <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#111827]">
                                  <FileText className="h-4 w-4 text-[#6B7280]" />
                                  Request Details: {request.requestId}
                                </h2>
                                <p className="mt-1 text-[12px] font-medium text-[#6B7280]">
                                  Submitted: {request.submittedAt} by {request.submittedBy}
                                </p>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <div className="rounded-[10px] bg-white p-4 shadow-sm">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                                      Type
                                    </div>
                                    <div className="mt-1.5 text-[14px] font-bold text-[#111827]">
                                      {request.type}
                                    </div>
                                  </div>
                                  <div className="rounded-[10px] bg-white p-4 shadow-sm">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                                      Amount
                                    </div>
                                    <div className="mt-1.5 text-[14px] font-bold text-[#111827]">
                                      {formatCurrency(request.amount, { maximumFractionDigits: 0 })}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                                    Business Justification
                                  </div>
                                  <div className="mt-2 flex gap-3 rounded-[10px] bg-white p-4 shadow-sm">
                                    <Quote className="h-4 w-4 shrink-0 text-[#C7D2FE]" />
                                    <p className="text-[12.5px] leading-relaxed text-[#4B5563]">
                                      {request.justification}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Approval timeline */}
                              <div className="rounded-[12px] bg-white p-5 shadow-sm">
                                <h3 className="text-[15px] font-bold text-[#111827]">Approval Timeline</h3>

                                <ol className="mt-4 flex flex-col gap-5">
                                  <li className="relative flex gap-3">
                                    <span className="absolute left-[15px] top-9 h-[calc(100%+4px)] w-px bg-[#EEF1F6]" />
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                      <Scale className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                                        Director of Finance
                                      </div>
                                      <div className="mt-0.5 text-[12.5px] font-bold text-amber-600">
                                        {request.status.startsWith("DECLINED")
                                          ? "Declined"
                                          : "Awaiting Approval"}
                                      </div>
                                      <button
                                        type="button"
                                        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7280] hover:text-[#111827]"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        View Comments
                                      </button>
                                    </div>
                                  </li>

                                  <li className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                                      <Lock className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
                                        Director of Pastorate
                                      </div>
                                      <div className="mt-0.5 text-[12.5px] font-semibold text-[#9CA3AF]">
                                        {request.status === "FULLY APPROVED"
                                          ? "Approved"
                                          : "Locked (Step 1 Pending)"}
                                      </div>
                                    </div>
                                  </li>
                                </ol>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleCancel(request.id)
                                  }}
                                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[8px] bg-rose-50 py-3 text-[13px] font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancel Request
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
                      No requests match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#4B5563] hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export Request History
          </button>
        </div>
      </div>

      {modalOpen ? (
        <InitiateSpecialRequestModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
        />
      ) : null}
    </FinanceControllerShell>
  )
}
