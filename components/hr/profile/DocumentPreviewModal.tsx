"use client"

import { useEffect, useState } from "react"
import { Download, FileText, Loader2, Lock, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { StatusBadge, btnDark, btnOutline } from "./shared"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useFlagEmployeeDocument } from "@/components/hooks/hr/useHrDocuments"
import {
  EMPLOYEE_DOCUMENT_STATUS_LABELS,
  lookup,
  titleCase,
  userName,
} from "@/lib/hr/normalize"
import type { EmployeeDocument } from "@/lib/hr/types"
import { formatDate } from "@/lib/format"

/** Inline preview works for images and PDFs; anything else gets a download link. */
function isPreviewable(mimeType: string | undefined): boolean {
  if (!mimeType) return false
  return mimeType.startsWith("image/") || mimeType === "application/pdf"
}

export default function DocumentPreviewModal({
  document,
  employeeId,
  onClose,
}: {
  document: EmployeeDocument | null
  employeeId: string | null
  onClose: () => void
}) {
  const flag = useFlagEmployeeDocument()
  const [flagging, setFlagging] = useState(false)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFlagging(false)
    setReason("")
    setError(null)
    flag.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?._id])

  async function handleFlag() {
    if (!document) return
    setError(null)

    if (reason.trim().length < 3) {
      setError("Give a reason of at least three characters.")
      return
    }

    try {
      await flag.mutateAsync({
        id: document._id,
        flagReason: reason.trim(),
        employeeId: employeeId ?? undefined,
      })
      onClose()
    } catch (err) {
      setError(hrErrorMessage(err))
    }
  }

  return (
    <ModalShell open={document !== null} onClose={onClose} className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[#111827]">
            Document Preview: {document?.title}
          </h2>
          {document && (
            <StatusBadge
              status={lookup(EMPLOYEE_DOCUMENT_STATUS_LABELS, document.status).toUpperCase()}
            />
          )}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-3">
        {/* Preview area */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#EEF1F6] bg-[#F9FAFB]">
            {document && isPreviewable(document.mimeType) ? (
              document.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={document.fileUrl}
                  alt={document.title}
                  className="max-h-[52vh] w-full object-contain"
                />
              ) : (
                <iframe
                  src={document.fileUrl}
                  title={document.title}
                  className="h-[52vh] w-full border-0"
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-14 text-center">
                <FileText className="h-10 w-10 text-[#9CA3AF]" />
                <p className="text-[13px] text-[#6B7280]">
                  This file type can&apos;t be previewed here. Download it to view.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-3">
          <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Details
            </div>
            <dl className="mt-2 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B7280]">Type</dt>
                <dd className="font-semibold text-[#111827]">
                  {titleCase(document?.documentType)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#6B7280]">Uploaded</dt>
                <dd className="font-semibold text-[#111827]">
                  {formatDate(document?.createdAt, "medium")}
                </dd>
              </div>
              {document?.effectiveDate && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6B7280]">Effective</dt>
                  <dd className="font-semibold text-[#111827]">
                    {formatDate(document.effectiveDate, "medium")}
                  </dd>
                </div>
              )}
              {document?.expiryDate && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#6B7280]">Expires</dt>
                  <dd className="font-semibold text-[#111827]">
                    {formatDate(document.expiryDate, "medium")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Verification
            </div>
            <p className="mt-1 text-[12px] text-[#4B5563]">
              {document?.status === "verified"
                ? `Verified${
                    document.verifiedBy ? ` by ${userName(document.verifiedBy)}` : ""
                  }${document.verifiedAt ? ` on ${formatDate(document.verifiedAt, "medium")}` : ""}`
                : document?.status === "flagged"
                  ? (document.flagReason ?? "Flagged for review.")
                  : "Not yet verified."}
            </p>
          </div>

          {document?.status !== "flagged" && (
            <div className="flex flex-col gap-2">
              {flagging ? (
                <>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="What's wrong with this document?"
                    className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#3B5BDB]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFlagging(false)}
                      className="flex-1 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#4B5563] hover:bg-[#F8FAFC]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFlag}
                      disabled={flag.isPending}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {flag.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Flag
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setFlagging(true)}
                  className="text-left text-[13px] font-semibold text-rose-600 hover:underline"
                >
                  Flag Discrepancy
                </button>
              )}
              {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
          {document?.isLocked && (
            <>
              <Lock className="h-3.5 w-3.5" />
              Document Locked
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className={btnOutline} onClick={onClose}>
            Close
          </button>
          <a
            href={document?.fileUrl}
            target="_blank"
            rel="noreferrer"
            className={btnDark}
          >
            <Download className="h-4 w-4" />
            Download Document
          </a>
        </div>
      </div>
    </ModalShell>
  )
}
