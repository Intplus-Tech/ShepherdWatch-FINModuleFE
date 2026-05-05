"use client";

import React from "react";
import { Inter } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { X, TrendingDown, Plus, Info, ArrowUpRight, Trash2 } from "lucide-react";
import AssetsHubPage from "../asset/page";
import { useAsset, type AssetDetail } from "@/components/hooks/useAsset";
import { formatCurrency } from "@/lib/format";

const inter = Inter({ subsets: ["latin"] });

function getString(obj: AssetDetail | null | undefined, ...keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = (obj as unknown as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function getNumber(obj: AssetDetail | null | undefined, ...keys: string[]): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = (obj as unknown as Record<string, unknown>)[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

export default function FinancialImpactModalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id");
  const { asset } = useAsset(assetId);

  const headerName = getString(asset, "name", "assetName") || "—";
  const headerCategory = getString(asset, "assetClassName", "category", "assetType") || "—";
  const headerCondition = getString(asset, "condition") || "—";
  const headerLocation = getString(asset, "location") || "—";
  const headerId = getString(asset, "id", "_id") || assetId || "";

  const purchaseValue = getNumber(asset, "purchaseValue", "cost", "unitCost");
  const currentValue = getNumber(asset, "currentValue", "nbv");
  const totalDepreciation = purchaseValue != null && currentValue != null ? purchaseValue - currentValue : null;
  const economicLife = getNumber(asset, "usefulLifeYears", "economicLife", "usefulLife");

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/branch-admin/asset");
  };

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
          className="bg-[#F8FAFC] w-full max-w-[1000px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto overflow-hidden" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between bg-white">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] leading-tight tracking-tight">{headerName}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
                    {headerCategory}
                  </div>
                  <div className="px-2.5 py-1 bg-[#FEF9C3] text-[#CA8A04] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
                    {headerCondition} Condition
                  </div>
                </div>
              </div>
              <p className="text-[#64748B] text-[13.5px] font-[500] tracking-wide">
                Asset ID: <span className="font-[700] text-[#475569]">#{headerId || "—"}</span> • {headerLocation}
              </p>
            </div>
            <button onClick={handleClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          {/* Tab Navigation Menu */}
          <div className="px-6 sm:px-8 border-b border-[#EEF1F6] bg-white pt-1.5">
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                General Info
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Maintenance History
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Movement Log
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-[#2563EB] text-[#2563EB] text-[14px] font-[800] whitespace-nowrap">
                Financial Impact
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-6 w-full">
            
            {/* Top Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-4 flex flex-col shadow-sm">
                <span className="text-[#64748B] text-[10.5px] font-[800] uppercase tracking-widest mb-1.5">PURCHASE PRICE</span>
                <span className="text-[#111827] text-[17px] sm:text-[18px] font-[800] tracking-tight">{purchaseValue != null ? formatCurrency(purchaseValue, { currency: "NGN" }) : "—"}</span>
              </div>
              
              <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-4 flex flex-col shadow-sm">
                <span className="text-[#64748B] text-[10.5px] font-[800] uppercase tracking-widest mb-1.5">NET BOOK VALUE</span>
                <span className="text-[#2563EB] text-[17px] sm:text-[18px] font-[800] tracking-tight">{currentValue != null ? formatCurrency(currentValue, { currency: "NGN" }) : "—"}</span>
              </div>
              
              <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-4 flex flex-col shadow-sm">
                <span className="text-[#64748B] text-[10.5px] font-[800] uppercase tracking-widest mb-1.5">TOTAL DEPRECIATION</span>
                <span className="text-[#EF4444] text-[17px] sm:text-[18px] font-[800] tracking-tight">{totalDepreciation != null ? formatCurrency(totalDepreciation, { currency: "NGN" }) : "—"}</span>
              </div>
              
              <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-4 flex flex-col shadow-sm">
                <span className="text-[#64748B] text-[10.5px] font-[800] uppercase tracking-widest mb-1.5">ECONOMIC LIFE</span>
                <span className="text-[#111827] text-[17px] sm:text-[18px] font-[800] tracking-tight">{economicLife != null ? `${economicLife} Years` : "—"}</span>
              </div>
            </div>

            {/* Core Body Columns */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Main Column */}
              <div className="flex-[7] flex flex-col gap-6">
                
                {/* Net Book Value Projection Chart */}
                <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-5 shadow-sm flex flex-col min-h-[220px]">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingDown className="w-4 h-4 text-[#2563EB] stroke-[2px]" />
                    <h3 className="text-[#111827] text-[11px] font-[800] uppercase tracking-widest">Net Book Value Projection</h3>
                  </div>
                  
                  {/* Pseudo SVG Chart Mapping */}
                  <div className="flex-1 w-full relative flex items-end min-h-[140px] px-2">
                    {/* Y Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between w-full border-b border-[#EEF1F6]">
                      <div className="w-full h-px bg-[#F1F5F9]"></div>
                      <div className="w-full h-px bg-[#F1F5F9]"></div>
                      <div className="w-full h-px bg-[#F1F5F9]"></div>
                      <div className="w-full h-px bg-[#EEF1F6]"></div>
                    </div>
                    
                    {/* Line Plot */}
                    <svg className="absolute inset-0 h-full w-full overflow-visible preserveAspectRatio='none'">
                      <polyline 
                        points="0,20 180,60 380,110 580,130" 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="3.5" 
                      />
                      {/* Active Current Dot */}
                      <circle cx="210" cy="70" r="5" fill="#3B82F6" stroke="white" strokeWidth="2" />
                    </svg>
                    
                    {/* Active Label Tooltip mock */}
                    <div className="absolute left-[180px] top-[40px] px-3 py-1 bg-[#EEF2FF] text-[#3B82F6] text-[10px] font-[800] uppercase tracking-wide rounded-[4px] border border-[#C7D2FE]">
                      2023 (Current)
                    </div>

                    {/* X Axis Labels */}
                    <div className="absolute bottom-[-24px] left-0 w-full flex justify-between text-[#94A3B8] text-[10px] font-[700] pt-1">
                      <span>PURCHASE</span>
                      <span>2022</span>
                      <span>2023</span>
                      <span>2024</span>
                      <span>RETIRE</span>
                    </div>
                  </div>
                </div>

                {/* Capital Improvements Box */}
                <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-5 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-[#16A34A] stroke-[2.5px]" />
                      <h3 className="text-[#111827] text-[11px] font-[800] uppercase tracking-widest">Capital Improvements</h3>
                    </div>
                    <span className="text-[#94A3B8] text-[11px] font-[600]">+ Increases Asset Value</span>
                  </div>

                  {/* Registered Improvement Card */}
                  <div className="bg-[#DCFCE7]/40 border border-[#BBF7D0] rounded-[8px] p-3.5 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                        <ArrowUpRight className="w-4 h-4 stroke-[3px]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#111827] text-[13.5px] font-[800] tracking-tight">RAM & Storage Upgrade</span>
                        <span className="text-[#64748B] text-[11.5px] font-[500]">Mar 12, 2023 • Performance Enhancement</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[#16A34A] text-[14.5px] font-[800] tracking-tight">+ ₦ 45,000.00</span>
                      <span className="text-[#16A34A] text-[10px] font-[700] uppercase tracking-wide">Value Added</span>
                    </div>
                  </div>

                  <button className="w-full border border-dashed border-[#CBD5E1] bg-[#F8FAFC] rounded-[8px] py-3.5 flex items-center justify-center gap-2 hover:bg-[#F1F5F9] transition-colors group">
                    <Plus className="w-[14px] h-[14px] text-[#64748B] stroke-[2.5px] group-hover:text-[#475569]" />
                    <span className="text-[#64748B] text-[13px] font-[700] group-hover:text-[#475569]">Register New Capital Improvement</span>
                  </button>
                </div>

              </div>

              {/* Right Sidebar Column */}
              <div className="flex-[4] flex flex-col gap-6 w-full lg:max-w-[320px]">
                
                {/* Methodology Box */}
                <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-5 shadow-sm flex flex-col h-[220px]">
                  <h3 className="text-[#111827] text-[11px] font-[800] uppercase tracking-widest mb-5">Methodology</h3>
                  
                  <div className="flex flex-col gap-3.5 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Depreciation Method</span>
                      <span className="text-[#111827] text-[13.5px] font-[700]">Straight Line</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Annual Rate</span>
                      <span className="text-[#111827] text-[13.5px] font-[700]">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Salvage Value</span>
                      <span className="text-[#111827] text-[13.5px] font-[800]">₦ 25,000.00</span>
                    </div>
                  </div>

                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-3 flex items-start gap-2.5 mt-auto">
                    <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-[1.5px] stroke-[2.5px]" />
                    <p className="text-[#1E3A8A] text-[11px] font-[600] leading-snug">
                      Asset is currently in its 3rd year of economic life. Market value may vary from book value based on condition.
                    </p>
                  </div>
                </div>

                {/* Tax Impact Box */}
                <div className="bg-white border border-[#EEF1F6] rounded-[10px] p-5 shadow-sm flex flex-col">
                  <h3 className="text-[#111827] text-[11px] font-[800] uppercase tracking-widest mb-4">Tax Impact</h3>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[600]">Investment Allowance</span>
                      <span className="text-[#16A34A] text-[12px] font-[800] bg-[#DCFCE7] px-2 py-[1px] rounded-[4px]">Applied</span>
                    </div>
                    <p className="text-[#94A3B8] text-[11.5px] font-[500] leading-snug mt-1">
                      Eligible for 10% investment allowance under current tax code.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Depreciation Schedule Table */}
            <div className="bg-white border border-[#EEF1F6] rounded-[10px] shadow-sm flex flex-col w-full overflow-hidden mt-1">
              <div className="p-5 border-b border-[#EEF1F6]">
                <h3 className="text-[#111827] text-[14px] font-[800] tracking-tight">Depreciation Schedule</h3>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-[#F8FAFC]">
                      <th className="py-3 px-5 text-[10px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">FINANCIAL YEAR</th>
                      <th className="py-3 px-5 text-[10px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">OPENING VALUE (₦)</th>
                      <th className="py-3 px-5 text-[10px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">DEPRECIATION (₦)</th>
                      <th className="py-3 px-5 text-[10px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">CLOSING VALUE (₦)</th>
                      <th className="py-3 px-5 text-[10px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%] text-right pr-6">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    
                    {/* Row 1 */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 text-[13px] font-[600] text-[#64748B]">FY 2021/22</td>
                      <td className="py-3.5 px-5 text-[13px] font-[600] text-[#475569]">450,000.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[600] text-[#475569]">85,000.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[600] text-[#475569]">365,000.00</td>
                      <td className="py-3.5 px-5 pr-6 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#64748B] text-[10px] font-[800] uppercase tracking-wider">
                          REALIZED
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 (Current) active */}
                    <tr className="bg-[#EFF6FF]/40 border-l-[3px] border-l-[#2563EB]">
                      <td className="py-3.5 px-5 pl-[17px] text-[13px] font-[800] text-[#2563EB]">FY 2022/23 (Current)</td>
                      <td className="py-3.5 px-5 text-[13px] font-[800] text-[#111827]">
                        410,000.00 <span className="text-[#16A34A] text-[10px] font-[700] ml-1">(post upgrade)</span>
                      </td>
                      <td className="py-3.5 px-5 text-[13px] font-[800] text-[#EF4444]">79,500.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[800] text-[#2563EB]">330,500.00</td>
                      <td className="py-3.5 px-5 pr-6 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[10px] font-[800] uppercase tracking-wider">
                          ACTIVE
                        </span>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#94A3B8]">FY 2023/24</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">330,500.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">82,100.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">248,400.00</td>
                      <td className="py-3.5 px-5 pr-6 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-white border border-[#E2E8F0] text-[#94A3B8] text-[10px] font-[700] uppercase tracking-wider">
                          PROJECTED
                        </span>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#94A3B8]">FY 2024/25</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">248,400.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">82,100.00</td>
                      <td className="py-3.5 px-5 text-[13px] font-[500] text-[#64748B]">166,300.00</td>
                      <td className="py-3.5 px-5 pr-6 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-white border border-[#E2E8F0] text-[#94A3B8] text-[10px] font-[700] uppercase tracking-wider">
                          PROJECTED
                        </span>
                      </td>
                    </tr>

                  </tbody>
                </table>
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
