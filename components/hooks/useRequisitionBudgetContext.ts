import { useEffect, useMemo, useState } from "react"

export type RequisitionBudgetContext = {
  allocatedAmount: number
  totalSpent: number
  remainingBudget: number
  requestedAmount: number
  overageAmount: number
  isOverBudget: boolean
  fiscalYear?: number
  month?: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useRequisitionBudgetContext(requisitionId?: string) {
  const [data, setData] = useState<RequisitionBudgetContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const id = useMemo(() => String(requisitionId ?? "").trim(), [requisitionId])
  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    if (!id) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/core/financial/requisitions/${id}/budget-context`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch requisition budget context.")
        }

        const raw = payload?.data ?? payload ?? {}
        if (isMounted) {
          setData({
            allocatedAmount: toNumber(raw?.allocatedAmount),
            totalSpent: toNumber(raw?.totalSpent),
            remainingBudget: toNumber(raw?.remainingBudget),
            requestedAmount: toNumber(raw?.requestedAmount),
            overageAmount: toNumber(raw?.overageAmount),
            isOverBudget: Boolean(raw?.isOverBudget),
            fiscalYear: Number.isFinite(Number(raw?.fiscalYear))
              ? Number(raw?.fiscalYear)
              : undefined,
            month: Number.isFinite(Number(raw?.month)) ? Number(raw?.month) : undefined,
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch requisition budget context.")
          setData(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [id, refreshIndex])

  return { data, loading, error, refresh }
}
