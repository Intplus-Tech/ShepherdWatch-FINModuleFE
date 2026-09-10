"use client"

import { useEffect, useState } from "react"
import { Loader2, Wallet, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useHrConfig, useUpdateTrainingConfig } from "@/components/hooks/hr/useHrConfig"
import { formatCurrency } from "@/lib/format"

/**
 * Sets the annual training budget.
 *
 * This figure used to be a literal in the backend service, so it was the same
 * for every branch and could only change with a deploy. It now lives in the HR
 * config and this is where a director sets it.
 */
export default function TrainingAllocationModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const config = useHrConfig()
  const update = useUpdateTrainingConfig()

  const [allocation, setAllocation] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const current = config.data?.training

  useEffect(() => {
    if (!open) return
    setAllocation(current ? String(current.annualAllocation) : "")
    setFormError(null)
    update.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current?.annualAllocation])

  async function handleSave() {
    setFormError(null)

    const annualAllocation = Number(allocation.replace(/[^0-9.]/g, ""))
    if (!Number.isFinite(annualAllocation) || annualAllocation < 0) {
      setFormError("Enter an allocation of zero or more.")
      return
    }

    try {
      await update.mutateAsync({ annualAllocation })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (update.error ? hrErrorMessage(update.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-md">
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#111827]">Training Allocation</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              The annual budget every branch is measured against.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Annual Allocation
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B7280]">
              ₦
            </span>
            <input
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              inputMode="decimal"
              disabled={config.isLoading || update.isPending}
              placeholder="2,500,000"
              className="h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white pl-7 pr-3 text-[13px] outline-none focus:border-[#3B5BDB] disabled:bg-[#F9FAFB]"
            />
          </div>
          {current && (
            <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
              Currently {formatCurrency(current.annualAllocation, { maximumFractionDigits: 0 })}
              {current.branchAllocations.length > 0
                ? ` · ${current.branchAllocations.length} branch override${
                    current.branchAllocations.length === 1 ? "" : "s"
                  }`
                : ""}
            </p>
          )}
        </div>

        {config.error && (
          <p className="text-[12px] font-medium text-red-600">{hrErrorMessage(config.error)}</p>
        )}
        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={update.isPending}
          className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4B5563] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={config.isLoading || update.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Allocation
        </button>
      </div>
    </ModalShell>
  )
}
