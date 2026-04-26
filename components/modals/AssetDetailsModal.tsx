"use client"

import React from "react"
import { X, Pencil, Tag } from "lucide-react"

export type DepreciationHistoryEntry = {
  yearNumber: string;
  year: string;
  amount: string;
  isYTD?: boolean;
}

export type AssetDetails = {
  name: string;
  location: string;
  category: string;
  cost: string;
  purchaseDate: string;
  depreciationMethod: string;
  usefulLife: string;
  residualValue: string;
  accumulatedDepreciation: string;
  currentNBV: string;
  history: DepreciationHistoryEntry[];
}

type AssetDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  asset?: AssetDetails;
}

// Fallback empty data if none provided so the modal doesn't crash
const defaultAsset: AssetDetails = {
  name: "Asset Name",
  location: "Location",
  category: "-",
  cost: "₦0",
  purchaseDate: "-",
  depreciationMethod: "-",
  usefulLife: "-",
  residualValue: "-",
  accumulatedDepreciation: "₦0",
  currentNBV: "₦0",
  history: []
}

export default function AssetDetailsModal({ isOpen, onClose, asset = defaultAsset }: AssetDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-[500px] rounded-[12px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">{asset.name}</h2>
            <p className="text-[13px] text-[#6B7280] mt-1">{asset.location}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Category</span>
              <span className="font-medium text-[#111827]">{asset.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Cost</span>
              <span className="font-medium text-[#111827]">{asset.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Purchase Date</span>
              <span className="font-medium text-[#111827]">{asset.purchaseDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Depreciation Method</span>
              <span className="font-medium text-[#111827]">{asset.depreciationMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Useful Life</span>
              <span className="font-medium text-[#111827]">{asset.usefulLife}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Residual Value</span>
              <span className="font-medium text-[#111827]">{asset.residualValue}</span>
            </div>
          </div>

          {/* Highlight Box */}
          <div className="mt-6 rounded-[8px] bg-[#F8FAFC] p-4 flex flex-col gap-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">Accumulated Depreciation</span>
              <span className="text-[#6B7280]">{asset.accumulatedDepreciation}</span>
            </div>
            <div className="h-[1px] w-full bg-[#E2E8F0]"></div>
            <div className="flex justify-between text-[13px]">
              <span className="font-[600] text-[#111827]">Current NBV</span>
              <span className="font-[600] text-[#111827]">{asset.currentNBV}</span>
            </div>
          </div>

          {/* Depreciation History */}
          <div className="mt-8">
            <h3 className="text-[11px] font-[600] uppercase tracking-wider text-[#9CA3AF] mb-5">
              Depreciation History
            </h3>
            <div className="flex flex-col gap-0 relative">
              {asset.history.length > 0 ? (
                asset.history.map((entry, idx) => {
                  const isLast = idx === asset.history.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-4 pb-5 group">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className="absolute left-[5px] top-2 bottom-[-10px] w-[2px] bg-[#EEF1F6]"></div>
                      )}
                      
                      {/* Timeline Dot */}
                      <div className="relative z-10 mt-1">
                        {isLast ? (
                          <div className="h-3 w-3 rounded-full bg-[#111827]"></div>
                        ) : (
                          <div className="h-3 w-3 rounded-full border-2 border-[#D1D5DB] bg-white"></div>
                        )}
                      </div>
                      
                      {/* Timeline Content */}
                      <div className="flex flex-1 justify-between items-center text-[13px]">
                        <div className="flex items-center gap-2">
                          <span className={isLast ? "text-[#6B7280]" : "text-[#9CA3AF]"}>
                            {entry.yearNumber} ({entry.year})
                          </span>
                          {entry.isYTD && (
                            <span className="rounded-[4px] border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
                              YTD
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-[#111827]">{entry.amount}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[13px] text-[#6B7280]">No history available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-6 py-4 bg-white">
          <button 
            onClick={onClose}
            className="rounded-[6px] border border-[#D1D5DB] px-4 py-2 text-[13px] font-[600] text-[#374151] hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-[6px] border border-[#D1D5DB] px-4 py-2 text-[13px] font-[600] text-[#374151] bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit Asset
            </button>
            <button className="flex items-center gap-2 rounded-[6px] bg-[#3B5BDB] px-4 py-2 text-[13px] font-[600] text-white shadow hover:bg-blue-700 transition-colors">
              <Tag className="h-3.5 w-3.5" />
              Mark as Sold
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
