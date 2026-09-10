"use client"

import { useEffect, useState } from "react"
import { Loader2, UploadCloud, X } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, btnDark, btnOutline } from "./shared"
import { HrFileDrop, type UploadedFile } from "@/components/hr/HrFileDrop"
import { hrErrorMessage } from "@/components/hr/HrDataState"
import { useUploadEmployeeDocument } from "@/components/hooks/hr/useHrDocuments"
import { titleCase } from "@/lib/hr/normalize"
import { EMPLOYEE_DOCUMENT_TYPES, type EmployeeDocumentType } from "@/lib/hr/types"

const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1.5 h-[42px] w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

export default function UploadDocumentModal({
  open,
  onClose,
  employeeId,
}: {
  open: boolean
  onClose: () => void
  employeeId: string | null
}) {
  const upload = useUploadEmployeeDocument()

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [documentType, setDocumentType] = useState<EmployeeDocumentType>("contract")
  const [title, setTitle] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setFiles([])
    setDocumentType("contract")
    setTitle("")
    setEffectiveDate("")
    setExpiryDate("")
    setFormError(null)
    upload.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleUpload() {
    setFormError(null)

    const file = files[0]
    if (!employeeId) {
      setFormError("No employee selected.")
      return
    }
    if (!file) {
      setFormError("Attach a file first.")
      return
    }
    if (title.trim().length < 2) {
      setFormError("Give the document a title.")
      return
    }

    try {
      await upload.mutateAsync({
        employeeId,
        documentType,
        title: title.trim(),
        fileUrl: file.url,
        fileSize: file.size,
        mimeType: file.mimeType,
        effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      })
      onClose()
    } catch (error) {
      setFormError(hrErrorMessage(error))
    }
  }

  const error = formError ?? (upload.error ? hrErrorMessage(upload.error) : null)

  return (
    <ModalShell open={open} onClose={onClose} className="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EEF1F6] px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FF] text-[#3B5BDB]">
            <UploadCloud className="h-4 w-4" />
          </span>
          <h2 className="text-[16px] font-bold text-[#111827]">Upload New Document</h2>
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
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto px-6 py-5">
        <HrFileDrop
          files={files}
          onChange={(next) => setFiles(next.slice(-1))}
          folder="hr/documents"
          hint="PDF, JPG or PNG · Up to 5MB"
          disabled={upload.isPending}
        />

        {/* Details */}
        <div>
          <SectionLabel>Document Details</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Document Type</label>
              <select
                className={inputCls}
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as EmployeeDocumentType)}
                disabled={upload.isPending}
              >
                {EMPLOYEE_DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {titleCase(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Document Title</label>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Contract_Amendment_2024"
                disabled={upload.isPending}
              />
            </div>
            <div>
              <label className={labelCls}>Effective Date</label>
              <input
                type="date"
                className={inputCls}
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                disabled={upload.isPending}
              />
            </div>
            <div>
              <label className={labelCls}>Expiry Date (Optional)</label>
              <input
                type="date"
                className={inputCls}
                value={expiryDate}
                min={effectiveDate || undefined}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={upload.isPending}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-[12px] font-medium text-red-600">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={onClose} disabled={upload.isPending}>
          Cancel
        </button>
        <button className={btnDark} onClick={handleUpload} disabled={upload.isPending}>
          {upload.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Upload Document
        </button>
      </div>
    </ModalShell>
  )
}
