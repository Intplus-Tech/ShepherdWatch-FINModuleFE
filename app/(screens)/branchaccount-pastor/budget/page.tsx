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

import { useBudgetEntries } from "@/components/hooks/useBudgetEntries"
import { useExport } from "@/components/hooks/useExport"
import { useAuth } from "@/components/auth/AuthProvider"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"



const inter = Inter({ subsets: ["latin"] })



const formatCurrency = (value: number) =>
  formatCurrencyLib(value, { maximumFractionDigits: 0 })


export default function Page() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { entries, loading: budgetLoading, error: budgetError } = useBudgetEntries()

  const { user } = useAuth()
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
  const [lastBudgetId, setLastBudgetId] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const yearOptions = useMemo(() => {
    return [currentYear + 1, currentYear, currentYear - 1, currentYear - 2]
  }, [currentYear])

  interface BudgetSummary {
    totalAllocated: number
    totalSpent: number
    utilization: number
    monthsElapsed: number
  }
  interface BudgetLineItem {
    chartOfAccount?: { name?: string; code?: string }
    annualBudget?: number
    actualSpentYTD?: number
    variance?: number
    status?: string
  }
  interface BudgetForYear {
    _id?: string
    id?: string
    title?: string
    status?: string
    fiscalYear?: number
    totalAmount?: number
  }

  const [budgetForYear, setBudgetForYear] = useState<BudgetForYear | null>(null)
  const [performance, setPerformance] = useState<{ summary: BudgetSummary; lineItems: BudgetLineItem[] } | null>(null)
  const [allocations, setAllocations] = useState<Array<{ _id?: string; id?: string; amount?: number; chartOfAccountId?: { name?: string; code?: string } | string; notes?: string }>>([])
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [performanceError, setPerformanceError] = useState<string | null>(null)
  const [breakdownOpen, setBreakdownOpen] = useState(true)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const getCsrfToken = getCsrfTokenFromCookie

  // Fetch the budget for the selected fiscal year + branch, then fetch its
  // canonical performance summary and allocations.
  useEffect(() => {
    let cancelled = false
    if (!tenantId) {
      setBudgetForYear(null)
      setPerformance(null)
      setAllocations([])
      return
    }
    const run = async () => {
      setPerformanceLoading(true)
      setPerformanceError(null)
      try {
        const listRes = await fetch(
          `/api/v1/budgets?branchId=${encodeURIComponent(tenantId)}&fiscalYear=${selectedYear}&limit=1`,
          { credentials: "include" }
        )
        const listJson = await listRes.json().catch(() => null)
        if (!listRes.ok) {
          throw new Error(listJson?.message || `Failed to load budgets (${listRes.status})`)
        }
        const list: BudgetForYear[] = Array.isArray(listJson?.data) ? listJson.data : []
        const found = list[0] ?? null
        if (cancelled) return
        setBudgetForYear(found)
        if (!found) {
          setPerformance(null)
          setAllocations([])
          return
        }
        const budgetId = found._id ?? found.id ?? ""
        if (!budgetId) {
          setPerformance(null)
          setAllocations([])
          return
        }
        const [perfRes, allocRes] = await Promise.all([
          fetch(`/api/v1/budgets/${encodeURIComponent(budgetId)}/performance`, { credentials: "include" }),
          fetch(`/api/v1/budget-allocations?budgetId=${encodeURIComponent(budgetId)}&limit=100`, { credentials: "include" }),
        ])
        const perfJson = await perfRes.json().catch(() => null)
        const allocJson = await allocRes.json().catch(() => null)
        if (cancelled) return
        if (perfRes.ok && perfJson?.data) {
          setPerformance({
            summary: perfJson.data.summary ?? { totalAllocated: 0, totalSpent: 0, utilization: 0, monthsElapsed: 0 },
            lineItems: Array.isArray(perfJson.data.lineItems) ? perfJson.data.lineItems : [],
          })
        } else {
          setPerformance(null)
        }
        if (allocRes.ok && Array.isArray(allocJson?.data)) {
          setAllocations(allocJson.data)
        } else {
          setAllocations([])
        }
      } catch (err) {
        if (cancelled) return
        setPerformanceError(err instanceof Error ? err.message : "Failed to load budget performance.")
        setPerformance(null)
        setAllocations([])
      } finally {
        if (!cancelled) setPerformanceLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [tenantId, selectedYear])

  const handleSubmitProposal = async () => {
    if (!tenantId) {
      setSubmitError("Branch is required to submit a budget.")
      return
    }

    const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)
    if (totalAmount <= 0) {
      setSubmitError("No budget amount available to submit.")
      return
    }

    setSubmittingProposal(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const year = new Date().getFullYear() + 1
      const csrfToken = getCsrfToken()
      const response = await fetch(`${API_V1}/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          title: `${year} Annual Budget`,
          branchId: tenantId,
          fiscalYear: year,
          totalAmount,
          category: "operational",
          notes: `Prepared from ${entries.length} line items.`,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to create budget.")
      }

      const budgetId = payload?.data?._id ?? payload?.data?.id ?? payload?._id ?? payload?.id
      if (!budgetId) {
        throw new Error("Budget created but no ID returned.")
      }
      setLastBudgetId(String(budgetId))

      const allocationRows = entries
        .map((entry) => ({
          chartOfAccountId: String(entry.coaId ?? "").trim(),
          amount: Number(entry.amount ?? 0),
          notes: String(entry.name ?? entry.coaName ?? "").trim(),
        }))
        .filter((entry) => entry.chartOfAccountId && Number.isFinite(entry.amount) && entry.amount > 0)

      if (allocationRows.length === 0) {
        throw new Error("No valid budget allocations found. Add line items with account mappings before submitting.")
      }

      const existingAllocationsResponse = await fetch(
        `${API_V1}/budget-allocations?budgetId=${encodeURIComponent(String(budgetId))}&page=1&limit=200`,
        {
          method: "GET",
          credentials: "include",
        }
      )
      const existingAllocationsPayload = await existingAllocationsResponse.json().catch(() => null)
      if (!existingAllocationsResponse.ok) {
        throw new Error(existingAllocationsPayload?.message ?? "Unable to load existing budget allocations.")
      }

      const existingAllocations = Array.isArray(existingAllocationsPayload?.data)
        ? existingAllocationsPayload.data
        : Array.isArray(existingAllocationsPayload?.data?.data)
          ? existingAllocationsPayload.data.data
          : []

      const existingByCoa = new Map<string, string>()
      for (const item of existingAllocations) {
        const rawCoa = item?.chartOfAccountId
        const coaId =
          typeof rawCoa === "string"
            ? rawCoa
            : rawCoa && typeof rawCoa === "object"
              ? String(rawCoa._id ?? rawCoa.id ?? "")
              : ""
        const allocationId = String(item?._id ?? item?.id ?? "")
        if (coaId && allocationId) {
          existingByCoa.set(coaId, allocationId)
        }
      }

      for (const row of allocationRows) {
        const existingAllocationId = existingByCoa.get(row.chartOfAccountId)
        const allocationResponse = await fetch(
          existingAllocationId
            ? `${API_V1}/budget-allocations/${encodeURIComponent(existingAllocationId)}`
            : `${API_V1}/budget-allocations`,
          {
            method: existingAllocationId ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify(
              existingAllocationId
                ? {
                    amount: row.amount,
                    allocationType: "fixed_amount",
                    notes: row.notes,
                  }
                : {
                    budgetId: String(budgetId),
                    chartOfAccountId: row.chartOfAccountId,
                    amount: row.amount,
                    allocationType: "fixed_amount",
                    notes: row.notes,
                  }
            ),
          }
        )
        const allocationPayload = await allocationResponse.json().catch(() => null)
        if (!allocationResponse.ok) {
          throw new Error(allocationPayload?.message ?? "Unable to save one or more budget allocations.")
        }
      }

      const allocationListResponse = await fetch(
        `${API_V1}/budget-allocations?budgetId=${encodeURIComponent(String(budgetId))}&page=1&limit=200`,
        {
          method: "GET",
          credentials: "include",
        }
      )
      const allocationListPayload = await allocationListResponse.json().catch(() => null)
      if (!allocationListResponse.ok) {
        throw new Error(allocationListPayload?.message ?? "Unable to confirm budget allocations.")
      }

      const createdAllocations = Array.isArray(allocationListPayload?.data)
        ? allocationListPayload.data
        : Array.isArray(allocationListPayload?.data?.data)
          ? allocationListPayload.data.data
          : []
      if (createdAllocations.length === 0) {
        throw new Error("Budget allocations were not found after creation.")
      }

      const firstAllocationId = String(
        createdAllocations[0]?._id ?? createdAllocations[0]?.id ?? ""
      ).trim()
      if (firstAllocationId) {
        const allocationDetailResponse = await fetch(
          `${API_V1}/budget-allocations/${encodeURIComponent(firstAllocationId)}`,
          {
            method: "GET",
            credentials: "include",
          }
        )
        const allocationDetailPayload = await allocationDetailResponse.json().catch(() => null)
        if (!allocationDetailResponse.ok) {
          throw new Error(allocationDetailPayload?.message ?? "Unable to validate budget allocation details.")
        }
      }

      const submitResponse = await fetch(`${API_V1}/budgets/${budgetId}/submit`, {
        method: "PATCH",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      })
      const submitPayload = await submitResponse.json().catch(() => null)
      if (!submitResponse.ok) {
        throw new Error(submitPayload?.message ?? "Unable to submit budget.")
      }

      setSubmitSuccess("Budget submitted successfully.")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit budget.")
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleExport = async () => {
    if (!tenantId) {
      setExportError("Tenant is required to export budget entries.")
      return
    }
    await triggerExport({ tenantId })
  }

  // "Add Line Item" -> pick one of the 3 budget categories; a new editable
  // line is appended under that category.
  const CATEGORY_OPTIONS = ["Operational Expenses", "Program Budgets", "Capital Projects"]
  const [addCatOpen, setAddCatOpen] = useState(false)
  const [customLines, setCustomLines] = useState<
    Record<string, { id: string; name: string; proposed: string }[]>
  >({})

  const addLineItem = (category: string) => {
    setCustomLines((prev) => ({
      ...prev,
      [category]: [
        ...(prev[category] ?? []),
        { id: `custom-${Date.now()}`, name: "", proposed: "" },
      ],
    }))
    setAddCatOpen(false)
  }

  const updateCustomLine = (
    category: string,
    id: string,
    field: "name" | "proposed",
    value: string
  ) => {
    setCustomLines((prev) => ({
      ...prev,
      [category]: (prev[category] ?? []).map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }))
  }

  const removeCustomLine = (category: string, id: string) => {
    setCustomLines((prev) => ({
      ...prev,
      [category]: (prev[category] ?? []).filter((l) => l.id !== id),
    }))
  }

  const budgetData = useMemo(() => {

    const grouped = new Map<string, typeof entries>()

    entries.forEach((entry) => {

      const groupKey = entry.category || entry.stream || "Budget Entries"

      if (!grouped.has(groupKey)) grouped.set(groupKey, [])

      grouped.get(groupKey)?.push(entry)

    })



    return Array.from(grouped.entries()).map(([category, items]) => ({

      category,

      expanded: true,

      items: items.map((entry) => ({

        id: entry.id,

        name: entry.coaName || entry.name || `COA ${entry.coaId ?? ""}`.trim(),

        actual: "—",
        proposed: formatCurrency(entry.amount || 0),
        hasIcon: true,
        variance: "—",
        isPositive: (entry.amount ?? 0) >= 0,

      })),

    }))

  }, [entries])

  // Merge user-added line items into their chosen category group (creating the
  // group if it doesn't exist yet).
  const mergedGroups = useMemo(() => {
    const base = budgetData.map((g) => ({
      category: g.category,
      items: g.items,
      custom: [] as { id: string; name: string; proposed: string }[],
    }))
    CATEGORY_OPTIONS.forEach((opt) => {
      const lines = customLines[opt] ?? []
      if (!lines.length) return
      const firstWord = opt.split(" ")[0].toLowerCase()
      const match = base.find((g) => g.category.toLowerCase().includes(firstWord))
      if (match) match.custom = lines
      else base.push({ category: opt, items: [], custom: lines })
    })
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetData, customLines])



  const totalProposed = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.amount || 0), 0),
    [entries]
  )

  const totals = useMemo(() => {
    // Prefer backend-driven figures from /budgets/{id}/performance when an
    // approved budget exists for the selected fiscal year. Otherwise fall
    // back to the forecast derived from current entries being prepared.
    if (performance?.summary) {
      const income = Number(performance.summary.totalAllocated ?? 0)
      const expense = Number(performance.summary.totalSpent ?? 0)
      const deduction = income * 0.1
      const surplus = income - expense - deduction
      return { income, expense, deduction, surplus }
    }
    const income = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "INCOME")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const expense = entries
      .filter((entry) => (entry.type ?? "").toUpperCase() === "EXPENSE")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)

    const overall = entries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0)
    const resolvedIncome = income || overall
    const resolvedExpense = expense || overall
    const deduction = resolvedIncome * 0.1
    const surplus = resolvedIncome - resolvedExpense - deduction

    return { income: resolvedIncome, expense: resolvedExpense, deduction, surplus }
  }, [entries, performance])


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

                  <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7280] font-medium leading-snug">Manage operational, program, and capital expenditures for next fiscal month.</p>

                </div>

                <div className="flex flex-row items-center w-full md:w-auto gap-3">

                  <label className="flex items-center gap-2 h-[38px] md:h-[34px] px-2 sm:px-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[11px] sm:text-[12px] text-[#111827] font-bold shadow-sm">
                    <Calendar className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span className="hidden sm:inline text-[#6B7280] font-medium">FY</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-transparent outline-none text-[12px] font-bold text-[#111827] cursor-pointer pr-1"
                      aria-label="Fiscal year"
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
                  <button
                    disabled={!lastBudgetId}
                    className="flex flex-1 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] border border-emerald-200 bg-emerald-50 text-[12px] text-emerald-700 font-bold shadow-sm transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {lastBudgetId ? "Submitted" : "Awaiting Submit"}
                  </button>

                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="flex flex-2 justify-center md:flex-none whitespace-nowrap items-center h-[38px] md:h-[34px] px-3 sm:px-4 rounded-[6px] bg-[#3B5BDB] text-[12px] text-white font-bold shadow-[0_4px_14px_rgba(59,91,219,0.25)] hover:bg-[#3451b2] transition-all tracking-wide disabled:opacity-60 disabled:cursor-not-allowed">

                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2 outline-none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>

                    {submittingProposal ? "Submitting..." : "Submit Budget Proposal to Lead Pastor"}

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
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] tracking-wide truncate">{entries.filter((e) => e.type === "INCOME").length} income line{entries.filter((e) => e.type === "INCOME").length === 1 ? "" : "s"}</div>

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
                      Approved Budget · FY {selectedYear}
                    </h3>
                    <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#6B7280] font-medium truncate">
                      {performanceLoading
                        ? "Loading performance…"
                        : performanceError
                          ? performanceError
                          : budgetForYear
                            ? `${budgetForYear.title ?? "Budget"} · Status: ${budgetForYear.status ?? "—"}`
                            : "No approved budget for this fiscal year yet."}
                    </p>
                  </div>
                  <span className="text-[#6B7280] text-[12px] font-semibold shrink-0 ml-3">
                    {breakdownOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {breakdownOpen && (
                  <div id="approved-budget-breakdown" className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#EEF1F6]">
                    {performance?.summary && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-4 text-[12px]">
                        <div>
                          <div className="text-[#6B7280] font-medium">Total Allocated</div>
                          <div className="font-bold text-[#111827]">{formatCurrency(performance.summary.totalAllocated)}</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Total Spent YTD</div>
                          <div className="font-bold text-[#111827]">{formatCurrency(performance.summary.totalSpent)}</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Utilization</div>
                          <div className="font-bold text-[#111827]">{Math.round(performance.summary.utilization ?? 0)}%</div>
                        </div>
                        <div>
                          <div className="text-[#6B7280] font-medium">Months Elapsed</div>
                          <div className="font-bold text-[#111827]">{performance.summary.monthsElapsed}</div>
                        </div>
                      </div>
                    )}

                    {performance && performance.lineItems.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-[12px] border-collapse">
                          <thead>
                            <tr className="text-[#6B7280] font-semibold border-b border-[#EEF1F6]">
                              <th className="py-2 pr-3">Line Item</th>
                              <th className="py-2 pr-3">Annual Budget</th>
                              <th className="py-2 pr-3">Spent YTD</th>
                              <th className="py-2 pr-3">Variance</th>
                              <th className="py-2 pr-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {performance.lineItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-[#F1F5F9]">
                                <td className="py-2 pr-3 text-[#111827] font-medium">
                                  {item.chartOfAccount?.name ?? "—"}
                                  {item.chartOfAccount?.code ? (
                                    <span className="ml-1 text-[#6B7280] font-normal">({item.chartOfAccount.code})</span>
                                  ) : null}
                                </td>
                                <td className="py-2 pr-3 text-[#111827]">{formatCurrency(Number(item.annualBudget ?? 0))}</td>
                                <td className="py-2 pr-3 text-[#111827]">{formatCurrency(Number(item.actualSpentYTD ?? 0))}</td>
                                <td className={`py-2 pr-3 font-semibold ${Number(item.variance ?? 0) < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                  {formatCurrency(Number(item.variance ?? 0))}
                                </td>
                                <td className="py-2 pr-3">
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[11px] font-bold text-[#374151]">
                                    {(item.status ?? "—").replace(/_/g, " ")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : allocations.length > 0 ? (
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
                            {allocations.map((a, idx) => {
                              const coa = typeof a.chartOfAccountId === "object" ? a.chartOfAccountId : undefined
                              return (
                                <tr key={a._id ?? a.id ?? idx} className="border-b border-[#F1F5F9]">
                                  <td className="py-2 pr-3 text-[#111827] font-medium">
                                    {coa?.name ?? "—"}
                                    {coa?.code ? <span className="ml-1 text-[#6B7280] font-normal">({coa.code})</span> : null}
                                  </td>
                                  <td className="py-2 pr-3 text-[#111827]">{formatCurrency(Number(a.amount ?? 0))}</td>
                                  <td className="py-2 pr-3 text-[#6B7280]">{a.notes ?? ""}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      !performanceLoading && !performanceError && (
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
                          {CATEGORY_OPTIONS.map((cat) => (
                            <button
                              key={cat}
                              type="button"
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

                      ) : mergedGroups.length === 0 ? (

                        <tr>

                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">

                            No budget entries found for this period.

                          </td>

                        </tr>

                      ) : (

                        mergedGroups.map((group, gIdx) => (

                          <React.Fragment key={gIdx}>

                            <tr className="border-t border-[#EEF1F6] bg-gray-50/50">

                              <td colSpan={5} className="py-3 sm:py-4 pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">

                                <div className="flex items-center text-[12px] sm:text-[13px] font-bold text-[#111827]">

                                  <ChevronDown className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#111827] shrink-0" strokeWidth={2.5} />

                                  {group.category}

                                </div>

                              </td>

                            </tr>



                            {group.items.map((item) => (

                              <tr key={item.id} className="hover:bg-gray-50/20 transition-colors bg-white group border-b border-[#EEF1F6]/50 last:border-0">

                                <td className="py-3 pl-[32px] sm:pl-[44px] lg:pl-[52px] pr-4 font-medium text-[#374151] border-0 text-[12px] sm:text-[13px]">

                                  {item.name}

                                </td>

                                <td className="py-3 font-semibold text-[#6B7280] tracking-tight text-center border-0 text-[12px] sm:text-[13px]">

                                  {item.actual}

                                </td>

                                <td className="py-3 px-2 flex justify-center border-0">

                                  <div className="flex items-center h-[36px] sm:h-[38px] w-full max-w-[140px] rounded-[6px] border border-[#EEF1F6] bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]/20 transition-all">

                                    <span className="text-[#9CA3AF] font-bold mr-1.5 sm:mr-2 text-[12px] sm:text-[13px]">₦</span>
                                    <input

                                      type="text"

                                      aria-label="Proposed budget amount"

                                      placeholder="0"

                                      defaultValue={item.proposed}

                                      className="bg-transparent w-full text-[12px] sm:text-[13px] font-bold text-[#111827] outline-none tracking-tight"

                                    />

                                  </div>

                                </td>

                                <td className="py-3 text-center border-0">

                                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3AA5F3] mx-auto cursor-pointer hover:opacity-80 transition-opacity" strokeWidth={2} />

                                </td>

                                <td className="py-3 pr-4 sm:pr-6 lg:pr-8 text-right border-0">

                                  <span className={`inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-bold tracking-wide ${item.isPositive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>

                                    {item.variance}

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

                  <button className="text-[12px] sm:text-[13px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors shrink-0 whitespace-nowrap bg-white sm:bg-transparent border border-[#E5E7EB] sm:border-transparent px-4 py-2 sm:px-0 sm:py-0 rounded-[6px] sm:rounded-none">Save as Draft</button>

                  <button onClick={handleSubmitProposal} disabled={submittingProposal} className="h-[38px] sm:h-[40px] flex-1 sm:flex-none justify-center shrink-0 whitespace-nowrap px-4 sm:px-6 rounded-[8px] bg-[#3B5BDB] text-white text-[12px] sm:text-[13px] font-bold shadow-[0_4px_14px_rgba(59,91,219,0.35)] hover:bg-[#3451b2] transition-colors tracking-wide outline-none disabled:opacity-60 disabled:cursor-not-allowed">

                    {submittingProposal ? "Submitting..." : "Submit Complete Budget"}

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



