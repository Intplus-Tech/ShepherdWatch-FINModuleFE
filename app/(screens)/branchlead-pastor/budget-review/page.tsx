"use client"

import { API_V1 } from "@/lib/api"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  FolderOpen,
  Landmark,
  MessageCircle,
  Search,
  TrendingUp,
  Undo2,
  Users,
  Wallet,
} from "lucide-react"
import BranchLeadPastorSidebar from "@/components/navigation/BranchLeadPastorSidebar"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { useBudgetPerformance } from "@/components/hooks/useBudgetPerformance"
import { useToast } from "@/components/ui/toast"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { useAuth } from "@/components/auth/AuthProvider"
import { isThreadUnread, loadAccountHeadNames, loadThreadSummaries, threadKey, unreadCount, type ThreadSummary } from "@/lib/budget-threads"

// The three tabs are the API's three budget categories.
const TABS = [
  { key: "operational", label: "Operational", icon: FolderOpen },
  { key: "capital", label: "Capital", icon: Building2 },
  { key: "programs", label: "Program", icon: Users },
] as const
type TabKey = (typeof TABS)[number]["key"]

type Budget = {
  id: string
  category: TabKey
  status: string
  name: string
  amount: number
  submittedBy: string
  submittedAt: string
  fiscalYear: number
}

type Line = {
  id: string
  budgetId: string
  chartOfAccountId: string
  name: string
  code: string
  /** What the accountant proposed. */
  proposed: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value)

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  submitted: { label: "Pending Review", cls: "bg-amber-50 text-amber-600 ring-amber-500/20" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-600 ring-emerald-500/20" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600 ring-rose-500/20" },
  revision: { label: "Sent Back", cls: "bg-orange-50 text-orange-600 ring-orange-500/20" },
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600 ring-gray-500/20" },
}

export function BudgetReviewContent({ rightSidebar, initialTab, refreshKey = 0 }: { rightSidebar?: React.ReactNode; initialTab?: string; refreshKey?: number } = {}) {
  const router = useRouter()
  const { pushToast } = useToast()
  const { branchId } = useBranchContext()
  const { user } = useAuth()
  const userId = String((user as { id?: string } | null)?.id ?? "")

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)
  const reload = () => setReloadIndex((i) => i + 1)

  const [tab, setTab] = useState<TabKey>(TABS.some((t) => t.key === initialTab) ? (initialTab as TabKey) : "operational")
  // The pastor's allocation per line, prefilled with the proposal.
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [savingLineId, setSavingLineId] = useState<string | null>(null)
  const [acting, setActing] = useState<"approve" | "return" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  // Message activity per line, for the indicator on its thread button.
  const [threads, setThreads] = useState<Record<string, ThreadSummary>>({})
  const [threadsVersion, setThreadsVersion] = useState(0)

  const readList = (payload: unknown): Record<string, unknown>[] => {
    const body = payload as Record<string, unknown> | null
    const data = body?.data
    if (Array.isArray(data)) return data as Record<string, unknown>[]
    if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).content)) {
      return (data as Record<string, unknown>).content as Record<string, unknown>[]
    }
    return []
  }
  const idOf = (v: unknown) => (v && typeof v === "object" ? String((v as { _id?: string; id?: string })._id ?? (v as { id?: string }).id ?? "") : String(v ?? ""))
  const personOf = (v: unknown) => {
    if (v && typeof v === "object") {
      const p = v as { firstName?: string; lastName?: string; email?: string }
      return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.email || ""
    }
    return ""
  }

  // The most recently submitted proposal for the branch: every budget in the
  // same period (month · category) as the newest submitted one.
  useEffect(() => {
    if (!branchId) return
    let active = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_V1}/budgets?branchId=${encodeURIComponent(branchId)}&limit=100`, { credentials: "include" })
        const json = await res.json().catch(() => null)
        if (!res.ok) throw new Error(describeApiError(json, "Unable to load budgets."))
        const all: Budget[] = readList(json)
          .map((b) => ({
            id: String(b._id ?? b.id ?? ""),
            category: (String(b.category ?? "operational").replace(/^project$/, "programs") as TabKey) || "operational",
            status: String(b.status ?? "draft").toLowerCase(),
            name: String(b.name ?? b.title ?? ""),
            amount: Number(b.annualAmount ?? b.totalAmount ?? 0),
            submittedBy: personOf(b.submittedBy ?? b.createdBy),
            submittedAt: String(b.submittedAt ?? b.updatedAt ?? ""),
            fiscalYear: Number(b.fiscalYear ?? new Date().getFullYear()),
          }))
          .filter((b) => b.id)
        // Newest submitted (or, failing that, newest of any status) sets the period.
        const ranked = [...all].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        const lead = ranked.find((b) => b.status === "submitted") ?? ranked[0]
        const period = lead ? lead.name.split(" · ")[0] : ""
        // One budget per category, the first the API lists (its newest) — the
        // same one the accountant's page edits. Earlier duplicates in the
        // period are left out so their lines don't inflate the totals.
        const inPeriod: Budget[] = []
        for (const b of all) {
          if (!lead || b.name.split(" · ")[0] !== period) continue
          if (inPeriod.some((x) => x.category === b.category)) continue
          inPeriod.push(b)
        }
        if (!active) return
        setBudgets(inPeriod)

        // The allocation API returns only the account head's id; its name
        // lives on the head, so load the branch's heads to label the lines.
        const heads = await loadAccountHeadNames(branchId).catch(() => ({}) as Record<string, { name: string; code: string }>)

        const allocLists = await Promise.all(
          inPeriod.map((b) =>
            fetch(`${API_V1}/financial/budget-allocations?budgetId=${encodeURIComponent(b.id)}&limit=100`, { credentials: "include" })
              .then((r) => r.json().catch(() => null))
              .then((j) => readList(j).map((a) => ({ ...a, budgetId: b.id }) as Record<string, any>))
          )
        )
        if (!active) return
        const mapped: Line[] = allocLists.flat().map((a) => {
          const coa = a.chartOfAccountId as Record<string, unknown> | string | undefined
          const populated = coa && typeof coa === "object" ? coa : null
          const head = heads[idOf(coa)]
          return {
            id: String(a._id ?? a.id ?? ""),
            budgetId: String(a.budgetId),
            chartOfAccountId: idOf(coa),
            name: String(populated?.name ?? head?.name ?? a.notes ?? "Line item"),
            code: String(populated?.code ?? head?.code ?? ""),
            proposed: Number(a.allocatedAmount ?? a.amount ?? 0),
          }
        })
        setLines(mapped)
        setAllocations(Object.fromEntries(mapped.map((l) => [l.id, String(l.proposed)])))
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load budgets.")
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [branchId, reloadIndex])

  // Which lines have messages, and whether the latest is new to this user.
  useEffect(() => {
    if (budgets.length === 0) {
      setThreads({})
      return
    }
    let active = true
    loadThreadSummaries(budgets.map((b) => b.id)).then((t) => {
      if (active) setThreads(t)
    })
    return () => {
      active = false
    }
  }, [budgets, threadsVersion, refreshKey])
  useEffect(() => {
    // Coming back from a thread: refresh the indicators.
    const onFocus = () => setThreadsVersion((v) => v + 1)
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  // Spend to date against these budgets, for the cards.
  const { performanceData, fetchPerformance } = useBudgetPerformance()
  useEffect(() => {
    if (branchId) fetchPerformance({ branchId })
  }, [branchId, fetchPerformance])

  const lead = budgets.find((b) => b.status === "submitted") ?? budgets[0] ?? null
  const period = lead ? lead.name.split(" · ")[0] : ""
  const status = lead ? STATUS_PILL[lead.status] ?? STATUS_PILL.draft : null
  const canDecide = budgets.some((b) => b.status === "submitted")

  const allocated = (l: Line) => Number(String(allocations[l.id] ?? l.proposed).replace(/[^\d.]/g, "")) || 0
  const totalProposed = lines.reduce((s, l) => s + l.proposed, 0)
  const totalAllocated = lines.reduce((s, l) => s + allocated(l), 0)
  const spent = budgets.reduce((s, b) => {
    const p = (performanceData?.budgets ?? []).find((x) => x.budgetId === b.id)
    return s + Number(p?.spent ?? 0)
  }, 0)
  const variancePct = totalAllocated > 0 ? ((totalAllocated - spent) / totalAllocated) * 100 : 0

  const cards = [
    { title: "Total Budget Expense", value: formatCurrency(totalAllocated), meta: `${lines.length} line ${lines.length === 1 ? "item" : "items"}${period ? ` · ${period}` : ""}`, metaColor: "text-[#6B7280]", icon: Wallet, iconBg: "bg-[#EEF2FF]", iconColor: "text-[#3B5BDB]" },
    { title: "Total Actual to Date", value: formatCurrency(spent), meta: totalAllocated > 0 ? `${Math.round((spent / totalAllocated) * 100)}% of budget spent` : "No budget set", metaColor: "text-[#6B7280]", icon: TrendingUp, iconBg: "bg-[#ECFDF5]", iconColor: "text-[#10B981]" },
    { title: "Variance (%)", value: totalAllocated > 0 ? `${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%` : "—", meta: totalAllocated > 0 ? (variancePct >= 0 ? `${formatCurrency(totalAllocated - spent)} under budget` : `${formatCurrency(spent - totalAllocated)} over budget`) : "Add line items to compare", metaColor: variancePct >= 0 ? "text-[#10B981]" : "text-rose-600", icon: Landmark, iconBg: "bg-[#FAF5FF]", iconColor: "text-[#9333EA]" },
  ]

  // Lines with messages this user hasn't read, in table order, for the
  // "new messages" indicator — clicking it jumps to the first one.
  const pendingLines = lines
    .map((l) => ({ line: l, unread: unreadCount(threads[threadKey(l.budgetId, l.chartOfAccountId)], userId, l.budgetId, l.chartOfAccountId) }))
    .filter((x) => x.unread > 0)
  const pendingTotal = pendingLines.reduce((s, x) => s + x.unread, 0)

  const tabBudget = budgets.find((b) => b.category === tab) ?? null
  const tabLines = lines.filter((l) => tabBudget && l.budgetId === tabBudget.id)
  const tabProposed = tabLines.reduce((s, l) => s + l.proposed, 0)
  const tabAllocated = tabLines.reduce((s, l) => s + allocated(l), 0)

  const csrf = () => ({ "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() })

  // An edited allocation is saved on blur; the input is what the pastor allows.
  const saveAllocation = async (line: Line) => {
    const value = allocated(line)
    if (value === line.proposed && allocations[line.id] === String(line.proposed)) return
    if (value <= 0) {
      pushToast("An allocation must be greater than zero.", "error")
      setAllocations((prev) => ({ ...prev, [line.id]: String(line.proposed) }))
      return
    }
    setSavingLineId(line.id)
    try {
      const res = await fetch(`${API_V1}/financial/budget-allocations/${encodeURIComponent(line.id)}`, {
        method: "PATCH",
        headers: csrf(),
        credentials: "include",
        body: JSON.stringify({ allocatedAmount: value, amount: value }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(describeApiError(json, "Unable to save the allocation."))
      // The budget's total follows its lines.
      const budget = budgets.find((b) => b.id === line.budgetId)
      if (budget) {
        const total = lines.filter((l) => l.budgetId === budget.id).reduce((s, l) => s + (l.id === line.id ? value : allocated(l)), 0)
        await fetch(`${API_V1}/budgets/${encodeURIComponent(budget.id)}`, {
          method: "PATCH",
          headers: csrf(),
          credentials: "include",
          body: JSON.stringify({ annualAmount: total, totalAmount: total }),
        })
      }
      pushToast(`${line.name}: allocation set to ${formatCurrency(value)}`, "success")
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to save the allocation.", "error")
      setAllocations((prev) => ({ ...prev, [line.id]: String(line.proposed) }))
    } finally {
      setSavingLineId(null)
    }
  }

  // Approve or send back every submitted budget in the proposal.
  const decide = async (decision: "approved" | "revision") => {
    const targets = budgets.filter((b) => b.status === "submitted")
    if (targets.length === 0) return
    setActing(decision === "approved" ? "approve" : "return")
    setActionError(null)
    try {
      for (const b of targets) {
        const res = await fetch(`${API_V1}/budgets/${encodeURIComponent(b.id)}/approve`, {
          method: "PATCH",
          headers: csrf(),
          credentials: "include",
          body: JSON.stringify({ status: decision }),
        })
        const json = await res.json().catch(() => null)
        if (!res.ok) throw new Error(describeApiError(json, `Unable to ${decision === "approved" ? "approve" : "send back"} the budget.`))
      }
      pushToast(decision === "approved" ? `${period} budget approved.` : `${period} budget sent back to the accountant.`, "success")
      reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "The decision could not be recorded.")
    } finally {
      setActing(null)
    }
  }

  const openThread = (line: Line) =>
    router.push(
      `/branchlead-pastor/budget-communication?budgetId=${encodeURIComponent(line.budgetId)}` +
        `&tab=${encodeURIComponent(budgets.find((b) => b.id === line.budgetId)?.category ?? tab)}` +
        // lineItemRef must be a chart-of-account id; the API rejects a name.
        (/^[a-f0-9]{24}$/i.test(line.chartOfAccountId) ? `&lineItemRef=${encodeURIComponent(line.chartOfAccountId)}` : "") +
        `&lineName=${encodeURIComponent(line.name)}`
    )

  return (
    <div className="flex flex-col xl:flex-row min-h-screen overflow-hidden bg-[#F8FAFC] relative w-full font-sans" style={{ fontFamily: '"Inter", sans-serif' }}>
      <BranchLeadPastorSidebar />

      <div className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden bg-[#F8FAFC] relative w-full">
        <div className="flex-1 flex flex-col h-full overflow-y-auto w-full relative">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 xl:px-8 w-full gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-[14px] font-semibold text-[#111827]">Dashboard</div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-[320px] sm:max-w-none">
              <div className="relative flex-1 w-full sm:max-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="search"
                  placeholder="Search requisitions..."
                  className="h-[36px] sm:h-[38px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] pl-9 pr-3 text-[13px] text-[#4B5563] font-medium placeholder:text-[#9CA3AF] focus-visible:bg-white focus-visible:border-[#3B5BDB] focus-visible:ring-1 focus-visible:ring-[#3B5BDB]/20 outline-none transition-all"
                />
              </div>
              <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#6B7280] hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E7EB]">
                <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto p-4 sm:p-6 xl:p-8">
            {/* Header Actions Row */}
            <div className="mb-0 border-none bg-transparent">
              <button onClick={() => router.push("/branchlead-pastor/budget")} className="flex items-center gap-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-4 md:mb-3 mt-1 md:mt-0">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-[#111827]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: "26.95px", lineHeight: "33.69px", letterSpacing: "-0.67px" }}>
                      {period ? `${period} Budget Proposal` : "Budget Proposal"}
                    </h1>
                    {status && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${status.cls}`}>
                        {status.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#6B7280] mt-2 font-medium">
                    {lead ? (
                      <>
                        Submitted by: <span className="text-[#374151] font-semibold">{lead.submittedBy || "the branch accountant"}</span>
                        {lead.submittedAt && !Number.isNaN(new Date(lead.submittedAt).getTime())
                          ? ` on ${new Date(lead.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                          : ""}
                      </>
                    ) : loading ? (
                      "Loading the latest proposal…"
                    ) : (
                      "No budget has been submitted for this branch yet."
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => decide("revision")}
                    disabled={!canDecide || acting !== null}
                    className="bg-white text-[#374151] shadow-sm hover:bg-gray-50 flex items-center gap-2 justify-center border-[#E5E7EB] h-9 rounded-[7px] px-4 text-[12.5px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    title={canDecide ? "Return the proposal to the accountant" : "Nothing is awaiting your decision"}
                  >
                    <Undo2 className="h-4 w-4 text-[#6B7280]" />
                    {acting === "return" ? "Sending…" : "Send Back"}
                  </Button>
                  <Button
                    onClick={() => decide("approved")}
                    disabled={!canDecide || acting !== null}
                    className="bg-[#2563EB] text-white shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5 justify-center h-9 rounded-[7px] px-4 text-[12.5px] font-bold disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none disabled:cursor-not-allowed"
                    title={canDecide ? "Approve the submitted proposal" : "Nothing is awaiting your decision"}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {acting === "approve" ? "Approving…" : "Approve Budget"}
                  </Button>
                </div>
              </div>
              {(actionError || error) && <div className="mb-4 -mt-4 text-[12px] font-semibold text-rose-500">{actionError ?? error}</div>}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-5 mb-6 sm:mb-8">
              {cards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="rounded-[16px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-start justify-between">
                      <div className="text-[12.5px] font-medium text-[#6B7280]">{card.title}</div>
                      <div className={`rounded-lg p-2 ${card.iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 stroke-[2] ${card.iconColor}`} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[22px] font-bold text-[#111827] tracking-tight">{card.value}</div>
                      <div className={`mt-1.5 text-[12px] font-medium ${card.metaColor}`}>{card.meta}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 sm:gap-8 border-b border-[#E2E8F0] mb-6 overflow-x-auto whitespace-nowrap pb-1">
              {TABS.map((t) => {
                const Icon = t.icon
                const on = tab === t.key
                const count = lines.filter((l) => budgets.find((b) => b.id === l.budgetId)?.category === t.key).length
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 pb-3 border-b-2 text-[13.5px] transition-colors ${on ? "border-[#2563EB] text-[#2563EB] font-semibold" : "border-transparent text-[#64748B] hover:text-[#334155] font-medium"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                    {count > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${on ? "bg-[#EEF2FF] text-[#2563EB]" : "bg-[#F1F5F9] text-[#64748B]"}`}>{count}</span>}
                  </button>
                )
              })}
              {pendingTotal > 0 && (
                <button
                  type="button"
                  onClick={() => openThread(pendingLines[0].line)}
                  title={`Open "${pendingLines[0].line.name}"`}
                  className="ml-auto mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20 hover:bg-rose-100 transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                  {pendingTotal} new {pendingTotal === 1 ? "message" : "messages"}
                  {pendingLines.length > 1 && <span className="text-rose-400 font-medium">· {pendingLines.length} lines</span>}
                </button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col">
              <div className="w-full flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px] text-[13px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] tracking-wider text-[#64748B] uppercase">
                      <th className="px-6 py-4 font-semibold w-[32%]">Line Item</th>
                      <th className="px-6 py-4 font-semibold text-right w-[14%]">Last Year</th>
                      <th className="px-6 py-4 font-semibold text-right w-[16%]">Proposed</th>
                      <th className="px-6 py-4 font-semibold text-center w-[20%] text-[#2563EB]">Allocated</th>
                      <th className="px-6 py-4 font-semibold text-right w-[12%]">Variance</th>
                      <th className="px-6 py-4 w-[6%]" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#64748B]">Loading proposal…</td>
                      </tr>
                    ) : tabLines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#64748B]">
                          {tabBudget ? `No line items under ${TABS.find((t) => t.key === tab)?.label}.` : `No ${TABS.find((t) => t.key === tab)?.label} budget in this proposal.`}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr className="bg-[#F8FAFC]/60">
                          <td className="px-6 py-3 font-bold text-[#334155]">
                            {TABS.find((t) => t.key === tab)?.label}
                            <span className="ml-2 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">{tabLines.length} items</span>
                          </td>
                          <td />
                          <td className="px-6 py-3 text-right font-semibold text-[#334155]">{formatCurrency(tabProposed)}</td>
                          <td className="px-6 py-3 text-center font-semibold text-[#2563EB]">{formatCurrency(tabAllocated)}</td>
                          <td className="px-6 py-3 text-right text-[#64748B]">Total</td>
                          <td />
                        </tr>
                        {tabLines.map((line) => {
                          const value = allocated(line)
                          const delta = line.proposed > 0 ? ((value - line.proposed) / line.proposed) * 100 : 0
                          const locked = tabBudget ? tabBudget.status !== "submitted" : true
                          return (
                            <tr key={line.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-[#0F172A]">{line.name}</div>
                                {line.code && <div className="text-[11px] text-[#94A3B8] mt-0.5">{line.code}</div>}
                              </td>
                              <td className="px-6 py-4 text-right text-[#94A3B8]">—</td>
                              <td className="px-6 py-4 text-right text-[#0F172A] font-semibold">{formatCurrency(line.proposed)}</td>
                              <td className="px-6 py-4">
                                <div className="mx-auto flex h-9 w-[150px] items-center rounded-md border border-[#E2E8F0] bg-white px-3 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20">
                                  <span className="mr-2 text-[12px] font-semibold text-[#94A3B8]">₦</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    aria-label={`Allocation for ${line.name}`}
                                    value={allocations[line.id] ?? String(line.proposed)}
                                    disabled={locked || savingLineId === line.id}
                                    onChange={(e) => setAllocations((prev) => ({ ...prev, [line.id]: e.target.value }))}
                                    onBlur={() => saveAllocation(line)}
                                    className="w-full bg-transparent text-right text-[13px] font-bold text-[#0F172A] outline-none disabled:text-[#64748B]"
                                  />
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-right font-semibold ${delta < 0 ? "text-rose-500" : delta > 0 ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                                {delta === 0 ? "0%" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%`}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {(() => {
                                  const summary = threads[threadKey(line.budgetId, line.chartOfAccountId)]
                                  const unread = isThreadUnread(summary, userId, line.budgetId, line.chartOfAccountId)
                                  const fresh = unreadCount(summary, userId, line.budgetId, line.chartOfAccountId)
                                  const count = unread && fresh > 0 ? fresh : summary?.count ?? 0
                                  return (
                                    <button
                                      onClick={() => openThread(line)}
                                      title={unread ? "New message on this line" : count ? `${count} ${count === 1 ? "message" : "messages"}` : "Discuss this line"}
                                      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                        unread ? "bg-[#EEF2FF] text-[#2563EB]" : count ? "text-[#2563EB] hover:bg-[#EEF2FF]" : "text-[#94A3B8] hover:bg-[#EEF2FF] hover:text-[#2563EB]"
                                      }`}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      {count > 0 && (
                                        <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${unread ? "bg-rose-500 text-white" : "bg-[#E0E7FF] text-[#3B5BDB]"}`}>
                                          {count}
                                        </span>
                                      )}
                                    </button>
                                  )
                                })()}
                              </td>
                            </tr>
                          )
                        })}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 text-[12.5px] text-[#64748B]">
                <span>
                  Showing {tabLines.length} of {lines.length} line {lines.length === 1 ? "item" : "items"}
                </span>
                {tabBudget && tabBudget.status !== "submitted" && (
                  <span className="font-medium">
                    This group is {STATUS_PILL[tabBudget.status]?.label.toLowerCase() ?? tabBudget.status}; allocations are read-only.
                  </span>
                )}
              </div>
            </div>
          </main>
        </div>
        {rightSidebar}
      </div>
    </div>
  )
}

export default function Page() {
  return <BudgetReviewContent />
}
