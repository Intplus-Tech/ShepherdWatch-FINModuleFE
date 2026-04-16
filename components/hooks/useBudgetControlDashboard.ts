import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type BudgetControlItem = {
  id: string
  category: string
  name: string
  allocated: number
  spent: number
  usagePercent: number
  status: string
}

export type BudgetControlData = {
  fiscalYear: number
  budgetCount: number
  kpis: {
    totalAllocated: number
    totalCommitted: number
    totalSpent: number
    totalAvailable: number
    utilizationRate: number
  }
  monthlyUtilization: Array<{
    month: number
    allocated: number
    spent: number
  }>
  items: BudgetControlItem[]
}

const emptyData: BudgetControlData = {
  fiscalYear: new Date().getFullYear(),
  budgetCount: 0,
  kpis: {
    totalAllocated: 0,
    totalCommitted: 0,
    totalSpent: 0,
    totalAvailable: 0,
    utilizationRate: 0,
  },
  monthlyUtilization: [],
  items: [],
}

function toNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function toString(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "")
}

export function useBudgetControlDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<BudgetControlData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tenantId = useMemo(() => user?.tenantId ?? user?.tenant?.id ?? "", [user])

  useEffect(() => {
    let isMounted = true
    const fiscalYear = String(new Date().getFullYear())

    const loadDashboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams({ fiscalYear })
        if (tenantId) query.set("branchId", tenantId)
        const response = await fetch(`/api/core/financial/budgets/control?${query.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch budget control dashboard.")
        }

        const raw = (payload?.data ?? payload ?? {}) as Record<string, unknown>
        const kpis = (raw.kpis ?? {}) as Record<string, unknown>
        const hierarchical = Array.isArray(raw.hierarchicalView)
          ? (raw.hierarchicalView as Array<Record<string, unknown>>)
          : []

        const items: BudgetControlItem[] = hierarchical.flatMap((group, groupIndex) => {
          const category = toString(group.category) || "other"
          const list = Array.isArray(group.items) ? (group.items as Array<Record<string, unknown>>) : []
          return list.map((item, itemIndex) => ({
            id: toString(item._id ?? item.id ?? `${groupIndex}-${itemIndex}`),
            category,
            name: toString(item.name) || "Budget Item",
            allocated: toNumber(item.allocated),
            spent: toNumber(item.spent),
            usagePercent: toNumber(item.usagePercent),
            status: toString(item.status) || "draft",
          }))
        })

        const monthlyUtilization = Array.isArray(raw.monthlyUtilization)
          ? (raw.monthlyUtilization as Array<Record<string, unknown>>).map((item) => ({
              month: toNumber(item.month),
              allocated: toNumber(item.allocated),
              spent: toNumber(item.spent),
            }))
          : []

        const mapped: BudgetControlData = {
          fiscalYear: toNumber(raw.fiscalYear) || Number(fiscalYear),
          budgetCount: toNumber(raw.budgetCount),
          kpis: {
            totalAllocated: toNumber(kpis.totalAllocated),
            totalCommitted: toNumber(kpis.totalCommitted),
            totalSpent: toNumber(kpis.totalSpent),
            totalAvailable: toNumber(kpis.totalAvailable),
            utilizationRate: toNumber(kpis.utilizationRate),
          },
          monthlyUtilization,
          items,
        }

        if (isMounted) {
          setData(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch budget control dashboard.")
          setData(emptyData)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      isMounted = false
    }
  }, [tenantId])

  return { data, loading, error }
}
