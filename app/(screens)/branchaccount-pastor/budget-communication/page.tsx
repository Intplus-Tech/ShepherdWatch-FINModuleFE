"use client"

import React, { useState } from "react"
import BudgetPage from "../budget/page"
import { X, Info, Paperclip, Send, FileText } from "lucide-react"

export default function CommunicationPage() {
  const [message, setMessage] = useState("")

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* Main Budget UI Wrapper - Flexes to take remaining space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <BudgetPage />
      </div>

      {/* Communication Sidebar (Flexed on the right) */}
      <div className="w-[280px] xl:w-[320px] shrink-0 bg-white flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] border-l border-[#EEF1F6] z-50">
        
        {/* Thread Header */}
        <div className="bg-[#F4F7FF] p-5 border-b border-[#EEF1F6]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#3B5BDB] font-bold text-[12px] tracking-wide">
              <Info className="h-4 w-4" strokeWidth={2.5} />
              ACTIVE THREAD
            </div>
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <h2 className="text-[18px] font-bold text-[#111827] tracking-tight leading-tight">Maintenance & Repairs</h2>
          <p className="text-[13px] font-medium text-[#6B7280] mt-1.5">Proposed: $5,000 • Allocated: $3,000</p>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Message 1: Pastor John */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">JP</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#111827] text-[13px]">Pastor John</span>
                <span className="text-[11px] font-medium text-[#9CA3AF]">2:15 PM</span>
              </div>
              <div className="bg-[#F3F4F6] rounded-[12px] rounded-tl-none p-3.5 text-[13px] text-[#4B5563] leading-relaxed relative border border-[#EEF1F6]">
                We increased the maintenance budget request due to the roof leak repairs needed in Q2. It's urgent.
              </div>
            </div>
          </div>

          {/* Time Separator */}
          <div className="flex items-center gap-4 text-[10px] font-bold text-[#9CA3AF] justify-center tracking-widest uppercase my-2">
            <div className="h-px bg-[#EEF1F6] flex-1"></div>
            TODAY
            <div className="h-px bg-[#EEF1F6] flex-1"></div>
          </div>

          {/* Message 2: ME */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="h-8 w-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center font-bold text-[11px] shrink-0">ME</div>
            <div className="flex-1 flex flex-col items-end">
              <div className="flex items-center justify-between mb-1.5 w-[90%] lg:w-[85%] flex-row-reverse">
                <span className="font-bold text-[#111827] text-[13px] mr-1">You</span>
                <span className="text-[11px] font-medium text-[#9CA3AF]">2:45 PM</span>
              </div>
              <div className="bg-[#EEF2FF] rounded-[12px] rounded-tr-none p-4 text-[13px] text-[#1E3A8A] border border-[#D1DBFE] leading-relaxed w-[90%] lg:w-[85%] shadow-sm">
                I see. Is the ₦5k based on a quote? Last year we only spent ₦2k.
              </div>
            </div>
          </div>

          {/* Message 3: Pastor John with attachment */}
          <div className="flex gap-3 mt-4">
            <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">JP</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#111827] text-[13px]">Pastor John</span>
                <span className="text-[11px] font-medium text-[#9CA3AF]">9:30 AM</span>
              </div>
              <div className="bg-[#F3F4F6] rounded-[12px] rounded-tl-none p-3.5 text-[13px] text-[#4B5563] leading-relaxed border border-[#EEF1F6]">
                Yes, I attached the quote in the documents tab. The materials cost has gone up significantly.
                
                {/* Attachment Card */}
                <div className="mt-4 bg-white border border-[#E5E7EB] p-3 rounded-[8px] flex items-center justify-between shadow-sm cursor-pointer hover:border-[#D1D5DB] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#FEF2F2] rounded-[6px] flex items-center justify-center text-[#EF4444] group-hover:bg-red-100 transition-colors">
                      <FileText className="h-4.5 w-4.5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#111827] truncate w-[160px] leading-tight">Roof_Quote_2024_Final.pdf</div>
                      <div className="text-[10px] text-[#6B7280] font-semibold mt-0.5">2.4 MB</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Chat Input Area */}
        <div className="p-5 border-t border-[#EEF1F6] bg-white mt-auto">
          <div className="relative flex items-center border border-[#E5E7EB] rounded-[10px] bg-white shadow-sm focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]/20 transition-all p-1.5">
            <input 
              type="text" 
              placeholder="Type your feedback regarding 'Maintenance'..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#111827] placeholder:text-[#9CA3AF] pl-3 py-2 font-medium h-[42px] min-w-0 w-full"
            />
            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              <button className="h-9 w-9 flex items-center justify-center rounded-[8px] text-[#9CA3AF] hover:bg-gray-50 hover:text-[#4B5563] transition-colors">
                <Paperclip className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
              <button className="h-9 w-9 flex items-center justify-center rounded-[8px] bg-[#3B5BDB] text-white hover:bg-[#3451b2] transition-colors shadow-sm cursor-pointer">
                <Send className="h-4 w-4 -ml-[2px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}
