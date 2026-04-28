import { useEffect, useState, useCallback } from "react"

export type AppLogItem = {
  _id: string
  level: "info" | "warn" | "error" | "debug" | string
  message: string
  createdAt: string
  [key: string]: any
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  pages: number
}

export type AppLogsFilters = {
  page?: number
  limit?: number
  level?: string
  startDate?: string
  endDate?: string
}

export function useAppLogs(filters: AppLogsFilters = {}) {
  const [logs, setLogs] = useState<AppLogItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: filters.page || 1,
    limit: filters.limit || 20,
    pages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams()
      if (filters.page) queryParams.append("page", String(filters.page))
      if (filters.limit) queryParams.append("limit", String(filters.limit))
      if (filters.level) queryParams.append("level", filters.level)
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)
      
      const res = await fetch(`/api/v1/core/logs/app?${queryParams.toString()}`, {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json().catch(() => null)
      
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to fetch app logs.")
      }
      
      setLogs(data?.data ?? [])
      if (data?.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching app logs")
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.limit, filters.level, filters.startDate, filters.endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, pagination, loading, error, refresh: fetchLogs }
}
