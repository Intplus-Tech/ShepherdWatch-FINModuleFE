import { API_V1 } from "@/lib/api";
import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

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
  // Callers pass `initialProps` as an inline object literal, so it is a new
  // reference every render. Read it from a ref instead of depending on it here:
  // as a `useCallback` dep it changed the callback identity on every render and
  // re-fired any effect listing the callback, looping requests forever.
  const initialPropsRef = useRef(initialProps)
  initialPropsRef.current = initialProps
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trendData, setTrendData] = useState<IncomeExpenseTrendData | null>(null)

  const fetchTrend = useCallback(
    async (props: UseIncomeExpenseTrendProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialPropsRef.current, ...props }
        const branchId = mergedProps.branchId ?? user?.branchId
        const qs = new URLSearchParams()
        if (branchId) qs.set("branchId", branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`${API_V1}/dashboard/income-expense-trend?${qs.toString()}`)
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
    [user?.branchId]
  )

  return { loading, error, trendData, fetchTrend }
}
