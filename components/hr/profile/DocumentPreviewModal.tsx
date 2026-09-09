"use client"

import { useState } from "react"
import { X, Download, Flag, Loader2, ShieldCheck } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { StatusBadge, SectionLabel, btnDark, btnOutline } from "./shared"
import { useDocumentMutations } from "@/components/hooks/useHrDocuments"
import { useToast } from "@/components/ui/toast"
import { DOCUMENT_TYPE_LABELS, formatDate, statusLabel } from "@/lib/hr/display"
import type { HrDocument } from "@/lib/hr/types"

export default function DocumentPreviewModal({
  open,
  onClose,
  document: record,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  document: HrDocument | null
  onChanged?: () => void
}) {
  const { verifyDocument, flagDocument } = useDocumentMutations()
  const { pushToast } = useToast()
  const [flagReason, setFlagReason] = useState("")
  const [busy, setBusy] = useState<"verify" | "flag" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (busy) return
    setFlagReason("")
    setError(null)
    onClose()
  }

  const handleVerify = async () => {
    if (!record) return
    setBusy("verify")
    setError(null)
    try {
      await verifyDocument(record.id)
      pushToast("Document verified", "success")
      onChanged?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify this document.")
    } finally {
      setBusy(null)
    }
  }

  const handleFlag = async () => {
    if (!record) return
    if (!flagReason.trim()) {
      setError("Say what is wrong with the document.")
      return
    }
    setBusy("flag")
    setError(null)
    try {
      await flagDocument(record.id, flagReason.trim())
      pushToast("Document flagged", "success")
      setFlagReason("")
      onChanged?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to flag this document.")
    } finally {
      setBusy(null)
    }
  }

  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(record?.fileUrl ?? "")

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[#111827]">
            Document Preview: {record?.title || "—"}
          </h2>
          {record ? (
            <StatusBadge status={String(record.verificationStatus).toUpperCase()} />
          ) : null}
        </div>
        <button
          aria-label="Close"
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EEF1F6] bg-[#F9FAFB] p-4">
            {record?.fileUrl ? (
              isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={record.fileUrl}
                  alt={record.title}
                  className="max-h-[420px] w-auto rounded-lg object-contain"
                />
              ) : (
                <iframe
                  src={record.fileUrl}
                  title={record.title}
                  className="h-[420px] w-full rounded-lg border-0"
                />
              )
            ) : (
              <p className="text-[13px] text-[#9CA3AF]">No file is attached to this record.</p>
            )}
          </div>
        </div>

        {/* Details + actions */}
        <div className="flex flex-col gap-4">
          <div>
            <SectionLabel>Document Type</SectionLabel>
            <p className="mt-1 text-[13px] font-semibold text-[#111827]">
              {statusLabel(DOCUMENT_TYPE_LABELS, record?.documentType ?? "")}
            </p>
          </div>
          <div>
            <SectionLabel>Filed</SectionLabel>
            <p className="mt-1 text-[13px] text-[#4B5563]">{formatDate(record?.createdAt ?? "")}</p>
          </div>
          {record?.expiryDate ? (
            <div>
              <SectionLabel>Expires</SectionLabel>
              <p className="mt-1 text-[13px] text-[#4B5563]">{formatDate(record.expiryDate)}</p>
            </div>
          ) : null}
          {record?.flagReason ? (
            <div className="rounded-lg bg-rose-50 p-3">
              <SectionLabel>Flagged</SectionLabel>
              <p className="mt-1 text-[12px] text-rose-600">{record.flagReason}</p>
            </div>
          ) : null}

          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
              htmlFor="flag-reason"
            >
              Flag a discrepancy
            </label>
            <textarea
              id="flag-reason"
              rows={3}
              value={flagReason}
              onChange={(event) => setFlagReason(event.target.value)}
              placeholder="e.g. Missing the guarantor signature on page 4."
              className="mt-1.5 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#3B5BDB]"
            />
          </div>

          {error ? <p className="text-[12px] text-rose-600">{error}</p> : null}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <a
          href={record?.fileUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={
            record?.fileUrl ? btnOutline : `${btnOutline} pointer-events-none opacity-50`
          }
        >
          <Download className="h-4 w-4" />
          Download
        </a>
        <button
          type="button"
          onClick={handleFlag}
          disabled={Boolean(busy) || !record}
          className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-white px-4 py-2 text-[12px] font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
        >
          {busy === "flag" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-4 w-4" />}
          Flag
        </button>
        <button
          className={btnDark}
          onClick={handleVerify}
          disabled={Boolean(busy) || !record || record.verificationStatus === "verified"}
        >
          {busy === "verify" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {record?.verificationStatus === "verified" ? "Verified" : "Verify Document"}
        </button>
      </div>
    </ModalShell>
  )
}
