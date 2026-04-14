"use client";

import React, { useState } from "react";
import { Inter } from "next/font/google";
import { X, Printer, CloudUpload, ChevronDown, Check } from "lucide-react";
import AssetsHubPage from "../asset/page";
import FileUploadDropzone from "@/components/ui/FileUploadDropzone";

const inter = Inter({ subsets: ["latin"] });

export default function UpdateStockModalPage() {
  const [linkRequisition, setLinkRequisition] = useState(true);

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
          className="bg-white w-full sm:w-[560px] rounded-[14.23px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.1), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header */}
          <div className="px-6 sm:px-7 py-5 sm:py-6 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#111827] text-[18px] sm:text-[20px] font-[800] leading-tight tracking-tight">Update Stock Level</h2>
              <p className="text-[#6B7280] text-[13px] sm:text-[14px] font-[500]">Manage inventory quantities and costs</p>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col gap-5 sm:gap-6">
            
            {/* Asset Info Card */}
            <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-4 flex items-center gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[8px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Printer className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2px]" />
              </div>
              <div className="flex flex-col flex-1 gap-0.5">
                <div className="text-[#111827] text-[15px] sm:text-[16px] font-[800] tracking-tight">Printer Paper Stock (A4)</div>
                <div className="text-[#6B7280] text-[13.5px] font-[500] leading-snug">
                  Current Stock: <span className="font-[800] text-[#111827]">24 Reams</span>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-[6px] text-[#6B7280] text-[11.5px] font-[700] tracking-wide shrink-0">
                AS-1045
              </div>
            </div>

            {/* Quantity Inputs */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#374151] text-[13px] font-[700]">Quantity Added</label>
                <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all transition-shadow">
                  <input 
                    type="text" 
                    placeholder="0" 
                    className="flex-1 h-full w-full bg-transparent px-3.5 text-[#111827] text-[15px] font-[500] placeholder:text-[#9CA3AF] outline-none"
                  />
                  <div className="h-full pr-4 flex items-center justify-center text-[#9CA3AF] text-[13px] font-[500] shrink-0 bg-transparent">
                    units
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[#374151] text-[13px] font-[700]">New Total Stock</label>
                <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden">
                  <input 
                    type="text" 
                    value="24" 
                    readOnly
                    className="flex-1 h-full w-full bg-transparent px-3.5 text-[#6B7280] text-[15px] font-[500] outline-none cursor-default"
                  />
                </div>
              </div>

            </div>

            {/* File Upload Area */}
            <div className="flex flex-col gap-1.5 mt-1 sm:mt-0">
              <label className="text-[#374151] text-[13px] font-[700] mb-0.5">Attach Invoice/Receipt</label>
              <FileUploadDropzone 
                folder="receipts"
                maxSizeMB={10}
                acceptedTypes="image/jpeg,image/png,application/pdf"
                label="Upload an invoice"
                onUploadComplete={(data) => console.log('Invoice uploaded:', data)}
              />
            </div>

            {/* Financial Requisition Card */}
            <div className="bg-white border text-left border-[#EEF1F6] shadow-sm rounded-[10px] p-4 sm:p-5 flex flex-col gap-4 transition-all">
              <div 
                className="flex items-start gap-3.5 cursor-pointer group"
                onClick={() => setLinkRequisition(!linkRequisition)}
              >
                <div className="pt-[3px] shrink-0">
                  <div className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-[4px] flex items-center justify-center border transition-colors ${linkRequisition ? "bg-[#2563EB] border-[#2563EB]" : "bg-white border-[#D1D5DB] group-hover:border-[#9CA3AF]"}`}>
                    {linkRequisition && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#111827] text-[14px] sm:text-[14.5px] font-[800] tracking-tight">Link to Financial Requisition</span>
                  <span className="text-[#6B7280] text-[12.5px] sm:text-[13px] font-[500] leading-snug pe-2">
                    Automatically create an expense entry in the branch budget for this restock.
                  </span>
                </div>
              </div>
              
              {linkRequisition && (
                <div className="flex flex-col sm:flex-row gap-4 mt-1 sm:mt-2 pl-0 sm:pl-[30px] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[#6B7280] text-[12px] sm:text-[12.5px] font-[600]">Total Cost</label>
                    <div className="relative flex items-center h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#2563EB]/50 focus-within:border-[#2563EB] transition-all">
                      <div className="h-full px-3.5 flex items-center justify-center text-[#9CA3AF] text-[14px] font-[600] shrink-0">
                        ₦
                      </div>
                      <input 
                        type="text" 
                        placeholder="0.00" 
                        className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] placeholder:text-[#9CA3AF] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[#6B7280] text-[12px] sm:text-[12.5px] font-[600]">Budget Category</label>
                    <div className="relative flex items-center h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white overflow-hidden cursor-pointer focus-within:ring-1 focus-within:ring-[#2563EB]/50 focus-within:border-[#2563EB] transition-all">
                      <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-8 outline-none appearance-none cursor-pointer">
                        <option value="office">Office Supplies</option>
                        <option value="equipment">Equipment</option>
                        <option value="furniture">Furniture</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#9CA3AF] pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Divider & Buttons */}
          <div className="px-6 sm:px-7 py-4 sm:py-5 border-t border-[#EEF1F6] bg-[#F8FAFC] flex flex-col sm:flex-row justify-end gap-3 rounded-b-[16px]">
            <button className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              Cancel
            </button>
            <button className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[14px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm w-full sm:w-auto">
              Update Stock
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
