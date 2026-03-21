"use client"

import React from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import {
  X,
  Eye,
  Check,
  ChevronDown,
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export default function RequestModalPage() {
  return (
    <div className={`min-h-[100dvh] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 ${inter.className} antialiased`}>
      {/* Modal Container */}
      <div className="w-full max-w-[850px] bg-white rounded-[12px] md:rounded-[16px] shadow-2xl flex flex-col relative overflow-hidden max-h-[95dvh] sm:max-h-none overflow-y-auto sm:overflow-visible">
        
        {/* Close Button Top Right */}
        <button className="absolute top-4 right-4 md:top-5 md:right-5 text-gray-500 hover:text-gray-800 transition-colors z-10">
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-5 px-5 sm:pt-6 sm:px-6 md:pt-8 md:px-8 pb-4 md:pb-5 flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#EFF6FF] text-[#2563EB] text-[9px] sm:text-[8.5px] md:text-[10px] font-[800] px-2 py-0.5 sm:px-2 md:px-2.5 md:py-1 rounded-[4px] md:rounded-[6px] uppercase tracking-wider">
              Pending Review
            </span>
            <span className="text-[#9CA3AF] text-[11px] sm:text-[10px] md:text-[13px] font-[700] uppercase tracking-wide">
              REQ-2023-004
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-3 md:gap-4">
            <h2 className="text-[20px] sm:text-[20px] md:text-[28px] font-[900] text-[#111827] leading-tight tracking-tight pr-8 sm:pr-0">
              Purchase of Audio Cables
            </h2>
            
            {/* Profile Chip */}
            <div className="flex bg-white items-center gap-2.5 md:gap-3 border border-[#EEF1F6] rounded-full px-1.5 py-1.5 md:px-1.5 md:py-1.5 shadow-sm shrink-0 pr-3 sm:pr-3 md:pr-4 mx-auto sm:mx-0 w-[90%] sm:w-auto mt-2 sm:mt-0">
              <div className="h-8 w-8 md:h-9 md:w-9 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                <Image 
                  src="/images/Beared%20Guy02-min%201.jpg" 
                  alt="Bro. James Wilson" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[12px] sm:text-[11px] md:text-[13px] font-[800] text-[#111827] leading-tight">Bro. James Wilson</div>
                <div className="text-[10px] sm:text-[9.5px] md:text-[11px] font-[600] text-[#6B7280] leading-tight mt-0.5">Media Dept. Head</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8 grid grid-cols-1 sm:grid-cols-5 gap-4 md:gap-6">
          
          {/* Left Column (Description & Attachments) */}
          <div className="sm:col-span-3 flex flex-col gap-4 md:gap-6">
            
            {/* Description Card */}
            <div className="bg-white border border-[#EEF1F6] rounded-[10px] md:rounded-[12px] p-4 sm:p-3.5 md:p-5 shadow-sm">
              <h3 className="text-[13px] sm:text-[12px] md:text-[14px] font-[800] text-[#111827] mb-2 md:mb-3">Description</h3>
              <p className="text-[12.5px] sm:text-[11px] md:text-[13.5px] font-[500] text-[#6B7280] leading-relaxed">
                Replacement XLR cables for the main sanctuary sound system. The current cables are over 3 years old and starting to cause intermittent buzzing during services. This purchase includes 5× 25ft cables and 2× 50ft cables.
              </p>
            </div>

            {/* Attachments Card */}
            <div className="bg-white border border-[#EEF1F6] rounded-[10px] md:rounded-[12px] p-4 sm:p-3.5 md:p-5 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-[13px] sm:text-[12px] md:text-[14px] font-[800] text-[#111827]">Attachments (2)</h3>
                <button className="text-[12px] sm:text-[11px] md:text-[13px] font-[800] text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                  Download All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 flex-1">
                {/* Attachment Item 1 */}
                <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-[6px] md:rounded-[8px] bg-[#F8FAFC] border border-[#EEF1F6] group transition-colors hover:border-[#D1D5DB]">
                  <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 bg-[#FEE2E2] rounded-[5px] md:rounded-[6px] flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-[10px] md:text-[12px] font-[800] text-[#111827] truncate">Sweetwater_Quote_#99...</div>
                    <div className="text-[10px] sm:text-[9px] md:text-[11px] font-[500] text-[#9CA3AF] mt-0.5 md:mt-0.5">1.2 MB • Oct 24</div>
                  </div>
                  <button className="h-6 w-6 md:h-7 md:w-7 shrink-0 rounded-[4px] md:rounded-[6px] text-[#9CA3AF] flex items-center justify-center hover:bg-white hover:text-[#4B5563] hover:shadow-sm transition-all">
                    <Eye className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
                  </button>
                </div>

                {/* Attachment Item 2 */}
                <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-[6px] md:rounded-[8px] bg-[#F8FAFC] border border-[#EEF1F6] group transition-colors hover:border-[#D1D5DB]">
                  <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 bg-[#E0E7FF] rounded-[5px] md:rounded-[6px] flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" focusable="false" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-[10px] md:text-[12px] font-[800] text-[#111827] truncate">Old_Cables_Photo.jpg</div>
                    <div className="text-[10px] sm:text-[9px] md:text-[11px] font-[500] text-[#9CA3AF] mt-0.5 md:mt-0.5">2.4 MB • Oct 24</div>
                  </div>
                  <button className="h-6 w-6 md:h-7 md:w-7 shrink-0 rounded-[4px] md:rounded-[6px] text-[#9CA3AF] flex items-center justify-center hover:bg-white hover:text-[#4B5563] hover:shadow-sm transition-all">
                    <Eye className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Requested Amount & Notes) */}
          <div className="sm:col-span-2 flex flex-col gap-4 md:gap-6 mt-2 sm:mt-0">
            
            {/* Amount Card */}
            <div className="bg-white border border-[#EEF1F6] rounded-[10px] md:rounded-[12px] p-4 sm:p-3.5 md:p-5 shadow-sm">
              <h3 className="text-[10px] sm:text-[9.5px] md:text-[11px] font-[800] text-[#9CA3AF] uppercase tracking-wider mb-1.5 md:mb-2">Requested Amount</h3>
              <div className="text-[24px] sm:text-[22px] md:text-[32px] font-[900] text-[#111827] tracking-tight mb-3 md:mb-4">
                ₦18,425.00
              </div>
              <div className="h-[1px] w-full bg-[#EEF1F6] mb-3 md:mb-4"></div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] sm:text-[11px] md:text-[13px] font-[600] text-[#6B7280]">Budget Head</span>
                <span className="text-[12px] sm:text-[11.5px] md:text-[13px] font-[800] text-[#111827] truncate max-w-[55%]text-right">Media & Tech</span>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white border border-[#EEF1F6] rounded-[10px] md:rounded-[12px] p-4 sm:p-3.5 md:p-5 shadow-sm flex-1 flex flex-col h-[180px] sm:h-auto">
              <h3 className="text-[13px] sm:text-[12px] md:text-[14px] font-[800] text-[#111827] mb-2 md:mb-3">Notes / Clarification</h3>
              <div className="bg-[#F9FAFB] border border-[#EEF1F6] rounded-[6px] md:rounded-[8px] p-2.5 md:p-3 flex-1 flex h-full">
                <textarea 
                  className="w-full h-full bg-transparent resize-none outline-none text-[12px] sm:text-[11px] md:text-[13px] font-[500] text-[#4B5563] placeholder:text-[#9CA3AF] flex-1 min-h-[50px]"
                  placeholder="Add note..."
                ></textarea>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[#EEF1F6] bg-white px-5 py-4 sm:px-6 sm:py-3.5 md:px-8 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mt-auto">
          <button className="h-[40px] md:h-[44px] px-4 md:px-5 rounded-[6px] md:rounded-[8px] border border-[#FEE2E2] bg-white text-[#EF4444] text-[12px] md:text-[13px] font-[800] flex items-center justify-center gap-1.5 md:gap-2 hover:bg-[#FEF2F2] transition-colors w-full sm:w-auto">
            <X className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={3} />
            Retrieve Request
          </button>
          
          <div className="flex items-center gap-2.5 md:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <button className="h-[40px] md:h-[44px] px-3 md:px-4 rounded-[6px] md:rounded-[8px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[12px] md:text-[13px] font-[800] flex items-center justify-center gap-1.5 md:gap-2 hover:bg-[#F9FAFB] transition-colors flex-1 sm:flex-none">
              Normal
              <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#9CA3AF]" strokeWidth={2.5} />
            </button>
            
            <button className="h-[40px] md:h-[44px] px-4 md:px-6 rounded-[6px] md:rounded-[8px] bg-[#2563EB] text-white text-[12px] md:text-[13px] font-[800] flex items-center justify-center gap-1.5 md:gap-2 shadow-sm hover:bg-[#1D4ED8] transition-colors flex-1 sm:flex-none">
              <Check className="h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={3} />
              Update
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
