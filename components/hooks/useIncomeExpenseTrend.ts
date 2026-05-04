import { useState, useCallback } from "react"

export interface IncomeExpenseTrendItem {
  month: string
  income: number
  expenses: number
}

export interface IncomeExpenseTrendData {
  series: IncomeExpenseTrendItem[]
  trendDirection?: string
}

interface UseIncomeExpenseTrendProps {
  branchId?: string
  startDate?: string
  endDate?: string
}

export function useIncomeExpenseTrend(initialProps?: UseIncomeExpenseTrendProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trendData, setTrendData] = useState<IncomeExpenseTrendData | null>(null)

  const fetchTrend = useCallback(
    async (props: UseIncomeExpenseTrendProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const qs = new URLSearchParams()
        if (mergedProps.branchId) qs.set("branchId", mergedProps.branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`/api/v1/core/dashboard/income-expense-trend?${qs.toString()}`)
        const data = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch trend data")
        }
        
        const series = Array.isArray(data?.data) ? data.data : []
        const result: IncomeExpenseTrendData = {
          series: series as IncomeExpenseTrendItem[],
          trendDirection: typeof data?.trendDirection === "string" ? data.trendDirection : undefined,
        }
        setTrendData(result)
        return result
      } catch (err: any) {
        setError(err.message || "An error occurred fetching trend data")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps]
  )

  return { loading, error, trendData, fetchTrend }
}
