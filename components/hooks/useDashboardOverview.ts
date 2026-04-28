import { useState, useCallback } from "react"

export interface DashboardOverview {
  totalIncome: number
  totalExpenses: number
  netPosition: number
  pendingTransactions: number
  activeBudgets: number
}

interface UseDashboardOverviewProps {
  branchId?: string
  startDate?: string
  endDate?: string
}

export function useDashboardOverview(initialProps?: UseDashboardOverviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)

  const fetchOverview = useCallback(
    async (props: UseDashboardOverviewProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const qs = new URLSearchParams()
        if (mergedProps.branchId) qs.set("branchId", mergedProps.branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`/api/v1/core/dashboard/overview?${qs.toString()}`)
        const data = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch overview")
        }
        
        setOverview(data?.data as DashboardOverview)
        return data?.data as DashboardOverview
      } catch (err: any) {
        setError(err.message || "An error occurred fetching overview data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps]
  )

  return { loading, error, overview, fetchOverview }
}
