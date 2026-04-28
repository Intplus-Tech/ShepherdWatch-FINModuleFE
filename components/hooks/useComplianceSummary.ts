import { useState, useCallback } from "react"

export interface ComplianceSummaryData {
  totalDeductions: number
  totalRemitted: number
  outstanding: number
  byType?: Record<string, { total: number; remitted: number }>
}

interface UseComplianceSummaryProps {
  branchId?: string
  startDate?: string
  endDate?: string
}

export function useComplianceSummary(initialProps?: UseComplianceSummaryProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceSummaryData | null>(null)

  const fetchSummary = useCallback(
    async (props: UseComplianceSummaryProps = {}) => {
      setLoading(true)
      setError(null)
      try {
        const mergedProps = { ...initialProps, ...props }
        const qs = new URLSearchParams()
        if (mergedProps.branchId) qs.set("branchId", mergedProps.branchId)
        if (mergedProps.startDate) qs.set("startDate", mergedProps.startDate)
        if (mergedProps.endDate) qs.set("endDate", mergedProps.endDate)

        const res = await fetch(`/api/v1/core/financial/compliance/summary?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
        })
        const payload = await res.json().catch(() => null)
        
        if (!res.ok) {
          throw new Error(payload?.message || "Failed to fetch compliance summary")
        }
        
        const raw = payload?.data ?? payload ?? {}
        const byTypeRaw = raw?.byType && typeof raw.byType === "object" ? raw.byType : {}
        const byType = Object.entries(byTypeRaw as Record<string, unknown>).reduce<
          Record<string, { total: number; remitted: number }>
        >((acc, [key, value]) => {
          const v = (value ?? {}) as Record<string, unknown>
          acc[key] = {
            total: Number(v.total ?? 0),
            remitted: Number(v.remitted ?? 0),
          }
          return acc
        }, {})

        const mapped: ComplianceSummaryData = {
          totalDeductions: Number(raw?.totalDeductions ?? 0),
          totalRemitted: Number(raw?.totalRemitted ?? 0),
          outstanding: Number(raw?.outstanding ?? 0),
          byType,
        }

        setComplianceData(mapped)
        return mapped
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred fetching compliance summary")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [initialProps]
  )

  return { loading, error, complianceData, fetchSummary }
}
