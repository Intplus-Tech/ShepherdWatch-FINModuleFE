"use client";

import React from "react";
import { Inter } from "next/font/google";
import { Calendar, ArrowRightLeft, RefreshCw, Trash2, Eye } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function ActionModalPage() {
  return (
    <div className={`min-h-[100dvh] w-full bg-slate-50 flex flex-col justify-center items-center p-4 ${inter.className} antialiased`}>
      
      {/* 
        Mobile-first implementation:
        - Mobile views: attached to bottom (mt-auto / justify-end), full width, rounded top corners, larger touch targets
        - Desktop (sm:) views: centered, max width 280px, rounded standard corners
      */}
      <div 
        className="w-full max-w-[280px] bg-white rounded-[12px] flex flex-col pt-3 pb-2 overflow-hidden shadow-[0px_10px_40px_rgba(0,0,0,0.08),_0px_2px_10px_rgba(0,0,0,0.04)] border border-[#EEF1F6] animate-in slide-in-from-bottom-0 zoom-in-95 duration-300"
      >
        
        {/* Header */}
        <div className="px-5 py-2 flex justify-end">
          <span className="text-[11.5px] font-[800] text-[#94A3B8] tracking-[0.8px]">ACTIONS</span>
        </div>

        <div className="flex flex-col">
          {/* Action: Schedule Maintenance */}
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] flex items-center gap-3.5 transition-colors group">
            <Calendar className="h-[18px] w-[18px] text-[#94A3B8] group-hover:text-[#475569] group-active:text-[#475569] stroke-[2px]" />
            <span className="text-[#334155] text-[14.5px] font-[500]">Schedule Maintenance</span>
          </button>

          {/* Action: Log Movement/Transfer */}
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] flex items-center gap-3.5 transition-colors group">
            <ArrowRightLeft className="h-[18px] w-[18px] text-[#94A3B8] group-hover:text-[#475569] group-active:text-[#475569] stroke-[2px]" />
            <span className="text-[#334155] text-[14.5px] font-[500]">Log Movement/Transfer</span>
          </button>

          {/* Action: Revalue Asset */}
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] flex items-center gap-3.5 transition-colors group">
            <div className="relative flex items-center justify-center">
              <RefreshCw className="h-[18px] w-[18px] text-[#94A3B8] group-hover:text-[#475569] group-active:text-[#475569] stroke-[2px]" />
              <span className="absolute text-[8px] font-[800] text-[#94A3B8] group-hover:text-[#475569] group-active:text-[#475569]">$</span>
            </div>
            <span className="text-[#334155] text-[14.5px] font-[500]">Revalue Asset</span>
          </button>
          
          <div className="w-full border-t border-dashed border-[#E2E8F0] my-0.5"></div>

          {/* Action: Mark for Disposal (Destructive) */}
          <button className="w-full text-left px-5 py-3.5 hover:bg-red-50 active:bg-red-100 flex items-center gap-3.5 transition-colors group">
            <Trash2 className="h-[18px] w-[18px] text-[#EF4444] stroke-[2px]" />
            <span className="text-[#EF4444] text-[14.5px] font-[500]">Mark for Disposal</span>
          </button>
          
          <div className="w-full border-t border-dashed border-[#E2E8F0] my-0.5"></div>

          {/* Action: View Full Details */}
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#F8FAFC] active:bg-[#F1F5F9] flex items-center gap-3.5 transition-colors group">
            <Eye className="h-[18px] w-[18px] text-[#94A3B8] group-hover:text-[#475569] group-active:text-[#475569] stroke-[2px]" />
            <span className="text-[#334155] text-[14.5px] font-[500]">View Full Details</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
