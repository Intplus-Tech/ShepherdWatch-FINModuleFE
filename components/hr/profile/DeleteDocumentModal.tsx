"use client"

import { AlertTriangle, Info } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { btnOutline } from "./shared"

export default function DeleteDocumentModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col items-center px-6 py-7 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-[18px] font-bold text-[#111827]">
          Delete Document?
        </h2>
        <p className="mt-2 text-[13px] text-[#4B5563]">
          You are about to delete{" "}
          <span className="font-semibold text-[#111827]">
            Contract_Adeyemi_2024.pdf
          </span>
          . This action is permanent and cannot be undone.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-md bg-[#F9FAFB] p-3 text-left text-[12px] text-[#6B7280]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]" />
          This deletion will be logged in the ShepherdWatch audit trail for
          compliance and institutional stewardship purposes.
        </div>

        <div className="mt-6 flex w-full items-center gap-3">
          <button className={`${btnOutline} flex-1`} onClick={onClose}>
            Cancel
          </button>
          <button className="flex-1 rounded-md bg-rose-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-rose-700">
            Delete Document
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
