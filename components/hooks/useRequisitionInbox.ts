import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { RequisitionItem } from "@/components/hooks/useRequisitions"

type UseRequisitionInboxOptions = {
  page?: number
  limit?: number
  branchId?: string
}

type RequisitionInboxPagination = {
  total: number
  page: number
  limit: number
  pages: number
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") return value as Record<string, unknown>
  return {}
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
  }
  return ""
}

function readNumber(...values: unknown[]): number {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export function useRequisitionInbox(options: UseRequisitionInboxOptions = {}) {
  const { user } = useAuth()
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([])
  const [pagination, setPagination] = useState<RequisitionInboxPagination>({
    total: 0,
    page: options.page ?? 1,
    limit: options.limit ?? 20,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () =>
      options.branchId ??
      String(
        (user as unknown as { branchId?: string | { _id?: string; id?: string } })?.branchId &&
          typeof (user as unknown as { branchId?: string | { _id?: string; id?: string } })
            .branchId === "object"
          ? (user as unknown as { branchId?: { _id?: string; id?: string } }).branchId?._id ??
            (user as unknown as { branchId?: { _id?: string; id?: string } }).branchId?.id ??
            user?.tenantId ??
            user?.tenant?.id ??
            ""
          : (user as unknown as { branchId?: string })?.branchId ??
            user?.tenantId ??
            user?.tenant?.id ??
            ""
      ),
    [options.branchId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    const loadInbox = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set("page", String(options.page ?? 1))
        params.set("limit", String(options.limit ?? 20))
        if (branchId) params.set("branchId", branchId)

        const response = await fetch(`/api/v1/core/financial/requisitions/inbox?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch requisition inbox.")
        }

        const root = asRecord(payload)
        const data = Array.isArray(root.data) ? root.data : []
        const paginationData = asRecord(root.pagination)

        const mapped = data
          .map((rawItem: unknown) => {
            const item = asRecord(rawItem)
            const coa = asRecord(item.coa)
            const requestedBy = asRecord(item.requestedBy)
            const createdBy = asRecord(item.createdBy)
            const firstName = readString(requestedBy.firstName, createdBy.firstName)
            const lastName = readString(requestedBy.lastName, createdBy.lastName)
            const fullName = `${firstName} ${lastName}`.trim()

            return {
              id: readString(item.id, item._id, item.requisitionId),
              amount: readNumber(item.amount, item.totalAmount),
              currentStatus: readString(item.currentStatus, item.status, item.approvalStatus),
              createdAt: readString(item.createdAt, item.requestedAt, item.requestDate, item.date),
              coaName: readString(item.coaName, coa.name, coa.accountName, item.category),
              justification: readString(item.justification, item.reason, item.description),
              reference: readString(item.reference, item.code, item.requisitionCode, item.requestCode),
              requestedBy: readString(fullName, requestedBy.name, item.requesterName, createdBy.name),
            } as RequisitionItem
          })
          .filter((item) => item.id)

        if (isMounted) {
          setRequisitions(mapped)
          setPagination({
            total: readNumber(paginationData.total),
            page: readNumber(paginationData.page, options.page ?? 1),
            limit: readNumber(paginationData.limit, options.limit ?? 20),
            pages: readNumber(paginationData.pages),
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load requisition inbox.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInbox()
    return () => {
      isMounted = false
    }
  }, [options.page, options.limit, branchId, refreshIndex])

  return { requisitions, pagination, loading, error, refresh }
}


