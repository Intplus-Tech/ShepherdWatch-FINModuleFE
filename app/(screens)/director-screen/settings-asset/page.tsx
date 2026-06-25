"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import SettingsConfigSidebar from "@/components/navigation/SettingsConfigSidebar"
import AddAssetClassModal from "@/components/settings/AddAssetClassModal"
import { useAssetConfig, AssetClassConfig } from "@/components/hooks/useAssetConfig"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Building2,
  Cpu,
  Layers,
  Mountain,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react"

type DepreciationMethod = "Straight Line" | "Reducing Balance" | "Non-Depreciable"

function classIcon(name: string | undefined) {
  const n = (name || "").toLowerCase()
  if (n.includes("land")) return <Mountain className="h-4 w-4 text-[#6B7280]" />
  if (n.includes("build")) return <Building2 className="h-4 w-4 text-[#6B7280]" />
  if (n.includes("vehicle") || n.includes("motor")) return <Truck className="h-4 w-4 text-[#6B7280]" />
  if (n.includes("it") || n.includes("equipment") || n.includes("computer"))
    return <Cpu className="h-4 w-4 text-[#6B7280]" />
  return <Layers className="h-4 w-4 text-[#6B7280]" />
}

function isNonDepreciable(cls: AssetClassConfig): boolean {
  if (cls.nonDepreciable) return true
  return (cls.depreciationMethod || "").toLowerCase().includes("non")
}

// Map a backend depreciation method key (e.g. "straight_line") to the label
// the policy table displays (e.g. "Straight Line").
function methodLabel(raw?: string): string | undefined {
  if (!raw) return undefined
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_")
  if (key === "straight_line" || key === "straightline") return "Straight Line"
  if (key === "declining_balance" || key === "reducing_balance" || key === "decliningbalance")
    return "Reducing Balance"
  if (key === "units_of_production") return "Units of Production"
  return raw
}

// Normalize an `/asset-classes` record into the shape the policy table renders.
function assetClassToConfig(c: Record<string, unknown>): AssetClassConfig {
  const salvage =
    (c.defaultResidualValuePercent as number | undefined) ??
    (c.residualValuePercent as number | undefined)
  return {
    _id: String((c._id as string) ?? (c.id as string) ?? (c.name as string) ?? ""),
    name: (c.name as string) ?? "Unnamed",
    depreciationMethod: methodLabel(c.defaultDepreciationMethod as string | undefined),
    usefulLifeYears: c.defaultUsefulLifeYears as number | undefined,
    salvageValuePercent: salvage,
    nonDepreciable: false,
  }
}

export default function Page() {
  const { assetConfig, loading, lastUpdated, refresh } = useAssetConfig()
  // Master list of asset classes (where "Add New Class" creates records). Merged
  // into the policy table below so newly-created classes appear immediately.
  const { assetClasses, refetch: refetchAssetClasses } = useAssetClasses({ limit: 100 })
  const { pushToast } = useToast()

  const [disposalApproval, setDisposalApproval] = useState(true)
  const [globalSalvage, setGlobalSalvage] = useState("")
  const [classes, setClasses] = useState<AssetClassConfig[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addClassOpen, setAddClassOpen] = useState(false)

  useEffect(() => {
    if (assetConfig) {
      setDisposalApproval(assetConfig.disposalApprovalRequired ?? true)
      setGlobalSalvage(
        assetConfig.globalSalvageValuePercent !== undefined
          ? String(assetConfig.globalSalvageValuePercent)
          : ""
      )
    }

    // Merge the asset-config policy classes with the master /asset-classes list
    // so classes created via "Add New Class" show up here too. Dedupe by name.
    const configClasses = Array.isArray(assetConfig?.classes) ? assetConfig!.classes : []
    const seen = new Set(
      configClasses.map((c) => (c.name || "").trim().toLowerCase()).filter(Boolean)
    )
    const extras = (Array.isArray(assetClasses) ? assetClasses : [])
      .map((c) => assetClassToConfig(c as Record<string, unknown>))
      .filter((c) => {
        const key = (c.name || "").trim().toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })

    setClasses([...configClasses, ...extras])
  }, [assetConfig, assetClasses])

  const lastReviewLabel = useMemo(() => {
    const raw = assetConfig?.lastPolicyReviewAt
    if (!raw) return null
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
  }, [assetConfig?.lastPolicyReviewAt])

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return null
    const d = new Date(lastUpdated)
    return Number.isNaN(d.getTime()) ? null : d.toLocaleString()
  }, [lastUpdated])

  const updateClassField = (id: string, field: keyof AssetClassConfig, value: unknown) => {
    setClasses((prev) =>
      prev.map((c) => (c._id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleSave = async () => {
    const salvageNumber = globalSalvage === "" ? undefined : Number(globalSalvage)
    if (salvageNumber !== undefined && (!Number.isFinite(salvageNumber) || salvageNumber < 0 || salvageNumber > 100)) {
      pushToast("Invalid salvage value: enter a percentage between 0 and 100.", "error")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_V1}/settings/asset-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          disposalApprovalRequired: disposalApproval,
          globalSalvageValuePercent: salvageNumber,
          classes: classes.map((c) => ({
            _id: c._id,
            name: c.name,
            usefulLifeYears: c.usefulLifeYears,
            depreciationMethod: c.depreciationMethod,
            salvageValuePercent: c.salvageValuePercent,
            nonDepreciable: isNonDepreciable(c),
          })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Unable to save asset configuration")
      pushToast(data?.message || "Asset settings updated successfully.", "success")
      setEditingId(null)
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save asset configuration"
      pushToast(`Save failed: ${message}`, "error")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-65 rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-65 text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <SettingsConfigSidebar active="asset" />

            <section className="space-y-6">
              <div>
                <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                  Global Asset Policy Config
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Define organization-wide depreciation standards, life expectancy, and disposal rules.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
                    <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                    Disposal Approval
                  </div>
                  <p className="mt-2 text-[12px] text-[#6B7280]">
                    Require head-office (Director) sign-off for all asset disposals exceeding $5,000.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#9CA3AF]">
                      Centralized Status
                    </span>
                    <button
                      type="button"
                      aria-label={`Disposal approval requirement: ${disposalApproval ? "on" : "off"}. Click to toggle.`}
                      title="Toggle disposal approval requirement"
                      onClick={() => setDisposalApproval((v) => !v)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        disposalApproval ? "bg-[#3B5BDB]" : "bg-[#E5E7EB]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          disposalApproval ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
                    <span className="text-[#3B5BDB]">%</span>
                    Global Salvage Value %
                  </div>
                  <p className="mt-2 text-[12px] text-[#6B7280]">
                    Set the default estimated percentage of value remaining at the end of useful life.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={globalSalvage}
                      onChange={(e) => setGlobalSalvage(e.target.value)}
                      placeholder="10"
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                    <span className="text-[14px] text-[#6B7280]">%</span>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
                    <Layers className="h-4 w-4 text-[#3B5BDB]" />
                    Last Policy Review
                  </div>
                  <p className="mt-2 text-[12px] text-[#6B7280]">
                    The last comprehensive review of asset life expectancy was performed on:
                  </p>
                  <div className="mt-3 text-[18px] font-bold text-[#111827]">
                    {loading ? "—" : lastReviewLabel ?? "Not on record"}
                  </div>
                  {assetConfig?.lastPolicyReviewBy ? (
                    <div className="mt-1 text-[10px] uppercase tracking-[1px] text-[#9CA3AF]">
                      Modified by: {assetConfig.lastPolicyReviewBy}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    Asset Class Defaults
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddClassOpen(true)}
                    className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#3B5BDB] hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Class
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#EEF1F6] text-[10px] font-bold uppercase tracking-[1px] text-[#9CA3AF]">
                        <th className="py-2 pr-3">Asset Class</th>
                        <th className="py-2 pr-3">Depreciation Method</th>
                        <th className="py-2 pr-3">Useful Life (Yrs)</th>
                        <th className="py-2 pr-3">Salvage Value</th>
                        <th className="py-2 pr-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && classes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 px-2">
                            <SkeletonTable rows={5} columns={5} />
                          </td>
                        </tr>
                      ) : classes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[12px] text-[#9CA3AF]">
                            No asset classes configured. Click &quot;Add New Class&quot; to create one.
                          </td>
                        </tr>
                      ) : (
                        classes.map((cls) => {
                          const isEditing = editingId === cls._id
                          const nonDep = isNonDepreciable(cls)
                          return (
                            <tr key={cls._id ?? cls.name} className="border-b border-[#F3F5F9] last:border-0 text-[14px] text-[#111827]">
                              <td className="py-3 pr-3">
                                <div className="flex items-center gap-2">
                                  {classIcon(cls.name)}
                                  <span className="font-medium">{cls.name ?? "Unnamed"}</span>
                                </div>
                              </td>
                              <td className="py-3 pr-3">
                                {nonDep ? (
                                  <span className="rounded-[8px] bg-[#F3F4F6] px-2 py-1 text-[10px] font-bold uppercase tracking-[1px] text-[#6B7280]">
                                    Non-Depreciable
                                  </span>
                                ) : isEditing ? (
                                  <select
                                    aria-label="Depreciation method"
                                    title="Depreciation method"
                                    value={cls.depreciationMethod ?? "Straight Line"}
                                    onChange={(e) =>
                                      updateClassField(cls._id!, "depreciationMethod", e.target.value as DepreciationMethod)
                                    }
                                    className="h-8 rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12px]"
                                  >
                                    <option value="Straight Line">Straight Line</option>
                                    <option value="Reducing Balance">Reducing Balance</option>
                                  </select>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] font-medium text-[#374151]">
                                    {cls.depreciationMethod ?? "—"}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 pr-3 font-semibold">
                                {nonDep ? (
                                  <span className="text-[#9CA3AF]">∞</span>
                                ) : isEditing ? (
                                  <input
                                    type="number"
                                    aria-label="Useful life in years"
                                    title="Useful life in years"
                                    placeholder="Years"
                                    min={0}
                                    value={cls.usefulLifeYears ?? ""}
                                    onChange={(e) =>
                                      updateClassField(
                                        cls._id!,
                                        "usefulLifeYears",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                      )
                                    }
                                    className="h-8 w-20 rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12px]"
                                  />
                                ) : (
                                  cls.usefulLifeYears ?? "—"
                                )}
                              </td>
                              <td className="py-3 pr-3 font-semibold">
                                {nonDep ? (
                                  "100%"
                                ) : isEditing ? (
                                  <div className="inline-flex items-center gap-1">
                                    <input
                                      type="number"
                                      aria-label="Salvage value percent"
                                      title="Salvage value percent"
                                      placeholder="%"
                                      min={0}
                                      max={100}
                                      value={cls.salvageValuePercent ?? ""}
                                      onChange={(e) =>
                                        updateClassField(
                                          cls._id!,
                                          "salvageValuePercent",
                                          e.target.value === "" ? undefined : Number(e.target.value)
                                        )
                                      }
                                      className="h-8 w-16 rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12px]"
                                    />
                                    <span>%</span>
                                  </div>
                                ) : (
                                  `${cls.salvageValuePercent ?? 0}%`
                                )}
                              </td>
                              <td className="py-3 pr-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(isEditing ? null : cls._id ?? null)}
                                  className="text-[14px] font-semibold text-[#3B5BDB] hover:underline"
                                >
                                  {isEditing ? "Done" : "Edit"}
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#92400E]">
                      Global Configuration Warning
                    </div>
                    <p className="mt-1 text-[11.68px] leading-[14.6px] font-normal text-[#A16207]">
                      Updating these policies will re-calculate the expected net book values for all current
                      assets in the next financial reporting cycle. Ensure you have Board approval before committing
                      these changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                <div className="text-[12.74px] leading-[16.98px] italic font-normal text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3" />
                    {lastUpdatedLabel
                      ? `Last updated on ${lastUpdatedLabel}`
                      : "Last updated timestamp unavailable"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-[10px] text-[#6B7280]"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-[10px] bg-[#3B5BDB] hover:bg-[#2C46B4]"
                    onClick={handleSave}
                    disabled={saving || loading}
                  >
                    {saving ? "Saving..." : "Save All Configuration"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <AddAssetClassModal
        open={addClassOpen}
        onClose={() => setAddClassOpen(false)}
        onCreated={() => {
          pushToast("Asset class created successfully.", "success")
          refetchAssetClasses()
          refresh()
        }}
      />
    </div>
  )
}
