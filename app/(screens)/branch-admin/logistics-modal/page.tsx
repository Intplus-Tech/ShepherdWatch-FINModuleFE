"use client"

import React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import LogisticsRepairsPage from "../logistics-repair/page"
import {
  X,
  Building2,
  ChevronDown,
  Wrench,
  Info
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function LogisticsModalPage() {
  return (
    <div className={`relative w-full min-h-[100dvh] bg-white ${inter.className}`}>
      
      {/* Blurred Background */}
      <div className="h-[100dvh] w-full overflow-hidden pointer-events-none filter blur-[3px]">
        <LogisticsRepairsPage />
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#111827]/40 backdrop-blur-[2px]">
        
        {/* Modal Container */}
        <div className="bg-white rounded-[16px] shadow-2xl w-[95%] sm:w-full max-w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#E5E7EB]/50">
          
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-[#EEF1F6]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <Wrench className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <h2 
                className="text-[#111827]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "16.01px",
                  lineHeight: "24.9px",
                  letterSpacing: "0%",
                  verticalAlign: "middle"
                }}
              >
                Schedule Maintenance
              </h2>
            </div>
            <Link href="/branch-admin/logistics-repair" className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#9CA3AF] hover:text-[#4B5563]">
              <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 flex flex-col gap-4">
            
            {/* Info Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#DBEAFE] mt-0.5 sm:mt-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#2563EB]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[12px] sm:text-[13.5px] font-[800] text-[#1E3A8A] leading-tight">
                  Asset: Hilux Ute - Maint Due: 15 Oct, 2023
                </div>
                <div className="text-[10.5px] sm:text-[12px] font-[500] text-[#3B82F6] leading-snug">
                  Regular maintenance helps extend asset lifespan.
                </div>
              </div>
            </div>

            {/* Grid Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Maintenance Type</label>
                <div className="relative">
                  <select className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 pr-8 sm:pr-10 text-[12px] sm:text-[14px] font-[500] text-[#111827] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm appearance-none cursor-pointer">
                    <option value="routine" selected>Routine Check</option>
                    <option value="repair">Emergency Repair</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Scheduled Date</label>
                <div className="relative">
                  <select className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 pr-8 sm:pr-10 text-[12px] sm:text-[14px] font-[500] text-[#111827] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm appearance-none cursor-pointer">
                    <option value="30" selected>Every 30 Days</option>
                    <option value="60">Every 60 Days</option>
                    <option value="90">Every 90 Days</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Service Provider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Service Provider / Vendor</label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-2.5 sm:left-3.5 h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-[#9CA3AF]" strokeWidth={2} />
                <input 
                  type="text" 
                  placeholder="e.g. Excellence Auto Services Ltd." 
                  className="h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white pl-[30px] sm:pl-[38px] pr-3 sm:pr-4 text-[12px] sm:text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] focus-visible:border-[#2563EB] focus-visible:ring-1 focus-visible:ring-[#2563EB]/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] sm:text-[13px] font-[700] text-[#4B5563]">Estimated Cost</label>
              <div className="relative flex items-center h-[38px] sm:h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 sm:px-3.5 shadow-sm focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20 transition-all">
                <span className="text-[13px] sm:text-[15px] font-[700] text-[#9CA3AF] mr-1">₦</span>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  className="h-full w-full bg-transparent text-[12px] sm:text-[14px] font-[500] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                />
              </div>
              <div className="text-[10px] sm:text-[11.5px] font-[500] text-[#9CA3AF] mt-0.5">
                Leave blank if cost is pending from vendor.
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#EEF1F6] my-0.5 sm:my-1"></div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col pr-2 sm:pr-4">
                <div className="text-[11.5px] sm:text-[13.5px] font-[800] text-[#111827] leading-tight mb-0.5">Create Payment Requisition</div>
                <div className="text-[10px] sm:text-[12px] font-[500] text-[#6B7280] leading-snug">Notify admin to approve & release funds</div>
              </div>
              <label className="relative inline-flex items-center justify-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-4.5 sm:w-11 sm:h-6 bg-[#E5E7EB] rounded-full peer peer-checked:bg-[#2563EB] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-sm border border-transparent peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2563EB]/30"></div>
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-5 sm:px-6 sm:py-4 bg-[#F9FAFB] border-t border-[#EEF1F6] flex items-center justify-end gap-2.5 sm:gap-3 mt-auto">
            <Link href="/branch-admin/logistics-repair" className="w-[110px] sm:w-auto h-[36px] sm:h-[40px] px-3 sm:px-6 rounded-[8px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[11.5px] sm:text-[13.5px] font-[800] text-[#4B5563] hover:bg-gray-50 transition-colors shadow-sm">
              Cancel
            </Link>
            <button className="flex-1 sm:flex-none h-[36px] sm:h-[40px] px-3 sm:px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center text-[11.5px] sm:text-[13.5px] font-[800] text-white transition-colors shadow-sm">
              Confirm Schedule
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}


