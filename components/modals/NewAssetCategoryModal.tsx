"use client"

import React, { useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { useAssetClasses } from "@/components/hooks/useAssetClasses"

type NewAssetCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function NewAssetCategoryModal({ isOpen, onClose }: NewAssetCategoryModalProps) {
  const [name, setName] = useState("")
  const [method, setMethod] = useState<"straight_line" | "declining_balance">("straight_line")
  const [usefulLife, setUsefulLife] = useState("")
  const [residualValue, setResidualValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const { createAssetClass, isCreating, createError } = useAssetClasses()

  if (!isOpen) return null

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setValidationError("Asset class name is required.")
      return
    }

    const payload: {
      name: string
      defaultDepreciationMethod?: "straight_line" | "declining_balance"
      defaultUsefulLifeYears?: number
      defaultResidualValuePercent?: number
    } = {
      name: trimmedName,
      defaultDepreciationMethod: method,
    }

    if (usefulLife.trim() !== "") {
      const parsedUsefulLife = Number(usefulLife)
      if (!Number.isFinite(parsedUsefulLife) || parsedUsefulLife < 1) {
        setValidationError("Useful life must be at least 1 year when provided.")
        return
      }
      payload.defaultUsefulLifeYears = parsedUsefulLife
    }

    if (residualValue.trim() !== "") {
      const parsedResidual = Number(residualValue)
      if (!Number.isFinite(parsedResidual) || parsedResidual < 0 || parsedResidual > 100) {
        setValidationError("Residual value must be between 0 and 100.")
        return
      }
      payload.defaultResidualValuePercent = parsedResidual
    }

    try {
      setValidationError(null)
      await createAssetClass(payload)

      // Clear form and close modal (which routes back to the page without the query param)
      setName("")
      setMethod("straight_line")
      setUsefulLife("")
      setResidualValue("")
      setValidationError(null)
      onClose()
    } catch {
      // Error handled by hook and shown below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-[400px] rounded-[12px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-3">
          <h2 className="text-[16px] font-bold text-[#111827]">Add New Asset Category</h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          {(validationError || createError) && (
            <div className="mb-4 text-[12px] font-medium text-rose-600 bg-rose-50 p-2.5 rounded-[6px]">
              {validationError || createError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Asset Class Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=".e.g. Generators"
                className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Depreciation method</label>
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "straight_line" | "declining_balance")}
                  className="w-full appearance-none rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] bg-white"
                >
                  <option value="straight_line">Straight Line</option>
                  <option value="declining_balance">Declining Balance</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-[#667085]" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Useful Life (yrs)</label>
                <input
                  type="number"
                  min="1"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  placeholder=".e.g. 5"
                  className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                />
              </div>
              <div className="w-1/2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Residual Values %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={residualValue}
                  onChange={(e) => setResidualValue(e.target.value)}
                  placeholder=".e.g. 10"
                  className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-[#EEF1F6]">
          <button
            onClick={onClose}
            className="rounded-[6px] px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isCreating || !name.trim()}
            className="flex items-center justify-center min-w-[120px] rounded-[6px] bg-[#3B5BDB] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#2f4cc2] transition-colors disabled:opacity-70"
          >
            {isCreating ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  )
}
