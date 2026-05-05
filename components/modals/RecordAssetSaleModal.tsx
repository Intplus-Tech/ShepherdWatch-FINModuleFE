"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Calendar, AlertCircle, ChevronDown, Trash2 } from "lucide-react"

const saleSchema = z.object({
  saleDate: z.string().min(1, "Sale date is required"),
  saleAmount: z
    .string()
    .min(1, "Sale amount is required")
    .refine((v) => {
      const n = Number(String(v).replace(/[,\s]/g, ""))
      return Number.isFinite(n) && n > 0
    }, "Enter a positive amount"),
  buyerName: z.string().min(1, "Buyer name is required"),
  buyerContact: z.string(),
  reasonForSale: z.string(),
  proceedsToAccount: z.string(),
})

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

export type AssetSaleFormValues = z.infer<typeof saleSchema>;

type RecordAssetSaleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  saleDetails?: AssetSaleDetails;
  mode?: "create" | "edit";
  onSubmit?: (values: AssetSaleFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  submitting?: boolean;
  deleting?: boolean;
  errorMessage?: string | null;
}

const defaultSaleDetails: AssetSaleDetails = {
  branchName: "",
  location: "",
  assetName: "",
  saleDate: "",
  saleAmount: "",
  buyerName: "",
  buyerContact: "",
  reasonForSale: "",
  proceedsToAccount: "",
  history: []
}

export default function RecordAssetSaleModal({
  isOpen,
  onClose,
  saleDetails = defaultSaleDetails,
  mode = "edit",
  onSubmit,
  onDelete,
  submitting = false,
  deleting = false,
  errorMessage = null,
}: RecordAssetSaleModalProps) {
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetSaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: saleDetails.saleDate,
      saleAmount: saleDetails.saleAmount,
      buyerName: saleDetails.buyerName,
      buyerContact: saleDetails.buyerContact,
      reasonForSale: saleDetails.reasonForSale,
      proceedsToAccount: saleDetails.proceedsToAccount,
    },
  })

  useEffect(() => {
    reset({
      saleDate: saleDetails.saleDate,
      saleAmount: saleDetails.saleAmount,
      buyerName: saleDetails.buyerName,
      buyerContact: saleDetails.buyerContact,
      reasonForSale: saleDetails.reasonForSale,
      proceedsToAccount: saleDetails.proceedsToAccount,
    })
  }, [
    reset,
    saleDetails.saleDate,
    saleDetails.saleAmount,
    saleDetails.buyerName,
    saleDetails.buyerContact,
    saleDetails.reasonForSale,
    saleDetails.proceedsToAccount,
  ])

  if (!isOpen) return null;

  const headerTitle = mode === "create"
    ? `Record Asset Sale${saleDetails.branchName ? ` - ${saleDetails.branchName}` : ""}`
    : `Asset Sale Details${saleDetails.branchName ? ` - ${saleDetails.branchName}` : ""}`

  const submitLabel = mode === "create" ? "Record Sale" : "Save Changes"

  const handleSubmit = rhfHandleSubmit(async (values) => {
    if (onSubmit) await onSubmit(values)
  })

  const inputClass = "w-full h-[36px] rounded-[6px] border border-[#E5E7EB] px-3 text-[12px] text-[#4B5563] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB]"
  const readOnlyInputClass = "w-full h-[36px] rounded-[6px] border border-[#E5E7EB] px-3 text-[12px] text-[#4B5563] bg-[#F9FAFB] focus:outline-none"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[560px] max-h-[90vh] rounded-[12px] bg-white shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EEF1F6] px-6 pt-4 pb-3 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#111827]">{headerTitle}</h2>
            {saleDetails.location && (
              <p className="text-[12px] text-[#6B7280] mt-0.5">{saleDetails.location}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-2 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-3 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {/* Asset (always read-only) */}
            <div className="space-y-1 col-span-2">
              <label className="text-[12px] font-medium text-[#374151]">Asset</label>
              <input
                type="text"
                value={saleDetails.assetName}
                readOnly
                aria-label="Asset name"
                className={readOnlyInputClass}
              />
            </div>

            {/* Sale Date */}
            <div className="space-y-1">
              <label htmlFor="record-sale-date" className="text-[12px] font-medium text-[#374151]">Sale Date</label>
              <div className="relative">
                <input
                  id="record-sale-date"
                  type="date"
                  {...register("saleDate")}
                  className={inputClass}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Calendar className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
              {errors.saleDate && (
                <p className="text-[11px] text-[#B91C1C]">{errors.saleDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="record-sale-amount" className="text-[12px] font-medium text-[#374151]">Sale Amount</label>
              <input
                id="record-sale-amount"
                type="text"
                inputMode="decimal"
                {...register("saleAmount")}
                className={inputClass}
              />
              {errors.saleAmount && (
                <p className="text-[11px] text-[#B91C1C]">{errors.saleAmount.message}</p>
              )}
            </div>

            {/* Buyer */}
            <div className="space-y-1">
              <label htmlFor="record-sale-buyer-name" className="text-[12px] font-medium text-[#374151]">Buyer Name</label>
              <input
                id="record-sale-buyer-name"
                type="text"
                {...register("buyerName")}
                className={inputClass}
              />
              {errors.buyerName && (
                <p className="text-[11px] text-[#B91C1C]">{errors.buyerName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="record-sale-buyer-contact" className="text-[12px] font-medium text-[#374151]">Buyer Contact</label>
              <input
                id="record-sale-buyer-contact"
                type="text"
                {...register("buyerContact")}
                className={inputClass}
              />
            </div>

            {/* Reason */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label htmlFor="record-sale-reason" className="text-[12px] font-medium text-[#374151]">Reason for Sale</label>
              <input
                id="record-sale-reason"
                type="text"
                {...register("reasonForSale")}
                className={inputClass}
              />
            </div>
            <div className="hidden sm:block"></div>

            {/* Proceeds to account */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label htmlFor="record-sale-proceeds" className="text-[12px] font-medium text-[#374151]">Proceeds to Account</label>
              <div className="relative">
                <input
                  id="record-sale-proceeds"
                  type="text"
                  {...register("proceedsToAccount")}
                  className={inputClass}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
                </div>
              </div>
            </div>
            <div className="hidden sm:block"></div>
          </div>

          {/* Workflow Alert Box */}
          <div className="mt-2 rounded-[8px] bg-[#F0FDF4] p-3 flex gap-3 border border-[#DCFCE7] bg-opacity-50">
            <AlertCircle className="h-4 w-4 text-[#374151] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-[12px]">
              <span className="font-bold text-[#111827]">Workflow</span>
              <div className="text-[#4B5563] flex flex-col mt-0.5">
                <p>Branch Accountant submits sale request.</p>
                <p>Financial Director receives notification.</p>
                <p>Financial Director in Asset Sales log -{'>'} pending approvals.</p>
              </div>
            </div>
          </div>

          {/* Depreciation History */}
          {saleDetails.history.length > 0 && (
            <div className="mt-3">
              <h3 className="text-[11px] font-[600] uppercase tracking-wider text-[#9CA3AF] mb-2">
                Depreciation History
              </h3>
              <div className="flex flex-col gap-0 relative">
                {saleDetails.history.map((entry, idx) => {
                  const isLast = idx === saleDetails.history.length - 1;
                  return (
                    <div key={idx} className="relative flex items-start gap-3 pb-2 group">
                      {!isLast && (
                        <div className="absolute left-[5px] top-2 bottom-[-10px] w-[2px] bg-[#EEF1F6]"></div>
                      )}
                      <div className="relative z-10 mt-1">
                        {isLast ? (
                          <div className="h-3 w-3 rounded-full bg-[#111827]"></div>
                        ) : (
                          <div className="h-3 w-3 rounded-full border-2 border-[#D1D5DB] bg-white"></div>
                        )}
                      </div>
                      <div className="flex flex-1 justify-between items-center text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className={isLast ? "text-[#6B7280]" : "text-[#9CA3AF]"}>
                            {entry.yearNumber} ({entry.year})
                          </span>
                          {entry.isYTD && (
                            <span className="rounded-[4px] border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[9px] font-medium text-[#6B7280]">
                              YTD
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#111827]">{entry.amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#EEF1F6] px-6 py-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            className="rounded-[6px] border border-[#D1D5DB] px-4 py-1.5 text-[12px] font-[600] text-[#374151] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={() => onDelete()}
                disabled={submitting || deleting}
                aria-label="Delete asset sale"
                className="inline-flex items-center gap-1 rounded-[6px] bg-[#EF4444] px-4 py-1.5 text-[12px] font-[600] text-white shadow hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
            {onSubmit && (
              <button
                type="submit"
                disabled={submitting || deleting}
                className="rounded-[6px] bg-[#3B5BDB] px-4 py-1.5 text-[12px] font-[600] text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving..." : submitLabel}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
