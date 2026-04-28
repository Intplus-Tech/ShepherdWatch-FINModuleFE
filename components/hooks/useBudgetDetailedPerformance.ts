import { useCallback, useState } from "react"

export interface BudgetPerformanceSummary {
  totalAllocated: number
  totalSpent: number
  utilization: number
  monthsElapsed: number
}

export interface BudgetPerformanceLineItem {
  chartOfAccount: {
    name: string
    code: string
  }
  annualBudget: number
  monthlyTarget: number
  expectedSpentYTD: number
  actualSpentYTD: number
  variance: number
  variancePercent: number
  status: "on_track" | "under_budget" | "over_budget" | "at_risk"
}

export interface DetailedBudgetPerformance {
  budget: {
    _id: string
    name: string
    category: string
    fiscalYear: number
    annualAmount: number
    status: string
  }
  summary: BudgetPerformanceSummary
  lineItems: BudgetPerformanceLineItem[]
}

export function useBudgetDetailedPerformance(budgetId?: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DetailedBudgetPerformance | null>(null)

  const fetchDetailedPerformance = useCallback(async (fallbackId?: string) => {
    const id = budgetId || fallbackId
    if (!id) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/v1/core/financial/budgets/${id}/performance`, {
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch detailed budget performance.")
      }

      const perfData = payload?.data || null
      setData(perfData)
      return perfData as DetailedBudgetPerformance
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching detailed performance.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [budgetId])

  return { loading, error, data, fetchDetailedPerformance }
}
