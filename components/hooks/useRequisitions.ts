import { API_V1 } from "@/lib/api";
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type RequisitionDocument = {
  name: string
  size?: string
  url?: string
}

export type RequisitionItem = {
  id: string
  /** REQ-YYYYMM-NNNN, the number shown everywhere a requisition is listed. */
  requisitionNumber?: string
  branchName?: string
  amount: number
  currentStatus?: string
  createdAt?: string
  requiredDate?: string
  coaName?: string
  justification?: string
  reference?: string
  requestedBy?: string
  preferredVendor?: string
  vendorTier?: string
  documents?: RequisitionDocument[]
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
      String(
        (user as unknown as { branchId?: string | { _id?: string; id?: string } })?.branchId &&
          typeof (user as unknown as { branchId?: string | { _id?: string; id?: string } })
            .branchId === "object"
          ? (user as unknown as { branchId?: { _id?: string; id?: string } }).branchId?._id ??
            (user as unknown as { branchId?: { _id?: string; id?: string } }).branchId?.id ??
            ""
          : (user as unknown as { branchId?: string })?.branchId ?? ""
      ),
    [options.branchId, user]
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
          ? `${API_V1}/financial/requisitions?${query}`
          : `${API_V1}/financial/requisitions`

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
            const coa = asRecord(item.budgetHeadId ?? item.coa)
            const branch = asRecord(item.branchId)
            const requestedBy = asRecord(item.requestedBy)
            const createdBy = asRecord(item.createdBy)

            return {
              id: readString(item.id, item._id, item.requisitionId),
              amount: readNumber(item.amount, item.totalAmount),
              currentStatus: readString(item.currentStatus, item.status, item.approvalStatus),
              createdAt: readString(item.createdAt, item.requestedAt, item.requestDate, item.date),
              requiredDate: readString(item.requiredDate, item.dateRequired, item.needByDate),
              coaName: readString(item.coaName, coa.name, coa.accountName, item.category),
              branchName: readString(branch.name, item.branchName),
              justification: readString(item.justification, item.reason, item.description),
              requisitionNumber: readString(item.requisitionNumber, item.reference),
              reference: readString(
                item.requisitionNumber,
                item.reference,
                item.code,
                item.requisitionCode,
                item.requestCode
              ),
              requestedBy: readString(
                `${readString(requestedBy.firstName)} ${readString(requestedBy.lastName)}`.trim(),
                requestedBy.name,
                requestedBy.email,
                item.requesterName,
                `${readString(createdBy.firstName)} ${readString(createdBy.lastName)}`.trim(),
                createdBy.name,
                item.createdBy
              ),
            } as RequisitionItem
          })
          .filter((item: RequisitionItem) => item.id)

        if (isMounted) {
          setRequisitions(mapped)
        }

        // `GET /requisitions` answers with bare ObjectIds for requestedBy,
        // budgetHeadId and branchId, so a list alone cannot show who asked or
        // which budget head it is. The detail endpoint populates them; fill
        // the rows in behind the first paint rather than leaving them blank.
        const needsNames = mapped.filter((row) => !row.requestedBy || !row.coaName).slice(0, 30)
        if (needsNames.length > 0) {
          const details = await Promise.all(
            needsNames.map((row) =>
              fetch(`${API_V1}/financial/requisitions/${encodeURIComponent(row.id)}`, { credentials: "include" })
                .then((r) => (r.ok ? r.json().catch(() => null) : null))
                .then((payload) => ({ id: row.id, data: asRecord(asRecord(payload).data) }))
                .catch(() => ({ id: row.id, data: {} as Record<string, unknown> }))
            )
          )
          const byId = new Map(details.map((d) => [d.id, d.data]))
          if (isMounted) {
            setRequisitions((current) =>
              current.map((row) => {
                const full = byId.get(row.id)
                if (!full || Object.keys(full).length === 0) return row
                const person = asRecord(full.requestedBy)
                const head = asRecord(full.budgetHeadId)
                const branch = asRecord(full.branchId)
                return {
                  ...row,
                  requestedBy:
                    row.requestedBy ||
                    readString(
                      `${readString(person.firstName)} ${readString(person.lastName)}`.trim(),
                      person.name,
                      person.email
                    ),
                  coaName: row.coaName || readString(head.name, head.accountName),
                  branchName: row.branchName || readString(branch.name),
                }
              })
            )
          }
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


