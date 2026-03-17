"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  BadgeCheck,
  Banknote,
  ChevronRight,
  FileText,
  Info,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6">
      <div className="mx-auto w-full max-w-[1200px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="relative min-h-[760px] bg-[#F7F8FC]">
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 px-6 py-6">
            <div className="flex items-center justify-between rounded-[14px] border border-[#EEF1F6] bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-9 w-9 rounded-[10px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-[#111827]">Requisition Approval: #REQ-2301</h2>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[8px] text-rose-600">OVER-BUDGET</span>
                  </div>
                  <p className="text-[9px] text-[#9CA3AF]">Audio System Upgrade  Victoria Island Branch</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                  View Full History
                </Button>
                <div className="h-7 w-7 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280]">
                  <X className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                  <FileText className="h-4 w-4 text-[#3B5BDB]" />
                  Requisition Details
                </div>

                <div className="mt-4">
                  <div className="text-[8px] text-[#9CA3AF]">TOTAL REQUESTED AMOUNT</div>
                  <div className="text-[16px] font-semibold text-[#111827]">?150,000</div>
                </div>

                <div className="mt-4 text-[9px] text-[#6B7280]">
                  <div className="font-semibold text-[#111827]">Budget Head</div>
                  <div>Equipment &amp; Maintenance</div>
                </div>

                <div className="mt-4 text-[9px] text-[#6B7280]">
                  <div className="font-semibold text-[#111827]">Accountant&apos;s Justification</div>
                  <p className="mt-1">
                    Current outdoor-led sound system no longer meets the required standards for services and special events.
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                  <ShieldCheck className="h-4 w-4 text-[#3B5BDB]" />
                  Budget Context
                </div>

                <div className="mt-4 space-y-3 text-[9px] text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span>Monthly Allocation</span>
                    <span className="font-semibold text-[#111827]">?1,000,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Remaining Budget</span>
                    <span className="font-semibold text-[#3B5BDB]">?125,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Requested Amount</span>
                    <span className="font-semibold text-[#111827]">?150,000</span>
                  </div>
                  <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[9px] text-[#B45309]">
                    <div className="font-semibold">OVERAGE AMOUNT</div>
                    <div className="text-[12px] font-semibold text-[#B91C1C]">?25,000</div>
                  </div>
                  <div className="rounded-[10px] border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2 text-[8px] text-[#1E3A8A]">
                    Note: Requisition will not be approved if budget balance is below required minimum.
                  </div>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#EEF1F6] bg-white p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#111827]">
                  <ShieldAlert className="h-4 w-4 text-[#3B5BDB]" />
                  Authorization
                </div>
                <div className="mt-2 text-[8px] text-[#9CA3AF]">DIGITAL JUSTIFICATION FOR OVERRIDE *</div>
                <div className="mt-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[9px] text-[#6B7280]">
                  State the reasons why this override is critical for branch operations.
                </div>

                <div className="mt-4 space-y-2">
                  <Button size="sm" className="h-8 w-full rounded-[8px] bg-[#3B5BDB] text-[9px] text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Authorize Override
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-full rounded-[8px] border-[#E5E7EB] bg-white text-[9px] text-[#6B7280]">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Request Alternative Quote
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-full rounded-[8px] border-rose-200 bg-rose-50 text-[9px] text-rose-600">
                    Decline Requisition
                  </Button>
                </div>

                <div className="mt-3 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] px-3 py-2 text-[8px] text-[#9CA3AF]">
                  This action will permanently update the Global Budget utilization record for Director&apos;s Headquarters.
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[12px] border border-[#EEF1F6] bg-white px-4 py-3 text-[9px] text-[#6B7280]">
                <div className="h-8 w-8 rounded-[10px] bg-[#ECFDF3] text-[#16A34A] flex items-center justify-center">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#111827]">Preferred Vendor</div>
                  <div>SoundMaster Pro (Via Verified Platinum)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] border border-[#EEF1F6] bg-white px-4 py-3 text-[9px] text-[#6B7280]">
                <div className="h-8 w-8 rounded-[10px] bg-[#EEF2FF] text-[#3B5BDB] flex items-center justify-center">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#111827]">Supporting Documents</div>
                  <div>Technical_Quote_Audio_Y3.pdf 1.2MB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
