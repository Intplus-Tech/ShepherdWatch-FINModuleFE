"use client";

import React, { useState } from "react";
import { Inter } from "next/font/google";
import { X } from "lucide-react";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

export default function CashTopUpModalPage() {
  const [autoRequisition, setAutoRequisition] = useState(true);

  return (
    <div className={`relative min-h-[100dvh] w-full ${inter.className} antialiased`}>
      {/* Blurred Background Page */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden blur-[4px] opacity-60 pointer-events-none select-none">
        <AssetsHubPage />
      </div>

      {/* Modal Overlay Context */}
      <div className="fixed inset-0 z-40 bg-[#111827]/40 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6">
        
        {/* Modal Container */}
        <div 
          className="bg-white rounded-[16px] w-full max-w-[520px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.1), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#111827] text-[16px] sm:text-[18px] font-[800] leading-tight tracking-tight">Top-up Cash</h2>
              <p className="text-[#6B7280] text-[12px] sm:text-[13px] font-[500]">Petty Cash Box (AS-1024)</p>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col gap-4 sm:gap-5">
            
            {/* Current Balance Box */}
            <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
              <span className="text-[#4B5563] text-[12px] sm:text-[13px] font-[600]">Current Balance</span>
              <span className="text-[#111827] text-[16px] sm:text-[18px] font-[800] tracking-tight">₦ 50,000.00</span>
            </div>

            {/* Top-up Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#374151] text-[12.5px] sm:text-[13px] font-[600]">Top-up Amount</label>
              <div className="relative flex items-center h-[42px] sm:h-[46px] w-full rounded-[8px] border border-[#D1D5DB] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all transition-shadow">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center text-[#6B7280] text-[14px] sm:text-[15px] font-[600] shrink-0">
                  ₦
                </div>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] sm:text-[15px] font-[500] placeholder:text-[#9CA3AF] outline-none"
                />
                <div className="h-full px-4 flex items-center justify-center text-[#9CA3AF] text-[11px] sm:text-[12px] font-[700] tracking-wide shrink-0">
                  NGN
                </div>
              </div>
            </div>

            {/* Justification Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#374151] text-[12.5px] sm:text-[13px] font-[600]">
                Justification <span className="text-[#EF4444]">*</span>
              </label>
              <textarea 
                placeholder="Explain the reason for this cash top-up request..." 
                className="w-full rounded-[8px] border border-[#D1D5DB] bg-white p-3 text-[13px] sm:text-[14px] text-[#111827] placeholder:text-[#9CA3AF] font-[400] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all transition-shadow min-h-[90px] sm:min-h-[100px] resize-none"
              ></textarea>
            </div>

            {/* Toggle Configuration Context */}
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-[12px] p-4 flex gap-4 cursor-pointer hover:bg-[#E0F2FE]/50 transition-colors pb-5" onClick={() => setAutoRequisition(!autoRequisition)}>
              <div className="pt-0.5">
                {/* Custom Accessible Toggle */}
                <button 
                  type="button" 
                  className={`w-11 h-6 rounded-full relative flex items-center px-0.5 transition-colors focus:outline-none ${autoRequisition ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${autoRequisition ? "translate-x-[20px]" : "translate-x-0"}`}></div>
                </button>
              </div>
              <div className="flex flex-col gap-0.5 pt-0.5">
                <h4 className="text-[#0F172A] text-[13px] sm:text-[14px] font-[700] tracking-tight">Create Requisition Automatically</h4>
                <p className="text-[#475569] text-[12px] sm:text-[12.5px] font-[500] leading-snug">
                  Synchronize this request with the branch&apos;s financial workflow for approval.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Divider & Buttons */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-[#EEF1F6] bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3 rounded-b-[16px]">
            <button className="h-[40px] sm:h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[12.5px] sm:text-[14px] font-[700] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              Cancel
            </button>
            <button className="h-[40px] sm:h-[44px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] sm:text-[14px] font-[700] hover:bg-[#1D4ED8] transition-colors shadow-sm w-full sm:w-auto">
              Submit Request
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

