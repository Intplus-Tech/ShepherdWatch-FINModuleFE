"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle2, Download, Landmark, Menu, Paperclip, Plus, Search, Upload } from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { ManageAccountsModal, UploadTransactionsModal } from "@/app/(screens)/director-screen/transaction/page"
import { AllocateModal, SafeBatchModal, useLedgerAccounts } from "@/components/ledger/LedgerModals"
import { entryRef, entryState, loadLedgerEntries, ngn, shortDate, timeOf, type LedgerEntry } from "@/lib/ledger"
import { API_V1 } from "@/lib/api"

const mono = "font-mono tracking-tight"
const PAGE = 10
const TONES = ["bg-[#10B981]", "bg-[#0F172A]", "bg-[#F59E0B]", "bg-[#EF4444]", "bg-[#3B5BDB]", "bg-[#8B5CF6]"]

/**
 * Every bank movement on the ledger, across the branch's accounts: uploaded
 * statement lines alongside entries the bank has confirmed. Unclassified
 * lines are allocated here; reconciled ones open their voucher.
 */
export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { branchId, branches, loading: branchLoading } = useBranchContext()
  const branchName = branches.find((b) => b.id === branchId)?.name ?? ""
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const { accounts } = useLedgerAccounts(branchId, version)

  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (branchLoading) return
    let active = true
    setLoading(true)
    setError(null)
    loadLedgerEntries({ branchId, limit: 100 })
      .then((list) => {
        if (active) setEntries(list)
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
  }, [branchId, branchLoading, version])

  // Bank movements: statement lines, plus entries the bank has confirmed.
  const movements = useMemo(() => entries.filter((e) => e.source === "import" || e.status === "verified" || e.bankAccountId), [entries])

  const [accountFilter, setAccountFilter] = useState("")
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return movements.filter((e) => {
      if (accountFilter && e.bankAccountId !== accountFilter) return false
      if (from && e.date.slice(0, 10) < from) return false
      if (to && e.date.slice(0, 10) > to) return false
      if (q && ![entryRef(e), e.description, e.coaName, e.bankAccountName, String(e.amount)].join(" ").toLowerCase().includes(q)) return false
      return true
    })
  }, [movements, accountFilter, search, from, to])
  useEffect(() => setPage(1), [accountFilter, search, from, to])

  const inflow = rows.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0)
  const outflow = rows.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0)
  const accountOf = (id: string) => accounts.find((a) => a.id === id)
  const toneOf = (id: string) => TONES[Math.max(0, accounts.findIndex((a) => a.id === id)) % TONES.length]

  // Running balance, oldest first, then shown newest first.
  const withBalance = useMemo(() => {
    const asc = [...rows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let bal = 0
    const map = new Map<string, number>()
    for (const e of asc) {
      bal += e.type === "income" ? e.amount : -e.amount
      map.set(e.id, bal)
    }
    return rows.map((e) => ({ e, balance: map.get(e.id) ?? 0 }))
  }, [rows])
  const pages = Math.max(1, Math.ceil(withBalance.length / PAGE))
  const visible = withBalance.slice((page - 1) * PAGE, page * PAGE)

  const perAccount = useMemo(
    () =>
      accounts.map((a) => {
        const mine = movements.filter((e) => e.bankAccountId === a.id)
        const credit = mine.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0)
        const debit = mine.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0)
        return { account: a, credit, debit, net: credit - debit, count: mine.length }
      }),
    [accounts, movements]
  )

  const [uploadOpen, setUploadOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [allocating, setAllocating] = useState<LedgerEntry | null>(null)
  const [viewing, setViewing] = useState<LedgerEntry | null>(null)

  const exportHref = `${API_V1}/financial/export/transactions?${new URLSearchParams({ ...(branchId ? { branchId } : {}), ...(from ? { startDate: from } : {}), ...(to ? { endDate: to } : {}) }).toString()}`

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
            <a href={exportHref} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-3.5 text-[12px] font-bold text-white"><Download className="h-4 w-4" />Export</a>
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
              <button onClick={() => setUploadOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151]"><Upload className="h-4 w-4" />Upload Statement</button>
              <button onClick={() => setAccountsOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-3.5 text-[12px] font-bold text-white"><Plus className="h-4 w-4" />Add Account</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Statement inflows (₦)</div><div className={`${mono} text-[22px] font-extrabold mt-2 text-emerald-600`}>{ngn(inflow, { decimals: true })}</div></div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Statement outflows (₦)</div><div className={`${mono} text-[22px] font-extrabold mt-2 text-rose-600`}>{ngn(outflow, { decimals: true })}</div></div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Net inflow (₦)</div><div className={`${mono} text-[22px] font-extrabold mt-2 ${inflow - outflow >= 0 ? "text-[#111827]" : "text-rose-600"}`}>{inflow - outflow >= 0 ? "+" : ""}{ngn(inflow - outflow, { decimals: true })}</div></div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Accounts</div><div className={`${mono} text-[22px] font-extrabold mt-2`}>{accounts.length}</div></div><button onClick={() => setAccountsOpen(true)} className="h-8 w-8 rounded-[6px] bg-[#3B5BDB] text-white inline-flex items-center justify-center" aria-label="Add account"><Plus className="h-4 w-4" /></button></div>
          </div>

          {/* Institution filter */}
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-2">Institution bank accounts</div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAccountFilter("")} className={`h-8 rounded-[6px] px-3 text-[11.5px] font-bold border ${!accountFilter ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>All accounts ({movements.length})</button>
              {accounts.map((a, i) => (
                <button key={a.id} onClick={() => setAccountFilter(a.id === accountFilter ? "" : a.id)} className={`h-8 rounded-[6px] px-3 text-[11.5px] font-semibold border inline-flex items-center gap-2 ${accountFilter === a.id ? "bg-[#EEF2FF] text-[#3B5BDB] border-[#C7D2FE]" : "bg-white text-[#374151] border-[#E5E7EB]"}`}>
                  <span className={`h-2 w-2 rounded-full ${TONES[i % TONES.length]}`} />{a.bankName} <span className={`${mono} text-[#9CA3AF]`}>{a.accountNumber.slice(-4)}</span>
                </button>
              ))}
              {accounts.length === 0 && <span className="text-[12px] text-[#9CA3AF]">No bank accounts yet — add one to start uploading statements.</span>}
            </div>
          </div>

          {/* Stream */}
          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#EEF1F6]">
              <div><h2 className="text-[15px] font-extrabold">Consolidated Statement Stream</h2><p className="text-[11px] text-[#6B7280]">Page {page} of {pages} · {rows.length} rows · Ledger currency: NGN</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search narration, reference, fund…" className="h-8 w-56 rounded-[6px] border border-[#E5E7EB] bg-white pl-8 pr-3 text-[11.5px]" /></div>
                <div className="flex items-center gap-1 h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-[11px]"><Calendar className="h-3.5 w-3.5 text-[#9CA3AF]" /><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-transparent outline-none w-[110px]" /><span className="text-[#9CA3AF]">–</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-transparent outline-none w-[110px]" /></div>
              </div>
            </div>
            {error && <div className="px-5 py-3 text-[12px] text-rose-600">{error}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[1080px]">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6] bg-[#F8FAFC]">
                    <th className="px-5 py-2.5">Date &amp; time</th><th className="px-3 py-2.5">Bank / account</th><th className="px-3 py-2.5">Statement reference</th><th className="px-3 py-2.5">Narration / description</th><th className="px-3 py-2.5">Category &amp; fund</th><th className="px-3 py-2.5 text-right">Debit (outflow ₦)</th><th className="px-3 py-2.5 text-right">Credit (inflow ₦)</th><th className="px-3 py-2.5 text-right">Balance after (₦)</th><th className="px-5 py-2.5">Status &amp; action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {loading && <tr><td colSpan={9} className="px-5 py-10 text-center text-[#9CA3AF]">Loading the statement stream…</td></tr>}
                  {!loading && visible.length === 0 && <tr><td colSpan={9} className="px-5 py-10 text-center text-[#9CA3AF]">{movements.length === 0 ? "No bank movements yet. Upload a statement to populate the stream." : "Nothing matches the current filters."}</td></tr>}
                  {visible.map(({ e, balance }) => {
                    const acct = accountOf(e.bankAccountId)
                    const st = entryState(e)
                    return (
                      <tr key={e.id} className="hover:bg-[#F8FAFC] align-top">
                        <td className="px-5 py-3 whitespace-nowrap"><div className="font-semibold">{shortDate(e.date)}</div><div className={`${mono} text-[10.5px] text-[#6B7280]`}>{timeOf(e.date)}</div></td>
                        <td className="px-3 py-3"><div className="flex items-start gap-2"><span className={`mt-1 h-4 w-1 rounded-full ${e.bankAccountId ? toneOf(e.bankAccountId) : "bg-[#CBD5E1]"}`} /><div><div className="font-bold">{acct?.bankName ?? e.bankAccountName ?? "—"}</div><div className={`${mono} text-[10.5px] text-[#6B7280]`}>{acct?.accountNumber ?? ""}</div></div></div></td>
                        <td className="px-3 py-3"><div className={`${mono} font-bold`}>{entryRef(e)}</div><div className={`${mono} text-[10px] text-[#9CA3AF] uppercase`}>{e.source === "import" ? "Statement" : e.source}</div></td>
                        <td className="px-3 py-3 max-w-[280px]"><div className="font-semibold uppercase truncate">{e.description || "—"}</div>{e.meta.payee ? <div className="text-[11px] text-[#6B7280] truncate">{String(e.meta.payee)}</div> : null}</td>
                        <td className="px-3 py-3">{e.coaName ? <span className={`${mono} rounded-[4px] px-1.5 py-0.5 text-[10.5px] font-bold uppercase ${e.type === "income" ? "bg-[#EEF2FF] text-[#3B5BDB]" : "bg-[#0F172A] text-white"}`}>{e.coaName}</span> : <span className="text-[10.5px] font-bold uppercase text-rose-600">Unclassified {e.type === "income" ? "inflow" : "outflow"}</span>}</td>
                        <td className={`px-3 py-3 text-right ${mono} font-bold text-rose-600`}>{e.type === "expense" ? `-${ngn(e.amount, { decimals: true })}` : "-"}</td>
                        <td className={`px-3 py-3 text-right ${mono} font-bold text-emerald-600`}>{e.type === "income" ? `+${ngn(e.amount, { decimals: true })}` : "-"}</td>
                        <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(balance, { decimals: true })}</td>
                        <td className="px-5 py-3">
                          {st.label === "Uncategorized" ? (
                            <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1 rounded-[4px] bg-rose-50 text-rose-600 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap">Uncategorized</span><button onClick={() => setAllocating(e)} className="h-7 rounded-[6px] bg-[#3B5BDB] text-white px-3 text-[11px] font-bold">Allocate</button></div>
                          ) : st.label === "Reconciled" ? (
                            <button onClick={() => setViewing(e)} className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap hover:bg-emerald-100"><CheckCircle2 className="h-3 w-3" />Reconciled{e.reference ? ` ${e.reference}` : ""}</button>
                          ) : st.label === "Matched" ? (
                            <span className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap"><CheckCircle2 className="h-3 w-3" />Matched</span>
                          ) : e.meta.teller ? (
                            <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#0F172A] text-white px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap"><Paperclip className="h-3 w-3" />Teller {(e.meta.teller as { ref?: string }).ref ?? ""} attached</span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap ${st.tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>{st.label}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[#EEF1F6] text-[11px] text-[#6B7280]">
              <span>Displaying {visible.length} of {rows.length} transactions · Rows: {PAGE}</span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-2.5 font-semibold disabled:opacity-40">Previous</button>
                {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 rounded-[6px] border font-bold ${p === page ? "bg-[#3B5BDB] text-white border-[#3B5BDB]" : "bg-white border-[#E5E7EB]"}`}>{p}</button>
                ))}
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-2.5 font-semibold disabled:opacity-40">Next</button>
              </div>
            </div>
          </section>

          {/* Per-bank breakdown */}
          <section className="mt-6 rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-[#EEF1F6]"><h2 className="text-[15px] font-extrabold">Bank Volume Aggregation Breakdown</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[720px]">
                <thead><tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6] bg-[#F8FAFC]"><th className="px-5 py-2.5">Commercial institution</th><th className="px-3 py-2.5 text-right">Credits (inflow)</th><th className="px-3 py-2.5 text-right">Debits (outflow)</th><th className="px-3 py-2.5 text-right">Net flow</th><th className="px-5 py-2.5 text-right">Lines</th></tr></thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {perAccount.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-[#9CA3AF]">No bank accounts yet.</td></tr>}
                  {perAccount.map(({ account, credit, debit, net, count }, i) => (
                    <tr key={account.id}>
                      <td className="px-5 py-3"><span className="inline-flex items-center gap-2 font-bold"><span className={`h-2.5 w-2.5 rounded-full ${TONES[i % TONES.length]}`} />{account.bankName} <span className="text-[#6B7280] font-medium">({account.accountName})</span></span></td>
                      <td className={`px-3 py-3 text-right ${mono} font-bold text-emerald-600`}>+{ngn(credit, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-bold text-rose-600`}>-{ngn(debit, { decimals: true })}</td>
                      <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{net >= 0 ? "+" : ""}{ngn(net, { decimals: true })}</td>
                      <td className={`px-5 py-3 text-right ${mono} text-[#6B7280]`}>{count}</td>
                    </tr>
                  ))}
                  {perAccount.length > 0 && (
                    <tr className="bg-[#F8FAFC]"><td className="px-5 py-3 font-extrabold uppercase text-[11px]">Total</td><td className={`px-3 py-3 text-right ${mono} font-extrabold text-emerald-600`}>+{ngn(perAccount.reduce((s, r) => s + r.credit, 0), { decimals: true })}</td><td className={`px-3 py-3 text-right ${mono} font-extrabold text-rose-600`}>-{ngn(perAccount.reduce((s, r) => s + r.debit, 0), { decimals: true })}</td><td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(perAccount.reduce((s, r) => s + r.net, 0), { decimals: true })}</td><td className={`px-5 py-3 text-right ${mono}`}>{perAccount.reduce((s, r) => s + r.count, 0)}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <UploadTransactionsModal open={uploadOpen} onClose={() => setUploadOpen(false)} onProcess={() => { setUploadOpen(false); refresh() }} />
      <ManageAccountsModal open={accountsOpen} onClose={() => { setAccountsOpen(false); refresh() }} />
      <AllocateModal open={allocating !== null} onClose={() => setAllocating(null)} entry={allocating} onAllocated={refresh} />
      <SafeBatchModal open={viewing !== null} onClose={() => setViewing(null)} mode="journal" branchName={branchName} entry={viewing} />
    </div>
  )
}
