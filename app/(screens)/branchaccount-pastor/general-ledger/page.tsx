"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Landmark,
  Menu,
  PenLine,
  Plus,
  Receipt,
  Search,
  Upload,
  Vault,
} from "lucide-react"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { useTransactionSummaries } from "@/components/hooks/useTransactionSummaries"
import { ManageAccountsModal, UploadTransactionsModal } from "@/app/(screens)/director-screen/transaction/page"
import {
  AllocateModal,
  BankBalanceModal,
  NewEntryModal,
  RecordTellerModal,
  SafeBatchModal,
  useLedgerAccounts,
} from "@/components/ledger/LedgerModals"
import { entryRef, loadLedgerEntries, MOCK_SAFE, ngn, shortDate, type LedgerEntry } from "@/lib/ledger"

const mono = "font-mono tracking-tight"

/**
 * The accountant's General Ledger: what has been keyed in, what the bank has
 * confirmed, and the tools to move entries from one to the other.
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
        if (active) setError(err instanceof Error ? err.message : "Unable to load the ledger.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [branchId, branchLoading, version])

  const { income } = useTransactionSummaries({ branchId })

  // Pending = on the ledger, not yet confirmed by the bank.
  const pendingIncome = useMemo(() => entries.filter((e) => e.type === "income" && e.status === "pending" && e.source !== "import"), [entries])
  const pendingExpense = useMemo(() => entries.filter((e) => e.type === "expense" && e.status === "pending" && e.source !== "import"), [entries])
  const unallocated = useMemo(() => entries.filter((e) => e.source === "import" && !e.coaId && e.status === "pending").length, [entries])
  const bankTotal = accounts.reduce((s, a) => s + a.balance, 0)
  const monthToDate = income?.totalCollected ?? 0

  const [incomeOpen, setIncomeOpen] = useState(true)
  const [expenseOpen, setExpenseOpen] = useState(true)
  const [incomeFilter, setIncomeFilter] = useState("")
  const [expenseFilter, setExpenseFilter] = useState("")
  const matches = (e: LedgerEntry, q: string) => !q || [entryRef(e), e.description, e.coaName, e.coaCode, String(e.meta.requisitionRef ?? ""), String(e.meta.payee ?? "")].join(" ").toLowerCase().includes(q.toLowerCase())
  const incomeRows = pendingIncome.filter((e) => matches(e, incomeFilter))
  const expenseRows = pendingExpense.filter((e) => matches(e, expenseFilter))

  const [safeOpen, setSafeOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [entryOpen, setEntryOpen] = useState(false)
  const [teller, setTeller] = useState<LedgerEntry | null>(null)
  const [viewing, setViewing] = useState<LedgerEntry | null>(null)
  const [allocating, setAllocating] = useState<LedgerEntry | null>(null)

  const receiptOf = (e: LedgerEntry) => e.attachments[0] ?? ""

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
            <button className="relative text-[#6B7280] hover:text-[#111827]" aria-label="Notifications"><Bell className="h-5 w-5" />{unallocated > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />}</button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[24px] font-extrabold tracking-tight">General Ledger</h1>
              <p className="text-[12.5px] text-[#6B7280] mt-1">Real-time dual-entry postings, physical safe arrivals, and statement batches.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setUploadOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-bold text-[#374151] hover:bg-gray-50"><Upload className="h-4 w-4" />Upload Statements</button>
              <button onClick={() => setEntryOpen(true)} className="h-9 inline-flex items-center gap-2 rounded-[8px] bg-[#3B5BDB] px-3.5 text-[12px] font-bold text-white hover:bg-[#3451b2]"><PenLine className="h-4 w-4" />Entry</button>
              <Link href="/branchaccount-pastor/general-ledger/reports" className="relative h-9 inline-flex items-center gap-2 rounded-[8px] bg-[#0F172A] px-3.5 text-[12px] font-bold text-white hover:bg-[#1E293B]">
                <BarChart3 className="h-4 w-4" />Reports
                {unallocated > 0 && <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unallocated}</span>}
              </Link>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <button onClick={() => setSafeOpen(true)} className="text-left rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:border-[#C7D2FE] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Cash safe balance</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(MOCK_SAFE.total)}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">Batch {MOCK_SAFE.batch.ref} · sample</span>
                <span className="h-7 rounded-[6px] bg-[#3B5BDB] text-white px-3 text-[11px] font-bold inline-flex items-center">View</span>
              </div>
            </button>
            <button onClick={() => setBankOpen(true)} className="text-left rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm hover:border-[#C7D2FE] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Bank balance</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(bankTotal)}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">{accounts.length} {accounts.length === 1 ? "account" : "accounts"}</span>
                <span className="h-7 rounded-[6px] bg-[#3B5BDB] text-white px-3 text-[11px] font-bold inline-flex items-center">View Bank Balances</span>
              </div>
            </button>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Month-to-date</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{ngn(monthToDate)}</div>
              <div className="text-[10.5px] text-[#9CA3AF] mt-3">Tithes, pledges &amp; offerings</div>
            </div>
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">Accounts</div>
              <div className={`${mono} text-[24px] font-extrabold mt-2`}>{accounts.length}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10.5px] text-[#9CA3AF]">Add new account</span>
                <button onClick={() => setAccountsOpen(true)} className="h-7 w-7 rounded-[6px] bg-[#3B5BDB] text-white inline-flex items-center justify-center" aria-label="Add new account"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Stream */}
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
                  <span className="text-[11px] text-[#6B7280] hidden sm:inline">(Real-time entries waiting for bank deposit)</span>
                  <span className="rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[10px] font-bold">{pendingIncome.length} {pendingIncome.length === 1 ? "item" : "items"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <input value={incomeFilter} onChange={(e) => setIncomeFilter(e.target.value)} placeholder="Filter income batches..." className="h-8 w-44 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11.5px]" />
                  <button onClick={() => setEntryOpen(true)} className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" />Batch Slip</button>
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
                        return (
                          <tr key={e.id} className="hover:bg-[#F8FAFC]">
                            <td className={`px-5 py-3 ${mono} text-[#6B7280]`}>{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{shortDate(e.date)}</td>
                            <td className={`px-3 py-3 ${mono} font-bold`}>{entryRef(e)}</td>
                            <td className="px-3 py-3 text-[#374151]">{e.description || String(e.meta.payee ?? "") || "—"}</td>
                            <td className="px-3 py-3"><span className={`${mono} rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[10.5px] font-bold`}>{e.coaName || "Uncategorised"}{e.coaCode ? ` • ${e.coaCode}` : ""}</span></td>
                            <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(e.amount, { decimals: true })}</td>
                            <td className="px-3 py-3"><span className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap"><Vault className="h-3 w-3" />In safe</span></td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setTeller(e)} className="h-7 rounded-[6px] bg-[#3B5BDB] text-white px-3 text-[11px] font-bold">Record Teller</button>
                                <button onClick={() => setViewing(e)} className="h-7 w-7 rounded-full text-[#6B7280] hover:bg-[#EEF2FF] inline-flex items-center justify-center" aria-label="View batch"><Eye className="h-4 w-4" /></button>
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
                  <span className="text-[11px] text-[#6B7280] hidden sm:inline">(Real-time entries waiting for bank debit confirmation)</span>
                  <span className="rounded-[4px] bg-[#EEF2FF] text-[#3B5BDB] px-1.5 py-0.5 text-[10px] font-bold">{pendingExpense.length} {pendingExpense.length === 1 ? "item" : "items"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <input value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} placeholder="Filter expenses..." className="h-8 w-44 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11.5px]" />
                  <button onClick={() => setEntryOpen(true)} className="h-8 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Batch Vouchers</button>
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
                      {expenseRows.map((e, i) => {
                        const receipt = receiptOf(e)
                        return (
                          <tr key={e.id} className="hover:bg-[#F8FAFC]">
                            <td className={`px-5 py-3 ${mono} text-[#6B7280]`}>{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-3 py-3 font-semibold whitespace-nowrap">{shortDate(e.date)}</td>
                            <td className={`px-3 py-3 ${mono} font-bold`}>{entryRef(e)}</td>
                            <td className={`px-3 py-3 ${mono} text-[#374151]`}>{String(e.meta.requisitionRef ?? e.reference ?? "") || "—"}</td>
                            <td className="px-3 py-3"><div className="font-semibold">{String(e.meta.payee ?? "") || e.description || "—"}</div>{e.meta.payee ? <div className="text-[11px] text-[#6B7280] truncate max-w-[320px]">{e.description}</div> : null}</td>
                            <td className={`px-3 py-3 text-right ${mono} font-extrabold`}>{ngn(e.amount, { decimals: true })}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {receipt ? (
                                  <a href={receipt} target="_blank" rel="noreferrer" className="h-7 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[11px] font-bold text-[#374151] inline-flex items-center">View Receipt</a>
                                ) : (
                                  <span className="h-7 rounded-[6px] border border-dashed border-[#E5E7EB] px-3 text-[11px] font-bold text-[#9CA3AF] inline-flex items-center" title="No receipt attached">No receipt</span>
                                )}
                                <button onClick={() => setAllocating(e)} className="h-7 w-7 rounded-full text-[#6B7280] hover:bg-[#EEF2FF] inline-flex items-center justify-center" aria-label="Categorise" title="Change the expense account"><Eye className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
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

      <SafeBatchModal open={safeOpen} onClose={() => setSafeOpen(false)} mode="safe" branchName={branchName} />
      <SafeBatchModal open={viewing !== null} onClose={() => setViewing(null)} mode={viewing?.status === "verified" ? "journal" : "safe"} branchName={branchName} entry={viewing} />
      <BankBalanceModal open={bankOpen} onClose={() => setBankOpen(false)} branchName={branchName} accounts={accounts} entries={entries} onAddAccount={() => { setBankOpen(false); setAccountsOpen(true) }} />
      <ManageAccountsModal open={accountsOpen} onClose={() => { setAccountsOpen(false); refresh() }} />
      <UploadTransactionsModal open={uploadOpen} onClose={() => setUploadOpen(false)} onProcess={() => { setUploadOpen(false); refresh() }} />
      <NewEntryModal open={entryOpen} onClose={() => setEntryOpen(false)} accounts={accounts} onPosted={refresh} />
      <RecordTellerModal open={teller !== null} onClose={() => setTeller(null)} entry={teller} accounts={accounts} onSaved={refresh} />
      <AllocateModal open={allocating !== null} onClose={() => setAllocating(null)} entry={allocating} onAllocated={refresh} />
    </div>
  )
}
