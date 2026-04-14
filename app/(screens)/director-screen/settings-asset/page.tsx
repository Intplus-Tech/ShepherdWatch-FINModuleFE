"use client"

import { useEffect, useState } from "react"

import SidebarNav from "@/components/navigation/SidebarNav"
import ScreenHeader from "@/components/navigation/ScreenHeader"
import { Button } from "@/components/ui/button"
import { useAssetConfig } from "@/components/hooks/useAssetConfig"
import {
  AlertTriangle,
  ChevronDown,
  FileText,
  Info,
  Layers,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Building2,
} from "lucide-react"

const sideItems = [
  { label: "Budget" },
  { label: "Asset", active: true },
  { label: "Departmental" },
  { label: "Audit Logs" },
  { label: "Permissions" },
]

export default function Page() {
  const { assetConfig, loading, error, lastUpdated, refresh } = useAssetConfig()
  const [form, setForm] = useState({
    depreciationMethod: "",
    defaultUsefulLifeYears: "",
    capitalizationThreshold: "",
  })
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [classForm, setClassForm] = useState({
    name: "",
    usefulLifeYears: "",
    depreciationMethod: "",
  })
  const [classSaving, setClassSaving] = useState(false)
  const [classMessage, setClassMessage] = useState<string | null>(null)
  const [classError, setClassError] = useState<string | null>(null)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    usefulLifeYears: "",
    depreciationMethod: "",
  })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const parsedLastUpdated = lastUpdated ? new Date(lastUpdated) : null
  const lastUpdatedLabel =
    parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime())
      ? parsedLastUpdated.toLocaleString()
      : null

  const depreciationLabel =
    form.depreciationMethod
      ? form.depreciationMethod
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Not configured"

  const usefulLifeLabel =
    form.defaultUsefulLifeYears !== ""
      ? `${form.defaultUsefulLifeYears} years`
      : "Not configured"

  const capitalizationLabel =
    form.capitalizationThreshold !== ""
      ? Number(form.capitalizationThreshold).toLocaleString()
      : "Not configured"

  const assetClasses = assetConfig?.classes ?? []

  const getClassIcon = (name?: string) => {
    if (!name) return Building2
    const label = name.toLowerCase()
    if (label.includes("building")) return Building2
    if (label.includes("land")) return ShieldCheck
    if (label.includes("vehicle") || label.includes("car")) return SlidersHorizontal
    if (label.includes("it") || label.includes("equipment")) return FileText
    return Building2
  }

  useEffect(() => {
    if (!assetConfig) return
    setForm({
      depreciationMethod: assetConfig.depreciationMethod ?? "",
      defaultUsefulLifeYears:
        assetConfig.defaultUsefulLifeYears !== undefined
          ? String(assetConfig.defaultUsefulLifeYears)
          : "",
      capitalizationThreshold:
        assetConfig.capitalizationThreshold !== undefined
          ? String(assetConfig.capitalizationThreshold)
          : "",
    })
  }, [assetConfig])

  const handleSave = async () => {
    setSaveMessage(null)
    setSaveError(null)

    if (!form.depreciationMethod) {
      setSaveError("Depreciation method is required.")
      return
    }

    const defaultUsefulLifeYears = Number(form.defaultUsefulLifeYears)
    const capitalizationThreshold = Number(form.capitalizationThreshold)

    if (!Number.isFinite(defaultUsefulLifeYears) || defaultUsefulLifeYears < 1) {
      setSaveError("Default useful life must be at least 1 year.")
      return
    }
    if (!Number.isFinite(capitalizationThreshold) || capitalizationThreshold < 0) {
      setSaveError("Capitalization threshold must be 0 or greater.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/settings/asset-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depreciationMethod: form.depreciationMethod,
          defaultUsefulLifeYears,
          capitalizationThreshold,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to save asset configuration")
      }
      setSaveMessage(data?.message || "Asset configuration updated successfully.")
      refresh()
    } catch (err: any) {
      setSaveError(err.message || "Unable to save asset configuration")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSaveMessage(null)
    setSaveError(null)
    if (!assetConfig) {
      setForm({
        depreciationMethod: "",
        defaultUsefulLifeYears: "",
        capitalizationThreshold: "",
      })
      return
    }
    setForm({
      depreciationMethod: assetConfig.depreciationMethod ?? "",
      defaultUsefulLifeYears:
        assetConfig.defaultUsefulLifeYears !== undefined
          ? String(assetConfig.defaultUsefulLifeYears)
          : "",
      capitalizationThreshold:
        assetConfig.capitalizationThreshold !== undefined
          ? String(assetConfig.capitalizationThreshold)
          : "",
    })
  }

  const handleAddClass = async () => {
    setClassMessage(null)
    setClassError(null)

    if (!classForm.name.trim()) {
      setClassError("Class name is required.")
      return
    }
    if (!classForm.depreciationMethod) {
      setClassError("Depreciation method is required.")
      return
    }
    const usefulLifeYears = Number(classForm.usefulLifeYears)
    if (!Number.isFinite(usefulLifeYears) || usefulLifeYears < 1) {
      setClassError("Useful life must be at least 1 year.")
      return
    }

    setClassSaving(true)
    try {
      const res = await fetch("/api/settings/asset-config/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: classForm.name.trim(),
          usefulLifeYears,
          depreciationMethod: classForm.depreciationMethod,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to add asset class")
      }
      setClassMessage(data?.message || "Asset class added successfully.")
      setClassForm({ name: "", usefulLifeYears: "", depreciationMethod: "" })
      setShowAddClass(false)
      refresh()
    } catch (err: any) {
      setClassError(err.message || "Unable to add asset class")
    } finally {
      setClassSaving(false)
    }
  }

  const startEditClass = (item: any) => {
    setEditError(null)
    setEditingClassId(item?._id ?? null)
    setEditForm({
      name: item?.name ?? "",
      usefulLifeYears:
        item?.usefulLifeYears !== undefined ? String(item.usefulLifeYears) : "",
      depreciationMethod: item?.depreciationMethod ?? "",
    })
  }

  const cancelEditClass = () => {
    setEditError(null)
    setEditingClassId(null)
    setEditForm({ name: "", usefulLifeYears: "", depreciationMethod: "" })
  }

  const handleUpdateClass = async () => {
    if (!editingClassId) return
    setEditError(null)

    const payload: Record<string, any> = {}
    if (editForm.name.trim()) payload.name = editForm.name.trim()
    if (editForm.usefulLifeYears !== "") {
      const years = Number(editForm.usefulLifeYears)
      if (!Number.isFinite(years) || years < 1) {
        setEditError("Useful life must be at least 1 year.")
        return
      }
      payload.usefulLifeYears = years
    }
    if (editForm.depreciationMethod) {
      payload.depreciationMethod = editForm.depreciationMethod
    }

    if (Object.keys(payload).length === 0) {
      setEditError("Update at least one field.")
      return
    }

    setEditSaving(true)
    try {
      const res = await fetch(`/api/settings/asset-config/classes/${editingClassId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to update asset class")
      }
      cancelEditClass()
      refresh()
    } catch (err: any) {
      setEditError(err.message || "Unable to update asset class")
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteClass = async (id?: string) => {
    if (!id) return
    setDeleteError(null)
    const confirmed = window.confirm("Delete this asset class? Existing assets will not be affected.")
    if (!confirmed) return
    setDeletingClassId(id)
    try {
      const res = await fetch(`/api/settings/asset-config/classes/${id}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Unable to delete asset class")
      }
      if (editingClassId === id) {
        cancelEditClass()
      }
      refresh()
    } catch (err: any) {
      setDeleteError(err.message || "Unable to delete asset class")
    } finally {
      setDeletingClassId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <SidebarNav
        activeHref="/director-screen/settings"
        className="fixed inset-y-0 left-0 z-20 w-65 rounded-none bg-[#FAFBFF] border-r border-[#EEF1F6]"
      />

      <main className="flex-1 xl:ml-[260px] text-[#111827]">
        <div className="mx-auto w-full px-6 pt-6 pb-8 lg:px-8 lg:pt-8 max-w-7xl">
          <ScreenHeader title="Financial Overview" subtitle="Global financial health monitoring" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="text-[12.74px] leading-[16.98px] font-bold uppercase tracking-[1.27px] text-[#9CA3AF]">
                  SUPER ADMIN
                </div>
                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">Global Configuration</div>
                <div className="mt-3 space-y-1">
                  {sideItems.map((item) => (
                    <button
                      key={item.label}
                      className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[14.86px] leading-[21.23px] ${
                        item.active
                          ? "bg-[#E9EEFF] text-[#3B5BDB] font-bold"
                          : "text-[#6B7280] font-medium hover:bg-[#F3F5F9]"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium text-[#2563EB]">
                  <Info className="h-3.5 w-3.5" />
                  Director&apos;s Note
                </div>
                <p className="mt-2 text-[9px] text-[#6B7280]">
                  These settings are global. Changes here affect all asset policies immediately.
                </p>
              </div>
            </aside>

            <section className="space-y-6">
              <div>
                <h2 className="text-[31.84px] leading-[38.21px] font-black tracking-[-0.8px] text-[#111827]">
                  Global Asset Policy Config
                </h2>
                <p className="text-[16.98px] leading-[25.48px] font-normal text-[#9CA3AF]">
                  Define organization-wide depreciation standards, life expectancy, and disposal rules.
                </p>
                {error ? (
                  <div className="mt-2 text-[12px] text-rose-600 font-[700]">{error}</div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <FileText className="h-4 w-4 text-[#3B5BDB]" />
                    Depreciation Method
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    Default method applied to asset classes without explicit overrides.
                  </p>
                  <div className="mt-4">
                    <select
                      value={form.depreciationMethod}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, depreciationMethod: e.target.value }))
                      }
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    >
                      <option value="">Select method</option>
                      <option value="straight_line">Straight Line</option>
                      <option value="declining_balance">Declining Balance</option>
                      <option value="units_of_production">Units of Production</option>
                    </select>
                    <div className="mt-2 text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                      Selected: {loading ? "Loading..." : depreciationLabel}
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <SlidersHorizontal className="h-4 w-4 text-[#3B5BDB]" />
                    Default Useful Life
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    Applies when a class does not define its own useful life.
                  </p>
                  <div className="mt-4">
                    <input
                      type="number"
                      min={1}
                      value={form.defaultUsefulLifeYears}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, defaultUsefulLifeYears: e.target.value }))
                      }
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                    <div className="mt-2 text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                      Selected: {loading ? "Loading..." : usefulLifeLabel}
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                  <div className="flex items-center gap-2 text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                    <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                    Capitalization Threshold
                  </div>
                  <p className="mt-2 text-[12.74px] leading-[16.98px] font-normal text-[#9CA3AF]">
                    Assets above this value are capitalized by default.
                  </p>
                  <div className="mt-3">
                    <input
                      type="number"
                      min={0}
                      value={form.capitalizationThreshold}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, capitalizationThreshold: e.target.value }))
                      }
                      className="h-9 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[14px] font-semibold text-[#111827]"
                    />
                    <div className="mt-2 text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                      Selected: {loading ? "Loading..." : capitalizationLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
                <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3">
                  <div className="text-[16.98px] leading-[25.48px] font-bold text-[#111827]">Asset Class Defaults</div>
                  <button
                    onClick={() => {
                      setClassMessage(null)
                      setClassError(null)
                      setShowAddClass((prev) => !prev)
                    }}
                    className="text-[14.86px] leading-[21.23px] font-bold text-[#3B5BDB]"
                  >
                    {showAddClass ? "Close" : "+ Add New Class"}
                  </button>
                </div>
                {showAddClass ? (
                  <div className="px-4 py-4 border-b border-[#EEF1F6] bg-[#FAFBFF]">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-[800] text-[#111827]">Class Name</label>
                        <input
                          type="text"
                          value={classForm.name}
                          onChange={(e) =>
                            setClassForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="h-[36px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-[800] text-[#111827]">Useful Life (Years)</label>
                        <input
                          type="number"
                          min={1}
                          value={classForm.usefulLifeYears}
                          onChange={(e) =>
                            setClassForm((prev) => ({
                              ...prev,
                              usefulLifeYears: e.target.value,
                            }))
                          }
                          className="h-[36px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-[800] text-[#111827]">
                          Depreciation Method
                        </label>
                        <select
                          value={classForm.depreciationMethod}
                          onChange={(e) =>
                            setClassForm((prev) => ({
                              ...prev,
                              depreciationMethod: e.target.value,
                            }))
                          }
                          className="h-[36px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-[600] text-[#111827]"
                        >
                          <option value="">Select method</option>
                          <option value="straight_line">Straight Line</option>
                          <option value="declining_balance">Declining Balance</option>
                          <option value="units_of_production">Units of Production</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {classError ? (
                          <div className="text-[12px] font-[600] text-rose-600">{classError}</div>
                        ) : null}
                        {classMessage ? (
                          <div className="text-[12px] font-[600] text-emerald-600">{classMessage}</div>
                        ) : null}
                      </div>
                      <Button size="sm" className="h-8" onClick={handleAddClass} disabled={classSaving}>
                        {classSaving ? "Saving..." : "Add Class"}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.74px] leading-[16.98px]">
                    <thead className="bg-[#F9FAFB] text-[#9CA3AF]">
                      <tr>
                        <th className="py-3 px-4 text-left">ASSET CLASS</th>
                        <th className="py-3 px-4 text-left">DEPRECIATION METHOD</th>
                        <th className="py-3 px-4 text-left">USEFUL LIFE (YRS)</th>
                        <th className="py-3 px-4 text-left">SALVAGE VALUE</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetClasses.length === 0 ? (
                        <tr className="border-t border-[#EEF1F6]">
                          <td className="py-6 px-4 text-[#9CA3AF]" colSpan={5}>
                            {loading ? "Loading asset classes..." : "No asset classes configured yet."}
                          </td>
                        </tr>
                      ) : null}
                      {deleteError ? (
                        <tr className="border-t border-[#EEF1F6]">
                          <td className="py-3 px-4 text-rose-600 text-[12px]" colSpan={5}>
                            {deleteError}
                          </td>
                        </tr>
                      ) : null}
                      {assetClasses.map((item) => {
                        const Icon = getClassIcon(item.name)
                        const methodLabel = item.depreciationMethod
                          ? item.depreciationMethod
                              .split("_")
                              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                              .join(" ")
                          : "—"
                        const isEditing = editingClassId === item._id
                        return (
                        <tr key={item.name} className="border-t border-[#EEF1F6] text-[#111827]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-[8px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
                                <Icon className="h-4 w-4" />
                              </div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                                  }
                                  className="h-[32px] w-[180px] rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12.5px] font-[600] text-[#111827]"
                                />
                              ) : (
                                <div className="text-[14.86px] leading-[21.23px] font-semibold text-[#111827]">
                                  {item.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <select
                                value={editForm.depreciationMethod}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    depreciationMethod: e.target.value,
                                  }))
                                }
                                className="h-8 rounded-[10px] border border-[#E5E7EB] bg-white px-2 text-[12.74px] text-[#6B7280]"
                              >
                                <option value="">Select method</option>
                                <option value="straight_line">Straight Line</option>
                                <option value="declining_balance">Declining Balance</option>
                                <option value="units_of_production">Units of Production</option>
                              </select>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[12.74px] leading-[16.98px] text-[#6B7280]"
                                disabled
                              >
                                {methodLabel}
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#6B7280]">
                            {isEditing ? (
                              <input
                                type="number"
                                min={1}
                                value={editForm.usefulLifeYears}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    usefulLifeYears: e.target.value,
                                  }))
                                }
                                className="h-[32px] w-[90px] rounded-[8px] border border-[#E5E7EB] bg-white px-2 text-[12.5px] font-[600] text-[#111827]"
                              />
                            ) : (
                              item.usefulLifeYears !== undefined ? item.usefulLifeYears : "—"
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#6B7280]">—</td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-3">
                                {editError ? (
                                  <span className="text-[11px] text-rose-600">{editError}</span>
                                ) : null}
                                <button
                                  onClick={cancelEditClass}
                                  className="text-[12.74px] leading-[16.98px] font-semibold text-[#6B7280]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdateClass}
                                  disabled={editSaving}
                                  className="text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]"
                                >
                                  {editSaving ? "Saving..." : "Save"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => startEditClass(item)}
                                  className="text-[12.74px] leading-[16.98px] font-semibold text-[#3B5BDB]"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(item._id)}
                                  disabled={deletingClassId === item._id}
                                  className="text-[12.74px] leading-[16.98px] font-semibold text-rose-600 disabled:opacity-60"
                                >
                                  {deletingClassId === item._id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <div className="text-[12.74px] leading-[16.98px] font-semibold text-[#92400E]">Global Configuration Warning</div>
                    <p className="mt-1 text-[11.68px] leading-[14.6px] font-normal text-[#A16207]">
                      Updating these policies will re-calculate the expected net book values for all current assets in the next financial reporting cycle. Ensure you have Board approval before committing these changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12.74px] leading-[16.98px] italic font-normal text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3" />
                    {lastUpdatedLabel
                      ? `Last updated on ${lastUpdatedLabel}`
                      : "Last updated timestamp unavailable"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {saveMessage ? (
                    <div className="text-[12px] text-emerald-600 font-[700]">{saveMessage}</div>
                  ) : null}
                  {saveError ? (
                    <div className="text-[12px] text-rose-600 font-[700]">{saveError}</div>
                  ) : null}
                  <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[12.74px] leading-[16.98px] text-[#6B7280]"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 rounded-[10px] bg-[#3B5BDB] text-[12.74px] leading-[16.98px] text-white"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save All Configuration"}
                  </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
