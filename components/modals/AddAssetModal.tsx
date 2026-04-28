"use client"

import React, { useState } from "react"
import { X, ChevronDown, CloudUpload, Calendar } from "lucide-react"

type AddAssetModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [assetType, setAssetType] = useState("")
  const [category, setCategory] = useState("")
  const [name, setName] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [specifications, setSpecifications] = useState("")
  const [responsible, setResponsible] = useState("")
  const [acquisitionDate, setAcquisitionDate] = useState("")
  const [cost, setCost] = useState("")
  const [condition, setCondition] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-[560px] rounded-[12px] bg-white shadow-xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">Add New Asset</h2>
            <p className="text-[12px] text-[#6B7280] mt-1">Enter details for the new inventory item.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-2 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="flex gap-4">
              <div className="w-1/2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Asset Type</label>
                <div className="relative">
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full appearance-none rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] bg-white"
                  >
                    <option value="" disabled hidden>Current Asset (Cash/Supplies)</option>
                    <option value="current">Current Asset (Cash/Supplies)</option>
                    <option value="non_current">Non-Current Asset</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-[#667085]" />
                  </div>
                </div>
              </div>
              <div className="w-1/2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] bg-white"
                  >
                    <option value="" disabled hidden>Select Category...</option>
                    <option value="equipment">Equipment</option>
                    <option value="furniture">Furniture</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-[#667085]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Asset Name / Description</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MacBook Pro 16-inch M2"
                className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 4 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Technical Specifications</label>
              <textarea
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full min-h-[80px] rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] resize-y"
              />
            </div>

            {/* Row 5 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Responsible</label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="who is responsible for this asset"
                className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Acquisition Date</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 pr-10 text-[13px] text-[#111827] placeholder:text-[#98A2B3] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB]"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-[#667085]" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Cost (₦)</label>
                <div className="relative bg-[#F9FAFB] rounded-[6px] border border-[#D0D5DD] overflow-hidden flex items-center">
                   <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-transparent px-3.5 py-2.5 text-[13px] text-[#111827] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#344054]">Initial Condition</label>
                <div className="relative">
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full appearance-none rounded-[6px] border border-[#D0D5DD] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#3B5BDB] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] bg-white"
                  >
                    <option value="" disabled hidden>Brand New</option>
                    <option value="brand_new">Brand New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-[#667085]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 7 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#344054]">Receipt / Proof of Purchase</label>
              <div className="mt-1 flex justify-center rounded-[8px] border border-dashed border-[#BFC7FF] bg-[#F8F9FE] px-6 py-8 hover:bg-[#F3F5FD] transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF2FF] mb-3">
                     <CloudUpload className="h-5 w-5 text-[#3B5BDB]" />
                  </div>
                  <div className="mt-2 flex text-[13px] justify-center text-[#6B7280]">
                    <span className="relative cursor-pointer rounded-md font-medium text-[#3B5BDB] hover:text-[#2f4cc2] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#3B5BDB] focus-within:ring-offset-2">
                      <span>Click to upload</span>
                    </span>
                    <p className="pl-1 text-[#6B7280]">or drag and drop</p>
                  </div>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 mt-2">
          <button
            onClick={onClose}
            className="rounded-[6px] px-4 py-2.5 text-[13px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            className="flex items-center justify-center rounded-[6px] bg-[#3B5BDB] px-6 py-2.5 text-[13px] font-medium text-white shadow-sm hover:bg-[#2f4cc2] transition-colors"
          >
            Save Asset
          </button>
        </div>
      </div>
    </div>
  )
}
