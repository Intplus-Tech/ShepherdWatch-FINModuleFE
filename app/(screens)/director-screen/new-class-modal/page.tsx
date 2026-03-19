"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  FolderKanban,
  Info,
  Plus,
  X,
} from "lucide-react"

const labelText = "text-[12.74px] leading-[16.98px] font-semibold"
const helperText = "text-[11.68px] leading-[14.6px] font-normal"
const fieldText = "text-[12.74px] leading-[16.98px]"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6">
        <div className="w-full max-w-[520px] rounded-[12px] border border-[#E5E7EB] bg-white shadow-md">
          <div className="flex items-start justify-between border-b border-[#EEF1F6] px-5 py-4">
            <div>
              <div className="text-[16.98px] leading-[25.48px] font-bold text-[#111827]">
                Add New Asset Class Config
              </div>
              <div className="text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                Configure global parameters for new asset categories.
              </div>
            </div>
            <button className="text-[#9CA3AF]">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className={`${labelText} text-[#111827]`}>Asset Classification Details</div>
              <button className="flex items-center gap-2 text-[11.68px] leading-[14.6px] font-semibold text-[#3B5BDB]">
                <FolderKanban className="h-4 w-4" />
                View Category Data
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className={`${labelText} text-[#6B7280]`}>Asset Class Name *</label>
                <Input
                  className={`${fieldText} h-8 rounded-[10px] border-[#E5E7EB]`}
                  placeholder="e.g. Electronic Equipment"
                />
              </div>
              <div className="space-y-1">
                <label className={`${labelText} text-[#6B7280]`}>Category Mapping</label>
                <button className={`${fieldText} flex h-8 w-full items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[#9CA3AF]`}>
                  Select a category...
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-4">
              <div className="flex items-center gap-2 text-[12.74px] leading-[16.98px] font-semibold text-[#111827]">
                <Info className="h-4 w-4 text-[#3B5BDB]" />
                Depreciation &amp; Valuation
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <label className={`${labelText} text-[#6B7280]`}>Depreciation Method</label>
                  <button className={`${fieldText} flex h-8 w-full items-center justify-between rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[#6B7280]`}>
                    Straight Line
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <label className={`${labelText} text-[#6B7280]`}>Useful Life</label>
                  <Input className={`${fieldText} h-8 rounded-[10px] border-[#E5E7EB]`} value="5" readOnly />
                </div>
                <div className="space-y-1">
                  <label className={`${labelText} text-[#6B7280]`}>Salvage Value</label>
                  <Input className={`${fieldText} h-8 rounded-[10px] border-[#E5E7EB]`} value="0.0" readOnly />
                </div>
              </div>

              <div className="mt-2 text-[11.68px] leading-[14.6px] text-[#9CA3AF]">
                Note: Monetary calculations will be processed in NGN based on current acquisition values.
              </div>
            </div>

            <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3B5BDB]">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className={`${labelText} text-[#111827]`}>Enable Automated Depreciation Recognition</div>
                  <div className={`${helperText} text-[#9CA3AF]`}>
                    Automatically post depreciation journals at month-end based on the configuration above.
                  </div>
                </div>
                <Switch defaultChecked className="mt-1 data-[state=checked]:bg-[#3B5BDB]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-5 py-4">
            <Button variant="outline" className="h-8 rounded-[10px] border-[#E5E7EB] bg-white text-[12.74px] leading-[16.98px] text-[#6B7280]">
              Cancel
            </Button>
            <Button className="h-8 rounded-[10px] bg-[#3B5BDB] text-[12.74px] leading-[16.98px] text-white">
              Save Configuration
            </Button>
          </div>
        </div>
    </div>
     </div>
  )
}
