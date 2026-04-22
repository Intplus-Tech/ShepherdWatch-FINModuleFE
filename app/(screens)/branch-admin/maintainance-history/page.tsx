"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Inter } from "next/font/google";
import { X, Plus, Trash2, Zap, CalendarDays, Wrench, RotateCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import AssetsHubPage from "../asset/page";

const inter = Inter({ subsets: ["latin"] });

type MaintenanceRecord = {
  _id?: string;
  id?: string;
  serviceType?: string;
  description?: string;
  provider?: string;
  cost?: number;
  currency?: string;
  status?: string;
  completedDate?: string;
  verifiedBy?: { _id?: string; firstName?: string; lastName?: string; email?: string };
};

export default function MaintenanceHistoryModalPage() {
  const { user } = useAuth();
  const [historyRecords, setHistoryRecords] = useState<MaintenanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historySummary, setHistorySummary] = useState<{ totalCost: number; count: number } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const branchId = useMemo(
    () => user?.branchId ?? user?.branch?.id ?? "",
    [user]
  );

  const formatDateParam = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (value: number, currency?: string) => {
    const cur = currency && ["NGN", "USD", "GBP", "EUR"].includes(currency) ? currency : "NGN";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!branchId) {
        setHistoryRecords([]);
        setHistoryError("Branch is required to load maintenance history.");
        return;
      }

      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const end = new Date();
        const start = new Date(end);
        start.setMonth(end.getMonth() - 11);
        start.setDate(1);

        const params = new URLSearchParams({
          branchId,
          startDate: formatDateParam(start),
          endDate: formatDateParam(end),
          page: "1",
          limit: "50",
        });

        const response = await fetch(`/api/maintenance/history?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load maintenance history.");
        }

        const payloadData = payload?.data ?? {};
        const records = payloadData?.data ?? payloadData?.items ?? payload?.data ?? [];
        const list = Array.isArray(records) ? records : [];
        const summary = payloadData?.summary ?? payload?.summary ?? null;

        if (isMounted) {
          setHistoryRecords(list);
          setHistorySummary(
            summary && typeof summary?.totalCost === "number" && typeof summary?.count === "number"
              ? summary
              : null
          );
        }
      } catch (error) {
        if (isMounted) {
          setHistoryRecords([]);
          setHistorySummary(null);
          setHistoryError(error instanceof Error ? error.message : "Unable to load maintenance history.");
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [branchId]);

  const historyTotal = useMemo(() => {
    if (historySummary?.totalCost) {
      return historySummary.totalCost;
    }
    return historyRecords.reduce((sum, record) => sum + (Number(record?.cost) || 0), 0);
  }, [historyRecords, historySummary]);

  const historyCount = useMemo(() => {
    if (historySummary?.count) {
      return historySummary.count;
    }
    return historyRecords.length;
  }, [historyRecords, historySummary]);

  const averageCost = useMemo(() => {
    if (!historyCount) return 0;
    return Math.round(historyTotal / historyCount);
  }, [historyTotal, historyCount]);

  const lastCompleted = useMemo(() => {
    const dates = historyRecords
      .map((record) => (record?.completedDate ? new Date(record.completedDate) : null))
      .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates[0] ?? null;
  }, [historyRecords]);

  const handleVerify = async (recordId: string) => {
    if (!recordId) return;
    setVerifyError(null);
    setVerifyingId(recordId);
    try {
      const response = await fetch(`/api/maintenance/${recordId}/verify`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to verify maintenance record.");
      }
      const verifiedBy = payload?.data?.verifiedBy ?? payload?.verifiedBy ?? null;
      setHistoryRecords((prev) =>
        prev.map((record) =>
          String(record?._id ?? record?.id ?? "") === recordId
            ? { ...record, verifiedBy }
            : record
        )
      );
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Unable to verify maintenance record.");
    } finally {
      setVerifyingId(null);
    }
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
          className="bg-white w-full max-w-[950px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] leading-tight tracking-tight">Asset Maintenance History</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
                    Category Unavailable
                  </div>
                  <div className="px-2.5 py-1 bg-[#FEF9C3] text-[#CA8A04] text-[11px] font-[800] uppercase tracking-wider rounded-[6px]">
                    Condition Unavailable
                  </div>
                </div>
              </div>
              <p className="text-[#64748B] text-[13.5px] font-[500] tracking-wide">
                Asset ID: <span className="font-[700] text-[#475569]">Unavailable</span> • Branch Unavailable
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

                {historyLoading && (
                  <div className="text-[12.5px] font-[600] text-[#64748B] ml-8">Loading maintenance history...</div>
                )}
                {!historyLoading && historyError && (
                  <div className="text-[12.5px] font-[600] text-[#EF4444] ml-8">{historyError}</div>
                )}
                {!historyLoading && !historyError && verifyError && (
                  <div className="text-[12.5px] font-[600] text-[#EF4444] ml-8">{verifyError}</div>
                )}
                {!historyLoading && !historyError && historyRecords.length === 0 && (
                  <div className="text-[12.5px] font-[600] text-[#64748B] ml-8">No completed maintenance records found.</div>
                )}
                {historyRecords.map((record, index) => {
                  const type = String(record?.serviceType ?? "service").toLowerCase();
                  const isRepair = type === "repair";
                  const isRoutine = type === "routine";
                  const isInspection = type === "inspection";
                  const isReplacement = type === "replacement";

                  const Icon = isRepair ? Wrench : isInspection ? Zap : isReplacement ? RotateCw : CalendarDays;
                  const borderClass = isRepair
                    ? "border-[#F97316] text-[#F97316] group-hover:bg-[#FFF7ED]"
                    : isInspection
                      ? "border-[#EF4444] text-[#EF4444] group-hover:bg-[#FEF2F2]"
                      : isReplacement
                        ? "border-[#0EA5E9] text-[#0EA5E9] group-hover:bg-[#E0F2FE]"
                        : "border-[#3B82F6] text-[#3B82F6] group-hover:bg-[#EFF6FF]";
                  const badgeClass = isRepair
                    ? "bg-[#FEF9C3] text-[#CA8A04]"
                    : isInspection
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : isReplacement
                        ? "bg-[#E0F2FE] text-[#0284C7]"
                        : "bg-[#EFF6FF] text-[#2563EB]";

                  const completedAt = record?.completedDate ? new Date(record.completedDate) : null;
                  const dateLabel = completedAt
                    ? completedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "N/A";
                  const timeLabel = completedAt
                    ? completedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                    : "--:--";
                  const status = record?.status ? String(record.status).toUpperCase() : "COMPLETED";

                  return (
                    <div key={record?._id ?? record?.id ?? `history-${index}`} className="relative flex gap-4 sm:gap-6 w-full mb-6 group">
                      <div className="absolute -left-[19px] sm:-left-[19px] top-1">
                        <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-white ring-[10px] ring-white z-10 border-[1.5px] ${borderClass} transition-colors`}>
                          <Icon className="w-[17px] h-[17px] stroke-[2.5px]" />
                        </div>
                      </div>

                      <div className="flex-1 bg-white border border-[#EEF1F6] shadow-sm rounded-[12px] p-5 pt-4 flex flex-col gap-4 ml-8">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <h4 className="text-[#111827] text-[14.5px] sm:text-[15px] font-[800]">
                                {record?.description ?? "Maintenance Service"}
                              </h4>
                              <div className={`px-2 py-[2px] text-[9.5px] font-[800] uppercase tracking-wider rounded-[4px] ${badgeClass}`}>
                                {type.toUpperCase()}
                              </div>
                            </div>
                            <p className="text-[#94A3B8] text-[12.5px] font-[500]">{dateLabel} • {timeLabel}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">
                              {record?.cost !== undefined && record?.cost !== null
                                ? formatCurrency(record.cost, record.currency)
                                : "N/A"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-[13px] h-[13px] text-[#22C55E] stroke-[3px]" />
                              <span className="text-[#22C55E] text-[11.5px] font-[700]">{status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[#64748B] text-[12px] font-[500]">Service Provider</span>
                            <span className="text-[#334155] text-[13px] font-[600]">{record?.provider ?? "Unavailable"}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[#64748B] text-[12px] font-[500]">Status</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#334155] text-[13px] font-[600]">{status}</span>
                              {record?.verifiedBy ? (
                                <span className="text-[10px] font-[800] uppercase tracking-wider px-2 py-1 rounded-[6px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                                  Verified
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleVerify(String(record?._id ?? record?.id ?? ""))}
                                  disabled={verifyingId === String(record?._id ?? record?.id ?? "")}
                                  className="text-[10px] font-[800] uppercase tracking-wider px-2 py-1 rounded-[6px] bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {verifyingId === String(record?._id ?? record?.id ?? "")
                                    ? "Verifying..."
                                    : "Verify"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Right Column (Metrics Cards) */}
            <div className="flex-[4] flex flex-col gap-6 w-full xl:min-w-[320px]">
              
              {/* Financial Snapshot Vertical Card */}
              <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 pt-6 flex flex-col relative w-full">
                <h3 className="text-[#111827] text-[10.5px] font-[800] uppercase tracking-widest leading-snug mb-5 w-[60%]">
                  Maintenance<br className="xl:block hidden" /> Summary
                </h3>
                
                <div className="flex flex-col gap-4">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Completed Services</span>
                    <span className="text-[#111827] text-[14px] font-[800] tracking-tight">{historyCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Total Service Cost</span>
                    <span className="text-[#EF4444] text-[14px] font-[800] tracking-tight">
                      {formatCurrency(historyTotal, "NGN")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-[12.5px] font-[500]">Average Service Cost</span>
                    <span className="text-[#111827] text-[14px] font-[800] tracking-tight">
                      {formatCurrency(averageCost, "NGN")}
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{ width: historyCount > 0 ? "100%" : "0%" }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[#94A3B8] text-[10.5px] font-[700] tracking-wide">
                      <span>Records Tracked</span>
                      <span>{historyCount} Total</span>
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
                      <span className="text-[#64748B] text-[12px] font-[600]">Services in Period</span>
                      <span className="text-[#111827] text-[13.5px] font-[800]">{historyCount}</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-[15px] h-[15px] stroke-[3px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-[12px] font-[600]">Most Recent Service</span>
                      <span className="text-[#111827] text-[13.5px] font-[800]">
                        {lastCompleted
                          ? lastCompleted.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : "Unavailable"}
                      </span>
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


