import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type RecentDashboardTransaction = {
  id: string
  transactionDate: string
  transactionType: string
  amount: number
  description: string
  status: string
  flowType: string
  branchName: string
  accountName: string
  accountCode: string
  createdByName: string
}

type Options = {
  branchId?: string
  limit?: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

export function useRecentDashboardTransactions(options: Options = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<RecentDashboardTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.tenantId ?? user?.tenant?.id ?? "",
    [options.branchId, user]
  )

  const limit = useMemo(() => {
    const value = options.limit ?? 10
    return Math.max(1, Math.min(50, value))
  }, [options.limit])

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (branchId) params.set("branchId", branchId)
        params.set("limit", String(limit))

        const response = await fetch(`/api/core/dashboard/recent-transactions?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch recent transactions.")
        }

        const raw = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []

        const mapped = raw.map((item: Record<string, unknown>, index: number) => {
          const branch = (item?.branchId ?? {}) as Record<string, unknown>
          const account = (item?.accountId ?? {}) as Record<string, unknown>
          const createdBy = (item?.createdBy ?? {}) as Record<string, unknown>
          const firstName = toString(createdBy?.firstName, "")
          const lastName = toString(createdBy?.lastName, "")
          const createdByName = `${firstName} ${lastName}`.trim()

          return {
            id: toString(item?._id ?? item?.id ?? item?.transactionId, `tx-${index}`),
            transactionDate: toString(
              item?.transactionDate ?? item?.date ?? item?.createdAt,
              ""
            ),
            transactionType: toString(item?.transactionType ?? item?.type, "").toUpperCase(),
            amount: toNumber(item?.amount),
            description: toString(item?.description, "Transaction"),
            status: toString(item?.status ?? item?.verificationStatus, "UNVERIFIED").toUpperCase(),
            flowType: toString(item?.flowType ?? item?.transactionType ?? item?.type, "").toUpperCase(),
            branchName: toString(branch?.name, "Branch"),
            accountName: toString(account?.name, ""),
            accountCode: toString(account?.code, ""),
            createdByName: createdByName || "System User",
          }
        })

        if (isMounted) {
          setTransactions(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch recent transactions.")
          setTransactions([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [branchId, limit, refreshIndex])

  return { transactions, loading, error, refresh }
}

