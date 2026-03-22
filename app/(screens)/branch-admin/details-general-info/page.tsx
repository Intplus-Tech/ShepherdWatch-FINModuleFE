"use client";

import React from "react";
import { Inter } from "next/font/google";
import { X, ShieldCheck, Cpu, HardDrive, Monitor, Plus, Trash2, Edit, Save, CircuitBoard } from "lucide-react";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

export default function DetailsGeneralInfoModalPage() {
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
          className="bg-white w-full max-w-[850px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] leading-tight tracking-tight">Dell OptiPlex 7090</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-[700] uppercase tracking-wider rounded-[6px]">
                    IT Equipment
                  </div>
                  <div className="px-2.5 py-1 bg-[#FEF9C3] text-[#CA8A04] text-[11px] font-[700] uppercase tracking-wider rounded-[6px]">
                    Fair Condition
                  </div>
                </div>
              </div>
              <p className="text-[#64748B] text-[13.5px] font-[500] tracking-wide">
                Asset ID: <span className="font-[700] text-[#475569]">#EQ-2041</span> • Main Office - Desk 4
              </p>
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 sm:px-8 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              <button className="pb-3 border-b-[2.5px] border-[#2563EB] text-[#2563EB] text-[14px] font-[700] whitespace-nowrap">
                General Info
              </button>
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[600] whitespace-nowrap transition-colors">
                Maintenance History
              </button>
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[600] whitespace-nowrap transition-colors">
                Movement Log
              </button>
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[600] whitespace-nowrap transition-colors">
                Financial Impact
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-8 sm:gap-10">
            
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-8">
              
              {/* Core Details Block */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">Core Details</h3>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Grid Item */}
                  <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                    <span className="text-[#64748B] text-[12px] font-[600]">Serial Number</span>
                    <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">CN-0W7NK8-7S1RX</span>
                  </div>
                  
                  {/* Grid Item */}
                  <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                    <span className="text-[#64748B] text-[12px] font-[600]">Model Year</span>
                    <span className="text-[#111827] text-[14.5px] font-[800]">2021</span>
                  </div>

                  {/* Grid Item */}
                  <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                    <span className="text-[#64748B] text-[12px] font-[600]">Purchase Date</span>
                    <span className="text-[#111827] text-[14.5px] font-[800]">Aug 15, 2021</span>
                  </div>

                  {/* Grid Item */}
                  <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                    <span className="text-[#64748B] text-[12px] font-[600]">Warranty Status</span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A] stroke-[2.5px]" />
                      <span className="text-[#16A34A] text-[13.5px] font-[700]">Active until 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specs Block */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">Technical Specs</h3>
                
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3.5">
                    <Cpu className="w-[18px] h-[18px] text-[#94A3B8] stroke-[2px]" />
                    <span className="text-[#334155] text-[14px] font-[500] leading-snug">Intel Core i7-10700 (8-Core, 16MB Cache)</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5">
                    <CircuitBoard className="w-[18px] h-[18px] text-[#94A3B8] stroke-[2px]" />
                    <span className="text-[#334155] text-[14px] font-[500] leading-snug">16GB DDR4 RAM 2933MHz</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5">
                    <HardDrive className="w-[18px] h-[18px] text-[#94A3B8] stroke-[2px]" />
                    <span className="text-[#334155] text-[14px] font-[500] leading-snug">512GB PCIe NVMe Class 40 SSD</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5">
                    <Monitor className="w-[18px] h-[18px] text-[#94A3B8] stroke-[2px]" />
                    <span className="text-[#334155] text-[14px] font-[500] leading-snug">Windows 10 Pro (Includes Win 11 License)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-6 w-full max-w-[400px]">
              
              {/* Financial Snapshot Card */}
              <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 flex flex-col relative w-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">Financial Snapshot</h3>
                  <span className="text-[#2563EB] text-[12px] font-[700] cursor-pointer hover:underline">View Full Details</span>
                </div>
                
                <div className="flex flex-col gap-4">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[13px] font-[500]">Original Cost</span>
                    <span className="text-[#111827] text-[15px] sm:text-[16px] font-[800] tracking-tight">₦ 450,000.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[13px] font-[500]">Current Value</span>
                    <span className="text-[#111827] text-[15px] sm:text-[16px] font-[800] tracking-tight">₦ 285,500.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[13px] font-[500]">Depreciation (YTD)</span>
                    <span className="text-[#EF4444] text-[14px] sm:text-[15px] font-[800]">- 12.5%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "63.4%" }}></div>
                    </div>
                    <span className="text-[#94A3B8] text-[11px] font-[600] text-center tracking-wide">63% of value remaining</span>
                  </div>

                </div>
              </div>

              {/* Latest Activity Card */}
              <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 flex flex-col relative w-full">
                <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest mb-5">Latest Activity</h3>
                
                <div className="flex flex-col relative pl-5 border-l-[2px] border-[#F1F5F9] pb-2">
                  
                  {/* Activity Item 1 */}
                  <div className="relative mb-6">
                    {/* Blue Dot */}
                    <div className="absolute w-[9px] h-[9px] bg-[#2563EB] rounded-full -left-[25.5px] top-[4px] ring-4 ring-white"></div>
                    <div className="flex flex-col">
                      <span className="text-[#111827] text-[14px] font-[800]">Software Update</span>
                      <span className="text-[#475569] text-[13px] font-[500] leading-snug mt-0.5">System updated to latest security patch.</span>
                      <span className="text-[#94A3B8] text-[11.5px] font-[600] mt-1.5 tracking-wide">Today, 10:30 AM • Auto-log</span>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative mb-4 pb-2">
                    {/* Gray Dot */}
                    <div className="absolute w-[9px] h-[9px] bg-[#94A3B8] rounded-full -left-[25.5px] top-[4px] ring-4 ring-white"></div>
                    <div className="flex flex-col">
                      <span className="text-[#111827] text-[14px] font-[800]">Routine Checkup</span>
                      <span className="text-[#475569] text-[13px] font-[500] leading-snug mt-0.5">Visual inspection passed. No issues.</span>
                      <span className="text-[#94A3B8] text-[11.5px] font-[600] mt-1.5 tracking-wide">Last Week • J. Admin</span>
                    </div>
                  </div>

                  {/* Add Log Entry Action */}
                  <button className="w-full mt-1 border border-dashed border-[#CBD5E1] rounded-[8px] py-3 flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors group">
                    <Plus className="w-[15px] h-[15px] text-[#3B82F6] stroke-[3px]" />
                    <span className="text-[#3B82F6] text-[13px] font-[800]">Add Log Entry</span>
                  </button>
                  
                </div>
              </div>

            </div>

          </div>

          {/* Footer Navigation Bar */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#EEF1F6] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
            {/* Left Destructive Action */}
            <button className="flex items-center gap-2 text-[#EF4444] hover:text-[#DC2626] transition-colors px-2">
              <Trash2 className="w-[15px] h-[15px] stroke-[2.5px]" />
              <span className="text-[14px] font-[800]">Retire Asset</span>
            </button>
            
            {/* Right Standard Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-none">
                Print Label
              </button>
              <button className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[14px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm flex-1 sm:flex-none">
                Edit Details
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
