"use client";

import React, { Suspense } from "react";
import { Inter } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  ShieldCheck,
  Cpu,
  HardDrive,
  Monitor,
  Plus,
  Trash2,
  CircuitBoard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AssetsHubPage from "../asset/page";
import { useAsset, type AssetDetail } from "@/components/hooks/useAsset";
import { formatCurrency, formatDate } from "@/lib/format";

const inter = Inter({ subsets: ["latin"] });

const CONDITION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  excellent: { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]", label: "Excellent Condition" },
  good: { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]", label: "Good Condition" },
  fair: { bg: "bg-[#FEF9C3]", text: "text-[#CA8A04]", label: "Fair Condition" },
  poor: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", label: "Poor Condition" },
};

function getString(asset: AssetDetail | null, ...keys: string[]): string | null {
  if (!asset) return null;
  for (const k of keys) {
    const v = asset[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return null;
}

function getNumber(asset: AssetDetail | null, ...keys: string[]): number | null {
  if (!asset) return null;
  for (const k of keys) {
    const v = asset[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

function DetailsGeneralInfoModalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id") ?? searchParams.get("assetId");
  const { asset, isLoading, error } = useAsset(assetId);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/branch-admin/asset");
  };

  const handleEdit = () => {
    if (!assetId) return;
    router.push(`/branch-admin/edit-details?id=${encodeURIComponent(assetId)}`);
  };

  const displayName =
    getString(asset, "name", "assetName") ?? (assetId ? "Asset Details" : "Select an Asset");
  const description = getString(asset, "description");
  const assetClassName = getString(asset, "assetClassName", "category");
  const conditionRaw = (getString(asset, "condition") ?? "").toLowerCase();
  const conditionStyle = CONDITION_STYLES[conditionRaw];
  const idLabel = getString(asset, "id", "_id");
  const location = getString(asset, "location", "branchName");
  const serialNumber = getString(asset, "serialNumber");
  const modelYear = getString(asset, "modelYear");
  const purchaseDate = getString(asset, "purchaseDate", "createdAt");
  const warrantyStatus = getString(asset, "warrantyStatus");
  const warrantyExpiry = getString(asset, "warrantyExpiry");
  const cost = getNumber(asset, "cost", "purchaseValue", "unitCost");
  const currentValue = getNumber(asset, "currentValue", "nbv", "value");
  const residualValue = getNumber(asset, "residualValue");

  let depreciationPct: number | null = null;
  if (cost && currentValue != null && cost > 0) {
    depreciationPct = ((cost - currentValue) / cost) * 100;
  }
  const remainingPct =
    depreciationPct != null ? Math.max(0, Math.min(100, 100 - depreciationPct)) : null;

  const techSpecs: string[] = (() => {
    const raw = (asset as Record<string, unknown> | null)?.["technicalSpecs"];
    if (Array.isArray(raw)) {
      return raw.map((s) =>
        typeof s === "string"
          ? s
          : s && typeof s === "object" && "label" in (s as Record<string, unknown>)
            ? String((s as Record<string, unknown>).label)
            : JSON.stringify(s)
      );
    }
    if (raw && typeof raw === "object") {
      return Object.entries(raw as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`);
    }
    return [];
  })();

  return (
    <div className={`relative min-h-[100dvh] w-full ${inter.className} antialiased`}>
      {/* Blurred Background Page */}
      <div className="fixed inset-0 z-0 h-full w-full overflow-hidden blur-[4px] opacity-60 pointer-events-none select-none">
        <AssetsHubPage />
      </div>

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-40 bg-[#111827]/50 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto">
        <div
          className="bg-white w-full max-w-[850px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto"
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-[#111827] text-[20px] sm:text-[22px] font-[900] leading-tight tracking-tight">
                  {isLoading && !asset ? "Loading…" : displayName}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {assetClassName && (
                    <div className="px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-[700] uppercase tracking-wider rounded-[6px]">
                      {assetClassName}
                    </div>
                  )}
                  {conditionStyle && (
                    <div
                      className={`px-2.5 py-1 ${conditionStyle.bg} ${conditionStyle.text} text-[11px] font-[700] uppercase tracking-wider rounded-[6px]`}
                    >
                      {conditionStyle.label}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[#64748B] text-[13.5px] font-[500] tracking-wide">
                Asset ID: <span className="font-[700] text-[#475569]">{idLabel ?? assetId ?? "—"}</span>
                {location && <> • {location}</>}
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]"
            >
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

          {/* States */}
          {!assetId && (
            <div className="px-6 sm:px-8 py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-[#CA8A04]" />
              <p className="text-[#475569] text-[14px] font-[600]">
                No asset selected. Open this page with{" "}
                <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded">?id=&lt;assetId&gt;</code>.
              </p>
            </div>
          )}

          {assetId && isLoading && !asset && (
            <div className="px-6 sm:px-8 py-12 flex items-center justify-center gap-3 text-[#64748B]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[14px] font-[600]">Loading asset…</span>
            </div>
          )}

          {assetId && error && !asset && (
            <div className="px-6 sm:px-8 py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-[#DC2626]" />
              <p className="text-[#DC2626] text-[14px] font-[700]">{error}</p>
            </div>
          )}

          {assetId && asset && (
            <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-8 sm:gap-10">
              {/* Left Column */}
              <div className="flex-1 flex flex-col gap-8">
                {/* Core Details */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">
                    Core Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                      <span className="text-[#64748B] text-[12px] font-[600]">Serial Number</span>
                      <span className="text-[#111827] text-[14.5px] font-[800] tracking-tight">
                        {serialNumber ?? "—"}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                      <span className="text-[#64748B] text-[12px] font-[600]">Model Year</span>
                      <span className="text-[#111827] text-[14.5px] font-[800]">
                        {modelYear ?? "—"}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                      <span className="text-[#64748B] text-[12px] font-[600]">Purchase Date</span>
                      <span className="text-[#111827] text-[14.5px] font-[800]">
                        {purchaseDate ? formatDate(purchaseDate) : "—"}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#EEF1F6] rounded-[10px] p-3.5 flex flex-col gap-1">
                      <span className="text-[#64748B] text-[12px] font-[600]">Warranty Status</span>
                      {warrantyStatus || warrantyExpiry ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <ShieldCheck className="w-4 h-4 text-[#16A34A] stroke-[2.5px]" />
                          <span className="text-[#16A34A] text-[13.5px] font-[700]">
                            {warrantyStatus ??
                              (warrantyExpiry ? `Active until ${formatDate(warrantyExpiry)}` : "—")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#111827] text-[14.5px] font-[800]">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description / Tech Specs */}
                {(description || techSpecs.length > 0) && (
                  <div className="flex flex-col gap-3.5">
                    <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">
                      {techSpecs.length > 0 ? "Technical Specs" : "Description"}
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      {techSpecs.length > 0 ? (
                        techSpecs.map((label, idx) => {
                          const Icon = [Cpu, CircuitBoard, HardDrive, Monitor][idx % 4];
                          return (
                            <div key={idx} className="flex items-center gap-3.5">
                              <Icon className="w-[18px] h-[18px] text-[#94A3B8] stroke-[2px]" />
                              <span className="text-[#334155] text-[14px] font-[500] leading-snug">
                                {label}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[#334155] text-[14px] font-[500] leading-snug">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col gap-6 w-full max-w-[400px]">
                {/* Financial Snapshot */}
                <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 flex flex-col relative w-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest">
                      Financial Snapshot
                    </h3>
                    <span
                      onClick={() =>
                        assetId &&
                        router.push(
                          `/director-screen/financial-impact-modal?id=${encodeURIComponent(assetId)}`
                        )
                      }
                      className="text-[#2563EB] text-[12px] font-[700] cursor-pointer hover:underline"
                    >
                      View Full Details
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Original Cost</span>
                      <span className="text-[#111827] text-[15px] sm:text-[16px] font-[800] tracking-tight">
                        {formatCurrency(cost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Current Value</span>
                      <span className="text-[#111827] text-[15px] sm:text-[16px] font-[800] tracking-tight">
                        {formatCurrency(currentValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] text-[13px] font-[500]">Residual Value</span>
                      <span className="text-[#111827] text-[14px] sm:text-[15px] font-[700] tracking-tight">
                        {formatCurrency(residualValue)}
                      </span>
                    </div>
                    {depreciationPct != null && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] text-[13px] font-[500]">
                          Depreciation (to date)
                        </span>
                        <span className="text-[#EF4444] text-[14px] sm:text-[15px] font-[800]">
                          - {depreciationPct.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {remainingPct != null && (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full"
                            style={{ width: `${remainingPct.toFixed(1)}%` }}
                          ></div>
                        </div>
                        <span className="text-[#94A3B8] text-[11px] font-[600] text-center tracking-wide">
                          {remainingPct.toFixed(0)}% of value remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest Activity (placeholder until activity API wired) */}
                <div className="bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.03)] rounded-[12px] p-5 flex flex-col relative w-full">
                  <h3 className="text-[#64748B] text-[11px] font-[800] uppercase tracking-widest mb-5">
                    Latest Activity
                  </h3>
                  <div className="flex flex-col relative pl-5 border-l-[2px] border-[#F1F5F9] pb-2">
                    <div className="relative mb-4 pb-2">
                      <div className="absolute w-[9px] h-[9px] bg-[#94A3B8] rounded-full -left-[25.5px] top-[4px] ring-4 ring-white"></div>
                      <div className="flex flex-col">
                        <span className="text-[#475569] text-[13px] font-[500] leading-snug">
                          Activity feed not yet available.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        assetId &&
                        router.push(
                          `/branch-admin/movement-log?id=${encodeURIComponent(assetId)}`
                        )
                      }
                      className="w-full mt-1 border border-dashed border-[#CBD5E1] rounded-[8px] py-3 flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <Plus className="w-[15px] h-[15px] text-[#3B82F6] stroke-[3px]" />
                      <span className="text-[#3B82F6] text-[13px] font-[800]">View Movement Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#EEF1F6] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
            <button
              disabled={!assetId}
              className="flex items-center gap-2 text-[#EF4444] hover:text-[#DC2626] transition-colors px-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-[15px] h-[15px] stroke-[2.5px]" />
              <span className="text-[14px] font-[800]">Retire Asset</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-none">
                Print Label
              </button>
              <button
                onClick={handleEdit}
                disabled={!assetId}
                className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] text-white text-[14px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailsGeneralInfoModalPage() {
  return (
    <Suspense fallback={null}>
      <DetailsGeneralInfoModalPageInner />
    </Suspense>
  );
}
