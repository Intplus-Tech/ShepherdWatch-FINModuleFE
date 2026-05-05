import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export type BranchSummary = {
  activeBranches: number
  totalBranches: number
}

type Options = {
  branchId?: string
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useBranchSummary(options: Options = {}) {
  const { user } = useAuth()
  const [summary, setSummary] = useState<BranchSummary>({ activeBranches: 0, totalBranches: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const branchId = useMemo(
    () => options.branchId ?? user?.tenantId ?? user?.tenant?.id ?? "",
    [options.branchId, user]
  )

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (branchId) params.set("branchId", branchId)
        const query = params.toString()
        const url = query ? `/api/v1/branches/summary?${query}` : "/api/v1/branches/summary"
        const response = await fetch(url, { method: "GET", credentials: "include" })
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to fetch branch summary.")
        }
        const data = payload?.data ?? payload ?? {}
        if (isMounted) {
          setSummary({
            activeBranches: toNumber(data?.activeBranches),
            totalBranches: toNumber(data?.totalBranches),
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to fetch branch summary.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    run()
    return () => {
      isMounted = false
    }
  }, [branchId, refreshIndex])

  return { summary, loading, error, refresh }
}
