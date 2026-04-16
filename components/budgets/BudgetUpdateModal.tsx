"use client"

import { useState } from "react"
import { useBudgetUpdate, BudgetPayload } from "../hooks/useBudgetUpdate"
import { useBudgetSubmit } from "../hooks/useBudgetSubmit"
import { X, Save, AlertCircle, CheckCircle2, Send } from "lucide-react"

export interface BudgetUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  budgetId: string | null
  currentTitle?: string
  currentAmount?: number
  currentCategory?: string
  currentNotes?: string
  onSuccess?: () => void
}

export function BudgetUpdateModal({ 
  isOpen, 
  onClose, 
  budgetId, 
  currentTitle = "", 
  currentAmount = 0, 
  currentCategory = "operational",
  currentNotes = "",
  onSuccess 
}: BudgetUpdateModalProps) {
  const { updating, error, success, updateBudget, setError } = useBudgetUpdate()
  const { submitting, submitError, submitSuccess, submitBudget } = useBudgetSubmit()
  
  const [title, setTitle] = useState(currentTitle)
  const [totalAmount, setTotalAmount] = useState(String(currentAmount))
  const [category, setCategory] = useState<BudgetPayload["category"]>(currentCategory as BudgetPayload["category"])
  const [notes, setNotes] = useState(currentNotes)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budgetId) return

    const amt = parseFloat(totalAmount)
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than 0.")
      return
    }

    const payload: BudgetPayload = {
      title,
      totalAmount: amt,
      category,
      notes
    }

    const successRes = await updateBudget(budgetId, payload)
    if (successRes) {
      if (onSuccess) onSuccess()
      setTimeout(() => onClose(), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[16px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EEF1F6]">
          <div>
            <h3 className="text-[18px] font-bold text-[#111827]">Edit Draft Budget</h3>
            <p className="text-[12px] text-[#6B7280] font-medium mt-0.5">Revise your budget proposal properties</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1">
          {(error || submitError) && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-[10px] text-[12px] font-medium border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error || submitError}
            </div>
          )}
          {(success || submitSuccess) && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-[10px] text-[12px] font-medium border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success ? "Budget successfully updated." : "Budget submitted for approval!"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Budget Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-[40px] px-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition-all bg-[#FAFBFF]"
                placeholder="e.g. 2025 Annual Operational Budget"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Total Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[#9CA3AF] text-[13px] font-bold">$</span>
                </div>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full h-[40px] pl-7 pr-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition-all bg-[#FAFBFF]"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BudgetPayload["category"])}
                  className="w-full h-[40px] pl-3 pr-10 appearance-none border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition-all bg-[#FAFBFF]"
                >
                  <option value="operational">Operational</option>
                  <option value="capital">Capital</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Notes <span className="text-[#9CA3AF] font-normal">(Optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 border border-[#E5E7EB] rounded-[10px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#3B5BDB] focus:border-[#3B5BDB] transition-all bg-[#FAFBFF] resize-none"
                placeholder="Include justification or key metrics..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EEF1F6] bg-[#F9FAFB] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 border border-[#E5E7EB] bg-white text-[#4B5563] text-[12px] font-bold rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!budgetId) return
              const ok = await submitBudget(budgetId)
              if (ok) {
                if (onSuccess) onSuccess()
                setTimeout(() => onClose(), 1500)
              }
            }}
            disabled={updating || submitting}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-[#4B5563] text-[12px] font-bold rounded-[10px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-[#4B5563]/30 border-t-[#4B5563] rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating || submitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#3B5BDB] text-white text-[12px] font-bold rounded-[10px] hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
          >
            {updating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
