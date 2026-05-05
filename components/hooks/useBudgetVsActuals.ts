import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type BudgetVsActualPoint = {
  label: string
  period: string
  budget: number
  actual: number
}

type Options = {
  branchId?: string
  fiscalYear?: number
  /** "Q1" | "Q2" | "Q3" | "Q4" | "YTD" — defaults to current quarter on the backend */
  period?: string
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

export function useBudgetVsActuals(options: Options = {}) {
  const { user } = useAuth()
  const [series, setSeries] = useState<BudgetVsActualPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.tenantId ?? user?.tenant?.id ?? "",
    [options.branchId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (branchId) params.set("branchId", branchId)
        if (options.fiscalYear) params.set("fiscalYear", String(options.fiscalYear))
        if (options.period) params.set("period", options.period)
        const query = params.toString()
        const url = query
          ? `/api/v1/core/dashboard/budget-vs-actuals?${query}`
          : "/api/v1/core/dashboard/budget-vs-actuals"
        const response = await fetch(url, { method: "GET", credentials: "include" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch budget vs actuals.")
        }
        const raw = Array.isArray(payload?.data?.series)
          ? payload.data.series
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []
        const mapped: BudgetVsActualPoint[] = raw.map((item: Record<string, unknown>, index: number) => ({
          label: toString(item?.label ?? item?.month ?? item?.period, `P${index + 1}`),
          period: toString(item?.period ?? item?.month ?? item?.label, ""),
          budget: toNumber(item?.budget ?? item?.budgetedAmount),
          actual: toNumber(item?.actual ?? item?.actualAmount),
        }))
        if (isMounted) setSeries(mapped)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch budget vs actuals.")
          setSeries([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [branchId, options.fiscalYear, options.period, refreshIndex])

  return { series, loading, error, refresh }
}
