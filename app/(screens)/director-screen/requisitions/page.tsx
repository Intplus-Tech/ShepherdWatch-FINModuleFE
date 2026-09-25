"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ClipboardList, Landmark, RefreshCw } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { RequisitionDetailsModal } from "@/components/modals/RequisitionDetailsModal"
import { useRequisitions } from "@/components/hooks/useRequisitions"
import { useToast } from "@/components/ui/toast"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { decodeRequisitionDetails, payeeSummary } from "@/lib/requisition-details"

const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)

const shortDate = (iso?: string) => {
  const d = iso ? new Date(iso) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
}

/**
 * Final approval for expense requisitions.
 *
 * A request reaches a Director once the branch pastor has approved it. Only a
 * Director's approval moves it to APPROVED, which is what lets the branch
 * accountant post the expense against it. Over-budget requests need an
 * override with a written reason instead of a plain approval.
 */
export default function Page() {
  const { pushToast } = useToast()
  const [tab, setTab] = useState<"pending_director" | "approved" | "pending_pastor">("pending_director")
  const { requisitions, loading, error, refresh } = useRequisitions({ status: tab, limit: 100 })

  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      [...requisitions]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .map((r) => {
          const details = decodeRequisitionDetails(r.justification ?? "")
          return {
            raw: r,
            id: r.id,
            number: r.requisitionNumber || r.reference || r.id.slice(-6).toUpperCase(),
            title: details.title || r.coaName || "Requisition",
            justification: details.justification || r.justification || "",
            payee: payeeSummary(details),
            attachmentUrl: details.attachmentUrl,
            attachmentName: details.attachmentName,
            amount: Number(r.amount ?? 0),
            budgetHead: r.coaName || "Unassigned",
            requestedBy: r.requestedBy || "Branch user",
            createdAt: r.createdAt,
            requiredDate: r.requiredDate,
          }
        }),
    [requisitions]
  )

  const selected = rows.find((r) => r.id === selectedId) ?? null

  const decide = async (id: string, action: "approved" | "declined") => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(id)}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({ action, comment: action === "approved" ? "Approved by the Director." : "Declined by the Director." }),
      })
      if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "The decision could not be recorded."))
      pushToast(
        action === "approved"
          ? "Approved — the branch accountant can now post the expense against it."
          : "Requisition declined.",
        "success"
      )
      setSelectedId(null)
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "The decision could not be recorded.", "error")
    } finally {
      setBusyId(null)
    }
  }

  /** Approve a request that exceeds its budget head, with the reason on record. */
  const override = async (id: string, justification: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(id)}/override`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() },
        credentials: "include",
        body: JSON.stringify({ overrideJustification: justification }),
      })
      if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "The override could not be recorded."))
      pushToast("Override authorised — the requisition is approved and ready for payment.", "success")
      setSelectedId(null)
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "The override could not be recorded.", "error")
    } finally {
      setBusyId(null)
    }
  }

  const TABS = [
    { key: "pending_director" as const, label: "Awaiting your approval" },
    { key: "pending_pastor" as const, label: "With branch pastors" },
    { key: "approved" as const, label: "Approved" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/requisitions"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Expense Requisitions" subtitle="Final approval before a branch can pay" />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-4">
            <div className="inline-flex rounded-[8px] bg-[#EEF1F6] p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-8 px-3.5 rounded-[6px] text-[12px] font-bold transition-colors ${tab === t.key ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={refresh}
              className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151] hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {tab === "pending_director" && (
            <div className="mb-4 rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12.5px] text-[#1D4ED8]">
              A branch accountant can only post an expense once the requisition is approved here.
            </div>
          )}

          <section className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm overflow-hidden">
            {error && <div className="px-5 py-3 text-[12px] text-rose-600">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[900px]">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6] bg-[#F8FAFC]">
                    <th className="px-5 py-3">Requisition</th>
                    <th className="px-3 py-3">Budget head</th>
                    <th className="px-3 py-3">Requested by</th>
                    <th className="px-3 py-3">Pay to</th>
                    <th className="px-3 py-3">Needed by</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-[#9CA3AF]">Loading requisitions…</td></tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                        <div className="text-[14px] font-bold text-[#111827] mt-3">
                          {tab === "pending_director" ? "Nothing awaiting your approval" : tab === "approved" ? "No approved requisitions yet" : "Nothing with the branch pastors"}
                        </div>
                        <div className="text-[12.5px] text-[#6B7280] mt-1">
                          {tab === "pending_director"
                            ? "Requests appear here once a branch pastor has approved them."
                            : tab === "approved"
                              ? "Approved requests become available to branch accountants to pay."
                              : "Requests submitted by branch admins wait with their pastor first."}
                        </div>
                      </td>
                    </tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] align-top">
                      <td className="px-5 py-3">
                        <div className="font-mono text-[11.5px] font-bold text-[#2563EB]">{r.number}</div>
                        <div className="font-semibold text-[#111827] mt-0.5">{r.title}</div>
                        <div className="text-[11px] text-[#9CA3AF]">Raised {shortDate(r.createdAt)}</div>
                      </td>
                      <td className="px-3 py-3 text-[#374151] font-medium">{r.budgetHead}</td>
                      <td className="px-3 py-3 text-[#374151]">{r.requestedBy}</td>
                      <td className="px-3 py-3">
                        {r.payee ? (
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#374151]"><Landmark className="h-3.5 w-3.5 text-[#9CA3AF]" />{r.payee}</span>
                        ) : (
                          <span className="text-[11px] text-[#9CA3AF]">Not given</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-[#374151]">{shortDate(r.requiredDate)}</td>
                      <td className="px-3 py-3 text-right font-mono font-extrabold">{naira(r.amount)}</td>
                      <td className="px-5 py-3 text-right">
                        {tab === "approved" ? (
                          <span className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3 w-3" />Approved</span>
                        ) : tab === "pending_pastor" ? (
                          <span className="inline-flex rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap">With pastor</span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedId(r.id)}
                              className="h-8 rounded-[6px] bg-[#2563EB] px-3 text-[12px] font-bold text-white hover:bg-[#1D4ED8] transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => decide(r.id, "declined")}
                              disabled={busyId !== null}
                              className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-bold text-[#B91C1C] hover:bg-rose-50 transition-colors disabled:opacity-60"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#EEF1F6] text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                <span className="inline-flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />{rows.length} {rows.length === 1 ? "requisition" : "requisitions"}</span>
                <span>Total: <span className="font-mono text-[#111827]">{naira(rows.reduce((s, r) => s + r.amount, 0))}</span></span>
              </div>
            )}
          </section>
        </div>
      </main>

      <RequisitionDetailsModal
        isOpen={selected !== null}
        onClose={() => setSelectedId(null)}
        isAuthorizing={busyId !== null}
        canOverride
        requisition={
          selected
            ? {
                id: selected.id,
                requisitionNumber: selected.number,
                amount: selected.amount,
                description: selected.title,
                justification: selected.justification,
                coaName: selected.budgetHead,
                requestedBy: selected.requestedBy,
                status: selected.raw.currentStatus,
                payee: selected.payee,
                attachmentUrl: selected.attachmentUrl,
                attachmentName: selected.attachmentName,
              }
            : null
        }
        onApprove={async () => {
          if (selected) await decide(selected.id, "approved")
        }}
        onDecline={async () => {
          if (selected) await decide(selected.id, "declined")
        }}
        onOverride={async (reason) => {
          if (selected) await override(selected.id, reason)
        }}
      />
    </div>
  )
}
