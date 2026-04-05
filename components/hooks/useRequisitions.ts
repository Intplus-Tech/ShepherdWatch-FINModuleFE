import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type RequisitionItem = {
  id: string
  amount: number
  currentStatus?: string
  createdAt?: string
  coaName?: string
  justification?: string
  reference?: string
  requestedBy?: string
}

type UseRequisitionsOptions = {
  currentStatus?: string
  tenantId?: string
}

export function useRequisitions(options: UseRequisitionsOptions = {}) {
  const { user } = useAuth()
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const tenantId = useMemo(
    () => options.tenantId ?? user?.tenantId ?? user?.tenant?.id ?? "",
    [options.tenantId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const loadRequisitions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (tenantId) params.set("tenantId", tenantId)
        if (options.currentStatus) params.set("currentStatus", options.currentStatus)

        const query = params.toString()
        const url = query
          ? `/api/core/financial/requisitions?${query}`
          : "/api/core/financial/requisitions"

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch requisitions.")
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
          id: String(item?.id ?? item?.requisitionId ?? `req-${index}`),
          amount: Number(item?.amount ?? item?.totalAmount ?? 0),
          currentStatus:
            item?.currentStatus ??
            item?.status ??
            item?.approvalStatus ??
            "",
          createdAt:
            item?.createdAt ??
            item?.requestedAt ??
            item?.requestDate ??
            item?.date ??
            "",
          coaName:
            item?.coaName ??
            item?.coa?.name ??
            item?.coa?.accountName ??
            item?.category ??
            "",
          justification: item?.justification ?? item?.reason ?? item?.description ?? "",
          reference:
            item?.reference ??
            item?.code ??
            item?.requisitionCode ??
            item?.requestCode ??
            "",
          requestedBy:
            item?.requestedBy?.name ??
            item?.requesterName ??
            item?.createdBy?.name ??
            item?.createdBy ??
            "",
        }))

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
  }, [tenantId, options.currentStatus, refreshIndex])

  return { requisitions, loading, error, refresh }
}
