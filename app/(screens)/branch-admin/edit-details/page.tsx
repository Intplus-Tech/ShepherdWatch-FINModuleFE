"use client";

import React from "react";
import { Inter } from "next/font/google";
import { withSuspense } from "@/lib/withSuspense";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Info,
  Settings,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AssetsHubPage from "../asset/page";
import { useAsset, type AssetDetail } from "@/components/hooks/useAsset";
import { useUpdateAsset } from "@/components/hooks/useUpdateAsset";

const inter = Inter({ subsets: ["latin"] });

function getString(asset: AssetDetail | null, ...keys: string[]): string {
  if (!asset) return "";
  for (const k of keys) {
    const v = asset[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}

function toDateInputValue(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toISOString().slice(0, 10);
}

function EditAssetDetailsModalPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id") ?? searchParams.get("assetId");
  const { asset, isLoading, error } = useAsset(assetId);
  const updateAsset = useUpdateAsset(assetId);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [serialNumber, setSerialNumber] = React.useState("");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [condition, setCondition] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [techSpecs, setTechSpecs] = React.useState("");
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (!asset || hydrated) return;
    setName(getString(asset, "name", "assetName"));
    setCategory(getString(asset, "assetClassName", "category"));
    setSerialNumber(getString(asset, "serialNumber"));
    setPurchaseDate(toDateInputValue(getString(asset, "purchaseDate", "createdAt")));
    setCondition(getString(asset, "condition"));
    setLocation(getString(asset, "location", "branchName"));
    const rawSpecs = (asset as Record<string, unknown>)["technicalSpecs"];
    if (Array.isArray(rawSpecs)) {
      setTechSpecs(
        rawSpecs
          .map((s) =>
            typeof s === "string"
              ? s
              : s && typeof s === "object" && "label" in (s as Record<string, unknown>)
                ? String((s as Record<string, unknown>).label)
                : JSON.stringify(s)
          )
          .join("\n")
      );
    } else if (typeof rawSpecs === "string") {
      setTechSpecs(rawSpecs);
    }
    setHydrated(true);
  }, [asset, hydrated]);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/branch-admin/asset");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!assetId) {
      setSubmitError("Missing asset id.");
      return;
    }
    const payload: Record<string, unknown> = {
      name: name.trim(),
      serialNumber: serialNumber.trim() || null,
      condition: condition.toLowerCase() || null,
      location: location.trim() || null,
    };
    if (category.trim()) payload.assetClassName = category.trim();
    if (purchaseDate) payload.purchaseDate = purchaseDate;
    const specsArray = techSpecs
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (specsArray.length > 0) payload.technicalSpecs = specsArray;
    try {
      await updateAsset.mutateAsync(payload);
      setSubmitSuccess("Asset updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update asset.";
      setSubmitError(message);
    }
  };

  const headerName = name || getString(asset, "name", "assetName") || "Loading…";
  const headerId = assetId ?? getString(asset, "id", "_id");

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
          className="bg-white w-full max-w-[750px] rounded-[16px] sm:rounded-[20px] flex flex-col animate-in fade-in zoom-in-95 duration-200 shadow-2xl relative my-auto scrollbar-hide" 
          style={{ boxShadow: "0px 20px 40px rgba(0,0,0,0.15), 0px 4px 10px rgba(0,0,0,0.05)" }}
        >
          
          {/* Header Block */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 flex items-start justify-between border-b border-[#EEF1F6]">
            <div className="flex items-start gap-4">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5 text-[#2563EB] stroke-[2px]" />
              </div>
              <div className="flex flex-col gap-1 pt-0.5">
                <h2 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] leading-tight tracking-tight">Edit Asset Details</h2>
                <p className="text-[#64748B] text-[13.5px] font-[500]">
                  ID: {headerId ? `#${headerId}` : "—"} • {headerName}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0 text-[#9CA3AF]">
              <X className="h-5 w-5 stroke-[2px]" />
            </button>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col gap-10 overflow-y-auto max-h-[70vh] no-scrollbar">
            
            {/* General Information Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F5F9]">
                <Info className="w-4 h-4 text-[#2563EB] stroke-[2.5px]" />
                <h3 className="text-[#111827] text-[12px] font-[800] uppercase tracking-widest">General Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
                
                {/* Asset Name (Full Width) */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Asset Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-[44px] w-full px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Category</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] px-3.5 outline-none"
                    />
                  </div>
                </div>

                {/* Serial Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Serial Number</label>
                  <input 
                    type="text" 
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="h-[44px] w-full px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[14px] font-[500] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]" 
                  />
                </div>

                {/* Purchase Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Purchase Date</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all group">
                    <input 
                      type="date" 
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none cursor-text placeholder:text-[#9CA3AF]" 
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0 pointer-events-none">
                      <Calendar className="w-4 h-4 text-[#64748B] stroke-[2px]" />
                    </div>
                  </div>
                </div>

                {/* Current Condition */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Current Condition</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <select
                      value={condition.toLowerCase()}
                      onChange={(e) => setCondition(e.target.value)}
                      className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] pl-3.5 pr-10 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>

                {/* Current Location (Full Width) */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[#64748B] text-[11px] font-[800] uppercase tracking-wide">Current Location</label>
                  <div className="relative flex items-center h-[44px] w-full rounded-[8px] border border-[#CBD5E1] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:border-[#2563EB] transition-all">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 h-full w-full bg-transparent text-[#111827] text-[14px] font-[500] px-3.5 outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Technical Specifications Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F5F9]">
                <Settings className="w-4 h-4 text-[#2563EB] stroke-[2.5px]" />
                <h3 className="text-[#111827] text-[12px] font-[800] uppercase tracking-widest">Technical Specifications</h3>
              </div>
              
              <div className="flex flex-col w-full">
                <textarea 
                  value={techSpecs}
                  onChange={(e) => setTechSpecs(e.target.value)}
                  placeholder={`Intel Core i7-10700 (8-Core, 16MB Cache)\n16GB DDR4 RAM 2933MHz\n512GB PCIe NVMe Class 40 SSD`}
                  rows={5}
                  className="w-full p-4 rounded-[8px] border border-[#CBD5E1] bg-white text-[#111827] text-[13.5px] font-[500] leading-relaxed outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all resize-none"
                />
              </div>
            </div>

            {!assetId ? (
              <div className="flex items-center gap-2 text-[#CA8A04] text-[13px] font-[600]">
                <AlertCircle className="w-4 h-4" /> Missing asset id in URL.
              </div>
            ) : isLoading && !asset ? (
              <div className="flex items-center gap-2 text-[#64748B] text-[13px] font-[600]">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading asset…
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-[#DC2626] text-[13px] font-[600]">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            ) : null}
            {submitError ? (
              <div className="flex items-center gap-2 text-[#DC2626] text-[13px] font-[600]">
                <AlertCircle className="w-4 h-4" /> {submitError}
              </div>
            ) : null}
            {submitSuccess ? (
              <div className="flex items-center gap-2 text-[#16A34A] text-[13px] font-[600]">
                <CheckCircle2 className="w-4 h-4" /> {submitSuccess}
              </div>
            ) : null}

          </div>

          {/* Footer Navigation Bar */}
          <div className="px-6 sm:px-8 py-5 border-t border-[#EEF1F6] bg-white flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-[16px] sm:rounded-b-[20px]">
            <button onClick={handleClose} type="button" className="h-[44px] px-6 rounded-[8px] bg-white border border-[#D1D5DB] text-[#4B5563] text-[14px] font-[800] hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              Discard Changes
            </button>
            <button onClick={handleSubmit} type="button" disabled={!assetId || updateAsset.isPending} className="h-[44px] px-6 rounded-[8px] bg-[#2563EB] flex items-center justify-center gap-2 text-white text-[14px] font-[800] hover:bg-[#1D4ED8] transition-colors shadow-sm w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">
              {updateAsset.isPending ? (
                <Loader2 className="w-[18px] h-[18px] stroke-[2.5px] animate-spin" />
              ) : (
                <CheckCircle2 className="w-[18px] h-[18px] stroke-[2.5px]" />
              )}
              {updateAsset.isPending ? "Updating…" : "Update Asset"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
const EditAssetDetailsModalPage = withSuspense(EditAssetDetailsModalPageInner);
export default EditAssetDetailsModalPage;