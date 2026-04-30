"use client"

import {
  X,
  History,
  FileText,
  LayoutDashboard,
  FileSignature,
  Triangle,
  AlignLeft,
  AlertTriangle,
  Info,
  Zap,
  Paperclip,
} from "lucide-react"

interface RequisitionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RequisitionDetailsModal({ isOpen, onClose }: RequisitionDetailsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
      {/* Modal Container */}
      <div className="relative flex w-[1138px] h-[828px] max-w-[95vw] max-h-[95vh] flex-col rounded-[20px] bg-white shadow-2xl overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="px-[56px] pt-[50px] pb-[32px] shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[26px] text-[#111827] tracking-tight" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
              Requisition Approval: #REQ-2301
            </h1>
            <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">
              OVER-BUDGET
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium text-[#6B7280]">
              Audio System Upgrade - Victoria Island Branch
            </p>
            <button className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-bold text-[#111827] shadow-sm hover:bg-[#F9FAFB] transition-colors">
              <History className="h-4 w-4" />
              View Full History
            </button>
          </div>
        </div>

        {/* Main Content (3 Columns) */}
        <div className="px-[56px] pb-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white">
            
            {/* Column 1: Requisition Details */}
            <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <FileText className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Requisition Details</h2>
              </div>

              <div className="rounded-[12px] bg-[#F9FAFB] p-5 mb-5">
                <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-1">
                  TOTAL REQUESTED AMOUNT
                </div>
                <div className="text-[28px] text-[#111827] leading-none" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
                  ₦150,000
                </div>
              </div>

              <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-2">
                BUDGET HEAD
              </div>
              <div className="flex items-center gap-2 mb-5">
                <Triangle className="h-3.5 w-3.5 text-[#4B5563] fill-current" />
                <span className="text-[14px] font-bold text-[#111827]">
                  Equipment & Maintenance
                </span>
              </div>

              <div className="h-[1px] w-full bg-[#E5E7EB] mb-5"></div>

              <div className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-widest mb-3">
                ACCOUNTANT'S JUSTIFICATION
              </div>
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF]">
                  <AlignLeft className="h-4 w-4 text-[#2563EB]" strokeWidth={2.5} />
                </div>
                <p className="text-[13px] font-medium text-[#4B5563] leading-relaxed italic">
                  "Current system failed during Sunday service. Immediate replacement required for upcoming mid-week service to ensure sound quality."
                </p>
              </div>
            </div>

            {/* Column 2: Budget Context */}
            <div className="flex flex-col p-6 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <LayoutDashboard className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Budget Context</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-[#6B7280]">Monthly Allocation</span>
                  <span className="text-[13px] font-extrabold text-[#111827]">₦1,000,000</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] px-4 py-3 mb-3">
                <span className="text-[12px] font-bold text-[#6B7280]">Remaining Budget</span>
                <span className="text-[15px] font-black text-[#2563EB]">₦125,000</span>
              </div>

              <div className="flex items-center justify-between rounded-[10px] border border-[#E5E7EB] px-4 py-3 mb-4">
                <span className="text-[12px] font-bold text-[#6B7280]">Requested Amount</span>
                <span className="text-[15px] font-black text-[#111827]">₦150,000</span>
              </div>

              <div className="flex items-center justify-between rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" strokeWidth={2.5} />
                  <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-widest">
                    OVERAGE AMOUNT
                  </span>
                </div>
                <span className="text-[18px] font-black text-rose-500">₦25,000</span>
              </div>

              <div className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] p-4 mt-auto">
                <p className="text-[11px] font-semibold text-[#1D4ED8] leading-relaxed">
                  <span className="font-extrabold">Note:</span> Approving this will reduce next month's 'Equipment' allocation by ₦25,000 to balance the quarterly fiscal target.
                </p>
              </div>
            </div>

            {/* Column 3: Authorization */}
            <div className="flex flex-col p-6">
              <div className="flex items-center gap-2 text-[#2563EB] mb-6">
                <FileSignature className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-[14px] font-extrabold">Authorization</h2>
              </div>

              <div className="mb-4">
                <label className="mb-2 flex text-[10px] font-extrabold tracking-widest text-[#6B7280] uppercase">
                  DIGITAL JUSTIFICATION FOR OVERRIDE <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea
                  className="w-full resize-none rounded-[10px] border border-[#E5E7EB] p-3 text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  rows={4}
                  placeholder="State the reason why this overage is critical for branch operations..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#81A1EC] text-[13px] font-bold text-white shadow-sm hover:bg-[#2563EB] transition-colors">
                  <FileSignature className="h-4 w-4" />
                  Authorize Override
                </button>
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white text-[13px] font-bold text-[#111827] shadow-sm hover:bg-[#F9FAFB] transition-colors">
                  <FileText className="h-4 w-4 text-[#6B7280]" />
                  Request Alternative Quote
                </button>
                <button className="flex h-11 w-full items-center justify-center text-[13px] font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  Decline Requisition
                </button>
              </div>

              <div className="mt-auto flex gap-3 rounded-[10px] bg-[#F9FAFB] p-4">
                <Info className="h-4 w-4 shrink-0 text-[#6B7280]" />
                <p className="text-[10px] font-medium text-[#6B7280] leading-relaxed">
                  This override will be permanently logged in the <span className="font-bold">Global Executive Audit Trail</span>. High-value overrides ({">"}₦100k) are automatically flagged for Director review at the National Headquarters.
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer Areas */}
        <div className="px-[56px] pb-[50px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferred Vendor */}
            <div className="flex items-center gap-4 rounded-[12px] border border-[#E5E7EB] p-4 bg-white shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#DCFCE7]">
                <Zap className="h-5 w-5 text-[#22C55E]" fill="currentColor" strokeWidth={1} />
              </div>
              <div>
                <div className="text-[13px] font-extrabold text-[#111827]">Preferred Vendor</div>
                <div className="text-[12px] font-medium text-[#6B7280]">SoundMaster Pro Ltd (Verified Platinum)</div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="flex items-center gap-4 rounded-[12px] border border-[#E5E7EB] p-4 bg-white shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF]">
                <Paperclip className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div>
                <div className="text-[13px] font-extrabold text-[#111827]">Supporting Documents</div>
                <div className="text-[12px] font-medium text-[#6B7280]">Technical_Quote_Audio_V3.pdf (1.2 MB)</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
