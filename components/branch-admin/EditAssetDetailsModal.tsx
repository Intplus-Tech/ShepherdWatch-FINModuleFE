"use client"

import { useState } from "react"
import { ModalShell } from "@/components/ui/modal-shell"
import { ChevronDown, FileText, Info, Save, SquarePen, X } from "lucide-react"

const inputClass =
  "h-11 w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[14px] font-medium text-[#111827] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[11px] font-[800] uppercase tracking-wide text-[#6B7280]">{children}</label>
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  )
}

export default function EditAssetDetailsModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState("Dell OptiPlex 7090")
  const [category, setCategory] = useState("IT Equipment")
  const [serial, setSerial] = useState("CN-0W7N89-70163")
  const [purchaseDate, setPurchaseDate] = useState("2021-08-15")
  const [condition, setCondition] = useState("Fair")
  const [location, setLocation] = useState("Main Office - Desk 4")
  const [specs, setSpecs] = useState(
    "Intel Core i7-10700 (8-Core, 16MB Cache)\n16GB DDR4 RAM 2933MHz\n512GB PCIe NVMe Class 40 SSD\nWindows 10 Pro (Includes Win 11 License)"
  )

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EEF2FF] text-[#2563EB]">
            <SquarePen className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-[17px] font-[900] text-[#111827]">Edit Asset Details</h2>
            <p className="text-[12px] font-medium text-[#9CA3AF]">ID: #EQ-2041 • Dell OptiPlex 7090</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        <div className="mb-4 flex items-center gap-2 text-[12px] font-[800] uppercase tracking-wide text-[#2563EB]">
          <Info className="h-4 w-4" /> General Information
        </div>

        <div className="space-y-5">
          <div>
            <Label>Asset Name</Label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select
                value={category}
                onChange={setCategory}
                options={["IT Equipment", "Furniture", "Vehicle", "Equipment", "Supplies", "Power Plant"]}
              />
            </div>
            <div>
              <Label>Serial Number</Label>
              <input value={serial} onChange={(e) => setSerial(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Purchase Date</Label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label>Current Condition</Label>
              <Select value={condition} onChange={setCondition} options={["Brand New", "Excellent", "Good", "Fair", "Requires Repair"]} />
            </div>
          </div>

          <div>
            <Label>Current Location</Label>
            <Select
              value={location}
              onChange={setLocation}
              options={["Main Office - Desk 4", "Front Desk", "Storage A", "Storage B", "Main Hall", "Power House"]}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] font-[800] uppercase tracking-wide text-[#2563EB]">
              <FileText className="h-4 w-4" /> Technical Specifications
            </div>
            <textarea
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              rows={4}
              className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#111827] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[8px] border border-[#E5E7EB] bg-white px-5 py-2.5 text-[13px] font-[700] text-[#4B5563] hover:bg-gray-50"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#2563EB] px-5 py-2.5 text-[13px] font-[700] text-white shadow-sm hover:bg-[#1D4ED8]"
        >
          <Save className="h-4 w-4" />
          Update Asset
        </button>
      </div>
    </ModalShell>
  )
}
