"use client";

import React, { useMemo } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { X, Calendar, ChevronDown, ListFilter, Download, Printer, LayoutGrid, Laptop, Video, Table as TableIcon } from "lucide-react";
import AssetsHubPage from "../asset/page";
import { useAssetMovements, type AssetMovement } from "@/components/hooks/useAssetMovements";

const inter = Inter({ subsets: ["latin"] });

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function splitDateTime(value: string): { date: string; time: string } {
  if (!value || value === "—") return { date: "—", time: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: value, time: "" };
  return {
    date: d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
  };
}

// Mock data based directly on Figma reference
const movementData = [
  {
    date: "Oct 24, 2023",
    time: "09:42 AM",
    asset: "HP LaserJet Pro M404n",
    icon: <Printer className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
    iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
    from: "IT Storage",
    to: "Front Desk",
    toDot: "bg-[#22C55E]",
    handledBy: "J. Doe",
    handledByInitials: "JD",
    handledByBg: "bg-[#E0E7FF] text-[#4338CA]",
    reason: "Printer replacement request"
  },
  {
    date: "Oct 24, 2023",
    time: "08:15 AM",
    asset: "Meeting Room Chair #4",
    icon: <LayoutGrid className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
    iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
    from: "Meeting Room A",
    to: "Storage B",
    toDot: "bg-[#F97316]",
    handledBy: "M. Smith",
    handledByInitials: "MS",
    handledByBg: "bg-[#FCE7F3] text-[#BE185D]",
    reason: "Broken leg - needs repair"
  },
  {
    date: "Oct 23, 2023",
    time: "04:30 PM",
    asset: 'MacBook Pro 16"',
    icon: <Laptop className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
    iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
    from: "IT Department",
    to: "Sarah K. (Staff)",
    toDot: "bg-[#3B82F6]",
    handledBy: "Admin",
    handledByInitials: "AD",
    handledByBg: "bg-[#E2E8F0] text-[#334155]",
    reason: "New staff allocation"
  },
  {
    date: "Oct 22, 2023",
    time: "11:00 AM",
    asset: "Canon XA11 Camcorder",
    icon: <Video className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
    iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
    from: "AV Studio",
    to: "Main Sanctuary",
    toDot: "bg-[#22C55E]",
    handledBy: "D. King",
    handledByInitials: "DK",
    handledByBg: "bg-[#CCFBF1] text-[#0F766E]",
    reason: "Sunday Service Streaming"
  },
  {
    date: "Oct 21, 2023",
    time: "02:30 PM",
    asset: "Foldable Table (White)",
    icon: <TableIcon className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
    iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
    from: "Storage B",
    to: "Courtyard",
    toDot: "bg-[#EAB308]",
    handledBy: "R. Taylor",
    handledByInitials: "RT",
    handledByBg: "bg-[#FFEDD5] text-[#C2410C]",
    reason: "Community Picnic Setup"
  },
];

const TO_DOTS = ["bg-[#22C55E]", "bg-[#F97316]", "bg-[#3B82F6]", "bg-[#EAB308]"];
const HANDLER_BGS = [
  "bg-[#E0E7FF] text-[#4338CA]",
  "bg-[#FCE7F3] text-[#BE185D]",
  "bg-[#E2E8F0] text-[#334155]",
  "bg-[#CCFBF1] text-[#0F766E]",
  "bg-[#FFEDD5] text-[#C2410C]",
];

export default function MovementLogModalPage() {
  const router = useRouter();
  const { items: movementItems, isLoading } = useAssetMovements();

  const liveRows = useMemo(() => {
    return movementItems.map((m: AssetMovement, idx) => {
      const handler = String(m.handledBy ?? m.movedBy ?? "—");
      const { date, time } = splitDateTime(String(m.movedAt ?? m.createdAt ?? ""));
      return {
        date,
        time,
        asset: String(m.assetName ?? m.assetId ?? "Asset"),
        icon: <LayoutGrid className="w-[15px] h-[15px] text-[#64748B] stroke-[2px]" />,
        iconBg: "bg-[#F1F5F9] border border-[#E2E8F0]",
        from: String(m.fromLocation ?? "—"),
        to: String(m.toLocation ?? "—"),
        toDot: TO_DOTS[idx % TO_DOTS.length],
        handledBy: handler,
        handledByInitials: initialsOf(handler),
        handledByBg: HANDLER_BGS[idx % HANDLER_BGS.length],
        reason: String(m.reason ?? m.movementType ?? "—"),
      };
    });
  }, [movementItems]);

  const rows = liveRows.length > 0 ? liveRows : movementData;

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
          className="bg-white w-full max-w-[1050px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[#111827] text-[18px] sm:text-[22px] font-[800] leading-tight tracking-tight">Full Movement History</h2>
              <p className="text-[#6B7280] text-[13px] sm:text-[14px] font-[500]">Detailed log of all asset movements within the branch.</p>
            </div>
            <button onClick={() => router.back()} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-7 flex flex-col gap-5 sm:gap-6">
            
            {/* Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              
              {/* Left Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Start Date */}
                  <div className="relative flex items-center h-[42px] min-w-[150px] rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all group hover:border-[#94A3B8]">
                    <div className="h-full pl-3.5 pr-2.5 flex items-center justify-center text-[#9CA3AF] shrink-0">
                      <Calendar className="w-4 h-4 stroke-[2px]" />
                    </div>
                    <input type="text" placeholder="Start Date" readOnly className="flex-1 h-full w-full bg-transparent text-[#111827] text-[13.5px] font-[500] placeholder:text-[#9CA3AF] outline-none cursor-pointer" />
                  </div>
                  <span className="text-[#9CA3AF] font-[500]">-</span>
                  {/* End Date */}
                  <div className="relative flex items-center h-[42px] min-w-[150px] rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all group hover:border-[#94A3B8]">
                    <div className="h-full pl-3.5 pr-2.5 flex items-center justify-center text-[#9CA3AF] shrink-0">
                      <Calendar className="w-4 h-4 stroke-[2px]" />
                    </div>
                    <input type="text" placeholder="End Date" readOnly className="flex-1 h-full w-full bg-transparent text-[#111827] text-[13.5px] font-[500] placeholder:text-[#9CA3AF] outline-none cursor-pointer" />
                  </div>
                </div>

                {/* Filter by Category */}
                <div className="relative flex items-center h-[42px] min-w-[180px] w-full sm:w-auto rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all group hover:border-[#94A3B8]">
                  <div className="h-full pl-3.5 pr-2.5 flex items-center justify-center text-[#9CA3AF] shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-network text-[#94A3B8]">
                      <rect x="16" y="16" width="6" height="6" rx="1" />
                      <rect x="2" y="16" width="6" height="6" rx="1" />
                      <rect x="9" y="2" width="6" height="6" rx="1" />
                      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
                      <path d="M12 12V8" />
                    </svg>
                  </div>
                  <select className="flex-1 h-full w-full bg-transparent text-[#111827] text-[13.5px] font-[500] pl-1 pr-10 outline-none appearance-none cursor-pointer">
                    <option value="">Filter by Category</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Right Filters */}
              <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                <button className="h-[42px] px-4 rounded-[8px] bg-white border border-[#CBD5E1] flex items-center justify-center gap-2.5 text-[13.5px] font-[700] text-[#334155] hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                  <ListFilter className="h-4 w-4 text-[#64748B] stroke-[2px]" />
                  More Filters
                </button>
                <button className="h-[42px] px-5 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2.5 text-[13.5px] font-[700] text-white hover:bg-[#1D4ED8] transition-colors shadow-sm shrink-0">
                  <Download className="h-4 w-4 stroke-[2.5px]" />
                  Export CSV
                </button>
              </div>

            </div>

            {/* Main Table */}
            <div className="w-full overflow-x-auto border-t border-b border-[#EEF1F6] mt-1 -mx-6 sm:-mx-8 px-6 sm:px-8 py-0.5">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEF1F6]">
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[15%]">DATE & TIME</th>
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[22%]">ASSET NAME</th>
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[18%]">FROM</th>
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[15%]">TO</th>
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[15%]">HANDLED BY</th>
                    <th className="py-4 pb-3.5 text-[11px] font-[800] uppercase tracking-widest text-[#94A3B8] w-[15%]">REASON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1F6]">
                  {isLoading && liveRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-[13px] font-[500] text-[#64748B]">Loading movements…</td>
                    </tr>
                  )}
                  {rows.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-[#F8FAFC] transition-colors w-full cursor-pointer">
                      {/* Date & Time */}
                      <td className="py-4 align-top">
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <span className="text-[13.5px] font-[800] text-[#111827] leading-tight">{item.date}</span>
                          <span className="text-[12.5px] font-[500] text-[#64748B]">{item.time}</span>
                        </div>
                      </td>
                      
                      {/* Asset Name */}
                      <td className="py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                            {item.icon}
                          </div>
                          <span className="text-[14px] font-[700] text-[#2563EB] hover:underline cursor-pointer truncate pr-2 leading-snug pt-0.5">
                            {item.asset}
                          </span>
                        </div>
                      </td>

                      {/* From Location */}
                      <td className="py-4 align-top">
                        <div className="text-[13.5px] font-[500] text-[#475569] pt-[7px] truncate">
                          {item.from}
                        </div>
                      </td>

                      {/* To Location */}
                      <td className="py-4 align-top">
                        <div className="inline-flex items-center gap-2 mt-[6px] pl-1 pr-2.5 py-1 bg-white border border-[#E2E8F0] rounded-full shadow-sm max-w-full">
                          <div className={`w-2 h-2 rounded-full ${item.toDot} shrink-0`}></div>
                          <span className="text-[12px] font-[800] text-[#334155] truncate leading-none pt-[1px]">{item.to}</span>
                        </div>
                      </td>

                      {/* Handled By */}
                      <td className="py-4 align-top">
                        <div className="flex items-center gap-2.5 pt-1.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-[800] tracking-wider shrink-0 ${item.handledByBg}`}>
                            {item.handledByInitials}
                          </div>
                          <span className="text-[13px] font-[600] text-[#475569] truncate">
                            {item.handledBy}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-4 align-top">
                        <div className="text-[13px] font-[500] text-[#64748B] pt-2 line-clamp-2">
                          {item.reason}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-2 gap-4">
              <div className="text-[13.5px] font-[500] text-[#64748B]">
                Showing <span className="font-[800] text-[#111827]">1-5</span> of <span className="font-[800] text-[#111827]">124</span> results
              </div>
              <div className="flex items-center gap-2.5">
                <button className="h-[36px] px-4 rounded-[6px] bg-white border border-[#E2E8F0] text-[#94A3B8] text-[13px] font-[700] cursor-not-allowed flex flex-col justify-center">
                  Previous
                </button>
                <button className="h-[36px] px-4 rounded-[6px] bg-white border border-[#E2E8F0] text-[#111827] text-[13px] font-[700] hover:bg-gray-50 hover:border-[#CBD5E1] transition-colors shadow-sm flex flex-col justify-center">
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
