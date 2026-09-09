import { API_V1 } from "@/lib/api";
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

/** Backend `BudgetStatus`; only `submitted` budgets can be approved or rejected. */
export const BUDGET_STATUS_SUBMITTED = "submitted"

export type BudgetEntry = {
  id: string
  amount: number
  status?: string
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

export function useBudgetEntries() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const branchId = useMemo(() => user?.branchId ?? user?.branch?.id ?? "", [user])

  useEffect(() => {
    let isMounted = true
    const fiscalYear = new Date().getUTCFullYear()

    const loadEntries = async () => {
      setLoading(true)
      setError(null)

      try {
        // The backend list is GET /budgets and accepts branchId, category,
        // fiscalYear, status, page and limit — nothing else. An org-level user
        // has no branchId, and omitting it correctly returns every branch.
        const params = new URLSearchParams({ fiscalYear: String(fiscalYear) })
        if (branchId) params.set("branchId", branchId)
        const url = `${API_V1}/financial/budget-entries?${params.toString()}`

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
          id: String(item?.id ?? item?._id ?? item?.budgetEntryId ?? `entry-${index}`),
          amount: Number(item?.annualAmount ?? item?.amount ?? item?.value ?? 0),
          period: item?.period ?? item?.fiscalYear ?? item?.month ?? item?.date,
          periodStart: item?.periodStart,
          periodEnd: item?.periodEnd,
          coaId: item?.coaId ?? item?.coa?.id,
          coaName: item?.coaName ?? item?.coa?.name ?? item?.coa?.accountName,
          status: typeof item?.status === "string" ? item.status.toLowerCase() : undefined,
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
  }, [branchId])

  /**
   * The subset an approver can act on. `PATCH /budgets/:id/approve` rejects
   * anything not in `submitted` status with a 400, so an "approve all" that
   * walked every row would fail on the first draft or already-approved budget.
   */
  const pendingApproval = useMemo(
    () => entries.filter((entry) => entry.status === BUDGET_STATUS_SUBMITTED),
    [entries]
  )

  return { entries, pendingApproval, loading, error }
}


