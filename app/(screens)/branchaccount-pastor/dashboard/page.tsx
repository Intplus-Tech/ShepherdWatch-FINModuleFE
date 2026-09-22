"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  FileText,
  HandCoins,
  Landmark,
  Menu,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"
import { useBankBalances } from "@/components/hooks/useBankBalances"
import { useBranchContext } from "@/components/hooks/useBranchContext"
import { useDashboardOverview } from "@/components/hooks/useDashboardOverview"
import { useRecentDashboardTransactions } from "@/components/hooks/useRecentDashboardTransactions"
import { useTransactionSummaries } from "@/components/hooks/useTransactionSummaries"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/format"
import { SkeletonStatGrid, SkeletonTable } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import BranchAccountantSidebar from "@/components/navigation/BranchAccountantSidebar"
import { ManageAccountsModal } from "@/app/(screens)/director-screen/transaction/page"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { describeApiError } from "@/lib/api-error"
import { loadLedgerEntries, type LedgerEntry } from "@/lib/ledger"

const mono = "font-mono tracking-tight"

/** Compact naira for the KPI tiles: ₦4.25M, ₦820K. */
const compact = (value: number) => {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`
  if (abs >= 1_000) return `${sign}₦${(abs / 1_000).toFixed(0)}K`
  return `${sign}₦${abs.toFixed(0)}`
}

const relative = (iso?: string) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  return formatDate(iso)
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "BK"

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pushToast } = useToast()
  const { branchId, loading: branchLoading } = useBranchContext()

  const { requisitions, loading: inboxLoading, error: inboxError, refresh: refreshInbox } = useRequisitionInbox({ branchId })
  const { loading: bankLoading, error: bankError, bankData, fetchBankBalances } = useBankBalances({ branchId })
  const { loading: overviewLoading, overview, fetchOverview } = useDashboardOverview({ branchId })
  const { transactions: recentTx, loading: recentLoading } = useRecentDashboardTransactions({ branchId, limit: 8 })
  const { income, expense } = useTransactionSummaries({ branchId })

  const [version, setVersion] = useState(0)
  useEffect(() => {
    if (branchLoading) return
    fetchBankBalances({ branchId }).catch(() => undefined)
    fetchOverview({ branchId }).catch(() => undefined)
  }, [branchId, branchLoading, fetchBankBalances, fetchOverview, version])

  // The last bank-confirmed entry per account tells when it was reconciled.
  const [verified, setVerified] = useState<LedgerEntry[]>([])
  useEffect(() => {
    if (branchLoading) return
    let active = true
    loadLedgerEntries({ branchId, status: "verified", limit: 100 })
      .then((list) => {
        if (active) setVerified(list)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [branchId, branchLoading, version])
  const lastReconciled = (accountId: string) => verified.find((e) => e.bankAccountId === accountId)?.date

  const pendingTotal = useMemo(() => requisitions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [requisitions])
  const recentIncome = useMemo(() => recentTx.filter((t) => t.flowType === "INCOME" || t.transactionType === "INCOME"), [recentTx])
  const todayTotal = useMemo(() => {
    const today = new Date().toDateString()
    return recentIncome.filter((t) => new Date(t.transactionDate).toDateString() === today).reduce((s, t) => s + Number(t.amount || 0), 0)
  }, [recentIncome])

  const budgetHealth = useMemo(() => {
    const target = expense?.budgetTarget ?? 0
    const spent = expense?.totalApproved ?? overview?.totalExpenses ?? 0
    if (target > 0) return { value: Math.min(100, Math.round((spent / target) * 100)), label: "Monthly utilization" }
    const inc = overview?.totalIncome || 0
    if (inc <= 0) return null
    return { value: Math.min(100, Math.round(((overview?.totalExpenses || 0) / inc) * 100)), label: "Spend vs income" }
  }, [expense, overview])

  const [paying, setPaying] = useState<string | null>(null)
  const [batching, setBatching] = useState(false)
  const [accountsOpen, setAccountsOpen] = useState(false)

  const markPaid = async (id: string) => {
    const res = await fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(id)}/pay`, {
      method: "PATCH",
      headers: { "x-csrf-token": getCsrfTokenFromCookie() },
      credentials: "include",
    })
    if (!res.ok) throw new Error(describeApiError(await res.json().catch(() => null), "Unable to mark the requisition as paid."))
  }
  const handlePay = async (id: string) => {
    setPaying(id)
    try {
      await markPaid(id)
      pushToast("Requisition marked as paid.", "success")
      refreshInbox()
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Unable to mark as paid.", "error")
    } finally {
      setPaying(null)
    }
  }
  const handleBatch = async () => {
    setBatching(true)
    let done = 0
    for (const req of requisitions) {
      try {
        await markPaid(req.id)
        done++
      } catch {
        /* the remaining ones still get their turn */
      }
    }
    pushToast(`${done} of ${requisitions.length} requisitions marked as paid.`, done === requisitions.length ? "success" : "info")
    refreshInbox()
    setBatching(false)
  }

  // Urgency, from how long the requisition has waited.
  const urgency = (createdAt?: string) => {
    const days = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000) : 0
    if (days >= 2) return { note: `Overdue ${days} days`, tone: "text-rose-500", action: "Approve now" }
    if (days === 1) return { note: "Due tomorrow", tone: "text-[#6B7280]", action: "Review" }
    return { note: "Recurring", tone: "text-[#6B7280]", action: "Pay" }
  }

  const cashDelta = income?.vsTarget ?? 0
  const spendDelta = expense?.vsTarget ?? 0

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <BranchAccountantSidebar activeHref="/branchaccount-pastor/dashboard" mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 min-w-0 text-[#111827]">
        <header className="flex h-[64px] sm:h-[72px] shrink-0 items-center justify-between border-b border-[#EEF1F6] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-1 h-9 w-9 flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div className="text-[15px] font-bold">Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input className="h-10 w-56 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm" placeholder="Search requisitions..." />
            </div>
            <button className="relative text-[#6B7280] hover:text-[#111827]" aria-label="Notifications"><Bell className="h-5 w-5" />{requisitions.length > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />}</button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* KPI tiles */}
          {overviewLoading || bankLoading ? (
            <SkeletonStatGrid count={4} />
          ) : (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Tile label="Cash at Bank" value={compact(bankData?.totalBalance ?? 0)} icon={<Landmark className="h-4 w-4" />} tone="blue"
                foot={<span className={`inline-flex items-center gap-1 ${cashDelta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{cashDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{cashDelta >= 0 ? "+" : ""}{cashDelta.toFixed(1)}% vs last month</span>} />
              <Tile label="Total Spendings" value={compact(expense?.totalApproved ?? overview?.totalExpenses ?? 0)} icon={<Wallet className="h-4 w-4" />} tone="amber"
                foot={<span className={`inline-flex items-center gap-1 ${spendDelta <= 0 ? "text-emerald-600" : "text-rose-500"}`}>{spendDelta <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}{spendDelta >= 0 ? "+" : ""}{spendDelta.toFixed(1)}% vs last month</span>} />
              <Tile label="Pending Requisitions" value={`${requisitions.length} ${requisitions.length === 1 ? "request" : "requests"}`} icon={<FileText className="h-4 w-4" />} tone="indigo"
                foot={<span className="text-amber-600 font-semibold">Awaiting review · {formatCurrency(pendingTotal)}</span>} />
              <Tile label="Budget Health" value={budgetHealth ? `${budgetHealth.value}%` : "—"} icon={<ShieldCheck className="h-4 w-4" />} tone="emerald"
                foot={<span className="text-[#3B5BDB] font-semibold">{budgetHealth?.label ?? "No data yet"}</span>} />
            </section>
          )}

          {/* Bank account summary */}
          <section className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
              <h2 className="text-[14px] font-extrabold">Bank Account Summary</h2>
              <button onClick={() => setAccountsOpen(true)} className="text-[12px] font-bold text-[#3B5BDB] hover:underline">+ Add Account</button>
            </div>
            {bankLoading ? (
              <div className="p-5"><SkeletonTable rows={3} columns={5} /></div>
            ) : bankError ? (
              <div className="p-5 text-sm text-rose-600">{bankError}</div>
            ) : !bankData?.accounts?.length ? (
              <div className="p-5"><EmptyState icon={<Landmark className="h-5 w-5 text-[#6B7280]" />} title="No bank accounts" description="Add a bank account to see balances here." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] min-w-[720px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[#6B7280] border-b border-[#EEF1F6]">
                      <th className="px-5 py-2.5">Bank account</th><th className="px-3 py-2.5">Type</th><th className="px-3 py-2.5">Balance</th><th className="px-3 py-2.5">Last reconciliation</th><th className="px-5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    {bankData.accounts.map((acc, idx) => {
                      const id = String((acc as { _id?: string; id?: string })._id ?? (acc as { id?: string }).id ?? "")
                      const when = lastReconciled(id)
                      const rel = relative(when)
                      const tones = ["bg-[#EEF2FF] text-[#3B5BDB]", "bg-[#FEF3C7] text-[#B45309]", "bg-[#FCE7F3] text-[#BE185D]", "bg-[#DCFCE7] text-[#15803D]"]
                      return (
                        <tr key={`${acc.accountNumber}-${idx}`} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-3"><div className="flex items-center gap-3"><span className={`h-8 w-8 rounded-[6px] text-[11px] font-bold flex items-center justify-center ${tones[idx % tones.length]}`}>{initials(acc.bankName)}</span><div><div className="font-bold">{acc.bankName}</div><div className={`${mono} text-[10.5px] text-[#9CA3AF]`}>{acc.accountNumber}</div></div></div></td>
                          <td className="px-3 py-3 text-[#3B5BDB] font-medium">{acc.accountName}{(acc as { isDomiciliary?: boolean }).isDomiciliary ? " (Domiciliary)" : ""}</td>
                          <td className={`px-3 py-3 ${mono} font-bold`}>{formatCurrency(acc.lastClosingBalance, { currency: acc.currency || "NGN" })}</td>
                          <td className="px-3 py-3">{rel ? <span className={`rounded-[4px] px-2 py-1 text-[10.5px] font-bold ${rel === "Today" || rel === "1 day ago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{rel}</span> : <span className="text-[11px] text-[#9CA3AF]">Not yet</span>}</td>
                          <td className="px-5 py-3 text-right"><Link href="/branchaccount-pastor/general-ledger/reports" className="inline-flex h-7 items-center rounded-[6px] bg-[#EEF2FF] px-3 text-[11px] font-bold text-[#3B5BDB]">Details</Link></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Feeds */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
                <h2 className="text-[14px] font-extrabold inline-flex items-center gap-2"><ArrowDownLeft className="h-4 w-4 text-emerald-600" />Recent Income Feed</h2>
                <span className="text-[11px] font-bold text-emerald-600">Today&apos;s Total: {formatCurrency(todayTotal)}</span>
              </div>
              <div className="p-5 flex-1">
                {recentLoading ? (
                  <SkeletonTable rows={3} columns={3} />
                ) : recentIncome.length === 0 ? (
                  <EmptyState icon={<ArrowDownLeft className="h-5 w-5 text-[#10B981]" />} title="No recent income" description="Income entries appear here as they are posted." />
                ) : (
                  <ul className="divide-y divide-[#EEF1F6]">
                    {recentIncome.slice(0, 4).map((tx) => (
                      <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-8 w-8 rounded-[6px] bg-[#F1F5F9] text-[#475569] flex items-center justify-center shrink-0"><HandCoins className="h-4 w-4" /></span>
                          <div className="min-w-0"><p className="truncate text-[12.5px] font-bold">{tx.description}</p><p className="text-[10.5px] text-[#9CA3AF]">{formatDate(tx.transactionDate, "datetime")} · {tx.accountName || "Ledger"}</p></div>
                        </div>
                        <div className={`${mono} text-[12.5px] font-bold text-emerald-600 whitespace-nowrap`}>+{formatCurrency(tx.amount)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-[#EEF1F6] px-5 py-3 text-center"><Link href="/branchaccount-pastor/general-ledger" className="text-[11.5px] font-bold text-[#3B5BDB] hover:underline">View History</Link></div>
            </div>

            <div className="rounded-[12px] border border-[#EEF1F6] bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
                <h2 className="text-[14px] font-extrabold inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-rose-500" />Pending Expenses</h2>
                <span className="text-[11px] font-bold text-rose-500">Total: {formatCurrency(pendingTotal)}</span>
              </div>
              <div className="p-5 flex-1">
                {inboxLoading ? (
                  <SkeletonTable rows={3} columns={3} />
                ) : inboxError ? (
                  <p className="text-sm text-rose-600">{inboxError}</p>
                ) : requisitions.length === 0 ? (
                  <EmptyState icon={<CheckCircle2 className="h-5 w-5 text-[#6B7280]" />} title="Nothing pending" description="No requisitions are awaiting accountant action." />
                ) : (
                  <ul className="divide-y divide-[#EEF1F6]">
                    {requisitions.slice(0, 4).map((req) => {
                      const u = urgency(req.createdAt)
                      return (
                        <li key={req.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-8 w-8 rounded-[6px] bg-[#F1F5F9] text-[#475569] flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></span>
                            <div className="min-w-0"><p className="truncate text-[12.5px] font-bold">{req.justification || "Requisition"}</p><p className={`text-[10.5px] ${u.tone}`}>{u.note} · {req.requestedBy || "Branch user"}</p></div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`${mono} text-[12.5px] font-bold`}>{formatCurrency(Number(req.amount || 0))}</div>
                            <button onClick={() => handlePay(req.id)} disabled={paying === req.id || batching} className="text-[9.5px] font-bold uppercase tracking-wide text-[#3B5BDB] hover:underline disabled:opacity-50">{paying === req.id ? "Processing…" : u.action}</button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div className="border-t border-[#EEF1F6] px-5 py-3 text-center">
                <button onClick={handleBatch} disabled={batching || requisitions.length === 0} className="text-[11.5px] font-bold text-[#3B5BDB] hover:underline disabled:opacity-50 disabled:no-underline">{batching ? "Approving…" : `Batch Approve (${requisitions.length})`}</button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <ManageAccountsModal open={accountsOpen} onClose={() => { setAccountsOpen(false); setVersion((v) => v + 1) }} />
    </div>
  )
}

const TONES: Record<string, string> = {
  blue: "bg-[#EEF2FF] text-[#3B5BDB]",
  amber: "bg-[#FEF3C7] text-[#B45309]",
  indigo: "bg-[#E0E7FF] text-[#4338CA]",
  emerald: "bg-[#DCFCE7] text-[#15803D]",
}

function Tile({ label, value, icon, tone, foot }: { label: string; value: string; icon: React.ReactNode; tone: keyof typeof TONES; foot: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div className="text-[11px] font-semibold text-[#6B7280]">{label}</div><span className={`h-7 w-7 rounded-[6px] flex items-center justify-center ${TONES[tone]}`}>{icon}</span></div>
      <div className={`${mono} text-[22px] font-extrabold mt-2`}>{value}</div>
      <div className="mt-1.5 text-[10.5px]">{foot}</div>
    </div>
  )
}
