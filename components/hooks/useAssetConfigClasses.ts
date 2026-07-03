import { API_V1 } from "@/lib/api";
import { useState, useCallback } from "react"
import { AssetClassConfig } from "@/components/hooks/useAssetConfig"

export type AssetClassPayload = {
  name?: string
  usefulLifeYears?: number
  depreciationMethod?: string
  salvageValuePercent?: number
  nonDepreciable?: boolean
}

// CRUD wrapper for the global asset-policy class endpoints:
//   POST   /settings/asset-config/classes
//   PUT    /settings/asset-config/classes/{id}
//   DELETE /settings/asset-config/classes/{id}
export function useAssetConfigClasses() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // GET /settings/asset-config/classes — list the global asset-policy class defaults.
  const listClasses = useCallback(async (): Promise<AssetClassConfig[]> => {
    setError(null)
    try {
      const res = await fetch(`${API_V1}/settings/asset-config/classes`, {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to load asset classes.")
      }
      const raw = data?.data ?? data?.items ?? data
      if (Array.isArray(raw)) return raw as AssetClassConfig[]
      if (Array.isArray(raw?.data)) return raw.data as AssetClassConfig[]
      if (Array.isArray(raw?.items)) return raw.items as AssetClassConfig[]
      if (Array.isArray(raw?.classes)) return raw.classes as AssetClassConfig[]
      return []
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load asset classes.")
      throw err
    }
  }, [])

  const createClass = useCallback(async (payload: AssetClassPayload) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_V1}/settings/asset-config/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to add asset class.")
      }
      return (data?.data ?? data) as AssetClassConfig
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add asset class.")
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const updateClass = useCallback(async (id: string, payload: AssetClassPayload) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_V1}/settings/asset-config/classes/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to update asset class.")
      }
      return (data?.data ?? data) as AssetClassConfig
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update asset class.")
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const deleteClass = useCallback(async (id: string) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_V1}/settings/asset-config/classes/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to delete asset class.")
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete asset class.")
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, error, listClasses, createClass, updateClass, deleteClass }
}
