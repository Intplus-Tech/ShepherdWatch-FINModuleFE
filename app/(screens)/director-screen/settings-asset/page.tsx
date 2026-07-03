"use client"

import { API_V1 } from "@/lib/api";

import { useEffect, useMemo, useState } from "react"
import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import SettingsConfigSidebar from "@/components/navigation/SettingsConfigSidebar"
import AddAssetClassModal from "@/components/settings/AddAssetClassModal"
import { useAssetConfig, AssetClassConfig } from "@/components/hooks/useAssetConfig"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"
import { useAssetConfigClasses } from "@/components/hooks/useAssetConfigClasses"
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
  // CRUD against the global asset-policy class-defaults endpoints.
  const {
    saving: classSaving,
    listClasses,
    updateClass,
    deleteClass,
  } = useAssetConfigClasses()
  const { pushToast } = useToast()

  const [disposalApproval, setDisposalApproval] = useState(true)
  const [globalSalvage, setGlobalSalvage] = useState("")
  const [classes, setClasses] = useState<AssetClassConfig[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [addClassOpen, setAddClassOpen] = useState(false)
  const [classesLoading, setClassesLoading] = useState(false)
  const [classesError, setClassesError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [classesRefreshIndex, setClassesRefreshIndex] = useState(0)
  const refreshClasses = () => setClassesRefreshIndex((prev) => prev + 1)

  useEffect(() => {
    if (assetConfig) {
      setDisposalApproval(assetConfig.disposalApprovalRequired ?? true)
      setGlobalSalvage(
        assetConfig.globalSalvageValuePercent !== undefined
          ? String(assetConfig.globalSalvageValuePercent)
          : ""
      )
    }
  }, [assetConfig])

  // Source the policy table from the dedicated class-defaults endpoint
  // (GET /settings/asset-config/classes), falling back to the asset-config
  // payload and the master /asset-classes list when it is empty.
  useEffect(() => {
    let active = true

    const buildFallback = (): AssetClassConfig[] => {
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
      return [...configClasses, ...extras]
    }

    const load = async () => {
      setClassesLoading(true)
      setClassesError(null)
      try {
        const live = await listClasses()
        if (!active) return
        if (Array.isArray(live) && live.length > 0) {
          setClasses(live.map((c) => assetClassToConfig(c as Record<string, unknown>)))
        } else {
          setClasses(buildFallback())
        }
      } catch (err) {
        if (!active) return
        // Defensive: never crash on 401/empty — fall back to whatever we have.
        setClasses(buildFallback())
        setClassesError(err instanceof Error ? err.message : "Unable to load asset classes.")
      } finally {
        if (active) setClassesLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [assetConfig, assetClasses, listClasses, classesRefreshIndex])

  const handleDeleteClass = async (id: string) => {
    if (!id) return
    setDeletingId(id)
    try {
      await deleteClass(id)
      pushToast("Asset class deleted successfully.", "success")
      refreshClasses()
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete asset class."
      pushToast(`Delete failed: ${message}`, "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveClass = async (cls: AssetClassConfig) => {
    if (!cls._id) {
      pushToast("This class cannot be edited (missing identifier).", "error")
      setEditingId(null)
      return
    }
    try {
      await updateClass(cls._id, {
        name: cls.name,
        usefulLifeYears: cls.usefulLifeYears,
        depreciationMethod: cls.depreciationMethod,
        salvageValuePercent: cls.salvageValuePercent,
        nonDepreciable: isNonDepreciable(cls),
      })
      pushToast("Asset class updated successfully.", "success")
      setEditingId(null)
      refreshClasses()
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update asset class."
      pushToast(`Update failed: ${message}`, "error")
    }
  }

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

              </div>

              {/* Asset Class Defaults — live data from GET /settings/asset-config/classes */}
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
                    <Layers className="h-4 w-4 text-[#3B5BDB]" />
                    Asset Class Defaults
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-[10px] text-[#3B5BDB]"
                    onClick={() => setAddClassOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add New Class
                  </Button>
                </div>

                {classesError ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-[12px] font-bold text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    {classesError}
                  </div>
                ) : null}

                {classesLoading && classes.length === 0 ? (
                  <div className="p-4">
                    <SkeletonTable rows={3} />
                  </div>
                ) : classes.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-[#9CA3AF]">
                    No asset classes configured yet. Use &ldquo;Add New Class&rdquo; to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-[13px]">
                      <thead className="bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-[1px] text-[#9CA3AF]">
                        <tr>
                          <th className="px-4 py-3">Class</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Useful Life</th>
                          <th className="px-4 py-3">Salvage %</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF1F6]">
                        {classes.map((cls) => {
                          const id = cls._id || ""
                          const isEditing = editingId === id && !!id
                          return (
                            <tr key={id || cls.name} className="text-[#111827]">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {classIcon(cls.name)}
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      aria-label="Class name"
                                      value={cls.name ?? ""}
                                      onChange={(e) => updateClassField(id, "name", e.target.value)}
                                      className="h-8 w-full rounded-[8px] border border-[#E5E7EB] px-2 text-[13px]"
                                    />
                                  ) : (
                                    <span className="font-semibold">{cls.name || "Unnamed"}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#6B7280]">
                                {isEditing ? (
                                  <select
                                    aria-label="Depreciation method"
                                    value={cls.depreciationMethod ?? ""}
                                    onChange={(e) => updateClassField(id, "depreciationMethod", e.target.value)}
                                    className="h-8 rounded-[8px] border border-[#E5E7EB] px-2 text-[13px]"
                                  >
                                    <option value="Straight Line">Straight Line</option>
                                    <option value="Reducing Balance">Reducing Balance</option>
                                    <option value="Non-Depreciable">Non-Depreciable</option>
                                  </select>
                                ) : (
                                  cls.depreciationMethod || (isNonDepreciable(cls) ? "Non-Depreciable" : "—")
                                )}
                              </td>
                              <td className="px-4 py-3 text-[#6B7280]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min={0}
                                    aria-label="Useful life years"
                                    value={cls.usefulLifeYears ?? ""}
                                    onChange={(e) =>
                                      updateClassField(
                                        id,
                                        "usefulLifeYears",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                      )
                                    }
                                    className="h-8 w-20 rounded-[8px] border border-[#E5E7EB] px-2 text-[13px]"
                                  />
                                ) : cls.usefulLifeYears !== undefined ? (
                                  `${cls.usefulLifeYears} yrs`
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-[#6B7280]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    aria-label="Salvage value percent"
                                    value={cls.salvageValuePercent ?? ""}
                                    onChange={(e) =>
                                      updateClassField(
                                        id,
                                        "salvageValuePercent",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                      )
                                    }
                                    className="h-8 w-20 rounded-[8px] border border-[#E5E7EB] px-2 text-[13px]"
                                  />
                                ) : cls.salvageValuePercent !== undefined ? (
                                  `${cls.salvageValuePercent}%`
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-3 text-[12px] font-bold">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        className="text-[#3B5BDB] hover:underline disabled:opacity-60"
                                        onClick={() => handleSaveClass(cls)}
                                        disabled={classSaving}
                                      >
                                        {classSaving ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        className="text-[#6B7280] hover:underline"
                                        onClick={() => {
                                          setEditingId(null)
                                          refreshClasses()
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className="text-[#3B5BDB] hover:underline disabled:opacity-60"
                                        onClick={() => setEditingId(id)}
                                        disabled={!id}
                                        title={!id ? "This class has no identifier and cannot be edited." : undefined}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="text-rose-600 hover:underline disabled:opacity-60"
                                        onClick={() => handleDeleteClass(id)}
                                        disabled={!id || deletingId === id}
                                        title={!id ? "This class has no identifier and cannot be deleted." : undefined}
                                      >
                                        {deletingId === id ? "Deleting..." : "Delete"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
          refreshClasses()
          refresh()
        }}
      />
    </div>
  )
}
