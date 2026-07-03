import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

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
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)

  const fetchOverview = useCallback(
    async (props: UseDashboardOverviewProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`${API_V1}/dashboard/overview?${qs.toString()}`)
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
    [initialProps, user?.branchId]
  )

  return { loading, error, overview, fetchOverview }
}
