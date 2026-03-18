"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  ChevronDown,
  Info,
  RefreshCw,
  Save,
  Coins,
  FileSpreadsheet
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <div className="mx-auto w-[1184px] max-w-full h-[852px] px-6 pt-16 pb-12">
        {/* Header Section Out of Card */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-[32px] leading-[40px] font-bold tracking-[-0.8px] text-[#111827]">
              Add New Asset Class Config
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#6B7280]">
              Configure global parameters for new asset categories.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-2 border border-[#DBEAFE] text-[12px] font-bold text-[#3B5BDB] shadow-sm">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
              <img src="/images/base%20curr%20icon.svg" alt="Currency icon representing Nigerian Naira base currency setting" className="h-3 w-3" />
            </span>
            Base Currency: Naira (₦)
          </div>
        </div>

        {/* Main Card Container */}
        <div className="w-full rounded-[12px] border border-[#EEF1F6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
          
          {/* Section 1 */}
          <div className="flex items-center justify-between border-b border-[#EEF1F6] px-8 py-5 bg-white">
            <div className="text-[16px] font-bold text-[#111827]">Asset Classification Details</div>
            <div className="p-1 rounded-full bg-transparent">
              <Info className="h-5 w-5 text-[#9CA3AF]" />
            </div>
          </div>

          <div className="px-8 py-8 border-b border-[#EEF1F6] bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">
                  Asset Class Name <span className="text-[#EF4444]">*</span>
                </label>
                <Input
                  className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] placeholder:text-[#9CA3AF] shadow-sm"
                  placeholder="e.g. Electronic Equipment"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">Category Mapping</label>
                <button className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 shadow-sm hover:bg-[#F3F4F6] transition-colors text-[14px] text-[#9CA3AF] font-medium">
                  Select a category...
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="px-8 py-8 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#EFF6FF] rounded px-1.5 py-1.5 border border-[#DBEAFE]">
                <FileSpreadsheet className="h-4 w-4 text-[#3B5BDB]" />
              </div>
              <h2 className="text-[15px] font-bold text-[#111827]">Depreciation & Valuation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">
                  Default Depreciation Method <span className="text-[#EF4444]">*</span>
                </label>
                <button className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-3 shadow-sm hover:bg-[#F9FAFB] transition-colors text-[14px] text-[#111827] font-medium">
                  Straight Line
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">Useful Life</label>
                <div className="relative">
                  <Input 
                    className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] font-bold text-[#6B7280] shadow-sm pr-14" 
                    defaultValue="0" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#3B5BDB]">Years</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#374151]">Salvage Value</label>
                <div className="relative">
                  <Input 
                    className="h-11 rounded-[8px] border-[#E5E7EB] bg-[#F9FAFB] text-[14px] font-bold text-[#6B7280] shadow-sm pr-10" 
                    defaultValue="0.0" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#3B5BDB]">%</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] font-medium italic text-[#9CA3AF]">
              Note: Monetary calculations will be processed in Naira (â‚¦) based on the asset acquisition value.
            </p>

            <div className="mt-10 flex items-center justify-between rounded-[12px] border border-[#DBEAFE] bg-[#F0F7FF] p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#3B5BDB] shadow-sm">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#111827]">Enable Automated Depreciation Recognition</div>
                  <div className="text-[13px] text-[#6B7280] font-medium mt-0.5">
                    Automatically post depreciation journals at month-end based on the configuration above.
                  </div>
                </div>
              </div>
              {/* Forced OFF state style for the toggle to match Figma */}
              <Switch checked={false} className="data-[state=unchecked]:bg-[#E5E7EB]" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 border-t border-[#EEF1F6] bg-white px-8 py-6">
            <button className="text-[14px] font-bold text-[#6B7280] hover:text-[#374151] transition-colors outline-none bg-transparent border-none">
              Cancel
            </button>
            <Button className="h-11 px-6 rounded-[8px] bg-[#2E90FA] hover:bg-[#1570EF] text-[14px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-2 transition-colors">
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

