import { useCallback, useState } from "react"

export interface Budget {
  id?: string
  _id?: string
  title?: string
  name?: string
  branchId?: string | { _id?: string; name?: string }
  allocations?: Array<Record<string, unknown>>
  allocatedAmount?: number
  totalSpent?: number
  remainingAmount?: number
  fiscalYear?: number
  status?: string
  notes?: string
  [key: string]: unknown
}

export function useBudget() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)

  const fetchBudget = useCallback(async (id: string) => {
    if (!id) return null
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/v1/core/financial/budgets/${id}`, {
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch budget.")
      }

      const budgetData = payload?.data || null
      setBudget(budgetData)
      return budgetData as Budget
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching the budget.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, budget, fetchBudget }
}
