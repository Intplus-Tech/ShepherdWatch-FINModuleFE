"use client"

import { API_V1 } from "@/lib/api";
import { useMemo, useState, useEffect } from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Info,
  Search,
  Menu,
  X,
  AlertCircle,
  LockKeyhole,
  FileText
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { RequisitionDetailsModal } from "@/components/modals/RequisitionDetailsModal"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { useRequisitions } from "@/components/hooks/useRequisitions"
import { useBudgetPerformance } from "@/components/hooks/useBudgetPerformance"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { budgetIssue, fetchBudgetContexts, payeeSummary, readRequisitionDetails, type BudgetFit } from "@/lib/requisition-details"
import { loadStreams } from "@/lib/ledger"

export default function Page() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth()
  const displayName = user?.name || user?.email || "User"
  const roleLabel = user?.role ? String(user.role).replace(/_/g, " ") : "Lead Pastor"
  const { branchId: contextBranchId } = useBranchContext()
  const branchId = contextBranchId || user?.branchId || user?.tenantId || user?.tenant?.id || ""
  // Budgets closest to exhaustion, for the alerts card.
  const { performanceData, fetchPerformance } = useBudgetPerformance()
  useEffect(() => {
    if (branchId) fetchPerformance({ branchId })
  }, [branchId, fetchPerformance])
  const budgetAlerts = (performanceData?.budgets ?? [])
    .map((b) => {
      const approved = Number(b.approved ?? 0)
      const spent = Number(b.spent ?? 0)
      return { id: b.budgetId, title: b.title || "Budget", pct: approved > 0 ? Math.min(100, Math.round((spent / approved) * 100)) : 0 }
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  const { requisitions: liveRequisitions, loading: reqsLoading, refresh: refreshReqs } = useRequisitions({
    branchId,
    limit: 50,
  })

  const naira = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)
  const whenLabel = (iso?: string) => {
    const d = iso ? new Date(iso) : null
    if (!d || Number.isNaN(d.getTime())) return ""
    const today = new Date().toDateString() === d.toDateString()
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return today ? `Today, ${time}` : `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${time}`
  }

  /**
   * Requests that have reached this pastor. A submitted requisition sits in
   * `pending_pastor` until it is approved or declined here.
   */
  const awaiting = useMemo(
    () =>
      liveRequisitions
        .filter((r) => String(r.currentStatus ?? "").toLowerCase() === "pending_pastor")
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [liveRequisitions]
  )

  /**
   * The API refuses to approve a request that exceeds its budget head, so
   * check each one up front and say so on the card rather than after a
   * failed click.
   */
  const [fits, setFits] = useState<Record<string, BudgetFit>>({})
  const awaitingIds = awaiting.map((r) => r.id).join(",")
  useEffect(() => {
    if (!awaitingIds) {
      setFits({})
      return
    }
    let active = true
    fetchBudgetContexts(awaitingIds.split(",")).then((next) => {
      if (active) setFits(next)
    })
    return () => {
      active = false
    }
  }, [awaitingIds])
  const overageOf = (id: string) => (fits[id]?.isOverBudget ? fits[id] : null)
  const issueOf = (id: string) => budgetIssue(fits[id])

  const decorate = (r: (typeof liveRequisitions)[number]) => {
    const details = readRequisitionDetails(r)
    return {
      rawId: r.id,
      id: `#${r.requisitionNumber || r.reference || r.id.slice(-6).toUpperCase()}`,
      description: details.title || r.coaName || "Requisition",
      fullDescription: details.justification || r.justification || "",
      category: r.coaName || "Uncategorised",
      amountValue: Number(r.amount ?? 0),
      amount: naira(Number(r.amount ?? 0)),
      payee: payeeSummary(details),
      requestedBy: r.requestedBy || "Branch user",
      timeLabel: whenLabel(r.createdAt),
      status: "IN REVIEW",
      overage: overageOf(r.id),
      issue: issueOf(r.id),
    }
  }

  // The largest requests lead, since they carry the most budget risk.
  const priorityCards = useMemo(
    () => [...awaiting].sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0)).slice(0, 2).map(decorate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [awaiting, fits]
  )
  const pendingRows = useMemo(() => {
    const lead = new Set(priorityCards.map((c) => c.rawId))
    return awaiting.filter((r) => !lead.has(r.id)).map(decorate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaiting, priorityCards, fits])


  // Where the branch's money actually goes, by expense stream.
  const [expenseStreams, setExpenseStreams] = useState<{ label: string; percentage: number; color: string }[]>([])
  useEffect(() => {
    let active = true
    loadStreams({ entryType: "expense" })
      .then((streams) => {
        if (!active) return
        const palette = ["#F97316", "#0EA5E9", "#22C55E", "#A855F7", "#EF4444", "#EAB308"]
        const total = streams.expense.reduce((sum, x) => sum + x.total, 0)
        if (total <= 0) {
          setExpenseStreams([])
          return
        }
        setExpenseStreams(
          [...streams.expense]
            .sort((a, b) => b.total - a.total)
            .slice(0, 6)
            .map((x, i) => ({ label: x.name || "Unnamed", percentage: Math.round((x.total / total) * 100), color: palette[i % palette.length] }))
        )
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [branchId])

  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null)

  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null)

  const getCsrfToken = getCsrfTokenFromCookie

  /** Record the pastor's decision. Approving frees the accountant to pay it. */
  const decide = async (id: string, action: "approved" | "declined") => {
    if (!id) return
    setIsApproving(id)
    setApproveError(null)
    setApproveSuccess(null)
    try {
      const res = await fetch(`${API_V1}/financial/requisitions/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({
          action,
          comment: action === "approved" ? "Approved by the lead pastor." : "Declined by the lead pastor.",
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(payload?.message ?? `Unable to ${action === "approved" ? "approve" : "decline"} the requisition.`)
      setApproveSuccess(
        action === "approved"
          ? "Approved — the branch accountant can now post the expense against it."
          : "Requisition declined."
      )
      refreshReqs()
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "The decision could not be recorded.")
    } finally {
      setIsApproving(null)
    }
  }




  // The latest requisitions on this branch, as an activity feed.
  const recentActivity = [...liveRequisitions]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5)
    .map((r) => {
      const status = String(r.currentStatus ?? "pending").replace(/_/g, " ")
      const date = r.createdAt ? new Date(r.createdAt) : null
      return {
        id: `#${(r.reference || r.id).toString().slice(-8).toUpperCase()}`,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        description: r.coaName || r.justification || "Requisition",
        amount: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(r.amount ?? 0)),
        timeLabel: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
        rawId: r.id,
      }
    })
  const expenseChart = useMemo(() => {
    if (expenseStreams.length === 0) return { segments: [], background: "conic-gradient(#E5E7EB 0% 100%)" }
    let at = 0
    const stops = expenseStreams.map((seg) => {
      const from = at
      at += seg.percentage
      return `${seg.color} ${from}% ${at}%`
    })
    return { segments: expenseStreams, background: `conic-gradient(${stops.join(", ")})` }
  }, [expenseStreams])

  const selectedRequisition = useMemo(() => {
    if (!selectedRequisitionId) return null
    const found = liveRequisitions.find((r) => r.id === selectedRequisitionId)
    if (!found) return null
    const details = readRequisitionDetails(found)
    return {
      ...found,
      reference: found.requisitionNumber || found.reference,
      description: details.title || found.coaName || "Requisition",
      justification: details.justification || found.justification,
      category: found.coaName,
      payee: payeeSummary(details),
      attachmentUrl: details.attachmentUrl,
      attachmentName: details.attachmentName,
    }
  }, [selectedRequisitionId, liveRequisitions])

  return (
    <div className="h-screen w-full bg-[#F9FAFB] font-sans antialiased text-[#111827] flex overflow-hidden">
      <BranchLeadPastorSidebar />
      <RequisitionDetailsModal
        isOpen={selectedRequisitionId !== null}
        onClose={() => setSelectedRequisitionId(null)}
        isAuthorizing={isApproving !== null}
        requisition={selectedRequisition}
        onApprove={async () => {
          if (!selectedRequisitionId) return
          await decide(selectedRequisitionId, "approved")
          setSelectedRequisitionId(null)
        }}
        onDecline={async () => {
          if (!selectedRequisitionId) return
          await decide(selectedRequisitionId, "declined")
          setSelectedRequisitionId(null)
        }}
      />



      {/* Main Workspace */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-w-0">
        {/* Top Navigation Header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-[17px] font-extrabold text-[#111827] tracking-tight">Dashboard</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[15px] w-[15px] text-[#9CA3AF]" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search requisitions..."
                className="h-[38px] w-[260px] rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] pl-[34px] pr-4 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EFF6FF] focus:border-[#2563EB] transition-all"
              />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute -top-0.5 right-0 flex h-2 w-2 rounded-full bg-rose-500 border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Area */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
          {/* Top Header */}
          <div className="mb-8">
            <h1 className="text-[24px] md:text-[32px] font-black text-[#111827] uppercase tracking-tighter leading-[32px] mb-2" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>REQUISITION</h1>
            <p className="text-[13px] font-medium text-[#6B7280]">Manage all requisitions approval.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
            {/* Left Column Area */}
            <div className="flex flex-col gap-8 w-full min-w-0">
              {/* Approval Inbox Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="text-rose-500">
                    <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Approval Inbox <span className="text-[#6B7280] font-semibold">(Priority)</span></h2>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-500 uppercase tracking-widest">
                  ACTION REQUIRED
                </div>
              </div>

              {/* Priority Cards */}
              <div className="flex flex-col gap-6">
                {reqsLoading && priorityCards.length === 0 && (
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-8 text-[14px] text-[#9CA3AF]">Loading requisitions…</div>
                )}
                {!reqsLoading && awaiting.length === 0 && (
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-8 text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                    <div className="text-[15px] font-bold text-[#111827] mt-3">Nothing awaiting your approval</div>
                    <div className="text-[13px] text-[#6B7280] mt-1">Requests submitted by the branch admin land here for your decision.</div>
                  </div>
                )}
                {priorityCards.map((card, index) => (
                  <div
                    key={card.rawId}
                    className={`rounded-[16px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col md:flex-row overflow-hidden border-l-[4px] ${index === 0 ? "border-l-rose-500" : "border-l-orange-500"}`}
                  >
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-[11px] font-extrabold tracking-widest uppercase ${card.overage ? "text-rose-500" : index === 0 ? "text-rose-500" : "text-orange-500"}`}>
                          {card.issue === "overage"
                            ? "OVER BUDGET — NEEDS A DIRECTOR OVERRIDE"
                            : card.issue === "unallocated"
                              ? "NO BUDGET ALLOCATED — NEEDS A DIRECTOR OVERRIDE"
                              : index === 0
                                ? "HIGHEST VALUE"
                                : "AWAITING APPROVAL"}
                        </div>
                        <div className="text-[12px] font-semibold text-[#9CA3AF]">Requested: {card.timeLabel}</div>
                      </div>
                      <h3 className="text-[22px] font-black text-[#111827] tracking-tight leading-tight mb-3">
                        {card.id} {card.description}
                      </h3>
                      <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-[90%] mb-8">
                        {card.fullDescription}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-8">
                        <div>
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">REQUEST AMOUNT</div>
                          <div className="text-[18px] font-extrabold text-[#111827]">{card.amount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">CATEGORY</div>
                          <div className="text-[14px] font-bold text-[#111827]">{card.category}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">REQUESTED BY</div>
                          <div className="text-[14px] font-bold text-[#111827]">{card.requestedBy}</div>
                        </div>
                      </div>

                      {card.payee && (
                        <div className="mb-4 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-4 py-3">
                          <div className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase mb-1">PAY TO</div>
                          <div className="text-[13.5px] font-semibold text-[#111827]">{card.payee}</div>
                        </div>
                      )}

                      {card.issue === "overage" && (
                        <div className="mb-8 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3">
                          <div className="text-[12px] font-bold text-rose-700">
                            {naira(card.overage?.overageAmount ?? 0)} over the remaining budget on {card.category}
                          </div>
                          <div className="text-[11.5px] text-rose-600 mt-0.5">
                            You cannot approve this as it stands. Ask a Director to authorise the overage, or raise the budget for this head.
                          </div>
                        </div>
                      )}

                      {card.issue === "unallocated" && (
                        <div className="mb-8 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3">
                          <div className="text-[12px] font-bold text-amber-900">
                            Nothing is budgeted for {card.category}
                          </div>
                          <div className="text-[11.5px] text-amber-800 mt-0.5">
                            This is not an overspend — there is simply no budget on this head to spend against. Allocate a budget
                            for it, or ask a Director to authorise the request as an overage.
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => setSelectedRequisitionId(card.rawId)}
                          disabled={Boolean(card.overage)}
                          title={card.issue === "none" ? "" : "Blocked by the budget check — a Director override clears it"}
                          className="h-[44px] rounded-[8px] bg-[#2563EB] px-6 text-[14px] font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors flex items-center gap-2 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none disabled:cursor-not-allowed">
                          <LockKeyhole className="h-4 w-4" /> {card.issue === "none" ? "Review & Approve" : "Blocked — needs an override"}
                        </button>
                        <button
                          onClick={() => decide(card.rawId, "declined")}
                          disabled={isApproving !== null}
                          className="h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white px-5 text-[14px] font-bold text-[#B91C1C] hover:bg-rose-50 transition-colors disabled:opacity-60"
                        >
                          {isApproving === card.rawId ? "Working…" : "Decline"}
                        </button>
                        <button
                          onClick={() => setSelectedRequisitionId(card.rawId)}
                          className="text-[14px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              {(approveError || approveSuccess) && (
                <div className="rounded-[12px] border px-4 py-3 text-[13px] font-semibold">
                  {approveError && (
                    <div className="text-rose-600">{approveError}</div>
                  )}
                  {approveSuccess && (
                    <div className="text-emerald-600">{approveSuccess}</div>
                  )}
                </div>
              )}

              {/* Pending Requisitions Data Table */}
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">Pending Requisitions</h2>
                  <span className="text-[13px] font-bold text-[#6B7280]">{pendingRows.length} awaiting</span>
                </div>

                <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">ID & DESCRIPTION</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">CATEGORY</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">AMOUNT</th>
                          <th className="px-5 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase">STATUS</th>
                          <th className="px-6 py-5 text-[11px] font-extrabold tracking-widest text-[#6B7280] uppercase text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {pendingRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#9CA3AF]">
                              {reqsLoading ? "Loading…" : "No other requisitions are waiting on you."}
                            </td>
                          </tr>
                        )}
                        {pendingRows.slice(0, 8).map((row) => (
                          <tr key={row.rawId} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-[14px] font-black text-[#111827]">{row.id} {row.description}</div>
                              <div className="text-[12px] font-semibold text-[#9CA3AF] mt-0.5">Requested by {row.requestedBy}{row.payee ? ` · Pay to ${row.payee}` : ""}</div>
                            </td>
                            <td className="px-5 py-4 text-[13px] font-semibold text-[#4B5563]">{row.category}</td>
                            <td className="px-5 py-4 text-[15px] font-black text-[#111827]">{row.amount}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-[6px] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedRequisitionId(row.rawId)}
                                  className="h-8 rounded-[6px] bg-[#2563EB] px-3 text-[12px] font-bold text-white hover:bg-[#1D4ED8] transition-colors"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => decide(row.rawId, "declined")}
                                  disabled={isApproving !== null}
                                  className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-bold text-[#B91C1C] hover:bg-rose-50 transition-colors disabled:opacity-60"
                                >
                                  Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Area (340px) */}
            <div className="flex flex-col gap-6">

              {/* Expense Distribution */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-8">Expense Distribution</h3>
                {expenseChart.segments.length === 0 && (
                  <p className="-mt-6 mb-6 text-[12px] text-[#9CA3AF]">No expenses posted yet.</p>
                )}
                <div className="relative flex justify-center items-center mb-10 w-full py-4">
                  <div className="relative h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]">
                    <div
                      className="absolute inset-0 rounded-full rotate-[-210deg]"
                      style={{ background: expenseChart.background }}
                    />
                    <div className="absolute inset-[22px] rounded-full bg-white" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-extrabold text-[#111827]">
                        Expense Mix
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                  {expenseChart.segments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#111827]">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                      </div>
                      <div className="text-[13px] font-bold text-[#6B7280]">{segment.percentage.toFixed(2)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Budget Alerts */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Critical Budget Alerts</h3>

                <div className="space-y-5">
                  {budgetAlerts.length === 0 ? (
                    <div className="text-[12px] text-[#9CA3AF]">No approved budgets to track yet.</div>
                  ) : (
                    budgetAlerts.map((b) => {
                      const tone = b.pct >= 90 ? "rose" : b.pct >= 75 ? "orange" : "blue"
                      return (
                        <div key={b.id}>
                          <div className="flex justify-between items-end mb-2">
                            <div className="text-[12px] font-extrabold text-[#111827] truncate pr-2">{b.title}</div>
                            <div className={`text-[11px] font-bold shrink-0 ${tone === "rose" ? "text-rose-500" : tone === "orange" ? "text-orange-500" : "text-[#3B5BDB]"}`}>{b.pct}% used</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#F3F4F6] overflow-hidden">
                            <div className={`h-full rounded-full ${tone === "rose" ? "bg-rose-500" : tone === "orange" ? "bg-orange-500" : "bg-[#3B5BDB]"}`} style={{ width: `${b.pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col h-fit">
                <h3 className="text-[15px] font-extrabold text-[#111827] tracking-tight mb-5">Recent Activity</h3>

                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#F3F4F6]">
                  {recentActivity.length === 0 && (
                    <div className="text-[12px] text-[#9CA3AF] pl-8">No requisitions yet.</div>
                  )}
                  {recentActivity.map((item) => (
                    <div key={item.rawId} className="relative flex gap-4">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-white flex items-center justify-center z-10 border-2 border-white">
                        <CheckCircle2 className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="text-[13px] font-extrabold text-[#111827]">{item.id} {item.status}</div>
                        <div className="text-[12px] font-semibold text-[#6B7280]">{item.description} - {item.amount}</div>
                        <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">{item.timeLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="mt-8 w-full h-[44px] rounded-[10px] border-[#E5E7EB] text-[13px] font-bold text-[#111827] shadow-sm hover:bg-gray-50 flex items-center justify-center">
                  Full Transaction Log
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


