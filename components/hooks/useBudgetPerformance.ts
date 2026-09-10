import { API_V1 } from "@/lib/api";
import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export interface BudgetItem {
  budgetId: string
  title: string
  approved: number
  spent: number
  variance: number
}

export interface BudgetPerformanceData {
  totalApproved: number
  totalSpent: number
  utilizationRate: number
  budgets: BudgetItem[]
}

interface UseBudgetPerformanceProps {
  branchId?: string
  startDate?: string
  endDate?: string
}

export function useBudgetPerformance(initialProps?: UseBudgetPerformanceProps) {
  // Callers pass `initialProps` as an inline object literal, so it is a new
  // reference every render. Read it from a ref instead of depending on it here:
  // as a `useCallback` dep it changed the callback identity on every render and
  // re-fired any effect listing the callback, looping requests forever.
  const initialPropsRef = useRef(initialProps)
  initialPropsRef.current = initialProps
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<BudgetPerformanceData | null>(null)

  const fetchPerformance = useCallback(
    async (props: UseBudgetPerformanceProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialPropsRef.current, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`${API_V1}/dashboard/budget-performance?${qs.toString()}`)
        const data = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch budget performance data")
        }
        
        setPerformanceData(data?.data || null)
        return data?.data as BudgetPerformanceData
      } catch (err: any) {
        setError(err.message || "An error occurred fetching budget performance data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user?.branchId]
  )

  return { loading, error, performanceData, fetchPerformance }
}
