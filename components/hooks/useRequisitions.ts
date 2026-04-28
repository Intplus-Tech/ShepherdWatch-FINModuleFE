import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type RequisitionItem = {
  id: string
  amount: number
  currentStatus?: string
  createdAt?: string
  requiredDate?: string
  coaName?: string
  justification?: string
  reference?: string
  requestedBy?: string
}

type UseRequisitionsOptions = {
  page?: number
  limit?: number
  branchId?: string
  status?: string
  budgetHeadId?: string
  requestedBy?: string
  startDate?: string
  endDate?: string
  search?: string
  sort?: string
  order?: "asc" | "desc"

  // Backward-compat options used across existing screens.
  currentStatus?: string
  tenantId?: string
}

const ALLOWED_STATUSES = new Set([
  "draft",
  "pending_pastor",
  "pending_director",
  "approved",
  "declined",
  "paid",
])

function normalizeStatus(value?: string): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  const legacyStatusMap: Record<string, string> = {
    pending_accountant: "pending_pastor",
    pendingaccountant: "pending_pastor",
    pending_branch_pastor: "pending_pastor",
    pendingbranchpastor: "pending_pastor",
    pendingpastor: "pending_pastor",
    pendingdirector: "pending_director",
  }
  if (legacyStatusMap[normalized]) return legacyStatusMap[normalized]
  if (ALLOWED_STATUSES.has(normalized)) return normalized
  return undefined
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") return value as Record<string, unknown>
  return {}
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value
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

export function useRequisitions(options: UseRequisitionsOptions = {}) {
  const { user } = useAuth()
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () =>
      options.branchId ??
      options.tenantId ??
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
    [options.branchId, options.tenantId, user]
  )
  const normalizedStatus = useMemo(
    () => normalizeStatus(options.status ?? options.currentStatus),
    [options.status, options.currentStatus]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const loadRequisitions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (options.page) params.set("page", String(options.page))
        if (options.limit) params.set("limit", String(options.limit))
        if (branchId) params.set("branchId", branchId)
        if (normalizedStatus) params.set("status", normalizedStatus)
        if (options.budgetHeadId) params.set("budgetHeadId", options.budgetHeadId)
        if (options.requestedBy) params.set("requestedBy", options.requestedBy)
        if (options.startDate) params.set("startDate", options.startDate)
        if (options.endDate) params.set("endDate", options.endDate)
        if (options.search) params.set("search", options.search)
        if (options.sort) params.set("sort", options.sort)
        if (options.order) params.set("order", options.order)

        const query = params.toString()
        const url = query
          ? `/api/v1/core/financial/requisitions?${query}`
          : "/api/v1/core/financial/requisitions"

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch requisitions.")
        }

        const root = asRecord(data)
        const rootData = asRecord(root.data)
        const rawItems = Array.isArray(rootData.content)
          ? rootData.content
          : Array.isArray(rootData.data)
            ? rootData.data
            : Array.isArray(root.data)
              ? (root.data as unknown[])
              : Array.isArray(root.items)
                ? (root.items as unknown[])
                : Array.isArray(data)
                  ? data
                  : []

        const mapped = rawItems
          .map((rawItem: unknown) => {
            const item = asRecord(rawItem)
            const coa = asRecord(item.coa)
            const requestedBy = asRecord(item.requestedBy)
            const createdBy = asRecord(item.createdBy)

            return {
              id: readString(item.id, item._id, item.requisitionId),
              amount: readNumber(item.amount, item.totalAmount),
              currentStatus: readString(item.currentStatus, item.status, item.approvalStatus),
              createdAt: readString(item.createdAt, item.requestedAt, item.requestDate, item.date),
              requiredDate: readString(item.requiredDate, item.dateRequired, item.needByDate),
              coaName: readString(item.coaName, coa.name, coa.accountName, item.category),
              justification: readString(item.justification, item.reason, item.description),
              reference: readString(
                item.reference,
                item.code,
                item.requisitionCode,
                item.requestCode
              ),
              requestedBy: readString(
                requestedBy.name,
                item.requesterName,
                createdBy.name,
                item.createdBy
              ),
            } as RequisitionItem
          })
          .filter((item: RequisitionItem) => item.id)

        if (isMounted) {
          setRequisitions(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load requisitions.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadRequisitions()

    return () => {
      isMounted = false
    }
  }, [
    branchId,
    normalizedStatus,
    options.page,
    options.limit,
    options.budgetHeadId,
    options.requestedBy,
    options.startDate,
    options.endDate,
    options.search,
    options.sort,
    options.order,
    refreshIndex,
  ])

  return { requisitions, loading, error, refresh }
}


