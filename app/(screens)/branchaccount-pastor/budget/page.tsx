"use client"

import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { formatCurrency as formatCurrencyLib } from "@/lib/format";

import React, { useEffect, useMemo, useState } from "react"

import Image from "next/image"

import { Inter } from "next/font/google"

import {

  LayoutDashboard,

  ArrowRightLeft,

  Wallet,

  Database,

  ShieldCheck,

  Settings,

  HelpCircle,

  Menu,

  X,

  ChevronDown,

  Download,

  Calendar,

  TrendingUp,

  Info,

  Plus,

  MessageSquare,

  PiggyBank,

  Landmark

} from "lucide-react"

import { useExport } from "@/components/hooks/useExport"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { describeApiError } from "@/lib/api-error"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"



const inter = Inter({ subsets: ["latin"] })



const formatCurrency = (value: number) =>
  formatCurrencyLib(value, { maximumFractionDigits: 0 })

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

/** The table's three groups are the API's three budget categories. */
const GROUPS = [
  { key: "operational", label: "Operational Expenses" },
  { key: "project", label: "Program Budgets" },
  { key: "capital", label: "Capital Projects" },
] as const

const STATUS_LABELS: Record<string, { key: string; label: string; tone: string }> = {
  draft: { key: "draft", label: "Draft", tone: "bg-[#F3F4F6] text-[#6B7280]" },
  submitted: { key: "submitted", label: "Submitted · awaiting Director approval", tone: "bg-amber-50 text-amber-700" },
  approved: { key: "approved", label: "Approved by Director", tone: "bg-emerald-50 text-emerald-700" },
  rejected: { key: "rejected", label: "Rejected by Director", tone: "bg-rose-50 text-rose-700" },
  revision: { key: "revision", label: "Returned for revision", tone: "bg-orange-50 text-orange-700" },
}


export default function Page() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const {
    exporting,
    error: exportError,
    exportData: triggerExport,
    setError: setExportError,
  } = useExport({
    endpoint: `${API_V1}/export/budget-entries`,
    fallbackFilename: "budget-entries.csv",
    defaultErrorMessage: "Unable to export budget entries.",
  })

  // ---------------------------------------------------------------------------
  // Period. The API stores `fiscalYear` only, so the month lives in the budget
  // title ("March 2026 · Operational Expenses") and the list for the year is
  // narrowed to the month client-side. A `month` field on the backend would
  // let the API do this; until then the title is the contract.
  // ---------------------------------------------------------------------------
  const now = useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth())
  const yearOptions = useMemo(() => [currentYear + 1, currentYear, currentYear - 1, currentYear - 2], [currentYear])
  const periodLabel = `${MONTHS[selectedMonth]} ${selectedYear}`

  // The three table groups are the three budget categories the API knows.
  type GroupKey = (typeof GROUPS)[number]["key"]
  type PeriodBudget = { id: string; category: GroupKey; status: string; totalAmount: number; title: string }
  type Allocation = { id: string; budgetId: string; chartOfAccountId: string; name: string; code: string; amount: number; notes: string }

  const { branchId, loading: branchLoading, error: branchError } = useBranchContext()
  const tenantId = branchId

  const [budgets, setBudgets] = useState<Partial<Record<GroupKey, PeriodBudget>>>({})
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [spent, setSpent] = useState(0)
  const [budgetLoading, setBudgetLoading] = useState(true)
  const [budgetError, setBudgetError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)
  const reload = () => setReloadIndex((i) => i + 1)

  const readList = (payload: unknown): Record<string, unknown>[] => {
    const body = payload as Record<string, unknown> | null
    const data = body?.data as unknown
    if (Array.isArray(data)) return data as Record<string, unknown>[]
    if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).content)) {
      return (data as Record<string, unknown>).content as Record<string, unknown>[]
    }
    return []
  }

  useEffect(() => {
    if (branchLoading) return
    if (!tenantId) {
      setBudgets({})
      setAllocations([])
      setBudgetLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      setBudgetLoading(true)
      setBudgetError(null)
      try {
        const listRes = await fetch(
          `${API_V1}/budgets?branchId=${encodeURIComponent(tenantId)}&fiscalYear=${selectedYear}&limit=100`,
          { credentials: "include" }
        )
        const listJson = await listRes.json().catch(() => null)
        if (!listRes.ok) throw new Error(describeApiError(listJson, "Unable to load budgets."))

        const found: Partial<Record<GroupKey, PeriodBudget>> = {}
        for (const item of readList(listJson)) {
          const title = String(item.title ?? "")
          if (!title.startsWith(periodLabel)) continue
          const category = String(item.category ?? "operational") as GroupKey
          if (!GROUPS.some((g) => g.key === category) || found[category]) continue
          found[category] = {
            id: String(item._id ?? item.id ?? ""),
            category,
            status: String(item.status ?? "draft").toLowerCase(),
            totalAmount: Number(item.totalAmount ?? 0),
            title,
          }
        }
        if (cancelled) return
        setBudgets(found)

        const ids = Object.values(found).map((b) => b!.id)
        const [allocLists, perfs] = await Promise.all([
          Promise.all(
            ids.map((id) =>
              fetch(`${API_V1}/financial/budget-allocations?budgetId=${encodeURIComponent(id)}&limit=100`, { credentials: "include" })
                .then((r) => r.json().catch(() => null))
                .then((j) => readList(j).map((a) => ({ ...a, budgetId: id }) as Record<string, any>))
            )
          ),
          Promise.all(
            ids.map((id) =>
              fetch(`${API_V1}/budgets/${encodeURIComponent(id)}/performance`, { credentials: "include" })
                .then((r) => (r.ok ? r.json().catch(() => null) : null))
                .then((j) => Number((j as Record<string, any> | null)?.data?.summary?.totalSpent ?? 0))
            )
          ),
        ])
        if (cancelled) return
        setAllocations(
          allocLists.flat().map((a) => {
            const coa = a.chartOfAccountId as Record<string, unknown> | string | undefined
            const populated = coa && typeof coa === "object" ? coa : null
            return {
              id: String(a._id ?? a.id ?? ""),
              budgetId: String(a.budgetId),
              chartOfAccountId: String(populated ? populated._id ?? populated.id ?? "" : coa ?? ""),
              name: String(populated?.name ?? a.notes ?? "Line item"),
              code: String(populated?.code ?? ""),
              amount: Number(a.amount ?? 0),
              notes: String(a.notes ?? ""),
            }
          })
        )
        setSpent(perfs.reduce((sum, n) => sum + n, 0))
      } catch (err) {
        if (cancelled) return
        setBudgetError(err instanceof Error ? err.message : "Unable to load budgets.")
        setBudgets({})
        setAllocations([])
      } finally {
        if (!cancelled) setBudgetLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [tenantId, branchLoading, selectedYear, periodLabel, reloadIndex])

  // ---------------------------------------------------------------------------
  // Editing. Existing allocations get amount edits; new lines are added under
  // a group and become chart-of-account heads + allocations on save.
  // ---------------------------------------------------------------------------
  const [breakdownOpen, setBreakdownOpen] = useState(true)
  const [amountEdits, setAmountEdits] = useState<Record<string, string>>({})
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [customLines, setCustomLines] = useState<Record<string, { id: string; name: string; proposed: string }[]>>({})

  useEffect(() => {
    // Leaving the period drops unsaved work; it belongs to the period it was typed in.
    setAmountEdits({})
    setCustomLines({})
    setSubmitError(null)
    setSubmitSuccess(null)
  }, [periodLabel])

  const isLocked = (key: GroupKey) => {
    const status = budgets[key]?.status
    return status === "submitted" || status === "approved"
  }

  const addLineItem = (label: string) => {
    setCustomLines((prev) => ({
      ...prev,
      [label]: [...(prev[label] ?? []), { id: `custom-${Date.now()}`, name: "", proposed: "" }],
    }))
    setAddCatOpen(false)
  }
  const updateCustomLine = (label: string, id: string, field: "name" | "proposed", value: string) =>
    setCustomLines((prev) => ({ ...prev, [label]: (prev[label] ?? []).map((l) => (l.id === id ? { ...l, [field]: value } : l)) }))
  const removeCustomLine = (label: string, id: string) =>
    setCustomLines((prev) => ({ ...prev, [label]: (prev[label] ?? []).filter((l) => l.id !== id) }))

  const toNumber = (value: string | number) => Number(String(value).replace(/[^\d.]/g, "")) || 0
  const allocationAmount = (a: Allocation) => (a.id in amountEdits ? toNumber(amountEdits[a.id]) : a.amount)

  const mergedGroups = useMemo(
    () =>
      GROUPS.map((group) => {
        const budget = budgets[group.key]
        const items = allocations.filter((a) => budget && a.budgetId === budget.id)
        const custom = customLines[group.label] ?? []
        const total =
          items.reduce((sum, a) => sum + allocationAmount(a), 0) + custom.reduce((sum, l) => sum + toNumber(l.proposed), 0)
        return { ...group, category: group.label, budget, items, custom, total, locked: isLocked(group.key) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [budgets, allocations, customLines, amountEdits]
  )

  const totalProposed = useMemo(() => mergedGroups.reduce((sum, g) => sum + g.total, 0), [mergedGroups])

  const totals = useMemo(() => {
    const income = totalProposed
    const expense = spent
    const deduction = income * 0.1
    return { income, expense, deduction, surplus: income - expense - deduction }
  }, [totalProposed, spent])

  // What the period's budget is, for the heading. One status per group; the
  // heading shows the least-advanced so nothing reads as approved early.
  const periodStatus = useMemo(() => {
    const statuses = Object.values(budgets).map((b) => b!.status)
    if (statuses.length === 0) return { key: "none", label: "No budget yet", tone: "bg-[#F3F4F6] text-[#6B7280]" }
    const rank = ["rejected", "revision", "draft", "submitted", "approved"]
    const lowest = statuses.reduce((a, b) => (rank.indexOf(a) <= rank.indexOf(b) ? a : b))
    return STATUS_LABELS[lowest] ?? { key: lowest, label: lowest, tone: "bg-[#F3F4F6] text-[#6B7280]" }
  }, [budgets])

  // ---------------------------------------------------------------------------
  // Persisting. A line item is a chart-of-account head (so the Expense entry
  // can post against it) plus an allocation on the group's budget.
  // ---------------------------------------------------------------------------
  const csrf = () => ({ "Content-Type": "application/json", "x-csrf-token": getCsrfTokenFromCookie() })

  const findOrCreateHead = async (name: string, groupLabel: string, known: { id: string; name: string; code: string }[]) => {
    const wanted = name.trim().toLowerCase()
    const existing = known.find((h) => h.name.trim().toLowerCase() === wanted)
    if (existing) return existing.id
    // Next free expense code: highest existing numeric code in the 5000s + 10.
    const codes = known.map((h) => Number(h.code)).filter((n) => Number.isFinite(n) && n >= 5000 && n < 6000)
    let code = codes.length ? Math.max(...codes) + 10 : 5000
    while (known.some((h) => h.code === String(code))) code += 10
    const res = await fetch(`${API_V1}/financial/coa`, {
      method: "POST",
      headers: csrf(),
      credentials: "include",
      body: JSON.stringify({ code: String(code), name: name.trim(), accountType: "expense", branchId: tenantId, description: `Budget line · ${groupLabel}` }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(describeApiError(json, `Unable to create the "${name}" account head.`))
    const id = String(json?.data?._id ?? json?.data?.id ?? "")
    if (!id) throw new Error(`The "${name}" account head was created but no id came back.`)
    known.push({ id, name: name.trim(), code: String(code) })
    return id
  }

  const persist = async (submit: boolean) => {
    setSubmitError(null)
    setSubmitSuccess(null)
    if (!tenantId) {
      setSubmitError(branchError ?? "No branch is available for your account. Ask an administrator to assign you to one.")
      return
    }
    const work = mergedGroups.filter(
      (g) => g.custom.some((l) => l.name.trim() && toNumber(l.proposed) > 0) || g.items.some((a) => a.id in amountEdits) || (submit && g.budget)
    )
    if (work.length === 0) {
      setSubmitError("Add at least one line item with a name and an amount.")
      return
    }
    const bad = mergedGroups.flatMap((g) => g.custom).find((l) => l.name.trim() && toNumber(l.proposed) <= 0)
    if (bad) {
      setSubmitError(`Enter an amount for "${bad.name}".`)
      return
    }

    setSubmittingProposal(true)
    try {
      // Expense heads already in the chart, to reuse by name.
      const coaRes = await fetch(`${API_V1}/financial/coa?page=1&limit=100&accountType=expense&branchId=${encodeURIComponent(tenantId)}`, { credentials: "include" })
      const coaJson = await coaRes.json().catch(() => null)
      const known = readList(coaJson).map((h) => ({ id: String(h._id ?? h.id ?? ""), name: String(h.name ?? ""), code: String(h.code ?? "") }))

      let submitted = 0
      for (const group of work) {
        if (group.locked && submit) continue
        if (group.locked) throw new Error(`${group.label} is ${budgets[group.key]?.status} and can't be edited.`)

        let budget = group.budget
        if (!budget) {
          const res = await fetch(`${API_V1}/budgets`, {
            method: "POST",
            headers: csrf(),
            credentials: "include",
            body: JSON.stringify({
              title: `${periodLabel} · ${group.label}`,
              branchId: tenantId,
              fiscalYear: selectedYear,
              totalAmount: group.total,
              category: group.key,
              notes: `${group.label} budget for ${periodLabel}.`,
            }),
          })
          const json = await res.json().catch(() => null)
          if (!res.ok) throw new Error(describeApiError(json, `Unable to create the ${group.label} budget.`))
          budget = { id: String(json?.data?._id ?? json?.data?.id ?? ""), category: group.key, status: "draft", totalAmount: group.total, title: "" }
          if (!budget.id) throw new Error("The budget was created but no id came back.")
        } else if (budget.totalAmount !== group.total) {
          const res = await fetch(`${API_V1}/budgets/${encodeURIComponent(budget.id)}`, {
            method: "PATCH",
            headers: csrf(),
            credentials: "include",
            body: JSON.stringify({ totalAmount: group.total }),
          })
          if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to update the budget total."))
        }

        for (const line of group.custom) {
          if (!line.name.trim()) continue
          const chartOfAccountId = await findOrCreateHead(line.name, group.label, known)
          const res = await fetch(`${API_V1}/financial/budget-allocations`, {
            method: "POST",
            headers: csrf(),
            credentials: "include",
            body: JSON.stringify({ budgetId: budget.id, chartOfAccountId, amount: toNumber(line.proposed), allocationType: "fixed_amount", notes: line.name.trim() }),
          })
          if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), `Unable to save "${line.name}".`))
        }
        for (const a of group.items) {
          if (!(a.id in amountEdits) || allocationAmount(a) === a.amount) continue
          const res = await fetch(`${API_V1}/financial/budget-allocations/${encodeURIComponent(a.id)}`, {
            method: "PATCH",
            headers: csrf(),
            credentials: "include",
            body: JSON.stringify({ amount: allocationAmount(a) }),
          })
          if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), `Unable to update "${a.name}".`))
        }

        if (submit && (budget.status === "draft" || budget.status === "revision")) {
          const res = await fetch(`${API_V1}/budgets/${encodeURIComponent(budget.id)}/submit`, {
            method: "PATCH",
            headers: csrf(),
            credentials: "include",
          })
          if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), `Unable to submit the ${group.label} budget.`))
          submitted++
        }
      }

      setSubmitSuccess(
        submit
          ? `${periodLabel} budget submitted — ${submitted} ${submitted === 1 ? "group is" : "groups are"} now with the Director for approval.`
          : `${periodLabel} budget saved as draft.`
      )
      setAmountEdits({})
      setCustomLines({})
      reload()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save the budget.")
    } finally {
      setSubmittingProposal(false)
    }
  }
  const handleSaveDraft = () => persist(false)
  const handleSubmitProposal = () => persist(true)

  const handleExport = async () => {
    if (!tenantId) {
      setExportError("Branch is required to export budget entries.")
      return
    }
    await triggerExport({ tenantId })
  }

  return (

    <div className={`flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] relative w-full ${inter.className} antialiased`}>



      {/* Mobile Drawer Overlay */}

      {isMobileMenuOpen && (

        <div

          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"

          onClick={() => setIsMobileMenuOpen(false)}

        />

      )}



      <BranchAccountantSidebar
        activeHref="/branchaccount-pastor/budget"
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />



      {/* Main Layout Wrap */}

      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">



        {/* Top Header */}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-transparent px-4 sm:px-6 xl:px-8 w-full gap-4 pt-3 pb-2 sm:pt-4 sm:pb-3">

          <div className="flex items-center gap-3 w-full sm:w-auto">

            <button

              type="button"

              aria-label="Open menu"

              onClick={() => setIsMobileMenuOpen(true)}

              className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-white hover:text-[#111827] transition-colors"

            >

              <Menu className="h-5 w-5" />

            </button>

            <div className="flex-1">

              <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111827] tracking-tight truncate">Financial Overview</h1>

              <p className="text-[11px] sm:text-[12px] text-[#3B5BDB] font-medium mt-0.5 truncate">Global financial health monitoring</p>

            </div>

          </div>



          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">

            <button
              onClick={handleExport}
              disabled={exporting}
              className="hidden sm:flex items-center justify-center h-[36px] px-4 rounded-[8px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-sm hover:bg-[#3451b2] transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              <Download className="mr-2 h-4 w-4" />

              {exporting ? "Exporting..." : "Export"}

            </button>

          </div>

        </header>
        {exportError && (
          <div className="px-4 sm:px-6 xl:px-8 text-[12px] font-semibold text-rose-500">
            {exportError}
          </div>
        )}



        {/* Page Content */}

        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 xl:px-8 pb-8 pt-2">



          <div className="flex flex-col lg:flex-row gap-6 h-full">

            <div className="flex-1 min-w-0 flex flex-col">



              {/* Main Header Area */}

              <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-4 pt-2 border-t border-[#EEF1F6]/70">

                <div>

                  <h2 className="text-[18px] sm:text-[22px] font-bold text-[#111827] tracking-tight">Budget Preparation & Forecasting</h2>

                  <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7280] font-medium leading-snug">Manage operational, program, and capital expenditures for each month.</p>

                </div>

                <div className="flex flex-row items-center w-full md:w-auto gap-3">

                  <label className="flex items-center gap-2 h-[38px] md:h-[34px] px-2 sm:px-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[11px] sm:text-[12px] text-[#111827] font-bold shadow-sm">
                    <Calendar className="h-3.5 w-3.5 text-[#6B7280]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-transparent outline-none text-[12px] font-bold text-[#111827] cursor-pointer"
                      aria-label="Budget month"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-transparent outline-none text-[12px] font-bold text-[#111827] cursor-pointer pr-1"
                      aria-label="Budget year"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>

                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex flex-1 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[12px] text-[#111827] font-bold shadow-sm hover:bg-gray-50 transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    <Download className="mr-1.5 h-3.5 w-3.5" />

                    {exporting ? "Exporting..." : "Export"}

                  </button>
                  <span className={`flex justify-center whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 rounded-[6px] text-[11px] sm:text-[12px] font-bold ${periodStatus.tone}`}>
                    {periodStatus.label}
                  </span>

                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="flex flex-2 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-[0_4px_14px_rgba(59,91,219,0.25)] hover:bg-[#3451b2] transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed">

                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2 outline-none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>

                    {submittingProposal ? "Submitting..." : "Submit for Director Approval"}

                  </button>

                </div>

              </div>



              {/* Top Summary Cards */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Total Projected Income</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">

                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.income)}</div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">{allocations.length} line item{allocations.length === 1 ? "" : "s"}</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Total Expenditure</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center shrink-0">

                      <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.expense)}</div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">{totals.income > 0 ? `${Math.round((totals.expense / totals.income) * 100)}% of Income` : "No income recorded"}</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-bold text-[#9333EA]">HQ Deductions</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">

                      <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.deduction)}</div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">Fixed 10% Tithe</div>

                  </div>

                </div>



                <div className="rounded-[16px] border border-[#EEF1F6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col justify-between h-[125px] sm:h-[135px]">

                  <div className="flex justify-between items-start">

                    <div className="text-[12px] sm:text-[13px] font-medium text-[#6B7280]">Net Surplus</div>

                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-[6px] bg-gray-100 text-[#111827] flex items-center justify-center border border-[#E5E7EB] shrink-0">

                      <PiggyBank className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />

                    </div>

                  </div>

                  <div className="mt-3 sm:mt-4">

                    <div className="text-[15px] xs:text-[16px] xl:text-[20px] font-bold text-[#111827] tracking-tight leading-tight mb-1 truncate">{formatCurrency(totals.surplus)}</div>
                    <div className={`text-[10px] sm:text-[11px] font-bold tracking-wide truncate ${totals.surplus >= 0 ? "text-[#10B981]" : "text-rose-600"}`}>{totals.surplus >= 0 ? "Positive surplus" : "Deficit"}</div>

                  </div>

                </div>



              </div>



              {/* Backend-driven budget summary for the selected fiscal year */}
              <div className="mb-6 rounded-[14px] bg-white border border-[#EEF1F6] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
                <button
                  type="button"
                  onClick={() => setBreakdownOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left"
                  aria-controls="approved-budget-breakdown"
                >
                  <div className="min-w-0">
                    <h3 className="text-[14px] sm:text-[16px] font-bold text-[#111827] tracking-tight truncate">
                      {periodStatus.key === "none" ? "Budget" : `${periodStatus.label.split(" ·")[0]} Budget`} · {periodLabel}
                    </h3>
                    <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#6B7280] font-medium truncate">
                      {budgetLoading
                        ? "Loading…"
                        : budgetError
                          ? budgetError
                          : Object.keys(budgets).length > 0
                            ? `${allocations.length} line ${allocations.length === 1 ? "item" : "items"} across ${Object.keys(budgets).length} ${Object.keys(budgets).length === 1 ? "group" : "groups"} · ${periodStatus.label}`
                            : "No budget for this month yet. Add line items below and save."}
                    </p>
                  </div>
                  <span className="text-[#6B7280] text-[12px] font-semibold shrink-0 ml-3">
                    {breakdownOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {breakdownOpen && (
                  <div id="approved-budget-breakdown" className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#EEF1F6]">
                    {Object.keys(budgets).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-4 text-[12px]">
                        <div>
                          <div className="text-[#6B7280] font-medium">Total Allocated</div>
                          <div className="font-bold text-[#111827]">{formatCurrency(totalProposed)}</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Total Spent</div>
                          <div className="font-bold text-[#111827]">{formatCurrency(spent)}</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Utilization</div>
                          <div className="font-bold text-[#111827]">{totalProposed > 0 ? Math.round((spent / totalProposed) * 100) : 0}%</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Groups</div>
                          <div className="font-bold text-[#111827]">{Object.keys(budgets).length} of {GROUPS.length}</div>
                        </div>
                      </div>
                    )}
                    {allocations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] text-left text-[12px] border-collapse">
                          <thead>
                            <tr className="text-[#6B7280] font-semibold border-b border-[#EEF1F6]">
                              <th className="py-2 pr-3">Line Item</th>
                              <th className="py-2 pr-3">Amount</th>
                              <th className="py-2 pr-3">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocations.map((a) => (
                              <tr key={a.id} className="border-b border-[#F1F5F9]">
                                <td className="py-2 pr-3 text-[#111827] font-medium">
                                  {a.name}
                                  {a.code ? <span className="ml-1 text-[#6B7280] font-normal">({a.code})</span> : null}
                                </td>
                                <td className="py-2 pr-3 text-[#111827]">{formatCurrency(a.amount)}</td>
                                <td className="py-2 pr-3 text-[#6B7280]">{GROUPS.find((g) => budgets[g.key]?.id === a.budgetId)?.label ?? ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      !budgetLoading && !budgetError && (
                        <p className="mt-3 text-[12px] text-[#6B7280]">No line items to display.</p>
                      )
                    )}
                  </div>
                )}
              </div>



              {/* Main Table Interface */}
              <div className="rounded-[16px] bg-white border border-[#EEF1F6] flex flex-col shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] relative min-h-[460px] pb-[130px] sm:pb-[88px]">

                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 lg:p-6 lg:pb-4 gap-3 sm:gap-4 border-b border-[#EEF1F6]">
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111827] tracking-tight">Budget Breakdown</h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddCatOpen((v) => !v)}
                      className="flex items-center text-[12px] sm:text-[13px] font-bold text-[#3B5BDB] hover:text-[#3451b2] transition-colors bg-[#EEF2FF] sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-[6px] sm:rounded-none"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                      Add Line Item
                      <ChevronDown className="ml-1 h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                    {addCatOpen && (
                      <>
                        <button
                          type="button"
                          aria-label="Close menu"
                          className="fixed inset-0 z-40 cursor-default"
                          onClick={() => setAddCatOpen(false)}
                        />
                        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-[10px] border border-[#EEF1F6] bg-white py-1 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                            Select a category
                          </div>
                          {GROUPS.map((g) => g.label).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              disabled={mergedGroups.find((g) => g.label === cat)?.locked}
                              onClick={() => addLineItem(cat)}
                              className="block w-full px-3 py-2.5 text-left text-[13px] font-semibold text-[#374151] hover:bg-[#EEF2FF] hover:text-[#3B5BDB]"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full overflow-x-auto flex-1 pb-4">
                  <table className="w-full min-w-[700px] md:min-w-[800px] text-left text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-transparent text-[#9CA3AF] border-b border-t-0 border-[#EEF1F6]">
                        <th className="py-3 sm:py-4 pl-4 sm:pl-6 lg:pl-8 font-medium w-[200px] sm:w-[280px]">Category Name</th>
                        <th className="py-3 sm:py-4 font-medium w-[130px] sm:w-[150px] text-center">Prev. Year Actual</th>
                        <th className="py-3 sm:py-4 font-medium w-[200px] sm:w-[220px] text-center">Proposed Budget</th>
                        <th className="py-3 sm:py-4 font-medium w-[80px] sm:w-[100px] text-center">Monthly</th>
                        <th className="py-3 sm:py-4 pr-4 sm:pr-6 lg:pr-8 font-medium w-[100px] sm:w-[120px] text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetLoading ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">
                            Loading budget entries...
                          </td>
                        </tr>
                      ) : budgetError ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[12px] text-rose-600">
                            {budgetError}
                          </td>
                        </tr>
                      ) : mergedGroups.every((g) => g.items.length === 0 && g.custom.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">
                            No line items for {periodLabel} yet. Use “Add Line Item” to start this month&apos;s budget.
                          </td>
                        </tr>
                      ) : (
                        mergedGroups.filter((g) => g.items.length > 0 || g.custom.length > 0).map((group, gIdx) => (
                          <React.Fragment key={gIdx}>
                            <tr className="border-t border-[#EEF1F6] bg-gray-50/50">
                              <td colSpan={5} className="py-3 sm:py-4 pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
                                <div className="flex items-center text-[12px] sm:text-[13px] font-bold text-[#111827]">
                                  <ChevronDown className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827] shrink-0" strokeWidth={2.5} />
                                  {group.category}
                                  {group.budget && (
                                    <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${(STATUS_LABELS[group.budget.status] ?? STATUS_LABELS.draft).tone}`}>
                                      {(STATUS_LABELS[group.budget.status] ?? STATUS_LABELS.draft).label}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {group.items.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50/20 transition-colors bg-white group border-b border-[#EEF1F6]/50 last:border-0">
                                <td className="py-3 pl-[32px] sm:pl-[44px] lg:pl-[52px] pr-4 font-medium text-[#374151] border-0 text-[12px] sm:text-[13px]">
                                  {item.name}
                                </td>
                                <td className="py-3 font-semibold text-[#6B7280] tracking-tight text-center border-0 text-[12px] sm:text-[13px]">
                                  —
                                </td>
                                <td className="py-3 px-2 flex justify-center border-0">
                                  <div className="flex items-center h-[36px] sm:h-[38px] w-full max-w-[140px] rounded-[6px] border border-[#EEF1F6] bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]/20 transition-all">
                                    <span className="text-[#9CA3AF] font-bold mr-1.5 sm:mr-2 text-[12px] sm:text-[13px]">₦</span>
                                    <input
                                      type="text"
                                      aria-label="Proposed budget amount"
                                      placeholder="0"
                                      disabled={group.locked}
                                      value={item.id in amountEdits ? amountEdits[item.id] : String(item.amount)}
                                      onChange={(e) => setAmountEdits((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                      className="bg-transparent w-full text-[12px] sm:text-[13px] font-bold text-[#111827] outline-none tracking-tight disabled:text-[#6B7280]"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 text-center border-0">
                                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3AA5F3] mx-auto cursor-pointer hover:opacity-80 transition-opacity" strokeWidth={2} />
                                </td>
                                <td className="py-3 pr-4 sm:pr-6 lg:pr-8 text-right border-0">
                                  <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-bold tracking-wide bg-[#F3F4F6] text-[#6B7280]">
                                    {item.code || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {group.custom.map((line) => (
                              <tr key={line.id} className="bg-[#F8FAFF] border-b border-[#EEF1F6]/50 last:border-0">
                                <td className="py-3 pl-[32px] sm:pl-[44px] lg:pl-[52px] pr-4 border-0">
                                  <input
                                    type="text"
                                    value={line.name}
                                    onChange={(e) => updateCustomLine(group.category, line.id, "name", e.target.value)}
                                    placeholder="New line item name"
                                    className="h-[36px] w-full rounded-[6px] border border-[#EEF1F6] bg-white px-3 text-[12px] sm:text-[13px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB]/20"
                                  />
                                </td>
                                <td className="py-3 text-center border-0 text-[12px] text-[#9CA3AF]">—</td>
                                <td className="py-3 px-2 border-0">
                                  <div className="flex items-center h-[36px] sm:h-[38px] w-full max-w-[140px] mx-auto rounded-[6px] border border-[#EEF1F6] bg-white px-3 focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]/20">
                                    <span className="text-[#9CA3AF] font-bold mr-1.5 text-[12px] sm:text-[13px]">₦</span>
                                    <input
                                      type="text"
                                      value={line.proposed}
                                      onChange={(e) => updateCustomLine(group.category, line.id, "proposed", e.target.value)}
                                      placeholder="0"
                                      className="bg-transparent w-full text-[12px] sm:text-[13px] font-bold text-[#111827] outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 text-center border-0"></td>
                                <td className="py-3 pr-4 sm:pr-6 lg:pr-8 text-right border-0">
                                  <button
                                    type="button"
                                    onClick={() => removeCustomLine(group.category, line.id)}
                                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                      {/* Total Line */}
                      <tr className="border-t-2 border-[#E5E7EB] bg-white">
                        <td className="py-4 sm:py-5 pl-4 sm:pl-6 lg:pl-8 pr-4 font-bold text-[#111827] text-[13px] sm:text-[14px]">Total Budget</td>
                        <td className="py-4 sm:py-5 font-bold text-[#6B7280] text-[13px] sm:text-[14px] text-center tracking-tight">—</td>
                        <td className="py-4 sm:py-5 font-bold text-[#111827] text-[14px] sm:text-[15px] text-center tracking-tight">{formatCurrency(totalProposed)}</td>
                        <td className="py-4 sm:py-5"></td>
                        <td className="py-4 sm:py-5 pr-4 sm:pr-6 lg:pr-8 font-bold text-[#6B7280] text-right text-[12px] sm:text-[14px]">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Save & Submit Area */}
                <div className="absolute bottom-0 left-0 right-0 py-3 sm:py-4 px-4 sm:px-6 bg-[#F8FAFC] sm:bg-white border-t border-[#EEF1F6] flex flex-row items-center justify-between sm:justify-end gap-3 sm:gap-4 rounded-b-[16px]">
                  {(submitError || submitSuccess) && (
                    <div className="text-[11px] font-semibold mr-auto">
                      {submitSuccess && <span className="text-emerald-600">{submitSuccess}</span>}
                      {submitError && <span className="text-rose-500">{submitError}</span>}
                    </div>
                  )}
                  <button onClick={handleSaveDraft} disabled={submittingProposal} className="text-[12px] sm:text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors shrink-0 whitespace-nowrap bg-white sm:bg-transparent border border-[#E5E7EB] sm:border-transparent px-4 py-2 sm:px-0 sm:py-0 rounded-[6px] sm:rounded-none disabled:opacity-60">Save as Draft</button>
                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="h-[38px] sm:h-[40px] flex-1 sm:flex-none justify-center shrink-0 whitespace-nowrap px-4 sm:px-6 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] sm:text-[13px] font-bold shadow-[0_4px_14px_rgba(59,91,219,0.35)] hover:bg-[#3451b2] transition-colors tracking-wide outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                    {submittingProposal ? "Submitting..." : "Submit for Director Approval"}
                  </button>
                </div>
              </div>

              {/* Deadline Alert Notice */}

              <div className="mt-6 mb-4 rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] p-4 sm:p-5 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">

                <Info className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[#3B5BDB] shrink-0 mt-[2px]" strokeWidth={2.5} />

                <div>

                  <h4 className="text-[12px] sm:text-[13px] font-bold text-[#3B5BDB] tracking-wide mb-0.5">Approval Deadline approaching</h4>

                  <p className="text-[12px] sm:text-[13px] font-medium text-[#4f67c2] mt-1 leading-[18px] sm:leading-[20px] opacity-90 max-w-[850px]">Please ensure all department heads have reviewed their respective allocations before submitting for the final board meeting on November 15th.</p>

                </div>

              </div>



            </div>

          </div>

        </main>



      </div>

    </div>

  )

}



