"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Landmark,
  Menu,
  PenLine,
  Plus,
  Search,
  Upload,
  Vault,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { useToast } from "@/components/ui/toast"
import { ManageAccountsModal } from "@/app/(screens)/director-screen/transaction/page"
import {
  AllocateModal,
  BankBalanceModal,
  MatchModal,
  NewEntryModal,
  SafeBatchModal,
  StatementImportModal,
  useLedgerAccounts,
} from "@/components/ledger/LedgerModals"
import {
  buildSafeView,
  entryRef,
  loadLedgerEntries,
  loadStatementLines,
  loadStatementSummary,
  loadStreams,
  ngn,
  shortDate,
  type LedgerEntry,
  type StatementLine,
} from "@/lib/ledger"

const mono = "font-mono tracking-tight"

/**
 * The accountant's General Ledger: entries the church has booked and not yet
 * seen on the bank statement, and the tools that close them out.
 */
export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pushToast } = useToast()
  const { branchId, branches, loading: branchLoading } = useBranchContext()
  const branchName = branches.find((b) => b.id === branchId)?.name ?? ""

  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const { accounts } = useLedgerAccounts(branchId, version)

  const [pendingIncome, setPendingIncome] = useState<LedgerEntry[]>([])
  const [pendingExpense, setPendingExpense] = useState<LedgerEntry[]>([])
  const [reconciledEntries, setReconciledEntries] = useState<LedgerEntry[]>([])
  const [monthToDate, setMonthToDate] = useState(0)
  const [unclassified, setUnclassified] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (branchLoading) return
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      loadLedgerEntries({ entryType: "income", reconciliationStatus: "unreconciled", limit: 100 }),
      loadLedgerEntries({ entryType: "expense", reconciliationStatus: "unreconciled", limit: 100 }),
      loadLedgerEntries({ reconciliationStatus: "reconciled", limit: 100 }).catch(() => [] as LedgerEntry[]),
      loadStreams({ entryType: "income" }).catch(() => null),
      loadStatementSummary().catch(() => null),
    ])
      .then(([income, expense, reconciled, streams, summary]) => {
        if (!active) return
        setPendingIncome(income)
        setPendingExpense(expense)
        setReconciledEntries(reconciled)
        setMonthToDate(streams?.totals.income ?? 0)
        setUnclassified(summary?.counts.unclassified ?? 0)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load the ledger.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [branchId, branchLoading, version])

  const bankTotal = accounts.reduce((s, a) => s + a.balance, 0)
  // The safe is the income already recorded that the bank has not confirmed.
  const safe = useMemo(() => buildSafeView(pendingIncome), [pendingIncome])

  const [incomeOpen, setIncomeOpen] = useState(true)
  const [expenseOpen, setExpenseOpen] = useState(true)
  const [incomeFilter, setIncomeFilter] = useState("")
  const [expenseFilter, setExpenseFilter] = useState("")
  const matches = (e: LedgerEntry, q: string) =>
    !q || [entryRef(e), e.description, e.coaName, e.coaCode, e.requisitionNumber, e.payee, e.notes].join(" ").toLowerCase().includes(q.toLowerCase())
  const incomeRows = useMemo(() => pendingIncome.filter((e) => matches(e, incomeFilter)), [pendingIncome, incomeFilter])
  const expenseRows = useMemo(() => pendingExpense.filter((e) => matches(e, expenseFilter)), [pendingExpense, expenseFilter])

  const [safeOpen, setSafeOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [entryOpen, setEntryOpen] = useState(false)
  const [viewing, setViewing] = useState<LedgerEntry | null>(null)
  const [matchLine, setMatchLine] = useState<StatementLine | null>(null)
  const [allocateLine, setAllocateLine] = useState<StatementLine | null>(null)
  const [findingLine, setFindingLine] = useState(false)

  // "All Slips" / "All Receipt": save every receipt on the rows shown.
  const downloadAll = (rows: LedgerEntry[], what: string) => {
    const files = rows.filter((e) => e.receiptUrl).map((e) => ({ url: e.receiptUrl, name: `${entryRef(e)}-${e.receiptUrl.split("/").pop() || what}` }))
    if (files.length === 0) {
      pushToast(`No ${what} are attached to these entries yet.`, "info")
      return
    }
    files.forEach((f, i) => {
      window.setTimeout(() => {
        const a = document.createElement("a")
        a.href = f.url
        a.download = f.name
        a.target = "_blank"
        a.rel = "noreferrer"
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, i * 250)
    })
    pushToast(`Downloading ${files.length} ${files.length === 1 ? what.replace(/s$/, "") : what}…`, "success")
  }

  /**
   * Banking a pay-in means reconciling it against the deposit on the bank
   * statement, so the safe's "Cash Paid In" opens that line's matching modal.
   * The unreconciled credit closest in amount is the one to open.
   */
  const openPayIn = async (entry: LedgerEntry | null) => {
    setSafeOpen(false)
    setViewing(null)
    setFindingLine(true)
    try {
      const { lines } = await loadStatementLines({ direction: "credit", status: "unreconciled", limit: 100 })
      if (lines.length === 0) {
        pushToast("No unreconciled bank deposits yet. Import the statement for the bank run first.", "info")
        return
      }
      const target = entry?.amount ?? safe.total
      const best = [...lines].sort((a, b) => Math.abs(a.amount - target) - Math.abs(b.amount - target))[0]
      setMatchLine(best)
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to find the bank deposit.", "error")
    } finally {
      setFindingLine(false)
    }
  }

  const collectionOf = (e: LedgerEntry) =>
    e.notes.toLowerCase().startsWith("office")
      ? { label: "Office collection", cls: "bg-[#F1F5F9] text-[#475569]" }
      : { label: "Service collection", cls: "bg-rose-50 text-rose-600" }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/general-ledger" mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-w-0 text-[#111827]">
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div>
              <div className="text-[15px] font-bold text-[#111827]">Financial Overview</div>
              <div className="hidden sm:block text-[11px] text-[#6B7280]">Global financial health monitoring</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input className="h-10 w-56 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm" placeholder="Search entries..." value={incomeFilter} onChange={(e) => { setIncomeFilter(e.target.value); setExpenseFilter(e.target.value) }} />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827]" aria-label="Notifications"><Bell className="h-5 w-5" />{unclassified > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />}</button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[24px] font-extrabold tracking-tight">General Ledger</h1>
              <p className="text-[12.5px] text-[#6B7280] mt-1">Real-time dual-entry postings, physical safe arrivals, and statement batches.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setImportOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151] hover:bg-gray-50"><Upload className="h-4 w-4" />Upload Statements</button>
              <button onClick={() => setEntryOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-rose-600 px-3.5 text-[12px] font-bold text-white hover:bg-rose-700"><PenLine className="h-4 w-4" />Entry</button>
              <Link href="/branchaccount-pastor/general-ledger/reports" className="relative h-9 inline-flex items-center gap-2 rounded-[8px] bg-[#0F172A] px-3.5 text-[12px] font-bold text-white hover:bg-[#1E293B]">
                <BarChart3 className="h-4 w-4" />Reports
                {unclassified > 0 && <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unclassified}</span>}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <button onClick={() => setSafeOpen(true)} className="text-left rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:border-rose-200 transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Cash safe balance</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(safe.total)}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">{safe.batches.length} unbanked {safe.batches.length === 1 ? "collection" : "collections"}</span>
                <span className="h-7 rounded-[6px] bg-rose-600 text-white px-3 text-[11px] font-bold inline-flex items-center">View</span>
              </div>
            </button>
            <button onClick={() => setBankOpen(true)} className="text-left rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:border-rose-200 transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Bank balance</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(bankTotal)}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">{accounts.length} {accounts.length === 1 ? "account" : "accounts"}</span>
                <span className="h-7 rounded-[6px] bg-rose-600 text-white px-3 text-[11px] font-bold inline-flex items-center">View Bank Balances</span>
              </div>
            </button>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Income to date</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(monthToDate)}</div>
              <div className="text-[10.5px] text-[#9CA3AF] mt-3">Across every income stream</div>
            </div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Accounts</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{accounts.length}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">Add new account</span>
                <button onClick={() => setAccountsOpen(true)} className="h-7 w-7 rounded-[6px] bg-rose-600 text-white inline-flex items-center justify-center" aria-label="Add new account"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-[#EEF1F6]">
              <h2 className="text-[16px] font-extrabold">Recent Activity &amp; Ledger Stream</h2>
              <p className="text-[12px] text-[#6B7280] mt-0.5">Real-time entry postings and physical safe arrivals.</p>
            </div>
            {error && <div className="px-5 py-3 text-[12px] text-rose-600">{error}</div>}

            {/* Pending income */}
            <div className="border-b border-[#EEF1F6]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#F8FAFC]">
                <button onClick={() => setIncomeOpen((v) => !v)} className="flex items-center gap-2 text-left">
                  {incomeOpen ? <ChevronDown className="h-4 w-4 text-[#6B7280]" /> : <ChevronRight className="h-4 w-4 text-[#6B7280]" />}
                  <span className="text-[12px] font-extrabold uppercase tracking-wide">Pending income entries</span>
                  <span className="text-[11px] text-[#6B7280] hidden sm:inline">(Recorded, waiting for the bank deposit)</span>
                  <span className="rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10px] font-bold">{pendingIncome.length} {pendingIncome.length === 1 ? "item" : "items"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <input value={incomeFilter} onChange={(e) => setIncomeFilter(e.target.value)} placeholder="Filter income batches..." className="h-8 w-[200px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11.5px]" />
                  <button onClick={() => downloadAll(incomeRows, "slips")} className="h-8 w-[150px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center justify-center gap-1.5 hover:bg-gray-50"><Download className="h-3.5 w-3.5" />All Slips</button>
                </div>
              </div>
              {incomeOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] min-w-[860px]">
                    <thead>
                      <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6]">
                        <th className="px-5 py-2.5">#</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Entry ID</th><th className="px-3 py-2.5">Source</th><th className="px-3 py-2.5">Fund / account</th><th className="px-3 py-2.5 text-right">Amount (₦)</th><th className="px-3 py-2.5">Status</th><th className="px-5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {loading && <tr><td colSpan={8} className="px-5 py-8 text-center text-[#9CA3AF]">Loading entries…</td></tr>}
                      {!loading && incomeRows.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-[#9CA3AF]">{pendingIncome.length === 0 ? "No income is waiting for a bank deposit. Post an income entry to see it here." : "No entries match the filter."}</td></tr>}
                      {incomeRows.map((e, i) => {
                        const c = collectionOf(e)
                        return (
                          <tr key={e.id} className="hover:bg-[#F8FAFC]">
                            <td className={`px-5 py-3 ${mono} text-[#6B7280]`}>{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{shortDate(e.date)}</td>
                            <td className={`px-3 py-3 ${mono} font-bold`}>{entryRef(e)}</td>
                            <td className="px-3 py-3">
                              <div className="min-w-0">
                                <div className="font-semibold truncate max-w-[220px]">{e.description || e.notes || "—"}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${c.cls}`}>{c.label}</span>
                                  {e.receiptUrl && <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="text-[9.5px] font-bold uppercase tracking-wide text-rose-600 hover:underline">View form</a>}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10.5px] font-bold`}>{e.coaName || "Uncategorised"}{e.coaCode ? ` • ${e.coaCode}` : ""}</span></td>
                            <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(e.amount, { decimals: true })}</td>
                            <td className="px-3 py-3"><span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap"><Vault className="h-3 w-3" />{e.paymentMethod === "cash" ? "In safe" : "Awaiting bank"}</span></td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openPayIn(e)} disabled={findingLine} className="h-7 rounded-[6px] bg-rose-600 text-white px-3 text-[11px] font-bold hover:bg-rose-700 disabled:opacity-60">{findingLine ? "Finding…" : "Record Pay-in"}</button>
                                <button onClick={() => setViewing(e)} className="h-7 w-7 rounded-full text-[#6B7280] hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center" aria-label="View batch"><Eye className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#6B7280] bg-[#F8FAFC]">
                    <span>{pendingIncome.length} pending {pendingIncome.length === 1 ? "line" : "lines"} stored</span>
                    <span>Income queue batch total: <span className={`${mono} text-[#111827]`}>{ngn(pendingIncome.reduce((s, e) => s + e.amount, 0), { decimals: true })}</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Pending expenses */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#F8FAFC]">
                <button onClick={() => setExpenseOpen((v) => !v)} className="flex items-center gap-2 text-left">
                  {expenseOpen ? <ChevronDown className="h-4 w-4 text-[#6B7280]" /> : <ChevronRight className="h-4 w-4 text-[#6B7280]" />}
                  <span className="text-[12px] font-extrabold uppercase tracking-wide">Pending expense entries</span>
                  <span className="text-[11px] text-[#6B7280] hidden sm:inline">(Paid, waiting for the bank debit)</span>
                  <span className="rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10px] font-bold">{pendingExpense.length} {pendingExpense.length === 1 ? "item" : "items"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <input value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} placeholder="Filter expenses..." className="h-8 w-[200px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11.5px]" />
                  <button onClick={() => downloadAll(expenseRows, "receipts")} className="h-8 w-[150px] rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center justify-center gap-1.5 hover:bg-gray-50"><Download className="h-3.5 w-3.5" />All Receipt</button>
                </div>
              </div>
              {expenseOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] min-w-[860px]">
                    <thead>
                      <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6]">
                        <th className="px-5 py-2.5">#</th><th className="px-3 py-2.5">Date</th><th className="px-3 py-2.5">Entry ID</th><th className="px-3 py-2.5">Requisition ref</th><th className="px-3 py-2.5">Payee / purpose</th><th className="px-3 py-2.5 text-right">Amount (₦)</th><th className="px-5 py-2.5 text-right">Action / drilldown</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1F6]">
                      {loading && <tr><td colSpan={7} className="px-5 py-8 text-center text-[#9CA3AF]">Loading entries…</td></tr>}
                      {!loading && expenseRows.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-[#9CA3AF]">{pendingExpense.length === 0 ? "No expenses are waiting for bank confirmation." : "No entries match the filter."}</td></tr>}
                      {expenseRows.map((e, i) => (
                        <tr key={e.id} className="hover:bg-[#F8FAFC]">
                          <td className={`px-5 py-3 ${mono} text-[#6B7280]`}>{String(i + 1).padStart(2, "0")}</td>
                          <td className="px-3 py-3 font-semibold whitespace-nowrap">{shortDate(e.date)}</td>
                          <td className={`px-3 py-3 ${mono} font-bold`}>{entryRef(e)}</td>
                          <td className="px-3 py-3">
                            {e.requisitionNumber ? (
                              <span className={`${mono} rounded-[4px] bg-rose-50 text-rose-600 px-1.5 py-0.5 text-[10.5px] font-bold`}>{e.requisitionNumber}</span>
                            ) : (
                              <span className="text-[10.5px] font-bold uppercase text-amber-600" title="Church expenses must carry an approved requisition">No requisition</span>
                            )}
                          </td>
                          <td className="px-3 py-3"><div className="font-semibold">{e.payee || e.description || "—"}</div>{e.payee && e.description ? <div className="text-[11px] text-[#6B7280] truncate max-w-[320px]">{e.description}</div> : null}</td>
                          <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(e.amount, { decimals: true })}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {e.receiptUrl ? (
                                <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center hover:bg-gray-50">View Receipt</a>
                              ) : (
                                <span className="h-7 rounded-[6px] border border-dashed border-[#E5E7EB] px-3 text-[11px] font-bold text-[#9CA3AF] inline-flex items-center" title="No receipt attached">No receipt</span>
                              )}
                              <Link href={`/branchaccount-pastor/general-ledger/reports?search=${encodeURIComponent(e.requisitionNumber || entryRef(e))}`} className="h-7 w-7 rounded-full text-[#6B7280] hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center" aria-label="Find on the statement" title="Find this debit on the bank statement"><Eye className="h-4 w-4" /></Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-[#6B7280] bg-[#F8FAFC] rounded-b-[12px]">
                    <span>{pendingExpense.length} disbursement {pendingExpense.length === 1 ? "item" : "items"} queued</span>
                    <span>Expense queue subtotal: <span className={`${mono} text-[#111827]`}>{ngn(pendingExpense.reduce((s, e) => s + e.amount, 0), { decimals: true })}</span></span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <p className="mt-4 text-[11px] text-[#9CA3AF] flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" />Bank movements uploaded from statements are matched and allocated under Reports.</p>
        </div>
      </main>

      <SafeBatchModal open={safeOpen} onClose={() => setSafeOpen(false)} branchName={branchName} entries={pendingIncome} onCashPaidIn={openPayIn} />
      <SafeBatchModal open={viewing !== null} onClose={() => setViewing(null)} branchName={branchName} entries={pendingIncome} entry={viewing} onCashPaidIn={openPayIn} />
      <BankBalanceModal open={bankOpen} onClose={() => setBankOpen(false)} branchName={branchName} accounts={accounts} entries={reconciledEntries} onAddAccount={() => { setBankOpen(false); setAccountsOpen(true) }} />
      <ManageAccountsModal open={accountsOpen} onClose={() => { setAccountsOpen(false); refresh() }} />
      <StatementImportModal open={importOpen} onClose={() => setImportOpen(false)} accounts={accounts} onImported={refresh} />
      <NewEntryModal open={entryOpen} onClose={() => setEntryOpen(false)} accounts={accounts} onPosted={refresh} />
      <MatchModal open={matchLine !== null} onClose={() => setMatchLine(null)} line={matchLine} onReconciled={refresh} />
      <AllocateModal open={allocateLine !== null} onClose={() => setAllocateLine(null)} line={allocateLine} onAllocated={refresh} />
    </div>
  )
}
