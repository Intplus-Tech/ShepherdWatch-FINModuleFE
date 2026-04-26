"use client"

import React from "react"
import { X, Calendar, AlertCircle, ChevronDown } from "lucide-react"

export type DepreciationHistoryEntry = {
  yearNumber: string;
  year: string;
  amount: string;
  isYTD?: boolean;
}

export type AssetSaleDetails = {
  branchName: string;
  location: string;
  assetName: string;
  saleDate: string;
  saleAmount: string;
  buyerName: string;
  buyerContact: string;
  reasonForSale: string;
  proceedsToAccount: string;
  history: DepreciationHistoryEntry[];
}

type RecordAssetSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  saleDetails?: AssetSaleDetails;
}

const defaultSaleDetails: AssetSaleDetails = {
  branchName: "Agodi, Ibadan",
  location: "Maryland, Lagos",
  assetName: "Projector (Epson) - IT Equipment",
  saleDate: "10 Apr 2025",
  saleAmount: "Projector (Epson) - IT Equipment",
  buyerName: "Light City School",
  buyerContact: "08012345678",
  reasonForSale: "Upgraded to new model",
  proceedsToAccount: "Domiciliary / Naira",
  history: [
    { yearNumber: "Year 1", year: "2022", amount: "₦2,700,000" },
    { yearNumber: "Year 2", year: "2023", amount: "₦2,700,000" },
    { yearNumber: "Year 3", year: "2024", amount: "₦500,000", isYTD: true }
  ]
}

export default function RecordAssetSaleModal({ isOpen, onClose, saleDetails = defaultSaleDetails }: RecordAssetSaleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-[560px] rounded-[12px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#111827]">Record Asset Sale - {saleDetails.branchName}</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{saleDetails.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Form Fields (Read-Only Representation based on the UI) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">

            {/* Row 1 */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[12px] font-medium text-[#374151]">Asset</label>
              <input
                type="text"
                value={saleDetails.assetName}
                readOnly
                className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Sale Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={saleDetails.saleDate}
                  readOnly
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Calendar className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Sale Amount</label>
              <input
                type="text"
                value={saleDetails.saleAmount}
                readOnly
                className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Buyer Name</label>
              <input
                type="text"
                value={saleDetails.buyerName}
                readOnly
                className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Buyer Contact</label>
              <input
                type="text"
                value={saleDetails.buyerContact}
                readOnly
                className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
              />
            </div>

            {/* Row 4 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Reason for Sale</label>
              <input
                type="text"
                value={saleDetails.reasonForSale}
                readOnly
                className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
              />
            </div>
            <div className="hidden sm:block"></div>

            {/* Row 5 */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#374151]">Proceeds to Account</label>
              <div className="relative">
                <input
                  type="text"
                  value={saleDetails.proceedsToAccount}
                  readOnly
                  className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2.5 text-[13px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
            </div>
            <div className="hidden sm:block"></div>
          </div>

          {/* Workflow Alert Box */}
          <div className="mt-4 rounded-[8px] bg-[#F0FDF4] p-3.5 flex gap-3 border border-[#DCFCE7] bg-opacity-50">
            <AlertCircle className="h-5 w-5 text-[#374151] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-[13px]">
              <span className="font-bold text-[#111827]">Workflow</span>
              <div className="text-[#4B5563] flex flex-col gap-0.5 mt-1">
                <p>Branch Accountant submits sale request.</p>
                <p>Financial Director receives notification (Dashboard / Email).</p>
                <p>Financial Director in Asset Sales log -{'>'} pending approvals.</p>
              </div>
            </div>
          </div>

          {/* Depreciation History */}
          <div className="mt-5">
            <h3 className="text-[11px] font-[600] uppercase tracking-wider text-[#9CA3AF] mb-3">
              Depreciation History
            </h3>
            <div className="flex flex-col gap-0 relative">
              {saleDetails.history.length > 0 ? (
                saleDetails.history.map((entry, idx) => {
                  const isLast = idx === saleDetails.history.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-4 pb-3 group">
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
                        <span className="font-bold text-[#111827]">{entry.amount}</span>
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
            <button className="rounded-[6px] bg-[#E02424] px-4 py-2 text-[13px] font-[600] text-white shadow hover:bg-red-700 transition-colors">
              Reject Sales
            </button>
            <button className="rounded-[6px] bg-[#1A56DB] px-4 py-2 text-[13px] font-[600] text-white shadow hover:bg-blue-700 transition-colors">
              Approve Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
