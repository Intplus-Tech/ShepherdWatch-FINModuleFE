import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
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
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<BudgetPerformanceData | null>(null)

  const fetchPerformance = useCallback(
    async (props: UseBudgetPerformanceProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
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
    [initialProps, user?.branchId]
  )

  return { loading, error, performanceData, fetchPerformance }
}
