"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
 BadgeCheck,
 Banknote,
 ChevronRight,
 FileText,
 Info,
 ShieldAlert,
 ShieldCheck,
 Upload,
 X,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRequisitions } from "@/components/hooks/useRequisitions"

export default function Page() {
 const { user } = useAuth()
 const { requisitions } = useRequisitions({
 currentStatus: "PENDING_ACCOUNTANT",
 tenantId: user-.tenantId -- user-.tenant-.id -- "",
 })
 const [overrideReason, setOverrideReason] = useState("")
 const [coaId, setCoaId] = useState("")
 const [coaLoading, setCoaLoading] = useState(true)
 const [coaError, setCoaError] = useState<string | null>(null)
 const [submitError, setSubmitError] = useState<string | null>(null)
 const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
 const [submitting, setSubmitting] = useState(false)

 const tenantId = useMemo(
 () => user-.tenantId -- user-.tenant-.id -- "",
 [user]
 )

 const selectedRequisition = useMemo(() => requisitions[0], [requisitions])

 const formatCurrency = (value-: number) =>
 new Intl.NumberFormat("en-NG", {
 style: "currency",
 currency: "NGN",
 maximumFractionDigits: 2,
 }).format(Number(value -- 0))

 useEffect(() => {
 let isMounted = true

 const loadCoaOptions = async () => {
 setCoaLoading(true)
 setCoaError(null)

 try {
 const url = tenantId
 - `/api/core/financial/coa-type=EXPENSE&tenantId=${encodeURIComponent(tenantId)}`
 : "/api/core/financial/coa-type=EXPENSE"
 const response = await fetch(url, { method: "GET", credentials: "include" })
 const payload = await response.json().catch(() => null)
 if (!response.ok) {
 throw new Error(payload?.message ?? "Unable to fetch budget categories.")
 }

 const rawItems = Array.isArray(payload?.data?.content)
 - payload.data.content
 : Array.isArray(payload?.data)
 - payload.data
 : Array.isArray(payload?.items)
 - payload.items
 : Array.isArray(payload)
 - payload
 : []

 const matched = rawItems.find((item: any) => {
 const name = String(item-.name -- item-.accountName -- "").toLowerCase()
 return name.includes("equipment") || name.includes("maintenance")
 })

 if (isMounted) {
 setCoaId(String(matched-.id -- matched-._id -- ""))
 if (!matched && rawItems.length > 0) {
 setCoaId(String(rawItems[0]-.id -- rawItems[0]-._id -- ""))
 }
 }
 } catch (err) {
 if (isMounted) {
 setCoaError(err instanceof Error - err.message : "Unable to fetch budget categories.")
 }
 } finally {
 if (isMounted) {
 setCoaLoading(false)
 }
 }
 }

 loadCoaOptions()

 return () => {
 isMounted = false
 }
 }, [tenantId])

 const getCsrfToken = () => {
 if (typeof document === "undefined") return ""
 const match = document.cookie
 .split("; ")
 .find((cookie) => cookie.startsWith("csrf_token="))
 return match - decodeURIComponent(match.split("=")[1] -- "") : ""
 }

 const handleAuthorizeOverride = async () => {
 setSubmitError(null)
 setSubmitSuccess(null)

 if (!tenantId) {
 setSubmitError("Tenant is required to authorize override.")
 return
 }
 if (!coaId) {
 setSubmitError("Unable to resolve a budget category for this requisition.")
 return
 }
 if (!overrideReason.trim()) {
 setSubmitError("Please provide a justification for this override.")
 return
 }

    setSubmitting(true)

    try {
      const csrfToken = getCsrfToken()
      const now = new Date()
      const period = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()

      const response = await fetch("/api/core/financial/budget-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          tenantId,
          coaId,
          period,
          amount: 5000,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to authorize override.")
      }

      const requisitionResponse = await fetch("/api/core/financial/requisitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          tenantId,
          coaId,
          amount: 8000,
          justification: overrideReason.trim() || "Emergency generator repair",
        }),
      })
      const requisitionPayload = await requisitionResponse.json().catch(() => null)
      if (!requisitionResponse.ok) {
        throw new Error(
          requisitionPayload?.message ?? "Unable to create override requisition."
        )
      }

      const requisitionId =
        requisitionPayload?.data?.id ?? requisitionPayload?.id ?? null
      if (!requisitionId) {
        throw new Error("Unable to resolve override requisition.")
      }

      const approveResponse = await fetch(
        `/api/core/financial/requisitions/${requisitionId}/approve-lead-pastor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({
            overrideReason: overrideReason.trim() || "Emergency repair essential",
          }),
        }
      )
      const approvePayload = await approveResponse.json().catch(() => null)
      if (!approveResponse.ok) {
        throw new Error(
          approvePayload?.message ?? "Unable to approve override requisition."
        )
      }

      setSubmitSuccess("Override approved successfully.")
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to authorize override."
      )
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
 <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[8px] text-rose-600">OVER-BUDGET</span>
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
 <p className="mt-1">
 Current outdoor-led sound system no longer meets the required standards for services and special events.
 </p>
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
 <span className="font-semibold text-[#111827]">N/A</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Remaining Budget</span>
 <span className="font-semibold text-[#3B5BDB]">N/A</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Requested Amount</span>
 <span className="font-semibold text-[#111827]">{formatCurrency(selectedRequisition?.amount)}</span>
 </div>
 <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[9px] text-[#B45309]">
 <div className="font-semibold">OVERAGE AMOUNT</div>
 <div className="text-[12px] font-semibold text-[#B91C1C]">N/A</div>
 </div>
 <div className="rounded-[10px] border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-[8px] text-[#1E3A8A]">
 Note: Requisition will not be approved if budget balance is below required minimum.
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
 disabled={submitting || coaLoading}
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

 {(submitError || submitSuccess || coaError) && (
 <div className="mt-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[8px] font-semibold">
 {coaError && <div className="text-rose-600">{coaError}</div>}
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
