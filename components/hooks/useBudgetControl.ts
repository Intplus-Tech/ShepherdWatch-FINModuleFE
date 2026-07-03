import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export interface BudgetHierarchicalItem {
  name: string
  allocated: number
  spent: number
  usagePercent: number
  status: string
}

export interface BudgetHierarchicalCategory {
  category: string
  items: BudgetHierarchicalItem[]
}

export interface BudgetMonthlyUtilization {
  month: number
  allocated: number
  spent: number
}

export interface BudgetControlData {
  fiscalYear: number
  kpis: {
    totalAllocated: number
    totalCommitted: number
    totalSpent: number
    totalAvailable: number
    utilizationRate: number
  }
  hierarchicalView: BudgetHierarchicalCategory[]
  monthlyUtilization: BudgetMonthlyUtilization[]
  budgetCount: number
}

interface UseBudgetControlProps {
  branchId?: string
  fiscalYear?: number
}

export function useBudgetControl(initialProps?: UseBudgetControlProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [controlData, setControlData] = useState<BudgetControlData | null>(null)

  const fetchControlData = useCallback(
    async (props: UseBudgetControlProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)
        if (mergedProps.fiscalYear) qs.set("fiscalYear", mergedProps.fiscalYear.toString())

        const res = await fetch(`${API_V1}/financial/budgets/control?${qs.toString()}`, {
          credentials: "include",
        })
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message || "Failed to fetch budget control data")
        }
        
        setControlData(payload?.data || null)
        return payload?.data as BudgetControlData
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred fetching budget control data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps, user?.branchId]
  )

  return { loading, error, controlData, fetchControlData }
}
