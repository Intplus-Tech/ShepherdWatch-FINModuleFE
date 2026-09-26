"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  AlignLeft,
  CheckCircle2,
  FileSignature,
  FileText,
  Info,
  LayoutDashboard,
  Landmark,
  Paperclip,
  Triangle,
  X,
} from "lucide-react"
import { useRequisitionBudgetContext } from "@/components/hooks/useRequisitionBudgetContext"

/**
 * One requisition, everything an approver needs: what was asked for, what the
 * budget can carry, and the decision. Budget figures come from
 * `GET /requisitions/{id}/budget-context`, so the overage shown is the real
 * one for that budget head and month.
 */
interface RequisitionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  /** Approve at this approver's level. */
  onApprove?: () => void | Promise<void>
  onDecline?: () => void | Promise<void>
  /** Directors only: approve despite the overage, with a written reason. */
  onOverride?: (justification: string) => void | Promise<void>
  isAuthorizing?: boolean
  canOverride?: boolean
  requisition?: {
    id?: string
    reference?: string
    requisitionNumber?: string
    amount?: number | string
    justification?: string
    description?: string
    coaName?: string
    category?: string
    requestedBy?: string
    status?: string
    branchName?: string
    payee?: string
    attachmentUrl?: string
    attachmentName?: string
  } | null
}

const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function RequisitionDetailsModal({
  isOpen,
  onClose,
  onApprove,
  onDecline,
  onOverride,
  isAuthorizing = false,
  canOverride = false,
  requisition,
}: RequisitionDetailsModalProps) {
  const { data: budget, loading: budgetLoading, error: budgetError } = useRequisitionBudgetContext(
    isOpen ? requisition?.id : undefined
  )
  const [overrideReason, setOverrideReason] = useState("")
  useEffect(() => {
    if (isOpen) setOverrideReason("")
  }, [isOpen, requisition?.id])

  if (!isOpen || !requisition) return null

  const reference = requisition.requisitionNumber || requisition.reference || requisition.id?.slice(-6).toUpperCase() || ""
  const amountValue = typeof requisition.amount === "number" ? requisition.amount : Number(String(requisition.amount ?? "").replace(/[^\d.]/g, "")) || 0
  const title = requisition.description || "Requisition"
  const budgetHead = requisition.coaName || requisition.category || "Unassigned budget head"
  const status = String(requisition.status ?? "").replace(/_/g, " ").toUpperCase()

  // Only claim an overage once the real figures have come back — and only when
  // there is an allocation to exceed. A zero allocation means the figure is
  // missing, not that the head is exhausted.
  const overBudget = Boolean(budget?.isOverBudget)
  // A zero allocation means nothing was budgeted for this head, not that the
  // head is exhausted — worth saying differently.
  const unallocated = overBudget && (budget?.allocatedAmount ?? 0) <= 0
  const allocated = budget?.allocatedAmount ?? 0
  const spent = budget?.totalSpent ?? 0
  const usedPct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0
  const period = budget?.month
    ? `${MONTHS[budget.month - 1]} ${budget.fiscalYear ?? ""}`.trim()
    : budget?.period === "annual"
      ? `FY ${budget.fiscalYear ?? ""}`.trim()
      : ""

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
      <div className="relative flex w-[1138px] max-w-[95vw] max-h-[95vh] flex-col rounded-[20px] bg-white shadow-2xl overflow-y-auto font-sans">
        <button onClick={onClose} className="absolute right-6 top-6 text-[#6B7280] hover:text-[#111827] transition-colors" aria-label="Close">
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="px-6 sm:px-[56px] pt-[50px] pb-[32px] shrink-0">
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <h1 className="text-[22px] sm:text-[26px] text-[#111827] tracking-tight" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
              Requisition Approval: #{reference}
            </h1>
            {status && (
              <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-widest">
                {status}
              </span>
            )}
            {!budgetLoading && overBudget && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${unallocated ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-500"}`}
              >
                {unallocated ? "No budget allocated" : "Over-budget"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[15px] font-medium text-[#6B7280]">
              {title}
              {requisition.requestedBy ? ` · requested by ${requisition.requestedBy}` : ""}
            </p>
          </div>
        </div>

        {/* Three columns */}
        <div className="px-6 sm:px-[56px] pb-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white">
            {/* Requisition details */}
            <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <FileText className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Requisition Details</h2>
              </div>

              <div className="rounded-[12px] bg-[#F9FAFB] p-5 mb-5">
                <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-1">TOTAL REQUESTED AMOUNT</div>
                <div className="text-[28px] text-[#111827] leading-none" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
                  {naira(amountValue)}
                </div>
              </div>

              <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-2">BUDGET HEAD</div>
              <div className="flex items-center gap-2 mb-5">
                <Triangle className="h-3.5 w-3.5 text-[#4B5563] fill-current" />
                <span className="text-[14px] font-bold text-[#111827]">{budgetHead}</span>
              </div>

              {requisition.payee && (
                <>
                  <div className="h-[1px] w-full bg-[#E5E7EB] mb-5" />
                  <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-2">PAY TO</div>
                  <div className="flex items-start gap-2 mb-5">
                    <Landmark className="h-4 w-4 text-[#4B5563] shrink-0 mt-0.5" />
                    <span className="text-[13.5px] font-semibold text-[#111827]">{requisition.payee}</span>
                  </div>
                </>
              )}

              <div className="h-[1px] w-full bg-[#E5E7EB] mb-5" />

              <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-3">JUSTIFICATION</div>
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF]">
                  <AlignLeft className="h-4 w-4 text-[#2563EB]" strokeWidth={2.5} />
                </div>
                <p className="text-[13px] font-medium text-[#4B5563] leading-relaxed italic">
                  {requisition.justification ? `"${requisition.justification}"` : "No justification was given."}
                </p>
              </div>
            </div>

            {/* Budget context */}
            <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <LayoutDashboard className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Budget Context{period ? ` · ${period}` : ""}</h2>
              </div>

              {budgetLoading ? (
                <div className="text-[13px] text-[#9CA3AF]">Checking the budget…</div>
              ) : budgetError ? (
                <div className="text-[13px] text-rose-600">{budgetError}</div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-[#6B7280]">{budget?.period === "annual" ? "Annual allocation" : "Monthly allocation"}</span>
                      <span className="text-[13px] font-extrabold text-[#111827]">{naira(allocated)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div className={`h-full rounded-full ${usedPct >= 100 ? "bg-rose-500" : "bg-[#2563EB]"}`} style={{ width: `${usedPct}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF]">
                      {allocated > 0 ? `${naira(spent)} spent · ${usedPct}% used` : "No budget has been allocated to this head for the period."}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] px-4 py-3 mb-3">
                    <span className="text-[12px] font-bold text-[#6B7280]">Remaining Budget</span>
                    <span className={`text-[15px] font-black ${(budget?.remainingBudget ?? 0) > 0 ? "text-[#2563EB]" : "text-rose-500"}`}>
                      {naira(budget?.remainingBudget ?? 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] px-4 py-3 mb-4">
                    <span className="text-[12px] font-bold text-[#6B7280]">Requested Amount</span>
                    <span className="text-[15px] font-black text-[#111827]">{naira(budget?.requestedAmount ?? amountValue)}</span>
                  </div>

                  {unallocated ? (
                    <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-4 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
                        <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-widest">No budget allocated</span>
                      </div>
                      <p className="text-[11.5px] text-amber-800 leading-relaxed">
                        Nothing has been budgeted for {budgetHead}, so there is nothing to spend against. Allocate a budget to this
                        head, or authorise the request as an overage.
                      </p>
                    </div>
                  ) : overBudget ? (
                    <div className="flex items-center justify-between rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-4 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" strokeWidth={2.5} />
                        <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-widest">OVERAGE AMOUNT</span>
                      </div>
                      <span className="text-[18px] font-black text-rose-500">{naira(budget?.overageAmount ?? 0)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-4 mb-4">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                      <span className="text-[12px] font-bold text-emerald-700">This request fits within the remaining budget.</span>
                    </div>
                  )}

                  {overBudget && !unallocated && (
                    <div className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] p-4 mt-auto">
                      <p className="text-[11px] font-semibold text-[#1D4ED8] leading-relaxed">
                        <span className="font-extrabold">Note:</span> This request exceeds what is left on {budgetHead} by{" "}
                        {naira(budget?.overageAmount ?? 0)}. It cannot be approved as it stands — either a Director authorises the
                        overage, or the branch raises the budget for this head.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Authorization */}
            <div className="flex flex-col p-6">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <FileSignature className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Authorization</h2>
              </div>

              {canOverride && overBudget && (
                <div className="mb-4">
                  <label className="mb-2 flex text-[10px] font-extrabold tracking-widest text-[#6B7280] uppercase">
                    JUSTIFICATION FOR OVERRIDE <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full resize-none rounded-[10px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    rows={4}
                    placeholder="State why this overage is critical for branch operations…"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {canOverride && !overBudget && !budgetLoading && (
                  <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#4B5563]">
                    This one fits its budget, so the branch pastor approves it. Nothing for you to do here.
                  </div>
                )}
                {canOverride && overBudget ? (
                  <button
                    type="button"
                    onClick={() => onOverride?.(overrideReason)}
                    disabled={isAuthorizing || overrideReason.trim().length === 0}
                    title={overrideReason.trim() ? "" : "Write the reason for the override first"}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-[13px] font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
                  >
                    <FileSignature className="h-4 w-4" />
                    {isAuthorizing ? "Authorizing…" : "Authorize Override"}
                  </button>
                ) : onApprove ? (
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={isAuthorizing || overBudget}
                    title={overBudget ? "Over budget — a Director has to authorise the overage first" : ""}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-[13px] font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isAuthorizing ? "Working…" : overBudget ? "Blocked — needs an override" : "Approve Requisition"}
                  </button>
                ) : null}
                {onDecline && (
                  <button
                    type="button"
                    onClick={onDecline}
                    disabled={isAuthorizing}
                    className="flex h-11 w-full items-center justify-center text-[13px] font-bold text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Decline Requisition
                  </button>
                )}
              </div>

              <div className="mt-auto flex gap-3 rounded-[10px] bg-[#F9FAFB] p-4">
                <Info className="h-4 w-4 shrink-0 text-[#6B7280]" />
                <p className="text-[10px] font-medium text-[#6B7280] leading-relaxed">
                  Every decision is recorded against this requisition with your role, the time, and any comment.
                  {canOverride
                    ? " An override is logged with your written reason."
                    : " Approving releases it to the branch accountant to pay."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attachment */}
        {requisition.attachmentUrl && (
          <div className="px-6 sm:px-[56px] pb-[50px]">
            <a
              href={requisition.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-[12px] border border-[#E5E7EB] p-4 bg-white shadow-sm hover:border-[#BFDBFE] transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF]">
                <Paperclip className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold text-[#111827]">Supporting Document</div>
                <div className="text-[12px] font-medium text-[#2563EB] truncate">{requisition.attachmentName || "View attachment"}</div>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
