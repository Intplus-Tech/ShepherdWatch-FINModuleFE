import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

type BudgetEntry = {
  id: string
  amount: number
  period?: string
  periodStart?: string
  periodEnd?: string
  coaId?: string
  coaName?: string
  name?: string
  category?: string
  stream?: string
  type?: string
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getDefaultPeriod() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  return { start: formatDateOnly(start), end: formatDateOnly(end) }
}

export function useBudgetEntries() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  useEffect(() => {
    let isMounted = true
    const { start, end } = getDefaultPeriod()

    const loadEntries = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!tenantId) {
          throw new Error("Tenant context is missing.")
        }

        const url = `/api/core/financial/budget-entries?tenantId=${encodeURIComponent(
          tenantId
        )}&periodStart=${encodeURIComponent(start)}&periodEnd=${encodeURIComponent(end)}`

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ?? "Unable to fetch budget entries. Please try again."
          )
        }

        const rawItems = Array.isArray(data?.data?.content)
          ? data.data.content
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data)
                ? data
                : []

        const mapped: BudgetEntry[] = rawItems.map((item: any, index: number) => ({
          id: String(item?.id ?? item?.budgetEntryId ?? `entry-${index}`),
          amount: Number(item?.amount ?? item?.value ?? 0),
          period: item?.period ?? item?.month ?? item?.date,
          periodStart: item?.periodStart,
          periodEnd: item?.periodEnd,
          coaId: item?.coaId ?? item?.coa?.id,
          coaName: item?.coaName ?? item?.coa?.name ?? item?.coa?.accountName,
          name: item?.name ?? item?.title,
          category: item?.category ?? item?.budgetCategory,
          stream: item?.stream ?? item?.budgetStream,
          type: item?.type,
        }))

        if (isMounted) {
          setEntries(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load budget entries.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadEntries()

    return () => {
      isMounted = false
    }
  }, [tenantId])

  return { entries, loading, error }
}
