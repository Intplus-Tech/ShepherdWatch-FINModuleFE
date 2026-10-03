"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useModalParam } from "@/components/hooks/useModalParam"
import RecordAssetSaleModal, {
  AssetSaleDetails,
  AssetSaleFormValues,
} from "@/components/modals/RecordAssetSaleModal"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { createSaleLog } from "@/components/hooks/useAssetSalesLogs"
import { API_V1 } from "@/lib/api"

/**
 * Recording an asset sale. This used to live inside the Director's sales-log
 * page; it now belongs to the Finance Controller, so it is a component both
 * screens can mount and only one does.
 */
export default function RecordAssetSaleContainer({
  /** Where to return after the modal closes, e.g. `/finance-controller/assets/sales-log`. */
  returnPath,
  onSuccess,
}: {
  returnPath: string
  onSuccess: () => void
}) {
  const { isOpen: isModalOpen, close } = useModalParam("record-sale")
  const searchParams = useSearchParams()
  const assetId = searchParams.get("assetId") ?? ""
  const router = useRouter()
  const { pushToast } = useToast()
  const { user } = useAuth()

  /**
   * Assets for the "Asset" dropdown. This reads the register directly:
   * `/assets/overview` returns aggregates plus a `recentActivity` list, not the
   * full set, so sourcing the dropdown from it left it empty. `limit` is capped
   * at 100 — anything higher fails validation and returns nothing — so page.
   */
  const [assetOptions, setAssetOptions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (!isModalOpen) return
    let active = true

    const load = async () => {
      const found: { id: string; name: string }[] = []
      try {
        for (let page = 1; page <= 20; page += 1) {
          const res = await fetch(`${API_V1}/assets?limit=100&page=${page}`, {
            credentials: "include",
          })
          const json = await res.json().catch(() => null)
          if (!active || !res.ok) return
          const batch: Record<string, unknown>[] = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.data?.content)
              ? json.data.content
              : Array.isArray(json?.data?.assets)
                ? json.data.assets
                : []
          for (const asset of batch) {
            const id = String(asset._id ?? asset.id ?? "")
            // A disposed asset cannot be sold again.
            if (!id || asset.status === "disposed" || asset.status === "written_off") continue
            found.push({ id, name: String(asset.name ?? id) })
          }
          const pages = Number(json?.pagination?.pages ?? 1)
          if (batch.length === 0 || page >= pages) break
        }
        if (active) setAssetOptions(found)
      } catch {
        if (active) setAssetOptions([])
      }
    }

    load()
    return () => {
      active = false
    }
  }, [isModalOpen])

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // This flow is always "create a sale request" against the asset-sales-logs
  // endpoint. The assetId is sourced from the URL param when the screen was
  // opened for one specific asset.
  const emptyDetails: AssetSaleDetails = {
    branchName: "",
    location: "",
    assetId: assetId || undefined,
    assetName: assetId ? `Asset ${assetId}` : "",
    saleDate: "",
    saleAmount: "",
    buyerName: "",
    buyerContact: "",
    reasonForSale: "",
    proceedsToAccount: "",
    history: [],
  }

  useEffect(() => {
    if (!isModalOpen) {
      setErrorMessage(null)
    }
  }, [isModalOpen])

  const handleSubmit = async (form: AssetSaleFormValues) => {
    try {
      setSubmitting(true)
      setErrorMessage(null)

      // assetId is required by the backend. It comes from the Asset dropdown
      // (form.assetId) or, when the page was opened for a specific asset, the
      // URL param.
      const resolvedAssetId = form.assetId?.trim() || assetId
      if (!resolvedAssetId) {
        throw new Error("Please select an asset for this sale.")
      }

      await createSaleLog({
        assetId: resolvedAssetId,
        branchId: user?.branchId || undefined,
        saleDate: form.saleDate,
        saleAmount: form.saleAmount,
        buyerName: form.buyerName,
        buyerContact: form.buyerContact,
        reasonForSale: form.reasonForSale,
        proceedsToAccount: form.proceedsToAccount,
      })
      pushToast("Sale recorded", "success")
      onSuccess()
      close()
      router.replace(returnPath)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to save sale.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RecordAssetSaleModal
      isOpen={isModalOpen}
      onClose={() => {
        close()
        router.replace(returnPath)
      }}
      saleDetails={emptyDetails}
      mode="create"
      assetOptions={assetOptions}
      onSubmit={handleSubmit}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  )
}
