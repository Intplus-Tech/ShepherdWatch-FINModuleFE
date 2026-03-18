"use client"

import DashboardPage from "@/app/(screens)/branchlead-pastor/dashboard/page"
import { Button } from "@/components/ui/button"
import {
  Banknote,
  FileText,
  ShieldCheck,
  X,
  TriangleAlert,
  Component,
  FileSignature,
  History,
  Info,
  PieChart,
  Files
} from "lucide-react"

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FC] font-sans text-gray-900">
      <div className="pointer-events-none select-none fixed inset-0">
        <div className="scale-[1.08] origin-top-left blur-[6px] brightness-[0.93] opacity-65">
          <DashboardPage />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-[960px] max-h-[95vh] flex flex-col rounded-[20px] border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] text-gray-900 font-bold tracking-tight">
                  Requisition Approval: #REQ-2301
                </h2>
                <span className="rounded-full bg-red-50 border border-red-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-red-600">OVER-BUDGET</span>
              </div>
              <p className="mt-0.5 text-[13px] font-medium text-gray-500">Audio System Upgrade • Victoria Island Branch</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-[38px] rounded-[8px] border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900">
                <History className="mr-2 h-4 w-4 text-gray-500" />
                View Full History
              </Button>
              <button className="h-[38px] w-[38px] rounded-[8px] border border-gray-200 bg-white flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-gray-100 border border-gray-100 rounded-[16px] bg-white">
              
              {/* Requisition Details Column */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#3B5BDB]">
                  <FileText className="h-4 w-4" />
                  Requisition Details
                </div>

                <div className="mt-6">
                  <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5" style={{ letterSpacing: '0.1em' }}>TOTAL REQUESTED AMOUNT</div>
                  <div className="rounded-[8px] bg-gray-50 px-4 py-3 text-[24px] font-extrabold text-gray-900 tracking-tight">
                    ₦150,000
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5" style={{ letterSpacing: '0.1em' }}>BUDGET HEAD</div>
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-900">
                    <Component className="h-4 w-4 text-gray-400" />
                    Equipment & Maintenance
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5" style={{ letterSpacing: '0.1em' }}>ACCOUNTANT&apos;S JUSTIFICATION</div>
                  <div className="flex items-start gap-3 mt-1.5 rounded-[12px] bg-gray-50 p-3 text-[13px] font-medium text-gray-600 leading-relaxed border border-transparent hover:border-gray-100 transition-colors">
                    <FileSignature className="h-4 w-4 text-[#3B5BDB] shrink-0 mt-0.5" />
                    <p>
                      “Current system failed during Sunday service. Immediate replacement required for upcoming mid-week (syncline) and pre-crusade facility.”
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Context Column */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#3B5BDB]">
                  <PieChart className="h-4 w-4" />
                  Budget Context
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-[13px] font-medium text-gray-500 mb-2 border-b border-gray-50 pb-2">
                      <span>Monthly Allocation</span>
                      <span className="font-bold text-gray-900">₦1,000,000</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 mt-3">
                      <div className="h-full bg-[#3B5BDB] rounded-full relative" style={{ width: "87.5%" }}>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px] font-medium text-gray-500 border-b border-gray-50 pb-2 text-right">
                      <span>Remaining Budget</span>
                      <span className="font-bold text-[#3B5BDB]">₦125,000</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] font-medium text-gray-500 border-b border-gray-50 pb-2 text-right">
                      <span>Requested Amount</span>
                      <span className="font-bold text-gray-900">₦150,000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-[8px] bg-red-50 border border-red-100 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-red-600 uppercase tracking-widest">
                      <TriangleAlert className="h-3.5 w-3.5 stroke-[2.5]" />
                      OVERAGE AMOUNT
                    </div>
                    <div className="text-[15px] font-extrabold text-red-600 tracking-tight">₦25,000</div>
                  </div>

                  <div className="rounded-[8px] bg-blue-50/50 p-3 text-[12px] font-medium text-blue-700 leading-relaxed border border-blue-100/50">
                    <span className="font-bold text-blue-800">Note:</span> Approving this will immediately debit the &quot;Equipment&quot; allocation for HQ (Victoria Island) for the current fiscal month.
                  </div>
                </div>
              </div>

              {/* Authorization Column */}
              <div className="flex flex-col p-5">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#3B5BDB]">
                  <ShieldCheck className="h-4 w-4" />
                  Authorization
                </div>
                
                <div className="mt-6 flex-1">
                  <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5 flex items-center gap-1" style={{ letterSpacing: '0.1em' }}>
                    DIGITAL JUSTIFICATION FOR OVERRIDE <span className="text-red-500">*</span>
                  </div>
                  <textarea 
                    placeholder="State the reasons why this override is critical for branch operations..."
                    className="mt-1 min-h-[90px] w-full resize-none rounded-[10px] border border-gray-200 bg-white p-3 text-[13px] font-medium text-gray-700 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 focus:border-[#3B5BDB] shadow-sm transition-all"
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  <Button className="h-[40px] w-full rounded-[8px] bg-[rgba(23,84,207,0.5)] hover:bg-[rgba(23,84,207,0.6)] text-[13px] font-semibold tracking-wide text-white shadow-sm border border-transparent">
                    <ShieldCheck className="mr-2 h-4 w-4 stroke-[2]" />
                    Authorize Override
                  </Button>
                  <Button variant="outline" className="h-[40px] w-full rounded-[8px] border-gray-200 bg-white text-[13px] font-semibold tracking-wide text-gray-700 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <FileText className="mr-2 h-4 w-4 text-gray-500" />
                    Request Alternative Quote
                  </Button>
                  <Button variant="ghost" className="h-[40px] w-full rounded-[8px] text-[13px] font-semibold tracking-wide text-red-600 hover:bg-red-50 hover:text-red-700">
                    Decline Requisition
                  </Button>
                </div>

                <div className="mt-4 flex items-start gap-2.5 rounded-[8px] bg-gray-50 p-3 text-[11px] font-medium text-gray-500 leading-relaxed border border-gray-100">
                  <div className="mt-0.5 shrink-0">
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  This override will be permanently logged in the Global Executive Audit Trail. HQ must immediately initiate a budget transfer to cover this overage in this account branch.
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="flex items-center gap-4 rounded-[12px] border border-gray-100 bg-white px-5 py-4 hover:border-green-200 transition-colors cursor-pointer group shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                <div className="h-10 w-10 shrink-0 rounded-[10px] bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:bg-green-100 transition-colors">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-900 tracking-tight">Preferred Vendor</div>
                  <div className="text-[13px] font-medium text-gray-500 mt-0.5">SoundMaster Pro Ltd <span className="text-green-600">(Verified Platinum)</span></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 rounded-[12px] border border-gray-100 bg-white px-5 py-4 hover:border-blue-200 transition-colors cursor-pointer group shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                <div className="h-10 w-10 shrink-0 rounded-[10px] bg-blue-50 text-[#3B5BDB] flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                  <Files className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-900 tracking-tight">Supporting Documents</div>
                  <div className="text-[13px] font-medium text-gray-500 mt-0.5">Technical_Quote_Audio_V3.pdf (1.2 MB)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

