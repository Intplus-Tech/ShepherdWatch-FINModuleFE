"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Clock, FileText, Search, Bell, Landmark, Activity } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useTransactions } from "@/components/hooks/useTransactions"
import { useRequisitionInbox } from "@/components/hooks/useRequisitionInbox"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value?: string) {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Page() {
  const { user } = useAuth()
  const branchId = user?.tenantId ?? user?.tenant?.id ?? ""
  const { transactions: unverifiedTransactions } = useTransactions({ status: "UNVERIFIED" })
  const {
    requisitions,
    loading: inboxLoading,
    error: inboxError,
    refresh,
  } = useRequisitionInbox({ branchId })

  const [isPaying, setIsPaying] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  const pendingTotal = useMemo(
    () => requisitions.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [requisitions]
  )

  const approvalRows = useMemo(
    () =>
      requisitions.map((req) => ({
        id: req.id,
        title: req.justification || "Requisition",
        requestedBy: req.requestedBy || "Branch user",
        amount: formatCurrency(req.amount || 0),
        date: formatDate(req.createdAt),
      })),
    [requisitions]
  )

  const getCsrfToken = () => {
    if (typeof document === "undefined") return ""
    const match = document.cookie.split("; ").find((cookie) => cookie.startsWith("csrf_token="))
    return match ? decodeURIComponent(match.split("=")[1] ?? "") : ""
  }

  const handleMarkPaid = async (id: string) => {
    setIsPaying(id)
    setPaymentError(null)
    setPaymentSuccess(null)

    try {
      const response = await fetch(`/api/v1/core/financial/requisitions/${id}/pay`, {
        method: "PATCH",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Failed to mark requisition as paid")
      }

      setPaymentSuccess("Requisition marked as paid successfully.")
      refresh()
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Failed to mark requisition as paid")
    } finally {
      setIsPaying(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Accountant Dashboard</h1>
            <p className="text-sm text-[#6B7280]">Requisition inbox and finance actions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                className="h-10 w-64 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-sm"
                placeholder="Search requisitions..."
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280]">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-blue-50 p-2 text-blue-600">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="text-sm text-[#6B7280]">Pending Requisitions</div>
            <div className="text-2xl font-bold text-[#111827]">{approvalRows.length}</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-sm text-[#6B7280]">Unverified Transactions</div>
            <div className="text-2xl font-bold text-[#111827]">{unverifiedTransactions.length}</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-rose-50 p-2 text-rose-600">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-sm text-[#6B7280]">Awaiting Payment Total</div>
            <div className="text-2xl font-bold text-[#111827]">{formatCurrency(pendingTotal)}</div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-emerald-50 p-2 text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
            <div className="text-sm text-[#6B7280]">Inbox Status</div>
            <div className="text-sm font-semibold text-[#111827]">
              {inboxLoading ? "Loading..." : inboxError ? "Needs attention" : "Up to date"}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="text-base font-semibold text-[#111827]">Requisition Payment Queue</h2>
            <div className="text-sm font-medium text-[#6B7280]">Total: {formatCurrency(pendingTotal)}</div>
          </div>

          <div className="space-y-3 p-5">
            {(paymentError || paymentSuccess) && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  paymentError
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {paymentError ?? paymentSuccess}
              </div>
            )}

            {inboxLoading && <div className="text-sm text-[#6B7280]">Loading requisitions...</div>}
            {!inboxLoading && inboxError && <div className="text-sm text-rose-600">{inboxError}</div>}
            {!inboxLoading && !inboxError && approvalRows.length === 0 && (
              <div className="text-sm text-[#6B7280]">No requisitions are awaiting accountant action.</div>
            )}

            {!inboxLoading &&
              !inboxError &&
              approvalRows.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-[#EEF1F6] bg-[#FCFCFD] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">{item.title}</div>
                    <div className="text-xs text-[#6B7280]">Requested by {item.requestedBy}</div>
                    <div className="text-xs text-[#9CA3AF]">{item.date}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-[#111827]">{item.amount}</div>
                    <button
                      onClick={() => handleMarkPaid(item.id)}
                      disabled={isPaying === item.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isPaying === item.id ? "Processing..." : "Mark Paid"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {!inboxLoading && !inboxError && approvalRows.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <AlertCircle className="h-4 w-4" />
            Requisitions shown here are sourced from `/api/v1/requisitions/inbox` based on your role.
          </div>
        )}
      </div>
    </div>
  )
}


