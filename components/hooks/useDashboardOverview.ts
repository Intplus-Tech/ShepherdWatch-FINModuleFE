import { API_V1 } from "@/lib/api";
import { useState, useCallback, useRef } from "react"
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
  // Callers pass `initialProps` as an inline object literal, so it is a new
  // reference every render. Read it from a ref instead of depending on it here:
  // as a `useCallback` dep it changed the callback identity on every render and
  // re-fired any effect listing the callback, looping requests forever.
  const initialPropsRef = useRef(initialProps)
  initialPropsRef.current = initialProps
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<DashboardOverview | null>(null)

  const fetchOverview = useCallback(
    async (props: UseDashboardOverviewProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialPropsRef.current, ...props }
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
    [user?.branchId]
  )

  return { loading, error, overview, fetchOverview }
}
