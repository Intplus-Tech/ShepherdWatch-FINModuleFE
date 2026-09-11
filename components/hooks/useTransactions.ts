import { API_V1 } from "@/lib/api";
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type TransactionItem = {
  id: string
  date?: string
  amount: number
  flowType?: string
  transactionType?: string
  status?: string
  description?: string
  coaName?: string
  chartOfAccountId?: string
  category?: string
  bankAccountId?: string
}

function formatDateOnly(value?: string) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString()
}

/**
 * The list endpoint accepts a lowercase enum — pending | verified | flagged |
 * cancelled — and answers 400 "Validation failed" for anything else, including
 * the uppercase names the screens have always used. Map them here so no caller
 * has to know, and drop values the API has no equivalent for.
 */
function normalizeStatus(status?: string): string {
  const value = (status ?? "").trim().toLowerCase()
  if (!value) return ""
  if (value === "unverified" || value === "uncategorized") return "pending"
  if (value === "cleared" || value === "reconciled") return "verified"
  return ["pending", "verified", "flagged", "cancelled"].includes(value) ? value : ""
}

/** Same story for `type`: the API takes income | expense, nothing else. */
function normalizeType(type?: string): string {
  const value = (type ?? "").trim().toLowerCase()
  if (value === "credit" || value === "inflow" || value === "income") return "income"
  if (value === "debit" || value === "outflow" || value === "expense") return "expense"
  return ""
}

/** The backend rejects a page size above 100. */
function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 20
  return Math.min(Math.trunc(limit), 100)
}

type UseTransactionsOptions = {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  search?: string
  type?: string
  transactionType?: string
  branchId?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; pages: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.branchId ?? "",
    [options.branchId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const loadTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (branchId) params.set("branchId", branchId)
        const status = normalizeStatus(options.status)
        if (status) params.set("status", status)
        if (options.startDate) params.set("startDate", options.startDate)
        if (options.endDate) params.set("endDate", options.endDate)
        if (options.page !== undefined) params.set("page", String(options.page))
        if (options.limit !== undefined) params.set("limit", String(clampLimit(options.limit)))
        if (options.search) params.set("search", options.search)
        const type = normalizeType(options.type)
        if (type) params.set("type", type)
        if (options.transactionType) {
          params.set("transactionType", options.transactionType.toLowerCase())
        } else if (options.type) {
          const norm = options.type.toLowerCase()
          params.set("transactionType", ["credit", "income"].includes(norm) ? "credit" : ["debit", "expense"].includes(norm) ? "debit" : norm)
        }
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

        const mapped = rawItems.map((item: any, index: number) => {
          const rawType = String(
            item?.transactionType ??
            item?.flowType ??
            item?.type ??
            item?.direction ??
            ""
          ).toLowerCase();
          const isCredit =
            ["credit", "income", "inflow"].includes(rawType) ||
            (!rawType && Number(item?.amount) > 0 && !item?.transactionType);
          const isDebit =
            ["debit", "expense", "outflow"].includes(rawType) ||
            Number(item?.amount) < 0;
          const resolvedType = isCredit ? "credit" : isDebit ? "debit" : rawType;
          const resolvedFlow = isCredit
            ? "INFLOW"
            : isDebit
              ? "OUTFLOW"
              : item?.flowType
                ? String(item.flowType).toUpperCase()
                : undefined;

          return {
            id: String(item?.id ?? item?._id ?? item?.transactionId ?? `tx-${index}`),
            date:
              item?.date ??
              item?.transactionDate ??
              item?.postingDate ??
              item?.createdAt ??
              "",
            amount: Math.abs(Number(item?.amount ?? item?.value ?? 0)),
            transactionType: resolvedType,
            flowType: resolvedFlow,
            status: item?.status ?? item?.verificationStatus ?? "UNVERIFIED",
            description:
              item?.sourceBankReference ??
              item?.narration ??
              item?.description ??
              item?.remarks ??
              "",
            coaName:
              item?.coaName ??
              item?.coa?.name ??
              item?.coa?.accountName ??
              item?.chartOfAccount?.name ??
              item?.chartOfAccountId?.name,
            // Populated or bare id, under either name the API has used.
            chartOfAccountId: String(
              (typeof item?.chartOfAccountId === "string" ? item.chartOfAccountId : item?.chartOfAccountId?._id) ||
                item?.chartOfAccount?._id ||
                item?.coa?._id ||
                item?.coaId ||
                ""
            ),
            category: item?.category ?? item?.tag ?? item?.budgetCategory ?? item?.meta?.category,
            bankAccountId: String(item?.bankAccountId ?? item?.bankAccount?._id ?? item?.bankAccount?.id ?? ""),
          };
        })

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
    branchId,
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


