"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, ClipboardList, Landmark, RefreshCw } from "lucide-react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { RequisitionDetailsModal } from "@/components/modals/RequisitionDetailsModal"
import { useRequisitions } from "@/components/hooks/useRequisitions"
import { useToast } from "@/components/ui/toast"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { budgetIssue, fetchBudgetContexts, payeeSummary, readRequisitionDetails, type BudgetFit } from "@/lib/requisition-details"

const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)

const shortDate = (iso?: string) => {
  const d = iso ? new Date(iso) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"
}

/**
 * Oversight of expense requisitions, and the one thing only a Director can do.
 *
 * Branch pastors approve their own branch's requests outright, so there is
 * nothing here for a Director to approve. The exception is a request that
 * exceeds its budget head: the API refuses a plain approval and requires a
 * Director's override, with a written reason, to release it.
 */
export default function Page() {
  const { pushToast } = useToast()
  const [tab, setTab] = useState<"controller" | "all">("controller")
  // "All branches" is unfiltered by default; the dropdown narrows it.
  const [branchFilter, setBranchFilter] = useState("")
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [fits, setFits] = useState<Record<string, BudgetFit>>({})
  /**
   * The controller's own queue is everything still moving through approval —
   * the ones that may need an override. "All branches" is the whole estate,
   * read-only, optionally narrowed to one branch.
   */
  const { requisitions, loading, error, refresh } = useRequisitions(
    tab === "controller"
      ? { status: "pending_pastor", limit: 100 }
      : { limit: 100, ...(branchFilter ? { branchId: branchFilter } : {}) }
  )

  useEffect(() => {
    let active = true
    fetch(`${API_V1}/branches?page=1&limit=100`, { credentials: "include" })
      .then((r) => (r.ok ? r.json().catch(() => null) : null))
      .then((json) => {
        if (!active) return
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json?.data?.content) ? json.data.content : []
        setBranches(
          (list as Record<string, unknown>[])
            .map((b) => ({ id: String(b._id ?? b.id ?? ""), name: String(b.name ?? "") }))
            .filter((b) => b.id && b.name)
        )
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      [...requisitions]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .map((r) => {
          const details = readRequisitionDetails(r)
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

  // Only over-budget requests need this screen; check each one's budget head.
  useEffect(() => {
    if (tab !== "controller" || rows.length === 0) {
      setFits({})
      return
    }
    let active = true
    fetchBudgetContexts(rows.map((r) => r.id)).then((next) => {
      if (active) setFits(next)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, rows.map((r) => r.id).join(",")])

  const needsOverride = (id: string) => Boolean(fits[id]?.isOverBudget)
  const blockedCount = rows.filter((r) => needsOverride(r.id)).length
  const unallocatedCount = rows.filter((r) => budgetIssue(fits[r.id]) === "unallocated").length
  const selected = rows.find((r) => r.id === selectedId) ?? null

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
      pushToast("Override authorised — the requisition is approved and the branch accountant can now pay it.", "success")
      setSelectedId(null)
      refresh()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "The override could not be recorded.", "error")
    } finally {
      setBusyId(null)
    }
  }

  const TABS = [
    { key: "controller" as const, label: "Finance Controller Request" },
    { key: "all" as const, label: "All Branches Request" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/requisitions"
        className="fixed inset-y-0 left-0 z-20 w-[260px] rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-6 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl">
          <ScreenHeader title="Expense Requisitions" subtitle="Oversight, and budget overrides" />

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
            <div className="flex items-center gap-2">
              {tab === "all" && (
                <select
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  aria-label="Filter by branch"
                  className="h-9 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#374151]"
                >
                  <option value="">All branches ({branches.length})</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={refresh}
                className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151] hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {tab === "all" ? (
            <div className="mb-4 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12.5px] text-[#4B5563]">
              Every requisition across the estate, read-only.{" "}
              {branchFilter
                ? "Showing one branch — switch the filter to see them all."
                : "Use the filter to narrow it to a single branch."}
            </div>
          ) : blockedCount > 0 ? (
            <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900">
              <span className="font-bold">
                {blockedCount} {blockedCount === 1 ? "request is" : "requests are"} blocked by the budget check.
              </span>{" "}
              A branch pastor cannot approve these; authorising the overage here releases them.
              {unallocatedCount > 0 && (
                <>
                  {" "}
                  <span className="font-bold">
                    {unallocatedCount} of them {unallocatedCount === 1 ? "has" : "have"} no budget at all
                  </span>{" "}
                  on the head {unallocatedCount === 1 ? "it was" : "they were"} raised against — the branch may need to budget for it
                  rather than rely on an override.
                </>
              )}
            </div>
          ) : (
            <div className="mb-4 rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12.5px] text-[#1D4ED8]">
              Branch pastors approve their own requests. Nothing here needs your approval — you only step in when a request exceeds its budget head.
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
                          {tab === "controller" ? "Nothing needs your attention" : "No requisitions found"}
                        </div>
                        <div className="text-[12.5px] text-[#6B7280] mt-1">
                          {tab === "controller"
                            ? "Requests appear here while they are with a branch pastor. You only act on one that exceeds its budget head."
                            : branchFilter
                              ? "This branch has raised no requisitions."
                              : "No branch has raised a requisition yet."}
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && rows.map((r) => (
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
                        {tab === "all" ? (
                          <span className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap ${
                            r.raw.currentStatus === "approved" || r.raw.currentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.raw.currentStatus === "declined"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-700"
                          }`}>
                            {String(r.raw.currentStatus ?? "").replace(/_/g, " ") || "—"}
                          </span>
                        ) : needsOverride(r.id) ? (
                          <button
                            onClick={() => setSelectedId(r.id)}
                            className="h-8 rounded-[6px] bg-[#2563EB] px-3 text-[12px] font-bold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
                          >
                            Authorize override
                          </button>
                        ) : (
                          <span className="inline-flex rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap">With pastor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && rows.length > 0 && (
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
        canOverride={tab === "controller"}
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
        onOverride={async (reason) => {
          if (selected) await override(selected.id, reason)
        }}
      />
    </div>
  )
}
