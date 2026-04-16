"use client"

import { useBudgetApproval, BudgetApprovalStatus } from "../hooks/useBudgetApproval"
import { X, ShieldCheck, AlertCircle, CheckCircle2, RotateCcw, XCircle } from "lucide-react"

export interface BudgetApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string | null
  currentTitle?: string
  onSuccess?: () => void
}

export function BudgetApprovalModal({ 
  isOpen, 
  onClose, 
  budgetId, 
  currentTitle = "", 
  onSuccess 
}: BudgetApprovalModalProps) {
  const { approving, approveError, approveSuccess, processApprovalAction } = useBudgetApproval()

  if (!isOpen || !budgetId) return null

  const handleAction = async (status: BudgetApprovalStatus) => {
    const ok = await processApprovalAction(budgetId, status)
    if (ok) {
      if (onSuccess) onSuccess()
      setTimeout(() => onClose(), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[16px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EEF1F6] bg-slate-50/50">
          <div>
            <h3 className="text-[18px] font-bold text-[#111827] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Director Approval Required
            </h3>
            <p className="text-[12px] text-[#6B7280] font-medium mt-1">Reviewing '{currentTitle}'</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1">
          {approveError && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-[10px] text-[12px] font-medium border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {approveError}
            </div>
          )}
          {approveSuccess && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-[10px] text-[12px] font-medium border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Budget status successfully updated!
            </div>
          )}

          <div className="text-[13px] text-[#4B5563] leading-relaxed mb-6">
            Please select the final decision for this budget submission. 
            <strong> Approving</strong> locks the fiscal metrics, 
            <strong> Requesting Revision</strong> returns it to the branch lead, and 
            <strong> Rejecting</strong> fails the budget directly.
          </div>

          <div className="space-y-3">
            <button
               onClick={() => handleAction("approved")}
               disabled={approving}
               className="w-full flex items-center gap-3 p-3.5 border border-[#E5E7EB] rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group disabled:opacity-50"
            >
               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                 <CheckCircle2 className="w-4 h-4" />
               </div>
               <div>
                  <div className="text-[13px] font-bold text-[#111827]">Approve Budget</div>
                  <div className="text-[11px] text-[#6B7280]">Authorize metrics completely</div>
               </div>
            </button>

            <button
               onClick={() => handleAction("revision")}
               disabled={approving}
               className="w-full flex items-center gap-3 p-3.5 border border-[#E5E7EB] rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group disabled:opacity-50"
            >
               <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                 <RotateCcw className="w-4 h-4" />
               </div>
               <div>
                  <div className="text-[13px] font-bold text-[#111827]">Request Revisions</div>
                  <div className="text-[11px] text-[#6B7280]">Return to branch for edits</div>
               </div>
            </button>

            <button
               onClick={() => handleAction("rejected")}
               disabled={approving}
               className="w-full flex items-center gap-3 p-3.5 border border-[#E5E7EB] rounded-xl hover:border-rose-500 hover:bg-rose-50/50 transition-all text-left group disabled:opacity-50"
            >
               <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                 <XCircle className="w-4 h-4" />
               </div>
               <div>
                  <div className="text-[13px] font-bold text-[#111827]">Reject Submission</div>
                  <div className="text-[11px] text-[#6B7280]">Fail the budget explicitly</div>
               </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
