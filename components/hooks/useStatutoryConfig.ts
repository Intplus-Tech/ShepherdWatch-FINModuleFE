import { API_V1 } from "@/lib/api";
import { useEffect, useState } from "react"

export type StatutoryConfig = {
  pensionRate?: number
  taxRate?: number
  nhfRate?: number
  savingsDnaRate?: number
  enforcementAction?: "warn_only" | "block_transactions" | "require_approval" | string
  remittanceFrequency?: "monthly" | "quarterly" | "annually" | string
}

export function useStatutoryConfig() {
  const [statutoryConfig, setStatutoryConfig] = useState<StatutoryConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const refresh = () => setRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true

    const fetchConfig = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_V1}/settings/statutory-config`, {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch statutory config.")
        }

        const config = data?.data || data?.items || data || null
        const timestamp = data?.timestamp || null

        if (isMounted && config) {
          setStatutoryConfig({
            pensionRate: config.pensionRate,
            taxRate: config.taxRate,
            nhfRate: config.nhfRate,
            savingsDnaRate: config.savingsDnaRate,
            enforcementAction: config.enforcementAction,
            remittanceFrequency: config.remittanceFrequency,
          })
        }
        if (isMounted) {
          setLastUpdated(timestamp)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load statutory config.")
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

  return { statutoryConfig, loading, error, refresh, lastUpdated }
}
