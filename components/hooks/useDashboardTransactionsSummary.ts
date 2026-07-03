import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export interface DashboardTransactionsSummary {
  currentMonthTotal: number
  previousMonthTotal: number
  changePercent: number
  transactionCount: number
}

interface UseDashboardTransactionsSummaryProps {
  branchId?: string
  startDate?: string
  endDate?: string
}

export function useDashboardTransactionsSummary(initialProps?: UseDashboardTransactionsSummaryProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardTransactionsSummary | null>(null)

  const fetchTransactionsSummary = useCallback(
    async (props: UseDashboardTransactionsSummaryProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`${API_V1}/dashboard/transactions-summary?${qs.toString()}`)
        const data = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch transactions summary")
        }

        setSummary(data?.data as DashboardTransactionsSummary)
        return data?.data as DashboardTransactionsSummary
      } catch (err: any) {
        setError(err.message || "An error occurred fetching transactions summary data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps, user?.branchId]
  )

  return { loading, error, summary, fetchTransactionsSummary }
}
