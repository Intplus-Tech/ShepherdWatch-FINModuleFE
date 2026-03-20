"use client"

import React from "react"
import { BudgetReviewContent } from "../budget-review/page"
import { Info, X, FileText, Send, Paperclip } from "lucide-react"

export default function BudgetCommunicationPage() {
  const rightSidebar = (
    <aside className="w-[380px] border-l border-[#EEF1F6] bg-white h-screen flex flex-col shrink-0">
      
      {/* Thread Header */}
      <div className="border-b border-[#EEF1F6] bg-[#F8FAFC] p-5 h-[72px] flex items-center justify-between shrink-0">
        <div className="flex items-start gap-3">
          <Info className="h-4.5 w-4.5 text-[#2563EB] mt-0.5" />
          <div>
            <div className="text-[10px] font-bold text-[#2563EB] tracking-wider uppercase">Active Thread</div>
            <div className="text-[14px] font-bold text-[#111827] leading-tight mt-1">Maintenance & Repairs</div>
            <div className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">Proposed: $5,000 • Allocated: $3,000</div>
          </div>
        </div>
        <button className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Left Message */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">
            JP
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#111827]">Pastor John</span>
              <span className="text-[10.5px] text-[#9CA3AF] font-medium">2:15 PM</span>
            </div>
            <div className="bg-[#F3F4F6] rounded-[14px] rounded-tl-[4px] p-3.5 mt-1.5 text-[13px] text-[#374151] leading-relaxed shadow-sm">
              We increased the maintenance budget request due to the roof leak repairs needed in Q2. It&apos;s urgent.
            </div>
          </div>
        </div>

        {/* Sticky Date Header */}
        <div className="flex items-center justify-center relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EEF1F6]"></div>
          </div>
          <div className="relative bg-white px-4 text-[10px] font-bold text-[#9CA3AF] tracking-wider uppercase">
            Today
          </div>
        </div>

        {/* Right Message */}
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-end w-full gap-2 mb-1.5">
            <span className="text-[10.5px] text-[#9CA3AF] font-medium">2:45 PM</span>
            <span className="text-[12.5px] font-semibold text-[#111827]">You</span>
          </div>
          <div className="flex gap-3 justify-end w-full">
            <div className="bg-[#EEF2FF] rounded-[14px] rounded-tr-[4px] p-3.5 text-[13px] text-[#1E3A8A] leading-relaxed shadow-sm border border-[#E0E7FF] max-w-[85%]">
              I see. Is the $5k based on a quote? Last year we only spent $2k.
            </div>
            <div className="h-8 w-8 rounded-full bg-[#3B5BDB] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              ME
            </div>
          </div>
        </div>

        {/* Left Message with Attachment */}
        <div className="flex gap-3 pt-2">
          <div className="h-8 w-8 rounded-full bg-[#E0E7FF] text-[#3B5BDB] flex items-center justify-center font-bold text-[11px] shrink-0">
            JP
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#111827]">Pastor John</span>
              <span className="text-[10.5px] text-[#9CA3AF] font-medium">9:30 AM</span>
            </div>
            <div className="bg-[#F3F4F6] rounded-[14px] rounded-tl-[4px] p-3.5 mt-1.5 text-[13px] text-[#374151] leading-relaxed shadow-sm">
              Yes, I attached the quote in the documents tab. The materials cost has gone up significantly.
              
              {/* File Attachment Pill */}
              <div className="mt-3 flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-[8px] p-2 hover:bg-gray-50 cursor-pointer transition-colors w-max pr-4">
                <div className="h-8 w-8 rounded bg-rose-50 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#111827] w-[130px] truncate">Roof_Quote_2024.pdf</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">1.2 MB</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Input Box */}
      <div className="p-5 border-t border-[#EEF1F6] bg-white shrink-0">
        <div className="relative flex items-end bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] p-2 hover:border-[#D1D5DB] transition-colors focus-within:border-[#3B5BDB] focus-within:ring-1 focus-within:ring-[#3B5BDB]">
          <textarea
            placeholder="Type your feedback regarding 'Maintenance'..."
            className="flex-1 max-h-[100px] min-h-[40px] bg-transparent resize-none border-0 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:ring-0 py-2.5 px-3 outline-none leading-relaxed"
            rows={1}
          />
          <div className="flex items-center gap-1 shrink-0 bg-transparent pl-2">
            <button className="h-10 w-10 text-[#9CA3AF] hover:text-[#6B7280] flex items-center justify-center transition-colors">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <button className="h-10 w-10.5 rounded-[10px] bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 shadow-sm transition-colors">
              <Send className="h-4.5 w-4.5 -ml-0.5" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  )

  return <BudgetReviewContent rightSidebar={rightSidebar} activeRowId="maintenance" />
}
