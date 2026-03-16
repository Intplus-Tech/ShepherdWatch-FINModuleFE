"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  Info,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[820px] rounded-[14px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="border-b border-[#EEF1F6] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-semibold text-[#111827]">Add New Asset Class Config</h1>
              <p className="text-[10px] text-[#9CA3AF]">Configure global parameters for new asset categories.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-[8px] border-[#DBEAFE] bg-[#EFF6FF] text-[9px] text-[#3B5BDB]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Base Currency: Naira (?)
            </Button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="rounded-[12px] border border-[#EEF1F6] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold text-[#111827]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#3B5BDB]" />
                Asset Classification Details
              </div>
              <Info className="h-4 w-4 text-[#9CA3AF]" />
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-[9px] font-medium text-[#6B7280]">Asset Class Name *</div>
                <Input className="h-7 rounded-[8px] border-[#E5E7EB] text-[9px]" placeholder="e.g., Electronic Equipment" />
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-medium text-[#6B7280]">Category Mapping</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                >
                  Select a category...
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="border-t border-[#EEF1F6] px-4 py-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]">
                <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                Depreciation &amp; Valuation
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Default Depreciation Method *</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-full justify-between rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
                  >
                    Straight Line
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Useful Life</div>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 rounded-[8px] border-[#E5E7EB] text-[9px]" value="0" readOnly />
                    <span className="text-[9px] text-[#9CA3AF]">Years</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-medium text-[#6B7280]">Salvage Value</div>
                  <div className="flex items-center gap-2">
                    <Input className="h-7 w-16 rounded-[8px] border-[#E5E7EB] text-[9px]" value="0.0" readOnly />
                    <span className="text-[9px] text-[#9CA3AF]">%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[8px] text-[#9CA3AF]">
                Note: Monetary calculations will be processed in Naira (?) based on the asset acquisition value.
              </div>
            </div>

            <div className="border-t border-[#EEF1F6] px-4 py-4">
              <div className="flex items-center justify-between rounded-[10px] border border-[#DBEAFE] bg-[#F0F7FF] px-3 py-2">
                <div className="flex items-center gap-2 text-[9px] text-[#1E3A8A]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Enable Automated Depreciation Recognition
                </div>
                <div className="h-4 w-8 rounded-full bg-[#E5E7EB] px-0.5 flex items-center">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
              </div>
              <div className="mt-1 text-[8px] text-[#9CA3AF]">
                Automatically post depreciation journals at month-end based on the configuration above.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#EEF1F6] px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]"
              >
                Cancel
              </Button>
              <Button size="sm" className="h-7 rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                <Plus className="h-3.5 w-3.5" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
