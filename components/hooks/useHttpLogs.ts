import { useEffect, useState, useCallback } from "react"

export type HttpLogItem = {
  _id: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | string
  url: string
  status: number
  responseTime: number
  ipAddress?: string
  userAgent?: string
  createdAt: string
  [key: string]: any
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  pages: number
}

export type HttpLogsFilters = {
  page?: number
  limit?: number
  method?: string
  status?: string | number
  startDate?: string
  endDate?: string
}

export function useHttpLogs(filters: HttpLogsFilters = {}) {
  const [logs, setLogs] = useState<HttpLogItem[]>([])
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
      if (filters.method) queryParams.append("method", filters.method)
      if (filters.status) queryParams.append("status", String(filters.status))
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)
      
      const res = await fetch(`/api/core/logs/http?${queryParams.toString()}`, {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json().catch(() => null)
      
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to fetch http logs.")
      }
      
      setLogs(data?.data ?? [])
      if (data?.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching http logs")
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.limit, filters.method, filters.status, filters.startDate, filters.endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, pagination, loading, error, refresh: fetchLogs }
}
