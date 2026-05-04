import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type FinancialCalendarEvent = {
  type: string
  date: string
  title: string
  amount: number
  status: string
  resourceId: string
}

type Options = {
  branchId?: string
  startDate?: string
  endDate?: string
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useFinancialCalendar(options: Options = {}) {
  const { user } = useAuth()
  const [events, setEvents] = useState<FinancialCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.tenantId ?? user?.tenant?.id ?? "",
    [options.branchId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (branchId) params.set("branchId", branchId)
        if (options.startDate) params.set("startDate", options.startDate)
        if (options.endDate) params.set("endDate", options.endDate)

        const query = params.toString()
        const url = query ? `/api/v1/core/dashboard/financial-calendar?${query}` : "/api/v1/core/dashboard/financial-calendar"
        const response = await fetch(url, { method: "GET", credentials: "include" })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch financial calendar.")
        }

        const raw: unknown[] = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []

        const mapped: FinancialCalendarEvent[] = raw.map((rawItem) => {
          const item = (rawItem ?? {}) as Record<string, unknown>
          return {
            type: String(item?.type ?? "event"),
            date: String(item?.date ?? ""),
            title: String(item?.title ?? "Financial Event"),
            amount: toNumber(item?.amount),
            status: String(item?.status ?? "pending"),
            resourceId: String(item?.resourceId ?? ""),
          }
        })

        if (isMounted) {
          setEvents(
            mapped.sort((a, b) => {
              const aTime = new Date(a.date).getTime()
              const bTime = new Date(b.date).getTime()
              if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
              if (Number.isNaN(aTime)) return 1
              if (Number.isNaN(bTime)) return -1
              return aTime - bTime
            })
          )
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch financial calendar.")
          setEvents([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [branchId, options.startDate, options.endDate, refreshIndex])

  return { events, loading, error, refresh }
}



