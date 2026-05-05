import { useEffect, useState } from "react"

export type AssetClassConfig = {
  _id?: string
  name?: string
  usefulLifeYears?: number
  depreciationMethod?: string
  salvageValuePercent?: number
  nonDepreciable?: boolean
}

export type AssetConfig = {
  depreciationMethod?: string
  defaultUsefulLifeYears?: number
  capitalizationThreshold?: number
  globalSalvageValuePercent?: number
  disposalApprovalRequired?: boolean
  disposalApprovalThreshold?: number
  lastPolicyReviewAt?: string
  lastPolicyReviewBy?: string
  classes?: AssetClassConfig[]
}

export function useAssetConfig() {
  const [assetConfig, setAssetConfig] = useState<AssetConfig | null>(null)
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
        const response = await fetch("/api/v1/settings/asset-config", {
          method: "GET",
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to fetch asset config.")
        }

        const config = data?.data || data?.items || data || null
        const timestamp = data?.timestamp || null

        if (isMounted && config) {
          setAssetConfig({
            depreciationMethod: config.depreciationMethod,
            defaultUsefulLifeYears: config.defaultUsefulLifeYears,
            capitalizationThreshold: config.capitalizationThreshold,
            globalSalvageValuePercent: config.globalSalvageValuePercent,
            disposalApprovalRequired: config.disposalApprovalRequired,
            disposalApprovalThreshold: config.disposalApprovalThreshold,
            lastPolicyReviewAt: config.lastPolicyReviewAt,
            lastPolicyReviewBy: config.lastPolicyReviewBy,
            classes: Array.isArray(config.classes) ? config.classes : [],
          })
        }
        if (isMounted) {
          setLastUpdated(timestamp)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load asset config.")
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

  return { assetConfig, loading, error, refresh, lastUpdated }
}
