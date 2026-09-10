"use client"

import { useCallback, useEffect, useState } from "react"
import { API_V1 } from "@/lib/api"
import { getCsrfTokenFromCookie } from "@/lib/csrf"

/**
 * Server-side transaction aggregates. The screens used to total the loaded page
 * client-side, which only ever reflected the current page; these come from the
 * backend across the whole period.
 */
export type TransactionSummary = {
  bankBalance: number
  totalIncome: number
  totalExpense: number
  netPosition: number
  transactionCount: number
}

function readNumber(source: Record<string, unknown> | null, ...keys: string[]): number {
  if (!source) return 0
  for (const key of keys) {
    const value = source[key]
    const parsed = Number(value)
    if (Number.isFinite(parsed) && value !== null && value !== "") return parsed
  }
  return 0
}

async function getJson(path: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${API_V1}${path}`, { credentials: "include", cache: "no-store" })
  if (!res.ok) return null
  const payload = await res.json().catch(() => null)
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null
  const inner = data?.data
  return inner && typeof inner === "object" ? (inner as Record<string, unknown>) : data
}

export function useTransactionSummaries(params: { branchId?: string; period?: string } = {}) {
  const { branchId = "", period = "" } = params
  const [summary, setSummary] = useState<TransactionSummary>({
    bankBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    netPosition: 0,
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  const refresh = useCallback(() => setReloadIndex((index) => index + 1), [])

  useEffect(() => {
    let active = true
    const query = new URLSearchParams()
    if (branchId) query.set("branchId", branchId)
    if (period) query.set("period", period)
    const suffix = query.toString() ? `?${query}` : ""

    setLoading(true)
    setError(null)

    Promise.all([
      getJson(`/financial/transactions/summary${suffix}`),
      getJson(`/financial/transactions/income-summary${suffix}`),
      getJson(`/financial/transactions/expense-summary${suffix}`),
    ])
      .then(([overall, income, expense]) => {
        if (!active) return
        setSummary({
          bankBalance: readNumber(overall, "bankBalance", "balance", "totalBalance"),
          totalIncome: readNumber(income, "total", "totalIncome", "amount"),
          totalExpense: readNumber(expense, "total", "totalExpense", "amount"),
          netPosition: readNumber(overall, "netPosition", "net", "netTotal"),
          transactionCount: readNumber(overall, "count", "transactionCount", "total"),
        })
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load totals.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [branchId, period, reloadIndex])

  return { summary, loading, error, refresh }
}

function csrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie()
  return token ? { "x-csrf-token": token } : {}
}

async function mutate(path: string, method: "POST" | "PATCH", body?: unknown) {
  const res = await fetch(`${API_V1}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    body: JSON.stringify(body ?? {}),
  })
  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : ""
    throw new Error(message || "The request could not be completed.")
  }
  return payload
}

/** Bank-feed actions that sit alongside the transaction list. */
export function useTransactionActions() {
  const syncFeed = useCallback(
    (branchId?: string) => mutate(`/financial/transactions/sync`, "POST", branchId ? { branchId } : {}),
    []
  )

  const parseEmail = useCallback(
    (payload: { emailBody: string; branchId?: string }) =>
      mutate(`/financial/bank-statement/parse-email`, "POST", payload),
    []
  )

  const ignoreTransaction = useCallback(
    (transactionId: string, reason?: string) =>
      mutate(`/financial/transactions/${transactionId}/ignore`, "PATCH", reason ? { reason } : {}),
    []
  )

  const splitTransaction = useCallback(
    (transactionId: string, splits: { coaId: string; amount: number; description?: string }[]) =>
      mutate(`/financial/transactions/${transactionId}/split`, "POST", { splits }),
    []
  )

  return { syncFeed, parseEmail, ignoreTransaction, splitTransaction }
}
