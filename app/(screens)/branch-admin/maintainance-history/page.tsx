"use client";

import React from "react";
import { Inter } from "next/font/google";
import { X, Plus, Trash2, Zap, CalendarDays, Wrench, RotateCw, CheckCircle2 } from "lucide-react";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

export default function MaintenanceHistoryModalPage() {
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
          className="bg-white w-full max-w-[950px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] leading-tight tracking-tight">Dell OptiPlex 7090</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
                    IT Equipment
                  </div>
                  <div className="px-2.5 py-1 bg-[#FEF9C3] text-[#CA8A04] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
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

          {/* Tab Navigation Menu */}
          <div className="px-6 sm:px-8 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                General Info
              </button>
              <button className="pb-3 border-b-[2.5px] border-[#2563EB] text-[#2563EB] text-[14px] font-[800] whitespace-nowrap">
                Maintenance History
              </button>
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Movement Log
              </button>
              <button className="pb-3 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Financial Impact
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-8 sm:gap-10">
            
            {/* Left Column (Timeline) */}
            <div className="flex-[8] flex flex-col overflow-hidden">
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[#111827] text-[11px] font-[800] uppercase tracking-widest leading-none">Service History Timeline</h3>
                <button className="h-[38px] px-5 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2 text-[12.5px] font-[800] text-white hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0">
                  <Plus className="h-[15px] w-[15px] stroke-[3px]" />
                  Add Maintenance Record
                </button>
              </div>

              {/* Timeline Container */}
              <div className="relative flex flex-col -ml-3 sm:ml-0 pl-[18px] sm:pl-[28px] isolate">
                {/* Continuous Line */}
                <div className="absolute left-[36px] sm:left-[46px] top-6 bottom-12 w-[1.5px] bg-[#EEF1F6] -z-10"></div>

                {/* Event 1 : Emergency */}
                <div className="relative flex gap-4 sm:gap-6 w-full mb-6 group">
                  <div className="absolute -left-[19px] sm:-left-[19px] top-1">
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-white ring-[10px] ring-white z-10 border-[1.5px] border-[#EF4444] text-[#EF4444] bg-white group-hover:bg-[#FEF2F2] transition-colors">
                      <Zap className="w-[17px] h-[17px] stroke-[2.5px]" />
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#EEF1F6] shadow-sm rounded-[12px] p-5 pt-4 flex flex-col gap-4 ml-8">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h4 className="text-[#111827] text-[14.5px] sm:text-[15px] font-[800]">Emergency PSU Replacement</h4>
                          <div className="px-2 py-[2px] bg-[#FEF2F2] text-[#EF4444] text-[9.5px] font-[800] uppercase tracking-wider rounded-[4px]">EMERGENCY</div>
                        </div>
                        <p className="text-[#94A3B8] text-[12.5px] font-[500]">Jan 12, 2024 • 02:45 PM</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">₦ 45,000.00</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-[6px] h-[6px] rounded-full bg-[#F97316]"></div>
                          <span className="text-[#F97316] text-[11.5px] font-[700]">Pending</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Service Provider</span>
                        <span className="text-[#334155] text-[13px] font-[600]">FastFix Tech Hub</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Reported By</span>
                        <span className="text-[#334155] text-[13px] font-[600]">M. Bello (Front Desk)</span>
                      </div>
                    </div>

                    <p className="text-[#64748B] text-[13px] font-[400] italic mt-1 leading-snug">
                      "System experienced sudden power loss. Technician diagnosed a blown power supply unit. Replacement ordered."
                    </p>
                  </div>
                </div>

                {/* Event 2 : Routine */}
                <div className="relative flex gap-4 sm:gap-6 w-full mb-6 group">
                  <div className="absolute -left-[19px] sm:-left-[19px] top-1">
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-white ring-[10px] ring-white z-10 border-[1.5px] border-[#3B82F6] text-[#3B82F6] bg-white group-hover:bg-[#EFF6FF] transition-colors">
                      <CalendarDays className="w-[17px] h-[17px] stroke-[2.5px]" />
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#EEF1F6] shadow-sm rounded-[12px] p-5 pt-4 flex flex-col gap-4 ml-8">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h4 className="text-[#111827] text-[14.5px] sm:text-[15px] font-[800]">Quarterly Cleaning & Optimization</h4>
                          <div className="px-2 py-[2px] bg-[#EFF6FF] text-[#2563EB] text-[9.5px] font-[800] uppercase tracking-wider rounded-[4px]">ROUTINE</div>
                        </div>
                        <p className="text-[#94A3B8] text-[12.5px] font-[500]">Oct 05, 2023 • 10:00 AM</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">₦ 8,500.00</span>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-[13px] h-[13px] text-[#22C55E] stroke-[3px]" />
                          <span className="text-[#22C55E] text-[11.5px] font-[700]">Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Service Provider</span>
                        <span className="text-[#334155] text-[13px] font-[600]">Internal IT Team</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Approved By</span>
                        <span className="text-[#334155] text-[13px] font-[600]">Admin Jane</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event 3 : Repair */}
                <div className="relative flex gap-4 sm:gap-6 w-full mb-2 group">
                  <div className="absolute -left-[19px] sm:-left-[19px] top-1">
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-white ring-[10px] ring-white z-10 border-[1.5px] border-[#F97316] text-[#F97316] bg-white group-hover:bg-[#FFF7ED] transition-colors">
                      <Wrench className="w-[17px] h-[17px] stroke-[2.5px]" />
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#EEF1F6] shadow-sm rounded-[12px] p-5 pt-4 flex flex-col gap-4 ml-8">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h4 className="text-[#111827] text-[14.5px] sm:text-[15px] font-[800]">RAM Upgrade (8GB to 16GB)</h4>
                          <div className="px-2 py-[2px] bg-[#FEF9C3] text-[#CA8A04] text-[9.5px] font-[800] uppercase tracking-wider rounded-[4px]">REPAIR</div>
                        </div>
                        <p className="text-[#94A3B8] text-[12.5px] font-[500]">Jun 18, 2023 • 11:30 AM</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">₦ 32,000.00</span>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-[13px] h-[13px] text-[#22C55E] stroke-[3px]" />
                          <span className="text-[#22C55E] text-[11.5px] font-[700]">Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Service Provider</span>
                        <span className="text-[#334155] text-[13px] font-[600]">Compusolve Ltd.</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#64748B] text-[12px] font-[500]">Ticket Ref</span>
                        <span className="text-[#334155] text-[13px] font-[600]">#TK-90821</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column (Metrics Cards) */}
            <div className="flex-[4] flex flex-col gap-6 w-full xl:min-w-[320px]">
              
              {/* Financial Snapshot Vertical Card */}
              <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 pt-6 flex flex-col relative w-full">
                <h3 className="text-[#111827] text-[10.5px] font-[800] uppercase tracking-widest leading-snug mb-5 w-[60%]">
                  Financial<br className="xl:block hidden" /> Snapshot
                </h3>
                
                <div className="flex flex-col gap-4">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Original Purchase</span>
                    <span className="text-[#111827] text-[14px] font-[800] tracking-tight">₦ 450,000.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Total Service Cost</span>
                    <span className="text-[#EF4444] text-[14px] font-[800] tracking-tight">₦ 85,500.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Current Net Value</span>
                    <span className="text-[#111827] text-[14px] font-[800] tracking-tight">₦ 285,500.00</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "63%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8] text-[10.5px] font-[700] tracking-wide">
                      <span>Residual Value</span>
                      <span>63% Remaining</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Service Metrics Card */}
              <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 flex flex-col relative w-full">
                <h3 className="text-[#111827] text-[10.5px] font-[800] uppercase tracking-widest leading-none mb-5">
                  Service Metrics
                </h3>
                
                <div className="flex flex-col gap-5">
                  
                  {/* Metric 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                      <RotateCw className="w-[15px] h-[15px] stroke-[2.5px] rotate-180" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-[12px] font-[600]">MTBF (Approx.)</span>
                      <span className="text-[#111827] text-[13.5px] font-[800]">142 Days</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-[15px] h-[15px] stroke-[3px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-[12px] font-[600]">Next Routine Check</span>
                      <span className="text-[#111827] text-[13.5px] font-[800]">Mar 15, 2024</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Footer Navigation Bar */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#EEF1F6] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
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
