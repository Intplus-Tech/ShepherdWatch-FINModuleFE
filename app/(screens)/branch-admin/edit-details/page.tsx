"use client";

import React from "react";
import { Inter } from "next/font/google";
import { X, Info, Settings, Calendar, ChevronDown, CheckCircle2, Edit } from "lucide-react";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

export default function EditAssetDetailsModalPage() {
  return (
    <div className={`relative min-h-[100dvh] w-full ${inter.className} antialiased`}>
      {/* Blurred Background Page */}
      <div className="fixed inset-0 z-0 h-full w-full overflow-hidden blur-[4px] opacity-60 pointer-events-none select-none">
        <AssetsHubPage />
      </div>

      {/* Modal Overlay Context */}
      <div className="fixed inset-0 z-40 bg-[#111827]/50 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto">
        
        {/* Modal Container */}
        <div 
          className="bg-white w-full max-w-[750px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto scrollbar-hide" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 flex items-start justify-between border-b border-[#EEF1F6]">
            <div className="flex items-start gap-4">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5 text-[#2563EB] stroke-[2px]" />
              </div>
              <div className="flex flex-col gap-1 pt-0.5">
                <h2 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] leading-tight tracking-tight">Edit Asset Details</h2>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  ID: #EQ-2041 • Dell OptiPlex 7090
                </p>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col gap-10 overflow-y-auto max-h-[70vh] no-scrollbar">
            
            {/* General Information Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F5F9]">
                <Info className="w-4 h-4 text-[#2563EB] stroke-[2.5px]" />
                <h3 className="text-[#111827] text-[12px] font-[800] uppercase tracking-widest">General Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                
                {/* Asset Name (Full Width) */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Asset Name</label>
                  <input 
                    type="text" 
                    defaultValue="Dell OptiPlex 7090"
                    className="h-[44px] w-full px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Category</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none appearance-none cursor-pointer">
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Vehicles">Vehicles</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>

                {/* Serial Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Serial Number</label>
                  <input 
                    type="text" 
                    defaultValue="CN-0W7N89-70163"
                    className="h-[44px] w-full px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Purchase Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Purchase Date</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all group">
                    <input 
                      type="text" 
                      defaultValue="08/15/2021"
                      className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none cursor-text placeholder:text-[#9CA3AF]" 
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#64748B] stroke-[2px]" />
                    </div>
                  </div>
                </div>

                {/* Current Condition */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Current Condition</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none appearance-none cursor-pointer">
                      <option value="Fair">Fair</option>
                      <option value="Good">Good</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Requires Repair">Requires Repair</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>

                {/* Current Location (Full Width) */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Current Location</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none appearance-none cursor-pointer">
                      <option value="Main Office - Desk 4">Main Office - Desk 4</option>
                      <option value="Storage A">Storage A</option>
                      <option value="Repair Center">Repair Center</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* Technical Specifications Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F5F9]">
                <Settings className="w-4 h-4 text-[#2563EB] stroke-[2.5px]" />
                <h3 className="text-[#111827] text-[12px] font-[800] uppercase tracking-widest">Technical Specifications</h3>
              </div>
              
              <div className="flex flex-col w-full">
                <textarea 
                  defaultValue={`Intel Core i7-10700 (8-Core, 16MB Cache)\n16GB DDR4 RAM 2933MHz\n512GB PCIe NVMe Class 40 SSD\nWindows 10 Pro (Includes Win 11 License)`}
                  rows={5}
                  className="w-full p-4 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[13.5px] font-[500] leading-relaxed outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all resize-none"
                />
              </div>
            </div>

          </div>

          {/* Footer Navigation Bar */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#EEF1F6] bg-white flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
            <button className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              Discard Changes
            </button>
            <button className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2 text-white text-[14px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm w-full sm:w-auto">
              <CheckCircle2 className="w-[18px] h-[18px] stroke-[2.5px]" />
              Update Asset
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
