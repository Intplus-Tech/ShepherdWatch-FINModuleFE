import { API_V1 } from "@/lib/api";
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  Landmark,
  Search,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"
import { useBankBalances } from "@/components/hooks/useBankBalances"
import { useDashboardOverview } from "@/components/hooks/useDashboardOverview"
import { useRecentDashboardTransactions } from "@/components/hooks/useRecentDashboardTransactions"
import { formatCurrency, formatDate } from "@/lib/format"
import { SkeletonStatGrid, SkeletonTable } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

function getCsrfToken() {
  if (typeof document === "undefined") return ""
  const match = document.cookie.split("; ").find((c) => c.startsWith("csrf_token="))
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
}

export default function Page() {
  const { user } = useAuth()
  const branchId = user?.tenantId ?? user?.tenant?.id ?? ""

  const { transactions: unverifiedTransactions } = useTransactions({ status: "UNVERIFIED" })
  const {
    requisitions,
    loading: inboxLoading,
    error: inboxError,
    refresh: refreshInbox,
  } = useRequisitionInbox({ branchId })

  const { loading: bankLoading, error: bankError, bankData, fetchBankBalances } = useBankBalances({ branchId })
  const { loading: overviewLoading, overview, fetchOverview } = useDashboardOverview({ branchId })
  const { transactions: recentTx, loading: recentLoading } = useRecentDashboardTransactions({ branchId, limit: 6 })

  const [isPaying, setIsPaying] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!branchId) return
    fetchBankBalances({ branchId }).catch(() => undefined)
    fetchOverview({ branchId }).catch(() => undefined)
  }, [branchId, fetchBankBalances, fetchOverview])

  const pendingTotal = useMemo(
    () => requisitions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [requisitions]
  )

  const recentIncome = useMemo(
    () => recentTx.filter((t) => t.flowType === "INCOME" || t.transactionType === "INCOME"),
    [recentTx]
  )

  const budgetHealth = useMemo(() => {
    if (!overview) return null
    const income = overview.totalIncome || 0
    const expense = overview.totalExpenses || 0
    if (income <= 0) return { value: 0, label: "No income recorded" }
    const ratio = expense / income
    const remaining = Math.max(0, 1 - ratio)
    const label = ratio > 1 ? "Over budget" : ratio > 0.85 ? "Tight" : "Healthy"
    return { value: Math.round(remaining * 100), label }
  }, [overview])

  const handleMarkPaid = async (id: string) => {
    setIsPaying(id)
    setPaymentError(null)
    setPaymentSuccess(null)
    try {
      const response = await fetch(`${API_V1}/financial/requisitions/${id}/pay`, {
        method: "PATCH",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Failed to mark requisition as paid")
      }
      setPaymentSuccess("Requisition marked as paid successfully.")
      refreshInbox()
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Failed to mark requisition as paid")
    } finally {
      setIsPaying(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Accountant Dashboard</h1>
            <p className="text-sm text-[#6B7280]">Financial overview &amp; pending actions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search..."
              />
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* KPI cards */}
        {overviewLoading || bankLoading ? (
          <SkeletonStatGrid count={4} />
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Cash at Bank"
              value={formatCurrency(bankData?.totalBalance ?? 0)}
              hint={`${bankData?.accountCount ?? 0} active accounts`}
              icon={<Landmark className="h-4 w-4" />}
              tone="blue"
            />
            <KpiCard
              label="Unverified Transactions"
              value={String(unverifiedTransactions.length)}
              hint="Awaiting verification"
              icon={<Clock className="h-4 w-4" />}
              tone="amber"
            />
            <KpiCard
              label="Pending Requisitions"
              value={String(requisitions.length)}
              hint={formatCurrency(pendingTotal)}
              icon={<Wallet className="h-4 w-4" />}
              tone="rose"
            />
            <KpiCard
              label="Budget Health"
              value={budgetHealth ? `${budgetHealth.value}%` : "—"}
              hint={budgetHealth?.label ?? "No data"}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="emerald"
            />
          </section>
        )}

        {/* Bank Account Summary */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="text-base font-semibold text-[#111827]">Bank Account Summary</h2>
            <span className="text-sm text-[#6B7280]">
              Total: {formatCurrency(bankData?.totalBalance ?? 0)}
            </span>
          </div>
          {bankLoading ? (
            <div className="p-5">
              <SkeletonTable rows={4} columns={4} />
            </div>
          ) : bankError ? (
            <div className="p-5 text-sm text-rose-600">{bankError}</div>
          ) : !bankData?.accounts?.length ? (
            <div className="p-5">
              <EmptyState
                icon={<Landmark className="h-5 w-5 text-[#6B7280]" />}
                title="No bank accounts"
                description="Add a bank account to see balances here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                  <tr>
                    <th className="px-5 py-3">Account</th>
                    <th className="px-5 py-3">Bank</th>
                    <th className="px-5 py-3">Account No.</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {bankData.accounts.map((acc, idx) => (
                    <tr key={`${acc.accountNumber}-${idx}`} className="hover:bg-[#F9FAFB]">
                      <td className="px-5 py-3 font-medium text-[#111827]">{acc.accountName}</td>
                      <td className="px-5 py-3 text-[#4B5563]">{acc.bankName}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[#6B7280]">
                        {acc.accountNumber}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#111827]">
                        {formatCurrency(acc.lastClosingBalance, { currency: acc.currency || "NGN" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Two-column feed */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Income */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-base font-semibold text-[#111827]">Recent Income</h2>
              <p className="text-xs text-[#6B7280]">Latest verified inflows</p>
            </div>
            <div className="p-5">
              {recentLoading ? (
                <SkeletonTable rows={4} columns={3} />
              ) : recentIncome.length === 0 ? (
                <EmptyState
                  icon={<ArrowDownRight className="h-5 w-5 text-[#10B981]" />}
                  title="No recent income"
                  description="Verified income transactions appear here."
                />
              ) : (
                <ul className="space-y-3">
                  {recentIncome.slice(0, 5).map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF1F6] bg-[#FCFCFD] p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {tx.description}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatDate(tx.transactionDate, "datetime")} · {tx.accountName || "—"}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-emerald-600">
                        +{formatCurrency(tx.amount)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Pending Expenses (Requisitions) */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Pending Expenses</h2>
                <p className="text-xs text-[#6B7280]">Requisitions awaiting payment</p>
              </div>
              <span className="text-sm font-semibold text-[#111827]">
                {formatCurrency(pendingTotal)}
              </span>
            </div>
            <div className="space-y-3 p-5">
              {(paymentError || paymentSuccess) && (
                <div
                  role="status"
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    paymentError
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {paymentError ?? paymentSuccess}
                </div>
              )}

              {inboxLoading ? (
                <SkeletonTable rows={4} columns={3} />
              ) : inboxError ? (
                <p className="text-sm text-rose-600">{inboxError}</p>
              ) : requisitions.length === 0 ? (
                <EmptyState
                  icon={<ArrowUpRight className="h-5 w-5 text-[#6B7280]" />}
                  title="Nothing pending"
                  description="No requisitions are awaiting accountant action."
                />
              ) : (
                <ul className="space-y-3">
                  {requisitions.slice(0, 5).map((req) => (
                    <li
                      key={req.id}
                      className="flex flex-col gap-2 rounded-xl border border-[#EEF1F6] bg-[#FCFCFD] p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {req.justification || "Requisition"}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {req.requestedBy || "Branch user"} · {formatDate(req.createdAt, "datetime")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#111827]">
                          {formatCurrency(Number(req.amount || 0))}
                        </span>
                        <button
                          onClick={() => handleMarkPaid(req.id)}
                          disabled={isPaying === req.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isPaying === req.id ? "Processing..." : "Mark Paid"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <p className="flex items-center gap-2 text-xs text-[#6B7280]">
          <AlertCircle className="h-3.5 w-3.5" />
          Data sourced from `${API_V1}/dashboard` and `${API_V1}/requisitions/inbox`.
        </p>
      </div>
    </div>
  )
}

type KpiTone = "blue" | "amber" | "rose" | "emerald"

const TONE_MAP: Record<KpiTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string
  value: string
  hint?: string
  icon: React.ReactNode
  tone: KpiTone
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-full p-2 ${TONE_MAP[tone]}`}>{icon}</div>
      <div className="text-sm text-[#6B7280]">{label}</div>
      <div className="text-2xl font-bold text-[#111827]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[#9CA3AF]">{hint}</div> : null}
    </div>
  )
}
