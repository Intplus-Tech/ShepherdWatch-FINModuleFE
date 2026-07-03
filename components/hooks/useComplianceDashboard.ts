import { API_V1 } from "@/lib/api";
import { useCallback, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type ComplianceDashboardByType = {
  pending: number
  remitted: number
  total: number
  count: number
}

export type ComplianceDashboardMonth = {
  month: number
  pending: number
  remitted: number
  total: number
}

export type ComplianceDashboardData = {
  fiscalYear: number
  totalLiability: number
  totalRemitted: number
  availableFunds: number
  coverageRatio: number
  complianceRate: number
  byType: Record<string, ComplianceDashboardByType>
  monthlySchedule: ComplianceDashboardMonth[]
}

type Query = {
  branchId?: string
  month?: number
  fiscalYear?: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useComplianceDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<ComplianceDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (query: Query = {}) => {
    setLoading(true)
    setError(null)
    try {
      const branchId = query.branchId ?? user?.branchId
      const params = new URLSearchParams()
      if (branchId) params.set("branchId", branchId)
      if (query.month !== undefined) params.set("month", String(query.month))
      if (query.fiscalYear !== undefined) params.set("fiscalYear", String(query.fiscalYear))

      const response = await fetch(`${API_V1}/financial/compliance/dashboard?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to fetch compliance dashboard.")
      }

      const raw = (payload?.data ?? payload) as Record<string, unknown>
      const rawByType = (raw?.byType ?? {}) as Record<string, Record<string, unknown>>
      const rawSchedule = Array.isArray(raw?.monthlySchedule)
        ? (raw.monthlySchedule as Record<string, unknown>[])
        : []

      const mapped: ComplianceDashboardData = {
        fiscalYear: toNumber(raw?.fiscalYear) || new Date().getFullYear(),
        totalLiability: toNumber(raw?.totalLiability),
        totalRemitted: toNumber(raw?.totalRemitted),
        availableFunds: toNumber(raw?.availableFunds),
        coverageRatio: toNumber(raw?.coverageRatio),
        complianceRate: toNumber(raw?.complianceRate),
        byType: Object.entries(rawByType).reduce<Record<string, ComplianceDashboardByType>>((acc, [key, value]) => {
          acc[key] = {
            pending: toNumber(value?.pending),
            remitted: toNumber(value?.remitted),
            total: toNumber(value?.total),
            count: toNumber(value?.count),
          }
          return acc
        }, {}),
        monthlySchedule: rawSchedule.map((item) => ({
          month: toNumber(item?.month),
          pending: toNumber(item?.pending),
          remitted: toNumber(item?.remitted),
          total: toNumber(item?.total),
        })),
      }

      setData(mapped)
      return mapped
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch compliance dashboard."
      setError(message)
      setData(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.branchId])

  return { data, loading, error, fetchDashboard, setError }
}

