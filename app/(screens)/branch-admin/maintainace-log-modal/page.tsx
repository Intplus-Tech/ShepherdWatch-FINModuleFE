"use client";

import React from "react";
import { Inter } from "next/font/google";
import { withSuspense } from "@/lib/withSuspense";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Truck, Box, Monitor, Trash2 } from "lucide-react";
import AssetsHubPage from "../asset/page";
import { useAsset, type AssetDetail } from "@/components/hooks/useAsset";

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

function MaintenanceLogModalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id");
  const { asset } = useAsset(assetId);

  const headerName = getString(asset, "name", "assetName") || "—";
  const headerCategory = getString(asset, "assetClassName", "category", "assetType") || "—";
  const headerCondition = getString(asset, "condition") || "—";
  const headerLocation = getString(asset, "location") || "—";
  const headerId = getString(asset, "id", "_id") || assetId || "";

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
          className="bg-white w-full max-w-[850px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
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
          <div className="px-6 sm:px-8 border-b border-[#E2E8F0] pt-1.5">
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                General Info
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Maintenance History
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-[#2563EB] text-[#2563EB] text-[14px] font-[800] whitespace-nowrap">
                Movement Log
              </button>
              <button className="pb-3.5 border-b-[2.5px] border-transparent text-[#64748B] hover:text-[#334155] hover:border-[#CBD5E1] text-[14px] font-[700] whitespace-nowrap transition-colors">
                Financial Impact
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 w-full">
            
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-[#111827] text-[16px] font-[800] leading-tight tracking-tight">Asset Journey Log</h3>
                <p className="text-[#64748B] text-[13.5px] font-[500]">Complete tracking history of the asset within branch departments and rooms.</p>
              </div>
              <button className="h-[40px] sm:h-[44px] px-5 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2.5 text-[13.5px] font-[800] text-white hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0">
                <Truck className="h-4 w-4 stroke-[2.5px]" />
                Log New Movement
              </button>
            </div>

            {/* Main Log Table */}
            <div className="border border-[#EEF1F6] rounded-[10px] overflow-hidden bg-white shadow-sm mt-1">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[750px]">
                  <thead>
                    <tr className="border-b border-[#EEF1F6] bg-white">
                      <th className="py-4 px-5 text-[10.5px] font-[800] uppercase tracking-widest text-[#64748B] w-[15%]">TRANSFER DATE</th>
                      <th className="py-4 px-5 text-[10.5px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">FROM</th>
                      <th className="py-4 px-5 text-[10.5px] font-[800] uppercase tracking-widest text-[#64748B] w-[25%]">TO</th>
                      <th className="py-4 px-5 text-[10.5px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">HANDLED BY</th>
                      <th className="py-4 px-5 pr-6 text-[10.5px] font-[800] uppercase tracking-widest text-[#64748B] w-[20%]">REASON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F6]">
                    
                    {/* Row 1 */}
                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-[#111827] text-[14px] font-[800]">Oct 12, 2023</span>
                          <span className="text-[#64748B] text-[12.5px] font-[500]">09:15 AM</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <Box className="w-[15px] h-[15px] text-[#94A3B8] stroke-[2px] shrink-0" />
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Storage A</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <Monitor className="w-[15px] h-[15px] text-[#3B82F6] stroke-[2px] shrink-0" />
                          <span className="text-[#2563EB] text-[13.5px] font-[600] leading-snug cursor-pointer hover:underline">Main Office - Desk 4</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <div className="w-5 h-5 rounded-full bg-[#8B5A2B] shrink-0"></div>
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Admin (S. Adebayo)</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 pr-6 align-top">
                        <p className="text-[#64748B] text-[13.5px] font-[400] italic pt-0.5 leading-snug">
                          Deployment to new staff
                        </p>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-[#111827] text-[14px] font-[800]">Sep 28, 2023</span>
                          <span className="text-[#64748B] text-[12.5px] font-[500]">02:30 PM</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Repair Center</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Storage A</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">M. Smith</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 pr-6 align-top">
                        <p className="text-[#64748B] text-[13.5px] font-[400] italic pt-0.5 leading-snug">
                          Returned from maintenance
                        </p>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-[#111827] text-[14px] font-[800]">Sep 20, 2023</span>
                          <span className="text-[#64748B] text-[12.5px] font-[500]">11:00 AM</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Main Office</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Repair Center</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">T. Williams</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 pr-6 align-top">
                        <p className="text-[#64748B] text-[13.5px] font-[400] italic pt-0.5 leading-snug">
                          Fan replacement scheduled
                        </p>
                      </td>
                    </tr>

                    {/* Row 4 */}
                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-[#111827] text-[14px] font-[800]">Aug 15, 2021</span>
                          <span className="text-[#64748B] text-[12.5px] font-[500]">08:00 AM</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">N/A (New)</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Central Store</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <span className="text-[#334155] text-[13.5px] font-[500] leading-snug">Admin</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 pr-6 align-top">
                        <p className="text-[#64748B] text-[13.5px] font-[400] italic pt-0.5 leading-snug">
                          Initial intake/procurement
                        </p>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification Info Box */}
            <div className="mt-2 border border-[#EEF1F6] rounded-[10px] p-5 sm:p-6 flex flex-col bg-white shadow-sm">
              <h4 className="text-[#64748B] text-[10.5px] font-[800] uppercase tracking-widest mb-4">Verification Info</h4>
              
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B] text-[13.5px] font-[500]">Last Verified On</span>
                  <span className="text-[#111827] text-[14px] font-[700] tracking-tight">Oct 12, 2023</span>
                </div>
                
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
                  <span className="text-[#64748B] text-[13.5px] font-[500]">Verified By</span>
                  <span className="text-[#111827] text-[14px] font-[700] tracking-tight">Sarah Admin</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] text-[13.5px] font-[500]">Audit Status</span>
                  <span className="text-[#16A34A] text-[14px] font-[800] tracking-tight">Confirmed In-Place</span>
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

const MaintenanceLogModalPage = withSuspense(MaintenanceLogModalPageInner);
export default MaintenanceLogModalPage;
