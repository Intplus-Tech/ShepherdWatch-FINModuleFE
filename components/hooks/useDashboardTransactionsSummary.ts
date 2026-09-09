import { API_V1 } from "@/lib/api";
import { useState, useCallback, useRef } from "react"
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
  // Callers pass `initialProps` as an inline object literal, so it is a new
  // reference every render. Read it from a ref instead of depending on it here:
  // as a `useCallback` dep it changed the callback identity on every render and
  // re-fired any effect listing the callback, looping requests forever.
  const initialPropsRef = useRef(initialProps)
  initialPropsRef.current = initialProps
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardTransactionsSummary | null>(null)

  const fetchTransactionsSummary = useCallback(
    async (props: UseDashboardTransactionsSummaryProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialPropsRef.current, ...props }
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
    [user?.branchId]
  )

  return { loading, error, summary, fetchTransactionsSummary }
}
