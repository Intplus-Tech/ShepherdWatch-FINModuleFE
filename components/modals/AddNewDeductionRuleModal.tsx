"use client"

import React, { useState } from "react"
import { X, ChevronDown } from "lucide-react"

type AddNewDeductionRuleModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AddNewDeductionRuleModal({ isOpen, onClose }: AddNewDeductionRuleModalProps) {
  const [deductionName, setDeductionName] = useState("")
  const [branchType, setBranchType] = useState("Pioneer")
  const [percentage, setPercentage] = useState("")
  const [basedOn, setBasedOn] = useState<"Income" | "Net Surplus">("Income")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-[480px] rounded-[12px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF1F6] px-5 py-4">
          <h2 className="text-[16px] font-bold text-[#111827]">Add New Deduction Rule</h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Deduction Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#374151]">Deduction Name:</label>
            <input
              type="text"
              value={deductionName}
              onChange={(e) => setDeductionName(e.target.value)}
              className="w-full h-10 rounded-[6px] border border-[#D1D5DB] px-3 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
            />
          </div>

          {/* Apply to Branch Type */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#374151]">Apply to Branch Type:</label>
            <div className="relative">
              <select
                value={branchType}
                onChange={(e) => setBranchType(e.target.value)}
                className="w-full h-10 appearance-none rounded-[6px] border border-[#D1D5DB] px-3 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] bg-white"
              >
                <option value="Pioneer">Pioneer</option>
                <option value="Established">Established</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              </div>
            </div>
          </div>

          {/* Percentage (%) */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#374151]">Percentage (%):</label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-24 h-10 rounded-[6px] border border-[#D1D5DB] px-3 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
            />
          </div>

          {/* Based on */}
          <div className="space-y-2 pt-1">
            <label className="text-[13px] font-medium text-[#374151]">Based on:</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="basedOn"
                  value="Income"
                  checked={basedOn === "Income"}
                  onChange={() => setBasedOn("Income")}
                  className="w-4 h-4 text-[#3B5BDB] border-[#D1D5DB] focus:ring-[#3B5BDB]"
                />
                <span className="text-[13px] text-[#111827]">Income</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="basedOn"
                  value="Net Surplus"
                  checked={basedOn === "Net Surplus"}
                  onChange={() => setBasedOn("Net Surplus")}
                  className="w-4 h-4 text-[#3B5BDB] border-[#D1D5DB] focus:ring-[#3B5BDB]"
                />
                <span className="text-[13px] text-[#111827]">Net Surplus</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#EEF1F6]">
          <button
            onClick={onClose}
            className="rounded-[6px] px-4 py-2 text-[13px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            className="rounded-[6px] bg-[#111827] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#1f2937] transition-colors"
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  )
}
