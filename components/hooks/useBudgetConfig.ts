import { API_V1 } from "@/lib/api";
import { getCsrfTokenFromCookie } from "@/lib/csrf";
import { useCallback, useEffect, useState } from "react"

export type BudgetConfig = {
  _id?: string
  fiscalYearStart?: number
  defaultCurrency?: string
  enforcementAction?: "warn_only" | "block_transactions" | "require_approval" | string
  reportingInterval?: "monthly" | "quarterly" | "annually" | string
  varianceThresholdPercent?: number
}

export function useBudgetConfig() {
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const [resetting, setResetting] = useState(false)

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  // POST /settings/budget-config/reset — restore organization-wide budget
  // configuration to system defaults, then refetch the latest config.
  const resetConfig = useCallback(async () => {
    setResetting(true)
    setError(null)
    try {
      const response = await fetch(`${API_V1}/settings/budget-config/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie(),
        },
        credentials: "include",
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to reset budget config.")
      }
      setRefreshIndex((prev) => prev + 1)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset budget config.")
      throw err
    } finally {
      setResetting(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchConfig = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_V1}/settings/budget-config`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch budget config.")
        }

        const config = data?.data || data?.items || data || null
        const timestamp = data?.timestamp || null

        if (isMounted && config) {
          setBudgetConfig({
            _id: config._id ?? config.id,
            fiscalYearStart: config.fiscalYearStart,
            defaultCurrency: config.defaultCurrency,
            enforcementAction: config.enforcementAction,
            reportingInterval: config.reportingInterval,
            varianceThresholdPercent: config.varianceThresholdPercent,
          })
        }
        if (isMounted) {
          setLastUpdated(timestamp)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load budget config.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchConfig()

    return () => {
      isMounted = false
    }
  }, [refreshIndex])

  return { budgetConfig, loading, error, refresh, lastUpdated, resetConfig, resetting }
}
