"use client"

import { useRef, useState } from "react"
import { X, UploadCloud, FileText, Loader2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { SectionLabel, btnOutline, btnDark } from "./shared"
import { useDocumentMutations } from "@/components/hooks/useHrDocuments"
import { useFileUpload } from "@/components/hooks/useFileUpload"
import { useToast } from "@/components/ui/toast"

const labelCls =
  "text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]"
const inputCls =
  "mt-1 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#3B5BDB]"

const DOCUMENT_TYPES = [
  { value: "contract", label: "Employment Contract" },
  { value: "id_proof", label: "Identification / KYC" },
  { value: "academic_credential", label: "Academic Credential" },
  { value: "certification", label: "Professional Certification" },
  { value: "medical_clearance", label: "Medical Clearance" },
  { value: "background_check", label: "Background Check" },
  { value: "other", label: "Other" },
]

/**
 * Two steps behind one button: the file goes to the upload service, then the
 * returned URL is filed against the employee as a personnel document.
 */
export default function UploadDocumentModal({
  open,
  onClose,
  employeeId,
  onUploaded,
}: {
  open: boolean
  onClose: () => void
  employeeId: string
  onUploaded?: () => void
}) {
  const { uploadDocument } = useDocumentMutations()
  const { uploadFile } = useFileUpload()
  const { pushToast } = useToast()
  const fileInput = useRef<HTMLInputElement | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [documentType, setDocumentType] = useState("contract")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    setTitle("")
    setDocumentType("contract")
    setEffectiveDate("")
    setExpiryDate("")
    setError(null)
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)
    if (!employeeId) return setError("No employee is selected.")
    if (!file) return setError("Choose a file to upload.")
    if (!title.trim()) return setError("Give the document a title.")

    setSaving(true)
    try {
      const uploaded = await uploadFile(file, "hr-documents")
      await uploadDocument({
        employeeId,
        documentType,
        title: title.trim(),
        fileUrl: uploaded.url,
        fileSize: uploaded.size,
        mimeType: uploaded.mimeType,
        effectiveDate: effectiveDate || undefined,
        expiryDate: expiryDate || undefined,
      })
      pushToast("Document uploaded", "success")
      reset()
      onUploaded?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload this document.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} className="max-w-lg">
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
          onClick={handleClose}
          className="rounded-md p-1 text-[#9CA3AF] hover:bg-[#F1F5F9] hover:text-[#4B5563]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-4 overflow-y-auto px-6 py-5">
        <div>
          <SectionLabel>Document File</SectionLabel>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-2 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-8 text-center hover:border-[#3B5BDB]"
          >
            {file ? (
              <>
                <FileText className="h-8 w-8 text-[#3B5BDB]" />
                <span className="mt-2 text-[13px] font-semibold text-[#111827]">{file.name}</span>
                <span className="text-[12px] text-[#6B7280]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB — click to replace
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-[#9CA3AF]" />
                <span className="mt-2 text-[13px] font-semibold text-[#111827]">
                  Choose a file
                </span>
                <span className="text-[12px] text-[#6B7280]">PDF, PNG or JPG</span>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            aria-label="Document file"
            onChange={(event) => {
              const picked = event.target.files?.[0] ?? null
              setFile(picked)
              if (picked && !title) setTitle(picked.name.replace(/\.[^.]+$/, ""))
            }}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="document-title">
            Document Title
          </label>
          <input
            id="document-title"
            className={inputCls}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Employment Contract 2026"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="document-type">
            Document Type
          </label>
          <select
            id="document-type"
            className={inputCls}
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="document-effective">
              Effective Date
            </label>
            <input
              id="document-effective"
              type="date"
              className={inputCls}
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="document-expiry">
              Expiry Date
            </label>
            <input
              id="document-expiry"
              type="date"
              className={inputCls}
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#EEF1F6] px-6 py-4">
        <button className={btnOutline} onClick={handleClose} disabled={saving}>
          Cancel
        </button>
        <button className={btnDark} onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Uploading…" : "Upload Document"}
        </button>
      </div>
    </ModalShell>
  )
}
