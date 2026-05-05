import { API_V1 } from "@/lib/api";
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
  page?: number
  limit?: number
  search?: string
  type?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; pages: number } | null>(null)
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
        if (options.page !== undefined) params.set("page", String(options.page))
        if (options.limit !== undefined) params.set("limit", String(options.limit))
        if (options.search) params.set("search", options.search)
        if (options.type) params.set("type", options.type)
        const query = params.toString()
        const url = query
          ? `${API_V1}/financial/transactions?${query}`
          : `${API_V1}/financial/transactions`

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

        const paginationMeta = data?.pagination || data?.data?.pagination || null;

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
          if (paginationMeta) {
            setPagination({
              total: paginationMeta.total ?? 0,
              page: paginationMeta.page ?? 1,
              limit: paginationMeta.limit ?? 20,
              pages: paginationMeta.pages ?? 1,
            })
          } else {
            // fallback if no pagination provided by backend
            setPagination({
              total: mapped.length,
              page: 1,
              limit: Math.max(mapped.length, 20),
              pages: 1,
            })
          }
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
  }, [
    tenantId, 
    options.status, 
    options.startDate, 
    options.endDate, 
    options.page,
    options.limit,
    options.search,
    options.type,
    refreshIndex
  ])

  return { transactions, pagination, loading, error, formatDateOnly, refresh }
}


