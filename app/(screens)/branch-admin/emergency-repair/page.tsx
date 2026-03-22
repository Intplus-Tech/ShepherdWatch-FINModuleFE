"use client";

import React from "react";
import { Inter } from "next/font/google";
import { X, TriangleAlert, ChevronDown, Camera, Banknote } from "lucide-react";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

export default function EmergencyRepairModalPage() {
  return (
    <div className={`relative min-h-[100dvh] w-full ${inter.className} antialiased`}>
      {/* Blurred Background Page */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden blur-[4px] opacity-60 pointer-events-none select-none">
        <AssetsHubPage />
      </div>

      {/* Modal Overlay Context */}
      <div className="fixed inset-0 z-40 bg-[#111827]/50 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
        
        {/* Modal Container */}
        <div 
          className="bg-white w-full sm:w-[560px] rounded-[16px] sm:rounded-[20px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header */}
          <div className="px-6 sm:px-7 py-5 sm:py-6 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[#111827] text-[18px] sm:text-[20px] font-[800] leading-tight tracking-tight">Initiate Asset Repair Workflow</h2>
              <div className="text-[13px] sm:text-[14px]">
                <span className="text-[#6B7280] font-[500]">For Asset: </span>
                <span className="text-[#2563EB] font-[600] cursor-pointer hover:underline">FN-3022 - Reception Sofa Set</span>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col gap-5 sm:gap-6 overflow-y-auto max-h-[80vh] sm:max-h-none no-scrollbar">
            
            {/* Alert Banner Card */}
            <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-[10px] p-4 flex items-start gap-3.5">
              <div className="pt-0.5 shrink-0">
                <TriangleAlert className="h-5 w-5 text-[#EA580C] stroke-[2.5px]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#C2410C] text-[14px] sm:text-[14.5px] font-[800] tracking-tight">Requires Immediate Action</span>
                <span className="text-[#C2410C] text-[13px] sm:text-[13.5px] font-[500] leading-snug">
                  This asset is flagged as &apos;Requires Repair&apos;. Initiating this workflow will create a funding requisition.
                </span>
              </div>
            </div>

            {/* Urgency Level Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#374151] text-[13px] sm:text-[13.5px] font-[700]">Urgency Level</label>
              <div className="relative flex items-center h-[44px] sm:h-[48px] w-full rounded-[8px] border border-[#D1D5DB] bg-white overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] sm:text-[15px] font-[500] pl-3.5 pr-10 outline-none appearance-none cursor-pointer">
                  <option value="high">High - Critical functionality impaired</option>
                  <option value="medium">Medium - Partially functional</option>
                  <option value="low">Low - Cosmetic damage minor issue</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>

            {/* Problem Description Textarea */}
            <div className="flex flex-col gap-1.5 mt-0.5">
              <label className="text-[#374151] text-[13px] sm:text-[13.5px] font-[700]">Problem Description</label>
              <textarea 
                placeholder="Describe the damage or issue in detail..." 
                className="w-full rounded-[8px] border border-[#D1D5DB] bg-white p-3.5 text-[14px] sm:text-[15px] text-[#111827] placeholder:text-[#9CA3AF] font-[500] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all min-h-[100px] sm:min-h-[130px] resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* Photo Upload Box */}
            <div className="flex flex-col gap-1.5 mt-0.5">
              <label className="text-[#374151] text-[13px] sm:text-[13.5px] font-[700] mb-0.5">Upload Photo of Damage</label>
              <div className="border border-dashed border-[#CBD5E1] rounded-[10px] flex flex-col items-center justify-center py-7 sm:py-8 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer group">
                <Camera className="h-7 w-7 sm:h-8 sm:w-8 text-[#9CA3AF] mb-3 group-hover:text-[#6B7280] transition-colors stroke-[2px]" />
                <div className="text-[#4B5563] text-[14.5px] font-[500]"><span className="text-[#2563EB] font-[700]">Upload a file</span> or drag and drop</div>
                <div className="text-[#9CA3AF] text-[12px] sm:text-[12.5px] font-[500] mt-1 track-wide">PNG, JPG, GIF up to 5MB</div>
              </div>
            </div>

          </div>

          {/* Footer Divider & Buttons */}
          <div className="px-6 sm:px-7 py-4 sm:py-5 border-t border-[#EEF1F6] bg-[#F8FAFC] flex flex-col sm:flex-row justify-end gap-3 rounded-b-[16px] sm:rounded-b-[20px]">
            <button className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              Cancel
            </button>
            <button className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[14.5px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
              <Banknote className="h-4.5 w-4.5 stroke-[2.5px]" />
              Proceed to Requisition (₦)
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
