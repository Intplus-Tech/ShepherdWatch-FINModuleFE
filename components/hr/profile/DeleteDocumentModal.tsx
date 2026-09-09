"use client"

import { useState } from "react"
import { AlertTriangle, Info, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { btnOutline } from "./shared"
import { useDocumentMutations } from "@/components/hooks/useHrDocuments"
import { useToast } from "@/components/ui/toast"
import type { HrDocument } from "@/lib/hr/types"

export default function DeleteDocumentModal({
  open,
  onClose,
  document,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  document: HrDocument | null
  onDeleted?: () => void
}) {
  const { deleteDocument } = useDocumentMutations()
  const { pushToast } = useToast()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (deleting) return
    setError(null)
    onClose()
  }

  const handleDelete = async () => {
    if (!document) return
    setDeleting(true)
    setError(null)
    try {
      await deleteDocument(document.id)
      pushToast(`${document.title} deleted`, "success")
      onDeleted?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this document.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-md">
      <div className="flex flex-col items-center px-6 py-7 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-[18px] font-bold text-[#111827]">Delete Document?</h2>
        <p className="mt-2 text-[13px] text-[#4B5563]">
          You are about to delete{" "}
          <span className="font-semibold text-[#111827]">
            {document?.title || "this document"}
          </span>
          . This action is permanent and cannot be undone.
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EEF2FF] p-3 text-left">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3B5BDB]" />
          <p className="text-[12px] text-[#4B5563]">
            The record is removed from the employee&rsquo;s vault and will no longer count towards
            their profile integrity score.
          </p>
        </div>

        {error ? <p className="mt-3 text-[12px] text-rose-600">{error}</p> : null}

        <div className="mt-6 flex w-full items-center justify-center gap-3">
          <button className={btnOutline} onClick={handleClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || !document}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {deleting ? "Deleting…" : "Delete Document"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
