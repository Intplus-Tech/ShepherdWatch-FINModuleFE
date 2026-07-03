import { API_V1 } from "@/lib/api";
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type ExpenseDistributionItem = {
  category: string
  accountName: string
  totalAmount: number
  count: number
  percentage: number
}

type Options = {
  branchId?: string
  fiscalYear?: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useExpenseDistribution(options: Options = {}) {
  const { user } = useAuth()
  const [items, setItems] = useState<ExpenseDistributionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.branchId ?? "",
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
        const query = params.toString()
        const url = query
          ? `${API_V1}/dashboard/expense-distribution?${query}`
          : `${API_V1}/dashboard/expense-distribution`
        const response = await fetch(url, { method: "GET", credentials: "include" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch expense distribution.")
        }
        const raw = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []
        const mapped = raw.map((item: Record<string, unknown>) => ({
          category: String(item?.category ?? "other"),
          accountName: String(item?.accountName ?? item?.category ?? "Other"),
          totalAmount: toNumber(item?.totalAmount),
          count: toNumber(item?.count),
          percentage: toNumber(item?.percentage),
        }))
        if (isMounted) setItems(mapped)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch expense distribution.")
          setItems([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [branchId, options.fiscalYear, refreshIndex])

  return { items, loading, error, refresh }
}


