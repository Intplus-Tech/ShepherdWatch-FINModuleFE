import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type TransactionItem = {
  id: string
  date?: string
  amount: number
  flowType?: string
  status?: string
  description?: string
  coaName?: string
  category?: string
}

function formatDateOnly(value?: string) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString()
}

type UseTransactionsOptions = {
  status?: string
  startDate?: string
  endDate?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const tenantId = useMemo(
    () => user?.tenantId ?? user?.tenant?.id ?? "",
    [user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const loadTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (tenantId) params.set("tenantId", tenantId)
        if (options.status) params.set("status", options.status)
        if (options.startDate) params.set("startDate", options.startDate)
        if (options.endDate) params.set("endDate", options.endDate)
        const query = params.toString()
        const url = query
          ? `/api/core/financial/transactions?${query}`
          : "/api/core/financial/transactions"

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch transactions.")
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

        const mapped = rawItems.map((item: any, index: number) => ({
          id: String(item?.id ?? item?.transactionId ?? `tx-${index}`),
          date:
            item?.date ??
            item?.transactionDate ??
            item?.postingDate ??
            item?.createdAt ??
            "",
          amount: Number(item?.amount ?? item?.value ?? 0),
          flowType: item?.flowType ?? item?.type ?? item?.direction,
          status: item?.status ?? item?.verificationStatus ?? "UNVERIFIED",
          description:
            item?.sourceBankReference ??
            item?.narration ??
            item?.description ??
            item?.remarks ??
            "",
          coaName: item?.coaName ?? item?.coa?.name ?? item?.coa?.accountName,
          category: item?.category ?? item?.tag ?? item?.budgetCategory,
        }))

        if (isMounted) {
          setTransactions(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load transactions.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTransactions()

    return () => {
      isMounted = false
    }
  }, [tenantId, options.status, options.startDate, options.endDate, refreshIndex])

  return { transactions, loading, error, formatDateOnly, refresh }
}
