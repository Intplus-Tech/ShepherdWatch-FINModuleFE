"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ModalShell } from "@/components/ui/modal-shell"
import { ChevronDown, FileSpreadsheet, Info, RefreshCw, Save, X } from "lucide-react"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"

export default function AddAssetClassModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const { createAssetClass, isCreating, createError } = useAssetClasses()

  const [name, setName] = useState("")
  const [method, setMethod] = useState("straight_line")
  const [usefulLife, setUsefulLife] = useState("0")
  const [salvageValue, setSalvageValue] = useState("0.0")
  const [automated, setAutomated] = useState(false)

  const reset = () => {
    setName("")
    setMethod("straight_line")
    setUsefulLife("0")
    setSalvageValue("0.0")
    setAutomated(false)
  }

  const handleClose = () => {
    if (isCreating) return
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await createAssetClass({
        name: name.trim(),
        defaultDepreciationMethod: method,
        defaultUsefulLifeYears: Number(usefulLife) || 0,
        defaultResidualValuePercent: Number(salvageValue) || 0,
      })
      reset()
      onCreated?.()
      onClose()
    } catch {
      // Error surfaced via createError below.
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div>
          <h1 className="text-[22px] leading-[28px] font-bold tracking-[-0.4px] text-[#111827]">
            Add New Asset Class Config
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#6B7280]">
            Configure global parameters for new asset categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-bold text-[#3B5BDB] sm:inline-flex">
            Base Currency: Naira (₦)
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Section 1 */}
      <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-4">
        <div className="text-[15px] font-bold text-[#111827]">Asset Classification Details</div>
        <Info className="h-5 w-5 text-[#9CA3AF]" />
      </div>

      <div className="border-b border-[#EEF1F6] px-6 py-6">
        {createError && (
          <div className="mb-4 rounded-[8px] bg-rose-50 p-3 text-[13px] font-bold text-rose-600">
            {createError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">
              Asset Class Name <span className="text-[#EF4444]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
              placeholder="e.g. Electronic Equipment"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">Category Mapping</label>
            <div className="relative">
              <select
                disabled
                aria-label="Category mapping"
                className="flex h-11 w-full appearance-none items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[14px] font-medium text-[#9CA3AF] opacity-60 shadow-sm outline-none"
              >
                <option>Select a category...</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="px-6 py-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="rounded border border-[#DBEAFE] bg-[#EFF6FF] p-1.5">
            <FileSpreadsheet className="h-4 w-4 text-[#3B5BDB]" />
          </div>
          <h2 className="text-[15px] font-bold text-[#111827]">Depreciation &amp; Valuation</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">
              Default Depreciation Method <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                aria-label="Default depreciation method"
                className="flex h-11 w-full appearance-none items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#111827] shadow-sm outline-none transition-colors hover:bg-[#F9FAFB]"
              >
                <option value="straight_line">Straight Line</option>
                <option value="declining_balance">Declining Balance</option>
                <option value="units_of_production">Units of Production</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">Useful Life</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={usefulLife}
                onChange={(e) => setUsefulLife(e.target.value)}
                className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] pr-14 text-[14px] font-bold text-[#6B7280] shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#3B5BDB]">
                Years
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#374151]">Salvage Value</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                value={salvageValue}
                onChange={(e) => setSalvageValue(e.target.value)}
                className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] pr-10 text-[14px] font-bold text-[#6B7280] shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#3B5BDB]">
                %
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[12px] font-medium italic text-[#9CA3AF]">
          Note: Monetary calculations will be processed in Naira (₦) based on the asset acquisition
          value.
        </p>

        <div className="mt-8 flex items-center justify-between rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#3B5BDB] shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#111827]">
                Enable Automated Depreciation Recognition
              </div>
              <div className="mt-0.5 text-[13px] font-medium text-[#6B7280]">
                Automatically post depreciation journals at month-end based on the configuration above.
              </div>
            </div>
          </div>
          <Switch
            checked={automated}
            onCheckedChange={setAutomated}
            className="data-[state=unchecked]:bg-[#E5E7EB]"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-6 border-t border-[#EEF1F6] px-6 py-5">
        <button
          type="button"
          onClick={handleClose}
          className="border-none bg-transparent text-[14px] font-bold text-[#6B7280] outline-none transition-colors hover:text-[#374151]"
        >
          Cancel
        </button>
        <Button
          onClick={handleSave}
          disabled={isCreating || !name.trim()}
          className="flex h-11 items-center gap-2 rounded-[8px] bg-[#2E90FA] px-6 text-[14px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#1570EF] disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {isCreating ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </ModalShell>
  )
}
