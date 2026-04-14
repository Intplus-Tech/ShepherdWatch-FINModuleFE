"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
 BadgeCheck,
 Banknote,
 ChevronRight,
 FileText,
 ShieldAlert,
 ShieldCheck,
 Upload,
 X,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"
import { useRequisitionBudgetContext } from "@/components/hooks/useRequisitionBudgetContext"

export default function Page() {
  const { user } = useAuth()
  const { requisitions } = useRequisitionInbox({
    branchId: user?.tenantId ?? user?.tenant?.id ?? "",
  })
  const [overrideReason, setOverrideReason] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedRequisition = useMemo(() => requisitions[0], [requisitions])
  const {
    data: budgetContext,
    loading: budgetContextLoading,
    error: budgetContextError,
  } = useRequisitionBudgetContext(selectedRequisition?.id)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0))

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleAuthorizeOverride = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!overrideReason.trim()) {
      setSubmitError("Please provide a justification for this override.")
      return
    }
    const requisitionId = selectedRequisition?.id
    if (!requisitionId) {
      setSubmitError("Unable to resolve requisition for override.")
      return
    }

    setSubmitting(true)

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/api/core/financial/requisitions/${requisitionId}/override`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          overrideJustification: overrideReason.trim(),
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to authorize requisition override.")
      }

      setSubmitSuccess("Requisition override authorized successfully.")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to authorize override.")
    } finally {
      setSubmitting(false)
    }
  }

 return (
 <div className="min-h-screen bg-[#1f1f1f] p-6">
 <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
 <div className="relative min-h-[760px] bg-[#F7F8FC]">
 <div className="absolute inset-0 bg-black/20" />

 <div className="relative z-10 px-6 py-6">
 <div className="flex items-center justify-between rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
 <div className="flex items-start gap-3">
 <div className="mt-1 h-9 w-9 rounded-[10px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
 <BadgeCheck className="h-4 w-4" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-[14px] font-semibold text-[#111827]">
 Requisition Approval: {selectedRequisition?.reference ? `#${selectedRequisition.reference}` : selectedRequisition?.id ? `#${selectedRequisition.id.slice(0, 8).toUpperCase()}` : "N/A"}
 </h2>
 <span className={`rounded-full px-2 py-0.5 text-[8px] ${budgetContext?.isOverBudget ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
 {budgetContext?.isOverBudget ? "OVER-BUDGET" : "WITHIN BUDGET"}
 </span>
 </div>
 <p className="text-[9px] text-[#9CA3AF]">{selectedRequisition?.justification ?? "Requisition"} - {selectedRequisition?.requestedBy ? `Requested by ${selectedRequisition.requestedBy}` : "Branch"}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
 View Full History
 </Button>
 <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
 <X className="h-3.5 w-3.5" />
 </div>
 </div>
 </div>

 <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr_1fr]">
 <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
 <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
 <FileText className="h-4 w-4 text-[#3B5BDB]" />
 Requisition Details
 </div>

 <div className="mt-4">
 <div className="text-[8px] text-[#9CA3AF]">TOTAL REQUESTED AMOUNT</div>
 <div className="text-[16px] font-semibold text-[#111827]">{formatCurrency(selectedRequisition?.amount)}</div>
 </div>

 <div className="mt-4 text-[9px] text-[#6B7280]">
 <div className="font-semibold text-[#111827]">Budget Head</div>
 <div>{selectedRequisition?.coaName ?? "N/A"}</div>
 </div>

 <div className="mt-4 text-[9px] text-[#6B7280]">
 <div className="font-semibold text-[#111827]">Accountant&apos;s Justification</div>
 <p className="mt-1">{selectedRequisition?.justification ?? "No justification provided."}</p>


 </div>
 </div>

 <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
 <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
 <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
 Budget Context
 </div>

 <div className="mt-4 space-y-3 text-[9px] text-[#6B7280]">
 <div className="flex items-center justify-between">
 <span>Monthly Allocation</span>
 <span className="font-semibold text-[#111827]">{budgetContextLoading ? "Loading..." : formatCurrency(budgetContext?.allocatedAmount ?? 0)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Remaining Budget</span>
 <span className="font-semibold text-[#3B5BDB]">{budgetContextLoading ? "Loading..." : formatCurrency(budgetContext?.remainingBudget ?? 0)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Requested Amount</span>
 <span className="font-semibold text-[#111827]">{formatCurrency(selectedRequisition?.amount)}</span>
 </div>
 <div className={`rounded-[10px] border px-3 py-2 text-[9px] ${budgetContext?.isOverBudget ? "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
 <div className="font-semibold">OVERAGE AMOUNT</div>
 <div className={`text-[12px] font-semibold ${budgetContext?.isOverBudget ? "text-[#B91C1C]" : "text-emerald-700"}`}>
 {budgetContextLoading ? "Loading..." : formatCurrency(budgetContext?.overageAmount ?? 0)}
 </div>
 </div>
 <div className="rounded-[10px] border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-[8px] text-[#1E3A8A]">
 Note: Use this budget context to determine whether override authorization is required.
 </div>
 </div>
 </div>

 <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
 <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
 <ShieldAlert className="h-4 w-4 text-[#3B5BDB]" />
 Authorization
 </div>
 <div className="mt-2 text-[8px] text-[#9CA3AF]">DIGITAL JUSTIFICATION FOR OVERRIDE *</div>
 <textarea
 value={overrideReason}
 onChange={(event) => setOverrideReason(event.target.value)}
 className="mt-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[9px] text-[#6B7280] w-full min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] transition-all"
 placeholder="State the reasons why this override is critical for branch operations."
 />

 <div className="mt-4 space-y-2">
 <Button
 size="sm"
 onClick={handleAuthorizeOverride}
 disabled={submitting || budgetContextLoading || !budgetContext?.isOverBudget}
 className="h-8 w-full rounded-[8px] bg-[#3B5BDB] text-[9px] text-white disabled:opacity-60 disabled:cursor-not-allowed"
 >
 <ShieldCheck className="h-3.5 w-3.5" />
 {submitting ? "Authorizing..." : "Authorize Override"}
 </Button>
 <Button variant="outline" size="sm" className="h-8 w-full rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
 <ChevronRight className="h-3.5 w-3.5" />
 Request Alternative Quote
 </Button>
 <Button variant="outline" size="sm" className="h-8 w-full rounded-[8px] border-rose-200 bg-rose-50 text-[9px] text-rose-600">
 Decline Requisition
 </Button>
 </div>

 {(submitError || submitSuccess || budgetContextError) && (
 <div className="mt-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[8px] font-semibold">
 {budgetContextError && <div className="text-rose-600">{budgetContextError}</div>}
 {submitError && <div className="text-rose-600">{submitError}</div>}
 {submitSuccess && <div className="text-emerald-600">{submitSuccess}</div>}
 </div>
 )}

 <div className="mt-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[8px] text-[#9CA3AF]">
 This action will permanently update the Global Budget utilization record for Director&apos;s Headquarters.
 </div>
 </div>
 </div>

 <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
 <div className="flex items-center gap-3 rounded-[12px] border border-[#EEF1F6] bg-white px-4 py-3 text-[9px] text-[#6B7280]">
 <div className="h-8 w-8 rounded-[10px] bg-[#ECFDF3] text-[#16A34A] flex items-center justify-center">
 <Banknote className="h-4 w-4" />
 </div>
 <div>
 <div className="font-semibold text-[#111827]">Preferred Vendor</div>
 <div>SoundMaster Pro (Via Verified Platinum)</div>
 </div>
 </div>
 <div className="flex items-center gap-3 rounded-[12px] border border-[#EEF1F6] bg-white px-4 py-3 text-[9px] text-[#6B7280]">
 <div className="h-8 w-8 rounded-[10px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
 <Upload className="h-4 w-4" />
 </div>
 <div>
 <div className="font-semibold text-[#111827]">Supporting Documents</div>
 <div>Technical_Quote_Audio_Y3.pdf 1.2MB</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
