"use client"

import React, { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle2, Download, Landmark, Menu, Plus, Search, Upload } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { ManageAccountsModal } from "@/app/(screens)/director-screen/transaction/page"
import { AllocateModal, MatchModal, StatementImportModal, useLedgerAccounts } from "@/components/ledger/LedgerModals"
import {
  lineState,
  loadStatementLines,
  loadStatementSummary,
  ngn,
  shortDate,
  timeOf,
  type StatementLine,
  type StatementSummary,
} from "@/lib/ledger"
import { API_V1 } from "@/lib/api"

const mono = "font-mono tracking-tight"
const PAGE = 10
const TONES = ["bg-[#10B981]", "bg-[#0F172A]", "bg-[#F59E0B]", "bg-rose-500", "bg-[#3B5BDB]", "bg-[#8B5CF6]"]

const DIRECTIONS = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
] as const
const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "unclassified", label: "Awaiting allocation" },
  { value: "unreconciled", label: "Unreconciled" },
  { value: "reconciled", label: "Reconciled" },
] as const

/**
 * All Statement Transactions — the Multi-Bank Ledger. Every bank movement
 * imported from a statement, with the tools to close each one out: allocate
 * an unclassified inflow, or match a line to the entries behind it.
 */
function ReportsInner() {
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { branchId, branches, loading: branchLoading } = useBranchContext()
  const branchName = branches.find((b) => b.id === branchId)?.name ?? ""
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const { accounts } = useLedgerAccounts(branchId, version)

  const [accountFilter, setAccountFilter] = useState("")
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number]["value"]>("all")
  const [status, setStatus] = useState<(typeof STATUSES)[number]["value"]>("")
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const [lines, setLines] = useState<StatementLine[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [summary, setSummary] = useState<StatementSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The table is server-paginated and server-filtered.
  useEffect(() => {
    if (branchLoading) return
    let active = true
    setLoading(true)
    setError(null)
    const filters = { bankAccountId: accountFilter || undefined, startDate: from || undefined, endDate: to || undefined }
    Promise.all([
      loadStatementLines({ ...filters, direction, status: status || undefined, search: search || undefined, page, limit: PAGE }),
      loadStatementSummary(filters),
    ])
      .then(([list, sum]) => {
        if (!active) return
        setLines(list.lines)
        setTotal(list.total)
        setPages(Math.max(1, list.pages))
        setSummary(sum)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load the statement stream.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [branchLoading, accountFilter, direction, status, search, from, to, page, version])

  useEffect(() => setPage(1), [accountFilter, direction, status, search, from, to])

  const toneOf = (id: string) => TONES[Math.max(0, (summary?.accounts ?? []).findIndex((a) => a.bankAccountId === id)) % TONES.length]

  const [importOpen, setImportOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [allocating, setAllocating] = useState<StatementLine | null>(null)
  const [matching, setMatching] = useState<StatementLine | null>(null)

  const exportHref = `${API_V1}/financial/export/transactions?${new URLSearchParams({
    ...(branchId ? { branchId } : {}),
    ...(from ? { startDate: from } : {}),
    ...(to ? { endDate: to } : {}),
  }).toString()}`

  const accountRows = summary?.accounts ?? []
  const totalLines = summary?.counts.total ?? 0

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/general-ledger" mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-w-0 text-[#111827]">
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div><div className="text-[15px] font-bold">Financial Overview</div><div className="hidden sm:block text-[11px] text-[#6B7280]">Global financial health monitoring</div></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#374151]"><Landmark className="h-4 w-4 text-[#6B7280]" />{branchName || "Branch"}</div>
            <a href={exportHref} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-rose-600 px-3.5 text-[12px] font-bold text-white hover:bg-rose-700"><Download className="h-4 w-4" />Export</a>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/branchaccount-pastor/general-ledger" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]"><ArrowLeft className="h-4 w-4" />Back to Ledger</Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-3 mb-6">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight">All Bank Statement Transactions — Multi-Bank Ledger</h1>
              <p className="text-[12.5px] text-[#6B7280] mt-1">Every bank movement across the branch&apos;s accounts, matched to ledger entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setImportOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151] hover:bg-gray-50"><Upload className="h-4 w-4" />Upload Statement</button>
              <button onClick={() => setAccountsOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-rose-600 px-3.5 text-[12px] font-bold text-white hover:bg-rose-700"><Plus className="h-4 w-4" />Add Account</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Statement inflow (credits)</div><div className={`${mono} text-[22px] font-extrabold mt-2 text-emerald-600`}>{ngn(summary?.inflow ?? 0, { decimals: true })}</div><div className="text-[10.5px] text-[#9CA3AF] mt-2">{summary?.counts.credits ?? 0} lines</div></div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Statement outflow (debits)</div><div className={`${mono} text-[22px] font-extrabold mt-2 text-rose-600`}>{ngn(summary?.outflow ?? 0, { decimals: true })}</div><div className="text-[10.5px] text-[#9CA3AF] mt-2">{summary?.counts.debits ?? 0} lines</div></div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Net statement position</div><div className={`${mono} text-[22px] font-extrabold mt-2 ${(summary?.net ?? 0) >= 0 ? "text-[#111827]" : "text-rose-600"}`}>{(summary?.net ?? 0) >= 0 ? "+" : ""}{ngn(summary?.net ?? 0, { decimals: true })}</div><div className="text-[10.5px] text-[#9CA3AF] mt-2">{summary?.currency ?? "NGN"} only</div></div>
            <button onClick={() => setStatus("unclassified")} className="text-left rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:border-rose-200 transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Awaiting allocation</div>
              <div className={`${mono} text-[22px] font-extrabold mt-2 ${(summary?.counts.unclassified ?? 0) > 0 ? "text-rose-600" : "text-[#111827]"}`}>{ngn(summary?.unclassifiedAmount ?? 0, { decimals: true })}</div>
              <div className="text-[10.5px] text-[#9CA3AF] mt-2">{summary?.counts.unclassified ?? 0} {summary?.counts.unclassified === 1 ? "line" : "lines"} to categorise</div>
            </button>
          </div>

          {/* Account chips */}
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-2">Institution bank accounts</div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAccountFilter("")} className={`h-8 rounded-[6px] px-3 text-[11.5px] font-bold border ${!accountFilter ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>All accounts ({totalLines})</button>
              {accountRows.map((a, i) => (
                <button key={a.bankAccountId} onClick={() => setAccountFilter(a.bankAccountId === accountFilter ? "" : a.bankAccountId)} className={`h-8 rounded-[6px] px-3 text-[11.5px] font-semibold border inline-flex items-center gap-2 ${accountFilter === a.bankAccountId ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
                  <span className={`h-2 w-2 rounded-full ${TONES[i % TONES.length]}`} />{a.bankName} <span className={`${mono} text-[#9CA3AF]`}>{a.accountNumber.slice(-4)}</span>
                  {a.unclassifiedCount > 0 && <span className="rounded-full bg-rose-500 text-white text-[9px] font-bold px-1.5">{a.unclassifiedCount}</span>}
                </button>
              ))}
              {accountRows.length === 0 && <span className="text-[12px] text-[#9CA3AF]">No bank accounts yet — add one to start uploading statements.</span>}
            </div>
          </div>

          {/* Stream */}
          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF1F6]">
              <div><h2 className="text-[15px] font-extrabold">Consolidated Statement Stream</h2><p className="text-[11px] text-[#6B7280]">Page {page} of {pages} · {total} rows · Ledger currency: {summary?.currency ?? "NGN"}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-[6px] bg-[#EEF1F6] p-0.5">
                  {DIRECTIONS.map((d) => (
                    <button key={d.value} onClick={() => setDirection(d.value)} className={`h-7 px-2.5 rounded-[5px] text-[11px] font-bold ${direction === d.value ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]"}`}>{d.label}</button>
                  ))}
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-[11.5px] font-semibold">
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search narration or reference…" className="h-8 w-56 rounded-[6px] border border-[#E5E7EB] bg-white pl-8 pr-3 text-[11.5px]" /></div>
                <div className="flex items-center gap-1 h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-[11px]"><Calendar className="h-3.5 w-3.5 text-[#9CA3AF]" /><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-transparent outline-none w-[110px]" /><span className="text-[#9CA3AF]">–</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-transparent outline-none w-[110px]" /></div>
              </div>
            </div>
            {error && <div className="px-5 py-3 text-[12px] text-rose-600">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[1080px]">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6] bg-[#F8FAFC]">
                    <th className="px-5 py-2.5">Date &amp; time</th><th className="px-3 py-2.5">Bank / account</th><th className="px-3 py-2.5">Statement reference</th><th className="px-3 py-2.5">Narration / description</th><th className="px-3 py-2.5">Category &amp; fund</th><th className="px-3 py-2.5 text-right">Debit (outflow ₦)</th><th className="px-3 py-2.5 text-right">Credit (inflow ₦)</th><th className="px-5 py-2.5">Status &amp; action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading && <tr><td colSpan={8} className="px-5 py-10 text-center text-[#9CA3AF]">Loading the statement stream…</td></tr>}
                  {!loading && lines.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-[#9CA3AF]">{totalLines === 0 ? "No bank movements yet. Upload a statement to populate the stream." : "Nothing matches the current filters."}</td></tr>}
                  {lines.map((l) => {
                    const st = lineState(l)
                    return (
                      <tr key={l.id} className="hover:bg-[#F8FAFC] align-top">
                        <td className="px-5 py-3 whitespace-nowrap"><div className="font-semibold">{shortDate(l.date)}</div><div className={`${mono} text-[10.5px] text-[#6B7280]`}>{timeOf(l.date)}</div></td>
                        <td className="px-3 py-3"><div className="flex items-start gap-2"><span className={`mt-1 h-4 w-1 rounded-full ${l.bankAccountId ? toneOf(l.bankAccountId) : "bg-[#CBD5E1]"}`} /><div><div className="font-bold">{l.bankName || "—"}</div><div className={`${mono} text-[10.5px] text-[#6B7280]`}>{l.accountNumber}</div></div></div></td>
                        <td className="px-3 py-3"><div className={`${mono} font-bold`}>{l.reference || "—"}</div></td>
                        <td className="px-3 py-3 max-w-[280px]"><div className="font-semibold uppercase truncate">{l.description || "—"}</div></td>
                        <td className="px-3 py-3">{l.coaName ? <span className={`${mono} rounded-[4px] px-1.5 py-0.5 text-[10.5px] font-bold uppercase ${l.transactionType === "credit" ? "bg-rose-50 text-rose-600" : "bg-[#0F172A] text-white"}`}>{l.coaName}</span> : <span className="text-[10.5px] font-bold uppercase text-rose-600">Unclassified {l.transactionType === "credit" ? "inflow" : "outflow"}</span>}</td>
                        <td className={`px-3 py-3 text-right ${mono} font-bold text-rose-600`}>{l.transactionType === "debit" ? `-${ngn(l.amount, { decimals: true })}` : "-"}</td>
                        <td className={`px-3 py-3 text-right ${mono} font-bold text-emerald-600`}>{l.transactionType === "credit" ? `+${ngn(l.amount, { decimals: true })}` : "-"}</td>
                        <td className="px-5 py-3">
                          {st.label === "Allocate now" ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-[4px] bg-rose-50 text-rose-600 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap">Allocate now</span>
                              <button onClick={() => setAllocating(l)} className="h-7 rounded-[6px] bg-rose-600 text-white px-3 text-[11px] font-bold hover:bg-rose-700">Allocate</button>
                            </div>
                          ) : st.tone === "green" ? (
                            <button onClick={() => setMatching(l)} className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3" />{st.label}</button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap">Unreconciled</span>
                              <button onClick={() => setMatching(l)} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] hover:bg-gray-50">Match</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[#EEF1F6] text-[11px] text-[#6B7280]">
              <span>Displaying {lines.length} of {total} transactions · Rows: {PAGE}</span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-2.5 font-semibold disabled:opacity-40">Previous</button>
                {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 rounded-[6px] border font-bold ${p === page ? "bg-rose-600 text-white border-rose-600" : "bg-white border-[#E5E7EB]"}`}>{p}</button>
                ))}
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-2.5 font-semibold disabled:opacity-40">Next</button>
              </div>
            </div>
          </section>

          {/* Per-bank breakdown */}
          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-[#EEF1F6]"><h2 className="text-[15px] font-extrabold">Bank Volume Aggregation Breakdown</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[760px]">
                <thead><tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6] bg-[#F8FAFC]"><th className="px-5 py-2.5">Commercial institution</th><th className="px-3 py-2.5 text-right">Credits (inflow)</th><th className="px-3 py-2.5 text-right">Debits (outflow)</th><th className="px-3 py-2.5 text-right">Net flow</th><th className="px-3 py-2.5 text-right">Unreconciled</th><th className="px-5 py-2.5 text-right">To allocate</th></tr></thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {accountRows.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-[#9CA3AF]">No bank accounts yet.</td></tr>}
                  {accountRows.map((a, i) => (
                    <tr key={a.bankAccountId}>
                      <td className="px-5 py-3"><span className="inline-flex items-center gap-2 font-bold"><span className={`h-2.5 w-2.5 rounded-full ${TONES[i % TONES.length]}`} />{a.bankName} <span className="text-[#6B7280] font-medium">({a.accountName})</span></span></td>
                      <td className={`px-3 py-3 text-right ${mono} font-bold text-emerald-600`}>+{ngn(a.inflow, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-bold text-rose-600`}>-{ngn(a.outflow, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{a.net >= 0 ? "+" : ""}{ngn(a.net, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} text-[#6B7280]`}>{a.unreconciledCount}</td>
                      <td className={`px-5 py-3 text-right ${mono} font-bold ${a.unclassifiedCount > 0 ? "text-rose-600" : "text-[#6B7280]"}`}>{a.unclassifiedCount}</td>
                    </tr>
                  ))}
                  {accountRows.length > 0 && (
                    <tr className="bg-[#F8FAFC]">
                      <td className="px-5 py-3 font-extrabold uppercase text-[11px]">Total</td>
                      <td className={`px-3 py-3 text-right ${mono} font-extrabold text-emerald-600`}>+{ngn(accountRows.reduce((s, r) => s + r.inflow, 0), { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-extrabold text-rose-600`}>-{ngn(accountRows.reduce((s, r) => s + r.outflow, 0), { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(accountRows.reduce((s, r) => s + r.net, 0), { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono}`}>{accountRows.reduce((s, r) => s + r.unreconciledCount, 0)}</td>
                      <td className={`px-5 py-3 text-right ${mono}`}>{accountRows.reduce((s, r) => s + r.unclassifiedCount, 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <StatementImportModal open={importOpen} onClose={() => setImportOpen(false)} accounts={accounts} onImported={refresh} />
      <ManageAccountsModal open={accountsOpen} onClose={() => { setAccountsOpen(false); refresh() }} />
      <AllocateModal open={allocating !== null} onClose={() => setAllocating(null)} line={allocating} onAllocated={refresh} />
      <MatchModal open={matching !== null} onClose={() => setMatching(null)} line={matching} onReconciled={refresh} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReportsInner />
    </Suspense>
  )
}
